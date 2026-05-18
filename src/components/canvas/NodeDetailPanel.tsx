// Node Detail Panel — Shows selected node properties
"use client";

import { useGraphState } from "./GraphContext";

const ROLE_COLORS: Record<string, string> = {
  OFFENSIVE: "text-green-600 bg-green-50 border-green-200",
  DEFENSIVE: "text-red-600 bg-red-50 border-red-200",
  NEUTRAL: "text-slate-600 bg-slate-50 border-slate-200",
  SYMMETRICAL_DANGER: "text-amber-600 bg-amber-50 border-amber-200",
};

export default function NodeDetailPanel() {
  const { nodes, selectedNodeId, setSelectedNodeId, removeNodes, updateNode } =
    useGraphState();

  if (!selectedNodeId) {
    return (
      <div className="w-64 border-l border-gray-200 bg-gray-50 p-4 text-xs text-gray-400">
        <p>Select a node to inspect</p>
      </div>
    );
  }

  const found = nodes.find((n) => n.id === selectedNodeId);
  if (!found) {
    return (
      <div className="w-64 border-l border-gray-200 bg-gray-50 p-4 text-xs text-gray-400">
        <p>Node not found</p>
      </div>
    );
  }

  const selectedNode: typeof found = found;
  const data = selectedNode.data as Record<string, unknown>;
  const nodeType = (data.type as string | undefined) ?? "";

  function handleDelete() {
    const id = selectedNodeId as string;
    const type = nodeType;
    let endpoint = "";
    if (type === "game-context") endpoint = `/api/v1/game-contexts/${id}`;
    else if (type === "technique-action") endpoint = `/api/v1/techniques/${id}`;
    else if (type === "terminal-sink") endpoint = `/api/v1/terminals/${id}`;

    if (endpoint) {
      fetch(endpoint, { method: "DELETE" }).catch(() => {});
    }

    removeNodes([id]);
    setSelectedNodeId(null);
  }

  function handleLabelChange(label: string) {
    updateNode(selectedNode.id, { label });
  }

  return (
    <div className="w-72 border-l border-gray-200 bg-white text-xs">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <span className="font-semibold text-gray-800">Node Details</span>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close detail panel"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 p-4">
        <NodeField label="ID" mono>
          {selectedNode.id}
        </NodeField>

        <div>
          <label
            htmlFor="node-label-input"
            className="mb-0.5 block font-medium text-gray-500"
          >
            Label
          </label>
          <input
            id="node-label-input"
            type="text"
            value={String(data.label ?? "")}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full rounded border border-gray-200 px-2 py-1 text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          />
        </div>

        <NodeField label="Type">
          <span className="inline-block rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
            {nodeType || "unknown"}
          </span>
        </NodeField>

        {(data.relative_role as string | undefined) && (
          <NodeField label="Role">
            <span
              className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${
                ROLE_COLORS[data.relative_role as string] ??
                "text-gray-600 bg-gray-50 border-gray-200"
              }`}
            >
              {String(data.relative_role)}
            </span>
          </NodeField>
        )}

        {nodeType === "game-context" && (
          <>
            <NodeField label="Danger Level">
              {String(data.danger_level ?? "-")}
            </NodeField>
            <NodeField label="Points Value">
              {String(data.points_value ?? "-")}
            </NodeField>
          </>
        )}

        {nodeType === "technique-action" && (
          <NodeField label="Action Type">
            <span className="inline-block rounded bg-violet-50 px-2 py-0.5 font-medium text-violet-600">
              {String(data.action_type)}
            </span>
          </NodeField>
        )}

        {nodeType === "terminal-sink" && (
          <NodeField label="Sink Type">{String(data.sink_type)}</NodeField>
        )}

        {(data.edge_type as string | undefined) && (
          <>
            <NodeField label="Edge Type">
              <span className="font-medium text-gray-700">
                {String(data.edge_type)}
              </span>
            </NodeField>
            {(data.trigger_condition as string | undefined) && (
              <NodeField label="Trigger">
                <span className="italic text-gray-600">
                  {String(data.trigger_condition)}
                </span>
              </NodeField>
            )}
          </>
        )}

        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={handleDelete}
            className="w-full rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete Node
          </button>
        </div>
      </div>
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
      <label className="mb-0.5 block font-medium text-gray-500">{label}</label>
      <p className={mono ? "font-mono text-gray-700" : "text-gray-700"}>
        {children}
      </p>
    </div>
  );
}
