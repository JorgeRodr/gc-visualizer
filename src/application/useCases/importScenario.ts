import { createInitialSimulationState } from "../../domain/models/SimulationState";
import {
  isValidationError,
  type ValidationError,
} from "../../domain/ports/IScenarioParser";
import { scenarioParser } from "../../infrastructure/json/scenarioParser";
import { useSimulationStore } from "../simulationStore";

export interface ImportScenarioResult {
  imported: boolean;
  error?: ValidationError;
}

export const importScenario = (raw: string | unknown): ImportScenarioResult => {
  const parsed = scenarioParser.parse(raw);
  if (isValidationError(parsed)) {
    return { imported: false, error: parsed };
  }

  useSimulationStore.setState({
    graph: parsed,
    simulationState: createInitialSimulationState(),
  });
  return { imported: true };
};
