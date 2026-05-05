import { useSimulationStore } from "../../../application/simulationStore";
import { createObject } from "../../../application/useCases/createObject";
import { deleteObject } from "../../../application/useCases/deleteObject";
import { deleteReference } from "../../../application/useCases/deleteReference";
import { markAsRoot } from "../../../application/useCases/markAsRoot";
import { TOAST_TEXT, notify } from "../../notifications/notifications";

export function LeftEditorPanel() {
  const objects = useSimulationStore((s) => s.graph.objects);
  const references = useSimulationStore((s) => s.graph.references);
  const phase = useSimulationStore((s) => s.simulationState.phase);
  const selectedElementId = useSimulationStore(
    (s) => s.simulationState.selectedElementId,
  );
  const setSelectedElement = useSimulationStore((s) => s.setSelectedElement);
  const startConnectionMode = useSimulationStore(
    (s) => s.startConnectionMode,
  );
  const connectionModeActive = useSimulationStore(
    (s) => s.connectionMode.active,
  );

  const isSimulationActive = phase !== "idle";

  const handleCreateObject = () => {
    const obj = createObject();
    setSelectedElement(obj.id);
  };

  const handleCreateReference = () => {
    if (objects.length < 2) return;
    startConnectionMode();
  };

  const handleDeleteSelected = () => {
    if (!selectedElementId) {
      notify.error(TOAST_TEXT.deleteWithoutSelection);
      return;
    }
    const isObject = objects.some((o) => o.id === selectedElementId);
    if (isObject) {
      const result = deleteObject(selectedElementId);
      if (result.deleted && result.deletedReferences > 0) {
        notify.info(TOAST_TEXT.objectDeletedWithRefs(result.deletedReferences));
      }
    } else if (references.some((r) => r.id === selectedElementId)) {
      deleteReference(selectedElementId);
    }
    setSelectedElement(null);
  };

  const handleMarkAsRoot = () => {
    if (!selectedElementId) {
      notify.error(TOAST_TEXT.markRootWithoutSelection);
      return;
    }
    const isObject = objects.some((o) => o.id === selectedElementId);
    if (!isObject) {
      notify.error(TOAST_TEXT.markRootWithoutSelection);
      return;
    }
    markAsRoot(selectedElementId);
  };

  const baseButton =
    "w-full text-sm rounded px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryButton = `${baseButton} bg-slate-800 text-white hover:bg-slate-700 disabled:hover:bg-slate-800`;
  const secondaryButton = `${baseButton} bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 disabled:hover:bg-white`;

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex flex-col gap-2">
        <button
          data-testid="btn-crear-objeto"
          className={primaryButton}
          onClick={handleCreateObject}
          disabled={isSimulationActive}
        >
          + Crear objeto
        </button>
        <button
          data-testid="btn-crear-referencia"
          className={`${secondaryButton} ${
            connectionModeActive ? "ring-2 ring-blue-400 bg-blue-50" : ""
          }`}
          onClick={handleCreateReference}
          disabled={isSimulationActive}
        >
          Crear referencia
        </button>
        <button
          data-testid="btn-eliminar-elemento"
          className={secondaryButton}
          onClick={handleDeleteSelected}
          disabled={isSimulationActive}
        >
          Eliminar elemento
        </button>
        <button
          data-testid="btn-marcar-raiz"
          className={secondaryButton}
          onClick={handleMarkAsRoot}
          disabled={isSimulationActive}
        >
          Marcar como raíz
        </button>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">
        💡 Arrastra desde un objeto para crear una referencia, o usa el botón
        "Crear referencia".
      </p>

      <div className="flex flex-col gap-1 min-h-0 flex-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Objetos creados
        </h3>
        <ul className="flex flex-col gap-1 overflow-y-auto">
          {objects.length === 0 && (
            <li className="text-xs text-gray-400 italic px-2 py-1">
              (sin objetos)
            </li>
          )}
          {objects.map((obj) => {
            const isSelected = selectedElementId === obj.id;
            return (
              <li
                key={obj.id}
                data-testid={`object-list-item-${obj.id}`}
                onClick={() => setSelectedElement(obj.id)}
                className={`flex items-center justify-between px-2 py-1 rounded text-sm cursor-pointer ${
                  isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <span className="truncate text-gray-800">{obj.label}</span>
                {obj.isRoot && (
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-slate-800 text-white rounded">
                    Raíz
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
