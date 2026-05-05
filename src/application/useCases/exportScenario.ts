import { scenarioSerializer } from "../../infrastructure/json/scenarioSerializer";
import { useSimulationStore } from "../simulationStore";

export const exportScenario = (): string => {
  const { graph } = useSimulationStore.getState();
  return scenarioSerializer.serialize(graph);
};
