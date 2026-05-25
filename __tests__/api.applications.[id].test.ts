/**
 * @jest-environment node
 */
import { PATCH } from "@/app/api/applications/[id]/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  getUserFromRequest: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindFirst = prisma.application.findFirst as jest.Mock;
const mockUpdate = prisma.application.update as jest.Mock;

const makeRequest = (body: object) =>
  new NextRequest("http://localhost/api/applications/app-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const params = Promise.resolve({ id: "app-1" });

const existingApp = {
  id: "app-1",
  userId: "user-1",
  company: "Acme",
  role: "Engineer",
  location: null,
  salary: null,
  jobUrl: null,
  stage: "APPLIED",
  appliedAt: new Date(),
  followUpAt: null,
  notes: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => jest.clearAllMocks());

describe("PATCH /api/applications/[id]", () => {
  it("returns 401 when no session", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ company: "New" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when application not found or belongs to another user", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1", email: "a@b.com" });
    mockFindFirst.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ company: "New" }), { params });
    expect(res.status).toBe(404);
  });

  it("returns 200 with updated application on valid full update", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1", email: "a@b.com" });
    mockFindFirst.mockResolvedValue(existingApp);
    const updated = { ...existingApp, company: "NewCo", role: "Designer" };
    mockUpdate.mockResolvedValue(updated);

    const res = await PATCH(
      makeRequest({ company: "NewCo", role: "Designer" }),
      { params },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.company).toBe("NewCo");
  });

  it("returns 200 on stage-only update using updateStageSchema", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1", email: "a@b.com" });
    mockFindFirst.mockResolvedValue(existingApp);
    const updated = { ...existingApp, stage: "SCREENING" };
    mockUpdate.mockResolvedValue(updated);

    const res = await PATCH(makeRequest({ stage: "SCREENING" }), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.stage).toBe("SCREENING");
  });
});
