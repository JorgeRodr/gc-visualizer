import { useCallback, useEffect, useRef, useState } from "react";
import { useSimulationStore } from "../../../application/simulationStore";
import { resetSimulation } from "../../../application/useCases/resetSimulation";
import { stepSimulation } from "../../../application/useCases/stepSimulation";
import { TOAST_TEXT } from "../../notifications/notifications";

const MIN_SPEED = 1;
const MAX_SPEED = 10;
const DEFAULT_SPEED = 5;

const computeDelay = (speed: number) => Math.round(1000 / speed);

export function SimulationControls() {
  const phase = useSimulationStore((s) => s.simulationState.phase);
  const steps = useSimulationStore((s) => s.simulationState.steps);
  const currentStep = useSimulationStore(
    (s) => s.simulationState.currentStep,
  );

  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [running, setRunning] = useState(false);
  const [confirmingNoRoots, setConfirmingNoRoots] = useState(false);

  const intervalRef = useRef<number | null>(null);

  const stopAuto = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const startAuto = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(() => {
      const state = useSimulationStore.getState().simulationState;
      if (
        state.steps.length > 0 &&
        state.currentStep >= state.steps.length - 1
      ) {
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setRunning(false);
        return;
      }
      stepSimulation("forward");
    }, computeDelay(speed));
    setRunning(true);
  }, [speed]);

  // Restart interval when speed changes during running
  useEffect(() => {
    if (running && intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        const state = useSimulationStore.getState().simulationState;
        if (
          state.steps.length > 0 &&
          state.currentStep >= state.steps.length - 1
        ) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setRunning(false);
          return;
        }
        stepSimulation("forward");
      }, computeDelay(speed));
    }
  }, [speed, running]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const isDone = phase === "done";
  const hasSteps = steps.length > 0;
  const atLastStep = hasSteps && currentStep >= steps.length - 1;
  const atFirstStep = !hasSteps || currentStep <= 0;

  const canPlay = !running && !atLastStep;
  const canPause = running;
  const canStepBackward = !running && hasSteps && !atFirstStep;
  const canStepForward = !running && !atLastStep;
  const canReset = true;

  const handlePlay = useCallback(() => {
    if (running) return;

    // If finished, reset and start over.
    if (isDone) {
      resetSimulation();
    }

    const state = useSimulationStore.getState();
    if (state.simulationState.steps.length === 0) {
      const hasRoots = state.graph.objects.some((o) => o.isRoot);
      if (!hasRoots && state.graph.objects.length > 0) {
        setConfirmingNoRoots(true);
        return;
      }
    }
    startAuto();
  }, [running, isDone, startAuto]);

  const handleConfirmNoRoots = () => {
    setConfirmingNoRoots(false);
    // stepSimulation lazily computes the steps when none exist and lands on
    // step 0; computeMarkAndSweepSteps already emits an explanatory step
    // when no roots are defined.
    stepSimulation("forward");
    startAuto();
  };

  const handleCancelNoRoots = () => setConfirmingNoRoots(false);

  const handlePause = () => stopAuto();

  const handleStepBackward = () => stepSimulation("backward");

  const handleStepForward = () => stepSimulation("forward");

  const handleReset = () => {
    stopAuto();
    resetSimulation();
  };

  const baseBtn =
    "px-3 py-1.5 text-sm rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn = `${baseBtn} bg-slate-800 text-white border-slate-800 hover:bg-slate-700`;
  const secondaryBtn = `${baseBtn} bg-white text-gray-800 border-gray-300 hover:bg-gray-50`;

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <button
        data-testid="btn-ejecutar"
        onClick={handlePlay}
        disabled={!canPlay}
        className={primaryBtn}
      >
        ▶ Ejecutar
      </button>
      <button
        data-testid="btn-pausar"
        onClick={handlePause}
        disabled={!canPause}
        className={secondaryBtn}
      >
        ⏸ Pausar
      </button>
      <button
        data-testid="btn-paso-anterior"
        onClick={handleStepBackward}
        disabled={!canStepBackward}
        className={secondaryBtn}
      >
        ◀ Paso anterior
      </button>
      <button
        data-testid="btn-paso-siguiente"
        onClick={handleStepForward}
        disabled={!canStepForward}
        className={secondaryBtn}
      >
        Paso siguiente ▶
      </button>
      <button
        data-testid="btn-reiniciar"
        onClick={handleReset}
        disabled={!canReset}
        className={secondaryBtn}
      >
        ↻ Reiniciar
      </button>

      <div className="flex items-center gap-2 ml-4">
        <label htmlFor="slider-velocidad" className="text-sm text-gray-700">
          Velocidad
        </label>
        <input
          id="slider-velocidad"
          data-testid="slider-velocidad"
          type="range"
          min={MIN_SPEED}
          max={MAX_SPEED}
          step={1}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-32"
        />
        <span className="text-sm text-gray-700 w-8">{speed}x</span>
      </div>

      {confirmingNoRoots && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg max-w-md w-full p-5">
            <p className="text-sm text-gray-800">{TOAST_TEXT.noRootsDialog}</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={handleCancelNoRoots} className={secondaryBtn}>
                Cancelar
              </button>
              <button onClick={handleConfirmNoRoots} className={primaryBtn}>
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
