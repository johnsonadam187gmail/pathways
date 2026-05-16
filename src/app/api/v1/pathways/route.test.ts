import { describe, it, expect, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import {
  createMockTacticalPathway,
  createMockGameContext,
  createMockTechniqueAction,
} from "@/lib/test-utils";
import type { TacticalPathway } from "@/lib/types/edges";
import type { GameContext, TechniqueAction } from "@/lib/types/nodes";

const mockFindAll = jest.fn<() => Promise<TacticalPathway[]>>();
const mockCreate = jest.fn<() => Promise<TacticalPathway>>();
const mockGcFindById = jest.fn<() => Promise<GameContext | null>>();
const mockTaFindById = jest.fn<() => Promise<TechniqueAction | null>>();

jest.mock("@/lib/neo4j/driver", () => ({
  getDriver: jest.fn(() => ({})),
}));

jest.mock("@/lib/neo4j/repositories/tactical-pathway.repository", () => ({
  TacticalPathwayRepository: jest.fn(() => ({
    findAll: mockFindAll,
    create: mockCreate,
  })),
}));

jest.mock("@/lib/neo4j/repositories/game-context.repository", () => ({
  GameContextRepository: jest.fn(() => ({
    findById: mockGcFindById,
  })),
}));

jest.mock("@/lib/neo4j/repositories/technique-action.repository", () => ({
  TechniqueActionRepository: jest.fn(() => ({
    findById: mockTaFindById,
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET, POST } = require("./route");

describe("TacticalPathway API — GET /api/v1/pathways", () => {
  it("returns 200 with list of pathways", async () => {
    const mockData = [createMockTacticalPathway({ id: "tp-1" })];
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
    const body = await response.json();
    expect(body).toEqual([]);
  });
});

describe("TacticalPathway API — POST /api/v1/pathways", () => {
  const validInput = {
    source_game_context_id: "gc-1",
    target_technique_action_id: "ta-1",
    gateway_type: "INTENT_DRIVEN",
    trigger_condition: "opponent exposes neck",
    transition_probability: 0.0,
    execution_counter: 0,
  };

  it("returns 201 when source and target exist", async () => {
    mockGcFindById.mockResolvedValue(createMockGameContext({ id: "gc-1" }));
    mockTaFindById.mockResolvedValue(createMockTechniqueAction({ id: "ta-1" }));
    const expected = createMockTacticalPathway({ id: "new-tp" });
    mockCreate.mockResolvedValue(expected);

    const request = new NextRequest("http://localhost:3000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validInput),
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(expected);
  });

  it("returns 404 when source GameContext not found", async () => {
    mockGcFindById.mockResolvedValue(null);
    mockTaFindById.mockResolvedValue(createMockTechniqueAction({ id: "ta-1" }));

    const request = new NextRequest("http://localhost:3000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validInput),
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toMatchObject({ code: "NOT_FOUND" });
  });

  it("returns 404 when target TechniqueAction not found", async () => {
    mockGcFindById.mockResolvedValue(createMockGameContext({ id: "gc-1" }));
    mockTaFindById.mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validInput),
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toMatchObject({ code: "NOT_FOUND" });
  });
});
