/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    resume: { findMany: jest.fn(), create: jest.fn() },
  },
}));
jest.mock("@/lib/auth", () => ({ getUserFromRequest: jest.fn() }));
jest.mock("@/lib/cloudinary", () => ({
  cloudinary: {
    uploader: {
      upload_stream: jest.fn(
        (_opts: unknown, cb: (err: null, result: object) => void) => ({
          end: () =>
            cb(null, {
              secure_url:
                "https://res.cloudinary.com/test/raw/upload/resumes/test.pdf",
              public_id: "resumes/test",
            }),
        }),
      ),
    },
  },
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { GET, POST } from "@/app/api/resumes/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindMany = prisma.resume.findMany as jest.Mock;
const mockCreate = prisma.resume.create as jest.Mock;

function makeGetRequest() {
  return new NextRequest("http://localhost/api/resumes", { method: "GET" });
}

function makePostRequest(
  label = "CV v1",
  fileType = "application/pdf",
  fileSize = 1024,
) {
  const formData = new FormData();
  const file = new File(["x".repeat(fileSize)], "cv.pdf", { type: fileType });
  formData.append("file", file);
  formData.append("label", label);
  return new NextRequest("http://localhost/api/resumes", {
    method: "POST",
    body: formData,
  });
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/resumes", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(401);
  });

  it("returns list of resumes for authenticated user", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindMany.mockResolvedValue([
      {
        id: "r-1",
        label: "CV v1",
        fileUrl: "https://cdn.example.com/cv.pdf",
        uploadedAt: new Date(),
      },
    ]);
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
  });
});

describe("POST /api/resumes", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await POST(makePostRequest());
    expect(res.status).toBe(401);
  });

  it("returns 400 for non-PDF file type", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    const res = await POST(makePostRequest("CV v1", "image/png"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/pdf/i);
  });

  it("returns 201 on successful upload", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockCreate.mockResolvedValue({
      id: "r-1",
      label: "CV v1",
      fileUrl: "https://res.cloudinary.com/test/raw/upload/resumes/test.pdf",
      fileKey: "resumes/test",
      uploadedAt: new Date(),
    });
    const res = await POST(makePostRequest("CV v1"));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe("r-1");
  });
});
