/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: { findMany: jest.fn() },
  },
}));
jest.mock("@/lib/auth", () => ({ getUserFromRequest: jest.fn() }));

import { GET } from "@/app/api/reminders/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindMany = prisma.application.findMany as jest.Mock;

function makeRequest() {
  return new NextRequest("http://localhost/api/reminders", { method: "GET" });
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/reminders", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns sorted reminders for authenticated user", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindMany.mockResolvedValue([
      {
        id: "app-1",
        company: "Acme",
        role: "Engineer",
        stage: "SCREENING",
        followUpAt: new Date(Date.now() + 86400000),
      },
    ]);
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].company).toBe("Acme");
  });
});