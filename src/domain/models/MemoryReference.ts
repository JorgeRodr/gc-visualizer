export interface MemoryReference {
  id: string;
  sourceObjectId: string;
  targetObjectId: string;
  traversed: boolean;
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
