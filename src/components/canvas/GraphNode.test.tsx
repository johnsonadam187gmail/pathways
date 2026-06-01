/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";
import GraphNode, { type GraphNodeData } from "./GraphNode";

jest.mock("reactflow", () => ({
  Handle: jest.fn((props: unknown) => {
    const { position, type } = props as Record<string, string>;
    return (
      <div data-testid="rf-handle" data-position={position} data-type={type} />
    );
  }),
  Position: { Top: "top", Bottom: "bottom" },
}));

const baseData: GraphNodeData = {
  label: "Closed Guard",
  type: "game-context",
  relative_role: "DEFENSIVE",
};

function renderNode(overrides: Partial<GraphNodeData> = {}) {
  const data = { ...baseData, ...overrides };
  return render(
    <GraphNode
      {...({
        id: "test-node",
        type: "graphNode",
        data,
        selected: false,
        dragging: false,
        zIndex: 0,
        position: { x: 0, y: 0 },
        sourcePosition: "bottom",
        targetPosition: "top",
      } as any)}
    />,
  );
}

describe("GraphNode", () => {
  it("renders the label text", () => {
    renderNode();
    expect(screen.getByText("Closed Guard")).toBeInTheDocument();
  });

  it("renders the role badge for game-context nodes", () => {
    renderNode({ relative_role: "OFFENSIVE" });
    expect(screen.getByText("OFFENSIVE")).toBeInTheDocument();
  });

  it("renders action_type badge for technique-action nodes", () => {
    renderNode({
      type: "technique-action",
      action_type: "SWEEP",
      label: "Scissor Sweep",
    });
    expect(screen.getByText("SWEEP")).toBeInTheDocument();
  });

  it("renders sink_type badge for terminal-sink nodes", () => {
    renderNode({
      type: "terminal-sink",
      sink_type: "SUBMISSION_SUCCESS",
      label: "Tap Out",
    });
    expect(screen.getByText("SUBMISSION_SUCCESS")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    renderNode({ subtitle: "knee on belly" });
    expect(screen.getByText("knee on belly")).toBeInTheDocument();
  });

  it("does not render subtitle when absent", () => {
    const { queryByTestId } = renderNode();
    expect(queryByTestId("subtitle")).toBeNull();
  });

  it("renders Handle components for source and target", () => {
    renderNode();
    const handles = screen.getAllByTestId("rf-handle");
    expect(handles.length).toBe(2);
    expect(handles[0]).toHaveAttribute("data-position", "top");
    expect(handles[1]).toHaveAttribute("data-position", "bottom");
  });

  it("applies OFFENSIVE color role", () => {
    renderNode({ relative_role: "OFFENSIVE" });
    const badge = screen.getByText("OFFENSIVE");
    const outerDiv = badge.parentElement?.parentElement;
    expect(outerDiv).toHaveStyle({ background: "rgba(34,197,94,0.15)" });
  });

  it("applies DEFENSIVE color role", () => {
    renderNode({ relative_role: "DEFENSIVE" });
    const badge = screen.getByText("DEFENSIVE");
    const outerDiv = badge.parentElement?.parentElement;
    expect(outerDiv).toHaveStyle({ background: "rgba(239,68,68,0.15)" });
  });
});
