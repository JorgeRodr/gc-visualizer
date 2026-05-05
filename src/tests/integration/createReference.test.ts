import { createObject } from "../../application/useCases/createObject";
import { createReference } from "../../application/useCases/createReference";
import { useSimulationStore } from "../../application/simulationStore";

describe("createReference use case", () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  test("TC-I-02: createReference creates a reference and rejects subsequent duplicates", () => {
    const a = createObject({ label: "A" });
    const b = createObject({ label: "B" });

    const first = createReference(a.id, b.id);
    expect(first.created).toBe(true);
    expect(first.referenceId).toBeDefined();

    const second = createReference(a.id, b.id);
    expect(second.created).toBe(false);
    expect(second.reason).toBe("duplicate");

    const { graph } = useSimulationStore.getState();
    const refsAB = graph.references.filter(
      (r) => r.sourceObjectId === a.id && r.targetObjectId === b.id,
    );
    expect(refsAB.length).toBe(1);
  });

  test("createReference rejects when source or target does not exist", () => {
    const a = createObject({ label: "A" });

    const result = createReference(a.id, "nonexistent");
    expect(result.created).toBe(false);
    expect(result.reason).toBe("missing-endpoint");

    const { graph } = useSimulationStore.getState();
    expect(graph.references.length).toBe(0);
  });
});
