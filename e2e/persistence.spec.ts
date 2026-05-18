// E2E: Database persistence and API endpoint verification
import { test, expect } from "@playwright/test";

test.describe("Seed API", () => {
  test("POST /api/v1/seed returns 200 and creates nodes and edges", async ({
    request,
  }) => {
    const res = await request.post("/api/v1/seed", {
      data: { reset: true },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.created.nodes).toBe(20);
    expect(body.created.edges).toBe(22);
  });

  test("POST /api/v1/seed is idempotent", async ({ request }) => {
    const res1 = await request.post("/api/v1/seed", { data: {} });
    expect(res1.status()).toBe(200);

    const res2 = await request.post("/api/v1/seed", { data: {} });
    expect(res2.status()).toBe(200);
  });
});

test.describe("Graph API", () => {
  test.beforeAll(async ({ request }) => {
    await request.post("/api/v1/seed", { data: { reset: true } });
  });

  test("GET /api/v1/graph returns all seed entities", async ({ request }) => {
    const res = await request.get("/api/v1/graph");
    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(body.gameContexts).toHaveLength(9);
    expect(body.techniqueActions).toHaveLength(9);
    expect(body.terminalSinks).toHaveLength(2);
    expect(body.tacticalPathways).toHaveLength(11);
    expect(body.resultsInEdges).toHaveLength(11);
  });

  test("GameContext nodes include position data from seed", async ({
    request,
  }) => {
    const res = await request.get("/api/v1/graph");
    const body = await res.json();

    const standing = body.gameContexts.find(
      (gc: Record<string, unknown>) => gc.id === "gc-neutral-standing",
    );
    expect(standing).toBeDefined();
    expect(standing.pos_x).toBe(-300);
    expect(standing.pos_y).toBe(-400);
  });
});

test.describe("Results API", () => {
  test.beforeAll(async ({ request }) => {
    await request.post("/api/v1/seed", { data: { reset: true } });
  });

  test("GET /api/v1/results returns all RESULTS_IN edges", async ({
    request,
  }) => {
    const res = await request.get("/api/v1/results");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(11);
  });

  test("GET /api/v1/results/[id] returns a specific edge", async ({
    request,
  }) => {
    const res = await request.get("/api/v1/results");
    const edges = await res.json();
    const first = edges[0];

    const detailRes = await request.get(`/api/v1/results/${first.id}`);
    expect(detailRes.status()).toBe(200);
    const detail = await detailRes.json();
    expect(detail.id).toBe(first.id);
  });
});

test.describe("Page loads graph from DB after seed", () => {
  test.beforeAll(async ({ request }) => {
    await request.post("/api/v1/seed", { data: { reset: true } });
  });

  test("canvas renders seeded nodes from API", async ({ page }) => {
    // Intercept the graph API call and verify it returns seeded data
    const apiPromise = page.waitForResponse(
      (res) => res.url().includes("/api/v1/graph") && res.status() === 200,
    );

    await page.goto("/");

    const response = await apiPromise;
    const data = await response.json();
    expect(data.gameContexts.length).toBe(9);

    // Canvas should render with nodes from API
    const nodes = page.locator(".react-flow__node");
    await expect(nodes.first()).toBeVisible({ timeout: 15000 });
  });

  test('shows no "demo data" banner when DB is seeded', async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3000);

    // The "Showing demo data" banner should NOT be visible when DB is connected
    const demoBanner = page.getByText("Showing demo data");
    await expect(demoBanner).not.toBeVisible();
  });
});
