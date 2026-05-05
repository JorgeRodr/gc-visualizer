export interface MemoryReference {
  id: string;
  sourceObjectId: string;
  targetObjectId: string;
  traversed: boolean;
}

export const createMemoryReference = (
  id: string,
  sourceObjectId: string,
  targetObjectId: string,
): MemoryReference => ({
  id,
  sourceObjectId,
  targetObjectId,
  traversed: false,
});
