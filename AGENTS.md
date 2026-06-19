# AGENTS.md — Project "Pathways"

Martial Arts Modelling Language (MAML) — Graph-native tactical analysis application.

## Project Status

| Phase | Focus                                        | Status         |
| ----- | -------------------------------------------- | -------------- |
| P1    | Sidebar palette + drag-to-create             | ✅ Complete    |
| P2    | Context menus + node operations              | ✅ Complete    |
| P3    | Handle-to-handle connections + validation    | ✅ Complete    |
| P4    | Keyboard shortcuts                           | ❌ Not started |
| P5    | Guided pathway filling + inline editing      | ❌ Not started |
| P6    | Half-pathway prevention + cascade delete     | ❌ Not started |
| P7    | UI polish (onboarding, loading, persistence) | ❌ Not started |

### UI Components Added

- **`SidebarPalette.tsx`** — Left sidebar with 3 draggable entity types (GameContext, TechniqueAction, TerminalSink). Uses HTML5 drag-and-drop with `application/reactflow` MIME type. Dispatch is handled by `createFromType` in the canvas.
- **`NodeContextMenu.tsx`** — Right-click context menu for nodes and canvas background. Exports `ContextMenuState` interface. Menu items differ by node type (GC → New Branch/Decision/Edit/Delete, TA → New Result/Edit/Delete, TS → Edit/Delete, canvas → New Pathway/Paste). Uses fixed positioning at click coordinates. Closes on outside click or Escape.
- **`GraphNode.tsx`** — Custom node renderer with visible connection handles (source at bottom for GC/TA, target at top for all). Handles styled as circular dots with color-coded borders matching node role/type.
- **`GraphEdge.tsx`** — Custom edge renderer with Bezier curves. `TACTICAL_PATHWAY` = solid, `RESULTS_IN` = dashed. Labels show `trigger_condition` (with ⚡ for STIMULUS_DRIVEN) or "Results In →". Labels are clickable for future inline editing.
- **`GraphCanvas.tsx`** — React Flow wrapper with DnD, context menus, and **handle-to-handle connections**. Implements `isValidConnection` for structural + transitional validation, `onConnect` with API persistence + rollback, and visual feedback (green/red connection line, handle glow).
- **`useGraphCreation.ts`** — Hook with 6 creation functions: `createFullPathway` (5-part GC→TP→TA→RI→GC|TS chain), `createTechniqueChain` (TA→RI→GC|TS), `createTerminalSink` (standalone), `createBranch` (from existing GC, validates transitions), `createResultFromTechnique` (from existing TA), `createFromType` (DnD dispatcher).
- **`lib/types/edges.ts`** — Added `ConnectionRule` type, `CONNECTION_RULES` registry, and `isValidStructuralConnection()` for declarative connection validation.
- **`transitional-validator.ts`** — Used client-side during connection drag and programmatically to enforce Universal Transitional Matrix (9 permitted, 7 forbidden transitions).

### Interaction Conventions

| Action                        | Behavior                                                |
| ----------------------------- | ------------------------------------------------------- |
| Right-click GameContext       | Opens menu: New Branch, New Decision, Edit, Delete      |
| Right-click TechniqueAction   | Opens menu: New Result, Edit, Delete                    |
| Right-click TerminalSink      | Opens menu: Edit, Delete                                |
| Right-click blank canvas      | Opens menu: New Pathway, Paste                          |
| Edit (menu)                   | Opens detail panel with node properties                 |
| Delete (menu)                 | Removes node + connected edges                          |
| Click outside menu            | Closes context menu                                     |
| Escape                        | Closes context menu                                     |
| Drag handle (source → target) | Creates edge with validation (green=valid, red=invalid) |
| Connect GC → TA               | Creates TACTICAL_PATHWAY edge                           |
| Connect TA → GC/TS            | Creates RESULTS_IN edge (validates transitional matrix) |
| Invalid connection attempt    | Shows error toast, edge rolled back on API failure      |

## Build / Lint / Test Commands

```bash
# Install dependencies
npm install

# Dev server (uses --webpack flag — required workaround for Turbopack + Tailwind
# CSS v4 crash on Windows: https://github.com/vercel/next.js/issues/90860)
npm run dev

# Neo4j Desktop (required — install from https://neo4j.com/download/)
# 1. Open Neo4j Desktop, create a DBMS with version 5.x
# 2. Set password to match .env.local (default: password)
# 3. Start the database
# 4. Verify connection at http://localhost:7474 (browser)

# Neo4j Browser: http://localhost:7474
# Neo4j Bolt: bolt://localhost:7687
# Default creds: neo4j / password (set in .env.local)

# Run all tests
npm test

# Run a single test file
npx jest src/path/to/file.test.ts
npx vitest run src/path/to/file.test.ts

# Run tests matching a pattern
npm test -- --testPathPattern="GameContext"
npx jest --testNamePattern="should reject invalid transition"

# Run tests in watch mode
npm test -- --watch

# Lint
npm run lint
npm run lint:fix

# Type-check
npm run typecheck
npx tsc --noEmit

# Build
npm run build

# Dev server (Next.js)
npm run dev

# Format code
npm run format
npx prettier --write .
```

## Project Architecture

```
src/
  app/                    # Next.js App Router
    api/                  # API route handlers
      v1/
        game-contexts/    # GameContext CRUD
        techniques/       # TechniqueAction CRUD
        pathways/         # TacticalPathway edge CRUD
        terminals/        # TerminalSink CRUD
        results/          # RESULTS_IN edge CRUD (P3)
        telemetry/        # Telemetry stub (future)
    (routes)/             # Page routes
  components/             # Reusable UI components
    canvas/               # Graph rendering (React Flow / SVG)
      SidebarPalette.tsx  # Draggable entity palette (P1)
      NodeContextMenu.tsx # Right-click context menus (P2)
      GraphCanvas.tsx     # React Flow wrapper with DnD + context menu + handle-to-handle connections (P3)
      GraphContext.tsx    # Central state management
      GraphNode.tsx       # Custom node renderer with visible handles
      GraphEdge.tsx       # Custom edge renderer with interactive labels
      NodeDetailPanel.tsx # Node property inspector
  lib/
    neo4j/                # Neo4j driver connection & session management
      driver.ts           # Singleton driver instance
      repositories/       # Type-safe repository classes
        game-context.repository.ts
        technique-action.repository.ts
        tactical-pathway.repository.ts
        terminal-sink.repository.ts
        results-in.repository.ts      # RESULTS_IN CRUD with transitional validation (P3)
        transitional-validator.ts     # Transitional Matrix enforcement
      cypher/             # Raw Cypher queries as constants/functions
    types/                # MAML entity type definitions
      nodes.ts            # GameContext, TechniqueAction, TerminalSink interfaces
      edges.ts            # TacticalPathway, ResultsIn, ConnectionRule interfaces (P3)
      enums.ts            # All enum types (relative_role, action_type, etc.)
      validation.ts       # Transitional Matrix types & constants
    useGraphCreation.ts   # Pathway chain creation hook (createFullPathway, createBranch, etc.)
    useGraphPersistence.ts # Backend sync for position/connect/delete with rollback (P3)
    useGraphLoader.ts     # Graph data loading from API
    useGraphUrlState.ts   # URL state sync for canvas viewport
    api-service.ts        # API fetch + transform
    seed-data.ts          # Demo data (20 nodes, 22 edges)
    utils/                # Pure utility functions
e2e/
  ux-overhaul.spec.ts     # P1+P2 e2e tests (12 scenarios)
  home.spec.ts            # Home page smoke tests
  persistence.spec.ts     # Graph persistence tests
  seed-data.spec.ts       # Seed data rendering tests
```

## MAML Data Schema

### Node: GameContext (The Combat State)

- `id: UUID` — Primary key
- `position_name: string` — e.g. "Closed Guard Bottom"
- `relative_role: RelativeRole` — `OFFENSIVE | DEFENSIVE | NEUTRAL | SYMMETRICAL_DANGER`
- `sidedness: Sidedness` — `LEFT | RIGHT | AMBIDEXTROUS`
- `danger_level: number` — 1–10
- `points_value: number` — 0, 2, 3, 4

### Node: TechniqueAction (The Mechanical Operator)

- `id: UUID`
- `action_name: string` — e.g. "Scissor Sweep"
- `action_type: ActionType` — `SWEEP | SUBMISSION | ESCAPE | GUARD_PASS | POSTURE_ADJUST`
- `mechanical_preconditions: string[]` — Required grips/controls

### Edge: TacticalPathway (The Conditional Gateway)

- `id: UUID`
- `gateway_type: GatewayType` — `INTENT_DRIVEN | STIMULUS_DRIVEN`
- `trigger_condition: string` — Prerequisite stimulus description
- `transition_probability: number` — Float (future analytics, default 0.0)
- `execution_counter: number` — Integer (future analytics, default 0)

### Node: TerminalSink (The End State)

- `id: UUID`
- `sink_type: SinkType` — `SUBMISSION_SUCCESS | SUBMISSION_CONCEDED`

## Transitional Validation Engine

The system **must reject** any graph mutation violating the Universal Transitional Matrix:

| #   | Transition    | Description                                   |
| --- | ------------- | --------------------------------------------- |
| 1   | O → O         | Positional advancement up dominance hierarchy |
| 2   | D → D         | Guard recovery or damage mitigation           |
| 3   | O → D         | Attack fails/intercepted, loss of initiative  |
| 4   | D → O         | Counter-attack, steal initiative              |
| 5   | N → O         | Force dominant opening from equal start       |
| 6   | N → D         | Concede ground from equal start               |
| 7   | D → N         | Escape to reset (clean slate)                 |
| 8   | N → N / S → S | Grip fighting, pummeling, neutral shootouts   |
| 9   | O/D → T       | Terminal sink (submission tap)                |

**Cardinal rule:** GameContext → GameContext direct edges are **forbidden**. All paths must flow:
`GameContext --[TacticalPathway]--> TechniqueAction --[result]--> GameContext | TerminalSink`

## Code Style Guidelines

### Imports

- ES module imports (`import` / `export`).
- Order: Node built-ins → external packages → `@/` internal modules → relative imports.
- Use `type` keyword for type-only imports: `import type { GameContext } from '@/lib/types/nodes'`.
- No barrel (`index.ts`) re-exports in `lib/` directories — explicit paths only.
- Absolute imports use `@/` alias mapping to `src/`.

### Formatting & Linting

- Single quotes, semicolons required.
- Trailing commas where valid (ES5+).
- 2-space indentation, 100-char line width.
- Format on save. Prettier for formatting, ESLint for logic rules.

### TypeScript & Types

- Strict mode: `strict: true` in `tsconfig.json`.
- **MAML entities**: `interface` for all object shapes. Export as named interfaces (no `I` prefix).
- **Unions & enums**: Use `type` for union types, `const` objects with `as const` for enum-like constants, or `enum` where serialization matters.
- `unknown` over `any`. `any` only as last resort with `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comment.
- Functions: explicitly type parameters and return values for repository/public API methods. Return type may be inferred for simple expressions.
- Use `readonly` for array parameters in function signatures: `items: readonly TechniqueAction[]`.

### Naming Conventions

- `PascalCase`: components, classes, interfaces, types, enums, repositories.
- `camelCase`: functions, methods, variables, properties, route handlers.
- `SCREAMING_SNAKE_CASE`: constants, env vars, Cypher query constants.
- `kebab-case`: file names (`game-context.repository.ts`, `tactical-pathway.route.ts`).
- Test files: `*.test.ts` adjacent to source file.
- Neo4j labels in PascalCase: `(:GameContext)`, `(:TechniqueAction)`.
- Neo4j relationship types in SCREAMING_SNAKE_CASE: `[:TACTICAL_PATHWAY]`, `[:RESULTS_IN]`.

### Neo4j Repository Pattern

```typescript
// One repository per entity, stateless methods, raw Cypher via typed driver
class GameContextRepository {
  constructor(private readonly driver: Driver) {}

  async findById(id: string): Promise<GameContext | null> { ... }

  async create(data: CreateGameContextInput): Promise<GameContext> {
    const session = this.driver.session({ database: 'neo4j' });
    try {
      const result = await session.run(
        CYPHER.CREATE_GAME_CONTEXT,
        { id: uuidv4(), ...data },
      );
      return mapToGameContext(result.records[0]);
    } finally {
      await session.close();
    }
  }
}
```

### Error Handling

- Repository methods throw typed `AppError` subclasses (not generic `Error`).
- Validation failures throw `TransitionValidationError` with message explaining which rule was violated.
- API routes wrap handlers in `try/catch`, returning structured `{ error: string, code: string }` JSON responses.
- Neo4j session management uses `try/finally` to guarantee `session.close()`.
- Use `Result<T, E>` pattern (discriminated union) for expected validation failures in the transitional validator.

### Component Conventions (React)

- Functional components only. No class components.
- Props typed with `interface` exported as `ComponentNameProps`.
- Destructure props at the parameter level: `({ node, onSelect }: GameContextNodeProps)`.
- Colored node rendering by role: Offensive = `#22c55e` (green), Defensive = `#ef4444` (red), Neutral = `#64748b` (slate), Symmetrical Danger = `#f59e0b` (amber).
- One component per file. Co-locate `.test.ts` files adjacent to the component.

### API Route Conventions (Next.js App Router)

```typescript
// src/app/api/v1/game-contexts/route.ts
export async function GET(request: NextRequest): Promise<NextResponse> { ... }
export async function POST(request: NextRequest): Promise<NextResponse> { ... }

// src/app/api/v1/game-contexts/[id]/route.ts
export async function GET(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> { ... }
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> { ... }
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> { ... }
```

### State Management

- **Server state**: No external query library — direct repository calls from API routes.
- **Client state**: React context for graph state (selected node, viewport). Local component state for UI interactions.
- **URL state**: Search params for canvas viewport and active node IDs (bookmarkable canvases).

### Testing

- Write tests for behavior and validation rules, not implementation.
- Use `describe`/`it` blocks, prefer `it` over `test`.
- Repository tests use an in-memory Neo4j test fixture or a dedicated test database container.
- Validation tests are pure logic tests — no database needed.
- Mock the Neo4j driver at the integration boundary for unit tests. Use a real Neo4j test instance for integration tests.
- Test transitional matrix rules exhaustively — every permitted and forbidden transition.
- `@testing-library/react` for component tests (query by role/text, never by test-id unless necessary).
- Component tests must use `@jest-environment jsdom` docblock as the **very first comment** (before eslint directives).
- Component tests use `@testing-library/jest-dom/jest-globals` (v6.x subpath import, not root).
- API route tests mock Neo4j repositories via `jest.mock()` with factory functions.
- All `require()` calls in test files need `// eslint-disable-next-line @typescript-eslint/no-require-imports`.

### Testing Gotchas

- **Docblock ordering**: `@jest-environment jsdom` must be the first block comment. A preceding `/* eslint-disable */` causes Jest's docblock parser to silently ignore the jsdom directive → `document is not defined`.
- **React Flow mocking**: Must use `__esModule: true` + `default` export for default imports, plus named exports (e.g., `Background`, `Controls`, `MiniMap`).
- **jest.fn() types**: `jest.fn().mockImplementation()` causes TS errors with typed destructured params. Fix: use `jest.fn((props: unknown) => { ... props as Record<string, unknown> })`.
- **Component props in tests**: Use `as any` on props spread to bypass strict `NodeProps`/`EdgeProps` types. Add `/* eslint-disable @typescript-eslint/no-explicit-any */` at file level.
- **Jest config**: `setupFilesAfterEnv` (not `setupFilesAfterSetup`) is the correct key for jest-dom setup.
- **`NotFoundError`** takes 2 args: `(entityType: string, id: string)`.
- **`@testing-library/jest-dom` v6.x**: Import from `@testing-library/jest-dom/jest-globals`, not root package.
- **`Node` import conflict**: In `NodeContextMenu.tsx`, `import type { Node } from "reactflow"` shadows the global DOM `Node` type needed by `contains()`. Use `import type { Node as FlowNode } from "reactflow"` and use `FlowNode` in the interface.
- **Right-click e2e with React Flow**: Playwright's `click({ button: "right", force: true })` often fails on React Flow nodes behind the sidebar palette or overlapped by UI banners. Use `page.evaluate()` to dispatch a native `contextmenu` event on the node's DOM element instead. See the `dispatchContextMenu` helper in `e2e/ux-overhaul.spec.ts`.
- **Context menu item clicks**: Fixed-position context menu items near viewport edges fail Playwright's actionability checks even with `force: true`. Use `.evaluate((el) => (el as HTMLButtonElement).click())` to click them.

### Testing Priorities (in order)

1. TransitionalValidator — all 9 permitted + all forbidden transitions
2. Repository CRUD — create, read, update, delete each entity type
3. API routes — request/response contracts, error codes, edge cases
4. Canvas UI — node rendering, edge labeling, color coding

### Playwright MCP UI Verification Mandate

Every feature development **must** be verified with Playwright end-to-end tests before
commit. This includes:

- **New components** — Verify rendering, interactivity, and edge states via Playwright.
- **New API routes or data flows** — Verify the full request/response cycle through the
  UI (not just via curl/unit tests).
- **Layout changes** — Verify visual rendering across viewports.
- **Seed/ demo data changes** — Verify all seed entities render correctly on the canvas.

Run e2e tests with:

```bash
npm run test:e2e
```

Playwright MCP server is available (`@playwright/mcp` in devDependencies) for
AI-assisted browser interaction during development. Use it to verify UI behavior
without manually inspecting the browser.

### Commits

- Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.
- Keep commits atomic and focused (one concern per commit).
- Use present tense imperative: "Add GameContext CRUD repository" not "Added".
- Prefix with MAML domain area when relevant: `feat(maml): enforce transitional validation rules`.
