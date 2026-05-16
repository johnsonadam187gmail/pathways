// Custom Graph Node — renders MAML entities with role-based color coding
"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

export type GraphNodeData = {
  label: string;
  type: "game-context" | "technique-action" | "terminal-sink";
  relative_role?: "OFFENSIVE" | "DEFENSIVE" | "NEUTRAL" | "SYMMETRICAL_DANGER";
  action_type?: string;
  sink_type?: string;
  subtitle?: string;
};

const ROLE_COLORS: Record<string, string> = {
  OFFENSIVE: "#22c55e",
  DEFENSIVE: "#ef4444",
  NEUTRAL: "#64748b",
  SYMMETRICAL_DANGER: "#f59e0b",
};

const NODE_TYPE_COLORS: Record<string, string> = {
  "technique-action": "#8b5cf6",
  "terminal-sink": "#1e293b",
};

function GraphNode({ data }: NodeProps<GraphNodeData>) {
  const isContext = data.type === "game-context";
  const bgColor = isContext
    ? ROLE_COLORS[data.relative_role ?? "NEUTRAL"]
    : (NODE_TYPE_COLORS[data.type] ?? "#64748b");

  return (
    <div
      className="rounded-lg border-2 border-black/10 px-4 py-2 shadow-md"
      style={{ background: bgColor, color: "#fff", minWidth: 140 }}
    >
      <Handle type="target" position={Position.Top} className="!bg-black/30" />
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
          {data.type === "game-context"
            ? (data.relative_role?.replace("_", " ") ?? "NEUTRAL")
            : data.type === "technique-action"
              ? (data.action_type ?? "TECHNIQUE")
              : (data.sink_type ?? "TERMINAL")}
        </div>
        <div className="text-sm font-bold leading-tight">{data.label}</div>
        {data.subtitle && (
          <div className="mt-0.5 text-[10px] opacity-75">{data.subtitle}</div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-black/30"
      />
    </div>
  );
}

export default memo(GraphNode);
