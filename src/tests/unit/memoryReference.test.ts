import { createMemoryReference } from "../../domain/models/MemoryReference";

describe("MemoryReference factory", () => {
  test("TC-U-22: creates a reference with default state and no handles", () => {
    const ref = createMemoryReference("r1", "A", "B");

    expect(ref.id).toBe("r1");
    expect(ref.sourceObjectId).toBe("A");
    expect(ref.targetObjectId).toBe("B");
    expect(ref.traversed).toBe(false);
    expect(ref.sourceHandle).toBeUndefined();
    expect(ref.targetHandle).toBeUndefined();
  });

  test("TC-U-23: accepts optional source and target handles", () => {
    const ref = createMemoryReference("r1", "A", "B", {
      sourceHandle: "right",
      targetHandle: "left",
    });

    expect(ref.sourceHandle).toBe("right");
    expect(ref.targetHandle).toBe("left");
  });

  test("TC-U-24: accepts only one handle when the other is omitted", () => {
    const ref = createMemoryReference("r1", "A", "B", { sourceHandle: "left" });

    expect(ref.sourceHandle).toBe("left");
    expect(ref.targetHandle).toBeUndefined();
  });
});
