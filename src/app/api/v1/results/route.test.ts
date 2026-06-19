import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createMockResultsIn } from "@/lib/test-utils";
import type { ResultsIn } from "@/lib/types/edges";
import type { GameContext } from "@/lib/types/nodes";

const mockFindAll = jest.fn<() => Promise<ResultsIn[]>>();
const mockCreate = jest.fn<() => Promise<ResultsIn>>();
const mockTaFindById = jest.fn<() => Promise<{ id: string } | null>>();
const mockGcFindById = jest.fn<() => Promise<{ id: string } | null>>();
const mockTsFindById = jest.fn<() => Promise<{ id: string } | null>>();
const mockFindBySourceAndTarget = jest.fn<() => Promise<ResultsIn | null>>();

jest.mock("@/lib/neo4j/driver", () => ({
  getDriver: jest.fn(() => ({})),
}));

jest.mock("@/lib/neo4j/repositories/results-in.repository", () => ({
  ResultsInRepository: jest.fn(() => ({
    findAll: mockFindAll,
    create: mockCreate,
    findBySourceAndTarget: mockFindBySourceAndTarget,
  })),
}));

jest.mock("@/lib/neo4j/repositories/technique-action.repository", () => ({
  TechniqueActionRepository: jest.fn(() => ({
    findById: mockTaFindById,
  })),
}));

jest.mock("@/lib/neo4j/repositories/game-context.repository", () => ({
  GameContextRepository: jest.fn(() => ({
    findById: mockGcFindById,
  })),
}));

jest.mock("@/lib/neo4j/repositories/terminal-sink.repository", () => ({
  TerminalSinkRepository: jest.fn(() => ({
    findById: mockTsFindById,
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET, POST } = require("./route");

describe("ResultsIn API — GET /api/v1/results", () => {
  it("returns 200 with list of results", async () => {
    const mockData = [createMockResultsIn({ id: "ri-1" })];
    mockFindAll.mockResolvedValue(mockData);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockData);
  });

  it("returns 200 with empty list when none exist", async () => {
    mockFindAll.mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns 500 when repository throws", async () => {
    mockFindAll.mockRejectedValue(new Error("DB error"));

    const response = await GET();

    expect(response.status).toBe(500);
  });
});

describe("ResultsIn API — POST /api/v1/results", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTaFindById.mockResolvedValue({ id: "ta-1" });
    mockGcFindById.mockResolvedValue({
      id: "gc-1",
      relative_role: "NEUTRAL",
    } as GameContext);
    mockTsFindById.mockResolvedValue(null);
    mockFindBySourceAndTarget.mockResolvedValue(null);
  });

  it("returns 201 with created result edge", async () => {
    const input = {
      technique_id: "ta-1",
      target_id: "gc-1",
    };
    const expected = createMockResultsIn({
      id: "new-ri",
      source_id: "ta-1",
      target_id: "gc-1",
    });
    mockCreate.mockResolvedValue(expected);

    const request = new Request("http://localhost:3000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(expected);
  });

  it("returns 404 when source TechniqueAction not found", async () => {
    mockTaFindById.mockResolvedValue(null);

    const request = new Request("http://localhost:3000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ technique_id: "ta-1", target_id: "gc-1" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(404);
  });

  it("returns 404 when target not found", async () => {
    mockGcFindById.mockResolvedValue(null);
    mockTsFindById.mockResolvedValue(null);

    const request = new Request("http://localhost:3000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ technique_id: "ta-1", target_id: "gc-1" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(404);
  });

  it("returns 409 when duplicate edge exists", async () => {
    mockFindBySourceAndTarget.mockResolvedValue(
      createMockResultsIn({ id: "existing-ri" }),
    );

    const request = new Request("http://localhost:3000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ technique_id: "ta-1", target_id: "gc-1" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(409);
  });

  it("returns 500 on repository error", async () => {
    mockCreate.mockRejectedValue(new Error("Create failed"));

    const request = new Request("http://localhost:3000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ technique_id: "ta-1", target_id: "gc-1" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(500);
  });
});
