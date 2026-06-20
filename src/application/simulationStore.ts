import { create } from "zustand";
import {
  createEmptyGraph,
  type MemoryGraph,
} from "../domain/models/MemoryGraph";
import {
  createInitialSimulationState,
  type SimulationState,
} from "../domain/models/SimulationState";

export interface ConnectionModeState {
  active: boolean;
  sourceId: string | null;
}

export interface SimulationStoreState {
  graph: MemoryGraph;
  simulationState: SimulationState;
  connectionMode: ConnectionModeState;
  editingNodeId: string | null;
}

export interface SimulationStoreActions {
  setGraph: (graph: MemoryGraph) => void;
  updateSimulationState: (patch: Partial<SimulationState>) => void;
  setSelectedElement: (id: string | null) => void;
  startConnectionMode: () => void;
  selectConnectionSource: (id: string) => void;
  cancelConnectionMode: () => void;
  setEditingNode: (id: string | null) => void;
  reset: () => void;
}

export type SimulationStore = SimulationStoreState & SimulationStoreActions;

const initialConnectionMode: ConnectionModeState = {
  active: false,
  sourceId: null,
};

export const useSimulationStore = create<SimulationStore>((set) => ({
  graph: createEmptyGraph(),
  simulationState: createInitialSimulationState(),
  connectionMode: initialConnectionMode,
  editingNodeId: null,

  setGraph: (graph) => set({ graph }),

  updateSimulationState: (patch) =>
    set((s) => ({
      simulationState: { ...s.simulationState, ...patch },
    })),

  setSelectedElement: (id) =>
    set((s) => ({
      simulationState: { ...s.simulationState, selectedElementId: id },
    })),

  startConnectionMode: () =>
    set({ connectionMode: { active: true, sourceId: null } }),

  selectConnectionSource: (id) =>
    set({ connectionMode: { active: true, sourceId: id } }),

  cancelConnectionMode: () => set({ connectionMode: initialConnectionMode }),

  setEditingNode: (id) => set({ editingNodeId: id }),

  reset: () =>
    set({
      graph: createEmptyGraph(),
      simulationState: createInitialSimulationState(),
      connectionMode: initialConnectionMode,
      editingNodeId: null,
    }),
}));
