import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
// Position is still imported because the source handle declares Position.Bottom.
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
      className={`relative px-4 py-2 rounded border min-w-[120px] text-center select-none cursor-grab active:cursor-grabbing ${className}`}
    >
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
            // Prevent React Flow from intercepting Backspace/Delete during edit
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
        type="source"
        position={Position.Bottom}
        style={{
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          transform: "none",
          background: "transparent",
          border: 0,
          borderRadius: 0,
          opacity: 0,
          pointerEvents: "all",
        }}
      />
    </div>
  );
}
