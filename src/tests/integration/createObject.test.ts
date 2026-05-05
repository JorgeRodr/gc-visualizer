import { createObject } from "../../application/useCases/createObject";
import { useSimulationStore } from "../../application/simulationStore";

describe("createObject use case", () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  test("TC-I-01: createObject adds an object to the store with correct initial state", () => {
    const before = useSimulationStore.getState().graph.objects.length;
    expect(before).toBe(0);

    const obj = createObject({ label: "Nodo A" });

    const { graph } = useSimulationStore.getState();
    expect(graph.objects.length).toBe(1);

    const stored = graph.objects[0];
    expect(stored.id).toBe(obj.id);
    expect(stored.id.length).toBeGreaterThan(0);
    expect(stored.label).toBe("Nodo A");
    expect(stored.isRoot).toBe(false);
    expect(stored.marked).toBe(false);
    expect(stored.alive).toBe(true);
    expect(stored.visitedOrder).toBeNull();
  });

  test("createObject auto-generates a label when none is provided", () => {
    createObject();
    createObject();

    const { graph } = useSimulationStore.getState();
    expect(graph.objects.length).toBe(2);
    expect(graph.objects[0].label).toBe("Objeto 1");
    expect(graph.objects[1].label).toBe("Objeto 2");
  });

  test("createObject assigns unique ids to each new object", () => {
    const a = createObject();
    const b = createObject();
    const c = createObject();

    const ids = new Set([a.id, b.id, c.id]);
    expect(ids.size).toBe(3);
  });
});
