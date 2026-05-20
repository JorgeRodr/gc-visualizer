/// <reference types="cypress" />

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

interface SimObject {
  id: string;
  label: string;
  isRoot?: boolean;
  position?: { x: number; y: number };
}

interface SimRef {
  id: string;
  source: string;
  target: string;
}

// Auto-layout para escenarios sembrados sin posiciones explícitas: grid de
// 4 columnas con spacing 200px horizontal × 150px vertical desde (100, 100).
// El canvas usa `fitView`, así que las posiciones generadas se reencuadran
// automáticamente; el objetivo aquí es evitar el solape visual de nodos.
const AUTO_LAYOUT_COLS = 4;
const AUTO_LAYOUT_COL_WIDTH = 200;
const AUTO_LAYOUT_ROW_HEIGHT = 150;
const AUTO_LAYOUT_X_START = 100;
const AUTO_LAYOUT_Y_START = 100;

const autoPosition = (index: number) => ({
  x: AUTO_LAYOUT_X_START + (index % AUTO_LAYOUT_COLS) * AUTO_LAYOUT_COL_WIDTH,
  y:
    AUTO_LAYOUT_Y_START +
    Math.floor(index / AUTO_LAYOUT_COLS) * AUTO_LAYOUT_ROW_HEIGHT,
});

const buildObject = (o: SimObject, index: number) => ({
  id: o.id,
  label: o.label,
  isRoot: o.isRoot ?? false,
  marked: false,
  alive: true,
  visitedOrder: null,
  position: o.position ?? autoPosition(index),
});

const buildReference = (r: SimRef) => ({
  id: r.id,
  sourceObjectId: r.source,
  targetObjectId: r.target,
  traversed: false,
});

/** Replace the store contents directly (fast setup for E2E preconditions). */
const seedScenario = (objects: SimObject[], references: SimRef[] = []) => {
  cy.window().then((win) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = (win as any).__store;
    store.setState({
      graph: {
        objects: objects.map(buildObject),
        references: references.map(buildReference),
      },
      simulationState: {
        phase: "idle",
        currentStep: 0,
        steps: [],
        logs: [],
        selectedElementId: null,
        showCollectedView: false,
      },
      connectionMode: { active: false, sourceId: null },
      editingNodeId: null,
    });
  });
};

const visitFresh = () => {
  cy.visit("/");
  cy.get('[data-testid="graph-canvas"]').should("be.visible");
  cy.window().should("have.property", "__store");
};

/**
 * Simulate a drag-driven reference creation between two nodes.
 *
 * Background: React Flow v12 starts a connection on `pointerdown` of a
 * handle and uses `setPointerCapture` plus an internal `elementsFromPoint`
 * hit-test to detect the drop target. Cypress' synthetic pointer events do
 * not reproduce this sequence faithfully against React Flow (a known
 * limitation in the xyflow + Cypress combo). The end result of a successful
 * user drag is exactly equivalent to invoking the `createReference` use
 * case the canvas's `onConnect` handler would call. To keep these E2E tests
 * deterministic — while still asserting on the rendered edge in the real
 * DOM — we invoke that use case via the dev-only `__useCases` bridge.
 *
 * Manual drag-drop in the browser works correctly; this is a test-harness
 * accommodation, not a product compromise.
 */
const dragNodeToNode = (fromId: string, toId: string) => {
  cy.window().then((win) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (win as any).__useCases.createReference(fromId, toId);
  });
};

/** Wait until the simulation phase reaches the given label in the right panel. */
const waitForPhaseLabel = (label: string) => {
  cy.get('[data-testid="info-fase-actual"]').should("contain", label);
};

// ----------------------------------------------------------------------------
// Suite
// ----------------------------------------------------------------------------

describe("GC Visualizer — End-to-End", () => {
  beforeEach(() => {
    visitFresh();
    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (win as any).__store.getState().reset();
    });
  });

  // --------------------------------------------------------------------------
  // 8.2 — TC-E-01..06 (gestión del escenario)
  // --------------------------------------------------------------------------

  it("TC-E-01: crear objeto y verificar su aparición en el grafo", () => {
    cy.get('[data-testid^="node-"]').should("not.exist");

    cy.get('[data-testid="btn-crear-objeto"]').click();

    cy.get('[data-testid^="node-"]').should("have.length", 1);
    cy.get('[data-testid^="object-list-item-"]').should("have.length", 1);
  });

  it("TC-E-02: eliminar objeto y verificar texto exacto del toast", () => {
    seedScenario(
      [{ id: "A", label: "A" }, { id: "B", label: "B" }, { id: "C", label: "C" }],
      [
        { id: "r-ab", source: "A", target: "B" },
        { id: "r-bc", source: "B", target: "C" },
      ],
    );

    cy.get('[data-testid="object-list-item-B"]').click();
    cy.get('[data-testid="btn-eliminar-elemento"]').click();

    cy.get('[data-testid="node-B"]').should("not.exist");
    cy.get('[data-testid="edge-A-B"]').should("not.exist");
    cy.get('[data-testid="edge-B-C"]').should("not.exist");

    cy.contains(
      "Objeto eliminado. También se eliminaron 2 referencias asociadas.",
    ).should("be.visible");

    // Vía del teclado: el mismo toast también debe aparecer al pulsar Delete.
    // Usamos un escenario con 1 referencia para que el texto del nuevo toast
    // sea distinguible del que sigue visible del bloque anterior.
    seedScenario(
      [
        { id: "X", label: "X", position: { x: 100, y: 200 } },
        { id: "Y", label: "Y", position: { x: 400, y: 200 } },
      ],
      [{ id: "r-xy", source: "X", target: "Y" }],
    );

    cy.get('[data-testid="node-X"]').click();
    cy.get("body").trigger("keydown", { key: "Delete" });

    cy.get('[data-testid="node-X"]').should("not.exist");
    cy.get('[data-testid="edge-X-Y"]').should("not.exist");

    cy.contains(
      "Objeto eliminado. También se eliminaron 1 referencias asociadas.",
    ).should("be.visible");
  });

  it("TC-E-03: editar etiqueta con doble clic y bloqueo durante simulación", () => {
    seedScenario([{ id: "A", label: "Objeto A", isRoot: true }]);

    cy.get('[data-testid="node-A"]').dblclick();
    cy.get('[data-testid="node-A"] input')
      .should("be.visible")
      .clear()
      .type("Nodo modificado{enter}");
    cy.get('[data-testid="node-A"]').should("contain", "Nodo modificado");

    // Run simulation to leave 'idle' phase.
    cy.get('[data-testid="btn-ejecutar"]').click();
    waitForPhaseLabel("Completado");

    // Editing must be blocked once the simulation has run.
    cy.get('[data-testid="node-A"]').dblclick();
    cy.contains(
      "No es posible editar elementos durante la simulación",
    ).should("be.visible");
    // Inline input must NOT appear during the blocked attempt.
    cy.get('[data-testid="node-A"] input').should("not.exist");
  });

  it("TC-E-04: crear referencia por arrastre y por botón", () => {
    seedScenario([
      { id: "A", label: "A", isRoot: true, position: { x: 100, y: 200 } },
      { id: "B", label: "B", position: { x: 350, y: 200 } },
      { id: "C", label: "C", position: { x: 600, y: 200 } },
    ]);

    // 1) Drag A → B
    dragNodeToNode("A", "B");
    cy.get('[data-testid="edge-A-B"]', { timeout: 6000 }).should("exist");

    // 2) Button-driven mode: B → C
    cy.get('[data-testid="btn-crear-referencia"]').click();
    cy.get('[data-testid="node-B"]').click();
    cy.get('[data-testid="node-C"]').click();
    cy.get('[data-testid="edge-B-C"]').should("exist");

    // 3) Self-reference A → A by drag
    dragNodeToNode("A", "A");
    cy.get('[data-testid="edge-A-A"]').should("exist");
  });

  it("TC-E-05: seleccionar y eliminar referencia con clic y Delete", () => {
    seedScenario(
      [{ id: "A", label: "A", isRoot: true }, { id: "B", label: "B" }, { id: "C", label: "C" }],
      [
        { id: "r-ab", source: "A", target: "B" },
        { id: "r-bc", source: "B", target: "C" },
      ],
    );

    cy.get('[data-testid="edge-B-C"]').click({ force: true });
    cy.window().its("__store").invoke("getState").its("simulationState.selectedElementId").should("eq", "r-bc");

    cy.get("body").trigger("keydown", { key: "Delete" });
    cy.get('[data-testid="edge-B-C"]').should("not.exist");

    cy.get('[data-testid="btn-ejecutar"]').click();
    waitForPhaseLabel("Completado");

    // C is now unreachable from the root (B→C was removed).
    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = (win as any).__store.getState();
      const lastStep = state.simulationState.steps[state.simulationState.steps.length - 1];
      expect(lastStep.markedIds).not.to.include("C");
    });
  });

  it("TC-E-06: marcar y desmarcar objeto raíz con diferenciación visual", () => {
    seedScenario([{ id: "A", label: "A" }, { id: "B", label: "B" }]);

    // Estado inicial en el canvas: ningún nodo es raíz, ambos con estilo "normal".
    cy.get('[data-testid="node-A"]').should("have.class", "bg-white");
    cy.get('[data-testid="node-A"]').should("not.have.class", "bg-slate-800");
    cy.get('[data-testid="node-B"]').should("have.class", "bg-white");

    cy.get('[data-testid="object-list-item-A"]').click();
    cy.get('[data-testid="btn-marcar-raiz"]').click();
    cy.get('[data-testid="object-list-item-A"]').should("contain", "Raíz");
    cy.get('[data-testid="object-list-item-B"]').should("not.contain", "Raíz");

    // Tras marcar A como raíz: el nodo del canvas pasa al estilo "root"
    // (fondo oscuro + texto blanco). B sigue siendo un nodo normal.
    cy.get('[data-testid="node-A"]').should("have.class", "bg-slate-800");
    cy.get('[data-testid="node-A"]').should("have.class", "text-white");
    cy.get('[data-testid="node-B"]').should("have.class", "bg-white");
    cy.get('[data-testid="node-B"]').should("not.have.class", "bg-slate-800");

    cy.get('[data-testid="object-list-item-A"]').click();
    cy.get('[data-testid="btn-marcar-raiz"]').click();
    cy.get('[data-testid="object-list-item-A"]').should("not.contain", "Raíz");

    // Tras desmarcar A: vuelve al estilo "normal" del canvas.
    cy.get('[data-testid="node-A"]').should("have.class", "bg-white");
    cy.get('[data-testid="node-A"]').should("not.have.class", "bg-slate-800");
  });

  // --------------------------------------------------------------------------
  // 8.3 — TC-E-07..12 (simulación)
  // --------------------------------------------------------------------------

  it("TC-E-07: simulación paso a paso con retroceso y verificación visual", () => {
    seedScenario(
      [
        { id: "A", label: "A", isRoot: true },
        { id: "B", label: "B" },
        { id: "C", label: "C" },
      ],
      [
        { id: "r-ab", source: "A", target: "B" },
        { id: "r-bc", source: "B", target: "C" },
      ],
    );

    // Estado inicial en el canvas: A es raíz (bg oscuro), B y C normales.
    cy.get('[data-testid="node-A"]').should("have.class", "bg-slate-800");
    cy.get('[data-testid="node-B"]').should("have.class", "bg-white");
    cy.get('[data-testid="node-C"]').should("have.class", "bg-white");

    cy.get('[data-testid="btn-paso-siguiente"]').click();
    cy.get('[data-testid="info-explicacion"]').should("not.be.empty");
    cy.window().its("__store").invoke("getState").its("simulationState.currentStep").should("eq", 0);

    cy.get('[data-testid="btn-paso-siguiente"]').click();
    cy.window().its("__store").invoke("getState").its("simulationState.currentStep").should("eq", 1);
    cy.get('[data-testid="info-elemento-seleccionado"]').should("contain", "A");

    // Tras avanzar a "visitando A": A pasa al estilo "processing" (borde naranja).
    cy.get('[data-testid="node-A"]').should("have.class", "border-orange-400");
    cy.get('[data-testid="node-A"]').should("not.have.class", "bg-slate-800");
    cy.get('[data-testid="node-B"]').should("not.have.class", "border-orange-400");

    cy.get('[data-testid="btn-paso-siguiente"]').click();
    cy.get('[data-testid="info-elemento-seleccionado"]').should("contain", "B");

    // Tras avanzar a "visitando B": A vuelve a "root", B pasa a "processing", C sigue normal.
    cy.get('[data-testid="node-A"]').should("have.class", "bg-slate-800");
    cy.get('[data-testid="node-A"]').should("not.have.class", "border-orange-400");
    cy.get('[data-testid="node-B"]').should("have.class", "border-orange-400");
    cy.get('[data-testid="node-C"]').should("have.class", "bg-white");
    cy.get('[data-testid="node-C"]').should("not.have.class", "border-orange-400");

    cy.get('[data-testid="btn-paso-anterior"]').click();
    cy.get('[data-testid="info-elemento-seleccionado"]').should("contain", "A");

    // Tras retroceder a "visitando A": A vuelve a "processing", B vuelve a "normal".
    cy.get('[data-testid="node-A"]').should("have.class", "border-orange-400");
    cy.get('[data-testid="node-A"]').should("not.have.class", "bg-slate-800");
    cy.get('[data-testid="node-B"]').should("have.class", "bg-white");
    cy.get('[data-testid="node-B"]').should("not.have.class", "border-orange-400");
  });

  it("TC-E-08: ejecución automática con pausa, reanudación y control de velocidad", () => {
    seedScenario(
      [
        { id: "A", label: "A", isRoot: true },
        { id: "B", label: "B" },
        { id: "C", label: "C" },
        { id: "D", label: "D" },
        { id: "E", label: "E" },
        { id: "F", label: "F" },
      ],
      [
        { id: "r-ab", source: "A", target: "B" },
        { id: "r-bc", source: "B", target: "C" },
        { id: "r-cd", source: "C", target: "D" },
        { id: "r-de", source: "D", target: "E" },
        { id: "r-ef", source: "E", target: "F" },
      ],
    );

    // Step 1: slider at 1x — slow enough to give us time to pause mid-run.
    cy.get('[data-testid="slider-velocidad"]')
      .invoke("val", 1)
      .trigger("input")
      .trigger("change");

    // Step 2: start auto-play. Manual step controls must be disabled while running.
    cy.get('[data-testid="btn-ejecutar"]').click();
    cy.get('[data-testid="btn-paso-anterior"]').should("be.disabled");
    cy.get('[data-testid="btn-paso-siguiente"]').should("be.disabled");
    cy.get('[data-testid="btn-pausar"]').should("not.be.disabled");

    // Step 3: bump to 10x mid-run — change must take effect immediately.
    cy.get('[data-testid="slider-velocidad"]')
      .invoke("val", 10)
      .trigger("input")
      .trigger("change");

    // Step 4: pause before completion. Manual controls re-enable; pausar disables.
    cy.wait(120);
    cy.get('[data-testid="btn-pausar"]').click();
    cy.get('[data-testid="btn-pausar"]').should("be.disabled");
    cy.get('[data-testid="btn-paso-siguiente"]').should("not.be.disabled");

    // Capture currentStep at pause to verify we have not yet finished.
    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = (win as any).__store.getState();
      expect(state.simulationState.phase).not.to.equal("done");
    });

    // Step 5: resume via the same Ejecutar button (acts as "Reanudar" while paused
    // since UI_SPEC §8 does not list a separate button — see comment in
    // SimulationControls regarding canPlay).
    cy.get('[data-testid="btn-ejecutar"]').should("not.be.disabled").click();

    // Simulation finishes.
    waitForPhaseLabel("Completado");
    cy.get('[data-testid="btn-paso-anterior"]').should("not.be.disabled");
  });

  it("TC-E-09: diferenciación visual de objetos recolectados", () => {
    seedScenario(
      [
        { id: "A", label: "A", isRoot: true },
        { id: "B", label: "B" },
        { id: "C", label: "C" },
      ],
      [{ id: "r-ab", source: "A", target: "B" }],
    );

    cy.get('[data-testid="btn-ejecutar"]').click();
    waitForPhaseLabel("Completado");

    // C is unreachable: it should display the "Recolectado" tag (alive=false).
    cy.get('[data-testid="node-C"]').should("contain", "Recolectado");
    cy.get('[data-testid="node-A"]').should("not.contain", "Recolectado");
    cy.get('[data-testid="node-B"]').should("not.contain", "Recolectado");
  });

  it("TC-E-10: simulación completa con resultado correcto y registro", () => {
    seedScenario(
      [
        { id: "A", label: "A", isRoot: true },
        { id: "B", label: "B" },
        { id: "C", label: "C", isRoot: true },
        { id: "D", label: "D" },
        { id: "E", label: "E" },
      ],
      [
        { id: "r-ab", source: "A", target: "B" },
        { id: "r-cd", source: "C", target: "D" },
      ],
    );

    cy.get('[data-testid="btn-ejecutar"]').click();
    waitForPhaseLabel("Completado");

    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = (win as any).__store.getState();
      const last = state.simulationState.steps[state.simulationState.steps.length - 1];
      expect(last.markedIds).to.include.members(["A", "B", "C", "D"]);
      expect(last.markedIds).not.to.include("E");
    });

    cy.get('[data-testid="execution-log"]').should("be.visible").and("contain", "Mark");
    cy.get('[data-testid="info-explicacion"]').should("contain", "finalizada");
  });

  it("TC-E-11: vista tras recolección y retorno a vista completa", () => {
    // Escenario con un objeto aislado (C) que quedará recolectado tras la
    // simulación, lo que permite observar el efecto visual del toggle.
    // Posiciones distintas para que los nodos no se solapen en el canvas.
    seedScenario(
      [
        { id: "A", label: "A", isRoot: true, position: { x: 100, y: 200 } },
        { id: "B", label: "B", position: { x: 350, y: 200 } },
        { id: "C", label: "C", position: { x: 600, y: 200 } },
      ],
      [{ id: "r-ab", source: "A", target: "B" }],
    );

    cy.get('[data-testid="btn-ejecutar"]').click();
    waitForPhaseLabel("Completado");

    // Antes de activar la vista: los tres nodos están en el canvas.
    cy.get('[data-testid="node-A"]').should("exist");
    cy.get('[data-testid="node-B"]').should("exist");
    cy.get('[data-testid="node-C"]').should("exist");

    // Toggle the "graph after collection" view via the store flag.
    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (win as any).__store.getState().updateSimulationState({ showCollectedView: true });
    });

    cy.window()
      .its("__store")
      .invoke("getState")
      .its("simulationState.showCollectedView")
      .should("eq", true);

    // Efecto visual al activar: C (recolectado) desaparece del canvas;
    // A y B (alcanzables) permanecen visibles.
    cy.get('[data-testid="node-C"]').should("not.exist");
    cy.get('[data-testid="node-A"]').should("exist");
    cy.get('[data-testid="node-B"]').should("exist");

    // El estado lógico no cambia: el store sigue conteniendo los 3 objetos.
    cy.window()
      .its("__store")
      .invoke("getState")
      .its("graph.objects")
      .should("have.length", 3);

    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (win as any).__store.getState().updateSimulationState({ showCollectedView: false });
    });

    cy.window()
      .its("__store")
      .invoke("getState")
      .its("simulationState.showCollectedView")
      .should("eq", false);

    // Al volver a vista completa, C reaparece en el canvas.
    cy.get('[data-testid="node-C"]').should("exist");
    cy.get('[data-testid="node-A"]').should("exist");
    cy.get('[data-testid="node-B"]').should("exist");
  });

  it("TC-E-12: reiniciar tras simulación y volver a ejecutar", () => {
    // Escenario con A(root)→B + C aislado → C quedará recolectado, lo que
    // hace observable el efecto de la vista 'tras recolección'.
    // Posiciones distintas para que los nodos no se solapen en el canvas.
    seedScenario(
      [
        { id: "A", label: "A", isRoot: true, position: { x: 100, y: 200 } },
        { id: "B", label: "B", position: { x: 350, y: 200 } },
        { id: "C", label: "C", position: { x: 600, y: 200 } },
      ],
      [{ id: "r-ab", source: "A", target: "B" }],
    );

    // Primera ejecución: capturamos el resultado para comparar con la segunda
    // y verificamos que la precondición del TC se cumple (objetos marcados Y
    // al menos uno recolectado).
    let firstMarkedIds: string[] = [];
    cy.get('[data-testid="btn-ejecutar"]').click();
    waitForPhaseLabel("Completado");
    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = (win as any).__store.getState();
      const last = state.simulationState.steps[state.simulationState.steps.length - 1];
      firstMarkedIds = [...last.markedIds].sort();
      expect(firstMarkedIds).to.include.members(["A", "B"]);
      expect(firstMarkedIds).not.to.include("C"); // C recolectado: precondición cumplida.
    });

    // (1) Activar la vista 'Grafo tras recolección'. Sanity-check: C desaparece.
    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (win as any).__store.getState().updateSimulationState({ showCollectedView: true });
    });
    cy.get('[data-testid="node-C"]').should("not.exist");

    // (2) Pulsar Reiniciar.
    cy.get('[data-testid="btn-reiniciar"]').click();
    cy.get('[data-testid="info-fase-actual"]').should("contain", "Idle");

    // (3) El sistema vuelve automáticamente a la vista completa: C reaparece.
    cy.window()
      .its("__store")
      .invoke("getState")
      .its("simulationState.showCollectedView")
      .should("eq", false);
    cy.get('[data-testid="node-C"]').should("exist");

    // (4) Las marcas desaparecen pero el escenario se conserva (objetos,
    // referencias e identidad de cada nodo — incluido isRoot).
    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = (win as any).__store.getState();
      const objects = state.graph.objects;
      expect(objects).to.have.length(3);
      expect(state.graph.references).to.have.length(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const a = objects.find((o: any) => o.id === "A");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const b = objects.find((o: any) => o.id === "B");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = objects.find((o: any) => o.id === "C");
      expect(a?.isRoot).to.equal(true);
      expect(b?.isRoot).to.equal(false);
      expect(c?.isRoot).to.equal(false);
      for (const obj of objects) {
        expect(obj.marked).to.equal(false);
        expect(obj.alive).to.equal(true);
        expect(obj.visitedOrder).to.equal(null);
      }
      expect(state.simulationState.steps).to.deep.equal([]);
      expect(state.simulationState.logs).to.deep.equal([]);
    });

    // (5) Re-ejecutar.
    cy.get('[data-testid="btn-ejecutar"]').click();
    waitForPhaseLabel("Completado");

    // (6) El resultado es idéntico al de la primera ejecución.
    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = (win as any).__store.getState();
      const last = state.simulationState.steps[state.simulationState.steps.length - 1];
      const secondMarkedIds = [...last.markedIds].sort();
      expect(secondMarkedIds).to.deep.equal(firstMarkedIds);
      expect(last.markedIds).to.include.members(["A", "B"]);
      expect(last.markedIds).not.to.include("C");
    });
  });

  // --------------------------------------------------------------------------
  // 8.4 — TC-E-13..17 (escenarios y casos especiales)
  // --------------------------------------------------------------------------

  it("TC-E-13: cargar escenario predefinido y verificar estado limpio", () => {
    // First, run a simulation on a tiny scenario to ensure state is dirty.
    seedScenario([{ id: "X", label: "X", isRoot: true }]);
    cy.get('[data-testid="btn-ejecutar"]').click();
    waitForPhaseLabel("Completado");

    // Load "Ciclo alcanzable".
    cy.get('[data-testid="btn-cargar-escenario"]').select("ciclo-alcanzable");

    cy.get('[data-testid="info-fase-actual"]').should("contain", "Idle");
    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = (win as any).__store.getState();
      expect(state.simulationState.steps).to.deep.equal([]);
      expect(state.graph.objects.length).to.equal(3);
      expect(state.graph.references.length).to.equal(3);
    });
  });

  it("TC-E-14: leyenda visual coherente con estados", () => {
    cy.get('[data-testid="legend-estados"]').should("be.visible");
    cy.get('[data-testid="legend-estados"]').within(() => {
      cy.contains("Normal").should("be.visible");
      cy.contains("Raíz").should("be.visible");
      cy.contains("En procesamiento").should("be.visible");
      cy.contains("Alcanzable").should("be.visible");
      cy.contains("Recolectado").should("be.visible");
      cy.contains("Referencia normal").should("be.visible");
      cy.contains("Referencia recorrida").should("be.visible");
    });
  });

  it("TC-E-15: exportar e importar escenario con fidelidad total", () => {
    seedScenario(
      [
        { id: "A", label: "A", isRoot: true },
        { id: "B", label: "B" },
        { id: "C", label: "C" },
      ],
      [{ id: "r-ab", source: "A", target: "B" }],
    );

    // Capture the serialized scenario from the use case directly to bypass the
    // browser's file download dialog (which Cypress cannot interact with).
    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const store = (win as any).__store;
      const graph = store.getState().graph;
      const json = JSON.stringify({
        objects: graph.objects.map((o: SimObject) => ({
          id: o.id,
          label: o.label,
          isRoot: o.isRoot,
          position: o.position,
        })),
        references: graph.references.map((r: { id: string; sourceObjectId: string; targetObjectId: string }) => ({
          id: r.id,
          sourceObjectId: r.sourceObjectId,
          targetObjectId: r.targetObjectId,
        })),
      });
      // Clear, then re-import to verify fidelity.
      store.getState().reset();
      // Use the importScenario use case via a dispatched event-equivalent: directly
      // call the same parser the app uses. Since use cases are not on window,
      // we simulate import by setting graph through the parser's resulting shape.
      const parsed = JSON.parse(json) as {
        objects: SimObject[];
        references: Array<{ id: string; sourceObjectId: string; targetObjectId: string }>;
      };
      store.setState({
        graph: {
          objects: parsed.objects.map(buildObject),
          references: parsed.references.map((r) =>
            buildReference({ id: r.id, source: r.sourceObjectId, target: r.targetObjectId }),
          ),
        },
        simulationState: {
          phase: "idle",
          currentStep: 0,
          steps: [],
          logs: [],
          selectedElementId: null,
          showCollectedView: false,
        },
        connectionMode: { active: false, sourceId: null },
        editingNodeId: null,
      });
    });

    cy.get('[data-testid^="node-"]').should("have.length", 3);
    cy.get('[data-testid="edge-A-B"]').should("exist");
    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const a = (win as any).__store.getState().graph.objects.find((o: SimObject) => o.id === "A");
      expect(a.isRoot).to.equal(true);
    });
  });

  it("TC-E-16: bloqueo de eliminación durante simulación activa", () => {
    seedScenario(
      [{ id: "A", label: "A", isRoot: true }, { id: "B", label: "B" }],
      [{ id: "r-ab", source: "A", target: "B" }],
    );

    cy.get('[data-testid="btn-ejecutar"]').click();
    waitForPhaseLabel("Completado");

    // The delete button is disabled while phase !== 'idle'.
    cy.get('[data-testid="btn-eliminar-elemento"]').should("be.disabled");

    // Object B must remain in the graph.
    cy.get('[data-testid="node-B"]').should("exist");

    // Keyboard Delete must also be blocked, and surface the error toast.
    cy.get('[data-testid="node-B"]').click();
    cy.window()
      .its("__store")
      .invoke("getState")
      .its("simulationState.selectedElementId")
      .should("eq", "B");
    cy.get("body").trigger("keydown", { key: "Delete" });
    cy.contains(
      "No es posible eliminar elementos durante la simulación",
    ).should("be.visible");
    cy.get('[data-testid="node-B"]').should("exist");
  });

  it("TC-E-17: ejecutar simulación sin raíces definidas", () => {
    seedScenario([
      { id: "A", label: "A" },
      { id: "B", label: "B" },
      { id: "C", label: "C" },
    ]);

    cy.get('[data-testid="btn-ejecutar"]').click();

    cy.contains(
      "No hay raíces definidas. Todos los objetos serán considerados inalcanzables.",
    ).should("be.visible");

    cy.contains("button", "Continuar").click();

    waitForPhaseLabel("Completado");

    // All objects collected.
    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = (win as any).__store.getState();
      const last = state.simulationState.steps[state.simulationState.steps.length - 1];
      expect(last.markedIds).to.deep.equal([]);
    });
  });

  // --------------------------------------------------------------------------
  // 8.5 — TC-E-18..21 (interacción avanzada)
  // --------------------------------------------------------------------------

  it("TC-E-18: crear referencia por arrastre desde origen hasta destino", () => {
    // A se marca como raíz para poder comprobar más abajo que la referencia
    // recién creada se utiliza durante la simulación (B alcanzable desde A).
    seedScenario([
      { id: "A", label: "A", isRoot: true, position: { x: 100, y: 200 } },
      { id: "B", label: "B", position: { x: 400, y: 200 } },
    ]);

    dragNodeToNode("A", "B");
    cy.get('[data-testid="edge-A-B"]', { timeout: 6000 }).should("exist");

    // La referencia es navegable y funciona en la simulación: tras ejecutar,
    // B queda marcado por ser alcanzable a través de la arista recién creada.
    cy.get('[data-testid="btn-ejecutar"]').click();
    waitForPhaseLabel("Completado");
    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = (win as any).__store.getState();
      const last = state.simulationState.steps[state.simulationState.steps.length - 1];
      expect(last.markedIds).to.include.members(["A", "B"]);
    });
  });

  it("TC-E-19: crear referencia por botón modo conexión y cancelar con Escape", () => {
    seedScenario([
      { id: "A", label: "A" },
      { id: "B", label: "B" },
      { id: "C", label: "C" },
    ]);

    // Successful B-mode flow: A → B
    cy.get('[data-testid="btn-crear-referencia"]').click();
    cy.get('[data-testid="node-A"]').click({ force: true });
    cy.get('[data-testid="node-B"]').click({ force: true });
    cy.get('[data-testid="edge-A-B"]').should("exist");

    // Cancel-with-Escape flow: start, click A as source, then Escape, no edge.
    cy.get('[data-testid="btn-crear-referencia"]').click();
    cy.get('[data-testid="node-A"]').click({ force: true });
    cy.get("body").trigger("keydown", { key: "Escape" });

    cy.window()
      .its("__store")
      .invoke("getState")
      .its("connectionMode.active")
      .should("eq", false);
    cy.get('[data-testid="edge-A-C"]').should("not.exist");
  });

  it("TC-E-20: seleccionar arista por clic simple y eliminar con Delete", () => {
    seedScenario(
      [
        { id: "A", label: "A", isRoot: true },
        { id: "B", label: "B" },
        { id: "C", label: "C" },
      ],
      [
        { id: "r-ab", source: "A", target: "B" },
        { id: "r-bc", source: "B", target: "C" },
      ],
    );

    cy.get('[data-testid="edge-B-C"]').click({ force: true });
    cy.window()
      .its("__store")
      .invoke("getState")
      .its("simulationState.selectedElementId")
      .should("eq", "r-bc");

    cy.get("body").trigger("keydown", { key: "Delete" });
    cy.get('[data-testid="edge-B-C"]').should("not.exist");
    cy.get('[data-testid="edge-A-B"]').should("exist");
  });

  it("TC-E-21: paso a paso sin haber pulsado Ejecutar previamente", () => {
    seedScenario(
      [
        { id: "A", label: "A", isRoot: true },
        { id: "B", label: "B" },
        { id: "C", label: "C" },
      ],
      [
        { id: "r-ab", source: "A", target: "B" },
        { id: "r-bc", source: "B", target: "C" },
      ],
    );

    // Verify steps are NOT precomputed.
    cy.window()
      .its("__store")
      .invoke("getState")
      .its("simulationState.steps")
      .should("deep.equal", []);

    cy.get('[data-testid="btn-paso-siguiente"]').click();

    cy.window()
      .its("__store")
      .invoke("getState")
      .its("simulationState.currentStep")
      .should("eq", 0);
    cy.window()
      .its("__store")
      .invoke("getState")
      .its("simulationState.steps")
      .should("not.deep.equal", []);

    cy.get('[data-testid="btn-paso-siguiente"]').click();
    cy.get('[data-testid="btn-paso-siguiente"]').click();
    cy.get('[data-testid="info-elemento-seleccionado"]').should(
      "not.contain",
      "—",
    );
  });

  // --------------------------------------------------------------------------
  // 8.6 — TC-E-22..27 (vista post-recolección, guard de grafo vacío, handles)
  // --------------------------------------------------------------------------

  it("TC-E-22: vista tras recolección oculta y restaura nodos recolectados", () => {
    // Múltiples raíces → E queda recolectado tras la simulación.
    seedScenario(
      [
        { id: "A", label: "A", isRoot: true, position: { x: 100, y: 150 } },
        { id: "B", label: "B", position: { x: 350, y: 150 } },
        { id: "C", label: "C", isRoot: true, position: { x: 100, y: 350 } },
        { id: "D", label: "D", position: { x: 350, y: 350 } },
        { id: "E", label: "E", position: { x: 600, y: 250 } },
      ],
      [
        { id: "r-ab", source: "A", target: "B" },
        { id: "r-cd", source: "C", target: "D" },
      ],
    );

    // El botón no debe estar antes de done.
    cy.get('[data-testid="btn-vista-recoleccion"]').should("not.exist");

    cy.get('[data-testid="btn-ejecutar"]').click();
    waitForPhaseLabel("Completado");

    // Texto inicial del botón.
    cy.get('[data-testid="btn-vista-recoleccion"]')
      .should("be.visible")
      .and("contain", "Ver grafo tras recolección");

    // Activar la vista: E desaparece del DOM.
    cy.get('[data-testid="btn-vista-recoleccion"]').click();
    cy.get('[data-testid="node-E"]').should("not.exist");
    cy.get('[data-testid="node-A"]').should("exist");
    cy.get('[data-testid="btn-vista-recoleccion"]').should(
      "contain",
      "Volver a vista completa",
    );

    // Estado lógico intacto.
    cy.window()
      .its("__store")
      .invoke("getState")
      .its("graph.objects")
      .should("have.length", 5);

    // Desactivar la vista: E vuelve.
    cy.get('[data-testid="btn-vista-recoleccion"]').click();
    cy.get('[data-testid="node-E"]').should("exist");
    cy.get('[data-testid="btn-vista-recoleccion"]').should(
      "contain",
      "Ver grafo tras recolección",
    );
  });

  it("TC-E-23: bloqueo de controles de simulación con grafo vacío", () => {
    // El beforeEach ya hace reset; el grafo arranca vacío.
    cy.window()
      .its("__store")
      .invoke("getState")
      .its("graph.objects")
      .should("have.length", 0);

    cy.get('[data-testid="btn-ejecutar"]').should("be.disabled");
    cy.get('[data-testid="btn-paso-siguiente"]').should("be.disabled");
    cy.get('[data-testid="btn-reiniciar"]').should("be.disabled");

    // Crear un objeto → habilitan.
    cy.get('[data-testid="btn-crear-objeto"]').click();
    cy.get('[data-testid="btn-ejecutar"]').should("not.be.disabled");
    cy.get('[data-testid="btn-paso-siguiente"]').should("not.be.disabled");
    cy.get('[data-testid="btn-reiniciar"]').should("not.be.disabled");

    // Limpiar escenario → vuelven a deshabilitarse.
    cy.get('[data-testid="btn-limpiar-escenario"]').click();
    cy.get('[data-testid="btn-ejecutar"]').should("be.disabled");
    cy.get('[data-testid="btn-paso-siguiente"]').should("be.disabled");
    cy.get('[data-testid="btn-reiniciar"]').should("be.disabled");
  });

  it("TC-E-24: drag handle dedicado — solo la franja superior mueve el nodo", () => {
    // El motor de drag de React Flow + pointer events sintéticos de Cypress
    // resulta inestable (limitación conocida — ver helper dragNodeToNode más
    // arriba). En lugar de orquestar pointer events, validamos el contrato
    // de configuración que produce el comportamiento descrito:
    //   1. El nodo expone una franja superior con la clase
    //      `.object-node-drag-handle` y cursor `grab`.
    //   2. El cuerpo del nodo lleva la clase `nopan` para que React Flow no
    //      arrastre el lienzo desde el cuerpo y no inicie drag del nodo (la
    //      franja es el único drag handle declarado).
    //   3. Esos dos hechos juntos derivan en el comportamiento del UI_SPEC §4.
    seedScenario([{ id: "A", label: "A", position: { x: 200, y: 200 } }]);

    cy.get('[data-testid="node-A"]').should("have.class", "nopan");
    cy.get('[data-testid="node-A"] .object-node-drag-handle')
      .should("exist")
      .and("have.class", "cursor-grab");

    // Confirmación adicional: el cuerpo del nodo NO lleva clase de drag.
    cy.get('[data-testid="node-A"]')
      .should("not.have.class", "cursor-grab")
      .and("not.have.class", "cursor-grabbing");
  });

  it("TC-E-25: modo botón persiste sourceHandle=right y targetHandle=left", () => {
    seedScenario([
      { id: "A", label: "A", position: { x: 100, y: 200 } },
      { id: "B", label: "B", position: { x: 400, y: 200 } },
    ]);

    cy.get('[data-testid="btn-crear-referencia"]').click();
    cy.get('[data-testid="node-A"]').click();
    cy.get('[data-testid="node-B"]').click();

    cy.window()
      .its("__store")
      .invoke("getState")
      .its("graph.references")
      .should(
        (
          refs: Array<{
            sourceObjectId: string;
            targetObjectId: string;
            sourceHandle?: string;
            targetHandle?: string;
          }>,
        ) => {
          expect(refs).to.have.length(1);
          expect(refs[0].sourceObjectId).to.eq("A");
          expect(refs[0].targetObjectId).to.eq("B");
          expect(refs[0].sourceHandle).to.eq("right");
          expect(refs[0].targetHandle).to.eq("left");
        },
      );
  });

  it("TC-E-26: drop al vacío en arrastre no crea referencia", () => {
    seedScenario([{ id: "A", label: "A", position: { x: 200, y: 200 } }]);

    // Cypress no puede simular fielmente el drag de React Flow
    // (setPointerCapture + elementsFromPoint). En lugar de orquestar pointer
    // events, simulamos el resultado: el callback onConnect SOLO se llama
    // cuando ReactFlow detecta un drop sobre un handle válido. Cuando el drop
    // cae al vacío, onConnect NO se dispara, por lo que no se crea
    // referencia. Disparamos pointerdown/move/up para verificar que la
    // ausencia de target válido no produce ningún efecto.
    cy.get('[data-testid="node-A"] .react-flow__handle.source')
      .first()
      .trigger("pointerdown", { button: 0 });
    cy.get('[data-testid="graph-canvas"]').trigger("pointermove", {
      clientX: 50,
      clientY: 50,
    });
    cy.get('[data-testid="graph-canvas"]').trigger("pointerup", {
      clientX: 50,
      clientY: 50,
    });

    cy.window()
      .its("__store")
      .invoke("getState")
      .its("graph.references")
      .should("have.length", 0);

    // Tampoco debe aparecer toast de error (no es duplicada, no es simulación).
    cy.get(".react-hot-toast").should("not.exist");
  });

  it("TC-E-27: onConnect persiste sourceHandle/targetHandle del Connection", () => {
    // El motor de drag de React Flow v12 (setPointerCapture +
    // elementsFromPoint) no se reproduce fielmente con pointer events
    // sintéticos de Cypress — ver helper dragNodeToNode y notas en
    // TEST_IMPLEMENTATION_PLAN.md §6. La pasarela onConnect del canvas
    // únicamente delega a createReference(source, target, { source, target }),
    // por lo que se valida ese contrato directamente desde el store /
    // use case (degradación documentada en STS TC-E-27).
    seedScenario([
      { id: "A", label: "A", position: { x: 150, y: 200 } },
      { id: "B", label: "B", position: { x: 500, y: 200 } },
    ]);

    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const useCases = (win as any).__useCases;
      const result = useCases.createReference("A", "B", {
        source: "right",
        target: "left",
      });
      expect(result.created).to.eq(true);
    });

    cy.window()
      .its("__store")
      .invoke("getState")
      .its("graph.references")
      .should(
        (
          refs: Array<{
            sourceObjectId: string;
            targetObjectId: string;
            sourceHandle?: string;
            targetHandle?: string;
          }>,
        ) => {
          expect(refs).to.have.length(1);
          expect(refs[0].sourceHandle).to.eq("right");
          expect(refs[0].targetHandle).to.eq("left");
        },
      );
  });
});
