/**
 * @jest-environment node
 */
// __tests__/api.contacts.test.ts

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn(),
}));

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: { findFirst: jest.fn() },
    contact: { create: jest.fn() },
  },
}));

import { POST } from "@/app/api/contacts/route";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetSession = getServerSession as jest.Mock;
const mockFindFirst = prisma.application.findFirst as jest.Mock;
const mockCreate = prisma.contact.create as jest.Mock;

const makeRequest = (body: object) =>
  new NextRequest("http://localhost/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = { name: "Jane Smith", applicationId: "app-1" };

beforeEach(() => jest.clearAllMocks());

describe("POST /api/contacts", () => {
  it("returns 401 when no session", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 400 on validation failure", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makeRequest({ applicationId: "app-1" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when application not found or belongs to another user", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValue(null);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(404);
  });

  it("returns 201 with created contact on valid request", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValue({ id: "app-1", userId: "user-1" });
    mockCreate.mockResolvedValue({ id: "contact-1", ...validBody });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Jane Smith");
  });
});
