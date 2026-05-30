// Node Context Menu — Right-click menus for MAML graph entities
"use client";

import { useCallback, useEffect, useRef } from "react";
import { useGraphState } from "./GraphContext";
import { useGraphCreation } from "@/lib/useGraphCreation";
import type { Node as FlowNode } from "reactflow";

export interface ContextMenuState {
  open: boolean;
  x: number;
  y: number;
  type: "node" | "canvas";
  node?: FlowNode;
}

interface NodeContextMenuProps {
  menu: ContextMenuState;
  onClose: () => void;
}

const SEPARATOR = "---";

type MenuItem =
  | { label: string; action: string; icon?: string }
  | typeof SEPARATOR;

function getMenuItems(type: "node" | "canvas", nodeType?: string): MenuItem[] {
  if (type === "canvas") {
    return [
      { label: "New Pathway", action: "new-pathway", icon: "➕" },
      { label: "Paste", action: "paste", icon: "📋" },
    ];
  }

  switch (nodeType) {
    case "game-context":
      return [
        { label: "New Branch", action: "new-branch", icon: "🌿" },
        { label: "New Decision", action: "new-decision", icon: "🔀" },
        SEPARATOR,
        { label: "Edit", action: "edit", icon: "✏️" },
        { label: "Delete", action: "delete", icon: "🗑️" },
      ];
    case "technique-action":
      return [
        { label: "New Result", action: "new-result", icon: "🎯" },
        SEPARATOR,
        { label: "Edit", action: "edit", icon: "✏️" },
        { label: "Delete", action: "delete", icon: "🗑️" },
      ];
    case "terminal-sink":
      return [
        { label: "Edit", action: "edit", icon: "✏️" },
        { label: "Delete", action: "delete", icon: "🗑️" },
      ];
    default:
      return [
        { label: "Edit", action: "edit", icon: "✏️" },
        { label: "Delete", action: "delete", icon: "🗑️" },
      ];
  }
}

export default function NodeContextMenu({
  menu,
  onClose,
}: NodeContextMenuProps) {
  const {
    setSelectedNodeId,
    setSelectedEdgeId,
    removeNodes,
    removeEdges,
    nodes,
    edges,
  } = useGraphState();
  const { createBranch, createResultFromTechnique, createFullPathway } =
    useGraphCreation();

  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!menu.open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // Delay adding listener to avoid the right-click itself triggering close
    const id = setTimeout(() => {
      document.addEventListener("click", handleClick);
      document.addEventListener("keydown", handleEsc);
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menu.open, onClose]);

  const handleAction = useCallback(
    (action: string) => {
      onClose();

      switch (action) {
        case "edit": {
          if (menu.node) {
            setSelectedNodeId(menu.node.id);
            setSelectedEdgeId(null);
          }
          break;
        }
        case "delete": {
          if (menu.node) {
            // Remove connected edges first
            const connectedEdges = edges
              .filter(
                (e) => e.source === menu.node!.id || e.target === menu.node!.id,
              )
              .map((e) => e.id);
            if (connectedEdges.length > 0) {
              removeEdges(connectedEdges);
            }
            removeNodes([menu.node.id]);
            setSelectedNodeId(null);
          }
          break;
        }
        case "new-branch": {
          if (menu.node) {
            createBranch(menu.node.id, menu.node.position);
          }
          break;
        }
        case "new-decision": {
          // Same as new-branch for now — creates a different technique path
          if (menu.node) {
            createBranch(menu.node.id, {
              x: menu.node.position.x + 40,
              y: menu.node.position.y + 100,
            });
          }
          break;
        }
        case "new-result": {
          if (menu.node) {
            createResultFromTechnique(menu.node.id, menu.node.position);
          }
          break;
        }
        case "new-pathway": {
          createFullPathway({ x: menu.x, y: menu.y });
          break;
        }
        case "paste": {
          // Future: clipboard paste of pathway data
          break;
        }
      }
    },
    [
      menu,
      onClose,
      setSelectedNodeId,
      setSelectedEdgeId,
      removeNodes,
      removeEdges,
      edges,
      createBranch,
      createResultFromTechnique,
      createFullPathway,
    ],
  );

  if (!menu.open) return null;

  const items = getMenuItems(menu.type, menu.node?.data?.type as string);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
      style={{ left: menu.x, top: menu.y }}
      role="menu"
      data-testid="context-menu"
    >
      {items.map((item, i) =>
        item === SEPARATOR ? (
          <div
            key={`sep-${i}`}
            className="my-1 border-t border-gray-100"
            role="separator"
          />
        ) : (
          <button
            key={item.action}
            onClick={() => handleAction(item.action)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100"
            role="menuitem"
            data-testid={`menu-item-${item.action}`}
          >
            {item.icon && (
              <span className="w-4 text-center text-xs" aria-hidden>
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
          </button>
        ),
      )}
    </div>
  );
}
