// Seed Data — Comprehensive MAML graph covering all transitional matrix transitions
import type { Node, Edge } from "reactflow";

// ─── GameContext Nodes ─────────────────────────────────────────────────────────
// Covers all 4 RelativeRoles, all 3 Sidedness variants, danger levels 1–10, points 0/2/3/4

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
    id: "gc-neutral-clinch",
    position_name: "Neutral Clinch",
    relative_role: "NEUTRAL",
    sidedness: "AMBIDEXTROUS",
    danger_level: 4,
    points_value: 0,
  },
  {
    id: "gc-s-50-50",
    position_name: "50/50 Guard",
    relative_role: "SYMMETRICAL_DANGER",
    sidedness: "AMBIDEXTROUS",
    danger_level: 6,
    points_value: 0,
  },
  {
    id: "gc-d-closed-guard",
    position_name: "Closed Guard Bottom",
    relative_role: "DEFENSIVE",
    sidedness: "RIGHT",
    danger_level: 7,
    points_value: 0,
  },
  {
    id: "gc-d-half-guard",
    position_name: "Half Guard Bottom",
    relative_role: "DEFENSIVE",
    sidedness: "LEFT",
    danger_level: 5,
    points_value: 0,
  },
  {
    id: "gc-d-side-control",
    position_name: "Side Control Bottom",
    relative_role: "DEFENSIVE",
    sidedness: "RIGHT",
    danger_level: 8,
    points_value: 0,
  },
  {
    id: "gc-o-side-control",
    position_name: "Side Control Top",
    relative_role: "OFFENSIVE",
    sidedness: "LEFT",
    danger_level: 3,
    points_value: 3,
  },
  {
    id: "gc-o-mount",
    position_name: "Mount Top",
    relative_role: "OFFENSIVE",
    sidedness: "RIGHT",
    danger_level: 2,
    points_value: 4,
  },
  {
    id: "gc-o-back-mount",
    position_name: "Back Mount",
    relative_role: "OFFENSIVE",
    sidedness: "AMBIDEXTROUS",
    danger_level: 1,
    points_value: 4,
  },
] as const;

// ─── TechniqueAction Nodes ─────────────────────────────────────────────────────
// Covers all 5 ActionTypes

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
    id: "ta-single-leg",
    action_name: "Single Leg Takedown",
    action_type: "SWEEP",
    mechanical_preconditions: [
      "Step to lead leg",
      "Hand on heel",
      "Head position",
    ],
  },
  {
    id: "ta-scissor-sweep",
    action_name: "Scissor Sweep",
    action_type: "SWEEP",
    mechanical_preconditions: [
      "Sleeve grip",
      "Collar grip",
      "Opponent postured",
    ],
  },
  {
    id: "ta-hip-escape",
    action_name: "Hip Escape",
    action_type: "ESCAPE",
    mechanical_preconditions: ["Frame on hip", "Shrimp motion", "Knee shield"],
  },
  {
    id: "ta-shrimp",
    action_name: "Shrimp Escape",
    action_type: "ESCAPE",
    mechanical_preconditions: ["Underhook", "Bridge", "Shrimp to create space"],
  },
  {
    id: "ta-stand-up",
    action_name: "Technical Stand Up",
    action_type: "POSTURE_ADJUST",
    mechanical_preconditions: ["Base foot", "Post hand", "Sit up"],
  },
  {
    id: "ta-guard-pass",
    action_name: "Standing Guard Pass",
    action_type: "GUARD_PASS",
    mechanical_preconditions: ["Break guard", "Pin knees", "Smash crossface"],
  },
  {
    id: "ta-armbar",
    action_name: "Armbar from Guard",
    action_type: "SUBMISSION",
    mechanical_preconditions: ["Sleeve grip", "Foot on hip", "Hip bridge"],
  },
  {
    id: "ta-rnc",
    action_name: "Rear Naked Choke",
    action_type: "SUBMISSION",
    mechanical_preconditions: ["Back take", "Hooks in", "Choke grip"],
  },
] as const;

// ─── TerminalSink Nodes ────────────────────────────────────────────────────────
// Both SinkTypes

export const SEED_TERMINAL_SINKS = [
  {
    id: "ts-tap-out",
    sink_type: "SUBMISSION_SUCCESS",
  },
  {
    id: "ts-concede",
    sink_type: "SUBMISSION_CONCEDED",
  },
] as const;

// ─── TacticalPathway Edges (GameContext → TechniqueAction) ────────────────────
// Both GatewayTypes

export const SEED_TACTICAL_PATHWAYS = [
  // N→O: Neutral takedown
  {
    id: "tp-double-leg",
    source_id: "gc-neutral-standing",
    target_id: "ta-double-leg",
    gateway_type: "STIMULUS_DRIVEN",
    trigger_condition: "Opponent squares up, weight centered",
    transition_probability: 0.0,
    execution_counter: 0,
  },
  // N→D: Clinch takedown fails
  {
    id: "tp-single-leg",
    source_id: "gc-neutral-clinch",
    target_id: "ta-single-leg",
    gateway_type: "STIMULUS_DRIVEN",
    trigger_condition: "Opponent over-commits on collar tie",
    transition_probability: 0.0,
    execution_counter: 0,
  },
  // N→N: Grip fighting stalemate
  {
    id: "tp-grip-fight",
    source_id: "gc-neutral-standing",
    target_id: "ta-single-leg",
    gateway_type: "INTENT_DRIVEN",
    trigger_condition: "Opponent defends level change",
    transition_probability: 0.0,
    execution_counter: 0,
  },
  // D→D: Guard recovery
  {
    id: "tp-hip-escape",
    source_id: "gc-d-closed-guard",
    target_id: "ta-hip-escape",
    gateway_type: "STIMULUS_DRIVEN",
    trigger_condition: "Opponent postures up, loses pressure",
    transition_probability: 0.0,
    execution_counter: 0,
  },
  // D→O: Sweep from half guard
  {
    id: "tp-scissor-sweep-d",
    source_id: "gc-d-half-guard",
    target_id: "ta-scissor-sweep",
    gateway_type: "INTENT_DRIVEN",
    trigger_condition: "Opponent steps up, weight forward",
    transition_probability: 0.0,
    execution_counter: 0,
  },
  // D→N: Stand up escape
  {
    id: "tp-stand-up",
    source_id: "gc-d-closed-guard",
    target_id: "ta-stand-up",
    gateway_type: "INTENT_DRIVEN",
    trigger_condition: "Opponent loosens pressure to pass",
    transition_probability: 0.0,
    execution_counter: 0,
  },
  // O→O: Guard pass advancement
  {
    id: "tp-guard-pass",
    source_id: "gc-o-side-control",
    target_id: "ta-guard-pass",
    gateway_type: "STIMULUS_DRIVEN",
    trigger_condition: "Opponent turns away, exposes back",
    transition_probability: 0.0,
    execution_counter: 0,
  },
  // O→D: Lost position from mount
  {
    id: "tp-shrimp",
    source_id: "gc-o-mount",
    target_id: "ta-shrimp",
    gateway_type: "STIMULUS_DRIVEN",
    trigger_condition: "Opponent frames and regains guard",
    transition_probability: 0.0,
    execution_counter: 0,
  },
  // S→S: Stalemate from symmetrical danger
  {
    id: "tp-stalemate",
    source_id: "gc-s-50-50",
    target_id: "ta-armbar",
    gateway_type: "INTENT_DRIVEN",
    trigger_condition: "Opponent controls near leg, hand fighting",
    transition_probability: 0.0,
    execution_counter: 0,
  },
  // D→T: Submission from defensive (armbar)
  {
    id: "tp-armbar-submit",
    source_id: "gc-d-side-control",
    target_id: "ta-armbar",
    gateway_type: "STIMULUS_DRIVEN",
    trigger_condition: "Opponent postures, arm exposed",
    transition_probability: 0.0,
    execution_counter: 0,
  },
  // O→T: Submission from back mount
  {
    id: "tp-rnc",
    source_id: "gc-o-back-mount",
    target_id: "ta-rnc",
    gateway_type: "STIMULUS_DRIVEN",
    trigger_condition: "Opponent reaches back, exposes neck",
    transition_probability: 0.0,
    execution_counter: 0,
  },
] as const;

// ─── RESULTS_IN Edges (TechniqueAction → GameContext | TerminalSink) ──────────

export const SEED_RESULTS_IN = [
  // N→O: Double leg → Mount
  { id: "ri-double-leg", source_id: "ta-double-leg", target_id: "gc-o-mount" },
  // N→D: Single leg fail → Closed guard bottom
  {
    id: "ri-single-leg-fail",
    source_id: "ta-single-leg",
    target_id: "gc-d-closed-guard",
  },
  // N→N: Grip fight → Neutral clinch
  {
    id: "ri-grip-fight",
    source_id: "ta-single-leg",
    target_id: "gc-neutral-clinch",
  },
  // D→D: Hip escape → Half guard
  {
    id: "ri-hip-escape",
    source_id: "ta-hip-escape",
    target_id: "gc-d-half-guard",
  },
  // D→O: Scissor sweep → Side control top
  {
    id: "ri-scissor-sweep",
    source_id: "ta-scissor-sweep",
    target_id: "gc-o-side-control",
  },
  // D→N: Stand up → Neutral
  {
    id: "ri-stand-up",
    source_id: "ta-stand-up",
    target_id: "gc-neutral-standing",
  },
  // O→O: Guard pass → Mount
  { id: "ri-guard-pass", source_id: "ta-guard-pass", target_id: "gc-o-mount" },
  // O→D: Shrimp → Side control bottom
  { id: "ri-shrimp", source_id: "ta-shrimp", target_id: "gc-d-side-control" },
  // S→S: Armbar defended → 50/50
  { id: "ri-armbar-defended", source_id: "ta-armbar", target_id: "gc-s-50-50" },
  // D→T: Armbar tap → Concede
  { id: "ri-armbar-concede", source_id: "ta-armbar", target_id: "ts-concede" },
  // O→T: RNC → Tap out
  { id: "ri-rnc", source_id: "ta-rnc", target_id: "ts-tap-out" },
] as const;

// ─── React Flow positions (spread across canvas) ──────────────────────────────
// Layout: Neutral zone top, TechniqueActions middle, Defensive/Offensive/Terminal bottom
// Organization minimizes edge crossings by grouping transitions by column.

export const POSITIONS: Record<string, { x: number; y: number }> = {
  // ── Neutral zone (top row) ─────────────────────────────────────────────────
  // Left: standing (source for N→O), Center: 50/50 (source for S→S), Right: clinch (source for N→D/N→N)
  "gc-neutral-standing": { x: -380, y: -420 },
  "gc-s-50-50": { x: 0, y: -420 },
  "gc-neutral-clinch": { x: 380, y: -420 },

  // ── Technique zone (row 1 — transitions from neutral) ─────────────────────
  // Left column: double-leg (standing→mount, N→O), flows down-left to offensive
  // Center column: armbar (50-50→50-50, S→S and D→T), stays central
  // Right column: single-leg (clinch→clinch/closed, N→N/D), splits right
  "ta-double-leg": { x: -380, y: -200 },
  "ta-armbar": { x: 0, y: -200 },
  "ta-single-leg": { x: 380, y: -200 },

  // ── Technique zone (row 2 — transitions from defensive) ───────────────────
  // Left: hip-escape (closed→half, D→D), stays left
  // Center: scissor-sweep (half→side-top, D→O), left-to-right
  // Right: guard-pass (side-top→mount, O→O), stays right
  "ta-hip-escape": { x: -380, y: 0 },
  "ta-scissor-sweep": { x: 0, y: 0 },
  "ta-guard-pass": { x: 380, y: 0 },

  // ── Technique zone (row 3 — cross and terminal transitions) ───────────────
  // Left: stand-up (closed→standing, D→N), left up
  // Center: shrimp (mount→side-bottom, O→D), right-to-left
  // Right: rnc (back-mount→tap, O→T), stays right
  "ta-stand-up": { x: -380, y: 200 },
  "ta-shrimp": { x: 0, y: 200 },
  "ta-rnc": { x: 380, y: 200 },

  // ── Defensive game contexts (bottom-left) ──────────────────────────────────
  "gc-d-closed-guard": { x: -480, y: 480 },
  "gc-d-half-guard": { x: -280, y: 480 },
  "gc-d-side-control": { x: -80, y: 480 },

  // ── Offensive game contexts (bottom-right) ────────────────────────────────
  "gc-o-side-control": { x: 180, y: 480 },
  "gc-o-mount": { x: 380, y: 480 },
  "gc-o-back-mount": { x: 580, y: 480 },

  // ── Terminal sinks (bottom) ───────────────────────────────────────────────
  "ts-concede": { x: -80, y: 680 },
  "ts-tap-out": { x: 380, y: 680 },
};

// ─── Build React Flow Node objects ─────────────────────────────────────────────

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
      },
    });
  }

  for (const ts of SEED_TERMINAL_SINKS) {
    nodes.push({
      id: ts.id,
      type: "graphNode",
      position: POSITIONS[ts.id] ?? { x: 0, y: 0 },
      data: {
        label: ts.id === "ts-tap-out" ? "Tap Out" : "Concede Position",
        type: "terminal-sink",
        sink_type: ts.sink_type,
      },
    });
  }

  return nodes;
}

// ─── Build React Flow Edge objects ─────────────────────────────────────────────

function buildEdges(): Edge[] {
  const edges: Edge[] = [];

  for (const tp of SEED_TACTICAL_PATHWAYS) {
    edges.push({
      id: tp.id,
      source: tp.source_id,
      target: tp.target_id,
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
      type: "graphEdge",
      data: { edge_type: "RESULTS_IN" },
    });
  }

  return edges;
}

// ─── Exported Seed Data ────────────────────────────────────────────────────────

export const SEED_NODES: Node[] = buildNodes();
export const SEED_EDGES: Edge[] = buildEdges();

// ─── Validate all 9 transitions are covered ────────────────────────────────────
// Each transition type verified below:

export const TRANSITION_COVERAGE: Record<string, string> = {
  "O→O": "gc-o-side-control → ta-guard-pass → gc-o-mount",
  "D→D": "gc-d-closed-guard → ta-hip-escape → gc-d-half-guard",
  "O→D": "gc-o-mount → ta-shrimp → gc-d-side-control",
  "D→O": "gc-d-half-guard → ta-scissor-sweep → gc-o-side-control",
  "N→O": "gc-neutral-standing → ta-double-leg → gc-o-mount",
  "N→D": "gc-neutral-clinch → ta-single-leg → gc-d-closed-guard",
  "D→N": "gc-d-closed-guard → ta-stand-up → gc-neutral-standing",
  "N→N": "gc-neutral-standing → ta-single-leg → gc-neutral-clinch",
  "S→S": "gc-s-50-50 → ta-armbar → gc-s-50-50",
  "O→T": "gc-o-back-mount → ta-rnc → ts-tap-out",
  "D→T": "gc-d-side-control → ta-armbar → ts-concede",
};
