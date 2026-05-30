# UX Overhaul — Playwright Test Plan

## 0. Current State Summary (updated 2026-05-30 — P1+P2 complete)

| Aspect                                   | Status                                     |
| ---------------------------------------- | ------------------------------------------ |
| Canvas renders 20 nodes / 22 edges       | ✅                                         |
| React Flow Controls (zoom, fit)          | ✅                                         |
| Minimap with role colors                 | ✅                                         |
| Node detail panel                        | ✅ (shows selected node, editable fields)  |
| Connection handles per node              | ✅ (20 source + 20 target)                 |
| Edge labels visible                      | ✅                                         |
| **Toolbar / palette for creating nodes** | ✅ SidebarPalette with 3 entity types (P1) |
| **Drag-to-create**                       | ✅ DnD from palette to canvas (P1)         |
| **Context menus on nodes/canvas**        | ✅ NodeContextMenu (P2)                    |
| **Keyboard shortcuts**                   | ❌ None                                    |
| **Guided pathway creation**              | ✅ via palette drag, context menu (P1+P2)  |
| **Toast / feedback for errors**          | ❌ None                                    |
| **Inline editing**                       | ❌ None (via detail panel only)            |

---

## 1. Recommended Approach

**Left Sidebar Palette + Context Menus + Keyboard Shortcuts**

Based on React Flow's official drag-and-drop example (the industry standard for node editors) and universal mindmapping conventions (XMind, MindNode, MindMaster, FreeMind, Obsidian Canvas):

| Convention                    | Source                      | Applies Here?           |
| ----------------------------- | --------------------------- | ----------------------- |
| Drag from palette onto canvas | React Flow DnD example      | ✅ Create nodes         |
| `Enter` = edit selected node  | All mindmapping tools       | ✅ Edit labels          |
| `Tab` = create child/branch   | All mindmapping tools       | ✅ New branch from GC   |
| `Delete/Backspace` = delete   | All tools                   | ✅ Already works        |
| Right-click context menu      | Obsidian Canvas, MindMaster | ✅ Node/edge operations |
| `Space` + drag = pan canvas   | Obsidian Canvas             | ✅ (React Flow default) |
| `Shift+1` = zoom to fit       | Obsidian Canvas             | ✅ (React Flow default) |

---

## 2. Target UX — Test Scenarios

### 2A. Sidebar Palette & Drag-to-Create (✅ Complete — 5 e2e tests in `ux-overhaul.spec.ts`)

**Test 2A.1 — Palette renders all 3 node types**

```
Given the page is loaded
When the sidebar palette is visible
Then it contains draggable items:
  - "GameContext" (with role badge)
  - "TechniqueAction" (with action type badge)
  - "TerminalSink" (with sink type badge)
```

**Test 2A.2 — Drag GameContext creates full 5-part pathway**

```
Given the palette is visible
When the user drags "GameContext" onto the canvas
Then a complete pathway chain is spawned at the drop position:
  - GameContext node (placeholder, editable)
  - TacticalPathway edge (auto-created)
  - TechniqueAction node (placeholder, editable)
  - ResultsIn edge (auto-created)
  - GameContext | TerminalSink node (placeholder, toggleable)
And all 5 parts are connected in sequence
```

**Test 2A.3 — Drag TechniqueAction creates 2-node chain**

```
Given the palette is visible
When the user drags "TechniqueAction" onto the canvas
Then a 2-part chain is spawned:
  - TechniqueAction node
  - ResultsIn edge (placeholder)
  - GameContext | TerminalSink node (toggleable result)
And the TechniqueAction has a target handle for future TP connection
```

**Test 2A.4 — Drag TerminalSink creates standalone node**

```
Given the palette is visible
When the user drags "TerminalSink" onto the canvas
Then a standalone TerminalSink node is created at the drop position
With sink_type toggleable (SUBMISSION_SUCCESS / SUBMISSION_CONCEDED)
```

**Test 2A.5 — Drop position matches cursor**

```
Given the palette is visible
When the user drags a node to position (X, Y)
Then the spawned node(s) center at (X, Y)
```

### 2B. Context Menu Operations (✅ Complete — 7 e2e tests in `ux-overhaul.spec.ts`)

| Test | Focus                                                                 | E2E Status |
| ---- | --------------------------------------------------------------------- | ---------- |
| 2B.1 | Right-click GC shows GC menu (New Branch, New Decision, Edit, Delete) | ✅         |
| 2B.2 | Right-click TA shows TA menu (New Result, Edit, Delete)               | ✅         |
| 2B.3 | Right-click TS shows TS menu (Edit, Delete)                           | ✅         |
| 2B.4 | Right-click canvas shows canvas menu (New Pathway, Paste)             | ✅         |
| 2B.5 | Delete action removes node + connected edges                          | ✅         |
| 2B.6 | Edit action opens detail panel with node's label                      | ✅         |
| 2B.7 | Menu closes on outside click                                          | ✅         |

**Test 2B.1 — Right-click on GameContext shows menu**

```
Given a GameContext node is on the canvas
When the user right-clicks it
Then a context menu appears with:
  - "New Branch" (adds TP → TA → RI → GC|TS from this GC)
  - "New Decision" (adds different technique from this GC)
  - "Edit" (opens properties)
  - "Delete" (removes node + cascading edges)
```

**Test 2B.2 — Right-click on TechniqueAction shows menu**

```
Given a TechniqueAction node is on the canvas
When the user right-clicks it
Then a context menu appears with:
  - "New Result" (adds RI → GC|TS from this TA)
  - "Edit" (opens properties)
  - "Delete" (removes node + cascading edges)
```

**Test 2B.3 — Right-click on TerminalSink shows menu**

```
Given a TerminalSink node is on the canvas
When the user right-clicks it
Then a context menu appears with:
  - "Edit" (opens properties)
  - "Delete" (removes node + cascading edges)
```

**Test 2B.4 — Right-click on blank canvas shows menu**

```
Given no node is selected
When the user right-clicks on blank canvas
Then a context menu appears:
  - "New Pathway" (creates full 5-part chain at click position)
  - "Paste" (if clipboard has pathway data)
```

**Test 2B.5 — "New Branch" creates complete sub-chain**

```
Given a GameContext node exists
When the user right-clicks → "New Branch"
Then spawned at a readable offset:
  - TacticalPathway edge from the GC
  - TechniqueAction placeholder
  - ResultsIn edge
  - GameContext|TerminalSink placeholder (toggleable)
And the GC is NOT duplicated (only the new chain is added)
```

**Test 2B.6 — "New Result" creates result chain from TA**

```
Given a TechniqueAction node exists
When the user right-clicks → "New Result"
Then spawned at a readable offset:
  - ResultsIn edge from the TA
  - GameContext|TerminalSink placeholder (toggleable end state)
```

**Test 2B.7 — "New Decision" from GC creates different technique**

```
Given a GameContext node exists (may already have outgoing branches)
When the user right-clicks → "New Decision"
Then a new TacticalPathway edge appears from the GC
And a new TechniqueAction placeholder at a readable offset
With a new ResultsIn edge to a toggleable GameContext|TerminalSink
And all existing branches from that GC are preserved
```

### 2C. Keyboard Shortcuts

**Test 2C.1 — `Enter` edits selected node label**

```
Given a node is selected
When the user presses Enter
Then the node label becomes editable (inline edit mode activates)
```

**Test 2C.2 — `Tab` creates new branch from selected GC**

```
Given a GameContext node is selected
When the user presses Tab
Then a new branch chain (TP → TA → RI → GC|TS) is created
Equivalent to right-click → "New Branch"
```

**Test 2C.3 — `F2` edits node (mindmapping convention)**

```
Given a node is selected
When the user presses F2
Then edit mode activates (same as Enter)
```

**Test 2C.4 — `N` creates new pathway at canvas center**

```
Given no node is selected
When the user presses N
Then a full 5-part pathway chain appears at canvas center
New nodes are auto-selected for immediate editing
```

**Test 2C.5 — `Delete` / `Backspace` removes selected**

```
Given a node is selected
When the user presses Delete
Then the node and cascading edges are removed
```

**Test 2C.6 — `?` shows keyboard shortcuts overlay**

```
When the user presses ?
Then a modal/overlay appears listing all keyboard shortcuts
```

**Test 2C.7 — `Esc` closes overlays and deselects**

```
Given a context menu or shortcut overlay is open
When the user presses Escape
Then the overlay closes
And no node is selected (canvas active)
```

### 2D. Guided Pathway Filling

**Test 2D.1 — New nodes show as "untitled" placeholders**

```
When a new chain is created
Then each node shows a placeholder label:
  - GameContext: "New Position"
  - TechniqueAction: "New Technique"
  - TerminalSink: "Tap Out" or "Concede Position" (default toggle)
```

**Test 2D.2 — Result endpoint toggles between GC and TS**

```
Given a new chain is created with a result endpoint
When the user clicks the toggle on the result
Then it switches between:
  - "Position" (GameContext, with role selector)
  - "Terminal" (TerminalSink, with sink_type selector)
And the edge label updates to match
```

**Test 2D.3 — Node properties panel opens on click**

```
Given a node exists
When the user clicks it
Then the detail panel shows editable fields for that node type:
  - GameContext: position_name, relative_role, sidedness, danger_level, points_value
  - TechniqueAction: action_name, action_type, mechanical_preconditions
  - TerminalSink: sink_type (toggle)
  - Edges: gateway_type, trigger_condition
```

**Test 2D.4 — Inline edge label editing on canvas**

```
Given a TacticalPathway edge exists
When the user double-clicks the edge label on the canvas
Then the trigger_condition text becomes an inline editable input
When the user types a new condition and presses Enter
Then the label updates on the edge
And a PATCH request is sent to /api/v1/pathways/[id]
```

**Test 2D.5 — Invalid transition shows error toast**

```
Given a ResultsIn edge is being created
When the transition violates the Transitional Matrix (e.g., N→S)
Then an error toast appears:
  "Invalid transition: NEUTRAL → SYMMETRICAL_DANGER (rule violation)"
And the edge is NOT created
```

### 2E. Half-Pathway Prevention

**Test 2E.1 — Cannot delete middle node without cascade warning**

```
Given a complete pathway chain (GC → TP → TA → RI → GC|TS)
When the user tries to delete the TechniqueAction
Then a confirmation dialog warns:
  "This will also remove connected edges and orphan nodes. Continue?"
And deleting confirms removes the full subgraph
```

**Test 2E.2 — Cannot create orphan edges**

```
Given no valid source-target pair
When a drag-to-connect operation would create an incomplete edge
Then the connection is rejected
And a tooltip explains why (e.g., "TacticalPathway requires GameContext → TechniqueAction")
```

**Test 2E.3 — Gap detection on save/export**

```
When the user triggers any save/export operation
Then the system validates no half-pathways exist
And if found, highlights incomplete chains with a warning badge
```

### 2F. Existing UI Improvements

**Test 2F.1 — Empty canvas shows onboarding overlay**

```
Given the canvas is empty (no demo data, no DB)
Then a helpful onboarding overlay appears:
  - "Drag items from the palette to build your tactical graph"
  - "Press ? for keyboard shortcuts"
  - "Load Demo Data" button (existing)
  - "Connect to Database" button (existing)
```

**Test 2F.2 — Loading state shows skeleton**

```
Given the page is loading graph data
Then a skeleton UI is shown (not just text banner)
```

**Test 2F.3 — Node detail panel persists labels**

```
Given the user edits a node label in the detail panel
When they click outside the input or press Enter
Then the label persists on the node
And a PATCH request is sent to the backend
```

**Test 2F.4 — Demo data banner shows correctly**

```
Given demo data is loaded
Then the "Showing demo data" banner is visible at the bottom
With a "Connect to DB" button
```

---

### 2G. Handle-to-Handle Connections Between Existing Nodes

**Test 2G.1 — Drag handle from existing GC to existing TA creates TacticalPathway**

```
Given a GameContext node and a TechniqueAction node exist on the canvas
When the user drags from the GC's source handle to the TA's target handle
Then a TacticalPathway edge is created between them
And a POST request is sent to /api/v1/pathways
And a success toast appears
```

**Test 2G.2 — Drag handle from existing TA to existing GC creates ResultsIn**

```
Given a TechniqueAction node and a GameContext node exist on the canvas
When the user drags from the TA's source handle to the GC's target handle
Then a ResultsIn edge is created between them
And a POST request is sent to /api/v1/results
And transitional validation is performed
```

**Test 2G.3 — Drag handle from existing TA to existing TerminalSink creates ResultsIn**

```
Given a TechniqueAction node and a TerminalSink node exist on the canvas
When the user drags from the TA's source handle to the TS's target handle
Then a ResultsIn edge is created between them
And a POST request is sent to /api/v1/results
And the terminal transition rule (O/D→T) is validated
```

**Test 2G.4 — Invalid node-type connection is rejected with visual feedback**

```
Given two nodes with incompatible types for a MAML edge
When the user drags from source handle to target handle
  (e.g., GameContext → GameContext, or TerminalSink → anything)
Then the connection line turns red during drag
And no edge is created on drop
And an error toast explains the constraint:
  "Cannot connect GameContext to GameContext"
```

**Test 2G.5 — Transitional validation rejects invalid role transition**

```
Given a TechniqueAction with an outgoing ResultsIn edge to GameContext "NEUTRAL"
And the technique's pathway originates from a GameContext "OFFENSIVE"
When the user creates a new ResultsIn from the same TA to GameContext "SYMMETRICAL_DANGER"
Then the edge is rejected with a validation error toast:
  "Invalid transition: OFFENSIVE → SYMMETRICAL_DANGER (rule violation)"
And the edge is NOT created in the graph
```

---

## 3. Implementation Phases

| Phase | Focus                                        | Test Coverage   | Status         |
| ----- | -------------------------------------------- | --------------- | -------------- |
| P1    | Sidebar palette + drag-to-create             | 2A.1–2A.5       | ✅ Complete    |
| P2    | Context menus + node operations              | 2B.1–2B.7       | ✅ Complete    |
| P3    | Handle-to-handle connections + validation    | 2G.1–2G.5, 2D.5 | ❌ Not started |
| P4    | Keyboard shortcuts                           | 2C.1–2C.7       | ❌ Not started |
| P5    | Guided pathway filling + inline editing      | 2D.1–2D.4       | ❌ Not started |
| P6    | Half-pathway prevention + cascade delete     | 2E.1–2E.3       | ❌ Not started |
| P7    | UI polish (onboarding, loading, persistence) | 2F.1–2F.4       | ❌ Not started |

---

## 4. Test Environment

```bash
# Start dev server
npm run dev

# Run Playwright tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/ux-overhaul.spec.ts

# Run with UI mode for debugging
npx playwright test --ui
```

Test file: `e2e/ux-overhaul.spec.ts` (12 scenarios implemented)

Key Playwright patterns to use:

- `page.dragAndDrop(source, target)` for palette → canvas
- `page.locator('.react-flow__node').first().click()` for node selection
- `page.keyboard.press('Tab')` for keyboard shortcuts
- `page.on('request', ...)` to intercept API calls
- `page.on('pageerror', ...)` to catch JS errors
- `expect(page.getByRole('menu'))` for context menu assertions
- `page.getByText()` for element assertions
- **`dispatchContextMenu(page, selector, text)`** — Helper that dispatches native `contextmenu` events via `evaluate()` to bypass Playwright viewport issues with React Flow nodes (see `e2e/ux-overhaul.spec.ts`)
- **Menu item clicks**: Use `.evaluate((el) => (el as HTMLButtonElement).click())` for fixed-position context menu items near viewport edges
