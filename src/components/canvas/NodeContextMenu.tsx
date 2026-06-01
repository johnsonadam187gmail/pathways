"use client";

import { useCallback, useEffect, useRef } from "react";
import { useGraphState } from "./GraphContext";
import { useGraphCreation } from "@/lib/useGraphCreation";
import type { Node as FlowNode, Edge as FlowEdge } from "reactflow";

export interface ContextMenuState {
  open: boolean;
  x: number;
  y: number;
  type: "node" | "edge" | "canvas";
  node?: FlowNode;
  edge?: FlowEdge;
}

interface NodeContextMenuProps {
  menu: ContextMenuState;
  onClose: () => void;
}

const SEPARATOR = "---";

type MenuItem =
  | { label: string; action: string; icon: string }
  | typeof SEPARATOR;

function getMenuItems(
  type: "node" | "edge" | "canvas",
  nodeType?: string,
): MenuItem[] {
  if (type === "canvas") {
    return [
      { label: "New Pathway", action: "new-pathway", icon: "plus" },
      { label: "Paste", action: "paste", icon: "clipboard" },
    ];
  }

  if (type === "edge") {
    return [
      { label: "Edit Decision", action: "edit-edge", icon: "edit" },
      SEPARATOR,
      { label: "Delete", action: "delete-edge", icon: "trash" },
    ];
  }

  switch (nodeType) {
    case "game-context":
      return [
        { label: "New Branch", action: "new-branch", icon: "git-branch" },
        { label: "New Decision", action: "new-decision", icon: "shuffle" },
        SEPARATOR,
        { label: "Edit", action: "edit", icon: "edit" },
        { label: "Delete", action: "delete", icon: "trash" },
      ];
    case "technique-action":
      return [
        { label: "New Result", action: "new-result", icon: "target" },
        SEPARATOR,
        { label: "Edit", action: "edit", icon: "edit" },
        { label: "Delete", action: "delete", icon: "trash" },
      ];
    case "terminal-sink":
      return [
        { label: "Edit", action: "edit", icon: "edit" },
        { label: "Delete", action: "delete", icon: "trash" },
      ];
    default:
      return [
        { label: "Edit", action: "edit", icon: "edit" },
        { label: "Delete", action: "delete", icon: "trash" },
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
    edges,
  } = useGraphState();
  const { createBranch, createResultFromTechnique, createFullPathway } =
    useGraphCreation();

  const menuRef = useRef<HTMLDivElement>(null);

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
        case "edit":
        case "edit-edge": {
          if (menu.node) {
            setSelectedNodeId(menu.node.id);
            setSelectedEdgeId(null);
          } else if (menu.edge) {
            setSelectedEdgeId(menu.edge.id);
            setSelectedNodeId(null);
          }
          break;
        }
        case "delete-edge": {
          if (menu.edge) {
            removeEdges([menu.edge.id]);
            setSelectedEdgeId(null);
          }
          break;
        }
        case "delete": {
          if (menu.node) {
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

  const iconMap: Record<string, string> = {
    plus: "M12 5v14M5 12h14",
    clipboard:
      "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z",
    "git-branch":
      "M6 3v12M18 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM18 9a3 3 0 01-3 3h-3a3 3 0 00-3 3",
    shuffle: "M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5",
    edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    trash:
      "M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
    target:
      "M12 2a10 10 0 1010 10M12 2v4M12 2a10 10 0 0110 10M22 12h-4M12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z",
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-44 rounded-xl glass-strong py-1"
      style={{ left: menu.x, top: menu.y }}
      role="menu"
      data-testid="context-menu"
    >
      {items.map((item, i) =>
        item === SEPARATOR ? (
          <div
            key={`sep-${i}`}
            className="my-1 border-t border-outline-variant/20"
            role="separator"
          />
        ) : (
          <button
            key={item.action}
            onClick={() => handleAction(item.action)}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-xs text-on-surface hover:bg-surface-variant/50 transition-colors"
            role="menuitem"
            data-testid={`menu-item-${item.action}`}
          >
            <svg
              className="h-3.5 w-3.5 text-on-surface-variant shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d={iconMap[item.icon] ?? iconMap.edit} />
            </svg>
            <span>{item.label}</span>
          </button>
        ),
      )}
    </div>
  );
}
