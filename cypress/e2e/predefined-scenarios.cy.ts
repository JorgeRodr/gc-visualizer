/// <reference types="cypress" />

// Programmatic verification of the 5 predefined scenarios (Fase 9.4).
// Each test loads the scenario via the dropdown and asserts the simulation
// outcome matches the expected reachability described in UI_SPEC §11.

const loadScenario = (id: string) => {
  cy.get('[data-testid="btn-cargar-escenario"]').select(id);
};

const runUntilDone = () => {
  cy.get('[data-testid="btn-ejecutar"]').click();
  cy.get('[data-testid="info-fase-actual"]').should("contain", "Completado");
};

const lastStep = () =>
  cy.window().then((win) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state = (win as any).__store.getState();
    return state.simulationState.steps[state.simulationState.steps.length - 1];
  });

describe("Fase 9.4 — verificación de los 5 escenarios predefinidos", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get('[data-testid="graph-canvas"]').should("be.visible");
    cy.window().then((win) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (win as any).__store.getState().reset();
    });
  });

  it("Cadena lineal — A, B, C todos alcanzables", () => {
    loadScenario("cadena-lineal");
    runUntilDone();
    lastStep().then((step) => {
      expect(step.markedIds).to.include.members(["raiz-1", "obj-b", "obj-c"]);
    });
  });

  it("Ciclo alcanzable — B y C marcados pese al ciclo B↔C", () => {
    loadScenario("ciclo-alcanzable");
    runUntilDone();
    lastStep().then((step) => {
      expect(step.markedIds).to.include.members(["raiz-1", "obj-b", "obj-c"]);
    });
  });

  it("Ciclo inalcanzable — el ciclo B↔C queda recolectado", () => {
    loadScenario("ciclo-inalcanzable");
    runUntilDone();
    lastStep().then((step) => {
      expect(step.markedIds).to.include("raiz-1");
      expect(step.markedIds).not.to.include("obj-b");
      expect(step.markedIds).not.to.include("obj-c");
    });
  });

  it("Múltiples raíces — A, B, C, D marcados; E aislado recolectado", () => {
    loadScenario("multiples-raices");
    runUntilDone();
    lastStep().then((step) => {
      expect(step.markedIds).to.include.members([
        "raiz-1",
        "obj-b",
        "raiz-2",
        "obj-d",
      ]);
      expect(step.markedIds).not.to.include("obj-e");
    });
  });

  it("Sin raíces — diálogo de confirmación y todos recolectados al continuar", () => {
    loadScenario("sin-raices");

    cy.get('[data-testid="btn-ejecutar"]').click();

    cy.contains(
      "No hay raíces definidas. Todos los objetos serán considerados inalcanzables.",
    ).should("be.visible");

    cy.contains("button", "Continuar").click();

    cy.get('[data-testid="info-fase-actual"]').should("contain", "Completado");

    lastStep().then((step) => {
      expect(step.markedIds).to.deep.equal([]);
    });
  });
});
