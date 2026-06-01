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

import { GET } from "@/app/api/dashboard/metrics/route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetSession = getServerSession as jest.Mock;
const mockFindMany = prisma.application.findMany as jest.Mock;

function makeRequest(url = "http://localhost/api/dashboard/metrics") {
  return new Request(url) as unknown as import("next/server").NextRequest;
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/dashboard/metrics", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 0% rates when no applications", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
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
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
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
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
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
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindMany.mockResolvedValue([
      { stage: "APPLIED" },
      { stage: "SCREENING" },
    ]);
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.conversionRates.interviewToOffer).toBe(0);
  });
});
