/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    resume: { findFirst: jest.fn(), delete: jest.fn() },
    application: { updateMany: jest.fn() },
  },
}));
jest.mock("@/lib/auth", () => ({ getUserFromRequest: jest.fn() }));
jest.mock("@/lib/cloudinary", () => ({
  cloudinary: {
    uploader: {
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { DELETE } from "@/app/api/resumes/[id]/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindFirst = prisma.resume.findFirst as jest.Mock;
const mockDelete = prisma.resume.delete as jest.Mock;
const mockUpdateMany = prisma.application.updateMany as jest.Mock;

const existingResume = {
  id: "r-1",
  userId: "user-1",
  label: "CV v1",
  fileUrl: "https://cdn.example.com/cv.pdf",
  fileKey: "resumes/test",
  uploadedAt: new Date(),
};

function makeRequest() {
  return new NextRequest("http://localhost/api/resumes/r-1", {
    method: "DELETE",
  });
}

const validParams = Promise.resolve({ id: "r-1" });

beforeEach(() => jest.clearAllMocks());

describe("DELETE /api/resumes/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await DELETE(makeRequest(), { params: validParams });
    expect(res.status).toBe(401);
  });

  it("returns 404 when resume not found", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue(null);
    const res = await DELETE(makeRequest(), { params: validParams });
    expect(res.status).toBe(404);
  });

  it("returns 200 and deletes the resume", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue(existingResume);
    mockUpdateMany.mockResolvedValue({ count: 0 });
    mockDelete.mockResolvedValue(existingResume);
    const res = await DELETE(makeRequest(), { params: validParams });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Resume deleted");
  });
});
