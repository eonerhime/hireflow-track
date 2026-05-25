/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: { findMany: jest.fn() },
  },
}));
jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: "email-1" }),
    },
  })),
}));

import { POST } from "@/app/api/reminders/send/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const mockFindMany = prisma.application.findMany as jest.Mock;
const CRON_SECRET = "test-cron-secret";

function makeRequest(withSecret = true) {
  return new NextRequest("http://localhost/api/reminders/send", {
    method: "POST",
    headers: withSecret ? { Authorization: `Bearer ${CRON_SECRET}` } : {},
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.CRON_SECRET = CRON_SECRET;
});

describe("POST /api/reminders/send", () => {
  it("returns 401 without cron secret", async () => {
    const res = await POST(makeRequest(false));
    expect(res.status).toBe(401);
  });

  it("returns 200 with sent count when reminders exist", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "app-1",
        company: "Acme",
        role: "Engineer",
        stage: "SCREENING",
        followUpAt: new Date(),
        user: { email: "test@example.com" },
      },
    ]);
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sent).toBe(1);
  });
});
