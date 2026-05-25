/**
 * @jest-environment node
 */
// __tests__/api.notes.test.ts
import { POST } from "@/app/api/applications/[id]/notes/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: { findFirst: jest.fn() },
    interviewNote: { create: jest.fn() },
  },
}));

jest.mock("@/lib/auth", () => ({ getUserFromRequest: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindFirst = prisma.application.findFirst as jest.Mock;
const mockCreate = prisma.interviewNote.create as jest.Mock;

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/applications/app-1/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validParams = Promise.resolve({ id: "app-1" });

beforeEach(() => jest.clearAllMocks());

describe("POST /api/applications/[id]/notes", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await POST(makeRequest({ stage: "SCREENING", content: "x" }), {
      params: validParams,
    });
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is invalid", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    // No mockFindFirst needed — validation fires before the DB call
    const res = await POST(makeRequest({ stage: "SCREENING", content: "" }), {
      params: validParams,
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 when application not found", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue(null);
    const res = await POST(
      makeRequest({ stage: "SCREENING", content: "Good call" }),
      { params: validParams },
    );
    expect(res.status).toBe(404);
  });

  it("returns 201 and creates the note", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue({ id: "app-1", userId: "user-1" });
    mockCreate.mockResolvedValue({
      id: "note-1",
      applicationId: "app-1",
      stage: "SCREENING",
      content: "Good call",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await POST(
      makeRequest({ stage: "SCREENING", content: "Good call" }),
      { params: validParams },
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe("note-1");
  });
});
