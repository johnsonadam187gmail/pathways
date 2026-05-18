// E2E: Seed data coverage verification
// Verifies the comprehensive seed data covers all MAML use cases on the canvas
import { test, expect } from "@playwright/test";

test.describe("Seed data coverage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for React Flow canvas to render with demo data
    const reactFlow = page.locator(".react-flow");
    await expect(reactFlow).toBeVisible({ timeout: 15000 });
    // Wait for nodes to appear (seed data loads as fallback when API unavailable)
    const nodes = page.locator(".react-flow__node");
    await expect(nodes.first()).toBeVisible({ timeout: 10000 });
  });

  test("renders all 9 GameContext positions covering all 4 relative roles", async ({
    page,
  }) => {
    // All 9 position names must be visible
    await expect(page.getByText("Neutral Standing")).toBeVisible();
    await expect(page.getByText("Neutral Clinch")).toBeVisible();
    await expect(page.getByText("50/50 Guard")).toBeVisible();
    await expect(page.getByText("Closed Guard Bottom")).toBeVisible();
    await expect(page.getByText("Half Guard Bottom")).toBeVisible();
    await expect(page.getByText("Side Control Bottom")).toBeVisible();
    await expect(page.getByText("Side Control Top")).toBeVisible();
    await expect(page.getByText("Mount Top")).toBeVisible();
    await expect(page.getByText("Back Mount")).toBeVisible();
  });

  test("renders all 9 TechniqueActions covering all 5 action types", async ({
    page,
  }) => {
    await expect(page.getByText("Double Leg Takedown")).toBeVisible();
    await expect(page.getByText("Single Leg Takedown")).toBeVisible();
    await expect(page.getByText("Scissor Sweep")).toBeVisible();
    await expect(page.getByText("Hip Escape")).toBeVisible();
    await expect(page.getByText("Shrimp Escape")).toBeVisible();
    await expect(page.getByText("Technical Stand Up")).toBeVisible();
    await expect(page.getByText("Standing Guard Pass")).toBeVisible();
    await expect(page.getByText("Armbar from Guard")).toBeVisible();
    await expect(page.getByText("Rear Naked Choke")).toBeVisible();
  });

  test("renders both TerminalSink types", async ({ page }) => {
    await expect(page.getByText("Tap Out")).toBeVisible();
    await expect(page.getByText("Concede Position")).toBeVisible();
  });

  test("renders correct total node count", async ({ page }) => {
    const nodes = page.locator(".react-flow__node");
    await expect(nodes).toHaveCount(20, { timeout: 5000 });
  });

  test("renders all role badges on GameContext nodes", async ({ page }) => {
    await expect(page.getByText("OFFENSIVE").first()).toBeVisible();
    await expect(page.getByText("DEFENSIVE").first()).toBeVisible();
    await expect(page.getByText("NEUTRAL").first()).toBeVisible();
    await expect(page.getByText("SYMMETRICAL DANGER")).toBeVisible();
  });

  test("renders all action type badges on TechniqueAction nodes", async ({
    page,
  }) => {
    await expect(page.getByText("SWEEP").first()).toBeVisible();
    await expect(page.getByText("SUBMISSION").first()).toBeVisible();
    await expect(page.getByText("ESCAPE").first()).toBeVisible();
    await expect(page.getByText("GUARD_PASS")).toBeVisible();
    await expect(page.getByText("POSTURE_ADJUST")).toBeVisible();
  });

  test("renders both sink type badges on TerminalSink nodes", async ({
    page,
  }) => {
    await expect(page.getByText("SUBMISSION_SUCCESS")).toBeVisible();
    await expect(page.getByText("SUBMISSION_CONCEDED")).toBeVisible();
  });

  test("renders edge labels for trigger conditions", async ({ page }) => {
    // Check a few trigger conditions are visible as edge labels
    await expect(
      page.getByText("Opponent squares up, weight centered"),
    ).toBeVisible();
    await expect(
      page.getByText("Opponent postures up, loses pressure"),
    ).toBeVisible();
    await expect(
      page.getByText("Opponent reaches back, exposes neck"),
    ).toBeVisible();
  });

  test("renders Results In labels on RESULTS_IN edges", async ({ page }) => {
    // Should have at least one "Results In →" label visible
    const resultsInLabels = page.getByText("Results In →");
    await expect(resultsInLabels.first()).toBeVisible();
  });

  test("renders danger level subtitles on GameContext nodes", async ({
    page,
  }) => {
    // Check a few danger level indicators
    await expect(page.getByText(/Danger:\s*\d+\s*\|\s*Pts:\s*\d+/)).toHaveCount(
      9,
      { timeout: 5000 },
    );
  });
});
