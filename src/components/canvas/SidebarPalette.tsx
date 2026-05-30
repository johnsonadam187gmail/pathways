// Sidebar Palette — Draggable MAML entity palette for canvas creation
"use client";

import { type DragEvent } from "react";

const NODE_TYPES = [
  {
    type: "game-context",
    label: "GameContext",
    description: "Position / State",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "◉",
  },
  {
    type: "technique-action",
    label: "TechniqueAction",
    description: "Technique / Action",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: "◆",
  },
  {
    type: "terminal-sink",
    label: "TerminalSink",
    description: "End State",
    color: "text-slate-800",
    bg: "bg-slate-50",
    border: "border-slate-200",
    icon: "●",
  },
];

export default function SidebarPalette() {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="flex w-48 flex-col border-r border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 px-3 py-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Palette
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-3 text-[10px] leading-relaxed text-gray-400">
          Drag items onto the canvas to create tactical pathways.
        </p>

        <div className="space-y-2">
          {NODE_TYPES.map((nt) => (
            <div
              key={nt.type}
              draggable
              onDragStart={(e) => onDragStart(e, nt.type)}
              className={`flex cursor-grab items-center gap-2 rounded-lg border ${nt.border} ${nt.bg} px-3 py-2.5 text-xs font-medium ${nt.color} shadow-sm transition-all hover:shadow-md active:cursor-grabbing active:opacity-80`}
              data-testid={`palette-item-${nt.type}`}
            >
              <span className="text-base" aria-hidden>
                {nt.icon}
              </span>
              <div>
                <div className="font-semibold">{nt.label}</div>
                <div className="text-[10px] font-normal text-gray-400">
                  {nt.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-gray-200 pt-3">
          <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Keyboard Shortcuts
          </h3>
          <ul className="space-y-1 text-[10px] text-gray-400">
            <li>
              <kbd className="rounded border border-gray-300 bg-white px-1 font-mono text-[9px] text-gray-500">
                N
              </kbd>{" "}
              New pathway
            </li>
            <li>
              <kbd className="rounded border border-gray-300 bg-white px-1 font-mono text-[9px] text-gray-500">
                Tab
              </kbd>{" "}
              Add branch
            </li>
            <li>
              <kbd className="rounded border border-gray-300 bg-white px-1 font-mono text-[9px] text-gray-500">
                ?
              </kbd>{" "}
              Help
            </li>
            <li>
              <kbd className="rounded border border-gray-300 bg-white px-1 font-mono text-[9px] text-gray-500">
                Del
              </kbd>{" "}
              Delete selected
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
