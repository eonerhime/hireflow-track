/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    passwordResetToken: { deleteMany: jest.fn(), create: jest.fn() },
  },
}));

const mockSend = jest.fn();
jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args: unknown[]) => mockSend(...args) },
  })),
}));

import { POST } from "@/app/api/auth/forgot-password/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockDeleteMany = prisma.passwordResetToken.deleteMany as jest.Mock;
const mockCreate = prisma.passwordResetToken.create as jest.Mock;

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
});

describe("POST /api/auth/forgot-password", () => {
  it("returns 400 on invalid payload", async () => {
    const res = await POST(makeRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
  });

  it("returns the generic message without creating a token for a non-existent email", async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await POST(makeRequest({ email: "nobody@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toMatch(/if an account exists/i);
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns the same generic message for an OAuth-only account (no password)", async () => {
    mockFindUnique.mockResolvedValue({ id: "user-1", password: "" });

    const res = await POST(makeRequest({ email: "oauth@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toMatch(/if an account exists/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates a reset token and sends an email for a real credentials account", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      password: "hashed",
      email: "real@example.com",
    });
    mockDeleteMany.mockResolvedValue({ count: 0 });
    mockCreate.mockResolvedValue({ id: "token-1" });

    const res = await POST(makeRequest({ email: "real@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toMatch(/if an account exists/i);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledTimes(1);

    const call = mockCreate.mock.calls[0][0];
    expect(call.data.userId).toBe("user-1");
    expect(call.data.tokenHash).toBeDefined();
  });

  it("still returns the generic message even if the email send fails", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      password: "hashed",
      email: "real@example.com",
    });
    mockDeleteMany.mockResolvedValue({ count: 0 });
    mockCreate.mockResolvedValue({ id: "token-1" });
    mockSend.mockResolvedValue({
      data: null,
      error: { statusCode: 403, message: "..." },
    });

    const res = await POST(makeRequest({ email: "real@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toMatch(/if an account exists/i);
  });
});
