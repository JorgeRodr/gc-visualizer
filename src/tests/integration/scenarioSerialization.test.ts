import { createObject } from "../../application/useCases/createObject";
import { createReference } from "../../application/useCases/createReference";
import { exportScenario } from "../../application/useCases/exportScenario";
import { importScenario } from "../../application/useCases/importScenario";
import { useSimulationStore } from "../../application/simulationStore";
import { scenarioParser } from "../../infrastructure/json/scenarioParser";
import { scenarioSerializer } from "../../infrastructure/json/scenarioSerializer";

interface ParsedScenario {
  objects: Array<{
    id: string;
    label: string;
    isRoot: boolean;
    position?: { x: number; y: number };
  }>;
  references: Array<{ id: string; sourceObjectId: string; targetObjectId: string }>;
}

describe("scenario serialization", () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  test("TC-I-09: exportScenario produces a valid JSON with the full structure", () => {
    const a = createObject({ label: "A", isRoot: true });
    const b = createObject({ label: "B" });
    createObject({ label: "C" }); // isolated
    createReference(a.id, b.id);

    const json = exportScenario(scenarioSerializer);
    const parsed = JSON.parse(json) as ParsedScenario;

    expect(parsed.objects).toHaveLength(3);
    expect(parsed.references).toHaveLength(1);

    const aRoot = parsed.objects.find((o) => o.id === a.id);
    expect(aRoot).toBeDefined();
    expect(aRoot?.isRoot).toBe(true);

    // Simulation-only fields must NOT be present in the JSON
    for (const o of parsed.objects) {
      expect(o).not.toHaveProperty("marked");
      expect(o).not.toHaveProperty("alive");
      expect(o).not.toHaveProperty("visitedOrder");
    }
    for (const r of parsed.references) {
      expect(r).not.toHaveProperty("traversed");
    }
  });

  test("TC-I-10: importScenario rejects JSON with references to non-existent objects", () => {
    const before = useSimulationStore.getState().graph;

    const json = JSON.stringify({
      objects: [
        { id: "A", label: "Objeto A", isRoot: true, position: { x: 0, y: 0 } },
      ],
      references: [
        { id: "r1", sourceObjectId: "A", targetObjectId: "Z" },
      ],
    });

    const result = importScenario(scenarioParser, json);

    expect(result.imported).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.kind).toBe("validation-error");
    // Store must not be modified on failure
    expect(useSimulationStore.getState().graph).toEqual(before);
  });

  test("importScenario rejects malformed JSON", () => {
    const result = importScenario(scenarioParser, "{not valid json");
    expect(result.imported).toBe(false);
    expect(result.error?.message).toContain("formato correcto");
  });

  test("importScenario rejects JSON with duplicate object identifiers", () => {
    const json = JSON.stringify({
      objects: [
        { id: "A", label: "Uno", isRoot: false },
        { id: "A", label: "Dos", isRoot: false },
      ],
      references: [],
    });

    const result = importScenario(scenarioParser, json);
    expect(result.imported).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("export then import round-trips fidelity", () => {
    const a = createObject({ label: "A", isRoot: true });
    const b = createObject({ label: "B" });
    createReference(a.id, b.id);

    const json = exportScenario(scenarioSerializer);
    useSimulationStore.getState().reset();
    expect(useSimulationStore.getState().graph.objects).toEqual([]);

    const result = importScenario(scenarioParser, json);
    expect(result.imported).toBe(true);

    const { graph } = useSimulationStore.getState();
    expect(graph.objects.length).toBe(2);
    expect(graph.references.length).toBe(1);
    expect(graph.objects.find((o) => o.id === a.id)?.isRoot).toBe(true);
  });

  test("TC-I-13: export includes handle anchors when present on a reference", () => {
    const a = createObject({ label: "A", isRoot: true });
    const b = createObject({ label: "B" });
    createReference(a.id, b.id, { source: "right", target: "left" });

    const json = exportScenario(scenarioSerializer);
    const parsed = JSON.parse(json) as {
      references: Array<{
        id: string;
        sourceObjectId: string;
        targetObjectId: string;
        sourceHandle?: string;
        targetHandle?: string;
      }>;
    };

    expect(parsed.references[0].sourceHandle).toBe("right");
    expect(parsed.references[0].targetHandle).toBe("left");
  });

  test("TC-I-14: export omits handle keys when a reference has none (clean JSON)", () => {
    const a = createObject({ label: "A", isRoot: true });
    const b = createObject({ label: "B" });
    createReference(a.id, b.id);

    const json = exportScenario(scenarioSerializer);
    const parsed = JSON.parse(json) as {
      references: Array<Record<string, unknown>>;
    };

    expect(parsed.references[0]).not.toHaveProperty("sourceHandle");
    expect(parsed.references[0]).not.toHaveProperty("targetHandle");
  });

  test("TC-I-15: round-trip preserves handle anchors", () => {
    const a = createObject({ label: "A", isRoot: true });
    const b = createObject({ label: "B" });
    createReference(a.id, b.id, { source: "right", target: "left" });

    const json = exportScenario(scenarioSerializer);
    useSimulationStore.getState().reset();
    importScenario(scenarioParser, json);

    const ref = useSimulationStore.getState().graph.references[0];
    expect(ref.sourceHandle).toBe("right");
    expect(ref.targetHandle).toBe("left");
  });

  test("TC-I-16: import accepts JSON without handles (predefined-scenario style)", () => {
    const json = JSON.stringify({
      objects: [
        { id: "A", label: "A", isRoot: true, position: { x: 0, y: 0 } },
        { id: "B", label: "B", isRoot: false, position: { x: 100, y: 0 } },
      ],
      references: [
        { id: "r1", sourceObjectId: "A", targetObjectId: "B" },
      ],
    });

    const result = importScenario(scenarioParser, json);
    expect(result.imported).toBe(true);

    const ref = useSimulationStore.getState().graph.references[0];
    expect(ref.sourceHandle).toBeUndefined();
    expect(ref.targetHandle).toBeUndefined();
  });
});
