// Hook to sync canvas mutations back to the Neo4j API
"use client";

import { useCallback, useRef } from "react";
import type { Node, Edge } from "reactflow";
import { useGraphState } from "@/components/canvas/GraphContext";

const API_BASE = "/api/v1";

function getNodeTypeFromData(data: Record<string, unknown>): string | null {
  if (data.type === "game-context") return "game-contexts";
  if (data.type === "technique-action") return "techniques";
  if (data.type === "terminal-sink") return "terminals";
  return null;
}

function extractPos(node: Node): { pos_x: number; pos_y: number } {
  return {
    pos_x: Math.round(node.position.x),
    pos_y: Math.round(node.position.y),
  };
}

async function patchNodePosition(
  apiType: string,
  id: string,
  pos: { pos_x: number; pos_y: number },
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/${apiType}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pos),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function deleteNodeFromApi(
  apiType: string,
  id: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/${apiType}/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function deleteEdgeFromApi(edge: Edge): Promise<boolean> {
  const isPathway = edge.data?.edge_type === "TACTICAL_PATHWAY";
  const endpoint = isPathway ? "pathways" : "results";
  try {
    const res = await fetch(`${API_BASE}/${endpoint}/${edge.id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function createPathway(
  sourceId: string,
  targetId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/pathways`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_game_context_id: sourceId,
        target_technique_action_id: targetId,
        gateway_type: "INTENT_DRIVEN",
        trigger_condition: "Manual connection",
        transition_probability: 0.0,
        execution_counter: 0,
      }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        ok: false,
        error: errorData.error || "Failed to create pathway",
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error creating pathway" };
  }
}

async function createResult(
  techniqueId: string,
  targetId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        technique_id: techniqueId,
        target_id: targetId,
      }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { ok: false, error: errorData.error || "Failed to create result" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error creating result" };
  }
}

function isGameContext(data: Record<string, unknown>): boolean {
  return data.type === "game-context";
}

function isTechniqueAction(data: Record<string, unknown>): boolean {
  return data.type === "technique-action";
}

export function useGraphPersistence() {
  const { nodes, edges, setNodes, setEdges } = useGraphState();
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const handleNodeDragStop = useCallback((_event: unknown, node: Node) => {
    const apiType = getNodeTypeFromData(node.data as Record<string, unknown>);
    if (!apiType) return;

    const pos = extractPos(node);
    const key = `${apiType}:${node.id}`;

    const existing = debounceTimers.current.get(key);
    if (existing) clearTimeout(existing);

    debounceTimers.current.set(
      key,
      setTimeout(async () => {
        await patchNodePosition(apiType, node.id, pos);
        debounceTimers.current.delete(key);
      }, 500),
    );
  }, []);

  const handleNodesDelete = useCallback(async (deletedNodes: Node[]) => {
    for (const node of deletedNodes) {
      const apiType = getNodeTypeFromData(node.data as Record<string, unknown>);
      if (!apiType) continue;
      await deleteNodeFromApi(apiType, node.id);
    }
  }, []);

  const handleEdgesDelete = useCallback(async (deletedEdges: Edge[]) => {
    for (const edge of deletedEdges) {
      await deleteEdgeFromApi(edge);
    }
  }, []);

  const handleConnect = useCallback(
    async (connection: { source: string; target: string }) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode)
        return { ok: false, error: "Node not found" };

      const sourceData = sourceNode.data as Record<string, unknown>;
      const targetData = targetNode.data as Record<string, unknown>;

      if (isGameContext(sourceData) && isTechniqueAction(targetData)) {
        return createPathway(connection.source, connection.target);
      }

      if (isTechniqueAction(sourceData)) {
        return createResult(connection.source, connection.target);
      }

      return { ok: false, error: "Invalid connection type" };
    },
    [nodes],
  );

  return {
    handleNodeDragStop,
    handleNodesDelete,
    handleEdgesDelete,
    handleConnect,
  };
}
