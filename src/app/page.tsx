// Main Canvas Page — MAML Tactical Graph Viewer
"use client";

import { useMemo } from "react";
import type { Node, Edge } from "reactflow";
import GraphCanvas from "@/components/canvas/GraphCanvas";

// Demo seed data — removed when Neo4j connection is live
const DEMO_NODES: Node[] = [
  {
    id: "gc-1",
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
    id: "gc-2",
    type: "graphNode",
    position: { x: 300, y: 0 },
    data: {
      label: "Open Guard",
      type: "game-context",
      relative_role: "NEUTRAL",
      subtitle: "Danger: 4",
    },
  },
  {
    id: "ta-1",
    type: "graphNode",
    position: { x: 150, y: 200 },
    data: {
      label: "Scissor Sweep",
      type: "technique-action",
      action_type: "SWEEP",
    },
  },
  {
    id: "ts-1",
    type: "graphNode",
    position: { x: 450, y: 200 },
    data: {
      label: "Armbar Tap",
      type: "terminal-sink",
      sink_type: "SUBMISSION_SUCCESS",
    },
  },
];

const DEMO_EDGES: Edge[] = [
  {
    id: "tp-1",
    source: "gc-1",
    target: "ta-1",
    type: "graphEdge",
    data: {
      trigger_condition: "Opponent over-commits weight forward",
      gateway_type: "STIMULUS_DRIVEN",
    },
  },
  {
    id: "tp-2",
    source: "gc-2",
    target: "ts-1",
    type: "graphEdge",
    data: {
      trigger_condition: "Arm isolated during transition",
      gateway_type: "INTENT_DRIVEN",
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
