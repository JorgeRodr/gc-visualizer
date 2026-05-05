# GC Visualizer — Implementation Plan v2.0

> Plan de implementación por fases para el agente de Cursor.
>
> **Instrucciones al agente — leer antes de empezar:**
> 1. Ejecuta los puntos **en orden estricto**. No avances al siguiente punto si el criterio de verificación del actual no se cumple.
> 2. Si un criterio falla, **corrígelo en ese mismo punto** antes de avanzar. No acumules deuda técnica.
> 3. Los criterios de verificación son **comandos ejecutables con resultado esperado concreto**. Ejecútalos literalmente.
> 4. Cuando un criterio diga "X/X en verde", significa que **todos** deben pasar. Un solo fallo bloquea el avance.
> 5. La Fase 9 es la **checklist de cierre obligatoria**. El proyecto no está terminado hasta que los 5 criterios de esa fase pasen simultáneamente.
>
> **Documentos de referencia disponibles en `/docs`:**
> - `@SRS.md` — Requisitos funcionales (RF-01 a RF-26) y de interfaz (RI-01 a RI-10)
> - `@SDD.md` — Arquitectura, modelo de dominio y decisiones de diseño
> - `@STS.md` — 45 casos de prueba (TC-U-01–14, TC-I-01–10, TC-E-01–21)
> - `@UCD.md` — 15 casos de uso (CU-01–15)
> - `@UI_SPEC.md` — Especificación visual, flujos de interacción y JSON de escenarios
> - `@STP.md` — Plan de pruebas y estrategia de verificación

---

## Fase 0 — Scaffolding del proyecto

### 0.1 Crear proyecto base con Vite + React + TypeScript

**Objetivo**: proyecto base funcionando con la estructura de carpetas del SDD.

**Acciones**:
1. Crear proyecto:
   ```bash
   npm create vite@latest gc-visualizer -- --template react-ts
   cd gc-visualizer
   ```
2. Instalar dependencias de producción:
   ```bash
   npm install @xyflow/react zustand react-hot-toast
   ```
3. Instalar dependencias de desarrollo:
   ```bash
   npm install -D tailwindcss postcss autoprefixer jest @types/jest @testing-library/react @testing-library/jest-dom ts-jest cypress
   ```
4. Verificar en `package.json` que se usa `@xyflow/react` y **no** `reactflow` (versión antigua).
5. Configurar Tailwind CSS (`tailwind.config.js` + `postcss.config.js`).
6. Configurar Jest (`jest.config.ts`) con soporte TypeScript (ts-jest) y rutas de alias.
7. Crear la estructura de carpetas según `@SDD.md` sección 5.1:
```
src/
  domain/
    models/
    algorithms/
    validators/
    ports/
  application/
    useCases/
  presentation/
    components/
      layout/
      graph/
      simulation/
      scenarios/
    styles/
  infrastructure/
    json/
      scenarios/
  tests/
    unit/
    integration/
cypress/
  e2e/
```

**Criterio de verificación**:
```bash
npm run dev        # debe arrancar sin errores en http://localhost:5173
npx tsc --noEmit   # debe completar sin errores de TypeScript
```

---

## Fase 1 — Dominio: entidades, puertos y validador

### 1.1 Implementar entidades del dominio

**Objetivo**: definir todos los tipos TypeScript del modelo de dominio según `@SDD.md` sección 3.2.

**Contexto clave de `@SDD.md`**:
- `MemoryObject`: `id`, `label`, `isRoot`, `marked`, `alive`, `visitedOrder`, `position`
- `MemoryReference`: `id`, `sourceObjectId`, `targetObjectId`, `traversed`
- `MemoryGraph`: `objects`, `references` + métodos `getObject`, `getRoots`, `getOutgoingReferences`, `getIncomingReferences`
- `SimulationState`: `phase` (`'idle'|'mark'|'sweep'|'done'`), `currentStep`, `steps`, `logs`, `selectedElementId`, `showCollectedView`
- `SimulationStep`: `stepIndex`, `phase`, `currentObjectId`, `markedIds`, `traversedReferenceIds`, `log`

**Ficheros a crear**:
- `src/domain/models/MemoryObject.ts`
- `src/domain/models/MemoryReference.ts`
- `src/domain/models/MemoryGraph.ts`
- `src/domain/models/SimulationState.ts`
- `src/domain/models/SimulationStep.ts`

**Criterio de verificación**:
```bash
npx tsc --noEmit   # sin errores. Los tipos son importables desde otros módulos.
```

---

### 1.2 Implementar puertos del dominio

**Objetivo**: definir las interfaces de los puertos según `@SDD.md` sección 3.3.

**Ficheros a crear**:
- `src/domain/ports/IScenarioSerializer.ts` — métodos `serialize(graph): string` y `deserialize(data): MemoryGraph`
- `src/domain/ports/IScenarioParser.ts` — método `parse(raw): MemoryGraph | ValidationError`
- `src/domain/validators/IGraphValidator.ts` — método `validate(graph): ValidationResult`

**Criterio de verificación**:
```bash
npx tsc --noEmit   # sin errores
```

---

### 1.3 Implementar validador de grafo y sus tests

**Objetivo**: implementar `graphValidator.ts` que valida consistencia estructural del grafo.

**Contexto de `@SRS.md` RF-19**: valida referencias a objetos inexistentes, identificadores duplicados y referencias duplicadas.

**Ficheros a crear**:
- `src/domain/validators/graphValidator.ts`
- `src/tests/unit/graphValidator.test.ts` — implementar TC-U-13

**Criterio de verificación**:
```bash
npm test -- --testPathPattern=graphValidator   # TC-U-13 en verde
```

---

## Fase 2 — Dominio: algoritmo Mark & Sweep (TDD)

### 2.1 Implementar tests del algoritmo antes del código

**Objetivo**: escribir los tests unitarios TC-U-01 a TC-U-14 de `@STS.md` sección 2 **antes** de escribir el algoritmo. Fase roja del ciclo TDD.

**Ficheros a crear**:
- `src/tests/unit/memoryObject.test.ts` — TC-U-01
- `src/tests/unit/markAndSweep.test.ts` — TC-U-02 a TC-U-14

**Tests a implementar** (ver `@STS.md` sección 2 para precondiciones y resultados exactos):

| TC | Descripción |
|---|---|
| TC-U-01 | Creación de objeto con estado inicial correcto |
| TC-U-02 | Eliminación lógica de objeto y sus referencias |
| TC-U-03 | Rechazo de referencia duplicada |
| TC-U-04 | Marcado de objeto como raíz |
| TC-U-05 | Estado inicial de simulación antes de ejecutar |
| TC-U-06 | Fase Mark: cadena lineal A(raíz)→B→C |
| TC-U-07 | Fase Mark: objeto aislado sin raíz no se marca |
| TC-U-08 | Fase Mark: múltiples raíces |
| TC-U-09 | Fase Mark: ciclo alcanzable no produce bucle infinito |
| TC-U-10 | Fase Mark: ciclo inalcanzable queda sin marcar |
| TC-U-11 | Fase Sweep: objetos no marcados quedan recolectados |
| TC-U-12 | Fase Sweep: objetos marcados se conservan |
| TC-U-13 | Validación: rechazo de referencia a objeto inexistente |
| TC-U-14 | Fase Mark: autorreferencia A→A no produce bucle infinito |

**Criterio de verificación**:
```bash
npm test -- --testPathPattern=unit   # 14 tests deben EXISTIR y FALLAR (rojo esperado)
```

---

### 2.2 Implementar el algoritmo Mark & Sweep

**Objetivo**: implementar `markAndSweep.ts` como función pura según `@SDD.md` sección 4.

**Contexto clave de `@SDD.md`**:
- Interfaz: `computeMarkAndSweepSteps(graph: MemoryGraph): SimulationStep[]`
- Función pura sin efectos secundarios. No modifica el grafo de entrada.
- Fase Mark: DFS desde todas las raíces con conjunto de visitados para evitar bucles
- Fase Sweep: objetos no marcados → `alive = false`
- Si no hay raíces: generar paso de aviso, todos los objetos quedan recolectados

**Fichero a crear**: `src/domain/algorithms/markAndSweep.ts`

**Criterio de verificación**:
```bash
npm test -- --testPathPattern=unit   # 14/14 tests unitarios en VERDE
```
⚠️ **Gate**: si algún test falla, corregir el algoritmo antes de avanzar a Fase 3.

---

## Fase 3 — Aplicación: store y casos de uso

### 3.1 Implementar el store centralizado

**Objetivo**: implementar `simulationStore.ts` con Zustand según `@SDD.md` sección 5.2.

**Fichero a crear**: `src/application/simulationStore.ts`

**Estado que debe gestionar**:
- `graph: MemoryGraph` — grafo actual del escenario
- `simulationState: SimulationState` — estado completo de la simulación
- `selectedElementId: string | null` — nodo o arista seleccionada actualmente
- Métodos: `setGraph`, `updateSimulationState`, `reset`, `setSelectedElement`

**Criterio de verificación**:
```bash
npx tsc --noEmit   # sin errores. El store es importable.
```

---

### 3.2 Implementar casos de uso de edición del escenario

**Objetivo**: implementar los casos de uso de gestión según `@UCD.md` secciones 3.1 y 3.4.

**Ficheros a crear** en `src/application/useCases/`:
- `createObject.ts` — CU-01: crea objeto con UUID único, label "Objeto N", `isRoot=false`, `marked=false`, `alive=true`
- `editObject.ts` — CU-04: modifica `label` o `position` de un objeto existente
- `deleteObject.ts` — CU-05: elimina objeto y todas sus referencias; devuelve número de referencias eliminadas para el toast
- `createReference.ts` — CU-02: crea referencia validando que no sea duplicada
- `deleteReference.ts` — CU-06: elimina referencia por id
- `markAsRoot.ts` — CU-03: alterna `isRoot` de un objeto
- `clearScenario.ts` — CU-13: vacía el grafo completamente
- `loadPredefinedScenario.ts` — CU-12: carga uno de los 5 escenarios predefinidos y resetea simulación

**Tests a implementar**: TC-I-01, TC-I-02 de `@STS.md`

**Criterio de verificación**:
```bash
npm test -- --testPathPattern=integration   # TC-I-01 y TC-I-02 en verde
```

---

### 3.3 Implementar casos de uso de simulación e importación/exportación

**Objetivo**: implementar los casos de uso de ejecución y persistencia de escenarios.

**Ficheros a crear**:
- `runSimulation.ts` — CU-07: invoca `IGraphValidator`, luego `computeMarkAndSweepSteps`, almacena steps en store
- `stepSimulation.ts` — CU-08: avanza/retrocede `currentStep` sobre el array precalculado. Si no hay pasos precalculados al pulsar "Paso siguiente", los calcula en ese momento. **No invoca el algoritmo de nuevo si ya hay pasos.**
- `resetSimulation.ts` — CU-10: limpia phase, steps, logs y marcas; conserva objetos, referencias y raíces
- `exportScenario.ts` — CU-14: serializa el grafo a JSON. **Excluir** `marked`, `alive`, `visitedOrder`, `traversed`
- `importScenario.ts` — CU-15: parsea y valida JSON; rechaza si hay referencias a objetos inexistentes o ids duplicados

**Tests a implementar**: TC-I-03 a TC-I-10 de `@STS.md`

**Criterio de verificación**:
```bash
npm test -- --coverage
```
**Resultado esperado obligatorio**:
- ✅ 14/14 tests unitarios en verde
- ✅ 10/10 tests de integración en verde
- ✅ Cobertura en `src/domain/` ≥ 80%
- ✅ Cobertura en `src/application/` ≥ 80%

⚠️ **Gate**: 24/24 tests en verde y cobertura ≥80% antes de avanzar a Fase 4.

---

## Fase 4 — Presentación: layout y paneles de estructura

### 4.1 Implementar AppLayout y TopBar

**Objetivo**: estructura visual de la aplicación según `@UI_SPEC.md` secciones 1 y 2.

**Ficheros a crear**:
- `src/presentation/components/layout/AppLayout.tsx` — cinco zonas fijas
- `src/presentation/components/layout/TopBar.tsx`

**data-testid requeridos**: `btn-cargar-escenario`, `btn-importar-json`, `btn-exportar-json`, `btn-limpiar-escenario`

**Criterio de verificación**:
```bash
npm run dev      # layout de cinco zonas visible sin errores de consola
npx tsc --noEmit
```

---

### 4.2 Implementar LeftEditorPanel

**Objetivo**: panel izquierdo de edición según `@UI_SPEC.md` sección 3.

**Fichero a crear**: `src/presentation/components/layout/LeftEditorPanel.tsx`

**Requisitos críticos**:
- `data-testid`: `btn-crear-objeto`, `btn-crear-referencia`, `btn-eliminar-elemento`, `btn-marcar-raiz`
- Durante simulación activa (`phase !== 'idle'`): los cuatro botones deshabilitados (atributo `disabled`, apariencia gris)
- Texto de ayuda inline **siempre visible**, incluso durante simulación: `💡 Arrastra desde un objeto para crear una referencia, o usa el botón "Crear referencia".`
- Lista de objetos: `data-testid` `object-list-item-{id}` por cada objeto

**Criterio de verificación**:
```bash
npm run dev      # botones visibles y correctamente etiquetados
npx tsc --noEmit
```

---

## Fase 5 — Presentación: GraphCanvas y componentes de grafo

### 5.1 Implementar GraphCanvas con React Flow

**Objetivo**: área de visualización del grafo según `@SDD.md` sección 6.4 y `@UI_SPEC.md` sección 4.

**Fichero a crear**: `src/presentation/components/graph/GraphCanvas.tsx`

**Configuración React Flow — CRÍTICA**:
```tsx
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}         // OBLIGATORIO: persiste posición al re-renderizar
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}                 // creación de referencias por arrastre
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  connectionMode={ConnectionMode.Loose} // nodo completo como handle
  onNodeDoubleClick={onNodeDoubleClick} // edición inline de etiqueta
  onNodeClick={onNodeClick}
  onEdgeClick={onEdgeClick}
  fitView
/>
```

**data-testid**: `graph-canvas`

**Criterio de verificación**:
```bash
npm run dev      # canvas con grid de puntos visible, sin errores de consola
npx tsc --noEmit
```

---

### 5.2 Implementar ObjectNode con estados visuales y edición inline

**Objetivo**: nodo con 6 estados visuales y doble clic para editar según `@UI_SPEC.md` secciones 4 y 6.

**Ficheros a crear**:
- `src/presentation/components/graph/ObjectNode.tsx`
- `src/presentation/styles/stateColors.ts` — constantes de color para todos los estados

**Estados y prioridad** (En procesamiento prevalece sobre todos):

| Estado | Condición | Clases Tailwind |
|---|---|---|
| En procesamiento | `id === currentObjectId` | `bg-white border-orange-400 border-2 text-gray-800` |
| Raíz | `isRoot && !marked` | `bg-slate-800 border-slate-800 text-white` |
| Alcanzable | `marked && alive` | `bg-teal-100 border-teal-400 text-gray-800` |
| Normal | `!isRoot && !marked && alive` | `bg-white border-gray-300 text-gray-800` |
| No alcanzable | `!marked && phase === 'done'` | `bg-gray-100 border-gray-300 text-gray-400` |
| Recolectable | `alive === false` | `bg-red-100 border-red-300 text-gray-400 opacity-60` |

**Edición inline** (ver `@UI_SPEC.md` sección 7.2): doble clic → `<input>` inline con texto seleccionado → Enter/clic fuera guarda, Escape cancela. Bloqueado durante simulación activa.

**data-testid**: `node-{id}`

**Criterio de verificación**:
```bash
npm run dev      # crear objeto → estilo Normal. Marcarlo raíz → estilo Raíz (azul oscuro).
                 # doble clic → input de edición aparece.
npx tsc --noEmit
```

---

### 5.3 Implementar ReferenceEdge con estados visuales y selección

**Objetivo**: arista con 3 estados visuales y selección por clic según `@UI_SPEC.md` secciones 4 y 6.

**Fichero a crear**: `src/presentation/components/graph/ReferenceEdge.tsx`

**Estados**:
- Normal: `stroke: #d1d5db`, `strokeWidth: 1.5`
- Recorrida: `stroke: #2dd4bf`, `strokeWidth: 2.5`
- Seleccionada: `stroke: #6366f1`, `strokeWidth: 2`

**data-testid**: `edge-{sourceId}-{targetId}`

**Criterio de verificación**:
```bash
npm run dev      # crear referencia → arista gris con flecha. Clic → resaltada como seleccionada.
npx tsc --noEmit
```

---

## Fase 6 — Presentación: paneles de información, simulación y toasts

### 6.1 Implementar RightInfoPanel y leyenda

**Objetivo**: panel derecho según `@UI_SPEC.md` sección 5.

**Ficheros a crear**:
- `src/presentation/components/layout/RightInfoPanel.tsx`
- `src/presentation/components/simulation/StateLegend.tsx`

**data-testid requeridos**: `info-fase-actual`, `info-elemento-seleccionado`, `info-explicacion`, `legend-estados`

**Criterio de verificación**:
```bash
npm run dev      # panel muestra "Idle". Al ejecutar un paso, muestra fase y elemento correctos.
npx tsc --noEmit
```

---

### 6.2 Implementar BottomSimulationPanel con controles y log

**Objetivo**: controles de simulación con slider de velocidad y log según `@UI_SPEC.md` secciones 7.8, 7.9 y 8.

**Ficheros a crear**:
- `src/presentation/components/simulation/SimulationControls.tsx`
- `src/presentation/components/simulation/ExecutionLog.tsx`

**data-testid requeridos**: `btn-ejecutar`, `btn-pausar`, `btn-paso-anterior`, `btn-paso-siguiente`, `btn-reiniciar`, `slider-velocidad`, `execution-log`

**Lógica de ejecución automática — CRÍTICA** (ver `@SRS.md` RF-11):
- Usar `setInterval`. **NUNCA un bucle síncrono.**
- `delay = Math.round(1000 / velocidad)` — slider rango 1-10, default 5
- Al cambiar velocidad durante ejecución: cancelar intervalo actual y crear uno nuevo

**Lógica de habilitación** (ver `@UI_SPEC.md` sección 8):

| Botón | idle | running | paused | done |
|---|---|---|---|---|
| Ejecutar | ✓ | ✗ | ✗ | ✓ |
| Pausar | ✗ | ✓ | ✗ | ✗ |
| Paso anterior | según step | ✗ | según step | según step |
| Paso siguiente | ✓ | ✗ | ✓ | ✗ |
| Reiniciar | ✓ | ✓ | ✓ | ✓ |

**Criterio de verificación**:
```bash
npm run dev      # slider muestra "5x". Al ejecutar: controles cambian estado.
                 # el log muestra entradas en formato "HH:MM  descripción".
npx tsc --noEmit
```

---

### 6.3 Implementar sistema de notificaciones (toasts)

**Objetivo**: sistema completo de notificaciones según `@SRS.md` RF-26 y `@UI_SPEC.md` sección 9.

**Acciones**: configurar `react-hot-toast` en el punto de entrada. Invocar el toast desde cada caso de uso en la situación correspondiente.

**Mensajes exactos requeridos** (ver `@UI_SPEC.md` sección 9):

| Situación | Tipo | Mensaje exacto |
|---|---|---|
| Eliminar objeto con N referencias | Info | `"Objeto eliminado. También se eliminaron N referencias asociadas."` |
| Referencia duplicada | Error | `"Esta referencia ya existe entre estos dos objetos"` |
| Crear referencia durante simulación | Error | `"No es posible crear referencias durante la simulación"` |
| Editar durante simulación | Error | `"No es posible editar elementos durante la simulación"` |
| Eliminar durante simulación | Error | `"No es posible eliminar elementos durante la simulación"` |
| Eliminar/marcar sin selección | Error | `"Selecciona primero un objeto o referencia"` |
| JSON inválido | Error | `"El archivo no tiene el formato correcto"` |
| JSON con inconsistencias | Error | `"El archivo contiene referencias a objetos inexistentes"` |
| Importar correctamente | Info | `"Escenario importado correctamente"` |
| Exportar correctamente | Info | `"Escenario exportado correctamente"` |
| Ejecutar sin raíces | Diálogo | `"No hay raíces definidas. ¿Continuar?"` + botones Continuar/Cancelar |

**Criterio de verificación**:
```bash
npm run dev      # eliminar objeto con referencias: toast con texto exacto.
                 # intentar editar durante simulación: toast de error.
npx tsc --noEmit
```

---

## Fase 7 — Escenarios predefinidos e infraestructura JSON

### 7.1 Crear los 5 ficheros JSON de escenarios predefinidos

**Objetivo**: crear los ficheros JSON exactos según `@UI_SPEC.md` sección 11.

**Ficheros a crear** en `src/infrastructure/json/scenarios/`:

> Usar **exactamente** los JSON de la sección 11 de `@UI_SPEC.md`. No inventar ids ni posiciones distintas.

- `cadena-lineal.json`
- `ciclo-alcanzable.json`
- `ciclo-inalcanzable.json`
- `multiples-raices.json`
- `sin-raices.json`

**Criterio de verificación**:
```bash
npm run dev      # dropdown muestra los 5 escenarios por nombre.
                 # cargar cada uno: grafo se actualiza y simulación se resetea.
```

---

### 7.2 Implementar scenarioSerializer y scenarioParser

**Objetivo**: serialización y parsing de escenarios JSON según `@SDD.md` sección 5.3.

**Ficheros a crear** en `src/infrastructure/json/`:
- `scenarioSerializer.ts` — convierte `MemoryGraph` a JSON. Excluye `marked`, `alive`, `visitedOrder`, `traversed`
- `scenarioParser.ts` — parsea JSON y valida consistencia

**Criterio de verificación**:
```bash
npm test -- --coverage
```
**Resultado esperado obligatorio**:
- ✅ 14/14 tests unitarios en verde
- ✅ 10/10 tests de integración en verde
- ✅ Cobertura `src/domain/` ≥ 80%
- ✅ Cobertura `src/application/` ≥ 80%

⚠️ **Gate**: 24/24 tests en verde antes de avanzar a Fase 8.

---

## Fase 8 — Tests end-to-end con Cypress

### 8.1 Configurar Cypress

**Objetivo**: configurar Cypress para los 21 TC-E de `@STS.md` sección 4.

**Acciones**:
1. `npx cypress open` — configuración inicial, seleccionar E2E Testing
2. Configurar `cypress.config.ts` con `baseUrl: 'http://localhost:5173'`
3. Crear `cypress/e2e/gc-visualizer.cy.ts`
4. Añadir script: `"cypress:run": "cypress run"` en `package.json`

**Criterio de verificación**:
```bash
npm run dev &
npx cypress run   # Cypress navega a la app sin errores
```

---

### 8.2 Implementar TC-E-01 a TC-E-06 — Gestión del escenario

**Tests a implementar** (ver `@STS.md` sección 4 para precondiciones y resultados exactos):

| TC | Descripción |
|---|---|
| TC-E-01 | Crear objeto y verificar en grafo y lista |
| TC-E-02 | Eliminar objeto y verificar toast con texto exacto |
| TC-E-03 | Editar etiqueta con doble clic y bloqueo durante simulación |
| TC-E-04 | Crear referencia por arrastre y por botón modo conexión |
| TC-E-05 | Seleccionar arista por clic y eliminar con Delete |
| TC-E-06 | Marcar y desmarcar objeto raíz |

**Criterio de verificación**:
```bash
npx cypress run   # TC-E-01 a TC-E-06 en verde (6/6)
```
⚠️ Si algún TC falla, corregir la implementación antes de continuar.

---

### 8.3 Implementar TC-E-07 a TC-E-12 — Simulación

| TC | Descripción |
|---|---|
| TC-E-07 | Paso a paso con retroceso y verificación visual |
| TC-E-08 | Simulación automática con pausa, reanudación y control de velocidad |
| TC-E-09 | Diferenciación visual de objetos recolectados |
| TC-E-10 | Simulación completa: resultado correcto y registro |
| TC-E-11 | Vista tras recolección y retorno a vista completa |
| TC-E-12 | Reiniciar con vista activa y volver a ejecutar |

**Criterio de verificación**:
```bash
npx cypress run   # TC-E-01 a TC-E-12 en verde (12/12)
```

---

### 8.4 Implementar TC-E-13 a TC-E-17 — Escenarios y casos especiales

| TC | Descripción |
|---|---|
| TC-E-13 | Cargar escenario predefinido y verificar estado limpio |
| TC-E-14 | Leyenda visual coherente con estados del grafo |
| TC-E-15 | Exportar e importar escenario con fidelidad total |
| TC-E-16 | Bloqueo de eliminación durante simulación activa |
| TC-E-17 | Ejecutar sin raíces: diálogo de confirmación y todos recolectados |

**Criterio de verificación**:
```bash
npx cypress run   # TC-E-01 a TC-E-17 en verde (17/17)
```

---

### 8.5 Implementar TC-E-18 a TC-E-21 — Interacción avanzada

| TC | Descripción |
|---|---|
| TC-E-18 | Crear referencia por arrastre: cursor crosshair y arista creada |
| TC-E-19 | Crear referencia por botón modo conexión y cancelar con Escape |
| TC-E-20 | Seleccionar arista por clic simple y eliminar con tecla Delete |
| TC-E-21 | Paso a paso sin haber pulsado "Ejecutar" previamente |

**Criterio de verificación**:
```bash
npx cypress run   # TC-E-01 a TC-E-21 en verde (21/21)
```
⚠️ **Gate**: los 21 TC-E en verde antes de avanzar a Fase 9.

---

## Fase 9 — Verificación final y cierre del proyecto

> **El proyecto no está terminado hasta que los 5 criterios siguientes pasen simultáneamente.**
> Ejecutarlos en el orden indicado. Si alguno falla, corregir y volver a ejecutar todos desde el inicio de esta fase.

### 9.1 Suite unitaria e integración completa con cobertura

```bash
npm test -- --coverage
```

**Resultado esperado obligatorio**:
- ✅ `14/14` tests unitarios (TC-U-01 a TC-U-14) en verde
- ✅ `10/10` tests de integración (TC-I-01 a TC-I-10) en verde
- ✅ Cobertura de líneas en `src/domain/` ≥ **80%**
- ✅ Cobertura de líneas en `src/application/` ≥ **80%**

---

### 9.2 Build de producción sin errores TypeScript

```bash
npx tsc --noEmit && npm run build
```

**Resultado esperado obligatorio**:
- ✅ `tsc --noEmit` termina sin errores ni warnings de tipo
- ✅ `npm run build` genera `dist/` sin errores

---

### 9.3 Suite e2e completa

```bash
npm run preview &
npx cypress run
```

**Resultado esperado obligatorio**:
- ✅ `21/21` tests e2e (TC-E-01 a TC-E-21) en verde
- ✅ 0 tests fallidos

---

### 9.4 Verificación visual manual de los 5 escenarios

Con la aplicación en `npm run preview`, verificar manualmente:

1. **Cadena lineal** → ejecutar → A, B y C quedan en verde (alcanzables)
2. **Ciclo alcanzable** → ejecutar → B y C quedan en verde a pesar del ciclo B→C→B
3. **Ciclo inalcanzable** → ejecutar → el ciclo B→C→B queda en rojo (recolectado)
4. **Múltiples raíces** → ejecutar → E (aislado) queda en rojo, A B C D en verde
5. **Sin raíces** → ejecutar → aparece diálogo de confirmación → continuar → todos en rojo

**Resultado esperado**:
- ✅ Los 5 escenarios producen el resultado visual correcto

---

### 9.5 Checklist de implementación del UI_SPEC

Verificar que todos los puntos de `@UI_SPEC.md` sección 12 están implementados:

- ✅ `onNodesChange` conectado al store (posición de nodos persiste al re-renderizar)
- ✅ `connectionMode={ConnectionMode.Loose}` configurado en ReactFlow
- ✅ `onNodeDoubleClick` implementado para edición inline de etiqueta
- ✅ Aristas seleccionables con clic simple (`onEdgeClick` conectado al store)
- ✅ `setInterval`/`setTimeout` para ejecución automática (sin bucle síncrono)
- ✅ Velocidad del slider afecta al delay de la animación en tiempo real
- ✅ Paso a paso funciona sin haber pulsado "Ejecutar" previamente
- ✅ Todos los `data-testid` presentes en los componentes correspondientes
- ✅ Toasts con textos exactos para todas las situaciones de la sección 9
- ✅ No se usa `localStorage` en ningún lugar del código
- ✅ `@xyflow/react` en `package.json` (no `reactflow`)
- ✅ Constantes de color en `src/presentation/styles/stateColors.ts`

---

### Resumen de criterios de cierre

| # | Criterio | Comando | Umbral obligatorio |
|---|---|---|---|
| 1 | Tests unitarios + integración | `npm test -- --coverage` | 14/14 + 10/10 verde, cobertura ≥80% |
| 2 | TypeScript + build | `npx tsc --noEmit && npm run build` | 0 errores |
| 3 | Tests e2e | `npx cypress run` | 21/21 verde |
| 4 | Verificación visual | manual | 5/5 escenarios correctos |
| 5 | Checklist UI_SPEC | manual | 12/12 puntos |

> **El proyecto está terminado cuando los 5 criterios de esta tabla están cumplidos simultáneamente.**

---

## Referencia rápida de ficheros por fase

| Fase | Ficheros principales |
|---|---|
| 0 | Scaffolding, `package.json`, `jest.config.ts`, `tailwind.config.js` |
| 1 | `domain/models/*.ts`, `domain/ports/*.ts`, `domain/validators/graphValidator.ts` |
| 2 | `domain/algorithms/markAndSweep.ts`, `tests/unit/*.test.ts` |
| 3 | `application/simulationStore.ts`, `application/useCases/*.ts` |
| 4 | `presentation/components/layout/AppLayout.tsx`, `TopBar.tsx`, `LeftEditorPanel.tsx` |
| 5 | `presentation/components/graph/GraphCanvas.tsx`, `ObjectNode.tsx`, `ReferenceEdge.tsx`, `styles/stateColors.ts` |
| 6 | `presentation/components/layout/RightInfoPanel.tsx`, `simulation/SimulationControls.tsx`, `ExecutionLog.tsx`, `StateLegend.tsx` |
| 7 | `infrastructure/json/scenarios/*.json`, `infrastructure/json/scenarioSerializer.ts`, `scenarioParser.ts` |
| 8 | `cypress/e2e/gc-visualizer.cy.ts` (TC-E-01 a TC-E-21) |
| 9 | Verificación final — no genera ficheros nuevos |
