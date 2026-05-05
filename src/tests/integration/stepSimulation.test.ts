import { computeMarkAndSweepSteps } from "../../domain/algorithms/markAndSweep";
import { createObject } from "../../application/useCases/createObject";
import { createReference } from "../../application/useCases/createReference";
import { stepSimulation } from "../../application/useCases/stepSimulation";
import { useSimulationStore } from "../../application/simulationStore";

describe("stepSimulation use case", () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  test("TC-I-04: forward and backward navigation over precomputed steps", () => {
    const a = createObject({ label: "A", isRoot: true });
    const b = createObject({ label: "B" });
    const c = createObject({ label: "C" });
    createReference(a.id, b.id);
    createReference(b.id, c.id);

    // Precondition: steps precomputed, currentStep at 0
    const { graph } = useSimulationStore.getState();
    const steps = computeMarkAndSweepSteps(graph);
    useSimulationStore.getState().updateSimulationState({
      steps,
      logs: steps.map((s) => s.log),
      currentStep: 0,
      phase: steps[0].phase,
    });
    expect(steps.length).toBeGreaterThanOrEqual(4);

    stepSimulation("forward");
    stepSimulation("forward");
    stepSimulation("forward");
    expect(useSimulationStore.getState().simulationState.currentStep).toBe(3);

    stepSimulation("backward");
    expect(useSimulationStore.getState().simulationState.currentStep).toBe(2);
  });

  test("forward computes steps lazily when none precomputed", () => {
    const a = createObject({ label: "A", isRoot: true });
    const b = createObject({ label: "B" });
    createReference(a.id, b.id);

    expect(useSimulationStore.getState().simulationState.steps.length).toBe(0);

    stepSimulation("forward");

    const { simulationState } = useSimulationStore.getState();
    expect(simulationState.steps.length).toBeGreaterThan(0);
    expect(simulationState.currentStep).toBe(0);
  });

  test("forward does not advance past last step", () => {
    const a = createObject({ label: "A", isRoot: true });
    const b = createObject({ label: "B" });
    createReference(a.id, b.id);

    const { graph } = useSimulationStore.getState();
    const steps = computeMarkAndSweepSteps(graph);
    useSimulationStore.getState().updateSimulationState({
      steps,
      currentStep: steps.length - 1,
      phase: steps[steps.length - 1].phase,
    });

    stepSimulation("forward");

    expect(useSimulationStore.getState().simulationState.currentStep).toBe(
      steps.length - 1,
    );
  });

  test("backward does not regress before step 0", () => {
    const a = createObject({ label: "A", isRoot: true });
    createReference(a.id, a.id);

    const { graph } = useSimulationStore.getState();
    const steps = computeMarkAndSweepSteps(graph);
    useSimulationStore.getState().updateSimulationState({
      steps,
      currentStep: 0,
      phase: steps[0].phase,
    });

    stepSimulation("backward");

    expect(useSimulationStore.getState().simulationState.currentStep).toBe(0);
  });
});
