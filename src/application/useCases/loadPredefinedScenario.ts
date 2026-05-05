import type { MemoryGraph } from "../../domain/models/MemoryGraph";
import { createInitialSimulationState } from "../../domain/models/SimulationState";
import { useSimulationStore } from "../simulationStore";

/**
 * Loads a predefined scenario into the store and resets the simulation state.
 *
 * The presentation layer is responsible for resolving the scenario id to a
 * MemoryGraph (e.g. by fetching the corresponding JSON file from
 * `infrastructure/json/scenarios/`) and passing it here.
 */
export const loadPredefinedScenario = (graph: MemoryGraph): void => {
  useSimulationStore.setState({
    graph,
    simulationState: createInitialSimulationState(),
  });
};
