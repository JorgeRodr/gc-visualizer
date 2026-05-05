import type { SimulationPhase, SimulationStep } from "./SimulationStep";

export type { SimulationPhase };

export interface SimulationState {
  phase: SimulationPhase;
  currentStep: number;
  steps: SimulationStep[];
  logs: string[];
  selectedElementId: string | null;
  showCollectedView: boolean;
}

export const createInitialSimulationState = (): SimulationState => ({
  phase: "idle",
  currentStep: 0,
  steps: [],
  logs: [],
  selectedElementId: null,
  showCollectedView: false,
});
