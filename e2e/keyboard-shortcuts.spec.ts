// E2E: Keyboard Shortcuts (Phase 4)
import { test, expect } from "@playwright/test";

test.describe("P4 — Keyboard Shortcuts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator(".react-flow");
    await expect(canvas).toBeVisible({ timeout: 20000 });
    const nodes = page.locator(".react-flow__node");
    await expect(nodes).toHaveCount(20, { timeout: 15000 });
  });

  test("? toggles keyboard shortcuts modal", async ({ page }) => {
    await page.keyboard.press("?");
    await expect(page.locator('[data-testid="keyboard-shortcuts-modal"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-testid="keyboard-shortcuts-modal"]')).not.toBeVisible();
  });

  test("Escape closes modal and deselects node", async ({ page }) => {
    await page.keyboard.press("?");
    await expect(page.locator('[data-testid="keyboard-shortcuts-modal"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-testid="keyboard-shortcuts-modal"]')).not.toBeVisible();
  });
});
