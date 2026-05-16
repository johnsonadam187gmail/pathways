import { describe, it, expect, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import { createMockTechniqueAction } from "@/lib/test-utils";
import type { TechniqueAction } from "@/lib/types/nodes";

const mockFindAll = jest.fn<() => Promise<TechniqueAction[]>>();
const mockCreate = jest.fn<() => Promise<TechniqueAction>>();

jest.mock("@/lib/neo4j/driver", () => ({
  getDriver: jest.fn(() => ({})),
}));

jest.mock("@/lib/neo4j/repositories/technique-action.repository", () => ({
  TechniqueActionRepository: jest.fn(() => ({
    findAll: mockFindAll,
    create: mockCreate,
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET, POST } = require("./route");

describe("TechniqueAction API — GET /api/v1/techniques", () => {
  it("returns 200 with list of techniques", async () => {
    const mockData = [createMockTechniqueAction({ id: "ta-1" })];
    mockFindAll.mockResolvedValue(mockData);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockData);
  });

  it("returns 200 with empty list when none exist", async () => {
    mockFindAll.mockResolvedValue([]);
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual([]);
  });
});

describe("TechniqueAction API — POST /api/v1/techniques", () => {
  it("returns 201 with created technique", async () => {
    const input = {
      action_name: "Armbar",
      action_type: "SUBMISSION",
      mechanical_preconditions: [],
    };
    const expected = createMockTechniqueAction({
      id: "new-ta",
      action_name: "Armbar",
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
