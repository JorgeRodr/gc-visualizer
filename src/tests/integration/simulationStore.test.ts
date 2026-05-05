import { useSimulationStore } from "../../application/simulationStore";
import { createMemoryObject } from "../../domain/models/MemoryObject";
import {
  getIncomingReferences,
  getOutgoingReferences,
} from "../../domain/models/MemoryGraph";
import { createMemoryReference } from "../../domain/models/MemoryReference";

describe("simulationStore", () => {
  beforeEach(() => useSimulationStore.getState().reset());

  test("setGraph replaces the current graph", () => {
    const next = {
      objects: [createMemoryObject("X", "X")],
      references: [],
    };
    useSimulationStore.getState().setGraph(next);
    expect(useSimulationStore.getState().graph.objects[0].id).toBe("X");
  });

  test("updateSimulationState merges a partial patch", () => {
    useSimulationStore.getState().updateSimulationState({ phase: "mark" });
    expect(useSimulationStore.getState().simulationState.phase).toBe("mark");
  });

  test("setSelectedElement updates simulationState.selectedElementId", () => {
    useSimulationStore.getState().setSelectedElement("foo");
    expect(useSimulationStore.getState().simulationState.selectedElementId).toBe("foo");

    useSimulationStore.getState().setSelectedElement(null);
    expect(useSimulationStore.getState().simulationState.selectedElementId).toBeNull();
  });

  test("reset returns the store to its initial state", () => {
    useSimulationStore.getState().setGraph({
      objects: [createMemoryObject("A", "A")],
      references: [],
    });
    useSimulationStore.getState().updateSimulationState({ phase: "mark" });
    useSimulationStore.getState().setEditingNode("A");
    useSimulationStore.getState().startConnectionMode();

    useSimulationStore.getState().reset();

    const { graph, simulationState, connectionMode, editingNodeId } =
      useSimulationStore.getState();
    expect(graph.objects).toEqual([]);
    expect(graph.references).toEqual([]);
    expect(simulationState.phase).toBe("idle");
    expect(simulationState.steps).toEqual([]);
    expect(connectionMode.active).toBe(false);
    expect(connectionMode.sourceId).toBeNull();
    expect(editingNodeId).toBeNull();
  });

  test("connection mode lifecycle: start, select source, cancel", () => {
    const store = useSimulationStore.getState();

    store.startConnectionMode();
    expect(useSimulationStore.getState().connectionMode).toEqual({
      active: true,
      sourceId: null,
    });

    store.selectConnectionSource("node-A");
    expect(useSimulationStore.getState().connectionMode).toEqual({
      active: true,
      sourceId: "node-A",
    });

    store.cancelConnectionMode();
    expect(useSimulationStore.getState().connectionMode).toEqual({
      active: false,
      sourceId: null,
    });
  });

  test("setEditingNode toggles inline-editing state", () => {
    useSimulationStore.getState().setEditingNode("node-A");
    expect(useSimulationStore.getState().editingNodeId).toBe("node-A");

    useSimulationStore.getState().setEditingNode(null);
    expect(useSimulationStore.getState().editingNodeId).toBeNull();
  });
});

describe("MemoryGraph helpers (incoming/outgoing references)", () => {
  test("getOutgoingReferences and getIncomingReferences return only matching references", () => {
    const graph = {
      objects: [
        createMemoryObject("A", "A"),
        createMemoryObject("B", "B"),
        createMemoryObject("C", "C"),
      ],
      references: [
        createMemoryReference("ab", "A", "B"),
        createMemoryReference("ac", "A", "C"),
        createMemoryReference("bc", "B", "C"),
      ],
    };

    expect(getOutgoingReferences(graph, "A").map((r) => r.id).sort()).toEqual(
      ["ab", "ac"],
    );
    expect(getIncomingReferences(graph, "C").map((r) => r.id).sort()).toEqual(
      ["ac", "bc"],
    );
    expect(getOutgoingReferences(graph, "C")).toEqual([]);
  });
});
