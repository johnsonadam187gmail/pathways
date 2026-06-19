"use client";

import { memo } from "react";
import {
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from "reactflow";

export type GraphEdgeData = {
  edge_type: "TACTICAL_PATHWAY" | "RESULTS_IN";
  trigger_condition?: string;
  gateway_type?: "INTENT_DRIVEN" | "STIMULUS_DRIVEN";
};

function GraphEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<GraphEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isPathway = data?.edge_type === "TACTICAL_PATHWAY";

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? "#a78bfa" : isPathway ? "#52525b" : "#8b5cf6",
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: isPathway ? "none" : "6 3",
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute rounded-lg px-2.5 py-1 text-[10px] font-medium shadow-lg transition-colors cursor-pointer hover:scale-105"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            maxWidth: 180,
            background: "var(--surface)",
            color: "var(--on-surface-variant)",
            border: isPathway
              ? "1px solid var(--outline-variant)"
              : "1px solid rgba(139,92,246,0.3)",
          }}
        >
          {isPathway ? (
            <>
              {data?.gateway_type === "STIMULUS_DRIVEN" && (
                <span className="mr-1 text-maml-danger">⚡</span>
              )}
              {data?.trigger_condition}
            </>
          ) : (
            <span style={{ color: "var(--primary)" }}>Results In →</span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(GraphEdge);
