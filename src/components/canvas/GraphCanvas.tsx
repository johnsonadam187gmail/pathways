"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  SelectionMode,
  type ReactFlowInstance,
} from "reactflow";
import { TransitionalValidator } from "@/lib/neo4j/repositories/transitional-validator";
import { RelativeRole } from "@/lib/types/enums";
import { isValidStructuralConnection, type NodeType } from "@/lib/types/edges";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";
import GraphNode from "./GraphNode";
import GraphEdge from "./GraphEdge";
import NodeContextMenu from "./NodeContextMenu";
import type { ContextMenuState } from "./NodeContextMenu";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";
import { useGraphState } from "./GraphContext";
import { useGraphPersistence } from "@/lib/useGraphPersistence";
import { useGraphCreation } from "@/lib/useGraphCreation";

const nodeTypes = { graphNode: GraphNode };
const edgeTypes = { graphEdge: GraphEdge };

const defaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed, color: "#52525b" },
  style: { stroke: "#52525b", strokeWidth: 1.5 },
  connectionLineStyle: (isValid: boolean) =>
    isValid
      ? { stroke: "#22c55e", strokeWidth: 2, strokeDasharray: "0" }
      : { stroke: "#ef4444", strokeWidth: 2, strokeDasharray: "6 3" },
  connectionLineType: "smoothstep",
};

function onError(id: string, message: string) {
  console.warn(`[React Flow error ${id}]: ${message}`);
}

function GraphCanvasInner() {
  const {
    nodes,
    edges,
    selectedNodeId,
    onNodesChange,
    onEdgesChange,
    addEdge,
    setSelectedNodeId,
    setSelectedEdgeId,
    setNodes,
    setEdges,
    addNode,
  } = useGraphState();

  const { screenToFlowPosition } = useReactFlow();
  const { createFromType, createBranch, createFullPathway } =
    useGraphCreation();

  const rfInstance = useRef<ReactFlowInstance | null>(null);
  const prevNodeCount = useRef(0);

  const {
    handleNodeDragStop,
    handleNodesDelete,
    handleEdgesDelete,
    handleConnect,
  } = useGraphPersistence();

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    open: false,
    x: 0,
    y: 0,
    type: "canvas",
  });

  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const validatorRef = useRef(new TransitionalValidator());

  useEffect(() => {
    if (!connectionError) return;
    const timer = setTimeout(() => setConnectionError(null), 4000);
    return () => clearTimeout(timer);
  }, [connectionError]);

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, open: false }));
  }, []);

  const handleEscape = useCallback(() => {
    setShowShortcuts(false);
    closeContextMenu();
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [closeContextMenu, setSelectedNodeId, setSelectedEdgeId]);

  const handleEnterEdit = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
    },
    [setSelectedNodeId, setSelectedEdgeId],
  );

  const handleTabBranch = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      createBranch(nodeId, position);
    },
    [createBranch],
  );

  const handleNewPathway = useCallback(
    (position: { x: number; y: number }) => {
      createFullPathway(position);
    },
    [createFullPathway],
  );

  const handleToggleShortcuts = useCallback(() => {
    setShowShortcuts((prev) => !prev);
  }, []);

  const handleNudgeNode = useCallback(
    (nodeId: string, dx: number, dy: number) => {
      setNodes(
        nodes.map((n) =>
          n.id === nodeId
            ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } }
            : n,
        ),
      );
    },
    [nodes, setNodes],
  );

  const handleDuplicate = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const newId = `dup-${Date.now()}`;
      addNode({
        ...node,
        id: newId,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        selected: false,
        data: { ...node.data },
      });
      setSelectedNodeId(newId);
    },
    [nodes, addNode, setSelectedNodeId],
  );

  const handleSelectAll = useCallback(() => {
    setNodes(nodes.map((n) => ({ ...n, selected: true })));
  }, [nodes, setNodes]);

  const getCenterPosition = useCallback(() => {
    const { x, y } = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    if (nodes.length === 0) return { x, y };
    const maxX = Math.max(...nodes.map((n) => n.position.x));
    const maxY = Math.max(...nodes.map((n) => n.position.y));
    return { x: maxX + 400, y: Math.max(maxY + 100, y) };
  }, [nodes, screenToFlowPosition]);

  useKeyboardShortcuts({
    nodes,
    selectedNodeId,
    contextMenuOpen: contextMenu.open,
    shortcutsOpen: showShortcuts,
    onEnterEdit: handleEnterEdit,
    onTabBranch: handleTabBranch,
    onNewPathway: handleNewPathway,
    onToggleShortcuts: handleToggleShortcuts,
    onEscape: handleEscape,
    getCenterPosition,
    onNudgeNode: handleNudgeNode,
    onDuplicate: handleDuplicate,
    onSelectAll: handleSelectAll,
  });

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        open: true,
        x: event.clientX,
        y: event.clientY,
        type: "node",
        node,
      });
    },
    [],
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setContextMenu({
        open: true,
        x: event.clientX,
        y: event.clientY,
        type: "edge",
        node: undefined,
        edge,
      });
    },
    [],
  );

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      open: true,
      x: event.clientX,
      y: event.clientY,
      type: "canvas",
    });
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      createFromType(type, position);
    },
    [screenToFlowPosition, createFromType],
  );

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

  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      if (!connection.source || !connection.target) return false;
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) return false;
      const sourceData = sourceNode.data as Record<string, unknown>;
      const targetData = targetNode.data as Record<string, unknown>;
      const sourceType = sourceData.type as NodeType;
      const targetType = targetData.type as NodeType;

      if (!isValidStructuralConnection(sourceType, targetType)) return false;

      if (sourceType === "technique-action" && targetType === "game-context") {
        const targetRole = targetData.relative_role as string | undefined;
        if (!targetRole) return false;
        const incomingPathways = edges.filter(
          (e) =>
            e.target === connection.source &&
            (e.data as Record<string, unknown>)?.edge_type ===
              "TACTICAL_PATHWAY",
        );
        for (const pathway of incomingPathways) {
          const sourceGc = nodes.find((n) => n.id === pathway.source);
          if (!sourceGc) continue;
          const sourceRole = (sourceGc.data as Record<string, unknown>)
            .relative_role as string | undefined;
          if (sourceRole) {
            const result = validatorRef.current.validateTransition(
              sourceRole as RelativeRole,
              targetRole as RelativeRole,
            );
            if (!result.ok) return false;
          }
        }
        return true;
      }

      return true;
    },
    [nodes, edges],
  );

  const onConnectHandler = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) return;

      const sourceData = sourceNode.data as Record<string, unknown>;
      const targetData = targetNode.data as Record<string, unknown>;
      const sourceType = sourceData.type as string;
      const targetType = targetData.type as string;

      const isPathway =
        sourceType === "game-context" && targetType === "technique-action";
      const isResult =
        sourceType === "technique-action" &&
        (targetType === "game-context" || targetType === "terminal-sink");

      if (!isPathway && !isResult) return;

      if (isResult && targetType === "game-context") {
        const targetRole = targetData.relative_role as string | undefined;
        if (targetRole) {
          const incomingPathways = edges.filter(
            (e) =>
              e.target === connection.source &&
              (e.data as Record<string, unknown>)?.edge_type ===
                "TACTICAL_PATHWAY",
          );
          for (const pathway of incomingPathways) {
            const sourceGc = nodes.find((n) => n.id === pathway.source);
            if (!sourceGc) continue;
            const sourceRole = (sourceGc.data as Record<string, unknown>)
              .relative_role as string | undefined;
            if (sourceRole) {
              const result = validatorRef.current.validateTransition(
                sourceRole as RelativeRole,
                targetRole as RelativeRole,
              );
              if (!result.ok) {
                setConnectionError(result.error);
                return;
              }
            }
          }
        }
      }

      const edgeId = `edge-${connection.source}-${connection.target}-${Date.now()}`;

      if (isPathway) {
        addEdge({
          id: edgeId,
          source: connection.source,
          target: connection.target,
          type: "graphEdge",
          data: {
            edge_type: "TACTICAL_PATHWAY",
            trigger_condition: "Manual connection",
            gateway_type: "INTENT_DRIVEN",
          },
        });
      } else {
        addEdge({
          id: edgeId,
          source: connection.source,
          target: connection.target,
          type: "graphEdge",
          data: { edge_type: "RESULTS_IN" },
        });
      }

      const apiResult = await handleConnect({
        source: connection.source,
        target: connection.target,
      });

      if (!apiResult.ok) {
        setEdges((prevEdges: Edge[]) =>
          prevEdges.filter((e: Edge) => e.id !== edgeId),
        );
        setConnectionError(apiResult.error || "Failed to persist connection");
      }
    },
    [nodes, edges, addEdge, handleConnect, setEdges],
  );

  return (
    <div className="h-full w-full graph-grid">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnectHandler}
        isValidConnection={isValidConnection}
        onSelectionChange={onSelectionChange}
        onNodeDragStop={handleNodeDragStop}
        onNodesDelete={handleNodesDelete}
        onEdgesDelete={handleEdgesDelete}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onError={onError}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView={false}
        selectionMode={SelectionMode.Partial}
        attributionPosition="bottom-left"
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode="Shift"
      >
        <Background color="var(--canvas-dot)" gap={20} size={1} />
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
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
          style={{ background: "var(--surface-container-low)" }}
        />
      </ReactFlow>
      {connectionError && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg glass px-4 py-2 text-sm shadow-lg">
          <span className="text-maml-defensive">{connectionError}</span>
        </div>
      )}
      <KeyboardShortcutsModal open={showShortcuts} onClose={handleEscape} />
      <NodeContextMenu menu={contextMenu} onClose={closeContextMenu} />
    </div>
  );
}

export default function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner />
    </ReactFlowProvider>
  );
}
