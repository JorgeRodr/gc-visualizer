import type { MemoryGraph } from "../models/MemoryGraph";
import type { SimulationStep } from "../models/SimulationStep";

export const computeMarkAndSweepSteps = (
  graph: MemoryGraph,
): SimulationStep[] => {
  const steps: SimulationStep[] = [];
  const visited = new Set<string>();
  const markedIds: string[] = [];
  const traversedReferenceIds: string[] = [];
  let stepIndex = 0;

  const objectsById = new Map(graph.objects.map((o) => [o.id, o]));
  const outgoingByObjectId = new Map<string, typeof graph.references>();
  for (const ref of graph.references) {
    const list = outgoingByObjectId.get(ref.sourceObjectId);
    if (list) list.push(ref);
    else outgoingByObjectId.set(ref.sourceObjectId, [ref]);
  }

  const roots = graph.objects.filter((o) => o.isRoot);

  if (roots.length === 0) {
    steps.push({
      stepIndex: stepIndex++,
      phase: "mark",
      currentObjectId: null,
      markedIds: [],
      traversedReferenceIds: [],
      log: "No hay raíces definidas. Todos los objetos serán considerados inalcanzables.",
    });
  } else {
    const rootLabels = roots.map((r) => r.label).join(", ");
    steps.push({
      stepIndex: stepIndex++,
      phase: "mark",
      currentObjectId: null,
      markedIds: [],
      traversedReferenceIds: [],
      log: `Inicio de fase Mark. Raíces detectadas: ${rootLabels}.`,
    });
  }

  const visit = (objectId: string): void => {
    if (visited.has(objectId)) return;
    visited.add(objectId);
    markedIds.push(objectId);

    const obj = objectsById.get(objectId);
    steps.push({
      stepIndex: stepIndex++,
      phase: "mark",
      currentObjectId: objectId,
      markedIds: [...markedIds],
      traversedReferenceIds: [...traversedReferenceIds],
      log: obj
        ? `Visitando y marcando '${obj.label}'.`
        : `Visitando y marcando '${objectId}'.`,
    });

    const outgoing = outgoingByObjectId.get(objectId) ?? [];
    for (const ref of outgoing) {
      traversedReferenceIds.push(ref.id);
      visit(ref.targetObjectId);
    }
  };

  for (const root of roots) {
    visit(root.id);
  }

  const collectedIds = graph.objects
    .filter((o) => !visited.has(o.id))
    .map((o) => o.id);

  steps.push({
    stepIndex: stepIndex++,
    phase: "sweep",
    currentObjectId: null,
    markedIds: [...markedIds],
    traversedReferenceIds: [...traversedReferenceIds],
    log:
      collectedIds.length > 0
        ? `Inicio de fase Sweep. ${collectedIds.length} objeto(s) candidato(s) a recolección.`
        : "Inicio de fase Sweep. No hay objetos a recolectar.",
  });

  const collectedLabels = collectedIds
    .map((id) => objectsById.get(id)?.label ?? id)
    .join(", ");

  steps.push({
    stepIndex: stepIndex++,
    phase: "done",
    currentObjectId: null,
    markedIds: [...markedIds],
    traversedReferenceIds: [...traversedReferenceIds],
    log:
      collectedIds.length > 0
        ? `Simulación finalizada. Recolectados: ${collectedLabels}.`
        : "Simulación finalizada. No hay objetos recolectados.",
  });

  return steps;
};

export const applyStepsToGraph = (
  graph: MemoryGraph,
  steps: SimulationStep[],
  upToIndex?: number,
): MemoryGraph => {
  if (steps.length === 0) return graph;
  const targetIndex = upToIndex ?? steps.length - 1;
  if (targetIndex < 0) return graph;
  const step = steps[Math.min(targetIndex, steps.length - 1)];

  const markedSet = new Set(step.markedIds);
  const traversedSet = new Set(step.traversedReferenceIds);
  const sweepActive = step.phase === "sweep" || step.phase === "done";

  return {
    objects: graph.objects.map((obj) => {
      const visitIndex = step.markedIds.indexOf(obj.id);
      return {
        ...obj,
        marked: markedSet.has(obj.id),
        visitedOrder: visitIndex >= 0 ? visitIndex : null,
        alive: sweepActive ? markedSet.has(obj.id) : true,
      };
    }),
    references: graph.references.map((ref) => ({
      ...ref,
      traversed: traversedSet.has(ref.id),
    })),
  };
};
