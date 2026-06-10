/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from "@jest/globals";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import type { KeyboardShortcutConfig } from "./useKeyboardShortcuts";

function createConfig(
  overrides: Partial<KeyboardShortcutConfig> = {},
): KeyboardShortcutConfig {
  return {
    nodes: [],
    selectedNodeId: null,
    contextMenuOpen: false,
    shortcutsOpen: false,
    onEnterEdit: jest.fn(),
    onTabBranch: jest.fn(),
    onNewPathway: jest.fn(),
    onToggleShortcuts: jest.fn(),
    onEscape: jest.fn(),
    onNudgeNode: jest.fn(),
    onDuplicate: jest.fn(),
    onSelectAll: jest.fn(),
    getCenterPosition: jest.fn(() => ({ x: 400, y: 300 })),
    ...overrides,
  };
}

function fireKey(key: string, overrides: Partial<KeyboardEventInit> = {}) {
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, ...overrides }),
  );
}

describe("useKeyboardShortcuts", () => {
  it("calls onEnterEdit on Enter when a node is selected", () => {
    const onEnterEdit = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts(
        createConfig({ selectedNodeId: "gc-1", onEnterEdit }),
      ),
    );
    act(() => fireKey("Enter"));
    expect(onEnterEdit).toHaveBeenCalledWith("gc-1");
  });

  it("calls onEnterEdit on F2 when a node is selected", () => {
    const onEnterEdit = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts(
        createConfig({ selectedNodeId: "gc-1", onEnterEdit }),
      ),
    );
    act(() => fireKey("F2"));
    expect(onEnterEdit).toHaveBeenCalledWith("gc-1");
  });

  it("does not call onEnterEdit when no node is selected", () => {
    const onEnterEdit = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts(createConfig({ selectedNodeId: null, onEnterEdit })),
    );
    act(() => fireKey("Enter"));
    expect(onEnterEdit).not.toHaveBeenCalled();
  });

  it("does not fire shortcuts when typing in an input", () => {
    const onEnterEdit = jest.fn();
    const input = document.createElement("input");

    renderHook(() =>
      useKeyboardShortcuts(
        createConfig({ selectedNodeId: "gc-1", onEnterEdit }),
      ),
    );

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, "target", { value: input });
    act(() => document.dispatchEvent(event));

    expect(onEnterEdit).not.toHaveBeenCalled();
  });

  it("calls onTabBranch on Tab when a GC node is selected", () => {
    const onTabBranch = jest.fn();
    const nodes = [
      {
        id: "gc-1",
        position: { x: 100, y: 200 },
        data: { type: "game-context" },
      },
    ];
    renderHook(() =>
      useKeyboardShortcuts(
        createConfig({
          selectedNodeId: "gc-1",
          nodes,
          onTabBranch,
        }),
      ),
    );
    act(() => fireKey("Tab"));
    expect(onTabBranch).toHaveBeenCalledWith("gc-1", { x: 100, y: 200 });
  });

  it("does not call onTabBranch on Tab when a non-GC node is selected", () => {
    const onTabBranch = jest.fn();
    const nodes = [
      {
        id: "ta-1",
        position: { x: 100, y: 200 },
        data: { type: "technique-action" },
      },
    ];
    renderHook(() =>
      useKeyboardShortcuts(
        createConfig({
          selectedNodeId: "ta-1",
          nodes,
          onTabBranch,
        }),
      ),
    );
    act(() => fireKey("Tab"));
    expect(onTabBranch).not.toHaveBeenCalled();
  });

  it("calls onNewPathway on N", () => {
    const onNewPathway = jest.fn();
    const getCenterPosition = jest.fn(() => ({ x: 400, y: 300 }));
    renderHook(() =>
      useKeyboardShortcuts(createConfig({ onNewPathway, getCenterPosition })),
    );
    act(() => fireKey("n"));
    expect(onNewPathway).toHaveBeenCalledWith({ x: 400, y: 300 });
  });

  it("toggles shortcuts on ?", () => {
    const onToggleShortcuts = jest.fn();
    renderHook(() => useKeyboardShortcuts(createConfig({ onToggleShortcuts })));
    act(() => fireKey("?"));
    expect(onToggleShortcuts).toHaveBeenCalledTimes(1);
  });

  it("calls onEscape when context menu is open", () => {
    const onEscape = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts(createConfig({ contextMenuOpen: true, onEscape })),
    );
    act(() => fireKey("Escape"));
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("calls onEscape when shortcuts modal is open", () => {
    const onEscape = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts(createConfig({ shortcutsOpen: true, onEscape })),
    );
    act(() => fireKey("Escape"));
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("does not call onEscape when nothing is open", () => {
    const onEscape = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts(
        createConfig({
          contextMenuOpen: false,
          shortcutsOpen: false,
          onEscape,
        }),
      ),
    );
    act(() => fireKey("Escape"));
    expect(onEscape).not.toHaveBeenCalled();
  });

  it("nudges selected node up on ArrowUp", () => {
    const onNudgeNode = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts(
        createConfig({ selectedNodeId: "gc-1", onNudgeNode }),
      ),
    );
    act(() => fireKey("ArrowUp"));
    expect(onNudgeNode).toHaveBeenCalledWith("gc-1", 0, -1);
  });

  it("nudges selected node right on ArrowRight", () => {
    const onNudgeNode = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts(
        createConfig({ selectedNodeId: "gc-1", onNudgeNode }),
      ),
    );
    act(() => fireKey("ArrowRight"));
    expect(onNudgeNode).toHaveBeenCalledWith("gc-1", 1, 0);
  });

  it("nudges by 10 with Shift+Arrow", () => {
    const onNudgeNode = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts(
        createConfig({ selectedNodeId: "gc-1", onNudgeNode }),
      ),
    );
    act(() => fireKey("ArrowDown", { shiftKey: true }));
    expect(onNudgeNode).toHaveBeenCalledWith("gc-1", 0, 10);
  });

  it("does not nudge when no node is selected", () => {
    const onNudgeNode = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts(createConfig({ selectedNodeId: null, onNudgeNode })),
    );
    act(() => fireKey("ArrowLeft"));
    expect(onNudgeNode).not.toHaveBeenCalled();
  });

  it("calls onDuplicate on Ctrl+D", () => {
    const onDuplicate = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts(
        createConfig({ selectedNodeId: "gc-1", onDuplicate }),
      ),
    );
    act(() => fireKey("d", { ctrlKey: true }));
    expect(onDuplicate).toHaveBeenCalledWith("gc-1");
  });

  it("calls onDuplicate on Cmd+D", () => {
    const onDuplicate = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts(
        createConfig({ selectedNodeId: "gc-1", onDuplicate }),
      ),
    );
    act(() => fireKey("d", { metaKey: true }));
    expect(onDuplicate).toHaveBeenCalledWith("gc-1");
  });

  it("does not call onDuplicate without selection", () => {
    const onDuplicate = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts(createConfig({ selectedNodeId: null, onDuplicate })),
    );
    act(() => fireKey("d", { ctrlKey: true }));
    expect(onDuplicate).not.toHaveBeenCalled();
  });

  it("calls onSelectAll on Ctrl+A", () => {
    const onSelectAll = jest.fn();
    renderHook(() => useKeyboardShortcuts(createConfig({ onSelectAll })));
    act(() => fireKey("a", { ctrlKey: true }));
    expect(onSelectAll).toHaveBeenCalledTimes(1);
  });

  it("calls onSelectAll on Cmd+A", () => {
    const onSelectAll = jest.fn();
    renderHook(() => useKeyboardShortcuts(createConfig({ onSelectAll })));
    act(() => fireKey("A", { metaKey: true }));
    expect(onSelectAll).toHaveBeenCalledTimes(1);
  });
});
