/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";
import GraphCanvas from "./GraphCanvas";
import { GraphProvider } from "./GraphContext";
import type { Node, Edge } from "reactflow";
import type { ReactNode } from "react";

jest.mock("reactflow", () => {
  const ReactFlowMock = jest.fn((props: unknown) => {
    const { nodes, edges, children, fitView } = props as Record<
      string,
      unknown
    >;
    return (
      <div data-testid="rf-flow" data-fitview={String(fitView)}>
        <div data-testid="rf-node-count">{(nodes as unknown[]).length}</div>
        <div data-testid="rf-edge-count">{(edges as unknown[]).length}</div>
        {children as React.ReactNode}
      </div>
    );
  });
  return {
    __esModule: true,
    default: ReactFlowMock,
    ReactFlow: ReactFlowMock,
    Background: jest.fn((props: unknown) => {
      const { color, gap } = props as Record<string, unknown>;
      return (
        <div
          data-testid="rf-background"
          data-color={color as string}
          data-gap={gap as number}
        />
      );
    }),
    Controls: jest.fn(() => <div data-testid="rf-controls" />),
    MiniMap: jest.fn((props: unknown) => {
      const { nodeColor, pannable, zoomable } = props as Record<
        string,
        unknown
      >;
      const nodeColorFn = nodeColor as (node: {
        data?: { relative_role?: string };
      }) => string;
      return (
        <div
          data-testid="rf-minimap"
          data-pannable={String(pannable)}
          data-zoomable={String(zoomable)}
        >
          <span data-testid="minimap-role-offensive">
            {nodeColorFn({
              data: { relative_role: "OFFENSIVE" },
            })}
          </span>
          <span data-testid="minimap-role-defensive">
            {nodeColorFn({
              data: { relative_role: "DEFENSIVE" },
            })}
          </span>
        </div>
      );
    }),
    applyNodeChanges: jest.fn((_changes: unknown, nodes: unknown) => nodes),
    applyEdgeChanges: jest.fn((_changes: unknown, edges: unknown) => edges),
    MarkerType: { ArrowClosed: "arrowclosed" },
    SelectionMode: { Partial: "partial" },
  };
});

const sampleNodes: Node[] = [
  {
    id: "node-1",
    type: "graphNode",
    position: { x: 0, y: 0 },
    data: { label: "Closed Guard", type: "game-context" },
  },
  {
    id: "node-2",
    type: "graphNode",
    position: { x: 200, y: 0 },
    data: { label: "Scissor Sweep", type: "technique-action" },
  },
];

const sampleEdges: Edge[] = [
  {
    id: "edge-1",
    source: "node-1",
    target: "node-2",
    type: "smoothstep",
    data: { edge_type: "TACTICAL_PATHWAY" },
  },
];

function renderWithProvider(
  ui: ReactNode,
  initialNodes?: Node[],
  initialEdges?: Edge[],
) {
  return render(
    <GraphProvider initialNodes={initialNodes} initialEdges={initialEdges}>
      {ui}
    </GraphProvider>,
  );
}

describe("GraphCanvas", () => {
  it("renders ReactFlow with provided nodes and edges", () => {
    renderWithProvider(<GraphCanvas />, sampleNodes, sampleEdges);

    expect(screen.getByTestId("rf-flow")).toBeInTheDocument();
    expect(screen.getByTestId("rf-node-count").textContent).toBe("2");
    expect(screen.getByTestId("rf-edge-count").textContent).toBe("1");
  });

  it("renders without nodes and edges when not provided", () => {
    renderWithProvider(<GraphCanvas />);

    expect(screen.getByTestId("rf-flow")).toBeInTheDocument();
    expect(screen.getByTestId("rf-node-count").textContent).toBe("0");
    expect(screen.getByTestId("rf-edge-count").textContent).toBe("0");
  });

  it("renders Background, Controls, and MiniMap", () => {
    renderWithProvider(<GraphCanvas />);

    expect(screen.getByTestId("rf-background")).toBeInTheDocument();
    expect(screen.getByTestId("rf-controls")).toBeInTheDocument();
    expect(screen.getByTestId("rf-minimap")).toBeInTheDocument();
  });

  it("renders MiniMap with correct pannable and zoomable props", () => {
    renderWithProvider(<GraphCanvas />);

    const miniMap = screen.getByTestId("rf-minimap");
    expect(miniMap).toHaveAttribute("data-pannable", "true");
    expect(miniMap).toHaveAttribute("data-zoomable", "true");
  });

  it("renders MiniMap with role-based color function", () => {
    renderWithProvider(<GraphCanvas />);

    expect(screen.getByTestId("minimap-role-offensive").textContent).toBe(
      "#22c55e",
    );
    expect(screen.getByTestId("minimap-role-defensive").textContent).toBe(
      "#ef4444",
    );
  });

  it("defers fitView to onInit (async node loading)", () => {
    renderWithProvider(<GraphCanvas />);
    expect(screen.getByTestId("rf-flow")).toHaveAttribute(
      "data-fitview",
      "false",
    );
  });
});
