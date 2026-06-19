// Seed Data — Single MAML pathway with all node types + multiple reactions
import type { Node, Edge } from "reactflow";

export const SEED_GAME_CONTEXTS = [
  {
    id: "gc-neutral-standing",
    position_name: "Neutral Standing",
    relative_role: "NEUTRAL",
    sidedness: "AMBIDEXTROUS",
    danger_level: 3,
    points_value: 0,
  },
  {
    id: "gc-side-control-top",
    position_name: "Side Control Top",
    relative_role: "OFFENSIVE",
    sidedness: "LEFT",
    danger_level: 3,
    points_value: 3,
  },
  {
    id: "gc-closed-guard-bottom",
    position_name: "Closed Guard Bottom",
    relative_role: "DEFENSIVE",
    sidedness: "RIGHT",
    danger_level: 7,
    points_value: 0,
  },
] as const;

export const SEED_TECHNIQUE_ACTIONS = [
  {
    id: "ta-double-leg",
    action_name: "Double Leg Takedown",
    action_type: "SWEEP",
    mechanical_preconditions: [
      "Level drop",
      "Head inside",
      "Drive through hips",
    ],
  },
  {
    id: "ta-armbar-mount",
    action_name: "Armbar from Mount",
    action_type: "SUBMISSION",
    mechanical_preconditions: ["Sleeve grip", "Foot on hip", "Hip bridge"],
  },
] as const;

export const SEED_TERMINAL_SINKS = [
  {
    id: "ts-tap-out",
    sink_type: "SUBMISSION_SUCCESS",
  },
] as const;

export const SEED_TACTICAL_PATHWAYS = [
  // N→O: Neutral → takedown
  {
    id: "tp-double-leg",
    source_id: "gc-neutral-standing",
    target_id: "ta-double-leg",
    gateway_type: "STIMULUS_DRIVEN",
    trigger_condition: "Opponent squares up, weight centered",
    transition_probability: 0.0,
    execution_counter: 0,
  },
  // O→O: Side control → submission attempt
  {
    id: "tp-armbar-mount",
    source_id: "gc-side-control-top",
    target_id: "ta-armbar-mount",
    gateway_type: "INTENT_DRIVEN",
    trigger_condition: "Opponent posts arm, exposed elbow",
    transition_probability: 0.0,
    execution_counter: 0,
  },
] as const;

export const SEED_RESULTS_IN = [
  // Reaction 1: Successful takedown → offensive position
  {
    id: "ri-takedown-success",
    source_id: "ta-double-leg",
    target_id: "gc-side-control-top",
  },
  // Reaction 2: Countered takedown → defensive position
  {
    id: "ri-takedown-countered",
    source_id: "ta-double-leg",
    target_id: "gc-closed-guard-bottom",
  },
  // Terminal: Submission → tap out
  {
    id: "ri-armbar-tap",
    source_id: "ta-armbar-mount",
    target_id: "ts-tap-out",
  },
] as const;

export const POSITIONS: Record<string, { x: number; y: number }> = {
  "gc-neutral-standing": { x: -300, y: -300 },

  "ta-double-leg": { x: 0, y: -200 },

  "gc-side-control-top": { x: -200, y: 50 },
  "gc-closed-guard-bottom": { x: 200, y: 50 },

  "ta-armbar-mount": { x: -200, y: 300 },

  "ts-tap-out": { x: -200, y: 550 },
};

function buildNodes(): Node[] {
  const nodes: Node[] = [];

  for (const gc of SEED_GAME_CONTEXTS) {
    nodes.push({
      id: gc.id,
      type: "graphNode",
      position: POSITIONS[gc.id] ?? { x: 0, y: 0 },
      data: {
        label: gc.position_name,
        type: "game-context",
        relative_role: gc.relative_role,
        sidedness: gc.sidedness,
        danger_level: gc.danger_level,
        points_value: gc.points_value,
        subtitle: `Danger: ${gc.danger_level} | Pts: ${gc.points_value}`,
      },
    });
  }

  for (const ta of SEED_TECHNIQUE_ACTIONS) {
    nodes.push({
      id: ta.id,
      type: "graphNode",
      position: POSITIONS[ta.id] ?? { x: 0, y: 0 },
      data: {
        label: ta.action_name,
        type: "technique-action",
        action_type: ta.action_type,
        mechanical_preconditions: ta.mechanical_preconditions,
      },
    });
  }

  for (const ts of SEED_TERMINAL_SINKS) {
    nodes.push({
      id: ts.id,
      type: "graphNode",
      position: POSITIONS[ts.id] ?? { x: 0, y: 0 },
      data: {
        label: "Tap Out",
        type: "terminal-sink",
        sink_type: ts.sink_type,
      },
    });
  }

  return nodes;
}

function buildEdges(): Edge[] {
  const edges: Edge[] = [];

  for (const tp of SEED_TACTICAL_PATHWAYS) {
    edges.push({
      id: tp.id,
      source: tp.source_id,
      target: tp.target_id,
      sourceHandle: "source",
      targetHandle: "target",
      type: "graphEdge",
      data: {
        edge_type: "TACTICAL_PATHWAY",
        trigger_condition: tp.trigger_condition,
        gateway_type: tp.gateway_type,
      },
    });
  }

  for (const ri of SEED_RESULTS_IN) {
    edges.push({
      id: ri.id,
      source: ri.source_id,
      target: ri.target_id,
      sourceHandle: "source",
      targetHandle: "target",
      type: "graphEdge",
      data: { edge_type: "RESULTS_IN" },
    });
  }

  return edges;
}

export const SEED_NODES: Node[] = buildNodes();
export const SEED_EDGES: Edge[] = buildEdges();
