/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";
import NodeDetailPanel from "./NodeDetailPanel";
import { GraphProvider } from "./GraphContext";
import type { Node } from "reactflow";
import type { ReactNode } from "react";

jest.mock("reactflow", () => {
  const applyNodeChanges = jest.fn(
    (_changes: unknown, nodes: unknown) => nodes,
  );
  const applyEdgeChanges = jest.fn(
    (_changes: unknown, edges: unknown) => edges,
  );
  return {
    __esModule: true,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType: { ArrowClosed: "arrowclosed" },
    SelectionMode: { Partial: "partial" },
  };
});

const gameContextNode: Node = {
  id: "gc-1",
  type: "graphNode",
  position: { x: 0, y: 0 },
  data: {
    label: "Closed Guard",
    type: "game-context",
    relative_role: "DEFENSIVE",
    subtitle: "Danger: 7",
    danger_level: 7,
    points_value: 0,
  },
};

function renderWithProvider(ui: ReactNode, initialNodes?: Node[]) {
  return render(
    <GraphProvider initialNodes={initialNodes}>{ui}</GraphProvider>,
  );
}

describe("NodeDetailPanel", () => {
  it("shows placeholder when no node is selected", () => {
    renderWithProvider(<NodeDetailPanel />, [gameContextNode]);
    expect(
      screen.getByText("Select a node or edge to inspect"),
    ).toBeInTheDocument();
  });

  it("shows placeholder when selected node is missing from nodes array", () => {
    render(
      <GraphProvider initialNodes={[]}>
        <NodeDetailPanel />
      </GraphProvider>,
    );
    expect(
      screen.getByText("Select a node or edge to inspect"),
    ).toBeInTheDocument();
  });
});
