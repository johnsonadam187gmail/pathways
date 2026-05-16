// Shared test utilities for API route and component tests
import { jest } from "@jest/globals";
import type {
  GameContext,
  TechniqueAction,
  TerminalSink,
} from "@/lib/types/nodes";
import type { TacticalPathway } from "@/lib/types/edges";
import {
  RelativeRole,
  Sidedness,
  ActionType,
  GatewayType,
  SinkType,
} from "@/lib/types/enums";

// ── Mock data factories ───────────────────────────────────────────────────────

export function createMockGameContext(
  overrides: Partial<GameContext> = {},
): GameContext {
  return {
    id: "mock-gc-id",
    position_name: "Mock Position",
    relative_role: RelativeRole.NEUTRAL,
    sidedness: Sidedness.AMBIDEXTROUS,
    danger_level: 1,
    points_value: 0,
    ...overrides,
  };
}

export function createMockTechniqueAction(
  overrides: Partial<TechniqueAction> = {},
): TechniqueAction {
  return {
    id: "mock-ta-id",
    action_name: "Mock Technique",
    action_type: ActionType.SWEEP,
    mechanical_preconditions: [],
    ...overrides,
  };
}

export function createMockTacticalPathway(
  overrides: Partial<TacticalPathway> = {},
): TacticalPathway {
  return {
    id: "mock-tp-id",
    gateway_type: GatewayType.INTENT_DRIVEN,
    trigger_condition: "mock trigger",
    transition_probability: 0.0,
    execution_counter: 0,
    ...overrides,
  };
}

export function createMockTerminalSink(
  overrides: Partial<TerminalSink> = {},
): TerminalSink {
  return {
    id: "mock-ts-id",
    sink_type: SinkType.SUBMISSION_SUCCESS,
    ...overrides,
  };
}

// ── Mock repository factory ───────────────────────────────────────────────────

type MockRepository<T> = {
  [K in keyof T]: jest.Mock;
};

export function createMockRepo<T extends object>(): MockRepository<T> {
  return new Proxy({} as MockRepository<T>, {
    get: (_target, prop) => {
      if (!(prop in _target)) {
        (_target as Record<string, jest.Mock>)[prop as string] = jest.fn();
      }
      return (_target as Record<string, jest.Mock>)[prop as string];
    },
  });
}

// ── Mock NextRequest factory ──────────────────────────────────────────────────

export function createMockRequest(
  body?: Record<string, unknown>,
  overrides: Partial<RequestInit> = {},
): Request {
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...overrides,
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new Request("http://localhost:3000", init);
}
