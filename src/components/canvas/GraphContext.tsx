// Graph Context — Central state management for the MAML graph canvas
"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  Viewport,
} from "reactflow";
import { applyNodeChanges, applyEdgeChanges } from "reactflow";

export interface GraphState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  viewport: Viewport;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<Node["data"]>) => void;
  removeNodes: (ids: string[]) => void;
  addEdge: (edge: Edge) => void;
  removeEdges: (ids: string[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  setViewport: (viewport: Viewport) => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
}

const GraphContext = createContext<GraphState | null>(null);

const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

export type GraphProviderProps = {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  children: ReactNode;
};

export function GraphProvider({
  initialNodes = [],
  initialEdges = [],
  children,
}: GraphProviderProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);

  const addNode = useCallback((node: Node) => {
    setNodes((prev) => [...prev, node]);
  }, []);

  const updateNode = useCallback((id: string, data: Partial<Node["data"]>) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    );
  }, []);

  const removeNodes = useCallback((ids: string[]) => {
    setNodes((prev) => prev.filter((n) => !ids.includes(n.id)));
    setEdges((prev) =>
      prev.filter((e) => !ids.includes(e.source) && !ids.includes(e.target)),
    );
  }, []);

  const addEdge = useCallback((edge: Edge) => {
    setEdges((prev) => [...prev, edge]);
  }, []);

  const removeEdges = useCallback((ids: string[]) => {
    setEdges((prev) => prev.filter((e) => !ids.includes(e.id)));
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    const newEdge: Edge = {
      id: `edge-${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
      type: "graphEdge",
      data: { edge_type: "TACTICAL_PATHWAY" },
    };
    setEdges((prev) => [...prev, newEdge]);
  }, []);

  const value = useMemo<GraphState>(
    () => ({
      nodes,
      edges,
      selectedNodeId,
      selectedEdgeId,
      viewport,
      setNodes,
      setEdges,
      addNode,
      updateNode,
      removeNodes,
      addEdge,
      removeEdges,
      setSelectedNodeId,
      setSelectedEdgeId,
      setViewport,
      onNodesChange,
      onEdgesChange,
      onConnect,
    }),
    [
      nodes,
      edges,
      selectedNodeId,
      selectedEdgeId,
      viewport,
      addNode,
      updateNode,
      removeNodes,
      addEdge,
      removeEdges,
      onNodesChange,
      onEdgesChange,
      onConnect,
    ],
  );

  return (
    <GraphContext.Provider value={value}>{children}</GraphContext.Provider>
  );
}

export function useGraphState(): GraphState {
  const ctx = useContext(GraphContext);
  if (!ctx) {
    throw new Error("useGraphState must be used within a GraphProvider");
  }
  return ctx;
}
