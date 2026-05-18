// Graph Canvas — React Flow wrapper rendering MAML graph
"use client";

import { useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Node,
  type Edge,
  SelectionMode,
  type ReactFlowInstance,
} from "reactflow";
import GraphNode from "./GraphNode";
import GraphEdge from "./GraphEdge";
import { useGraphState } from "./GraphContext";
import { useGraphPersistence } from "@/lib/useGraphPersistence";

const nodeTypes = { graphNode: GraphNode };
const edgeTypes = { graphEdge: GraphEdge };

const defaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
  style: { stroke: "#94a3b8", strokeWidth: 1.5 },
};

function onError(id: string, message: string) {
  // Suppress false-positive "created a new nodeTypes or edgeTypes object"
  // warning in development (React Flow v11 + React 19 compatibility)
  if (id === "002") return;
  console.warn(`[React Flow]: ${message}`);
}

export default function GraphCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    setSelectedEdgeId,
  } = useGraphState();

  if (nodes.length > 0) {
    const unique = new Set(nodes.map((n) => `${n.position.x},${n.position.y}`));
    console.log(
      "[GraphCanvas] nodes:",
      nodes.length,
      "unique positions:",
      unique.size,
    );
    if (unique.size < 3) {
      console.log(
        "[GraphCanvas] FIRST 5:",
        nodes
          .slice(0, 5)
          .map((n) => `${n.id}:(${n.position.x},${n.position.y})`),
      );
    }
  }

  const rfInstance = useRef<ReactFlowInstance | null>(null);
  const prevNodeCount = useRef(0);

  const {
    handleNodeDragStop,
    handleNodesDelete,
    handleEdgesDelete,
    handleConnect,
  } = useGraphPersistence();

  const onInit = useCallback((instance: ReactFlowInstance) => {
    rfInstance.current = instance;
    requestAnimationFrame(() => {
      instance.fitView({ padding: 0.2 });
    });
  }, []);

  useEffect(() => {
    if (prevNodeCount.current === 0 && nodes.length > 0) {
      const handle = requestAnimationFrame(() => {
        rfInstance.current?.fitView({ padding: 0.2 });
      });
      prevNodeCount.current = nodes.length;
      return () => cancelAnimationFrame(handle);
    }
    prevNodeCount.current = nodes.length;
  }, [nodes.length]);

  const onSelectionChange = useCallback(
    ({
      nodes: selectedNodes,
      edges: selectedEdges,
    }: {
      nodes: Node[];
      edges: Edge[];
    }) => {
      setSelectedNodeId(
        selectedNodes.length === 1 ? selectedNodes[0].id : null,
      );
      setSelectedEdgeId(
        selectedEdges.length === 1 ? selectedEdges[0].id : null,
      );
    },
    [setSelectedNodeId, setSelectedEdgeId],
  );

  const onConnectHandler = useCallback(
    (connection: {
      source: string | null;
      target: string | null;
      sourceHandle: string | null;
      targetHandle: string | null;
    }) => {
      if (!connection.source || !connection.target) return;
      onConnect(connection as Parameters<typeof onConnect>[0]);
      handleConnect({ source: connection.source, target: connection.target });
    },
    [onConnect, handleConnect],
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnectHandler}
        onSelectionChange={onSelectionChange}
        onNodeDragStop={handleNodeDragStop}
        onNodesDelete={handleNodesDelete}
        onEdgesDelete={handleEdgesDelete}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onError={onError}
        fitView={false}
        selectionMode={SelectionMode.Partial}
        attributionPosition="bottom-left"
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode="Shift"
      >
        <Background color="#e2e8f0" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as { relative_role?: string } | undefined;
            if (data?.relative_role === "OFFENSIVE") return "#22c55e";
            if (data?.relative_role === "DEFENSIVE") return "#ef4444";
            if (data?.relative_role === "SYMMETRICAL_DANGER") return "#f59e0b";
            if (node.type === "graphNode") return "#64748b";
            return "#8b5cf6";
          }}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
