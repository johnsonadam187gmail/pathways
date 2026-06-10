"use client";

import { useEffect, useRef } from "react";
import { useGraphState } from "./GraphContext";

const ROLE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  OFFENSIVE: {
    bg: "bg-maml-offensive/10",
    text: "text-maml-offensive",
    dot: "bg-maml-offensive",
  },
  DEFENSIVE: {
    bg: "bg-maml-defensive/10",
    text: "text-maml-defensive",
    dot: "bg-maml-defensive",
  },
  NEUTRAL: {
    bg: "bg-maml-neutral/10",
    text: "text-maml-neutral",
    dot: "bg-maml-neutral",
  },
  SYMMETRICAL_DANGER: {
    bg: "bg-maml-danger/10",
    text: "text-maml-danger",
    dot: "bg-maml-danger",
  },
};

const RELATIVE_ROLES = [
  "OFFENSIVE",
  "DEFENSIVE",
  "NEUTRAL",
  "SYMMETRICAL_DANGER",
] as const;

const SIDEDNESS_OPTIONS = ["LEFT", "RIGHT", "AMBIDEXTROUS"] as const;

const ACTION_TYPES = [
  "SWEEP",
  "SUBMISSION",
  "ESCAPE",
  "GUARD_PASS",
  "POSTURE_ADJUST",
] as const;

const SINK_TYPES = ["SUBMISSION_SUCCESS", "SUBMISSION_CONCEDED"] as const;

const GATEWAY_TYPES = ["INTENT_DRIVEN", "STIMULUS_DRIVEN"] as const;

export default function NodeDetailPanel() {
  const {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    setSelectedNodeId,
    setSelectedEdgeId,
    removeNodes,
    removeEdges,
    updateNode,
    updateEdge,
  } = useGraphState();

  const selectedEdge = selectedEdgeId
    ? edges.find((e) => e.id === selectedEdgeId)
    : null;

  const found = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : null;

  const isOpen = !!(selectedNodeId || selectedEdgeId);

  function handleDelete() {
    if (selectedNodeId) {
      const id = selectedNodeId;
      const data = found?.data as Record<string, unknown> | undefined;
      const nodeType = (data?.type as string | undefined) ?? "";
      let endpoint = "";
      if (nodeType === "game-context") endpoint = `/api/v1/game-contexts/${id}`;
      else if (nodeType === "technique-action")
        endpoint = `/api/v1/techniques/${id}`;
      else if (nodeType === "terminal-sink")
        endpoint = `/api/v1/terminals/${id}`;

      if (endpoint) {
        fetch(endpoint, { method: "DELETE" }).catch(() => {});
      }

      removeNodes([id]);
      setSelectedNodeId(null);
    } else if (selectedEdgeId) {
      const id = selectedEdgeId;
      const edgeData = selectedEdge?.data as
        | Record<string, unknown>
        | undefined;
      const endpoint =
        edgeData?.edge_type === "TACTICAL_PATHWAY"
          ? `/api/v1/pathways/${id}`
          : `/api/v1/results/${id}`;
      if (endpoint) {
        fetch(endpoint, { method: "DELETE" }).catch(() => {});
      }
      removeEdges([id]);
      setSelectedEdgeId(null);
    }
  }

  function handleNodeDataChange(field: string, value: unknown) {
    if (found) {
      updateNode(found.id, { [field]: value });
    }
  }

  function handleEdgeDataChange(field: string, value: unknown) {
    if (selectedEdge) {
      updateEdge(selectedEdge.id, { [field]: value });
    }
  }

  function closePanel() {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }

  return (
    <aside
      className={`border-l border-outline-variant/20 bg-surface/95 backdrop-blur-2xl flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? "w-80" : "w-0 border-l-0"
      }`}
    >
      <div
        className={`flex flex-col h-full min-w-80 ${
          isOpen ? "opacity-100" : "opacity-0"
        } transition-opacity duration-200`}
      >
        {selectedEdge && !found ? (
          <EdgeDetail
            edge={selectedEdge}
            nodes={nodes}
            onClose={closePanel}
            onDataChange={handleEdgeDataChange}
            onDelete={handleDelete}
          />
        ) : found ? (
          <NodeDetail
            node={found}
            onClose={closePanel}
            onDataChange={handleNodeDataChange}
            onDelete={handleDelete}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <svg
              className="h-8 w-8 text-on-surface-variant/30 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <p className="text-xs text-on-surface-variant/50">
              Select a node or edge to inspect
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function EdgeDetail({
  edge,
  nodes,
  onClose,
  onDataChange,
  onDelete,
}: {
  edge: {
    id: string;
    source?: string;
    target?: string;
    data?: Record<string, unknown>;
  };
  nodes: { id: string; data?: Record<string, unknown> }[];
  onClose: () => void;
  onDataChange: (field: string, value: unknown) => void;
  onDelete: () => void;
}) {
  const data = (edge.data ?? {}) as Record<string, unknown>;
  const edgeType = String(data.edge_type ?? "TACTICAL_PATHWAY");
  const isPathway = edgeType === "TACTICAL_PATHWAY";

  const sourceNode = edge.source
    ? nodes.find((n) => n.id === edge.source)
    : null;
  const targetNode = edge.target
    ? nodes.find((n) => n.id === edge.target)
    : null;
  const sourceLabel = String(sourceNode?.data?.label ?? edge.source ?? "-");
  const targetLabel = String(targetNode?.data?.label ?? edge.target ?? "-");

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <span className="text-xs font-semibold text-on-surface">
            {isPathway ? "Decision" : "Reaction"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-colors"
          aria-label="Close detail panel"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary">
            {edgeType}
          </span>
          <span className="text-[10px] text-on-surface-variant font-mono">
            {edge.id}
          </span>
        </div>

        {isPathway ? (
          <>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
                Gateway Type
              </label>
              <select
                value={String(data.gateway_type ?? "INTENT_DRIVEN")}
                onChange={(e) => onDataChange("gateway_type", e.target.value)}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-variant/30 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
              >
                {GATEWAY_TYPES.map((gt) => (
                  <option key={gt} value={gt}>
                    {gt.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
                Trigger Condition
              </label>
              <textarea
                value={String(data.trigger_condition ?? "")}
                onChange={(e) =>
                  onDataChange("trigger_condition", e.target.value)
                }
                rows={3}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-variant/30 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
              />
            </div>

            <NodeField label="Transition Probability">
              {String(data.transition_probability ?? "0.0")}
            </NodeField>

            <NodeField label="Execution Counter">
              {String(data.execution_counter ?? "0")}
            </NodeField>
          </>
        ) : (
          <div>
            <label className="mb-1 block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={String(data.description ?? "")}
              onChange={(e) => onDataChange("description", e.target.value)}
              rows={2}
              placeholder="Describe this reaction..."
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-variant/30 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
            />
          </div>
        )}

        <div className="border-t border-outline-variant/10 pt-3 mt-2 space-y-2">
          <NodeField label="Edge ID" mono>
            {edge.id}
          </NodeField>
          <NodeField label="Source Node">{sourceLabel}</NodeField>
          <NodeField label="Target Node">{targetLabel}</NodeField>
        </div>
      </div>

      <div className="p-4 border-t border-outline-variant/20">
        <button
          onClick={onDelete}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-maml-defensive/30 px-3 py-2 text-xs font-medium text-maml-defensive hover:bg-maml-defensive/10 transition-colors"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          Delete Edge
        </button>
      </div>
    </>
  );
}

function NodeDetail({
  node,
  onClose,
  onDataChange,
  onDelete,
}: {
  node: { id: string; data?: Record<string, unknown> };
  onClose: () => void;
  onDataChange: (field: string, value: unknown) => void;
  onDelete: () => void;
}) {
  const labelInputRef = useRef<HTMLInputElement>(null);
  const data = (node.data ?? {}) as Record<string, unknown>;
  const nodeType = (data.type as string | undefined) ?? "";
  const roleColor = ROLE_COLORS[data.relative_role as string];

  useEffect(() => {
    if (labelInputRef.current) {
      labelInputRef.current.focus();
      labelInputRef.current.select();
    }
  }, [node.id]);

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          {roleColor && (
            <span className={`h-2 w-2 rounded-full ${roleColor.dot}`} />
          )}
          <span className="text-xs font-semibold text-on-surface">Details</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-colors"
          aria-label="Close detail panel"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
              roleColor
                ? `${roleColor.bg} ${roleColor.text}`
                : "bg-surface-variant text-on-surface-variant"
            }`}
          >
            {nodeType}
          </span>
          {nodeType === "game-context" && Boolean(data.relative_role) && (
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                roleColor
                  ? `${roleColor.bg} ${roleColor.text}`
                  : "bg-surface-variant text-on-surface-variant"
              }`}
            >
              {String(data.relative_role).replace(/_/g, " ")}
            </span>
          )}
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
            Label
          </label>
          <input
            ref={labelInputRef}
            id="node-label-input"
            type="text"
            value={String(data.label ?? "")}
            onChange={(e) => onDataChange("label", e.target.value)}
            className="w-full rounded-lg border border-outline-variant/30 bg-surface-variant/30 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <NodeField label="ID" mono>
            {node.id}
          </NodeField>

          {nodeType === "game-context" && (
            <GameContextFields data={data} onDataChange={onDataChange} />
          )}

          {nodeType === "technique-action" && (
            <TechniqueFields data={data} onDataChange={onDataChange} />
          )}

          {nodeType === "terminal-sink" && (
            <TerminalFields data={data} onDataChange={onDataChange} />
          )}
        </div>
      </div>

      <div className="p-4 border-t border-outline-variant/20">
        <button
          onClick={onDelete}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-maml-defensive/30 px-3 py-2 text-xs font-medium text-maml-defensive hover:bg-maml-defensive/10 transition-colors"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          Delete Node
        </button>
      </div>
    </>
  );
}

function GameContextFields({
  data,
  onDataChange,
}: {
  data: Record<string, unknown>;
  onDataChange: (field: string, value: unknown) => void;
}) {
  return (
    <>
      <div>
        <label className="mb-1 block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
          Relative Role
        </label>
        <select
          value={String(data.relative_role ?? "NEUTRAL")}
          onChange={(e) => onDataChange("relative_role", e.target.value)}
          className="w-full rounded-lg border border-outline-variant/30 bg-surface-variant/30 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
        >
          {RELATIVE_ROLES.map((role) => (
            <option key={role} value={role}>
              {role.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
          Sidedness
        </label>
        <select
          value={String(data.sidedness ?? "AMBIDEXTROUS")}
          onChange={(e) => onDataChange("sidedness", e.target.value)}
          className="w-full rounded-lg border border-outline-variant/30 bg-surface-variant/30 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
        >
          {SIDEDNESS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
          Danger Level (1-10)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="10"
            value={Number(data.danger_level) || 5}
            onChange={(e) =>
              onDataChange("danger_level", parseInt(e.target.value))
            }
            className="flex-1 accent-maml-danger"
          />
          <span className="text-xs font-mono text-on-surface-variant w-4 text-right">
            {Number(data.danger_level) || 5}
          </span>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
          Points Value
        </label>
        <div className="flex gap-1">
          {[0, 2, 3, 4].map((pts) => (
            <button
              key={pts}
              onClick={() => onDataChange("points_value", pts)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                Number(data.points_value) === pts
                  ? "bg-primary text-on-primary"
                  : "bg-surface-variant/30 text-on-surface-variant border border-outline-variant/30 hover:bg-surface-variant/50"
              }`}
            >
              {pts}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function TechniqueFields({
  data,
  onDataChange,
}: {
  data: Record<string, unknown>;
  onDataChange: (field: string, value: unknown) => void;
}) {
  const preconditions = Array.isArray(data.mechanical_preconditions)
    ? (data.mechanical_preconditions as string[])
    : [];

  function addPrecondition() {
    onDataChange("mechanical_preconditions", [...preconditions, ""]);
  }

  function updatePrecondition(index: number, value: string) {
    const updated = [...preconditions];
    updated[index] = value;
    onDataChange("mechanical_preconditions", updated);
  }

  function removePrecondition(index: number) {
    onDataChange(
      "mechanical_preconditions",
      preconditions.filter((_, i) => i !== index),
    );
  }

  return (
    <>
      <div>
        <label className="mb-1 block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
          Action Type
        </label>
        <select
          value={String(data.action_type ?? "SWEEP")}
          onChange={(e) => onDataChange("action_type", e.target.value)}
          className="w-full rounded-lg border border-outline-variant/30 bg-surface-variant/30 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
        >
          {ACTION_TYPES.map((at) => (
            <option key={at} value={at}>
              {at.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
            Mechanical Preconditions
          </label>
          <button
            onClick={addPrecondition}
            className="flex items-center gap-0.5 text-[10px] text-primary hover:underline"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add
          </button>
        </div>
        <div className="space-y-1.5">
          {preconditions.map((cond, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                type="text"
                value={cond}
                onChange={(e) => updatePrecondition(i, e.target.value)}
                className="flex-1 rounded-lg border border-outline-variant/30 bg-surface-variant/30 px-2.5 py-1.5 text-xs text-on-surface outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
                placeholder="e.g. Sleeve grip"
              />
              <button
                onClick={() => removePrecondition(i)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-on-surface-variant hover:text-maml-defensive hover:bg-maml-defensive/10 transition-colors"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {preconditions.length === 0 && (
            <p className="text-[10px] text-on-surface-variant/50 italic">
              No preconditions
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function TerminalFields({
  data,
  onDataChange,
}: {
  data: Record<string, unknown>;
  onDataChange: (field: string, value: unknown) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
        Sink Type
      </label>
      <select
        value={String(data.sink_type ?? "SUBMISSION_SUCCESS")}
        onChange={(e) => onDataChange("sink_type", e.target.value)}
        className="w-full rounded-lg border border-outline-variant/30 bg-surface-variant/30 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
      >
        {SINK_TYPES.map((st) => (
          <option key={st} value={st}>
            {st.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </div>
  );
}

function NodeField({
  label,
  mono,
  children,
}: {
  label: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-0.5 block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
        {label}
      </label>
      <p
        className={`text-xs ${
          mono ? "font-mono text-on-surface-variant" : "text-on-surface"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
