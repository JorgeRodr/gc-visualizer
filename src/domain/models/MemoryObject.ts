export interface Position {
  x: number;
  y: number;
}

export interface MemoryObject {
  id: string;
  label: string;
  isRoot: boolean;
  marked: boolean;
  alive: boolean;
  visitedOrder: number | null;
  position: Position;
}

export const createMemoryObject = (
  id: string,
  label: string,
  options: { isRoot?: boolean; position?: Position } = {},
): MemoryObject => ({
  id,
  label,
  isRoot: options.isRoot ?? false,
  marked: false,
  alive: true,
  visitedOrder: null,
  position: options.position ?? { x: 0, y: 0 },
});
