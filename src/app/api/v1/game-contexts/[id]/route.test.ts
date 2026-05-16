import { describe, it, expect, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import { createMockGameContext } from "@/lib/test-utils";
import { NotFoundError } from "@/lib/utils/errors";
import type { GameContext } from "@/lib/types/nodes";

const mockFindById = jest.fn<() => Promise<GameContext | null>>();
const mockUpdate = jest.fn<() => Promise<GameContext>>();
const mockDelete = jest.fn<() => Promise<boolean>>();

jest.mock("@/lib/neo4j/driver", () => ({
  getDriver: jest.fn(() => ({})),
}));

jest.mock("@/lib/neo4j/repositories/game-context.repository", () => ({
  GameContextRepository: jest.fn(() => ({
    findById: mockFindById,
    update: mockUpdate,
    delete: mockDelete,
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET, PATCH, DELETE } = require("./route");

const params = Promise.resolve({ id: "gc-1" });

describe("GameContext API — GET /api/v1/game-contexts/[id]", () => {
  it("returns 200 with game context when found", async () => {
    const mockData = createMockGameContext({ id: "gc-1" });
    mockFindById.mockResolvedValue(mockData);

    const response = await GET(new NextRequest("http://localhost:3000"), {
      params,
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockData);
  });

  it("returns 404 when game context not found", async () => {
    mockFindById.mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost:3000"), {
      params,
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toMatchObject({ code: "NOT_FOUND" });
  });

  it("returns 500 on repository error", async () => {
    mockFindById.mockRejectedValue(new Error("DB error"));

    const response = await GET(new NextRequest("http://localhost:3000"), {
      params,
    });

    expect(response.status).toBe(500);
  });
});

describe("GameContext API — PATCH /api/v1/game-contexts/[id]", () => {
  it("returns 200 with updated game context", async () => {
    const updated = createMockGameContext({
      id: "gc-1",
      position_name: "Updated Position",
    });
    mockUpdate.mockResolvedValue(updated);

    const request = new NextRequest("http://localhost:3000", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ position_name: "Updated Position" }),
    });
    const response = await PATCH(request, { params });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(updated);
  });

  it("returns 404 when updating non-existent game context", async () => {
    mockUpdate.mockRejectedValue(new NotFoundError("GameContext", "gc-1"));

    const request = new NextRequest("http://localhost:3000", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ position_name: "Nope" }),
    });
    const response = await PATCH(request, { params });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("GameContext API — DELETE /api/v1/game-contexts/[id]", () => {
  it("returns 200 with deleted:true when successful", async () => {
    mockDelete.mockResolvedValue(true);

    const response = await DELETE(new NextRequest("http://localhost:3000"), {
      params,
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ deleted: true });
  });

  it("returns 404 when deleting non-existent game context", async () => {
    mockDelete.mockResolvedValue(false);

    const response = await DELETE(new NextRequest("http://localhost:3000"), {
      params,
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toMatchObject({ code: "NOT_FOUND" });
  });
});
