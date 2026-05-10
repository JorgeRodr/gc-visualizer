import {
  findFreePosition,
  type FlowBounds,
} from "../../presentation/utils/findFreePosition";
import type { Position } from "../../domain/models/MemoryObject";

const NODE_W = 140;
const NODE_H = 60;
const MARGIN = 24;

const overlaps = (a: Position, b: Position): boolean =>
  Math.abs(a.x - b.x) < NODE_W && Math.abs(a.y - b.y) < NODE_H;

const inBounds = (p: Position, b: FlowBounds): boolean =>
  p.x >= b.minX + MARGIN &&
  p.y >= b.minY + MARGIN &&
  p.x <= b.maxX - NODE_W - MARGIN &&
  p.y <= b.maxY - NODE_H - MARGIN;

const seqRandom = (values: number[]): (() => number) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe("findFreePosition", () => {
  const bounds: FlowBounds = { minX: 0, minY: 0, maxX: 800, maxY: 500 };

  test("returns a position within the flow bounds when nothing is occupied", () => {
    const p = findFreePosition([], bounds, seqRandom([0.5, 0.5]));
    expect(inBounds(p, bounds)).toBe(true);
  });

  test("uses the injected random function deterministically", () => {
    const p = findFreePosition([], bounds, seqRandom([0, 0]));
    expect(p).toEqual({ x: bounds.minX + MARGIN, y: bounds.minY + MARGIN });
  });

  test("respects non-zero bounds origin (zoomed/panned viewport)", () => {
    // Simulate a viewport that, in flow coordinates, sits at (200..600, 150..450).
    // This mirrors the situation after fitView zooms in on a single node.
    const zoomed: FlowBounds = { minX: 200, minY: 150, maxX: 600, maxY: 450 };
    const p = findFreePosition([], zoomed, seqRandom([0, 0]));
    expect(p).toEqual({ x: zoomed.minX + MARGIN, y: zoomed.minY + MARGIN });
    expect(inBounds(p, zoomed)).toBe(true);
  });

  test("returns a position that does not overlap a single occupied node", () => {
    const occupied: Position[] = [{ x: 100, y: 100 }];
    const usableW = bounds.maxX - bounds.minX - NODE_W - 2 * MARGIN;
    const usableH = bounds.maxY - bounds.minY - NODE_H - 2 * MARGIN;
    const random = seqRandom([
      // First attempt lands on top of (100, 100) → must be rejected.
      (100 - bounds.minX - MARGIN) / usableW,
      (100 - bounds.minY - MARGIN) / usableH,
      // Second attempt: max corner — far from (100, 100).
      1,
      1,
    ]);

    const p = findFreePosition(occupied, bounds, random);
    expect(inBounds(p, bounds)).toBe(true);
    expect(overlaps(p, occupied[0])).toBe(false);
  });

  test("returns a non-overlapping position when many nodes are present", () => {
    const occupied: Position[] = [
      { x: 50, y: 50 },
      { x: 250, y: 50 },
      { x: 450, y: 50 },
      { x: 50, y: 200 },
      { x: 250, y: 200 },
    ];

    const usableW = bounds.maxX - bounds.minX - NODE_W - 2 * MARGIN;
    const usableH = bounds.maxY - bounds.minY - NODE_H - 2 * MARGIN;
    // Force every random sample to collide with the first occupied node so the
    // randomized loop exhausts and the fallback tile-scan must take over.
    const random = seqRandom([
      (50 - bounds.minX - MARGIN) / usableW,
      (50 - bounds.minY - MARGIN) / usableH,
    ]);

    const p = findFreePosition(occupied, bounds, random);
    expect(inBounds(p, bounds)).toBe(true);
    for (const q of occupied) {
      expect(overlaps(p, q)).toBe(false);
    }
  });

  test("two consecutive calls with the same occupied set yield non-overlapping positions when seeded differently", () => {
    const first = findFreePosition([], bounds, seqRandom([0.1, 0.1]));
    const second = findFreePosition([first], bounds, seqRandom([0.9, 0.9]));
    expect(overlaps(first, second)).toBe(false);
  });

  test("default bounds are used when none are provided", () => {
    const p = findFreePosition([]);
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeGreaterThanOrEqual(0);
  });
});
