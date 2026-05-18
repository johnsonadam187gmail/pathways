import { describe, it, expect, jest, beforeEach } from "@jest/globals";

const mockRun = jest.fn<() => Promise<{ records: { get: () => unknown }[] }>>();
const mockSession = {
  run: mockRun,
  close: jest.fn<() => Promise<void>>(),
};

jest.mock("@/lib/neo4j/driver", () => ({
  getDriver: jest.fn(() => ({
    session: jest.fn(() => mockSession),
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { POST } = require("./route");

describe("Seed API — POST /api/v1/seed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and creates seed data without reset", async () => {
    mockRun.mockResolvedValue({ records: [{ get: () => null }] });

    const request = new Request("http://localhost:3000/api/v1/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.created.nodes).toBeGreaterThan(0);
    expect(body.created.edges).toBeGreaterThan(0);
    expect(mockRun).not.toHaveBeenCalledWith("MATCH (n) DETACH DELETE n");
  });

  it("returns 200 and resets database when reset: true", async () => {
    mockRun.mockResolvedValue({ records: [{ get: () => null }] });

    const request = new Request("http://localhost:3000/api/v1/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset: true }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.message).toContain("reset");
  });

  it("returns 500 when database operation fails", async () => {
    mockRun.mockRejectedValue(new Error("DB connection failed"));

    const request = new Request("http://localhost:3000/api/v1/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
  });
});
