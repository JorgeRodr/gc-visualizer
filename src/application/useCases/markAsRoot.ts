import { getObject, toggleRoot } from "../../domain/models/MemoryGraph";
import { useSimulationStore } from "../simulationStore";

export type MarkAsRootFailureReason = "simulation-active" | "not-found";

export interface MarkAsRootResult {
  toggled: boolean;
  isRoot?: boolean;
  reason?: MarkAsRootFailureReason;
}

export const markAsRoot = (id: string): MarkAsRootResult => {
  const { graph, simulationState } = useSimulationStore.getState();

  if (simulationState.phase !== "idle") {
    return { toggled: false, reason: "simulation-active" };
  }

  const obj = getObject(graph, id);
  if (!obj) {
    return { toggled: false, reason: "not-found" };
  }

  const next = toggleRoot(graph, id);
  useSimulationStore.setState({ graph: next });
  return { toggled: true, isRoot: !obj.isRoot };
};
