import { describe, it, expect, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import { createMockTerminalSink } from "@/lib/test-utils";
import type { TerminalSink } from "@/lib/types/nodes";

const mockFindAll = jest.fn<() => Promise<TerminalSink[]>>();
const mockCreate = jest.fn<() => Promise<TerminalSink>>();

jest.mock("@/lib/neo4j/driver", () => ({
  getDriver: jest.fn(() => ({})),
}));

jest.mock("@/lib/neo4j/repositories/terminal-sink.repository", () => ({
  TerminalSinkRepository: jest.fn(() => ({
    findAll: mockFindAll,
    create: mockCreate,
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET, POST } = require("./route");

describe("TerminalSink API — GET /api/v1/terminals", () => {
  it("returns 200 with list of terminals", async () => {
    const mockData = [createMockTerminalSink({ id: "ts-1" })];
    mockFindAll.mockResolvedValue(mockData);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockData);
  });

  it("returns 200 with empty list", async () => {
    mockFindAll.mockResolvedValue([]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });
});

describe("TerminalSink API — POST /api/v1/terminals", () => {
  it("returns 201 with created terminal", async () => {
    const input = { sink_type: "SUBMISSION_SUCCESS" };
    const expected = createMockTerminalSink({ id: "new-ts" });
    mockCreate.mockResolvedValue(expected);

    const request = new NextRequest("http://localhost:3000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(expected);
  });
});
