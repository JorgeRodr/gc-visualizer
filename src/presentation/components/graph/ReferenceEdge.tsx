import {
  BaseEdge,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import {
  EDGE_COLORS,
  EDGE_STROKE_WIDTH,
} from "../../styles/stateColors";

export type ReferenceEdgeData = {
  traversed: boolean;
};

export type ReferenceEdgeType = Edge<ReferenceEdgeData, "reference">;

export function ReferenceEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<ReferenceEdgeType>) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const traversed = data?.traversed ?? false;

  let stroke: string = EDGE_COLORS.normal;
  let strokeWidth: number = EDGE_STROKE_WIDTH.normal;
  if (selected) {
    stroke = EDGE_COLORS.selected;
    strokeWidth = EDGE_STROKE_WIDTH.selected;
  } else if (traversed) {
    stroke = EDGE_COLORS.traversed;
    strokeWidth = EDGE_STROKE_WIDTH.traversed;
  }

  return (
    <g data-testid={`edge-${source}-${target}`}>
      <BaseEdge
        id={id}
        path={path}
        style={{ stroke, strokeWidth }}
        markerEnd={markerEnd}
      />
    </g>
  );
}
