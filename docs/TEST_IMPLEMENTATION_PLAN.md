# GC Visualizer — Plan de implementación de tests pendientes

> Plan ejecutable para añadir los casos de test que faltan tras la sesión de bugfix/mejoras del 10/05/2026.
> Cada caso incluye: precondición, código Cypress / Jest concreto, validación de éxito y notas conocidas.
> Documentos de referencia: `STS.md` (TC-E-22..27 y la fila RF-04 ampliada), `UI_SPEC.md` v2.2 §§4, 7, 8 y `SRS.md` v1.5 RF-04 / RF-11 / RF-14 / RF-15.

---

## Instrucciones generales

1. Ejecutar los puntos en el orden indicado (no estricto, pero respetando dependencias). Cada uno deja la suite verde antes de pasar al siguiente.
2. Antes de empezar:
   ```bash
   npm test                    # 79/79 deben pasar
   npm run build               # 0 errores
   npx cypress run             # 26/26 verde (gc-visualizer.cy.ts + predefined-scenarios.cy.ts)
   ```
3. Mientras se desarrolla, conviene tener `npm run preview` corriendo en otra terminal y usar `npx cypress open` con la spec abierta.
4. Cada nuevo test E2E va al final del fichero `cypress/e2e/gc-visualizer.cy.ts`. La estructura típica usa `seedScenario` y, donde sea necesario, lectura del store vía `__store`.
5. Los tests deben ser deterministas: prohibido `cy.wait(<ms>)` salvo donde se justifique (timing del auto-play); preferir `cy.get(...).should(...)`.
6. Al añadir un test, marcar el caso en `STS.md` quitando la línea "Estado: Pendiente de implementar" del TC correspondiente.

---

## Punto 1 — TC-E-22: vista tras recolección oculta y restaura nodos

**Objetivo**: comprobar que `btn-vista-recoleccion` solo aparece en `phase==='done'`, oculta los nodos `alive=false` al pulsarlo y los restaura al pulsarlo de nuevo.

**Precondiciones**: build con commit `914f2f9` o posterior. El botón ya existe en `SimulationControls.tsx`.

**Implementación** (al final de `cypress/e2e/gc-visualizer.cy.ts`):

```ts
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
```

**Verificación**:
```bash
npx cypress run --spec cypress/e2e/gc-visualizer.cy.ts --grep "TC-E-22"
```
Debe terminar 1/1 verde.

**Notas**:
- El botón filtra a través de `visibleNodes`/`visibleEdges` en `GraphCanvas`; si el test fuese inestable por timing, `cy.get('[data-testid="node-E"]', { timeout: 1000 }).should("not.exist")` da margen.
- Verificar que tras pulsar de nuevo el grafo recupera la posición exacta (el filtrado no destruye `localNodes`).

---

## Punto 2 — TC-E-23: bloqueo de controles con grafo vacío

**Objetivo**: validar que con `graph.objects.length === 0` los botones Ejecutar / Paso siguiente / Reiniciar están `disabled`, y que se rehabilitan al añadir un objeto.

**Precondiciones**: commit `41d77bc` o posterior.

**Implementación**:

```ts
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
```

**Verificación**:
```bash
npx cypress run --spec cypress/e2e/gc-visualizer.cy.ts --grep "TC-E-23"
```

**Notas**:
- Si `btn-limpiar-escenario` muestra confirmación adicional en algún cambio futuro, ajustar el test (hoy es directo).

---

## Punto 3 — TC-E-25: regla right→left en modo botón

**Objetivo**: comprobar que al crear referencia con el botón `Crear referencia` la referencia almacenada lleva `sourceHandle="right"` y `targetHandle="left"`.

**Precondiciones**: commit `b62ea9e` o posterior. El use case `createReference` admite handles.

**Implementación**:

```ts
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
    .should((refs: Array<{ sourceObjectId: string; targetObjectId: string; sourceHandle?: string; targetHandle?: string }>) => {
      expect(refs).to.have.length(1);
      expect(refs[0].sourceObjectId).to.eq("A");
      expect(refs[0].targetObjectId).to.eq("B");
      expect(refs[0].sourceHandle).to.eq("right");
      expect(refs[0].targetHandle).to.eq("left");
    });
});
```

**Verificación**:
```bash
npx cypress run --spec cypress/e2e/gc-visualizer.cy.ts --grep "TC-E-25"
```

**Notas**:
- Aprovecha que `connectOnClick={false}` está activo (commit `626ef30`): los clics en los nodos NO inician conexión por sí solos, así que el flujo `btn-crear-referencia` → click A → click B es la única ruta.

---

## Punto 4 — TC-E-26: drop al vacío en modo arrastre

**Objetivo**: confirmar que arrastrar desde el handle de un nodo y soltar en zona vacía no crea referencia.

**Precondiciones**: build con handles laterales en cada nodo.

**Implementación** (con limitación conocida de drag en Cypress):

```ts
it("TC-E-26: drop al vacío en arrastre no crea referencia", () => {
  seedScenario([{ id: "A", label: "A", position: { x: 200, y: 200 } }]);

  // Cypress no puede simular fielmente el drag de React Flow (setPointerCapture
  // + elementsFromPoint). En lugar de orquestar pointer events, simulamos el
  // resultado: el callback onConnect SOLO se llama cuando ReactFlow detecta un
  // drop sobre un handle válido. Cuando el drop cae al vacío, onConnect NO se
  // dispara, por lo que no se crea referencia. Lo verificamos:
  // 1. Disparando un pointerdown sobre el handle right de A (inicia conexión).
  // 2. Disparando un pointerup en una zona vacía del canvas.
  // 3. Comprobando que el store sigue sin referencias.

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
```

**Verificación**:
```bash
npx cypress run --spec cypress/e2e/gc-visualizer.cy.ts --grep "TC-E-26"
```

**Notas**:
- Si los pointer events sintéticos resultan inestables en CI (problema conocido de Cypress + React Flow v12), **degradar a integration test**: invocar la función `onConnect` directamente con un objeto Connection inválido (source/target presentes pero el motor de React Flow no llama si no hay drop válido). Alternativa más robusta: tras pulsar `btn-crear-referencia` y hacer clic en un único nodo, comprobar que el modo conexión queda activo y nada se crea hasta el segundo clic — esto cubre el espíritu del caso aunque no la mecánica de drag.
- El selector exacto del handle source es `.react-flow__handle.react-flow__handle-right`. Ajustar si la versión de React Flow cambia clases.

---

## Punto 5 — TC-E-24: drag handle dedicado

**Objetivo**: comprobar que arrastrar desde el cuerpo del nodo NO mueve el nodo, y arrastrar desde la franja superior `.object-node-drag-handle` SÍ lo mueve.

**Precondiciones**: commit `4678059` o posterior.

**Implementación**:

```ts
it("TC-E-24: drag handle dedicado — solo la franja superior mueve el nodo", () => {
  seedScenario([{ id: "A", label: "A", position: { x: 200, y: 200 } }]);

  const initialPos = () =>
    cy.window().its("__store").invoke("getState").its("graph.objects.0.position");

  // 1) Drag desde el cuerpo central — la posición no debe cambiar.
  cy.get('[data-testid="node-A"]')
    .trigger("pointerdown", { button: 0, clientX: 260, clientY: 220 })
    .trigger("pointermove", { clientX: 360, clientY: 220 })
    .trigger("pointerup", { clientX: 360, clientY: 220 });

  initialPos().should("deep.equal", { x: 200, y: 200 });

  // 2) Drag desde la franja superior — la posición debe cambiar.
  cy.get('[data-testid="node-A"] .object-node-drag-handle')
    .trigger("pointerdown", { button: 0 })
    .trigger("pointermove", { clientX: 360, clientY: 220 })
    .trigger("pointerup", { clientX: 360, clientY: 220 });

  initialPos().should((pos: { x: number; y: number }) => {
    expect(pos.x).to.not.eq(200);
  });
});
```

**Verificación**:
```bash
npx cypress run --spec cypress/e2e/gc-visualizer.cy.ts --grep "TC-E-24"
```

**Notas**:
- Pointer events sintéticos en Cypress contra el motor de drag de React Flow son frágiles. Si el test parpadea, alternativa: comprobar a nivel DOM que la franja superior tiene `cursor: grab` y el cuerpo central no tiene cursor de drag, y que `dragHandle` está configurado en el nodo (vía `__store` o un selector concreto). Esto sacrifica cobertura completa pero es estable.
- Coordenadas relativas al viewport. Confirmar contra el `viewportWidth: 1366, viewportHeight: 768` declarado en `cypress.config.ts`.

---

## Punto 6 — TC-E-27: persistencia del lado por proximidad en arrastre

**Objetivo**: validar que tras un arrastre real `A.right → B.left`, la referencia almacenada lleva esos handles.

**Precondiciones**: build con handles laterales y `onConnect` que persiste handles.

**Implementación de respaldo (recomendada)** — convertir en integration test:

Crear nuevo archivo `src/tests/integration/onConnectHandles.test.ts`:

```ts
import { useSimulationStore } from "../../application/simulationStore";
import { createObject } from "../../application/useCases/createObject";
import { createReference } from "../../application/useCases/createReference";

describe("onConnect / createReference handle persistence", () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  test("TC-E-27 (degradado a integración): persiste handles de un Connection", () => {
    const a = createObject({ label: "A" });
    const b = createObject({ label: "B" });

    // Simulamos lo que hace GraphCanvas.onConnect ante un Connection del drag:
    const result = createReference(a.id, b.id, {
      source: "right",
      target: "left",
    });
    expect(result.created).toBe(true);

    const ref = useSimulationStore
      .getState()
      .graph.references.find((r) => r.id === result.referenceId);
    expect(ref?.sourceHandle).toBe("right");
    expect(ref?.targetHandle).toBe("left");
  });
});
```

**Implementación E2E (intentar primero)**:

```ts
it("TC-E-27: arrastre A.right → B.left persiste handles", () => {
  seedScenario([
    { id: "A", label: "A", position: { x: 150, y: 200 } },
    { id: "B", label: "B", position: { x: 500, y: 200 } },
  ]);

  // Arrastre simulado desde el handle right de A hasta el handle left de B.
  cy.get('[data-testid="node-A"] .react-flow__handle-right').trigger(
    "pointerdown",
    { button: 0 },
  );
  cy.get('[data-testid="node-B"] .react-flow__handle-left').trigger(
    "pointermove",
    {},
  );
  cy.get('[data-testid="node-B"] .react-flow__handle-left').trigger(
    "pointerup",
    {},
  );

  cy.window()
    .its("__store")
    .invoke("getState")
    .its("graph.references")
    .should((refs: Array<{ sourceHandle?: string; targetHandle?: string }>) => {
      expect(refs).to.have.length(1);
      expect(refs[0].sourceHandle).to.eq("right");
      expect(refs[0].targetHandle).to.eq("left");
    });
});
```

**Verificación**:
```bash
# Si se elige la vía E2E:
npx cypress run --spec cypress/e2e/gc-visualizer.cy.ts --grep "TC-E-27"
# Si se elige la vía integración:
npm test -- --testPathPatterns=onConnectHandles
```

**Notas**:
- Limitación conocida: el helper `dragNodeToNode` del archivo Cypress puentea ya hoy el motor de drag llamando directamente a `__useCases.createReference`. Si la versión E2E no consigue disparar `onConnect`, **convertir el caso a integración** como en el snippet de respaldo. La cobertura del comportamiento queda equivalente porque `onConnect` solo actúa de pasarela hacia `createReference(source, target, { source, target })`.
- Si se opta por la vía integración, mantener el ID `TC-E-27` por trazabilidad pero anotar en STS "Nivel: Integración" en lugar de E2E.

---

## Cierre

Tras implementar los 6 puntos:

1. `npm test` → debe seguir 79+/79+ verde (puede subir si se eligió la vía integración para TC-E-27).
2. `npx cypress run` → debe pasar a 32/32 (26 actuales + 6 nuevos) si todos van por E2E, o 31/31 + 1 unitario si TC-E-27 va por integración.
3. Actualizar el resumen en STS.md eliminando los textos "Estado: Pendiente de implementar" de los TC añadidos.
4. Hacer commit con mensaje en una línea, sin co-author trailer; sugerencia:
   ```
   test: add E2E coverage for post-collection view, empty-graph guards, and edge handles
   ```

## Resumen de cobertura esperada al cerrar el plan

| TC | Nivel | RF | Implementado por |
|---|---|---|---|
| TC-E-22 | E2E | RF-16 | Punto 1 |
| TC-E-23 | E2E | RF-11/14/15 | Punto 2 |
| TC-E-24 | E2E | RF-03 | Punto 5 |
| TC-E-25 | E2E | RF-04 | Punto 3 |
| TC-E-26 | E2E | RF-04 | Punto 4 |
| TC-E-27 | E2E o integración | RF-04 | Punto 6 |
