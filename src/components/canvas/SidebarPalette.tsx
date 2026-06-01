"use client";

import { useState, type DragEvent } from "react";

const NODE_TYPES = [
  {
    type: "game-context",
    label: "GameContext",
    description: "Position / State",
    icon: "hub",
    color: "text-maml-offensive",
    borderColor: "border-maml-offensive",
    bgGlow: "shadow-maml-offensive/20",
  },
  {
    type: "technique-action",
    label: "TechniqueAction",
    description: "Technique / Action",
    icon: "account_tree",
    color: "text-maml-technique",
    borderColor: "border-maml-technique",
    bgGlow: "shadow-maml-technique/20",
  },
  {
    type: "terminal-sink",
    label: "TerminalSink",
    description: "End State",
    icon: "output",
    color: "text-maml-terminal",
    borderColor: "border-maml-terminal",
    bgGlow: "shadow-maml-terminal/20",
  },
];

export default function SidebarPalette() {
  const [expanded, setExpanded] = useState(false);

  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside
      className={`relative flex flex-col border-r border-outline-variant/20 bg-sidebar-surface/90 backdrop-blur-xl transition-all duration-300 ease-in-out ${
        expanded ? "w-48" : "w-14 md:w-16"
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div
        className={`flex flex-col items-center gap-4 pt-16 w-full ${expanded ? "px-3" : "px-2"}`}
      >
        {NODE_TYPES.map((nt) => (
          <div
            key={nt.type}
            draggable
            onDragStart={(e) => onDragStart(e, nt.type)}
            className={`flex items-center rounded-xl transition-all duration-200 cursor-grab active:cursor-grabbing group relative ${
              expanded
                ? `w-full gap-3 border ${nt.borderColor} ${nt.color} bg-surface/50 hover:bg-surface-variant/30 px-3 py-2.5 shadow-sm hover:shadow-md`
                : "w-10 h-10 justify-center hover:bg-surface-variant/30"
            }`}
            data-testid={`palette-item-${nt.type}`}
          >
            <svg
              className={`${expanded ? "h-5 w-5 shrink-0" : "h-5 w-5"} ${nt.color}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              {nt.icon === "hub" && (
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              )}
              {nt.icon === "account_tree" && (
                <path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3h7z" />
              )}
              {nt.icon === "output" && (
                <path d="M17 17h5v-5h-5v-5h-5v5H2v5h10v5h5v-5z" />
              )}
            </svg>

            {expanded ? (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-on-surface truncate">
                  {nt.label}
                </div>
                <div className="text-[10px] text-on-surface-variant truncate">
                  {nt.description}
                </div>
              </div>
            ) : (
              <div className="absolute left-full ml-2 px-2 py-1 rounded-lg glass text-xs text-on-surface whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                {nt.label}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className={`mt-auto border-t border-outline-variant/20 py-3 ${expanded ? "px-3" : "flex justify-center"}`}
      >
        {expanded ? (
          <div>
            <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Shortcuts
            </h3>
            <ul className="space-y-1 text-[10px] text-on-surface-variant">
              {[
                { key: "N", label: "New pathway" },
                { key: "Tab", label: "Add branch" },
                { key: "?", label: "Help" },
                { key: "Del", label: "Delete" },
              ].map(({ key, label }) => (
                <li key={key} className="flex items-center gap-1.5">
                  <kbd className="rounded border border-outline-variant bg-surface px-1 font-mono text-[9px] text-on-surface-variant">
                    {key}
                  </kbd>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <span className="text-on-surface-variant/40 text-[10px] font-medium tracking-wider writing-mode-vertical">
            KEYS
          </span>
        )}
      </div>
    </aside>
  );
}
