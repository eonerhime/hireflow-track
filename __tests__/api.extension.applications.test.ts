/**
 * @jest-environment node
 */
import { POST } from "@/app/api/extension/applications/route";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth-helpers");
jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));
jest.mock("@/lib/activity", () => ({ logActivity: jest.fn() }));

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/extension/applications", {
    method: "POST",
    body: JSON.stringify(body),
  }) as NextRequest;
}

describe("POST /api/extension/applications", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 with no auth", async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(401);
  });

  it("returns 400 on invalid payload", async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      userId: "u1",
      via: "apiKey",
    });
    const res = await POST(makeRequest({ company: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when jobUrl already tracked", async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      userId: "u1",
      via: "apiKey",
    });
    (prisma.application.findFirst as jest.Mock).mockResolvedValue({
      id: "existing-1",
    });

    const res = await POST(
      makeRequest({
        company: "Acme",
        role: "Engineer",
        jobUrl: "https://linkedin.com/jobs/123",
        source: "linkedin",
      }),
    );

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.applicationId).toBe("existing-1");
  });

  it("creates application on valid payload", async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      userId: "u1",
      via: "apiKey",
    });
    (prisma.application.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.application.create as jest.Mock).mockResolvedValue({
      id: "new-1",
      company: "Acme",
      role: "Engineer",
      createdAt: new Date("2026-06-18T00:00:00.000Z"),
    });

    const res = await POST(
      makeRequest({
        company: "Acme",
        role: "Engineer",
        jobUrl: "https://linkedin.com/jobs/123",
        source: "linkedin",
      }),
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe("new-1");
  });
});
