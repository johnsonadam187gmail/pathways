// MAML Edge Type Definitions
import type { GatewayType } from "./enums";

// ─── TacticalPathway (The Conditional Gateway) ────────────────────────────────
export interface TacticalPathway {
  id: string;
  gateway_type: GatewayType;
  trigger_condition: string;
  transition_probability: number; // Float (future analytics, default 0.0)
  execution_counter: number; // Integer (future analytics, default 0)
}

export type CreateTacticalPathwayInput = Omit<TacticalPathway, "id"> & {
  source_game_context_id: string;
  target_technique_action_id: string;
};

export type UpdateTacticalPathwayInput = Partial<CreateTacticalPathwayInput>;

// ─── ResultsIn (TechniqueAction → GameContext | TerminalSink) ──────────────────
export interface ResultsIn {
  id: string;
  source_id: string;
  target_id: string;
  target_labels?: string[];
}

export type CreateResultsInInput = {
  technique_id: string;
  target_id: string;
};

// ─── Connection Rules (P3: Handle-to-Handle Validation) ──────────────────────
export type NodeType = "game-context" | "technique-action" | "terminal-sink";
export type EdgeType = "TACTICAL_PATHWAY" | "RESULTS_IN";

export interface ConnectionRule {
  sourceNodeType: NodeType;
  sourceHandleId: string;
  targetNodeType: NodeType;
  targetHandleId: string;
  edgeType: EdgeType;
  requiresValidation: boolean;
}

export const CONNECTION_RULES: readonly ConnectionRule[] = [
  {
    sourceNodeType: "game-context",
    sourceHandleId: "source",
    targetNodeType: "technique-action",
    targetHandleId: "target",
    edgeType: "TACTICAL_PATHWAY",
    requiresValidation: false,
  },
  {
    sourceNodeType: "technique-action",
    sourceHandleId: "source",
    targetNodeType: "game-context",
    targetHandleId: "target",
    edgeType: "RESULTS_IN",
    requiresValidation: true,
  },
  {
    sourceNodeType: "technique-action",
    sourceHandleId: "source",
    targetNodeType: "terminal-sink",
    targetHandleId: "target",
    edgeType: "RESULTS_IN",
    requiresValidation: false,
  },
] as const;

export function getConnectionRule(
  sourceType: NodeType,
  targetType: NodeType,
): ConnectionRule | undefined {
  return CONNECTION_RULES.find(
    (r) => r.sourceNodeType === sourceType && r.targetNodeType === targetType,
  );
}

export function isValidStructuralConnection(
  sourceType: NodeType,
  targetType: NodeType,
): boolean {
  return getConnectionRule(sourceType, targetType) !== undefined;
}
