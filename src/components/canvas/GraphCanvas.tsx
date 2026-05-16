// Graph Canvas — React Flow wrapper rendering MAML graph
"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "reactflow";
import GraphNode from "./GraphNode";
import GraphEdge from "./GraphEdge";

const nodeTypes = { graphNode: GraphNode };
const edgeTypes = { graphEdge: GraphEdge };

export type GraphCanvasProps = {
  initialNodes?: Node[];
  initialEdges?: Edge[];
};

export default function GraphCanvas({
  initialNodes = [],
  initialEdges = [],
}: GraphCanvasProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

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

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
      style: { stroke: "#94a3b8", strokeWidth: 1.5 },
    }),
    [],
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        attributionPosition="bottom-left"
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
