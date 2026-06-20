import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import { useSimulationStore } from "../../../application/simulationStore";
import { editObject } from "../../../application/useCases/editObject";
import {
  NODE_STATE_CLASSES,
  type NodeStateName,
} from "../../styles/stateColors";

export type ObjectNodeData = {
  label: string;
  isRoot: boolean;
  marked: boolean;
  alive: boolean;
  isProcessing: boolean;
  phaseDone: boolean;
};

export type ObjectNodeType = Node<ObjectNodeData, "object">;

const resolveStateName = (data: ObjectNodeData): NodeStateName => {
  if (data.isProcessing) return "processing";
  if (!data.alive) return "collected";
  if (data.isRoot) return "root";
  if (data.marked) return "reachable";
  if (!data.marked && data.phaseDone) return "unreachable";
  return "normal";
};

const buildClassName = (
  state: NodeStateName,
  selected: boolean | undefined,
): string => {
  const c = NODE_STATE_CLASSES[state];
  const ring = selected ? "ring-2 ring-indigo-400" : "";
  return [c.bg, c.border, c.text, c.extra ?? "", ring]
    .filter(Boolean)
    .join(" ");
};

export function ObjectNode({ id, data, selected }: NodeProps<ObjectNodeType>) {
  const editingNodeId = useSimulationStore((s) => s.editingNodeId);
  const setEditingNode = useSimulationStore((s) => s.setEditingNode);
  const isEditing = editingNodeId === id;

  const [draftLabel, setDraftLabel] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setDraftLabel(data.label);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isEditing, data.label]);

  const commitEdit = () => {
    const next = draftLabel.trim();
    if (next.length > 0 && next !== data.label) {
      editObject(id, { label: next });
    }
    setEditingNode(null);
  };

  const cancelEdit = () => {
    setEditingNode(null);
    setDraftLabel(data.label);
  };

  const stateName = resolveStateName(data);
  const className = buildClassName(stateName, selected);

  return (
    <div
      data-testid={`node-${id}`}
      className={`nopan relative pt-4 px-4 pb-2 rounded border min-w-[120px] text-center select-none ${className}`}
    >
      <div
        className="object-node-drag-handle absolute top-0 left-0 right-0 h-3 flex items-center justify-center leading-none rounded-t cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 z-10"
        title="Arrastrar"
        aria-label="Arrastrar nodo"
      >
        <span className="text-[10px] tracking-tighter">⠿</span>
      </div>

      {isEditing ? (
        <input
          ref={inputRef}
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitEdit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancelEdit();
            }
            e.stopPropagation();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full bg-transparent border-none outline-none text-center"
        />
      ) : (
        <span className="text-sm font-medium">{data.label}</span>
      )}

      {!data.alive && (
        <span className="block text-[10px] mt-0.5 italic">Recolectado</span>
      )}
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className="!w-2 !h-2 !bg-gray-400 !border-0"
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-gray-400 !border-0"
      />
    </div>
  );
}
