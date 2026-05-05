import {
  Background,
  ConnectionMode,
  Controls,
  MarkerType,
  ReactFlow,
  applyNodeChanges,
  type Edge,
  type Node,
  type NodeChange,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSimulationStore } from "../../../application/simulationStore";
import { createReference } from "../../../application/useCases/createReference";
import { deleteObject } from "../../../application/useCases/deleteObject";
import { deleteReference } from "../../../application/useCases/deleteReference";
import { editObject } from "../../../application/useCases/editObject";
import { applyStepsToGraph } from "../../../domain/algorithms/markAndSweep";
import { TOAST_TEXT, notify } from "../../notifications/notifications";
import {
  ObjectNode,
  type ObjectNodeData,
  type ObjectNodeType,
} from "./ObjectNode";
import {
  ReferenceEdge,
  type ReferenceEdgeData,
  type ReferenceEdgeType,
} from "./ReferenceEdge";

const nodeTypes = { object: ObjectNode };
const edgeTypes = { reference: ReferenceEdge };

const defaultEdgeOptions = {
  type: "reference",
  markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af" },
};

export function GraphCanvas() {
  const graph = useSimulationStore((s) => s.graph);
  const steps = useSimulationStore((s) => s.simulationState.steps);
  const currentStep = useSimulationStore(
    (s) => s.simulationState.currentStep,
  );
  const phase = useSimulationStore((s) => s.simulationState.phase);
  const selectedElementId = useSimulationStore(
    (s) => s.simulationState.selectedElementId,
  );
  const setSelectedElement = useSimulationStore((s) => s.setSelectedElement);
  const setEditingNode = useSimulationStore((s) => s.setEditingNode);
  const connectionMode = useSimulationStore((s) => s.connectionMode);
  const selectConnectionSource = useSimulationStore(
    (s) => s.selectConnectionSource,
  );
  const cancelConnectionMode = useSimulationStore(
    (s) => s.cancelConnectionMode,
  );

  const snapshot = useMemo(() => {
    if (steps.length === 0) return graph;
    return applyStepsToGraph(graph, steps, currentStep);
  }, [graph, steps, currentStep]);

  const currentObjectId = steps[currentStep]?.currentObjectId ?? null;

  // Local node state — React Flow needs to mutate positions during drag.
  // We rebuild this state when the set of object ids changes; otherwise we
  // patch existing nodes' data so flags (marked, alive, etc.) update without
  // disrupting an in-progress drag.
  const [localNodes, setLocalNodes] = useState<ObjectNodeType[]>([]);

  const objectIdsKey = snapshot.objects.map((o) => o.id).join(",");
  useEffect(() => {
    setLocalNodes(
      snapshot.objects.map((obj) => ({
        id: obj.id,
        type: "object" as const,
        position: obj.position,
        selected: selectedElementId === obj.id,
        data: {
          label: obj.label,
          isRoot: obj.isRoot,
          marked: obj.marked,
          alive: obj.alive,
          isProcessing: obj.id === currentObjectId,
          phaseDone: phase === "done",
        },
      })),
    );
    // Intentionally only on structural changes (ids set).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectIdsKey]);

  useEffect(() => {
    setLocalNodes((nds) =>
      nds.map((n) => {
        const obj = snapshot.objects.find((o) => o.id === n.id);
        if (!obj) return n;
        const data: ObjectNodeData = {
          label: obj.label,
          isRoot: obj.isRoot,
          marked: obj.marked,
          alive: obj.alive,
          isProcessing: obj.id === currentObjectId,
          phaseDone: phase === "done",
        };
        return {
          ...n,
          selected: selectedElementId === n.id,
          data,
        };
      }),
    );
  }, [snapshot, selectedElementId, currentObjectId, phase]);

  const edges: ReferenceEdgeType[] = useMemo(
    () =>
      snapshot.references.map((r) => ({
        id: r.id,
        source: r.sourceObjectId,
        target: r.targetObjectId,
        type: "reference" as const,
        selected: selectedElementId === r.id,
        data: { traversed: r.traversed } satisfies ReferenceEdgeData,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af" },
      })),
    [snapshot.references, selectedElementId],
  );

  const onNodesChange = useCallback((changes: NodeChange<ObjectNodeType>[]) => {
    setLocalNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      editObject(node.id, { position: node.position });
    },
    [],
  );

  const onConnect: OnConnect = useCallback(({ source, target }) => {
    if (!source || !target) return;
    const result = createReference(source, target);
    if (!result.created) {
      if (result.reason === "duplicate") {
        notify.error(TOAST_TEXT.duplicateReference);
      } else if (result.reason === "simulation-active") {
        notify.error(TOAST_TEXT.createReferenceDuringSimulation);
      }
    }
  }, []);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (connectionMode.active) {
        if (!connectionMode.sourceId) {
          selectConnectionSource(node.id);
          return;
        }
        const result = createReference(connectionMode.sourceId, node.id);
        if (!result.created) {
          if (result.reason === "duplicate") {
            notify.error(TOAST_TEXT.duplicateReference);
          } else if (result.reason === "simulation-active") {
            notify.error(TOAST_TEXT.createReferenceDuringSimulation);
          }
        }
        cancelConnectionMode();
        return;
      }
      setSelectedElement(node.id);
    },
    [
      connectionMode,
      selectConnectionSource,
      cancelConnectionMode,
      setSelectedElement,
    ],
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setSelectedElement(edge.id);
    },
    [setSelectedElement],
  );

  const onPaneClick = useCallback(() => {
    if (connectionMode.active) {
      cancelConnectionMode();
      return;
    }
    setSelectedElement(null);
    setEditingNode(null);
  }, [
    connectionMode.active,
    cancelConnectionMode,
    setSelectedElement,
    setEditingNode,
  ]);

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (phase !== "idle") {
        notify.error(TOAST_TEXT.editDuringSimulation);
        return;
      }
      setEditingNode(node.id);
    },
    [phase, setEditingNode],
  );

  // Keyboard: Escape cancels connection mode and inline editing.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (connectionMode.active) {
        cancelConnectionMode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [connectionMode.active, cancelConnectionMode]);

  // Keyboard: Delete/Backspace removes the current selection.
  // Wired here so the same shortcut works regardless of whether the
  // canvas or the left panel has focus.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if (!selectedElementId || phase !== "idle") return;
      const result = deleteObject(selectedElementId);
      if (!result.deleted && result.reason === "not-found") {
        deleteReference(selectedElementId);
      }
      setSelectedElement(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedElementId, phase, setSelectedElement]);

  const isInteractionLocked = phase !== "idle";

  return (
    <div data-testid="graph-canvas" className="w-full h-full relative">
      <ReactFlow
        nodes={localNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={!isInteractionLocked}
        nodesConnectable={!isInteractionLocked}
        elementsSelectable
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      {connectionMode.active && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900 shadow z-10 pointer-events-none">
          {connectionMode.sourceId
            ? "Ahora haz clic en el objeto destino…"
            : "Haz clic en el objeto origen…"}
        </div>
      )}
    </div>
  );
}
