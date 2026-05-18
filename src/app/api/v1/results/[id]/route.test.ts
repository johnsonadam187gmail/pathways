import { describe, it, expect, jest } from "@jest/globals";
import { createMockResultsIn } from "@/lib/test-utils";
import type { ResultsIn } from "@/lib/types/edges";

const mockFindById = jest.fn<() => Promise<ResultsIn | null>>();
const mockDelete = jest.fn<() => Promise<boolean>>();

jest.mock("@/lib/neo4j/driver", () => ({
  getDriver: jest.fn(() => ({})),
}));

jest.mock("@/lib/neo4j/repositories/results-in.repository", () => ({
  ResultsInRepository: jest.fn(() => ({
    findById: mockFindById,
    delete: mockDelete,
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET, DELETE } = require("./route");

describe("ResultsIn API — GET /api/v1/results/[id]", () => {
  it("returns 200 with the result edge", async () => {
    const mockData = createMockResultsIn({ id: "ri-1" });
    mockFindById.mockResolvedValue(mockData);

    const response = await GET({} as Request, {
      params: Promise.resolve({ id: "ri-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockData);
  });

  it("returns 404 when not found", async () => {
    mockFindById.mockResolvedValue(null);

    const response = await GET({} as Request, {
      params: Promise.resolve({ id: "nonexistent" }),
    });

    expect(response.status).toBe(404);
  });

  it("returns 500 on repository error", async () => {
    mockFindById.mockRejectedValue(new Error("DB error"));

    const response = await GET({} as Request, {
      params: Promise.resolve({ id: "ri-1" }),
    });

    expect(response.status).toBe(500);
  });
});

describe("ResultsIn API — DELETE /api/v1/results/[id]", () => {
  it("returns 200 with deleted: true", async () => {
    mockDelete.mockResolvedValue(true);

    const response = await DELETE({} as Request, {
      params: Promise.resolve({ id: "ri-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ deleted: true });
  });

  it("returns 404 when not found", async () => {
    mockDelete.mockResolvedValue(false);

    const response = await DELETE({} as Request, {
      params: Promise.resolve({ id: "nonexistent" }),
    });

    expect(response.status).toBe(404);
  });

  it("returns 500 on repository error", async () => {
    mockDelete.mockRejectedValue(new Error("DB error"));

    const response = await DELETE({} as Request, {
      params: Promise.resolve({ id: "ri-1" }),
    });

    expect(response.status).toBe(500);
  });
});
