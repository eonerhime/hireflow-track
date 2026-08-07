/**
 * @jest-environment node
 */

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/auth-options", () => ({ authOptions: {} }));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
  },
}));

import { PATCH } from "@/app/api/settings/password/route";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const mockGetSession = getServerSession as jest.Mock;
const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockUpdate = prisma.user.update as jest.Mock;

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/settings/password", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

beforeEach(() => jest.clearAllMocks());

describe("PATCH /api/settings/password", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await PATCH(
      makeRequest({ currentPassword: "old", newPassword: "newpassword1" }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when either field is missing", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    const res = await PATCH(makeRequest({ currentPassword: "old" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when the new password is shorter than 10 characters", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    const res = await PATCH(
      makeRequest({ currentPassword: "old", newPassword: "short" }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for an OAuth-only account (no password set)", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({ password: "" });

    const res = await PATCH(
      makeRequest({ currentPassword: "old", newPassword: "newpassword1" }),
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/oauth/i);
  });

  it("returns 400 when the current password is incorrect", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({
      password: await bcrypt.hash("correct-password", 12),
    });

    const res = await PATCH(
      makeRequest({ currentPassword: "wrong", newPassword: "newpassword1" }),
    );

    expect(res.status).toBe(400);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("updates the password on a correct current password", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({
      password: await bcrypt.hash("correct-password", 12),
    });
    mockUpdate.mockResolvedValue({});

    const res = await PATCH(
      makeRequest({
        currentPassword: "correct-password",
        newPassword: "newpassword1",
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toBe("Password updated");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { password: expect.any(String) },
    });
  });
});
