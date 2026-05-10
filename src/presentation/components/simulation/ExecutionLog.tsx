import { useEffect, useRef, useState } from "react";
import { useSimulationStore } from "../../../application/simulationStore";

interface LogEntry {
  time: string;
  text: string;
}

const formatTime = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;

export function ExecutionLog() {
  const steps = useSimulationStore((s) => s.simulationState.steps);
  const currentStep = useSimulationStore(
    (s) => s.simulationState.currentStep,
  );

  const [entries, setEntries] = useState<LogEntry[]>([]);
  const lastSeenRef = useRef(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (steps.length === 0) {
      setEntries([]);
      lastSeenRef.current = -1;
      return;
    }

    if (currentStep > lastSeenRef.current) {
      const time = formatTime(new Date());
      const fresh: LogEntry[] = [];
      for (let i = lastSeenRef.current + 1; i <= currentStep; i++) {
        fresh.push({ time, text: steps[i].log });
      }
      setEntries((prev) => [...prev, ...fresh]);
      lastSeenRef.current = currentStep;
    }
  }, [currentStep, steps]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  return (
    <div
      data-testid="execution-log"
      ref={containerRef}
      className="px-4 pb-3 h-32 overflow-y-auto text-xs font-mono text-gray-700 bg-gray-50 border-t border-gray-100"
    >
      {entries.length === 0 ? (
        <p className="italic text-gray-400 py-2">Registro de ejecución vacío.</p>
      ) : (
        <ul className="space-y-0.5 py-1">
          {entries.map((entry, idx) => (
            <li key={idx} className="leading-relaxed">
              <span className="text-gray-400 mr-2">{entry.time}</span>
              <span>{entry.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
