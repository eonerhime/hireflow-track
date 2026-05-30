/**
 * @jest-environment node
 */
// __tests__/api.notes.test.ts

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn(),
}));

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: { findFirst: jest.fn() },
    interviewNote: { create: jest.fn() },
  },
}));

import { POST } from "@/app/api/applications/[id]/notes/route";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetSession = getServerSession as jest.Mock;
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
    mockGetSession.mockResolvedValue(null);
    const res = await POST(makeRequest({ stage: "SCREENING", content: "x" }), {
      params: validParams,
    });
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is invalid", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makeRequest({ stage: "SCREENING", content: "" }), {
      params: validParams,
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 when application not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValue(null);
    const res = await POST(
      makeRequest({ stage: "SCREENING", content: "Good call" }),
      { params: validParams },
    );
    expect(res.status).toBe(404);
  });

  it("returns 201 and creates the note", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
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
