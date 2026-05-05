import { computeMarkAndSweepSteps } from "../../domain/algorithms/markAndSweep";
import { useSimulationStore } from "../simulationStore";

export type StepDirection = "forward" | "backward";

/**
 * Advances or rewinds the simulation by one step over the precomputed
 * step array stored in the simulation state.
 *
 * If no precomputed steps exist and the direction is "forward", the
 * algorithm is invoked once to compute them, then `currentStep` lands
 * on the first step.
 */
export const stepSimulation = (direction: StepDirection): void => {
  const { graph, simulationState } = useSimulationStore.getState();

  if (direction === "forward") {
    if (simulationState.steps.length === 0) {
      const steps = computeMarkAndSweepSteps(graph);
      if (steps.length === 0) return;
      useSimulationStore.setState({
        simulationState: {
          ...simulationState,
          steps,
          logs: steps.map((s) => s.log),
          currentStep: 0,
          phase: steps[0].phase,
        },
      });
      return;
    }

    const next = Math.min(
      simulationState.currentStep + 1,
      simulationState.steps.length - 1,
    );
    useSimulationStore.setState({
      simulationState: {
        ...simulationState,
        currentStep: next,
        phase: simulationState.steps[next].phase,
      },
    });
    return;
  }

  // backward
  if (simulationState.steps.length === 0) return;
  const prev = Math.max(simulationState.currentStep - 1, 0);
  useSimulationStore.setState({
    simulationState: {
      ...simulationState,
      currentStep: prev,
      phase: simulationState.steps[prev].phase,
    },
  });
};
