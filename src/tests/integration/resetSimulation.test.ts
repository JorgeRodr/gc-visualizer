import { createObject } from "../../application/useCases/createObject";
import { createReference } from "../../application/useCases/createReference";
import { resetSimulation } from "../../application/useCases/resetSimulation";
import { runSimulation } from "../../application/useCases/runSimulation";
import { useSimulationStore } from "../../application/simulationStore";

describe("resetSimulation use case", () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  test("TC-I-03: simulation state is clean before running the simulation", () => {
    const a = createObject({ label: "A", isRoot: true });
    const b = createObject({ label: "B" });
    createReference(a.id, b.id);

    const runResult = runSimulation();
    expect(runResult.ran).toBe(true);
    expect(useSimulationStore.getState().simulationState.steps.length).toBeGreaterThan(0);

    resetSimulation();

    const { graph, simulationState } = useSimulationStore.getState();
    expect(simulationState.phase).toBe("idle");
    expect(simulationState.steps).toEqual([]);
    expect(simulationState.logs).toEqual([]);
    expect(simulationState.currentStep).toBe(0);
    for (const obj of graph.objects) {
      expect(obj.marked).toBe(false);
      expect(obj.alive).toBe(true);
      expect(obj.visitedOrder).toBeNull();
    }
    for (const ref of graph.references) {
      expect(ref.traversed).toBe(false);
    }
    // Scenario preserved
    expect(graph.objects.length).toBe(2);
    expect(graph.references.length).toBe(1);
  });

  test("TC-I-06: reset preserves scenario after a complete simulation", () => {
    const a = createObject({ label: "A", isRoot: true });
    const b = createObject({ label: "B" });
    const c = createObject({ label: "C" });
    createReference(a.id, b.id);

    runSimulation();
    expect(useSimulationStore.getState().simulationState.phase).toBe("done");

    resetSimulation();

    const { graph, simulationState } = useSimulationStore.getState();
    expect(simulationState.phase).toBe("idle");
    expect(simulationState.steps).toEqual([]);
    expect(simulationState.logs).toEqual([]);
    // Roots and objects preserved
    expect(graph.objects.find((o) => o.id === a.id)?.isRoot).toBe(true);
    expect(graph.objects.length).toBe(3);
    expect(graph.references.length).toBe(1);
    expect(graph.objects.find((o) => o.id === c.id)).toBeDefined();
  });
});
