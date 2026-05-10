import {
  addReference,
  getObject,
  hasReferenceBetween,
} from "../../domain/models/MemoryGraph";
import { createMemoryReference } from "../../domain/models/MemoryReference";
import { useSimulationStore } from "../simulationStore";

export type CreateReferenceFailureReason =
  | "simulation-active"
  | "duplicate"
  | "missing-endpoint";

export interface CreateReferenceResult {
  created: boolean;
  referenceId?: string;
  reason?: CreateReferenceFailureReason;
}

export interface CreateReferenceHandles {
  source?: string | null;
  target?: string | null;
}

export const createReference = (
  sourceObjectId: string,
  targetObjectId: string,
  handles?: CreateReferenceHandles,
): CreateReferenceResult => {
  const { graph, simulationState } = useSimulationStore.getState();

  if (simulationState.phase !== "idle") {
    return { created: false, reason: "simulation-active" };
  }

  if (!getObject(graph, sourceObjectId) || !getObject(graph, targetObjectId)) {
    return { created: false, reason: "missing-endpoint" };
  }

  if (hasReferenceBetween(graph, sourceObjectId, targetObjectId)) {
    return { created: false, reason: "duplicate" };
  }

  const id = crypto.randomUUID();
  const ref = createMemoryReference(id, sourceObjectId, targetObjectId, {
    sourceHandle: handles?.source,
    targetHandle: handles?.target,
  });
  useSimulationStore.setState({ graph: addReference(graph, ref) });
  return { created: true, referenceId: id };
};
