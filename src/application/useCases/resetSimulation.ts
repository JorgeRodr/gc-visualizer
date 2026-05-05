import { createInitialSimulationState } from "../../domain/models/SimulationState";
import { useSimulationStore } from "../simulationStore";

/**
 * Resets the simulation state (phase, steps, logs, marks) while preserving
 * the structural graph (objects, references, roots).
 *
 * Defensively also clears any stale simulation flags on graph entities,
 * so subsequent reads of the structural graph never carry residual marks.
 */
export const resetSimulation = (): void => {
  useSimulationStore.setState((s) => ({
    simulationState: createInitialSimulationState(),
    graph: {
      objects: s.graph.objects.map((o) => ({
        ...o,
        marked: false,
        alive: true,
        visitedOrder: null,
      })),
      references: s.graph.references.map((r) => ({ ...r, traversed: false })),
    },
  }));
};
