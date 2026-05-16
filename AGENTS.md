# AGENTS.md — Project "Pathways"

Martial Arts Modelling Language (MAML) — Graph-native tactical analysis application.

## Build / Lint / Test Commands

```bash
# Install dependencies
npm install

# Start local Neo4j (Docker required)
docker compose up -d

# Stop Neo4j
docker compose down

# View Neo4j logs
docker compose logs -f

# Neo4j Browser (open in browser): http://localhost:7474
# Neo4j Bolt: bolt://localhost:7687
# Default creds: neo4j / password (set in docker-compose.yml)

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
        telemetry/        # Telemetry stub (future)
    (routes)/             # Page routes
  components/             # Reusable UI components
    canvas/               # Graph rendering (React Flow / SVG)
  lib/
    neo4j/                # Neo4j driver connection & session management
      driver.ts           # Singleton driver instance
      repositories/       # Type-safe repository classes
        game-context.repository.ts
        technique-action.repository.ts
        tactical-pathway.repository.ts
        terminal-sink.repository.ts
        transitional-validator.ts  # Transitional Matrix enforcement
      cypher/             # Raw Cypher queries as constants/functions
    types/                # MAML entity type definitions
      nodes.ts            # GameContext, TechniqueAction, TerminalSink interfaces
      edges.ts            # TacticalPathway interface
      enums.ts            # All enum types (relative_role, action_type, etc.)
      validation.ts       # Transitional Matrix types & constants
    utils/                # Pure utility functions
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

| # | Transition | Description |
|---|-----------|-------------|
| 1 | O → O | Positional advancement up dominance hierarchy |
| 2 | D → D | Guard recovery or damage mitigation |
| 3 | O → D | Attack fails/intercepted, loss of initiative |
| 4 | D → O | Counter-attack, steal initiative |
| 5 | N → O | Force dominant opening from equal start |
| 6 | N → D | Concede ground from equal start |
| 7 | D → N | Escape to reset (clean slate) |
| 8 | N → N / S → S | Grip fighting, pummeling, neutral shootouts |
| 9 | O/D → T | Terminal sink (submission tap) |

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

### Testing Priorities (in order)
1. TransitionalValidator — all 9 permitted + all forbidden transitions
2. Repository CRUD — create, read, update, delete each entity type
3. API routes — request/response contracts, error codes, edge cases
4. Canvas UI — node rendering, edge labeling, color coding

### Commits
- Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.
- Keep commits atomic and focused (one concern per commit).
- Use present tense imperative: "Add GameContext CRUD repository" not "Added".
- Prefix with MAML domain area when relevant: `feat(maml): enforce transitional validation rules`.
