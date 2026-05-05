import toast from "react-hot-toast";

/**
 * Exact toast messages required by UI_SPEC §9 / RF-26.
 *
 * Cypress E2E tests assert these strings verbatim — do not paraphrase.
 */
export const TOAST_TEXT = {
  // Errors (red)
  duplicateReference: "Esta referencia ya existe entre estos dos objetos",
  createReferenceDuringSimulation:
    "No es posible crear referencias durante la simulación",
  deleteDuringSimulation:
    "No es posible eliminar elementos durante la simulación",
  editDuringSimulation:
    "No es posible editar elementos durante la simulación",
  deleteWithoutSelection: "Selecciona primero un objeto o referencia",
  markRootWithoutSelection: "Selecciona primero un objeto",
  invalidJsonFormat: "El archivo no tiene el formato correcto",
  jsonInconsistencies:
    "El archivo contiene referencias a objetos inexistentes",
  // Info (blue)
  objectDeletedWithRefs: (n: number) =>
    `Objeto eliminado. También se eliminaron ${n} referencias asociadas.`,
  scenarioImported: "Escenario importado correctamente",
  scenarioExported: "Escenario exportado correctamente",
  // Confirmation dialog (not a toast)
  noRootsDialog:
    "No hay raíces definidas. Todos los objetos serán considerados inalcanzables. ¿Continuar?",
} as const;

const COMMON_OPTIONS = {
  duration: 3000,
  position: "top-right" as const,
};

export const notify = {
  info(message: string) {
    toast(message, {
      ...COMMON_OPTIONS,
      style: {
        background: "#eff6ff", // blue-50
        color: "#1e3a8a", // blue-900
        border: "1px solid #bfdbfe", // blue-200
      },
    });
  },

  error(message: string) {
    toast.error(message, {
      ...COMMON_OPTIONS,
      style: {
        background: "#fef2f2", // red-50
        color: "#7f1d1d", // red-900
        border: "1px solid #fecaca", // red-200
      },
    });
  },
};
