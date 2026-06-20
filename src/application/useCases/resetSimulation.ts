import { createInitialSimulationState } from "../../domain/models/SimulationState";
import { useSimulationStore } from "../simulationStore";

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
