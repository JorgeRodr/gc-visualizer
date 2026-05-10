import type { MemoryGraph } from "../../domain/models/MemoryGraph";
import {
  createMemoryObject,
  type Position,
} from "../../domain/models/MemoryObject";
import { createMemoryReference } from "../../domain/models/MemoryReference";
import type {
  IScenarioParser,
  ValidationError,
} from "../../domain/ports/IScenarioParser";
import { graphValidator } from "../../domain/validators/graphValidator";

const MSG_FORMAT = "El archivo no tiene el formato correcto";
const MSG_MISSING_REF = "El archivo contiene referencias a objetos inexistentes";

const fail = (message: string, errors?: string[]): ValidationError => ({
  kind: "validation-error",
  message,
  errors: errors && errors.length > 0 ? errors : [message],
});

const isPosition = (value: unknown): value is Position =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { x?: unknown }).x === "number" &&
  typeof (value as { y?: unknown }).y === "number";

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const scenarioParser: IScenarioParser = {
  parse(raw: unknown): MemoryGraph | ValidationError {
    let data: unknown = raw;
    if (typeof raw === "string") {
      try {
        data = JSON.parse(raw);
      } catch {
        return fail(MSG_FORMAT);
      }
    }

    if (!isObjectRecord(data)) {
      return fail(MSG_FORMAT);
    }

    const objectsRaw = data["objects"];
    const referencesRaw = data["references"];
    if (!Array.isArray(objectsRaw) || !Array.isArray(referencesRaw)) {
      return fail(MSG_FORMAT, [
        "Faltan los arrays 'objects' y/o 'references'",
      ]);
    }

    const objects = [];
    for (const rawObj of objectsRaw) {
      if (!isObjectRecord(rawObj)) {
        return fail(MSG_FORMAT, ["Un objeto no es un registro válido"]);
      }
      const id = rawObj["id"];
      const label = rawObj["label"];
      const isRoot = rawObj["isRoot"];
      if (
        typeof id !== "string" ||
        typeof label !== "string" ||
        typeof isRoot !== "boolean"
      ) {
        return fail(MSG_FORMAT, [
          "Un objeto no tiene los campos 'id', 'label' e 'isRoot'",
        ]);
      }
      const positionRaw = rawObj["position"];
      objects.push(
        createMemoryObject(id, label, {
          isRoot,
          position: isPosition(positionRaw) ? positionRaw : undefined,
        }),
      );
    }

    const references = [];
    for (const rawRef of referencesRaw) {
      if (!isObjectRecord(rawRef)) {
        return fail(MSG_FORMAT, ["Una referencia no es un registro válido"]);
      }
      const id = rawRef["id"];
      const src = rawRef["sourceObjectId"];
      const tgt = rawRef["targetObjectId"];
      if (
        typeof id !== "string" ||
        typeof src !== "string" ||
        typeof tgt !== "string"
      ) {
        return fail(MSG_FORMAT, [
          "Una referencia no tiene los campos 'id', 'sourceObjectId' y 'targetObjectId'",
        ]);
      }
      const sourceHandleRaw = rawRef["sourceHandle"];
      const targetHandleRaw = rawRef["targetHandle"];
      references.push(
        createMemoryReference(id, src, tgt, {
          sourceHandle:
            typeof sourceHandleRaw === "string" ? sourceHandleRaw : undefined,
          targetHandle:
            typeof targetHandleRaw === "string" ? targetHandleRaw : undefined,
        }),
      );
    }

    const graph: MemoryGraph = { objects, references };
    const validation = graphValidator.validate(graph);
    if (!validation.isValid) {
      const refersToMissing = validation.errors.some((e) =>
        e.includes("inexistente"),
      );
      return fail(
        refersToMissing
          ? MSG_MISSING_REF
          : "El archivo contiene inconsistencias",
        validation.errors,
      );
    }

    return graph;
  },
};
