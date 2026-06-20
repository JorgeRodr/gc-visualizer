import type { MemoryGraph } from "../../domain/models/MemoryGraph";
import { createInitialSimulationState } from "../../domain/models/SimulationState";
import { useSimulationStore } from "../simulationStore";

export const loadPredefinedScenario = (graph: MemoryGraph): void => {
  useSimulationStore.setState({
    graph,
    simulationState: createInitialSimulationState(),
  });
};
