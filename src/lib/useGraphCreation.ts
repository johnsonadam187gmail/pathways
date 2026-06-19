// Hook for creating MAML pathway chains on the canvas
"use client";

import { useCallback } from "react";
import type { Node, Edge } from "reactflow";
import { useGraphState } from "@/components/canvas/GraphContext";
import { TransitionalValidator } from "@/lib/neo4j/repositories/transitional-validator";
import { RelativeRole } from "@/lib/types/enums";

let idCounter = 0;
function genId(prefix: string): string {
  idCounter++;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

const GC_SPACING_X = 160;
const TA_SPACING_X = 240;
const VERTICAL_OFFSET = 60;
const RESULT_SPACING_X = 360;

const validator = new TransitionalValidator();

export function useGraphCreation() {
  const { addNode, addEdge } = useGraphState();

  /** Create a full 5-part pathway: GC → TP → TA → RI → GC|TS */
  const createFullPathway = useCallback(
    (position: { x: number; y: number }) => {
      const gcId = genId("gc");
      const taId = genId("ta");
      const resultId = genId("result");
      const tpId = genId("tp");
      const riId = genId("ri");

      const gcNode: Node = {
        id: gcId,
        type: "graphNode",
        position: {
          x: position.x - GC_SPACING_X,
          y: position.y - VERTICAL_OFFSET,
        },
        data: {
          label: "New Position",
          type: "game-context",
          relative_role: "NEUTRAL",
          subtitle: "Danger: 3 | Pts: 0",
        },
      };

      const taNode: Node = {
        id: taId,
        type: "graphNode",
        position: { x: position.x + 20, y: position.y },
        data: {
          label: "New Technique",
          type: "technique-action",
          action_type: "SWEEP",
        },
      };

      const resultNode: Node = {
        id: resultId,
        type: "graphNode",
        position: {
          x: position.x + TA_SPACING_X,
          y: position.y + VERTICAL_OFFSET,
        },
        data: {
          label: "New Position",
          type: "game-context",
          relative_role: "NEUTRAL",
          subtitle: "Click to toggle GC/TS",
          _isEndpoint: true,
          _endpointType: "game-context",
        },
      };

      const tpEdge: Edge = {
        id: tpId,
        source: gcId,
        target: taId,
        sourceHandle: "source",
        targetHandle: "target",
        type: "graphEdge",
        data: {
          edge_type: "TACTICAL_PATHWAY",
          trigger_condition: "Describe trigger...",
          gateway_type: "INTENT_DRIVEN",
        },
      };

      const riEdge: Edge = {
        id: riId,
        source: taId,
        target: resultId,
        sourceHandle: "source",
        targetHandle: "target",
        type: "graphEdge",
        data: {
          edge_type: "RESULTS_IN",
        },
      };

      addNode(gcNode);
      addNode(taNode);
      addNode(resultNode);
      addEdge(tpEdge);
      addEdge(riEdge);

      return { gcId, taId, resultId, tpId, riId };
    },
    [addNode, addEdge],
  );

  /** Create a technique-action chain: TA → RI → GC|TS */
  const createTechniqueChain = useCallback(
    (position: { x: number; y: number }) => {
      const taId = genId("ta");
      const resultId = genId("result");
      const riId = genId("ri");

      const taNode: Node = {
        id: taId,
        type: "graphNode",
        position: { x: position.x - 40, y: position.y - 20 },
        data: {
          label: "New Technique",
          type: "technique-action",
          action_type: "SWEEP",
        },
      };

      const resultNode: Node = {
        id: resultId,
        type: "graphNode",
        position: {
          x: position.x + TA_SPACING_X - 40,
          y: position.y + VERTICAL_OFFSET - 20,
        },
        data: {
          label: "New Position",
          type: "game-context",
          relative_role: "NEUTRAL",
          subtitle: "Click to toggle GC/TS",
          _isEndpoint: true,
          _endpointType: "game-context",
        },
      };

      const riEdge: Edge = {
        id: riId,
        source: taId,
        target: resultId,
        sourceHandle: "source",
        targetHandle: "target",
        type: "graphEdge",
        data: { edge_type: "RESULTS_IN" },
      };

      addNode(taNode);
      addNode(resultNode);
      addEdge(riEdge);

      return { taId, resultId, riId };
    },
    [addNode, addEdge],
  );

  /** Create a standalone TerminalSink node */
  const createTerminalSink = useCallback(
    (position: { x: number; y: number }) => {
      const tsId = genId("ts");
      const tsNode: Node = {
        id: tsId,
        type: "graphNode",
        position,
        data: {
          label: "Tap Out",
          type: "terminal-sink",
          sink_type: "SUBMISSION_SUCCESS",
        },
      };
      addNode(tsNode);
      return { tsId };
    },
    [addNode],
  );

  /** Create a new branch from an existing GameContext node */
  const createBranch = useCallback(
    (
      sourceGcId: string,
      sourceGcPosition: { x: number; y: number },
      allNodes: Node[],
    ) => {
      const sourceGc = allNodes.find((n) => n.id === sourceGcId);
      const sourceRole = (sourceGc?.data as Record<string, unknown>)
        ?.relative_role as string | undefined;

      if (sourceRole && sourceRole !== "NEUTRAL") {
        const targetRole = "NEUTRAL";
        const result = validator.validateTransition(
          sourceRole as RelativeRole,
          targetRole as RelativeRole,
        );
        if (!result.ok) {
          console.warn(`[createBranch] Validation failed: ${result.error}`);
          return null;
        }
      }

      const taId = genId("ta");
      const resultId = genId("result");
      const tpId = genId("tp");
      const riId = genId("ri");

      const taNode: Node = {
        id: taId,
        type: "graphNode",
        position: {
          x: sourceGcPosition.x + 280,
          y: sourceGcPosition.y - 60,
        },
        data: {
          label: "New Technique",
          type: "technique-action",
          action_type: "SWEEP",
        },
      };

      const resultNode: Node = {
        id: resultId,
        type: "graphNode",
        position: {
          x: sourceGcPosition.x + 520,
          y: sourceGcPosition.y + 40,
        },
        data: {
          label: "New Position",
          type: "game-context",
          relative_role: "NEUTRAL",
          subtitle: "Click to toggle GC/TS",
          _isEndpoint: true,
          _endpointType: "game-context",
        },
      };

      const tpEdge: Edge = {
        id: tpId,
        source: sourceGcId,
        target: taId,
        sourceHandle: "source",
        targetHandle: "target",
        type: "graphEdge",
        data: {
          edge_type: "TACTICAL_PATHWAY",
          trigger_condition: "Describe trigger...",
          gateway_type: "INTENT_DRIVEN",
        },
      };

      const riEdge: Edge = {
        id: riId,
        source: taId,
        target: resultId,
        sourceHandle: "source",
        targetHandle: "target",
        type: "graphEdge",
        data: { edge_type: "RESULTS_IN" },
      };

      addNode(taNode);
      addNode(resultNode);
      addEdge(tpEdge);
      addEdge(riEdge);

      return { taId, resultId, tpId, riId };
    },
    [addNode, addEdge],
  );

  /** Create a new result from an existing TechniqueAction node */
  const createResultFromTechnique = useCallback(
    (
      sourceTaId: string,
      sourceTaPosition: { x: number; y: number },
      allNodes: Node[],
    ) => {
      const sourceTa = allNodes.find((n) => n.id === sourceTaId);
      const sourceRole = (sourceTa?.data as Record<string, unknown>)
        ?.relative_role as string | undefined;

      // For RESULTS_IN, we need to find the incoming TACTICAL_PATHWAY to get the source GC role
      // Since we're creating from a TA, the source role is the role of the GC connected via TP
      // This requires checking edges, but for simplicity we'll just allow creation (validation happens on connect)
      // The full validation is done in the onConnectHandler and server-side

      const resultId = genId("result");
      const riId = genId("ri");

      const resultNode: Node = {
        id: resultId,
        type: "graphNode",
        position: {
          x: sourceTaPosition.x + 280,
          y: sourceTaPosition.y + 60,
        },
        data: {
          label: "New Position",
          type: "game-context",
          relative_role: "NEUTRAL",
          subtitle: "Click to toggle GC/TS",
          _isEndpoint: true,
          _endpointType: "game-context",
        },
      };

      const riEdge: Edge = {
        id: riId,
        source: sourceTaId,
        target: resultId,
        sourceHandle: "source",
        targetHandle: "target",
        type: "graphEdge",
        data: { edge_type: "RESULTS_IN" },
      };

      addNode(resultNode);
      addEdge(riEdge);

      return { resultId, riId };
    },
    [addNode, addEdge],
  );

  /** Dispatch creation based on node type string (for DnD palette) */
  const createFromType = useCallback(
    (nodeType: string, position: { x: number; y: number }) => {
      switch (nodeType) {
        case "game-context":
          return createFullPathway(position);
        case "technique-action":
          return createTechniqueChain(position);
        case "terminal-sink":
          return createTerminalSink(position);
        default:
          return null;
      }
    },
    [createFullPathway, createTechniqueChain, createTerminalSink],
  );

  return {
    createFullPathway,
    createTechniqueChain,
    createTerminalSink,
    createBranch,
    createResultFromTechnique,
    createFromType,
  };
}
