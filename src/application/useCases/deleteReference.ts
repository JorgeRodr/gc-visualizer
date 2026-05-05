import { removeReference } from "../../domain/models/MemoryGraph";
import { useSimulationStore } from "../simulationStore";

export type DeleteReferenceFailureReason = "simulation-active" | "not-found";

export interface DeleteReferenceResult {
  deleted: boolean;
  reason?: DeleteReferenceFailureReason;
}

export const deleteReference = (referenceId: string): DeleteReferenceResult => {
  const { graph, simulationState } = useSimulationStore.getState();

  if (simulationState.phase !== "idle") {
    return { deleted: false, reason: "simulation-active" };
  }

  const exists = graph.references.some((r) => r.id === referenceId);
  if (!exists) {
    return { deleted: false, reason: "not-found" };
  }

  useSimulationStore.setState({ graph: removeReference(graph, referenceId) });
  return { deleted: true };
};
