import { createInitialSimulationState } from "../../domain/models/SimulationState";
import {
  isValidationError,
  type IScenarioParser,
  type ValidationError,
} from "../../domain/ports/IScenarioParser";
import { useSimulationStore } from "../simulationStore";

export interface ImportScenarioResult {
  imported: boolean;
  error?: ValidationError;
}

export const importScenario = (
  parser: IScenarioParser,
  raw: string | unknown,
): ImportScenarioResult => {
  const parsed = parser.parse(raw);
  if (isValidationError(parsed)) {
    return { imported: false, error: parsed };
  }

  useSimulationStore.setState({
    graph: parsed,
    simulationState: createInitialSimulationState(),
  });
  return { imported: true };
};
