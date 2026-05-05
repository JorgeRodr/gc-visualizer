import type { MemoryGraph } from "../models/MemoryGraph";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface IGraphValidator {
  validate(graph: MemoryGraph): ValidationResult;
}
