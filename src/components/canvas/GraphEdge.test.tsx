/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";
import GraphEdge, { type GraphEdgeData } from "./GraphEdge";

jest.mock("reactflow", () => ({
  BaseEdge: jest.fn((props: unknown) => {
    const { id, path, style } = props as Record<string, unknown>;
    return (
      <path
        data-testid="rf-base-edge"
        data-id={id as string}
        d={path as string}
        style={style as React.CSSProperties}
      />
    );
  }),
  getBezierPath: jest.fn(() => ["M0,0 C0,0 0,0 0,0", 100, 50]),
  EdgeLabelRenderer: jest.fn((props: unknown) => {
    const { children } = props as { children: React.ReactNode };
    return <div data-testid="rf-edge-label">{children}</div>;
  }),
}));

const defaultProps = {
  id: "test-edge",
  source: "source-node",
  target: "target-node",
  sourceX: 0,
  sourceY: 0,
  targetX: 100,
  targetY: 100,
  sourcePosition: "bottom" as const,
  targetPosition: "top" as const,
  selected: false,
  zIndex: 0,
  path: "M0,0 C0,0 0,0 0,0",
};

describe("GraphEdge \u2014 TACTICAL_PATHWAY", () => {
  const pathwayData: GraphEdgeData = {
    edge_type: "TACTICAL_PATHWAY",
    trigger_condition: "opponent postures up",
    gateway_type: "INTENT_DRIVEN",
  };

  it("renders trigger_condition text", () => {
    render(<GraphEdge {...(defaultProps as any)} data={pathwayData} />);
    expect(screen.getByText("opponent postures up")).toBeInTheDocument();
  });

  it("does not show lightning bolt for INTENT_DRIVEN", () => {
    const { container } = render(
      <GraphEdge {...(defaultProps as any)} data={pathwayData} />,
    );
    expect(container.querySelector(".text-amber-500")).not.toBeInTheDocument();
  });

  it("shows lightning bolt for STIMULUS_DRIVEN", () => {
    render(
      <GraphEdge
        {...(defaultProps as any)}
        data={{ ...pathwayData, gateway_type: "STIMULUS_DRIVEN" }}
      />,
    );
    expect(screen.getByText("\u26A1")).toBeInTheDocument();
  });
});

describe("GraphEdge \u2014 RESULTS_IN", () => {
  const resultsInData: GraphEdgeData = {
    edge_type: "RESULTS_IN",
  };

  it('renders "Results In \u2192" text', () => {
    render(<GraphEdge {...(defaultProps as any)} data={resultsInData} />);
    expect(screen.getByText("Results In \u2192")).toBeInTheDocument();
  });

  it("does not render trigger_condition for RESULTS_IN", () => {
    render(<GraphEdge {...(defaultProps as any)} data={resultsInData} />);
    expect(screen.queryByText("opponent postures up")).not.toBeInTheDocument();
  });
});

describe("GraphEdge \u2014 selection styling", () => {
  it("applies selected style when selected", () => {
    render(
      <GraphEdge
        {...(defaultProps as any)}
        selected={true}
        data={{ edge_type: "TACTICAL_PATHWAY", trigger_condition: "test" }}
      />,
    );
    const edge = screen.getByTestId("rf-base-edge");
    expect(edge).toHaveAttribute("data-id", "test-edge");
  });
});
