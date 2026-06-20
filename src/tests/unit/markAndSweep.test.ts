import {
  addReference,
  getObject,
  getRoots,
  removeObject,
  toggleRoot,
} from "../../domain/models/MemoryGraph";
import {
  applyStepsToGraph,
  computeMarkAndSweepSteps,
} from "../../domain/algorithms/markAndSweep";
import { createMemoryObject } from "../../domain/models/MemoryObject";
import { createMemoryReference } from "../../domain/models/MemoryReference";
import type { MemoryGraph } from "../../domain/models/MemoryGraph";

const buildGraph = (
  objects: Array<{ id: string; label?: string; isRoot?: boolean }>,
  references: Array<[id: string, src: string, tgt: string]>,
): MemoryGraph => ({
  objects: objects.map((o) =>
    createMemoryObject(o.id, o.label ?? `Objeto ${o.id}`, { isRoot: o.isRoot }),
  ),
  references: references.map(([id, src, tgt]) =>
    createMemoryReference(id, src, tgt),
  ),
});

describe("MemoryGraph operations", () => {
  test("TC-U-02: removing an object also removes all its references (incoming and outgoing)", () => {
    const graph = buildGraph(
      [{ id: "A" }, { id: "B" }, { id: "C" }],
      [
        ["r-ab", "A", "B"],
        ["r-bc", "B", "C"],
        ["r-ca", "C", "A"],
      ],
    );

    const next = removeObject(graph, "B");

    expect(getObject(next, "B")).toBeUndefined();
    expect(next.references.find((r) => r.id === "r-ab")).toBeUndefined();
    expect(next.references.find((r) => r.id === "r-bc")).toBeUndefined();
    expect(next.references.find((r) => r.id === "r-ca")).toBeDefined();
    expect(next.references.length).toBe(1);
  });

  test("TC-U-03: a duplicate reference between the same source and target is rejected", () => {
    const graph = buildGraph(
      [{ id: "A" }, { id: "B" }],
      [["r-1", "A", "B"]],
    );

    const next = addReference(graph, createMemoryReference("r-2", "A", "B"));

    const refsAB = next.references.filter(
      (r) => r.sourceObjectId === "A" && r.targetObjectId === "B",
    );
    expect(refsAB.length).toBe(1);
  });

  test("TC-U-04: marking an object as root makes it part of the root set", () => {
    const graph = buildGraph([{ id: "A" }], []);

    const next = toggleRoot(graph, "A");

    expect(getObject(next, "A")?.isRoot).toBe(true);
    expect(getRoots(next).map((o) => o.id)).toEqual(["A"]);
  });
});

describe("computeMarkAndSweepSteps", () => {
  test("TC-U-05: simulation initial state before invoking the algorithm", () => {
    const graph = buildGraph(
      [{ id: "A", isRoot: true }, { id: "B" }, { id: "C" }],
      [
        ["r-ab", "A", "B"],
        ["r-bc", "B", "C"],
      ],
    );

    for (const obj of graph.objects) {
      expect(obj.marked).toBe(false);
      expect(obj.alive).toBe(true);
      expect(obj.visitedOrder).toBeNull();
    }
    for (const ref of graph.references) {
      expect(ref.traversed).toBe(false);
    }
  });

  test("TC-U-06: Mark phase marks a linear chain from a root and records visit order", () => {
    const graph = buildGraph(
      [{ id: "A", isRoot: true }, { id: "B" }, { id: "C" }],
      [
        ["r-ab", "A", "B"],
        ["r-bc", "B", "C"],
      ],
    );

    const steps = computeMarkAndSweepSteps(graph);
    const finalGraph = applyStepsToGraph(graph, steps);

    expect(getObject(finalGraph, "A")?.marked).toBe(true);
    expect(getObject(finalGraph, "B")?.marked).toBe(true);
    expect(getObject(finalGraph, "C")?.marked).toBe(true);
    expect(getObject(finalGraph, "A")?.visitedOrder).toBe(0);
    expect(getObject(finalGraph, "B")?.visitedOrder).toBe(1);
    expect(getObject(finalGraph, "C")?.visitedOrder).toBe(2);
  });

  test("TC-U-07: Mark phase does not mark an isolated object that is not a root", () => {
    const graph = buildGraph(
      [{ id: "A", isRoot: true }, { id: "C" }],
      [],
    );

    const steps = computeMarkAndSweepSteps(graph);
    const finalGraph = applyStepsToGraph(graph, steps);

    expect(getObject(finalGraph, "A")?.marked).toBe(true);
    expect(getObject(finalGraph, "C")?.marked).toBe(false);
  });

  test("TC-U-08: Mark phase traverses from multiple roots", () => {
    const graph = buildGraph(
      [
        { id: "A", isRoot: true },
        { id: "B" },
        { id: "C", isRoot: true },
        { id: "D" },
        { id: "E" },
      ],
      [
        ["r-ab", "A", "B"],
        ["r-cd", "C", "D"],
      ],
    );

    const steps = computeMarkAndSweepSteps(graph);
    const finalGraph = applyStepsToGraph(graph, steps);

    expect(getObject(finalGraph, "A")?.marked).toBe(true);
    expect(getObject(finalGraph, "B")?.marked).toBe(true);
    expect(getObject(finalGraph, "C")?.marked).toBe(true);
    expect(getObject(finalGraph, "D")?.marked).toBe(true);
    expect(getObject(finalGraph, "E")?.marked).toBe(false);
  });

  test("TC-U-09: a reachable cycle does not cause an infinite loop", () => {
    const graph = buildGraph(
      [{ id: "A", isRoot: true }, { id: "B" }, { id: "C" }],
      [
        ["r-ab", "A", "B"],
        ["r-bc", "B", "C"],
        ["r-cb", "C", "B"],
      ],
    );

    const steps = computeMarkAndSweepSteps(graph);
    const finalGraph = applyStepsToGraph(graph, steps);

    expect(getObject(finalGraph, "A")?.marked).toBe(true);
    expect(getObject(finalGraph, "B")?.marked).toBe(true);
    expect(getObject(finalGraph, "C")?.marked).toBe(true);
    const bVisits = steps.filter((s) => s.currentObjectId === "B").length;
    expect(bVisits).toBeLessThanOrEqual(1);
  });

  test("TC-U-10: an unreachable cycle remains unmarked", () => {
    const graph = buildGraph(
      [{ id: "A", isRoot: true }, { id: "B" }, { id: "C" }],
      [
        ["r-bc", "B", "C"],
        ["r-cb", "C", "B"],
      ],
    );

    const steps = computeMarkAndSweepSteps(graph);
    const finalGraph = applyStepsToGraph(graph, steps);

    expect(getObject(finalGraph, "A")?.marked).toBe(true);
    expect(getObject(finalGraph, "B")?.marked).toBe(false);
    expect(getObject(finalGraph, "C")?.marked).toBe(false);
  });

  test("TC-U-11: Sweep phase marks unmarked objects as not alive", () => {
    const graph = buildGraph(
      [{ id: "A", isRoot: true }, { id: "B" }],
      [],
    );

    const steps = computeMarkAndSweepSteps(graph);
    const finalGraph = applyStepsToGraph(graph, steps);

    expect(getObject(finalGraph, "A")?.alive).toBe(true);
    expect(getObject(finalGraph, "B")?.alive).toBe(false);
    expect(getObject(finalGraph, "B")).toBeDefined();
  });

  test("TC-U-12: Sweep phase does not collect marked objects", () => {
    const graph = buildGraph(
      [{ id: "A", isRoot: true }, { id: "B" }, { id: "C" }],
      [
        ["r-ab", "A", "B"],
        ["r-bc", "B", "C"],
      ],
    );

    const steps = computeMarkAndSweepSteps(graph);
    const finalGraph = applyStepsToGraph(graph, steps);

    expect(getObject(finalGraph, "A")?.alive).toBe(true);
    expect(getObject(finalGraph, "B")?.alive).toBe(true);
    expect(getObject(finalGraph, "C")?.alive).toBe(true);
  });

  test("TC-U-14: a self-reference A->A does not produce an infinite loop", () => {
    const graph = buildGraph(
      [{ id: "A", isRoot: true }],
      [["r-aa", "A", "A"]],
    );

    const steps = computeMarkAndSweepSteps(graph);
    const finalGraph = applyStepsToGraph(graph, steps);

    expect(getObject(finalGraph, "A")?.marked).toBe(true);
    expect(getObject(finalGraph, "A")?.visitedOrder).toBe(0);
    const aVisits = steps.filter((s) => s.currentObjectId === "A").length;
    expect(aVisits).toBeLessThanOrEqual(1);
  });
});
