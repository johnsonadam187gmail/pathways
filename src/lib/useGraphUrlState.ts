// Hook to sync graph state (selected node, viewport) to URL search params
"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useGraphState } from "@/components/canvas/GraphContext";

function getUrlWithoutSelected(): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.delete("selected");
  return url.pathname + url.search;
}

export function useGraphUrlState() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { selectedNodeId, setSelectedNodeId } = useGraphState();
  const initialised = useRef(false);

  // Restore selectedNodeId from URL on mount
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    const nodeParam = searchParams.get("selected");
    if (nodeParam) {
      setSelectedNodeId(nodeParam);
    }
  }, [searchParams, setSelectedNodeId]);

  // Push selectedNodeId to URL on change — using history.replaceState
  // directly to avoid triggering Next.js router re-renders
  useEffect(() => {
    if (!initialised.current) return;

    const base = getUrlWithoutSelected();
    const newUrl = selectedNodeId
      ? `${base}${base.includes("?") ? "&" : "?"}selected=${encodeURIComponent(selectedNodeId)}`
      : base;

    if (newUrl !== window.location.href) {
      window.history.replaceState(null, "", newUrl);
    }
  }, [selectedNodeId, pathname]);
}
