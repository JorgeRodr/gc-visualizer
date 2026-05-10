export interface MemoryReference {
  id: string;
  sourceObjectId: string;
  targetObjectId: string;
  traversed: boolean;
  /**
   * Optional anchor handles on the source/target nodes. UI-only metadata
   * — the Mark & Sweep algorithm ignores these. Persisted in the in-memory
   * graph so the visual side persists across re-renders, but not exported
   * to JSON (UI_SPEC §11 keeps the schema minimal).
   */
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface CreateMemoryReferenceOptions {
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export const createMemoryReference = (
  id: string,
  sourceObjectId: string,
  targetObjectId: string,
  options: CreateMemoryReferenceOptions = {},
): MemoryReference => ({
  id,
  sourceObjectId,
  targetObjectId,
  traversed: false,
  sourceHandle: options.sourceHandle,
  targetHandle: options.targetHandle,
});
