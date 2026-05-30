/**
 * @jest-environment node
 */

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(),
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

import { GET } from "@/app/api/reminders/route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetSession = getServerSession as jest.Mock;
const mockFindMany = prisma.application.findMany as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("GET /api/reminders", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns sorted reminders for authenticated user", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindMany.mockResolvedValue([
      {
        id: "app-1",
        company: "Acme",
        role: "Engineer",
        stage: "SCREENING",
        followUpAt: new Date(Date.now() + 86400000),
      },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].company).toBe("Acme");
  });
});
