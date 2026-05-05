import {
  EDGE_COLORS,
  NODE_STATE_CLASSES,
} from "../../styles/stateColors";

interface LegendItem {
  label: string;
  swatch: React.ReactNode;
}

const NODE_LEGEND: LegendItem[] = [
  {
    label: "Normal",
    swatch: (
      <span
        className={`inline-block w-5 h-3 rounded border ${NODE_STATE_CLASSES.normal.bg} ${NODE_STATE_CLASSES.normal.border}`}
      />
    ),
  },
  {
    label: "Raíz",
    swatch: (
      <span
        className={`inline-block w-5 h-3 rounded border ${NODE_STATE_CLASSES.root.bg} ${NODE_STATE_CLASSES.root.border}`}
      />
    ),
  },
  {
    label: "En procesamiento",
    swatch: (
      <span
        className={`inline-block w-5 h-3 rounded ${NODE_STATE_CLASSES.processing.bg} ${NODE_STATE_CLASSES.processing.border}`}
      />
    ),
  },
  {
    label: "Alcanzable",
    swatch: (
      <span
        className={`inline-block w-5 h-3 rounded border ${NODE_STATE_CLASSES.reachable.bg} ${NODE_STATE_CLASSES.reachable.border}`}
      />
    ),
  },
  {
    label: "Recolectado",
    swatch: (
      <span
        className={`inline-block w-5 h-3 rounded border ${NODE_STATE_CLASSES.collected.bg} ${NODE_STATE_CLASSES.collected.border} opacity-60`}
      />
    ),
  },
];

const EDGE_LEGEND: LegendItem[] = [
  {
    label: "Referencia normal",
    swatch: (
      <svg width={20} height={6}>
        <line
          x1={0}
          y1={3}
          x2={20}
          y2={3}
          stroke={EDGE_COLORS.normal}
          strokeWidth={1.5}
        />
      </svg>
    ),
  },
  {
    label: "Referencia recorrida",
    swatch: (
      <svg width={20} height={6}>
        <line
          x1={0}
          y1={3}
          x2={20}
          y2={3}
          stroke={EDGE_COLORS.traversed}
          strokeWidth={2.5}
        />
      </svg>
    ),
  },
];

export function StateLegend() {
  return (
    <div data-testid="legend-estados" className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Leyenda
      </h3>
      <ul className="flex flex-col gap-1">
        {NODE_LEGEND.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-2 text-xs text-gray-700"
          >
            {item.swatch}
            <span>{item.label}</span>
          </li>
        ))}
        {EDGE_LEGEND.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-2 text-xs text-gray-700"
          >
            {item.swatch}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
