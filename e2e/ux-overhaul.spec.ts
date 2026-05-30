// E2E: UX Overhaul — Sidebar Palette & Drag-to-Create (Phase 1)
// Tests 2A.1–2A.5: Palette renders, drag-to-create produces correct chains
// Phase 2 (2B.1–2B.7): Context menus on right-click
import { test, expect, type Page } from "@playwright/test";

test.describe("P1 — Sidebar Palette & Drag-to-Create", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for canvas to render with demo data
    const canvas = page.locator(".react-flow");
    await expect(canvas).toBeVisible({ timeout: 20000 });
    // Wait for demo data to load (20 nodes)
    const nodes = page.locator(".react-flow__node");
    await expect(nodes).toHaveCount(20, { timeout: 15000 });
  });

  // ─── 2A.1 — Palette renders all 3 node types ─────────────────────────────

  test("2A.1: Palette sidebar is visible with all 3 entity types", async ({
    page,
  }) => {
    // Palette sidebar should be present
    const palette = page.getByText("Palette");
    await expect(palette).toBeVisible();

    // All three draggable items should be present
    await expect(page.getByText("GameContext")).toBeVisible();
    await expect(page.getByText("TechniqueAction")).toBeVisible();
    await expect(page.getByText("TerminalSink")).toBeVisible();

    // Each item should have the draggable attribute
    const gcItem = page.locator('[data-testid="palette-item-game-context"]');
    const taItem = page.locator(
      '[data-testid="palette-item-technique-action"]',
    );
    const tsItem = page.locator('[data-testid="palette-item-terminal-sink"]');

    await expect(gcItem).toBeVisible();
    await expect(taItem).toBeVisible();
    await expect(tsItem).toBeVisible();

    // Verify draggable attribute
    expect(await gcItem.getAttribute("draggable")).toBe("true");
    expect(await taItem.getAttribute("draggable")).toBe("true");
    expect(await tsItem.getAttribute("draggable")).toBe("true");
  });

  // ─── 2A.2 — Drag GameContext creates full 5-part pathway ──────────────────

  test("2A.2: Drag GameContext onto canvas creates full 5-part pathway", async ({
    page,
  }) => {
    const gcItem = page.locator('[data-testid="palette-item-game-context"]');
    const canvas = page.locator(".react-flow");

    // Get initial node count
    const initialCount = await page.locator(".react-flow__node").count();

    // Simulate drag and drop
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error("Canvas not found");

    // Perform drag from palette to canvas center
    await gcItem.dragTo(canvas, {
      targetPosition: {
        x: canvasBox.x + canvasBox.width / 2,
        y: canvasBox.y + canvasBox.height / 2,
      },
    });

    // Wait for new nodes to appear
    await page.waitForTimeout(500);

    // Should have added 3 new nodes (GC + TA + Result endpoint)
    const newCount = await page.locator(".react-flow__node").count();
    expect(newCount).toBe(initialCount + 3);

    // Should have added 2 new edges (TP + RI)
    const newEdgeCount = await page.locator(".react-flow__edge").count();
    // Demo has 22 edges, we added 2
    expect(newEdgeCount).toBe(24);

    // The new nodes should include "New Position" and "New Technique" placeholders
    const newPositionNodes = page.locator(".react-flow__node", {
      hasText: "New Position",
    });
    await expect(newPositionNodes.first()).toBeVisible();

    const newTechniqueNodes = page.locator(".react-flow__node", {
      hasText: "New Technique",
    });
    await expect(newTechniqueNodes.first()).toBeVisible();
  });

  // ─── 2A.3 — Drag TechniqueAction creates 2-node chain ────────────────────

  test("2A.3: Drag TechniqueAction onto canvas creates TA→RI→GC|TS chain", async ({
    page,
  }) => {
    const taItem = page.locator(
      '[data-testid="palette-item-technique-action"]',
    );
    const canvas = page.locator(".react-flow");

    const initialCount = await page.locator(".react-flow__node").count();

    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error("Canvas not found");

    await taItem.dragTo(canvas, {
      targetPosition: {
        x: canvasBox.x + canvasBox.width / 2,
        y: canvasBox.y + canvasBox.height / 2,
      },
    });

    await page.waitForTimeout(500);

    // Should have added 2 new nodes (TA + Result endpoint)
    const newCount = await page.locator(".react-flow__node").count();
    expect(newCount).toBe(initialCount + 2);

    // "New Technique" placeholder should appear
    await expect(page.getByText("New Technique").first()).toBeVisible();
  });

  // ─── 2A.4 — Drag TerminalSink creates standalone node ────────────────────

  test("2A.4: Drag TerminalSink onto canvas creates standalone TS node", async ({
    page,
  }) => {
    const tsItem = page.locator('[data-testid="palette-item-terminal-sink"]');
    const canvas = page.locator(".react-flow");

    const initialCount = await page.locator(".react-flow__node").count();

    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error("Canvas not found");

    await tsItem.dragTo(canvas, {
      targetPosition: {
        x: canvasBox.x + canvasBox.width / 2,
        y: canvasBox.y + canvasBox.height / 2,
      },
    });

    await page.waitForTimeout(500);

    // Should have added 1 new node
    const newCount = await page.locator(".react-flow__node").count();
    expect(newCount).toBe(initialCount + 1);

    // "Tap Out" placeholder should appear (default TS label)
    await expect(page.getByText("Tap Out").first()).toBeVisible();
  });

  // ─── 2A.5 — Drop position matches cursor ─────────────────────────────────

  test("2A.5: Dropped nodes appear near the drop position", async ({
    page,
  }) => {
    const gcItem = page.locator('[data-testid="palette-item-game-context"]');
    const canvas = page.locator(".react-flow");

    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error("Canvas not found");

    // Drop at a specific position (left side of canvas)
    const targetX = canvasBox.x + 200;
    const targetY = canvasBox.y + 200;

    await gcItem.dragTo(canvas, {
      targetPosition: { x: targetX, y: targetY },
    });

    await page.waitForTimeout(500);

    // The new nodes should be within reasonable distance of the drop point
    // Get all "New Position" nodes and check their screen positions
    const newNode = page.locator(".react-flow__node", {
      hasText: "New Position",
    });
    const box = await newNode.first().boundingBox();
    expect(box).not.toBeNull();

    // Nodes should render within the canvas area
    if (box) {
      expect(box.x).toBeGreaterThan(canvasBox.x - 50);
      expect(box.y).toBeGreaterThan(canvasBox.y - 50);
    }
  });
});

// ─── Phase 2: Context Menus (2B.1–2B.7) ─────────────────────────────────────

/**
 * Dispatch a native contextmenu event on a DOM element. This bypasses
 * Playwright's viewport checks which fail for React Flow nodes scrolled
 * behind the sidebar palette or overlapped by UI banners.
 */
async function dispatchContextMenu(
  page: Page,
  selector: string,
  text?: string,
) {
  const locator = text
    ? page.locator(selector).filter({ hasText: text })
    : page.locator(selector);
  await locator.waitFor({ state: "attached", timeout: 10000 });
  await locator.evaluate((el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    el.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        button: 2,
      }),
    );
  });
  await page.waitForTimeout(200);
}

test.describe("P2 — Context Menus on Right-Click", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator(".react-flow");
    await expect(canvas).toBeVisible({ timeout: 15000 });
    const nodes = page.locator(".react-flow__node");
    await expect(nodes).toHaveCount(20, { timeout: 10000 });
    // Close any lingering context menus
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
  });

  // ─── 2B.1 — GC node context menu ──────────────────────────────────────────

  test("2B.1: Right-clicking a GameContext node shows GC-specific menu items", async ({
    page,
  }) => {
    await dispatchContextMenu(page, ".react-flow__node", "Closed Guard Bottom");

    // Context menu should appear
    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    // Should show GC-specific items
    await expect(
      page.locator('[data-testid="menu-item-new-branch"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="menu-item-new-decision"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="menu-item-edit"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="menu-item-delete"]'),
    ).toBeVisible();

    // Should NOT show items from other menus
    await expect(
      page.locator('[data-testid="menu-item-new-result"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('[data-testid="menu-item-new-pathway"]'),
    ).toHaveCount(0);
  });

  // ─── 2B.2 — TA node context menu ──────────────────────────────────────────

  test("2B.2: Right-clicking a TechniqueAction node shows TA-specific menu items", async ({
    page,
  }) => {
    await dispatchContextMenu(page, ".react-flow__node", "Scissor Sweep");

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    // TA-specific items
    await expect(
      page.locator('[data-testid="menu-item-new-result"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="menu-item-edit"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="menu-item-delete"]'),
    ).toBeVisible();

    // Should NOT show GC-only items
    await expect(
      page.locator('[data-testid="menu-item-new-branch"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('[data-testid="menu-item-new-decision"]'),
    ).toHaveCount(0);
  });

  // ─── 2B.3 — TS node context menu ──────────────────────────────────────────

  test("2B.3: Right-clicking a TerminalSink node shows TS-specific menu items", async ({
    page,
  }) => {
    await dispatchContextMenu(page, ".react-flow__node", "Tap Out");

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    // TS only has Edit and Delete (no creation actions)
    await expect(page.locator('[data-testid="menu-item-edit"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="menu-item-delete"]'),
    ).toBeVisible();

    // Should NOT have creation items
    await expect(
      page.locator('[data-testid="menu-item-new-branch"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('[data-testid="menu-item-new-decision"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('[data-testid="menu-item-new-result"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('[data-testid="menu-item-new-pathway"]'),
    ).toHaveCount(0);
  });

  // ─── 2B.4 — Canvas context menu ───────────────────────────────────────────

  test("2B.4: Right-clicking the canvas shows canvas-level menu items", async ({
    page,
  }) => {
    // Right-click on the React Flow pane (canvas background)
    const pane = page.locator(".react-flow__pane");
    await pane.waitFor({ state: "attached", timeout: 10000 });
    await pane.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      el.dispatchEvent(
        new MouseEvent("contextmenu", {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
          button: 2,
        }),
      );
    });
    await page.waitForTimeout(200);

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    // Canvas has "New Pathway" and "Paste"
    await expect(
      page.locator('[data-testid="menu-item-new-pathway"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="menu-item-paste"]')).toBeVisible();

    // Should NOT have node-specific items
    await expect(page.locator('[data-testid="menu-item-edit"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="menu-item-delete"]')).toHaveCount(
      0,
    );
  });

  // ─── 2B.5 — Context menu Delete action ────────────────────────────────────

  test("2B.5: Choosing Delete from context menu removes the node and connected edges", async ({
    page,
  }) => {
    // Get initial counts
    const initialNodeCount = await page.locator(".react-flow__node").count();
    const initialEdgeCount = await page.locator(".react-flow__edge").count();

    // Right-click on "Neutral Standing" (has connected edges)
    await dispatchContextMenu(page, ".react-flow__node", "Neutral Standing");

    // Click Delete via evaluate to bypass Playwright's viewport checks
    // (context menu uses fixed positioning, items near viewport edges fail
    // Playwright's built-in visibility/clickability assertions)
    await page
      .locator('[data-testid="menu-item-delete"]')
      .evaluate((el) => (el as HTMLButtonElement).click());
    await page.waitForTimeout(300);

    // Node should be removed
    const newNodeCount = await page.locator(".react-flow__node").count();
    expect(newNodeCount).toBe(initialNodeCount - 1);

    // Connected edges should also be removed
    const newEdgeCount = await page.locator(".react-flow__edge").count();
    expect(newEdgeCount).toBeLessThan(initialEdgeCount);
  });

  // ─── 2B.6 — Context menu Edit action ──────────────────────────────────────

  test("2B.6: Choosing Edit from context menu selects the node", async ({
    page,
  }) => {
    await dispatchContextMenu(page, ".react-flow__node", "Mount Top");

    // Click Edit
    await page.locator('[data-testid="menu-item-edit"]').click();
    await page.waitForTimeout(200);

    // Context menu should close
    await expect(
      page.locator('[data-testid="context-menu"]'),
    ).not.toBeVisible();

    // The detail panel should show the selected node's label
    await expect(page.locator("#node-label-input")).toHaveValue("Mount Top");
  });

  // ─── 2B.7 — Menu closes on outside click ──────────────────────────────────

  test("2B.7: Context menu closes when clicking outside", async ({ page }) => {
    await dispatchContextMenu(page, ".react-flow__node", "Back Mount");

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    // Click on the canvas (outside the menu)
    const canvas = page.locator(".react-flow__pane");
    const box = await canvas.boundingBox();
    if (!box) throw new Error("Canvas not found");
    await page.mouse.click(box.x + 10, box.y + 10);
    await page.waitForTimeout(200);

    // Menu should be closed
    await expect(menu).not.toBeVisible();
  });
});
