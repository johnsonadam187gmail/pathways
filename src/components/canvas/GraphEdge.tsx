// Custom Graph Edge — displays trigger_condition text on the edge label
"use client";

import { memo } from "react";
import {
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from "reactflow";

export type GraphEdgeData = {
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

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? "#6366f1" : "#94a3b8",
          strokeWidth: selected ? 2.5 : 1.5,
        }}
      />
      {data?.trigger_condition && (
        <EdgeLabelRenderer>
          <div
            className="absolute rounded bg-white px-2 py-1 text-[10px] font-medium text-gray-700 shadow-sm"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "none",
              maxWidth: 180,
              border: "1px solid #e2e8f0",
            }}
          >
            {data.gateway_type === "STIMULUS_DRIVEN" && (
              <span className="mr-1 text-amber-500">⚡</span>
            )}
            {data.trigger_condition}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(GraphEdge);
