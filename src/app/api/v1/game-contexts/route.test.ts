import { describe, it, expect, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import { createMockGameContext } from "@/lib/test-utils";
import type { GameContext } from "@/lib/types/nodes";

const mockFindAll = jest.fn<() => Promise<GameContext[]>>();
const mockCreate = jest.fn<() => Promise<GameContext>>();

jest.mock("@/lib/neo4j/driver", () => ({
  getDriver: jest.fn(() => ({})),
}));

jest.mock("@/lib/neo4j/repositories/game-context.repository", () => ({
  GameContextRepository: jest.fn(() => ({
    findAll: mockFindAll,
    create: mockCreate,
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET, POST } = require("./route");

describe("GameContext API — GET /api/v1/game-contexts", () => {
  it("returns 200 with list of game contexts", async () => {
    const mockData = [createMockGameContext({ id: "gc-1" })];
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

describe("GameContext API — POST /api/v1/game-contexts", () => {
  it("returns 201 with created game context", async () => {
    const input = {
      position_name: "Closed Guard",
      relative_role: "DEFENSIVE",
      sidedness: "AMBIDEXTROUS",
      danger_level: 5,
      points_value: 0,
    };
    const expected = createMockGameContext({
      id: "new-gc",
      position_name: "Closed Guard",
    });
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

  it("returns 500 on repository error", async () => {
    mockCreate.mockRejectedValue(new Error("Create failed"));

    const request = new NextRequest("http://localhost:3000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const response = await POST(request);

    expect(response.status).toBe(500);
  });
});
