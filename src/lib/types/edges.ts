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
