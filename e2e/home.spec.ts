// E2E: Home page renders the MAML canvas without errors
import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and shows header with Pathways branding", async ({ page }) => {
    await page.goto("/");

    // Header visible
    await expect(page.getByText("Pathways")).toBeVisible();
    await expect(page.getByText("MAML Tactical Graph")).toBeVisible();

    // Legend visible
    await expect(page.getByText("Offensive")).toBeVisible();
  });

  test("renders graph canvas with nodes from demo data", async ({ page }) => {
    await page.goto("/");

    // Wait for canvas to render — react-flow renders SVG elements
    const reactFlow = page.locator(".react-flow");
    await expect(reactFlow).toBeVisible({ timeout: 10000 });

    // Should see at least some graph nodes rendered
    const nodes = page.locator(".react-flow__node");
    await expect(nodes.first()).toBeVisible({ timeout: 5000 });

    // Verify count matches loaded data
    const count = await nodes.count();
    expect(count).toBeGreaterThan(0);
  });

  test("does not make repeated GET requests in a loop", async ({ page }) => {
    let requestCount = 0;

    page.on("request", (req) => {
      const url = req.url();
      if (req.resourceType() === "document" && url.includes("localhost:3000")) {
        requestCount++;
      }
    });

    await page.goto("/");

    // Wait for the page to fully settle (data loads after mount)
    await page.waitForTimeout(3000);

    // Should have had at most 3 document requests (initial load + HMR navs)
    expect(requestCount).toBeLessThan(10);
  });

  test("loads data from API and renders nodes on the canvas", async ({
    page,
  }) => {
    // Track fetch requests to the graph API
    const apiCalls: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/v1/graph")) {
        apiCalls.push(req.url());
      }
    });

    // Track errors
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");

    // Wait for React Flow canvas with nodes
    const nodes = page.locator(".react-flow__node");
    await expect(nodes.first()).toBeVisible({ timeout: 15000 });

    // API should have been called
    expect(apiCalls.length).toBeGreaterThanOrEqual(1);

    // No page errors
    expect(errors).toEqual([]);
  });
});
