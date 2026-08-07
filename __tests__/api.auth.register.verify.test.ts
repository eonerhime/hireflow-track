/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn() },
    pendingRegistration: { findUnique: jest.fn(), delete: jest.fn() },
  },
}));

import { POST } from "@/app/api/auth/register/verify/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const mockPendingFindUnique = prisma.pendingRegistration
  .findUnique as jest.Mock;
const mockPendingDelete = prisma.pendingRegistration.delete as jest.Mock;
const mockUserFindUnique = prisma.user.findUnique as jest.Mock;
const mockUserCreate = prisma.user.create as jest.Mock;

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/register/verify", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const email = "new@example.com";
const otp = "123456";

async function pendingRecord(overrides: Partial<{ otpHash: string; expiresAt: Date }> = {}) {
  return {
    id: "pending-1",
    email,
    password: "hashed-password",
    otpHash: overrides.otpHash ?? (await bcrypt.hash(otp, 10)),
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 10 * 60 * 1000),
    createdAt: new Date(),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/auth/register/verify", () => {
  it("returns 400 on invalid payload", async () => {
    const res = await POST(makeRequest({ email, otp: "abc" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when there is no pending registration for this email", async () => {
    mockPendingFindUnique.mockResolvedValue(null);

    const res = await POST(makeRequest({ email, otp }));
    expect(res.status).toBe(404);
  });

  it("returns 400 and deletes the record when the code has expired", async () => {
    mockPendingFindUnique.mockResolvedValue(
      await pendingRecord({ expiresAt: new Date(Date.now() - 1000) }),
    );

    const res = await POST(makeRequest({ email, otp }));

    expect(res.status).toBe(400);
    expect(mockPendingDelete).toHaveBeenCalledWith({ where: { email } });
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  it("returns 400 on an incorrect code without creating a user", async () => {
    mockPendingFindUnique.mockResolvedValue(await pendingRecord());

    const res = await POST(makeRequest({ email, otp: "999999" }));

    expect(res.status).toBe(400);
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  it("creates the user and deletes the pending record on a correct code", async () => {
    mockPendingFindUnique.mockResolvedValue(await pendingRecord());
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "user-1" });

    const res = await POST(makeRequest({ email, otp }));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.message).toBe("Account created successfully");
    expect(mockUserCreate).toHaveBeenCalledWith({
      data: { email, password: "hashed-password" },
      select: { id: true },
    });
    expect(mockPendingDelete).toHaveBeenCalledWith({ where: { email } });
  });

  it("returns 409 and cleans up if a User already exists for this email", async () => {
    mockPendingFindUnique.mockResolvedValue(await pendingRecord());
    mockUserFindUnique.mockResolvedValue({ id: "existing-user" });

    const res = await POST(makeRequest({ email, otp }));

    expect(res.status).toBe(409);
    expect(mockUserCreate).not.toHaveBeenCalled();
    expect(mockPendingDelete).toHaveBeenCalledWith({ where: { email } });
  });
});
