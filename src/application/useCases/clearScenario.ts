import { createEmptyGraph } from "../../domain/models/MemoryGraph";
import { createInitialSimulationState } from "../../domain/models/SimulationState";
import { useSimulationStore } from "../simulationStore";

export const clearScenario = (): void => {
  useSimulationStore.setState({
    graph: createEmptyGraph(),
    simulationState: createInitialSimulationState(),
  });
};
