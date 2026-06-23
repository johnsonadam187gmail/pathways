# Pathways — MAML Tactical Graph

Graph-native tactical analysis for martial arts using the **Martial Arts Modelling Language (MAML)**.

## Project Status

| Phase | Focus                                        | Status         |
| ----- | -------------------------------------------- | -------------- |
| P1    | Sidebar palette + drag-to-create             | ✅ Complete    |
| P2    | Context menus + node operations              | ✅ Complete    |
| P3    | Handle-to-handle connections + validation    | ✅ Complete    |
| P4    | Keyboard shortcuts                           | ✅ Complete    |
| P5    | Guided pathway filling + inline editing      | ❌ Not started |
| P6    | Half-pathway prevention + cascade delete     | ❌ Not started |
| P7    | UI polish (onboarding, loading, persistence) | ❌ Not started |

## Keyboard Shortcuts

| Shortcut             | Action                                              |
| -------------------- | --------------------------------------------------- |
| `?`                  | Toggle keyboard shortcuts overlay                   |
| `Esc`                | Close overlay / deselect node                       |
| `Enter` / `F2`       | Edit selected node (opens detail panel)             |
| `Tab`                | Create new branch from selected GameContext         |
| `N`                  | Create new pathway at canvas center                 |
| `Arrow keys`         | Nudge selected node (1px)                           |
| `Shift + Arrow keys` | Nudge selected node (10px)                          |
| `Ctrl/Cmd + D`       | Duplicate selected node (deep clones preconditions) |
| `Ctrl/Cmd + A`       | Select all nodes                                    |

## Getting Started

### Prerequisites

- **Node.js 18+**
- **Neo4j Desktop** (v5.x) — [Download](https://neo4j.com/download/)
  - Create a DBMS with password `password` (or set `NEO4J_PASSWORD` in `.env.local`)
  - Start the database
  - Verify at http://localhost:7474

### Installation

```bash
npm install
```

### Development

```bash
# Start dev server (uses --webpack flag for Turbopack + Tailwind v4 compatibility)
npm run dev
```

Open http://localhost:3000

### Commands

```bash
# Run all tests
npm test

# Run a single test file
npx jest src/path/to/file.test.ts

# Run tests in watch mode
npm test -- --watch

# Lint
npm run lint
npm run lint:fix

# Type-check
npm run typecheck

# Build
npm run build

# Format code
npm run format

# E2E tests (requires dev server running)
npm run test:e2e
```

## Architecture

```
src/
  app/
    api/v1/           # REST API routes (GameContext, TechniqueAction, Pathways, Results, Terminals)
  components/canvas/  # React Flow graph components
    GraphCanvas.tsx   # Main canvas with DnD, connections, keyboard shortcuts
    GraphNode.tsx     # Custom node renderer with handles
    GraphEdge.tsx     # Custom edge renderer (Bezier, labels)
    SidebarPalette.tsx      # Draggable entity palette (GC, TA, TS)
    NodeContextMenu.tsx     # Right-click context menus
    KeyboardShortcutsModal.tsx  # ? overlay
    NodeDetailPanel.tsx     # Property inspector
  lib/
    neo4j/            # Neo4j driver + repositories + Cypher
    types/            # MAML entity types (nodes, edges, enums, validation)
    useGraphCreation.ts     # Pathway chain creation hooks
    useGraphPersistence.ts  # Backend sync with rollback
    useKeyboardShortcuts.ts # Keyboard shortcut hook
```

## MAML Data Schema

### Node: GameContext (Combat State)

- `position_name` — e.g. "Closed Guard Bottom"
- `relative_role` — `OFFENSIVE | DEFENSIVE | NEUTRAL | SYMMETRICAL_DANGER`
- `sidedness` — `LEFT | RIGHT | AMBIDEXTROUS`
- `danger_level` — 1–10
- `points_value` — 0, 2, 3, 4

### Node: TechniqueAction (Mechanical Operator)

- `action_name` — e.g. "Scissor Sweep"
- `action_type` — `SWEEP | SUBMISSION | ESCAPE | GUARD_PASS_PASS | POSTURE_ADJUST`
- `mechanical_preconditions` — Required grips/controls

### Edge: TacticalPathway (Conditional Gateway)

- `gateway_type` — `INTENT_DRIVEN | STIMULUS_DRIVEN`
- `trigger_condition` — Prerequisite stimulus description

### Node: TerminalSink (End State)

- `sink_type` — `SUBMISSION_SUCCESS | SUBMISSION_CONCEDED`

## Transitional Validation

All graph mutations enforce the **Universal Transitional Matrix** (9 permitted, 7 forbidden):

| #   | Transition    | Description            |
| --- | ------------- | ---------------------- |
| 1   | O → O         | Positional advancement |
| 2   | D → D         | Guard recovery         |
| 3   | O → D         | Attack fails           |
| 4   | D → O         | Counter-attack         |
| 5   | N → O         | Force opening          |
| 6   | N → D         | Concede ground         |
| 7   | D → N         | Escape to reset        |
| 8   | N → N / S → S | Neutral symmetry       |
| 9   | O/D → T       | Terminal (submission)  |

**Cardinal rule:** GameContext → GameContext direct edges forbidden. All paths flow:
`GameContext →[TacticalPathway]→ TechniqueAction →[ResultsIn]→ GameContext | TerminalSink`

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Graph:** React Flow
- **Database:** Neo4j (Bolt driver)
- **Styling:** Tailwind CSS v4
- **Testing:** Jest + React Testing Library + Playwright
- **Language:** TypeScript (strict mode)

## License

MIT
