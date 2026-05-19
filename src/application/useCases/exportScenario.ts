import type { IScenarioSerializer } from "../../domain/ports/IScenarioSerializer";
import { useSimulationStore } from "../simulationStore";

export const exportScenario = (serializer: IScenarioSerializer): string => {
  const { graph } = useSimulationStore.getState();
  return serializer.serialize(graph);
};
