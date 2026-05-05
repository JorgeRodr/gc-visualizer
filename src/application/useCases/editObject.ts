import { updateObject } from "../../domain/models/MemoryGraph";
import type { Position } from "../../domain/models/MemoryObject";
import { useSimulationStore } from "../simulationStore";

export type EditObjectFailureReason = "simulation-active" | "not-found";

export interface EditObjectInput {
  label?: string;
  position?: Position;
}

export interface EditObjectResult {
  edited: boolean;
  reason?: EditObjectFailureReason;
}

export const editObject = (
  id: string,
  patch: EditObjectInput,
): EditObjectResult => {
  const { graph, simulationState } = useSimulationStore.getState();

  if (simulationState.phase !== "idle") {
    return { edited: false, reason: "simulation-active" };
  }

  const exists = graph.objects.some((o) => o.id === id);
  if (!exists) {
    return { edited: false, reason: "not-found" };
  }

  useSimulationStore.setState({
    graph: updateObject(graph, id, patch),
  });
  return { edited: true };
};
