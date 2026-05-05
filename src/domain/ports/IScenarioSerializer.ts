import type { MemoryGraph } from "../models/MemoryGraph";

export interface IScenarioSerializer {
  serialize(graph: MemoryGraph): string;
  deserialize(data: string): MemoryGraph;
}
