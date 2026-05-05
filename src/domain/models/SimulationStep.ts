export type SimulationPhase = "idle" | "mark" | "sweep" | "done";

export interface SimulationStep {
  stepIndex: number;
  phase: SimulationPhase;
  currentObjectId: string | null;
  markedIds: string[];
  traversedReferenceIds: string[];
  log: string;
}
