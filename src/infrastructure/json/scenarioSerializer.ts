import type { IScenarioSerializer } from "../../domain/ports/IScenarioSerializer";
import type { MemoryGraph } from "../../domain/models/MemoryGraph";
import {
  createMemoryObject,
  type Position,
} from "../../domain/models/MemoryObject";
import { createMemoryReference } from "../../domain/models/MemoryReference";

interface SerializedObject {
  id: string;
  label: string;
  isRoot: boolean;
  position?: Position;
}

interface SerializedReference {
  id: string;
  sourceObjectId: string;
  targetObjectId: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface SerializedGraph {
  objects: SerializedObject[];
  references: SerializedReference[];
}

/**
 * JSON serializer for scenarios.
 *
 * Per UI_SPEC §11, the serialized form excludes simulation-only fields
 * (`marked`, `alive`, `visitedOrder`, `traversed`). Optional handle anchors
 * are preserved so user-exported scenarios round-trip with the same visual
 * layout, but absent from the JSON when the reference has no handle set.
 */
export const scenarioSerializer: IScenarioSerializer = {
  serialize(graph: MemoryGraph): string {
    const minimal: SerializedGraph = {
      objects: graph.objects.map((o) => ({
        id: o.id,
        label: o.label,
        isRoot: o.isRoot,
        position: o.position,
      })),
      references: graph.references.map((r) => {
        const ref: SerializedReference = {
          id: r.id,
          sourceObjectId: r.sourceObjectId,
          targetObjectId: r.targetObjectId,
        };
        if (r.sourceHandle != null) ref.sourceHandle = r.sourceHandle;
        if (r.targetHandle != null) ref.targetHandle = r.targetHandle;
        return ref;
      }),
    };
    return JSON.stringify(minimal, null, 2);
  },

  deserialize(data: string): MemoryGraph {
    const parsed = JSON.parse(data) as SerializedGraph;
    return {
      objects: parsed.objects.map((o) =>
        createMemoryObject(o.id, o.label, {
          isRoot: o.isRoot,
          position: o.position,
        }),
      ),
      references: parsed.references.map((r) =>
        createMemoryReference(r.id, r.sourceObjectId, r.targetObjectId, {
          sourceHandle: r.sourceHandle,
          targetHandle: r.targetHandle,
        }),
      ),
    };
  },
};
