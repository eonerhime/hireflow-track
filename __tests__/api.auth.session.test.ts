/**
 * @jest-environment node
 */

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
  })),
  getServerSession: jest.fn().mockResolvedValue(null),
}));

import { GET } from "@/app/api/applications/route";

describe("Applications route — session guard", () => {
  it("returns 401 when no session exists", async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
