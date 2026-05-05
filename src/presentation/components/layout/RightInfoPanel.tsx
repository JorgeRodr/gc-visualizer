import { useMemo } from "react";
import { useSimulationStore } from "../../../application/simulationStore";
import { StateLegend } from "../simulation/StateLegend";

const PHASE_LABELS = {
  idle: "Idle",
  mark: "Fase Mark",
  sweep: "Fase Sweep",
  done: "Completado",
} as const;

export function RightInfoPanel() {
  const graph = useSimulationStore((s) => s.graph);
  const steps = useSimulationStore((s) => s.simulationState.steps);
  const currentStep = useSimulationStore(
    (s) => s.simulationState.currentStep,
  );
  const phase = useSimulationStore((s) => s.simulationState.phase);
  const selectedElementId = useSimulationStore(
    (s) => s.simulationState.selectedElementId,
  );

  const phaseLabel = useMemo(() => {
    if (steps.length === 0) return PHASE_LABELS.idle;
    const stepPhase = steps[currentStep]?.phase ?? phase;
    return PHASE_LABELS[stepPhase];
  }, [steps, currentStep, phase]);

  const currentObjectId = steps[currentStep]?.currentObjectId ?? null;

  const selectedItemLabel = useMemo(() => {
    if (currentObjectId) {
      const obj = graph.objects.find((o) => o.id === currentObjectId);
      if (obj) return obj.label;
    }
    if (selectedElementId) {
      const obj = graph.objects.find((o) => o.id === selectedElementId);
      if (obj) return obj.label;
      const ref = graph.references.find((r) => r.id === selectedElementId);
      if (ref) {
        const src =
          graph.objects.find((o) => o.id === ref.sourceObjectId)?.label ?? "?";
        const tgt =
          graph.objects.find((o) => o.id === ref.targetObjectId)?.label ?? "?";
        return `${src} → ${tgt}`;
      }
    }
    return "—";
  }, [currentObjectId, selectedElementId, graph]);

  const explanation = useMemo(() => {
    if (steps.length === 0) {
      return "Pulsa Ejecutar o Paso siguiente para iniciar la simulación.";
    }
    return steps[currentStep]?.log ?? "";
  }, [steps, currentStep]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Fase actual
        </h3>
        <p data-testid="info-fase-actual" className="text-sm text-gray-800">
          {phaseLabel}
        </p>
      </section>

      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Elemento
        </h3>
        <p
          data-testid="info-elemento-seleccionado"
          className="text-sm text-gray-800 truncate"
        >
          {selectedItemLabel}
        </p>
      </section>

      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Explicación
        </h3>
        <p
          data-testid="info-explicacion"
          className="text-sm text-gray-700 leading-relaxed"
        >
          {explanation}
        </p>
      </section>

      <StateLegend />
    </div>
  );
}
