import type { MemoryGraph } from "../models/MemoryGraph";
import type { IGraphValidator, ValidationResult } from "./IGraphValidator";

export const graphValidator: IGraphValidator = {
  validate(graph: MemoryGraph): ValidationResult {
    const errors: string[] = [];

    const objectIds = new Set<string>();
    for (const obj of graph.objects) {
      if (objectIds.has(obj.id)) {
        errors.push(`Identificador de objeto duplicado: '${obj.id}'`);
      } else {
        objectIds.add(obj.id);
      }
    }

    const referenceIds = new Set<string>();
    const seenPairs = new Set<string>();
    for (const ref of graph.references) {
      if (referenceIds.has(ref.id)) {
        errors.push(`Identificador de referencia duplicado: '${ref.id}'`);
      } else {
        referenceIds.add(ref.id);
      }

      if (!objectIds.has(ref.sourceObjectId)) {
        errors.push(
          `La referencia '${ref.id}' parte de un objeto inexistente: '${ref.sourceObjectId}'`,
        );
      }
      if (!objectIds.has(ref.targetObjectId)) {
        errors.push(
          `La referencia '${ref.id}' apunta a un objeto inexistente: '${ref.targetObjectId}'`,
        );
      }

      const pairKey = `${ref.sourceObjectId}->${ref.targetObjectId}`;
      if (seenPairs.has(pairKey)) {
        errors.push(
          `Referencia duplicada entre '${ref.sourceObjectId}' y '${ref.targetObjectId}'`,
        );
      } else {
        seenPairs.add(pairKey);
      }
    }

    return { isValid: errors.length === 0, errors };
  },
};
