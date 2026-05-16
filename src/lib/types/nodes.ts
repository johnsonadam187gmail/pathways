// MAML Node Type Definitions
import type { RelativeRole, Sidedness, ActionType, SinkType } from "./enums";

// ─── GameContext (The Combat State) ────────────────────────────────────────────
export interface GameContext {
  id: string;
  position_name: string;
  relative_role: RelativeRole;
  sidedness: Sidedness;
  danger_level: number; // 1–10
  points_value: number; // 0, 2, 3, 4
}

export type CreateGameContextInput = Omit<GameContext, "id">;
export type UpdateGameContextInput = Partial<CreateGameContextInput>;

// ─── TechniqueAction (The Mechanical Operator) ─────────────────────────────────
export interface TechniqueAction {
  id: string;
  action_name: string;
  action_type: ActionType;
  mechanical_preconditions: string[];
}

export type CreateTechniqueActionInput = Omit<TechniqueAction, "id">;
export type UpdateTechniqueActionInput = Partial<CreateTechniqueActionInput>;

// ─── TerminalSink (The End State) ─────────────────────────────────────────────
export interface TerminalSink {
  id: string;
  sink_type: SinkType;
}

export type CreateTerminalSinkInput = Omit<TerminalSink, "id">;
export type UpdateTerminalSinkInput = Partial<CreateTerminalSinkInput>;
