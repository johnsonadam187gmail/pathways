"use client";

import { useEffect, useRef } from "react";

export interface KeyboardShortcutConfig {
  nodes: {
    id: string;
    position: { x: number; y: number };
    data?: Record<string, unknown>;
  }[];
  selectedNodeId: string | null;
  contextMenuOpen: boolean;
  shortcutsOpen: boolean;
  onEnterEdit: (nodeId: string) => void;
  onTabBranch: (nodeId: string, position: { x: number; y: number }) => void;
  onNewPathway: (position: { x: number; y: number }) => void;
  onToggleShortcuts: () => void;
  onEscape: () => void;
  getCenterPosition: () => { x: number; y: number };
  onNudgeNode?: (nodeId: string, dx: number, dy: number) => void;
  onDuplicate?: (nodeId: string) => void;
  onSelectAll?: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutConfig) {
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const cfg = configRef.current;
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (!isInput) {
          e.preventDefault();
          cfg.onToggleShortcuts();
        }
        return;
      }

      if (isInput) return;

      const isMod = e.metaKey || e.ctrlKey;

      switch (e.key) {
        case "Enter":
        case "F2": {
          if (cfg.selectedNodeId) {
            e.preventDefault();
            cfg.onEnterEdit(cfg.selectedNodeId);
          }
          break;
        }
        case "Tab": {
          if (cfg.selectedNodeId) {
            e.preventDefault();
            const node = cfg.nodes.find((n) => n.id === cfg.selectedNodeId);
            if (node) {
              const nodeType = (
                node.data as Record<string, unknown> | undefined
              )?.type;
              if (nodeType === "game-context") {
                cfg.onTabBranch(node.id, node.position);
              }
            }
          }
          break;
        }
        case "n":
        case "N": {
          if (!isMod) {
            e.preventDefault();
            const position = cfg.getCenterPosition();
            cfg.onNewPathway(position);
          }
          break;
        }
        case "Escape": {
          if (cfg.contextMenuOpen || cfg.shortcutsOpen) {
            e.preventDefault();
            cfg.onEscape();
          }
          break;
        }
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight": {
          if (cfg.selectedNodeId && !isMod && !e.altKey) {
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            const delta: { dx: number; dy: number } =
              e.key === "ArrowUp"
                ? { dx: 0, dy: -step }
                : e.key === "ArrowDown"
                  ? { dx: 0, dy: step }
                  : e.key === "ArrowLeft"
                    ? { dx: -step, dy: 0 }
                    : { dx: step, dy: 0 };
            cfg.onNudgeNode?.(cfg.selectedNodeId, delta.dx, delta.dy);
          }
          break;
        }
        case "d":
        case "D": {
          if (isMod && cfg.selectedNodeId) {
            e.preventDefault();
            cfg.onDuplicate?.(cfg.selectedNodeId);
          }
          break;
        }
        case "a":
        case "A": {
          if (isMod) {
            e.preventDefault();
            cfg.onSelectAll?.();
          }
          break;
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
}
