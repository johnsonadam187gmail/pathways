// Main Canvas Page — MAML Tactical Graph Viewer
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
import { useGraphLoader } from "@/lib/useGraphLoader";
import { useGraphUrlState } from "@/lib/useGraphUrlState";
import { SEED_NODES, SEED_EDGES } from "@/lib/seed-data";

function UrlStateSync() {
  useGraphUrlState();
  return null;
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
    const posSample = SEED_NODES.slice(0, 3).map(
      (n) => `${n.id}:(${n.position.x},${n.position.y})`,
    );
    console.log("[Canvas] loadDemo — sample positions:", posSample);
    console.log("[Canvas] loadDemo — total nodes:", SEED_NODES.length);
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-2 text-sm font-medium text-red-800">
            Failed to connect to database
          </p>
          <p className="mb-4 text-xs text-red-600">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={loadFromApi}
              className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              Retry Connection
            </button>
            <button
              onClick={loadDemo}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded bg-blue-600 px-3 py-1.5 text-xs text-white shadow-lg">
          Loading graph data...
        </div>
      )}
      {useDemo && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 rounded bg-amber-100 px-3 py-1.5 text-xs text-amber-800 shadow-lg">
          <span>Showing demo data</span>
          <button
            onClick={loadFromApi}
            className="font-medium underline hover:text-amber-900"
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
    <GraphProvider>
      <div className="h-screen w-screen">
        <header className="absolute left-0 right-0 top-0 z-10 flex h-12 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-sm">
          <h1 className="text-sm font-bold uppercase tracking-wider text-gray-800">
            Pathways
            <span className="ml-2 font-normal text-gray-400">
              MAML Tactical Graph
            </span>
          </h1>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="hidden sm:inline">
              Legend:{" "}
              <span className="font-medium text-green-500">Offensive</span>{" "}
              <span className="font-medium text-red-500">Defensive</span>{" "}
              <span className="font-medium text-slate-500">Neutral</span>{" "}
              <span className="font-medium text-amber-500">Danger</span>
              {" | "}
              <span className="font-medium text-violet-500">
                Technique
              </span>{" "}
              <span className="font-medium text-slate-800">Terminal</span>
            </span>
          </div>
        </header>

        <main className="h-full pt-12">
          <CanvasWithLoader />
        </main>
      </div>
    </GraphProvider>
  );
}
