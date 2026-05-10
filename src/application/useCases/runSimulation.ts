import { computeMarkAndSweepSteps } from "../../domain/algorithms/markAndSweep";
import { graphValidator } from "../../domain/validators/graphValidator";
import { useSimulationStore } from "../simulationStore";

export type RunSimulationFailureReason =
  | "no-roots"
  | "invalid-graph"
  | "empty-graph";

export interface RunSimulationOptions {
  /** When true, do not require at least one root before running. */
  skipRootCheck?: boolean;
}

export interface RunSimulationResult {
  ran: boolean;
  reason?: RunSimulationFailureReason;
  errors?: string[];
}

export const runSimulation = (
  options: RunSimulationOptions = {},
): RunSimulationResult => {
  const { graph } = useSimulationStore.getState();

  // Second line of defense: nothing to simulate on an empty graph. The UI
  // disables the entry buttons in this state, but a programmatic caller
  // (or a stale stepSimulation chain) could still reach this point.
  if (graph.objects.length === 0) {
    return { ran: false, reason: "empty-graph" };
  }

  const validation = graphValidator.validate(graph);
  if (!validation.isValid) {
    return {
      ran: false,
      reason: "invalid-graph",
      errors: validation.errors,
    };
  }

  const hasRoots = graph.objects.some((o) => o.isRoot);
  if (!hasRoots && !options.skipRootCheck) {
    return { ran: false, reason: "no-roots" };
  }

  const steps = computeMarkAndSweepSteps(graph);
  useSimulationStore.setState((s) => ({
    simulationState: {
      ...s.simulationState,
      steps,
      logs: steps.map((step) => step.log),
      currentStep: steps.length - 1,
      phase: "done",
    },
  }));

  return { ran: true };
};
