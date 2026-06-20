import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import type { Position } from "../../domain/models/MemoryObject";

const NODE_WIDTH = 140;
const NODE_HEIGHT = 60;
const EDGE_MARGIN = 24;
const MAX_ATTEMPTS = 100;
const FALLBACK_BOUNDS: FlowBounds = {
  minX: 0,
  minY: 0,
  maxX: 800,
  maxY: 500,
};

export interface FlowBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const overlaps = (a: Position, b: Position): boolean =>
  Math.abs(a.x - b.x) < NODE_WIDTH && Math.abs(a.y - b.y) < NODE_HEIGHT;

export const findFreePosition = (
  occupied: readonly Position[],
  bounds: FlowBounds = FALLBACK_BOUNDS,
  random: () => number = Math.random,
): Position => {
  const minX = bounds.minX + EDGE_MARGIN;
  const minY = bounds.minY + EDGE_MARGIN;
  const maxX = Math.max(minX + 1, bounds.maxX - NODE_WIDTH - EDGE_MARGIN);
  const maxY = Math.max(minY + 1, bounds.maxY - NODE_HEIGHT - EDGE_MARGIN);

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const candidate: Position = {
      x: Math.round(minX + random() * (maxX - minX)),
      y: Math.round(minY + random() * (maxY - minY)),
    };
    if (!occupied.some((p) => overlaps(candidate, p))) return candidate;
  }

  for (let y = minY; y <= maxY; y += NODE_HEIGHT) {
    for (let x = minX; x <= maxX; x += NODE_WIDTH) {
      const candidate: Position = { x, y };
      if (!occupied.some((p) => overlaps(candidate, p))) return candidate;
    }
  }
  return { x: maxX, y: maxY };
};

export const useVisibleFlowBoundsGetter = (): (() => FlowBounds) => {
  const rf = useReactFlow();
  return useCallback((): FlowBounds => {
    if (typeof document === "undefined") return FALLBACK_BOUNDS;
    const el = document.querySelector<HTMLElement>(
      '[data-testid="graph-canvas"]',
    );
    if (!el) return FALLBACK_BOUNDS;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return FALLBACK_BOUNDS;
    const tl = rf.screenToFlowPosition({ x: rect.left, y: rect.top });
    const br = rf.screenToFlowPosition({ x: rect.right, y: rect.bottom });
    return { minX: tl.x, minY: tl.y, maxX: br.x, maxY: br.y };
  }, [rf]);
};
