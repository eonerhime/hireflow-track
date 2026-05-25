/**
 * @jest-environment node
 */
// __tests__/api.notes.[id].test.ts
import { PATCH, DELETE } from "@/app/api/notes/[id]/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    interviewNote: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({ getUserFromRequest: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindFirst = prisma.interviewNote.findFirst as jest.Mock;
const mockUpdate = prisma.interviewNote.update as jest.Mock;
const mockDelete = prisma.interviewNote.delete as jest.Mock;

const existingNote = {
  id: "note-1",
  applicationId: "app-1",
  stage: "SCREENING",
  content: "Old content",
  application: { userId: "user-1", deletedAt: null },
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeRequest(method: string, body?: unknown) {
  return new NextRequest("http://localhost/api/notes/note-1", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

const validParams = Promise.resolve({ id: "note-1" });

beforeEach(() => jest.clearAllMocks());

describe("PATCH /api/notes/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await PATCH(makeRequest("PATCH", { content: "Updated" }), {
      params: validParams,
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when note not found or not owned", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue(null);
    const res = await PATCH(makeRequest("PATCH", { content: "Updated" }), {
      params: validParams,
    });
    expect(res.status).toBe(404);
  });

  it("returns 200 and updates the note", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue(existingNote);
    mockUpdate.mockResolvedValue({ ...existingNote, content: "Updated" });
    const res = await PATCH(makeRequest("PATCH", { content: "Updated" }), {
      params: validParams,
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content).toBe("Updated");
  });
});

describe("DELETE /api/notes/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE"), { params: validParams });
    expect(res.status).toBe(401);
  });

  it("returns 404 when note not found or not owned", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE"), { params: validParams });
    expect(res.status).toBe(404);
  });

  it("returns 200 and deletes the note", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue(existingNote);
    mockDelete.mockResolvedValue(existingNote);
    const res = await DELETE(makeRequest("DELETE"), { params: validParams });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Note deleted");
  });
});
