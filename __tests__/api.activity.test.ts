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
    activityLog: { findMany: jest.fn() },
  },
}));

import { GET } from "@/app/api/activity/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const mockGetSession = getServerSession as jest.Mock;
const mockFindMany = prisma.activityLog.findMany as jest.Mock;

function makeRequest(url = "http://localhost/api/activity") {
  return new Request(url) as unknown as import("next/server").NextRequest;
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/activity", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns array of activity events for authenticated user", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindMany.mockResolvedValue([
      {
        id: "log-1",
        action: "APPLICATION_CREATED",
        applicationId: "app-1",
        metadata: { company: "Acme", role: "Engineer", stage: "APPLIED" },
        createdAt: new Date(),
      },
    ]);
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].action).toBe("APPLICATION_CREATED");
  });
});
