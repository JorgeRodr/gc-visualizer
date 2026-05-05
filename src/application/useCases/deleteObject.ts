import {
  getObject,
  removeObject,
} from "../../domain/models/MemoryGraph";
import { useSimulationStore } from "../simulationStore";

export type DeleteObjectFailureReason = "simulation-active" | "not-found";

export interface DeleteObjectResult {
  deleted: boolean;
  deletedReferences: number;
  reason?: DeleteObjectFailureReason;
}

export const deleteObject = (id: string): DeleteObjectResult => {
  const { graph, simulationState } = useSimulationStore.getState();

  if (simulationState.phase !== "idle") {
    return { deleted: false, deletedReferences: 0, reason: "simulation-active" };
  }

  if (!getObject(graph, id)) {
    return { deleted: false, deletedReferences: 0, reason: "not-found" };
  }

  const deletedReferences = graph.references.filter(
    (r) => r.sourceObjectId === id || r.targetObjectId === id,
  ).length;

  useSimulationStore.setState({ graph: removeObject(graph, id) });

  return { deleted: true, deletedReferences };
};
