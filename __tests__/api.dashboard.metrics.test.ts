/**
 * @jest-environment node
 */
// __tests__/api.dashboard.metrics.test.ts
import { GET } from "@/app/api/dashboard/metrics/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: { findMany: jest.fn() },
  },
}));

jest.mock("@/lib/auth", () => ({ getUserFromRequest: jest.fn() }));

import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindMany = prisma.application.findMany as jest.Mock;

function makeRequest() {
  return new NextRequest("http://localhost/api/dashboard/metrics");
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/dashboard/metrics", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 0% rates when no applications", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindMany.mockResolvedValue([]);
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.conversionRates).toEqual({
      appliedToInterview: 0,
      interviewToOffer: 0,
    });
  });

  it("computes appliedToInterview correctly", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindMany.mockResolvedValue([
      { stage: "APPLIED" },
      { stage: "APPLIED" },
      { stage: "INTERVIEW" },
      { stage: "OFFER" },
    ]);
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.conversionRates.appliedToInterview).toBe(50);
  });

  it("computes interviewToOffer correctly", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindMany.mockResolvedValue([
      { stage: "INTERVIEW" },
      { stage: "INTERVIEW" },
      { stage: "OFFER" },
      { stage: "OFFER" },
    ]);
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.conversionRates.interviewToOffer).toBe(50);
  });

  it("returns 0% interviewToOffer when no applications reached interview", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindMany.mockResolvedValue([
      { stage: "APPLIED" },
      { stage: "SCREENING" },
    ]);
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.conversionRates.interviewToOffer).toBe(0);
  });
});
