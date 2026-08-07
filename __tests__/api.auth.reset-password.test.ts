/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    passwordResetToken: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: { update: jest.fn() },
  },
}));

import { POST } from "@/app/api/auth/reset-password/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashResetToken } from "@/lib/password-reset";

const mockTokenFindUnique = prisma.passwordResetToken.findUnique as jest.Mock;
const mockTokenDelete = prisma.passwordResetToken.delete as jest.Mock;
const mockTokenDeleteMany = prisma.passwordResetToken.deleteMany as jest.Mock;
const mockUserUpdate = prisma.user.update as jest.Mock;

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const validBody = {
  token: "a-valid-looking-raw-token",
  newPassword: "newpassword123",
  confirmPassword: "newpassword123",
};

beforeEach(() => jest.clearAllMocks());

describe("POST /api/auth/reset-password", () => {
  it("returns 400 on invalid payload (mismatched passwords)", async () => {
    const res = await POST(
      makeRequest({ ...validBody, confirmPassword: "different" }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when no token record matches", async () => {
    mockTokenFindUnique.mockResolvedValue(null);

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(400);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 and deletes the record when the token has expired", async () => {
    mockTokenFindUnique.mockResolvedValue({
      id: "token-1",
      userId: "user-1",
      tokenHash: hashResetToken(validBody.token),
      expiresAt: new Date(Date.now() - 1000),
    });

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(400);
    expect(mockTokenDelete).toHaveBeenCalledWith({ where: { id: "token-1" } });
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("updates the password and deletes all tokens for the user on success", async () => {
    mockTokenFindUnique.mockResolvedValue({
      id: "token-1",
      userId: "user-1",
      tokenHash: hashResetToken(validBody.token),
      expiresAt: new Date(Date.now() + 60_000),
    });

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toBe("Password updated successfully");
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { password: expect.any(String) },
    });
    expect(mockTokenDeleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });
});
