"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useSyncExternalStore,
  Suspense,
} from "react";
import GraphCanvas from "@/components/canvas/GraphCanvas";
import NodeDetailPanel from "@/components/canvas/NodeDetailPanel";
import SidebarPalette from "@/components/canvas/SidebarPalette";
import { GraphProvider, useGraphState } from "@/components/canvas/GraphContext";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { useGraphLoader } from "@/lib/useGraphLoader";
import { useGraphUrlState } from "@/lib/useGraphUrlState";
import { SEED_NODES, SEED_EDGES } from "@/lib/seed-data";

function UrlStateSync() {
  useGraphUrlState();
  return null;
}

function FloatingToolbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between rounded-full h-10 px-5 w-[calc(100%-2rem)] max-w-5xl glass">
      <div className="flex items-center gap-3">
        <svg
          className="h-5 w-5 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span className="text-sm font-bold tracking-tight text-on-surface">
          Pathways
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-surface-variant/50 px-3 py-1 text-xs text-on-surface-variant">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="text-[10px]">Cmd+K</span>
        </div>

        <button
          onClick={toggleTheme}
          className="flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <button
          className="flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-colors"
          aria-label="Help"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

function CanvasWithLoader() {
  const { setNodes, setEdges } = useGraphState();
  const { loadState, error, load } = useGraphLoader();
  const [useDemo, setUseDemo] = useState(false);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const loadFromApi = useCallback(async () => {
    setUseDemo(false);
    const result = await load();
    if (result) {
      setNodes(result.nodes);
      setEdges(result.edges);
    }
  }, [load, setNodes, setEdges]);

  const loadDemo = useCallback(() => {
    setUseDemo(true);
    setNodes(SEED_NODES);
    setEdges(SEED_EDGES);
  }, [setNodes, setEdges]);

  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!isClient) return;
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    load().then((result) => {
      if (result) {
        setNodes(result.nodes);
        setEdges(result.edges);
      } else {
        loadDemo();
      }
    });
  }, [isClient, load, loadDemo, setNodes, setEdges]);

  if (!isClient) {
    return null;
  }

  if (loadState === "error" && !useDemo) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="glass-strong rounded-xl p-6 text-center max-w-sm">
          <div className="mb-3 flex justify-center">
            <svg
              className="h-8 w-8 text-maml-defensive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <p className="mb-1 text-sm font-medium text-on-surface">
            Failed to connect to database
          </p>
          <p className="mb-4 text-xs text-on-surface-variant">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={loadFromApi}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-on-primary hover:opacity-90 transition-opacity"
            >
              Retry Connection
            </button>
            <button
              onClick={loadDemo}
              className="rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-variant transition-colors"
            >
              Load Demo Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <Suspense fallback={null}>
        <UrlStateSync />
      </Suspense>
      <SidebarPalette />
      <div className="flex-1">
        <GraphCanvas />
      </div>
      <NodeDetailPanel />
      {loadState === "loading" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full glass px-4 py-1.5 text-xs text-on-surface shadow-lg flex items-center gap-2">
          <svg
            className="h-3 w-3 animate-spin text-primary"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading graph data...
        </div>
      )}
      {useDemo && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 rounded-full glass px-4 py-1.5 text-xs text-on-surface shadow-lg items-center">
          <span className="flex items-center gap-1.5">
            <svg
              className="h-3 w-3 text-maml-danger"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 9v4M12 17h.01" />
            </svg>
            Showing demo data
          </span>
          <button
            onClick={loadFromApi}
            className="font-medium text-primary hover:underline"
          >
            Connect to DB
          </button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <GraphProvider>
        <div className="h-screen w-screen bg-canvas-bg">
          <FloatingToolbar />
          <main className="h-full pt-14">
            <CanvasWithLoader />
          </main>
        </div>
      </GraphProvider>
    </ThemeProvider>
  );
}
