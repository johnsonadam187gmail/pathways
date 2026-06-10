"use client";

import { useEffect, useRef } from "react";

interface ShortcutItem {
  key: string;
  label: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { key: "Enter / F2", label: "Edit selected node" },
  { key: "Tab", label: "New branch from selected position" },
  { key: "N", label: "New pathway at canvas center" },
  { key: "Delete", label: "Remove selected node + edges" },
  { key: "Arrows", label: "Nudge selected node (×10 w/ Shift)" },
  { key: "Ctrl/Cmd + D", label: "Duplicate selected node" },
  { key: "Ctrl/Cmd + A", label: "Select all nodes" },
  { key: "?", label: "Toggle this overlay" },
  { key: "Esc", label: "Close overlays / deselect" },
];

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({
  open,
  onClose,
}: KeyboardShortcutsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm">
      <div
        ref={overlayRef}
        className="glass-strong rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4"
        role="dialog"
        aria-label="Keyboard shortcuts"
        data-testid="keyboard-shortcuts-modal"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-on-surface">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-colors"
            aria-label="Close shortcuts"
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

        <div className="space-y-2">
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between rounded-lg bg-surface-variant/30 px-3 py-2"
            >
              <span className="text-xs text-on-surface-variant">
                {shortcut.label}
              </span>
              <kbd className="rounded-md border border-outline-variant/30 bg-surface px-2 py-0.5 text-[11px] font-mono font-medium text-on-surface shadow-sm">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="mt-4 text-[10px] text-on-surface-variant/60 text-center">
          Press{" "}
          <kbd className="rounded border border-outline-variant/30 bg-surface-variant/50 px-1 font-mono text-[10px]">
            ?
          </kbd>{" "}
          or{" "}
          <kbd className="rounded border border-outline-variant/30 bg-surface-variant/50 px-1 font-mono text-[10px]">
            Esc
          </kbd>{" "}
          to close
        </p>
      </div>
    </div>
  );
}
