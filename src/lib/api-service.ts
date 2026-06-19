// Client-side API service for fetching MAML graph data
import type { GraphApiResponse } from "@/app/api/v1/graph/route";
import type { Node, Edge } from "reactflow";
import { POSITIONS } from "@/lib/seed-data";

const BASE_URL = "/api/v1";

function toNumber(val: unknown): number | undefined {
  if (typeof val === "number") return val;
  if (val !== null && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (typeof obj.low === "number") return obj.low as number;
  }
  return undefined;
}

function getPos(
  obj: Record<string, unknown>,
  fallbackId?: string,
): { x: number; y: number } {
  const x = toNumber(obj.pos_x);
  const y = toNumber(obj.pos_y);
  if (x != null && y != null) return { x, y };
  if (fallbackId) {
    const fallback = POSITIONS[fallbackId];
    if (fallback) return fallback;
  }
  return { x: 0, y: 0 };
}

export async function fetchGraph(): Promise<GraphApiResponse> {
  const res = await fetch(`${BASE_URL}/graph`);
  if (!res.ok) {
    throw new Error(`Failed to fetch graph: ${res.statusText}`);
  }
  return res.json();
}

export function graphResponseToNodesEdges(data: GraphApiResponse): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  for (const gc of data.gameContexts) {
    nodes.push({
      id: gc.id as string,
      type: "graphNode",
      position: getPos(gc, gc.id as string),
      data: {
        label: gc.position_name as string,
        type: "game-context",
        relative_role: gc.relative_role as string,
        subtitle: `Danger: ${gc.danger_level} | Pts: ${gc.points_value}`,
        points_value: gc.points_value as number,
        danger_level: gc.danger_level as number,
        sidedness: gc.sidedness as string,
      },
    });
  }

  for (const ta of data.techniqueActions) {
    nodes.push({
      id: ta.id as string,
      type: "graphNode",
      position: getPos(ta, ta.id as string),
      data: {
        label: ta.action_name as string,
        type: "technique-action",
        action_type: ta.action_type as string,
      },
    });
  }

  for (const ts of data.terminalSinks) {
    nodes.push({
      id: ts.id as string,
      type: "graphNode",
      position: getPos(ts, ts.id as string),
      data: {
        label:
          (ts.sink_type as string) === "SUBMISSION_SUCCESS"
            ? "Tap Out"
            : "Concede Position",
        type: "terminal-sink",
        sink_type: ts.sink_type as string,
      },
    });
  }

  for (const tp of data.tacticalPathways) {
    edges.push({
      id: tp.id as string,
      source: tp.source_id as string,
      target: tp.target_id as string,
      sourceHandle: "source",
      targetHandle: "target",
      type: "graphEdge",
      data: {
        edge_type: "TACTICAL_PATHWAY",
        trigger_condition: tp.trigger_condition as string,
        gateway_type: tp.gateway_type as string,
      },
    });
  }

  for (const ri of data.resultsInEdges) {
    edges.push({
      id: ri.id as string,
      source: ri.source_id as string,
      target: ri.target_id as string,
      sourceHandle: "source",
      targetHandle: "target",
      type: "graphEdge",
      data: {
        edge_type: "RESULTS_IN",
      },
    });
  }

  return { nodes, edges };
}
