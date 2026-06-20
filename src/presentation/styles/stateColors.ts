export interface NodeStateClasses {
  bg: string;
  border: string;
  text: string;
  extra?: string;
}

export type NodeStateName =
  | "processing"
  | "root"
  | "reachable"
  | "unreachable"
  | "collected"
  | "normal";

export const NODE_STATE_CLASSES: Record<NodeStateName, NodeStateClasses> = {
  processing: {
    bg: "bg-white",
    border: "border-orange-400 border-2",
    text: "text-gray-800",
  },
  root: {
    bg: "bg-slate-800",
    border: "border-slate-800",
    text: "text-white",
  },
  reachable: {
    bg: "bg-teal-100",
    border: "border-teal-400",
    text: "text-gray-800",
  },
  unreachable: {
    bg: "bg-gray-100",
    border: "border-gray-300",
    text: "text-gray-400",
  },
  collected: {
    bg: "bg-red-100",
    border: "border-red-300",
    text: "text-gray-400",
    extra: "opacity-60",
  },
  normal: {
    bg: "bg-white",
    border: "border-gray-300",
    text: "text-gray-800",
  },
};

export const EDGE_COLORS = {
  /** gray-300 */
  normal: "#d1d5db",
  /** teal-400 */
  traversed: "#2dd4bf",
  /** indigo-500 */
  selected: "#6366f1",
} as const;

export const EDGE_STROKE_WIDTH = {
  normal: 1.5,
  traversed: 2.5,
  selected: 2,
} as const;
