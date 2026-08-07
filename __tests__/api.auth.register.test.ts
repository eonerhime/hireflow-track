/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    pendingRegistration: { upsert: jest.fn(), delete: jest.fn() },
  },
}));

const mockSend = jest.fn();
jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args: unknown[]) => mockSend(...args) },
  })),
}));

import { POST } from "@/app/api/auth/register/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockUpsert = prisma.pendingRegistration.upsert as jest.Mock;
const mockPendingDelete = prisma.pendingRegistration.delete as jest.Mock;

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const validBody = {
  email: "new@example.com",
  password: "password123",
  confirmPassword: "password123",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
});

describe("POST /api/auth/register", () => {
  it("returns 400 on invalid payload", async () => {
    const res = await POST(makeRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
  });

  it("returns the same success response for an already-registered email, without sending anything (no enumeration)", async () => {
    mockFindUnique.mockResolvedValue({ id: "user-1" });

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toBe("Verification code sent");
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("stores a pending registration and sends an OTP instead of creating a User", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockUpsert.mockResolvedValue({ id: "pending-1" });

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toBe("Verification code sent");
    expect(mockUpsert).toHaveBeenCalledTimes(1);

    const call = mockUpsert.mock.calls[0][0];
    expect(call.where).toEqual({ email: validBody.email });
    expect(call.create.otpHash).toBeDefined();
    expect(call.create.password).not.toBe(validBody.password); // hashed
  });

  it("returns 502 and cleans up the pending record when Resend rejects the send", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockUpsert.mockResolvedValue({ id: "pending-1" });
    mockSend.mockResolvedValue({
      data: null,
      error: { statusCode: 403, name: "validation_error", message: "..." },
    });

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toMatch(/failed to send/i);
    expect(mockPendingDelete).toHaveBeenCalledWith({
      where: { email: validBody.email },
    });
  });
});
