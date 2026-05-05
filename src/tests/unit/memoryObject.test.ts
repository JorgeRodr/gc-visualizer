import { createMemoryObject } from "../../domain/models/MemoryObject";

describe("MemoryObject", () => {
  test("TC-U-01: a newly created object has the correct initial state", () => {
    const obj = createMemoryObject("A", "Objeto A");

    expect(obj.id).toBe("A");
    expect(obj.label).toBe("Objeto A");
    expect(obj.isRoot).toBe(false);
    expect(obj.marked).toBe(false);
    expect(obj.alive).toBe(true);
    expect(obj.visitedOrder).toBeNull();
  });

  test("TC-U-01 (variant): object created with isRoot=true via options", () => {
    const obj = createMemoryObject("R", "Raíz", { isRoot: true });

    expect(obj.isRoot).toBe(true);
    expect(obj.marked).toBe(false);
    expect(obj.alive).toBe(true);
  });
});
