import { describe, it, expect, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import { createMockTechniqueAction } from "@/lib/test-utils";
import type { TechniqueAction } from "@/lib/types/nodes";

const mockFindById = jest.fn<() => Promise<TechniqueAction | null>>();
const mockUpdate = jest.fn<() => Promise<TechniqueAction>>();
const mockDelete = jest.fn<() => Promise<boolean>>();

jest.mock("@/lib/neo4j/driver", () => ({
  getDriver: jest.fn(() => ({})),
}));

jest.mock("@/lib/neo4j/repositories/technique-action.repository", () => ({
  TechniqueActionRepository: jest.fn(() => ({
    findById: mockFindById,
    update: mockUpdate,
    delete: mockDelete,
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET, PATCH, DELETE } = require("./route");

const params = Promise.resolve({ id: "ta-1" });

describe("TechniqueAction API — GET /api/v1/techniques/[id]", () => {
  it("returns 200 when found", async () => {
    mockFindById.mockResolvedValue(createMockTechniqueAction({ id: "ta-1" }));

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

describe("TechniqueAction API — PATCH /api/v1/techniques/[id]", () => {
  it("returns 200 on update", async () => {
    mockUpdate.mockResolvedValue(
      createMockTechniqueAction({
        id: "ta-1",
        action_name: "Updated",
      }),
    );

    const request = new NextRequest("http://localhost:3000", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action_name: "Updated" }),
    });
    const response = await PATCH(request, { params });
    expect(response.status).toBe(200);
  });
});

describe("TechniqueAction API — DELETE /api/v1/techniques/[id]", () => {
  it("returns 200 with deleted:true", async () => {
    mockDelete.mockResolvedValue(true);

    const response = await DELETE(new NextRequest("http://localhost:3000"), {
      params,
    });
    const body = await response.json();
    expect(response.status).toBe(200);
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
