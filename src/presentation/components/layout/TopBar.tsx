import { useRef, type ChangeEvent } from "react";
import { clearScenario } from "../../../application/useCases/clearScenario";
import { exportScenario } from "../../../application/useCases/exportScenario";
import { importScenario } from "../../../application/useCases/importScenario";
import { loadPredefinedScenario } from "../../../application/useCases/loadPredefinedScenario";
import { isValidationError } from "../../../domain/ports/IScenarioParser";
import { scenarioParser } from "../../../infrastructure/json/scenarioParser";
import { scenarioSerializer } from "../../../infrastructure/json/scenarioSerializer";
import cadenaLineal from "../../../infrastructure/json/scenarios/cadena-lineal.json";
import cicloAlcanzable from "../../../infrastructure/json/scenarios/ciclo-alcanzable.json";
import cicloInalcanzable from "../../../infrastructure/json/scenarios/ciclo-inalcanzable.json";
import multiplesRaices from "../../../infrastructure/json/scenarios/multiples-raices.json";
import sinRaices from "../../../infrastructure/json/scenarios/sin-raices.json";
import { TOAST_TEXT, notify } from "../../notifications/notifications";

const PREDEFINED_SCENARIOS = [
  { id: "cadena-lineal", label: "Cadena lineal", data: cadenaLineal },
  { id: "ciclo-alcanzable", label: "Ciclo alcanzable", data: cicloAlcanzable },
  {
    id: "ciclo-inalcanzable",
    label: "Ciclo inalcanzable",
    data: cicloInalcanzable,
  },
  { id: "multiples-raices", label: "Múltiples raíces", data: multiplesRaices },
  { id: "sin-raices", label: "Sin raíces", data: sinRaices },
] as const;

type ScenarioId = (typeof PREDEFINED_SCENARIOS)[number]["id"];

export function TopBar() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") return;
      const outcome = importScenario(scenarioParser, result);
      if (outcome.imported) {
        notify.info(TOAST_TEXT.scenarioImported);
      } else if (outcome.error) {
        notify.error(outcome.error.message);
      }
    };
    reader.readAsText(file);
    // Allow re-importing the same file later
    e.target.value = "";
  };

  const handleExport = () => {
    const json = exportScenario(scenarioSerializer);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "escenario.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify.info(TOAST_TEXT.scenarioExported);
  };

  const handleClear = () => clearScenario();

  const handleScenarioChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value as ScenarioId | "";
    if (!id) return;
    const entry = PREDEFINED_SCENARIOS.find((s) => s.id === id);
    if (!entry) return;
    const parsed = scenarioParser.parse(entry.data);
    if (isValidationError(parsed)) {
      notify.error(parsed.message);
    } else {
      loadPredefinedScenario(parsed);
    }
    e.target.value = "";
  };

  return (
    <header className="col-span-3 h-[50px] flex items-center justify-between px-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold text-gray-800">GC Visualizer</span>
        <span className="text-gray-300">|</span>
        <span className="text-sm text-gray-500">Simulador Mark &amp; Sweep</span>
      </div>

      <div className="flex items-center gap-2">
        <select
          data-testid="btn-cargar-escenario"
          onChange={handleScenarioChange}
          defaultValue=""
          className="border border-gray-300 rounded px-2 py-1 text-sm bg-white text-gray-800 hover:border-gray-400"
        >
          <option value="">Cargar escenario ▾</option>
          {PREDEFINED_SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          data-testid="btn-importar-json"
          onClick={openFilePicker}
          className="border border-gray-300 rounded px-3 py-1 text-sm bg-white text-gray-800 hover:bg-gray-50"
        >
          ↑ Importar JSON
        </button>

        <button
          data-testid="btn-exportar-json"
          onClick={handleExport}
          className="border border-gray-300 rounded px-3 py-1 text-sm bg-white text-gray-800 hover:bg-gray-50"
        >
          ↓ Exportar JSON
        </button>

        <button
          data-testid="btn-limpiar-escenario"
          onClick={handleClear}
          className="border border-gray-300 rounded px-3 py-1 text-sm bg-white text-gray-800 hover:bg-gray-50"
        >
          🗑 Limpiar escenario
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </header>
  );
}
