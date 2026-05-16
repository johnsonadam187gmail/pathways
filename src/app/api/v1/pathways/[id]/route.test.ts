import { describe, it, expect, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import { createMockTacticalPathway } from "@/lib/test-utils";
import type { TacticalPathway } from "@/lib/types/edges";

const mockFindById = jest.fn<() => Promise<TacticalPathway | null>>();
const mockUpdate = jest.fn<() => Promise<TacticalPathway>>();
const mockDelete = jest.fn<() => Promise<boolean>>();

jest.mock("@/lib/neo4j/driver", () => ({
  getDriver: jest.fn(() => ({})),
}));

jest.mock("@/lib/neo4j/repositories/tactical-pathway.repository", () => ({
  TacticalPathwayRepository: jest.fn(() => ({
    findById: mockFindById,
    update: mockUpdate,
    delete: mockDelete,
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET, PATCH, DELETE } = require("./route");

const params = Promise.resolve({ id: "tp-1" });

describe("TacticalPathway API — GET /api/v1/pathways/[id]", () => {
  it("returns 200 when found", async () => {
    mockFindById.mockResolvedValue(createMockTacticalPathway({ id: "tp-1" }));
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

describe("TacticalPathway API — PATCH /api/v1/pathways/[id]", () => {
  it("returns 200 on update", async () => {
    mockUpdate.mockResolvedValue(
      createMockTacticalPathway({
        id: "tp-1",
        trigger_condition: "updated",
      }),
    );
    const request = new NextRequest("http://localhost:3000", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trigger_condition: "updated" }),
    });
    const response = await PATCH(request, { params });
    expect(response.status).toBe(200);
  });
});

describe("TacticalPathway API — DELETE /api/v1/pathways/[id]", () => {
  it("returns 200 with deleted:true", async () => {
    mockDelete.mockResolvedValue(true);
    const response = await DELETE(new NextRequest("http://localhost:3000"), {
      params,
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ deleted: true });
  });

  it("returns 404 when not found", async () => {
    mockDelete.mockResolvedValue(false);
    const response = await DELETE(new NextRequest("http://localhost:3000"), {
      params,
    });
    expect(response.status).toBe(404);
  });
});
