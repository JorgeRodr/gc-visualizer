import { graphValidator } from "../../domain/validators/graphValidator";
import { createMemoryObject } from "../../domain/models/MemoryObject";
import { createMemoryReference } from "../../domain/models/MemoryReference";
import type { MemoryGraph } from "../../domain/models/MemoryGraph";

describe("graphValidator", () => {
  test("TC-U-13: rejects reference to a non-existent target object", () => {
    const graph: MemoryGraph = {
      objects: [createMemoryObject("A", "Objeto A")],
      references: [createMemoryReference("ref-1", "A", "Z")],
    };

    const result = graphValidator.validate(graph);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.includes("'Z'"))).toBe(true);
  });

  test("rejects duplicate object identifiers", () => {
    const graph: MemoryGraph = {
      objects: [
        createMemoryObject("A", "Objeto A"),
        createMemoryObject("A", "Otro A"),
      ],
      references: [],
    };

    const result = graphValidator.validate(graph);

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.toLowerCase().includes("duplicado")),
    ).toBe(true);
  });

  test("rejects duplicate references between the same pair of objects", () => {
    const graph: MemoryGraph = {
      objects: [
        createMemoryObject("A", "Objeto A"),
        createMemoryObject("B", "Objeto B"),
      ],
      references: [
        createMemoryReference("ref-1", "A", "B"),
        createMemoryReference("ref-2", "A", "B"),
      ],
    };

    const result = graphValidator.validate(graph);

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.toLowerCase().includes("duplicada")),
    ).toBe(true);
  });

  test("accepts a valid graph", () => {
    const graph: MemoryGraph = {
      objects: [
        createMemoryObject("A", "Objeto A", { isRoot: true }),
        createMemoryObject("B", "Objeto B"),
      ],
      references: [createMemoryReference("ref-1", "A", "B")],
    };

    const result = graphValidator.validate(graph);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
