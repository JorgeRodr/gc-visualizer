import { addObject, type MemoryGraph } from "../../domain/models/MemoryGraph";
import {
  createMemoryObject,
  type MemoryObject,
  type Position,
} from "../../domain/models/MemoryObject";
import { useSimulationStore } from "../simulationStore";

export interface CreateObjectOptions {
  label?: string;
  position?: Position;
  isRoot?: boolean;
}

export const createObject = (
  options: CreateObjectOptions = {},
): MemoryObject => {
  const { graph } = useSimulationStore.getState();
  const id = crypto.randomUUID();
  const label = options.label ?? `Objeto ${graph.objects.length + 1}`;
  const obj = createMemoryObject(id, label, {
    isRoot: options.isRoot,
    position: options.position,
  });
  const next: MemoryGraph = addObject(graph, obj);
  useSimulationStore.setState({ graph: next });
  return obj;
};
