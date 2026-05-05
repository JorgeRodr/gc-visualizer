import type { MemoryObject } from "./MemoryObject";
import type { MemoryReference } from "./MemoryReference";

export interface MemoryGraph {
  objects: MemoryObject[];
  references: MemoryReference[];
}

export const createEmptyGraph = (): MemoryGraph => ({
  objects: [],
  references: [],
});

export const getObject = (
  graph: MemoryGraph,
  id: string,
): MemoryObject | undefined => graph.objects.find((o) => o.id === id);

export const getRoots = (graph: MemoryGraph): MemoryObject[] =>
  graph.objects.filter((o) => o.isRoot);

export const getOutgoingReferences = (
  graph: MemoryGraph,
  objectId: string,
): MemoryReference[] =>
  graph.references.filter((r) => r.sourceObjectId === objectId);

export const getIncomingReferences = (
  graph: MemoryGraph,
  objectId: string,
): MemoryReference[] =>
  graph.references.filter((r) => r.targetObjectId === objectId);

export const addObject = (
  graph: MemoryGraph,
  object: MemoryObject,
): MemoryGraph => ({
  ...graph,
  objects: [...graph.objects, object],
});

export const removeObject = (
  graph: MemoryGraph,
  id: string,
): MemoryGraph => ({
  ...graph,
  objects: graph.objects.filter((o) => o.id !== id),
  references: graph.references.filter(
    (r) => r.sourceObjectId !== id && r.targetObjectId !== id,
  ),
});

export const addReference = (
  graph: MemoryGraph,
  reference: MemoryReference,
): MemoryGraph => {
  const isDuplicate = graph.references.some(
    (r) =>
      r.sourceObjectId === reference.sourceObjectId &&
      r.targetObjectId === reference.targetObjectId,
  );
  if (isDuplicate) return graph;
  return { ...graph, references: [...graph.references, reference] };
};

export const removeReference = (
  graph: MemoryGraph,
  referenceId: string,
): MemoryGraph => ({
  ...graph,
  references: graph.references.filter((r) => r.id !== referenceId),
});

export const toggleRoot = (
  graph: MemoryGraph,
  id: string,
): MemoryGraph => ({
  ...graph,
  objects: graph.objects.map((o) =>
    o.id === id ? { ...o, isRoot: !o.isRoot } : o,
  ),
});

export const updateObject = (
  graph: MemoryGraph,
  id: string,
  patch: Partial<Omit<MemoryObject, "id">>,
): MemoryGraph => ({
  ...graph,
  objects: graph.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
});

export const hasReferenceBetween = (
  graph: MemoryGraph,
  sourceId: string,
  targetId: string,
): boolean =>
  graph.references.some(
    (r) => r.sourceObjectId === sourceId && r.targetObjectId === targetId,
  );
