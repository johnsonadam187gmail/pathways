import { describe, it, expect, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import { createMockTerminalSink } from "@/lib/test-utils";
import { SinkType } from "@/lib/types/enums";
import type { TerminalSink } from "@/lib/types/nodes";

const mockFindById = jest.fn<() => Promise<TerminalSink | null>>();
const mockUpdate = jest.fn<() => Promise<TerminalSink>>();
const mockDelete = jest.fn<() => Promise<boolean>>();

jest.mock("@/lib/neo4j/driver", () => ({
  getDriver: jest.fn(() => ({})),
}));

jest.mock("@/lib/neo4j/repositories/terminal-sink.repository", () => ({
  TerminalSinkRepository: jest.fn(() => ({
    findById: mockFindById,
    update: mockUpdate,
    delete: mockDelete,
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET, PATCH, DELETE } = require("./route");

const params = Promise.resolve({ id: "ts-1" });

describe("TerminalSink API — GET /api/v1/terminals/[id]", () => {
  it("returns 200 when found", async () => {
    mockFindById.mockResolvedValue(createMockTerminalSink({ id: "ts-1" }));
    const response = await GET(new NextRequest("http://localhost:3000"), {
      params,
    });
    expect(response.status).toBe(200);
  });

  it("returns 404 when not found", async () => {
    mockFindById.mockResolvedValue(null);
    const response = await GET(new NextRequest("http://localhost:3000"), {
      params,
    });
    expect(response.status).toBe(404);
  });
});

describe("TerminalSink API — PATCH /api/v1/terminals/[id]", () => {
  it("returns 200 on update", async () => {
    mockUpdate.mockResolvedValue(
      createMockTerminalSink({
        id: "ts-1",
        sink_type: SinkType.SUBMISSION_CONCEDED,
      }),
    );
    const request = new NextRequest("http://localhost:3000", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sink_type: "SUBMISSION_CONCEDED" }),
    });
    const response = await PATCH(request, { params });
    expect(response.status).toBe(200);
  });
});

describe("TerminalSink API — DELETE /api/v1/terminals/[id]", () => {
  it("returns 200 with deleted:true", async () => {
    mockDelete.mockResolvedValue(true);
    const response = await DELETE(new NextRequest("http://localhost:3000"), {
      params,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ deleted: true });
  });

  it("returns 404 when not found", async () => {
    mockDelete.mockResolvedValue(false);
    const response = await DELETE(new NextRequest("http://localhost:3000"), {
      params,
    });
    expect(response.status).toBe(404);
  });
});
