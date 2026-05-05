import type { MemoryGraph } from "../models/MemoryGraph";

export interface ValidationError {
  kind: "validation-error";
  message: string;
  errors: string[];
}

export const isValidationError = (
  value: MemoryGraph | ValidationError,
): value is ValidationError =>
  (value as ValidationError).kind === "validation-error";

export interface IScenarioParser {
  parse(raw: unknown): MemoryGraph | ValidationError;
}
