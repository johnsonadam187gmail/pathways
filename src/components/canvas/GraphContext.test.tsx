/**
 * @jest-environment jsdom
 */

import { describe, it, expect } from "@jest/globals";
import { renderHook, act } from "@testing-library/react";
import { GraphProvider, useGraphState } from "./GraphContext";
import type { Node, Edge } from "reactflow";
import type { ReactNode } from "react";

function renderWithProvider(initialNodes?: Node[], initialEdges?: Edge[]) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GraphProvider initialNodes={initialNodes} initialEdges={initialEdges}>
      {children}
    </GraphProvider>
  );
  return renderHook(() => useGraphState(), { wrapper });
}

describe("GraphContext", () => {
  it("provides default empty state", () => {
    const { result } = renderWithProvider();
    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
    expect(result.current.selectedNodeId).toBeNull();
    expect(result.current.selectedEdgeId).toBeNull();
  });

  it("accepts initial nodes and edges", () => {
    const nodes: Node[] = [
      { id: "a", type: "graphNode", position: { x: 0, y: 0 }, data: {} },
    ];
    const edges: Edge[] = [{ id: "e1", source: "a", target: "b", data: {} }];
    const { result } = renderWithProvider(nodes, edges);
    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.edges).toHaveLength(1);
  });

  it("adds a node", () => {
    const { result } = renderWithProvider();
    const node: Node = {
      id: "n1",
      type: "graphNode",
      position: { x: 100, y: 200 },
      data: { label: "Test" },
    };
    act(() => result.current.addNode(node));
    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0].data.label).toBe("Test");
  });

  it("updates a node", () => {
    const node: Node = {
      id: "n1",
      type: "graphNode",
      position: { x: 0, y: 0 },
      data: { label: "Old" },
    };
    const { result } = renderWithProvider([node]);
    act(() => result.current.updateNode("n1", { label: "New" }));
    expect(result.current.nodes[0].data.label).toBe("New");
  });

  it("removes nodes and their connected edges", () => {
    const nodes: Node[] = [
      { id: "a", type: "graphNode", position: { x: 0, y: 0 }, data: {} },
      { id: "b", type: "graphNode", position: { x: 0, y: 0 }, data: {} },
    ];
    const edges: Edge[] = [
      { id: "e1", source: "a", target: "b", data: {} },
      { id: "e2", source: "b", target: "c", data: {} },
    ];
    const { result } = renderWithProvider(nodes, edges);
    act(() => result.current.removeNodes(["a"]));
    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.edges).toHaveLength(1);
  });

  it("sets selectedNodeId", () => {
    const { result } = renderWithProvider();
    act(() => result.current.setSelectedNodeId("gc-1"));
    expect(result.current.selectedNodeId).toBe("gc-1");
  });

  it("sets viewport", () => {
    const { result } = renderWithProvider();
    act(() => result.current.setViewport({ x: 100, y: 200, zoom: 1.5 }));
    expect(result.current.viewport).toEqual({ x: 100, y: 200, zoom: 1.5 });
  });

  it("throws when used outside provider", () => {
    expect(() => renderHook(() => useGraphState())).toThrow(
      "useGraphState must be used within a GraphProvider",
    );
  });

  it("handles onConnect creating an edge", () => {
    const { result } = renderWithProvider();
    act(() =>
      result.current.onConnect({
        source: "gc-1",
        target: "ta-1",
        sourceHandle: null,
        targetHandle: null,
      }),
    );
    expect(result.current.edges).toHaveLength(1);
    expect(result.current.edges[0].source).toBe("gc-1");
    expect(result.current.edges[0].target).toBe("ta-1");
  });

  it("removes an edge", () => {
    const edges: Edge[] = [{ id: "e1", source: "a", target: "b", data: {} }];
    const { result } = renderWithProvider(undefined, edges);
    act(() => result.current.removeEdges(["e1"]));
    expect(result.current.edges).toHaveLength(0);
  });
});
