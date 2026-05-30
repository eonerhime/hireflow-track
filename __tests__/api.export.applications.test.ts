/**
 * @jest-environment node
 */

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: { findMany: jest.fn() },
  },
}));

import { GET } from "@/app/api/export/applications/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const mockGetSession = getServerSession as jest.Mock;
const mockFindMany = prisma.application.findMany as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("GET /api/export/applications", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns CSV content-type for authenticated user", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindMany.mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
  });

  it("includes correct column headers in first CSV row", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindMany.mockResolvedValue([]);
    const res = await GET();
    const text = await res.text();
    const firstRow = text.split("\n")[0];
    expect(firstRow).toContain("Company");
    expect(firstRow).toContain("Role");
    expect(firstRow).toContain("Stage");
  });
});
