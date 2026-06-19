"use client";

import { memo, type CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

export type GraphNodeData = {
  label: string;
  type: "game-context" | "technique-action" | "terminal-sink";
  relative_role?: "OFFENSIVE" | "DEFENSIVE" | "NEUTRAL" | "SYMMETRICAL_DANGER";
  action_type?: string;
  sink_type?: string;
  subtitle?: string;
};

const ROLE_COLORS: Record<
  string,
  { bg: string; border: string; glow: string }
> = {
  OFFENSIVE: {
    bg: "rgba(34,197,94,0.15)",
    border: "#22c55e",
    glow: "rgba(34,197,94,0.3)",
  },
  DEFENSIVE: {
    bg: "rgba(239,68,68,0.15)",
    border: "#ef4444",
    glow: "rgba(239,68,68,0.3)",
  },
  NEUTRAL: {
    bg: "rgba(100,116,139,0.15)",
    border: "#64748b",
    glow: "rgba(100,116,139,0.3)",
  },
  SYMMETRICAL_DANGER: {
    bg: "rgba(245,158,11,0.15)",
    border: "#f59e0b",
    glow: "rgba(245,158,11,0.3)",
  },
};

const TYPE_COLORS: Record<
  string,
  { bg: string; border: string; glow: string }
> = {
  "technique-action": {
    bg: "rgba(139,92,246,0.15)",
    border: "#8b5cf6",
    glow: "rgba(139,92,246,0.3)",
  },
  "terminal-sink": {
    bg: "rgba(161,161,170,0.18)",
    border: "#a1a1aa",
    glow: "rgba(161,161,170,0.4)",
  },
};

function GraphNode({ data, selected }: NodeProps<GraphNodeData>) {
  const isContext = data.type === "game-context";
  const isTechnique = data.type === "technique-action";
  const isTerminal = data.type === "terminal-sink";
  const colors = isContext
    ? ROLE_COLORS[data.relative_role ?? "NEUTRAL"]
    : (TYPE_COLORS[data.type] ?? TYPE_COLORS["technique-action"]);

  return (
    <div
      className="rounded-xl border backdrop-blur-sm transition-all duration-200"
      style={{
        background: colors.bg,
        borderColor: selected ? colors.border : "rgba(255,255,255,0.08)",
        boxShadow: selected
          ? `0 0 20px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`
          : `0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)`,
        minWidth: 140,
      }}
    >
      {isTechnique || isTerminal || isContext ? (
        <Handle
          type="target"
          position={Position.Top}
          id="target"
          className="w-3 h-3 border-2 transition-all duration-200"
          style={
            {
              background: "transparent",
              borderColor: colors.border,
              borderRadius: "50%",
              transform: "translateX(-50%)",
            } as CSSProperties
          }
        />
      ) : null}

      <div className="px-4 py-2.5 text-center">
        <div
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: colors.border }}
        >
          {isContext
            ? (data.relative_role?.replace("_", " ") ?? "NEUTRAL")
            : data.type === "technique-action"
              ? (data.action_type ?? "TECHNIQUE")
              : (data.sink_type ?? "TERMINAL")}
        </div>
        <div
          className="text-sm font-bold leading-tight mt-0.5"
          style={{ color: "#f4f4f5" }}
        >
          {data.label}
        </div>
        {data.subtitle && (
          <div
            className="mt-0.5 text-[10px]"
            style={{ color: "rgba(244,244,245,0.6)" }}
            data-testid="subtitle"
          >
            {data.subtitle}
          </div>
        )}
      </div>

      {isContext || isTechnique ? (
        <Handle
          type="source"
          position={Position.Bottom}
          id="source"
          className="w-3 h-3 border-2 transition-all duration-200"
          style={
            {
              background: "transparent",
              borderColor: colors.border,
              borderRadius: "50%",
              transform: "translateX(-50%)",
            } as CSSProperties
          }
        />
      ) : null}
    </div>
  );
}

export default memo(GraphNode);
