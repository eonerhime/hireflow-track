/**
 * @jest-environment node
 */
import { POST, DELETE } from "@/app/api/settings/api-key/route";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

jest.mock("next-auth/next");
jest.mock("@/lib/prisma", () => ({
  prisma: {
    apiKey: {
      updateMany: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockSession = { user: { id: "user-1", email: "test@example.com" } };

describe("POST /api/settings/api-key", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("generates and returns a plaintext key when authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.apiKey.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.apiKey.create as jest.Mock).mockResolvedValue({ id: "key-1" });

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.apiKey).toMatch(/^htk_/);
  });
});

describe("DELETE /api/settings/api-key", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await DELETE();
    expect(res.status).toBe(401);
  });

  it("revokes the active key when authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.apiKey.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const res = await DELETE();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.revoked).toBe(true);
  });
});
