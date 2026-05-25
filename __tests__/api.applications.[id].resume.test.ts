/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: { findFirst: jest.fn(), update: jest.fn() },
    resume: { findFirst: jest.fn() },
  },
}));
jest.mock("@/lib/auth", () => ({ getUserFromRequest: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { PATCH } from "@/app/api/applications/[id]/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindApp = prisma.application.findFirst as jest.Mock;
const mockFindResume = prisma.resume.findFirst as jest.Mock;
const mockUpdate = prisma.application.update as jest.Mock;

const existingApp = {
  id: "app-1",
  userId: "user-1",
  company: "Acme",
  role: "Engineer",
  stage: "APPLIED",
  deletedAt: null,
};

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/applications/app-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validParams = Promise.resolve({ id: "app-1" });

beforeEach(() => jest.clearAllMocks());

describe("PATCH /api/applications/[id] — resumeId linking", () => {
  it("returns 403 when resumeId belongs to another user", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindApp.mockResolvedValue(existingApp);
    mockFindResume.mockResolvedValue(null); // resume not owned by user-1
    const res = await PATCH(makeRequest({ resumeId: "r-other" }), {
      params: validParams,
    });
    expect(res.status).toBe(403);
  });

  it("returns 200 when valid resumeId is linked", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindApp.mockResolvedValue(existingApp);
    mockFindResume.mockResolvedValue({ id: "r-1", userId: "user-1" });
    mockUpdate.mockResolvedValue({ ...existingApp, resumeId: "r-1" });
    const res = await PATCH(makeRequest({ resumeId: "r-1" }), {
      params: validParams,
    });
    expect(res.status).toBe(200);
  });
});
