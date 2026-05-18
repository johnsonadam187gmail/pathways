// Hook to load graph data from the API into context
"use client";

import { useCallback, useState } from "react";
import { fetchGraph, graphResponseToNodesEdges } from "@/lib/api-service";
import type { Node, Edge } from "reactflow";

export type LoadState = "idle" | "loading" | "success" | "error";

export function useGraphLoader() {
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<{
    nodes: Node[];
    edges: Edge[];
  } | null> => {
    setLoadState("loading");
    setError(null);
    try {
      const data = await fetchGraph();
      const { nodes, edges } = graphResponseToNodesEdges(data);
      setLoadState("success");
      return { nodes, edges };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setLoadState("error");
      return null;
    }
  }, []);

  return { loadState, error, load };
}
