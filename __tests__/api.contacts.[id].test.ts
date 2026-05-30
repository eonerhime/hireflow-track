/**
 * @jest-environment node
 */
// __tests__/api.contacts.[id].test.ts

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
    contact: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { PATCH, DELETE } from "@/app/api/contacts/[id]/route";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetSession = getServerSession as jest.Mock;
const mockFindFirst = prisma.contact.findFirst as jest.Mock;
const mockUpdate = prisma.contact.update as jest.Mock;
const mockDelete = prisma.contact.delete as jest.Mock;

const makeRequest = (body: object) =>
  new NextRequest("http://localhost/api/contacts/contact-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const params = Promise.resolve({ id: "contact-1" });

const existingContact = {
  id: "contact-1",
  applicationId: "app-1",
  name: "Jane Smith",
  role: null,
  email: null,
  phone: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => jest.clearAllMocks());

describe("PATCH /api/contacts/[id]", () => {
  it("returns 401 when no session", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ name: "Updated" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when contact not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ name: "Updated" }), { params });
    expect(res.status).toBe(404);
  });

  it("returns 200 with updated contact", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValue(existingContact);
    mockUpdate.mockResolvedValue({ ...existingContact, name: "Updated" });
    const res = await PATCH(makeRequest({ name: "Updated" }), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Updated");
  });
});

describe("DELETE /api/contacts/[id]", () => {
  it("returns 401 when no session", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await DELETE(makeRequest({}), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when contact not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValue(null);
    const res = await DELETE(makeRequest({}), { params });
    expect(res.status).toBe(404);
  });

  it("returns 200 on successful delete", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValue(existingContact);
    mockDelete.mockResolvedValue(existingContact);
    const res = await DELETE(makeRequest({}), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Contact deleted");
  });
});
