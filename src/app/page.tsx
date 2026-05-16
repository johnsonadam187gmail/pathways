// Main Canvas Page — MAML Tactical Graph Viewer
"use client";

import type { Node, Edge } from "reactflow";
import GraphCanvas from "@/components/canvas/GraphCanvas";

// Demo seed data — removed when Neo4j connection is live
const DEMO_NODES: Node[] = [
  // ── GameContexts ────────────────────────────────────────────────────────────
  {
    id: "gc-closed-guard",
    type: "graphNode",
    position: { x: 0, y: 0 },
    data: {
      label: "Closed Guard Bottom",
      type: "game-context",
      relative_role: "DEFENSIVE",
      subtitle: "Danger: 7",
    },
  },
  {
    id: "gc-half-guard",
    type: "graphNode",
    position: { x: -200, y: 400 },
    data: {
      label: "Half Guard Bottom",
      type: "game-context",
      relative_role: "DEFENSIVE",
      subtitle: "Danger: 5",
    },
  },
  {
    id: "gc-mount",
    type: "graphNode",
    position: { x: 200, y: 400 },
    data: {
      label: "Mount",
      type: "game-context",
      relative_role: "OFFENSIVE",
      subtitle: "Danger: 3",
    },
  },

  // ── TechniqueActions ────────────────────────────────────────────────────────
  {
    id: "ta-hip-escape",
    type: "graphNode",
    position: { x: -200, y: 200 },
    data: {
      label: "Hip Escape",
      type: "technique-action",
      action_type: "ESCAPE",
    },
  },
  {
    id: "ta-scissor-sweep",
    type: "graphNode",
    position: { x: 200, y: 200 },
    data: {
      label: "Scissor Sweep",
      type: "technique-action",
      action_type: "SWEEP",
    },
  },
  {
    id: "ta-rnc",
    type: "graphNode",
    position: { x: 200, y: 600 },
    data: {
      label: "Rear Naked Choke",
      type: "technique-action",
      action_type: "SUBMISSION",
    },
  },

  // ── TerminalSinks ───────────────────────────────────────────────────────────
  {
    id: "ts-tap",
    type: "graphNode",
    position: { x: 200, y: 800 },
    data: {
      label: "Tap Out",
      type: "terminal-sink",
      sink_type: "SUBMISSION_SUCCESS",
    },
  },
];

const DEMO_EDGES: Edge[] = [
  // ── TACTICAL_PATHWAY: GameContext → TechniqueAction ─────────────────────────
  {
    id: "tp-hip-escape",
    source: "gc-closed-guard",
    target: "ta-hip-escape",
    type: "graphEdge",
    data: {
      edge_type: "TACTICAL_PATHWAY",
      trigger_condition: "Opponent postures up, losing pressure",
      gateway_type: "STIMULUS_DRIVEN",
    },
  },
  {
    id: "tp-scissor-sweep",
    source: "gc-closed-guard",
    target: "ta-scissor-sweep",
    type: "graphEdge",
    data: {
      edge_type: "TACTICAL_PATHWAY",
      trigger_condition: "Opponent over-commits weight forward",
      gateway_type: "STIMULUS_DRIVEN",
    },
  },
  {
    id: "tp-rnc",
    source: "gc-mount",
    target: "ta-rnc",
    type: "graphEdge",
    data: {
      edge_type: "TACTICAL_PATHWAY",
      trigger_condition: "Opponent turns away, exposing back",
      gateway_type: "STIMULUS_DRIVEN",
    },
  },

  // ── RESULTS_IN: TechniqueAction → GameContext | TerminalSink ────────────────
  {
    id: "ri-hip-escape",
    source: "ta-hip-escape",
    target: "gc-half-guard",
    type: "graphEdge",
    data: {
      edge_type: "RESULTS_IN",
    },
  },
  {
    id: "ri-scissor-sweep",
    source: "ta-scissor-sweep",
    target: "gc-mount",
    type: "graphEdge",
    data: {
      edge_type: "RESULTS_IN",
    },
  },
  {
    id: "ri-rnc",
    source: "ta-rnc",
    target: "ts-tap",
    type: "graphEdge",
    data: {
      edge_type: "RESULTS_IN",
    },
  },
];

export default function Home() {
  return (
    <div className="h-screen w-screen">
      {/* Header bar */}
      <header className="absolute left-0 right-0 top-0 z-10 flex h-12 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-sm">
        <h1 className="text-sm font-bold uppercase tracking-wider text-gray-800">
          Pathways
          <span className="ml-2 font-normal text-gray-400">
            MAML Tactical Graph
          </span>
        </h1>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="hidden sm:inline">
            Legend:{" "}
            <span className="font-medium text-green-500">Offensive</span>{" "}
            <span className="font-medium text-red-500">Defensive</span>{" "}
            <span className="font-medium text-slate-500">Neutral</span>{" "}
            <span className="font-medium text-amber-500">Danger</span>
            {" | "}
            <span className="font-medium text-violet-500">Technique</span>{" "}
            <span className="font-medium text-slate-800">Terminal</span>
          </span>
          <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-700">
            Demo Mode
          </span>
        </div>
      </header>

      {/* Canvas */}
      <main className="h-full pt-12">
        <GraphCanvas initialNodes={DEMO_NODES} initialEdges={DEMO_EDGES} />
      </main>
    </div>
  );
}
