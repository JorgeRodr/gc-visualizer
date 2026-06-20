import { applyStepsToGraph } from "../../domain/algorithms/markAndSweep";
import { getObject } from "../../domain/models/MemoryGraph";
import { createObject } from "../../application/useCases/createObject";
import { createReference } from "../../application/useCases/createReference";
import { runSimulation } from "../../application/useCases/runSimulation";
import { useSimulationStore } from "../../application/simulationStore";

describe("runSimulation use case", () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  test("TC-I-05: produces correct result on a mixed graph (multiple roots, isolated, unreachable cycle)", () => {
    const a = createObject({ label: "A", isRoot: true });
    const b = createObject({ label: "B" });
    const c = createObject({ label: "C", isRoot: true });
    const d = createObject({ label: "D" });
    const e = createObject({ label: "E" });
    const f = createObject({ label: "F" });
    const g = createObject({ label: "G" });
    createReference(a.id, b.id);
    createReference(c.id, d.id);
    createReference(f.id, g.id);
    createReference(g.id, f.id);

    const result = runSimulation();
    expect(result.ran).toBe(true);

    const { graph, simulationState } = useSimulationStore.getState();
    const finalGraph = applyStepsToGraph(graph, simulationState.steps);

    for (const id of [a.id, b.id, c.id, d.id]) {
      const o = getObject(finalGraph, id);
      expect(o?.marked).toBe(true);
      expect(o?.alive).toBe(true);
    }
    for (const id of [e.id, f.id, g.id]) {
      const o = getObject(finalGraph, id);
      expect(o?.marked).toBe(false);
      expect(o?.alive).toBe(false);
    }
  });

  test("TC-I-08: execution log contains all simulation events", () => {
    const a = createObject({ label: "A", isRoot: true });
    const b = createObject({ label: "B" });
    const c = createObject({ label: "C" });
    createReference(a.id, b.id);
    createReference(b.id, c.id);

    runSimulation();
    const { logs } = useSimulationStore.getState().simulationState;

    expect(logs.some((l) => l.toLowerCase().includes("mark"))).toBe(true);
    expect(logs.some((l) => l.includes("'A'"))).toBe(true);
    expect(logs.some((l) => l.includes("'B'"))).toBe(true);
    expect(logs.some((l) => l.includes("'C'"))).toBe(true);
    expect(logs.some((l) => l.toLowerCase().includes("sweep"))).toBe(true);
    expect(logs.some((l) => l.toLowerCase().includes("finalizada"))).toBe(true);
  });

  test("TC-I-07: graphValidator detects structural inconsistencies and blocks simulation", () => {
    const a = createObject({ label: "A", isRoot: true });
    useSimulationStore.setState((s) => ({
      graph: {
        ...s.graph,
        references: [
          {
            id: "bad-ref",
            sourceObjectId: a.id,
            targetObjectId: "nonexistent",
            traversed: false,
          },
        ],
      },
    }));

    const result = runSimulation();
    expect(result.ran).toBe(false);
    expect(result.reason).toBe("invalid-graph");
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);

    expect(useSimulationStore.getState().simulationState.steps).toEqual([]);
  });

  test("runSimulation rejects when no roots are defined (without skipRootCheck)", () => {
    createObject({ label: "A" });
    createObject({ label: "B" });

    const result = runSimulation();
    expect(result.ran).toBe(false);
    expect(result.reason).toBe("no-roots");
  });

  test("TC-I-17: runSimulation rejects an empty graph as a second line of defense", () => {
    const before = useSimulationStore.getState().simulationState;

    const result = runSimulation();
    expect(result.ran).toBe(false);
    expect(result.reason).toBe("empty-graph");

    expect(useSimulationStore.getState().simulationState).toEqual(before);
  });

  test("TC-I-18: runSimulation rejects empty graph even with skipRootCheck=true", () => {
    const result = runSimulation({ skipRootCheck: true });
    expect(result.ran).toBe(false);
    expect(result.reason).toBe("empty-graph");
  });

  test("runSimulation runs with skipRootCheck=true and collects all objects when no roots", () => {
    const a = createObject({ label: "A" });
    const b = createObject({ label: "B" });

    const result = runSimulation({ skipRootCheck: true });
    expect(result.ran).toBe(true);

    const { graph, simulationState } = useSimulationStore.getState();
    const finalGraph = applyStepsToGraph(graph, simulationState.steps);
    expect(getObject(finalGraph, a.id)?.alive).toBe(false);
    expect(getObject(finalGraph, b.id)?.alive).toBe(false);
  });
});
