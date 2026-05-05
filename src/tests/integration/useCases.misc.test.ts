import { clearScenario } from "../../application/useCases/clearScenario";
import { createObject } from "../../application/useCases/createObject";
import { createReference } from "../../application/useCases/createReference";
import { deleteObject } from "../../application/useCases/deleteObject";
import { deleteReference } from "../../application/useCases/deleteReference";
import { editObject } from "../../application/useCases/editObject";
import { loadPredefinedScenario } from "../../application/useCases/loadPredefinedScenario";
import { markAsRoot } from "../../application/useCases/markAsRoot";
import { runSimulation } from "../../application/useCases/runSimulation";
import { useSimulationStore } from "../../application/simulationStore";
import { createMemoryObject } from "../../domain/models/MemoryObject";
import { createMemoryReference } from "../../domain/models/MemoryReference";

describe("clearScenario", () => {
  beforeEach(() => useSimulationStore.getState().reset());

  test("empties the graph and resets simulation state", () => {
    const a = createObject({ label: "A", isRoot: true });
    const b = createObject({ label: "B" });
    createReference(a.id, b.id);

    clearScenario();

    const { graph, simulationState } = useSimulationStore.getState();
    expect(graph.objects).toEqual([]);
    expect(graph.references).toEqual([]);
    expect(simulationState.phase).toBe("idle");
    expect(simulationState.steps).toEqual([]);
  });
});

describe("deleteObject", () => {
  beforeEach(() => useSimulationStore.getState().reset());

  test("returns the number of removed references and removes the object", () => {
    const a = createObject({ label: "A" });
    const b = createObject({ label: "B" });
    const c = createObject({ label: "C" });
    createReference(a.id, b.id);
    createReference(b.id, c.id);
    createReference(c.id, a.id);

    const result = deleteObject(b.id);

    expect(result.deleted).toBe(true);
    expect(result.deletedReferences).toBe(2);

    const { graph } = useSimulationStore.getState();
    expect(graph.objects.find((o) => o.id === b.id)).toBeUndefined();
    expect(graph.references.length).toBe(1);
  });

  test("returns 'not-found' when object does not exist", () => {
    const result = deleteObject("nonexistent");
    expect(result.deleted).toBe(false);
    expect(result.reason).toBe("not-found");
    expect(result.deletedReferences).toBe(0);
  });

  test("blocks deletion during simulation", () => {
    const a = createObject({ label: "A", isRoot: true });
    runSimulation();

    const result = deleteObject(a.id);
    expect(result.deleted).toBe(false);
    expect(result.reason).toBe("simulation-active");
    expect(useSimulationStore.getState().graph.objects.length).toBe(1);
  });
});

describe("deleteReference", () => {
  beforeEach(() => useSimulationStore.getState().reset());

  test("removes the reference by id", () => {
    const a = createObject({ label: "A" });
    const b = createObject({ label: "B" });
    const r = createReference(a.id, b.id);

    expect(r.created).toBe(true);
    const result = deleteReference(r.referenceId!);

    expect(result.deleted).toBe(true);
    expect(useSimulationStore.getState().graph.references.length).toBe(0);
  });

  test("returns 'not-found' for unknown reference id", () => {
    const result = deleteReference("missing");
    expect(result.deleted).toBe(false);
    expect(result.reason).toBe("not-found");
  });

  test("blocks deletion during simulation", () => {
    const a = createObject({ label: "A", isRoot: true });
    const b = createObject({ label: "B" });
    const r = createReference(a.id, b.id);
    runSimulation();

    const result = deleteReference(r.referenceId!);
    expect(result.deleted).toBe(false);
    expect(result.reason).toBe("simulation-active");
  });
});

describe("editObject", () => {
  beforeEach(() => useSimulationStore.getState().reset());

  test("edits label and position", () => {
    const a = createObject({ label: "A" });

    const result = editObject(a.id, {
      label: "Renombrado",
      position: { x: 50, y: 80 },
    });

    expect(result.edited).toBe(true);
    const { graph } = useSimulationStore.getState();
    const obj = graph.objects.find((o) => o.id === a.id);
    expect(obj?.label).toBe("Renombrado");
    expect(obj?.position).toEqual({ x: 50, y: 80 });
  });

  test("returns 'not-found' when object does not exist", () => {
    const result = editObject("missing", { label: "X" });
    expect(result.edited).toBe(false);
    expect(result.reason).toBe("not-found");
  });

  test("blocks editing during simulation", () => {
    const a = createObject({ label: "A", isRoot: true });
    runSimulation();

    const result = editObject(a.id, { label: "Other" });
    expect(result.edited).toBe(false);
    expect(result.reason).toBe("simulation-active");
  });
});

describe("markAsRoot", () => {
  beforeEach(() => useSimulationStore.getState().reset());

  test("toggles isRoot from false to true", () => {
    const a = createObject({ label: "A" });
    const result = markAsRoot(a.id);

    expect(result.toggled).toBe(true);
    expect(result.isRoot).toBe(true);
    expect(useSimulationStore.getState().graph.objects.find((o) => o.id === a.id)?.isRoot).toBe(true);
  });

  test("toggles isRoot from true to false", () => {
    const a = createObject({ label: "A", isRoot: true });
    const result = markAsRoot(a.id);

    expect(result.toggled).toBe(true);
    expect(result.isRoot).toBe(false);
  });

  test("returns 'not-found' for unknown id", () => {
    const result = markAsRoot("missing");
    expect(result.toggled).toBe(false);
    expect(result.reason).toBe("not-found");
  });

  test("blocks toggling during simulation", () => {
    const a = createObject({ label: "A", isRoot: true });
    runSimulation();

    const result = markAsRoot(a.id);
    expect(result.toggled).toBe(false);
    expect(result.reason).toBe("simulation-active");
  });
});

describe("loadPredefinedScenario", () => {
  beforeEach(() => useSimulationStore.getState().reset());

  test("replaces graph and resets simulation state", () => {
    createObject({ label: "Existing" });

    const newGraph = {
      objects: [
        createMemoryObject("X", "X", { isRoot: true }),
        createMemoryObject("Y", "Y"),
      ],
      references: [createMemoryReference("rxy", "X", "Y")],
    };

    loadPredefinedScenario(newGraph);

    const { graph, simulationState } = useSimulationStore.getState();
    expect(graph.objects.length).toBe(2);
    expect(graph.objects.find((o) => o.id === "Existing")).toBeUndefined();
    expect(graph.objects.find((o) => o.id === "X")?.isRoot).toBe(true);
    expect(simulationState.phase).toBe("idle");
    expect(simulationState.steps).toEqual([]);
  });
});
