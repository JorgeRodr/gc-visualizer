# GC Visualizer — Guía de funcionamiento del proyecto

> Documento didáctico que recorre el código fuente de **GC Visualizer** desde el componente más superficial (`App.tsx`) hasta el núcleo del dominio (algoritmo Mark & Sweep). Por cada función relevante se explica **qué hace**, **cómo lo hace** y, cuando aplica, **por qué se programa de esa manera** (patrones, paso de funciones como argumentos, inmutabilidad, hooks de React, etc.).
>
> Este documento es complementario al `SDD.md` (descripción de diseño formal). Mientras el SDD documenta *decisiones arquitectónicas*, esta guía documenta *implementación*: el código línea a línea, sus mecanismos y los conceptos teóricos que los sustentan.

---

## Índice

0. [Cómo leer este documento](#0-cómo-leer-este-documento)
1. [Mapa mental: las cuatro capas](#1-mapa-mental-las-cuatro-capas)
2. [Capa 0 — Bootstrapping (`main.tsx`, `App.tsx`)](#2-capa-0--bootstrapping)
3. [Capa 1 — Layout principal (`AppLayout.tsx`)](#3-capa-1--layout-principal)
4. [Capa 2 — Componentes de presentación](#4-capa-2--componentes-de-presentación)
   - 4.1 [`TopBar`](#41-topbar)
   - 4.2 [`LeftEditorPanel`](#42-lefteditorpanel)
   - 4.3 [`GraphCanvas`](#43-graphcanvas)
   - 4.4 [`ObjectNode`](#44-objectnode)
   - 4.5 [`ReferenceEdge`](#45-referenceedge)
   - 4.6 [`RightInfoPanel`](#46-rightinfopanel)
   - 4.7 [`SimulationControls`](#47-simulationcontrols)
   - 4.8 [`ExecutionLog`](#48-executionlog)
   - 4.9 [`StateLegend` y `stateColors`](#49-statelegend-y-statecolors)
   - 4.10 [`notifications`](#410-notifications)
5. [Capa 3 — Estado global (`simulationStore.ts`)](#5-capa-3--estado-global)
6. [Capa 4 — Casos de uso (`application/useCases/`)](#6-capa-4--casos-de-uso)
7. [Capa 5 — Dominio](#7-capa-5--dominio)
   - 7.1 [Modelos](#71-modelos)
   - 7.2 [Algoritmo Mark & Sweep](#72-algoritmo-mark--sweep)
   - 7.3 [Validador de grafo](#73-validador-de-grafo)
   - 7.4 [Puertos](#74-puertos)
8. [Capa 6 — Infraestructura](#8-capa-6--infraestructura)
9. [Apéndice A — Conceptos teóricos transversales](#9-apéndice-a--conceptos-teóricos-transversales)
10. [Apéndice B — Recorrido de un escenario completo](#10-apéndice-b--recorrido-de-un-escenario-completo)

---

## 0. Cómo leer este documento

Cada sección sigue el mismo patrón:

- **Ubicación**: ruta del fichero.
- **Propósito**: qué papel cumple en la aplicación.
- **Análisis del código**: bloques o funciones, con su explicación.
- **Conceptos teóricos relevantes**: por qué se programa así (cuando aporta valor pedagógico).

Los conceptos que aparecen muchas veces (selectores Zustand, `useEffect`, *higher-order functions*, inmutabilidad, etc.) se introducen la primera vez y se referencian después al apéndice A. Si encuentras un término desconocido, búscalo allí.

---

## 1. Mapa mental: las cuatro capas

GC Visualizer adopta **Clean Architecture** con cuatro capas concéntricas. La regla fundamental es: **las dependencias siempre apuntan hacia adentro**. Una capa exterior puede importar de una interior, pero nunca al revés.

```
   ┌────────────────────────────────────────────────────────────┐
   │  presentation/   ← React, React Flow, Tailwind, toasts     │
   │  ┌──────────────────────────────────────────────────────┐  │
   │  │  application/   ← casos de uso + store (Zustand)     │  │
   │  │  ┌────────────────────────────────────────────────┐  │  │
   │  │  │  domain/   ← modelos, algoritmo, puertos       │  │  │
   │  │  └────────────────────────────────────────────────┘  │  │
   │  └──────────────────────────────────────────────────────┘  │
   │  infrastructure/   ← adaptadores (JSON parser/serializer) │
   └────────────────────────────────────────────────────────────┘
```

- **domain/**: lógica pura del problema (¿qué es un objeto de memoria?, ¿qué es Mark & Sweep?). No conoce React.
- **application/**: orquesta el dominio para satisfacer interacciones del usuario. Aquí vive el *store* y los *casos de uso*.
- **presentation/**: React + React Flow. Lee del *store*, llama a casos de uso, transforma datos del dominio a tipos visuales.
- **infrastructure/**: implementaciones concretas de los puertos del dominio (ej. JSON).

El flujo típico: **usuario → componente React → caso de uso → store → re-render** (porque el componente está suscrito a una porción del store).

---

## 2. Capa 0 — Bootstrapping

### 2.1 `src/main.tsx`

**Propósito**: punto de entrada del bundle. Monta React en el DOM e instala un *bridge* para tests E2E.

```ts
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>,
);
```

**Análisis**:

- `createRoot(...)`: API de React 18+ que crea la raíz concurrente. Recibe el nodo DOM donde se montará el árbol React.
- `<StrictMode>`: componente envoltorio de React que **no produce DOM**. Activa comprobaciones extra en desarrollo: doble invocación de funciones puras, detección de efectos no idempotentes, etc. Es una herramienta de detección de bugs en tiempo de desarrollo, transparente en producción.
- `<Toaster />`: contenedor donde `react-hot-toast` renderiza las notificaciones flotantes. Se coloca aquí porque debe estar fuera del árbol que pueda re-renderizarse (queremos que las notificaciones sobrevivan).

**Bridge para tests**:

```ts
const w = window as unknown as {
  __store: typeof useSimulationStore;
  __useCases: { createReference: typeof createReference };
};
w.__store = useSimulationStore;
w.__useCases = { createReference };
```

Aquí se expone el *store* y un caso de uso al objeto global `window`. Sirve para que Cypress (en `npm run preview`) pueda manipular el estado sin pasar por la UI. Es un compromiso pragmático: en una app cliente al 100%, el usuario podría conseguir lo mismo desde DevTools, así que no representa una nueva superficie de seguridad.

### 2.2 `src/App.tsx`

```tsx
function App() {
  return <AppLayout />;
}
```

Es un componente trivial: solo delega al *layout*. Su existencia separada permite que el bootstrap (`main.tsx`) sea agnóstico al árbol concreto, y mantiene la convención de que `App` es el único hijo de `<StrictMode>`.

> **Concepto teórico — Componentes funcionales**: en React moderno, un componente es **una función que devuelve JSX**. JSX es azúcar sintáctico para `React.createElement(...)`. Un componente funcional puro se vuelve a invocar cada vez que su entrada cambia; React compara el resultado con el render anterior y solo aplica al DOM las diferencias (*diffing*).

---

## 3. Capa 1 — Layout principal

### `src/presentation/components/layout/AppLayout.tsx`

**Propósito**: define la rejilla CSS y coloca los cinco componentes de pantalla.

```tsx
<div
  className="h-screen w-screen grid bg-gray-50"
  style={{
    gridTemplateRows: "50px 1fr auto",
    gridTemplateColumns: "260px 1fr 280px",
  }}
>
  <TopBar />
  <aside><LeftEditorPanel /></aside>
  <main><GraphCanvas /></main>
  <aside><RightInfoPanel /></aside>
  <footer className="col-span-3">
    <SimulationControls />
    <ExecutionLog />
  </footer>
</div>
```

**Análisis**:

- **Grid CSS**: tres filas (barra de 50 px, contenido elástico, footer auto) y tres columnas (260 px, elástica, 280 px).
- El `<TopBar />` ocupa toda la primera fila gracias a `col-span-3` interno; igual el `<footer>`.
- `<main>` (centro) es donde React Flow renderiza el grafo.
- Tailwind se utiliza para clases utilitarias (`h-screen`, `bg-white`, `border-r`...). Cada clase corresponde a una regla CSS atómica.

> **Por qué un componente por sección**: separación de responsabilidades. Cada panel se puede testear y rediseñar sin tocar los demás. Además, cada panel se suscribe **independientemente** a su porción del estado (ver §5), de modo que un cambio en el grafo no fuerza a re-renderizar la `TopBar`, por ejemplo.

---

## 4. Capa 2 — Componentes de presentación

> **Patrón común**: cada componente lee el estado mediante `useSimulationStore((s) => s.algo)` y reacciona a eventos invocando *casos de uso* de la capa de aplicación. Nunca mutan el estado directamente; siempre lo hacen a través de `setState` del *store* o del caso de uso correspondiente.

### 4.1 `TopBar`

**Ubicación**: `src/presentation/components/layout/TopBar.tsx`
**Propósito**: barra superior con el título, selector de escenarios predefinidos, importar/exportar JSON y limpiar el escenario.

#### `useRef` para acceso imperativo al input de archivo

```ts
const fileInputRef = useRef<HTMLInputElement>(null);
const openFilePicker = () => fileInputRef.current?.click();
```

- `useRef(null)`: hook que crea un *contenedor mutable* persistente entre renders. A diferencia de `useState`, **modificar `ref.current` no provoca un re-render**.
- Se usa porque queremos disparar el diálogo de archivo (`<input type="file">`) desde un `<button>` estilizado. El `<input>` real está oculto (`className="hidden"`); el botón llama a `.click()` programáticamente sobre él.

#### `handleFileChange` — manejo asíncrono de archivos

```ts
const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result;
    if (typeof result !== "string") return;
    const outcome = importScenario(result);
    if (outcome.imported) notify.info(TOAST_TEXT.scenarioImported);
    else if (outcome.error) notify.error(outcome.error.message);
  };
  reader.readAsText(file);
  e.target.value = "";
};
```

**Análisis paso a paso**:

1. `e.target.files?.[0]`: encadenamiento opcional; si no hay archivo, salimos.
2. `FileReader` es una API nativa del navegador para leer archivos asíncronamente.
3. **Aquí aparece el primer ejemplo importante de paso de función como argumento**: a `reader.onload` se le **asigna una función**. Esa función se invocará cuando el navegador termine de leer el fichero. Es un *callback* puro: no se ejecuta ahora, se guarda y se llama luego.
   > **Concepto teórico — Callback asíncrono**: cuando una operación toma tiempo (red, disco), no podemos bloquear el hilo. En su lugar, registramos una función para que el sistema la llame al terminar. El motor JavaScript es *single-threaded* + *event loop*: la lectura ocurre fuera del hilo, y al terminar se encola el callback para ejecutarse cuando el hilo esté libre.
4. `reader.readAsText(file)`: dispara la lectura. La función `onload` se ejecutará después.
5. `e.target.value = ""`: trick para que volver a seleccionar el mismo fichero re-dispare `change`.

#### `handleExport` — descarga programática

```ts
const handleExport = () => {
  const json = exportScenario();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "escenario.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
```

Patrón estándar para forzar una descarga sin servidor: se crea un *Blob*, se obtiene una URL de tipo `blob:`, se crea un `<a>` invisible con atributo `download`, se simula el clic y se limpia. `URL.revokeObjectURL` libera memoria.

#### `handleScenarioChange` — adaptador en presentación

```ts
const parsed = scenarioParser.parse(entry.data);
if (isValidationError(parsed)) notify.error(parsed.message);
else loadPredefinedScenario(parsed);
```

Aquí la presentación **invoca directamente** un adaptador de infraestructura (`scenarioParser`) y un type-guard del puerto (`isValidationError`). Es una excepción justificada: los escenarios predefinidos vienen como JSON estático importado en *build-time* (`import cadenaLineal from "..."`). El parser garantiza que se aplican las mismas validaciones que en una importación de usuario.

> **Concepto teórico — Type guard**: `isValidationError(value): value is ValidationError` es un *type predicate*. TypeScript estrecha el tipo de `value` a `ValidationError` dentro del bloque `if`. No es una comprobación cualquiera: el `: value is X` informa al compilador.

---

### 4.2 `LeftEditorPanel`

**Ubicación**: `src/presentation/components/layout/LeftEditorPanel.tsx`
**Propósito**: panel izquierdo con botones de edición (crear objeto, crear referencia, eliminar, marcar raíz) y la lista de objetos creados.

#### Suscripciones granulares al *store*

```ts
const objects = useSimulationStore((s) => s.graph.objects);
const phase = useSimulationStore((s) => s.simulationState.phase);
const selectedElementId = useSimulationStore(
  (s) => s.simulationState.selectedElementId,
);
const setSelectedElement = useSimulationStore((s) => s.setSelectedElement);
```

> **Concepto clave — Selectores como funciones argumento**:
> `useSimulationStore` (de Zustand) recibe **una función** que extrae la porción del estado que el componente necesita. Zustand internamente:
> 1. Llama al selector para obtener el valor inicial.
> 2. Suscribe al componente a futuros cambios.
> 3. Cuando el estado cambia, vuelve a llamar al selector y compara con el valor anterior usando igualdad referencial.
> 4. Solo si el resultado **cambia**, fuerza un re-render del componente.
>
> ¿Por qué se pasa una función en lugar de leer el objeto entero? Porque es la única forma de que la librería sepa **qué porción** del estado importa al componente. Si suscribiéramos al objeto entero, cualquier cambio en cualquier parte (incluso un campo no relevante) provocaría un re-render. El selector convierte la suscripción en *fine-grained*.

`setSelectedElement` es una *acción* del store; al estar definida como propiedad estable del estado, su referencia no cambia entre renders, así que el selector siempre devuelve la misma función y no provoca re-renders.

#### Handlers — orquestación elemental

```ts
const handleCreateObject = () => {
  const obj = createObject();
  setSelectedElement(obj.id);
};
```

Patrón típico: el *handler* invoca un caso de uso (`createObject`) y luego ajusta estado de UI (selección). Toda la lógica de validación y mutación del grafo está en el caso de uso; el componente solo coordina la respuesta UX.

```ts
const handleDeleteSelected = () => {
  if (!selectedElementId) {
    notify.error(TOAST_TEXT.deleteWithoutSelection);
    return;
  }
  const isObject = objects.some((o) => o.id === selectedElementId);
  if (isObject) {
    const result = deleteObject(selectedElementId);
    if (result.deleted && result.deletedReferences > 0)
      notify.info(TOAST_TEXT.objectDeletedWithRefs(result.deletedReferences));
  } else if (references.some((r) => r.id === selectedElementId)) {
    deleteReference(selectedElementId);
  }
  setSelectedElement(null);
};
```

- `objects.some(o => o.id === selectedElementId)`: `Array.prototype.some` recibe un **predicado** (función que devuelve booleano). Recorre el array y devuelve `true` en cuanto alguno cumple. Es otro ejemplo de función pasada como argumento: el método no sabe *qué* condición evaluar; quien lo invoca le pasa esa lógica.
- El componente decide **qué** caso de uso llamar (`deleteObject` vs `deleteReference`) según la naturaleza del elemento seleccionado, porque el `selectedElementId` es genérico.

#### Renderizado de la lista de objetos

```tsx
{objects.map((obj) => {
  const isSelected = selectedElementId === obj.id;
  return (
    <li key={obj.id} onClick={() => setSelectedElement(obj.id)}>
      <span>{obj.label}</span>
      {obj.isRoot && <span>Raíz</span>}
    </li>
  );
})}
```

- `Array.prototype.map(fn)`: aplica `fn` a cada elemento y devuelve un nuevo array. La función argumento decide la transformación; aquí, transforma cada `MemoryObject` en un `<li>` JSX.
- `key={obj.id}`: clave estable que React usa para reconciliar elementos entre renders. Sin ella, React tendría que re-crear todos los nodos hijos en cada render.
- `onClick={() => setSelectedElement(obj.id)}`: se crea una nueva función *flecha* en cada render que captura `obj.id` por **closure**. Cuando el usuario hace clic, se invoca con ese `id` capturado.
  > **Concepto teórico — Closure**: una función en JavaScript "recuerda" el ámbito léxico donde se definió. La función flecha de arriba puede acceder a `obj.id` aunque se ejecute mucho después, en otro contexto, porque el motor mantiene viva esa variable mientras la función exista.

---

### 4.3 `GraphCanvas`

**Ubicación**: `src/presentation/components/graph/GraphCanvas.tsx`
**Propósito**: traduce el grafo del dominio (`MemoryGraph`) a estructuras de **React Flow** (`Node[]`, `Edge[]`) y orquesta todas las interacciones del lienzo (drag, click, doble-clic, conexión por arrastre, conexión por botón).

Este es el componente más rico del proyecto. Vamos por partes.

#### 4.3.1 Configuración estática

```ts
const nodeTypes = { object: ObjectNode };
const edgeTypes = { reference: ReferenceEdge };
const defaultEdgeOptions = {
  type: "reference",
  markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af" },
};
```

Estos objetos se definen **fuera del componente**. ¿Por qué? Porque React Flow compara los `nodeTypes`/`edgeTypes` por igualdad referencial; si los redefinieras dentro del componente, en cada render serían objetos nuevos y React Flow lo interpretaría como un cambio de configuración (warning + re-init innecesario). Llevarlos al ámbito del módulo garantiza que las referencias sean estables.

#### 4.3.2 `snapshot` — fusión de grafo + estado de simulación

```ts
const snapshot = useMemo(() => {
  if (steps.length === 0) return graph;
  return applyStepsToGraph(graph, steps, currentStep);
}, [graph, steps, currentStep]);
```

> **Concepto teórico — `useMemo`**:
> `useMemo(fn, deps)` ejecuta `fn` y memoriza su resultado. En renders posteriores, si las `deps` no cambian (igualdad referencial), devuelve el resultado memorizado sin volver a ejecutar `fn`. Sirve para evitar cálculos costosos cuando las entradas no han cambiado.
>
> ¿Por qué se pasa una función `fn` en lugar del valor directamente? Porque queremos **diferir** el cálculo: solo se ejecuta si las dependencias cambiaron. Pasar el valor calculado provocaría su evaluación en cada render.

`applyStepsToGraph` es la función pura del dominio que reconstruye el grafo "tal como se vería" en el paso `currentStep` (ver §7.2). El resultado es un `MemoryGraph` con flags de visualización (`marked`, `alive`, `traversed`) actualizados.

#### 4.3.3 Estado local de nodos: lo más sutil del componente

```ts
const [localNodes, setLocalNodes] = useState<ObjectNodeType[]>([]);
```

¿Por qué no derivar los nodos directamente del *store* en cada render? Porque **React Flow necesita mutar las posiciones durante el drag**. Si los nodos vinieran derivados del store, cada `mousemove` requeriría enviar al store y recalcular toda la lista, perdiendo fluidez.

La estrategia es híbrida:

1. Cuando cambia el **conjunto de ids** (se añade/elimina objeto), se reconstruye `localNodes`:

```ts
const objectIdsKey = snapshot.objects.map((o) => o.id).join(",");
useEffect(() => {
  setLocalNodes(snapshot.objects.map((obj) => ({
    id: obj.id,
    type: "object",
    position: obj.position,
    data: { /* flags visuales */ },
  })));
}, [objectIdsKey]);
```

`objectIdsKey` es una *clave-string* que cambia solo cuando el conjunto de ids cambia. Es el truco para que `useEffect` no se dispare por reordenamientos o cambios de campos internos.

2. Cuando cambian los flags de simulación (`marked`, `alive`...), se **parchean** los nodos existentes sin reconstruirlos, preservando la posición que el drag de React Flow pueda haber dejado:

```ts
useEffect(() => {
  setLocalNodes((nds) => nds.map((n) => {
    const obj = snapshot.objects.find((o) => o.id === n.id);
    if (!obj) return n;
    return { ...n, selected: ..., data: { ... } };
  }));
}, [snapshot, selectedElementId, currentObjectId, phase]);
```

> **Concepto teórico — `useEffect(fn, deps)`**:
> Ejecuta `fn` *después* de que React aplique los cambios al DOM, si alguna `dep` cambió respecto al render anterior. Permite sincronizar el componente con sistemas externos (DOM, suscripciones, timers, fetches).
>
> Si la función `fn` devuelve otra función, esa función de retorno es el **cleanup**: se ejecuta antes del próximo efecto y al desmontar el componente.

> **Concepto teórico — Updater functional en `setState`**:
> `setLocalNodes((nds) => nds.map(...))` recibe una función. React invoca esta función con el valor *más reciente* del estado. Esto evita el bug clásico de leer `localNodes` en una closure que podría tener un valor obsoleto.

#### 4.3.4 Handlers — `useCallback` y captura de dependencias

```ts
const onNodesChange = useCallback((changes) => {
  setLocalNodes((nds) => applyNodeChanges(changes, nds));
}, []);
```

> **Concepto teórico — `useCallback(fn, deps)`**:
> Devuelve una **referencia estable** a `fn` mientras las `deps` no cambien. Sirve para que componentes hijos memoizados no se re-rendericen por la simple razón de que el padre re-creó la función en cada render.
>
> Aquí, `onNodesChange` se pasa al componente `<ReactFlow>` (de la librería), y queremos evitar que React Flow piense que el handler cambió.

```ts
const onConnect: OnConnect = useCallback(({ source, target }) => {
  if (!source || !target) return;
  const result = createReference(source, target);
  if (!result.created) {
    if (result.reason === "duplicate") notify.error(TOAST_TEXT.duplicateReference);
    else if (result.reason === "simulation-active")
      notify.error(TOAST_TEXT.createReferenceDuringSimulation);
  }
}, []);
```

Cuando el usuario arrastra desde un nodo y suelta sobre otro, React Flow llama a `onConnect(connection)`. Aquí desestructuramos `source`/`target`, llamamos al caso de uso `createReference` y traducimos los códigos de error a mensajes toast.

```ts
const onNodeClick = useCallback((_event, node) => {
  if (connectionMode.active) {
    if (!connectionMode.sourceId) {
      selectConnectionSource(node.id);
      return;
    }
    const result = createReference(connectionMode.sourceId, node.id);
    /* ...notificación de errores... */
    cancelConnectionMode();
    return;
  }
  setSelectedElement(node.id);
}, [connectionMode, selectConnectionSource, cancelConnectionMode, setSelectedElement]);
```

Lógica de doble propósito: si el "modo conexión" (botón "Crear referencia") está activo, el clic se interpreta como selección de origen/destino. Si no, es una selección normal.

#### 4.3.5 Atajos de teclado con `useEffect` + cleanup

```ts
useEffect(() => {
  const handler = (e) => {
    if (e.key !== "Escape") return;
    if (connectionMode.active) cancelConnectionMode();
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, [connectionMode.active, cancelConnectionMode]);
```

- Se registra un listener global en `window` (porque queremos capturar Escape sea cual sea el foco).
- La función devuelta por el efecto es la **función de limpieza**: se ejecuta cuando el efecto se vuelve a aplicar (porque cambiaron las deps) o al desmontar el componente. Sin esta limpieza, cada cambio de deps añadiría un listener nuevo sin retirar el anterior — fuga de memoria.

El efecto de Delete/Backspace sigue el mismo patrón, con la diferencia de que excluye `<input>`/`<textarea>` para que el usuario pueda usar la tecla normalmente al editar.

#### 4.3.6 El render

```tsx
<ReactFlow
  nodes={localNodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onConnect={onConnect}
  onNodeDragStop={onNodeDragStop}
  onNodeClick={onNodeClick}
  onEdgeClick={onEdgeClick}
  onPaneClick={onPaneClick}
  onNodeDoubleClick={onNodeDoubleClick}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  connectionMode={ConnectionMode.Loose}
  defaultEdgeOptions={defaultEdgeOptions}
  nodesDraggable={!isInteractionLocked}
  nodesConnectable={!isInteractionLocked}
  elementsSelectable
  fitView
>
  <Background />
  <Controls />
</ReactFlow>
```

- `connectionMode={ConnectionMode.Loose}`: permite iniciar conexiones desde cualquier punto del nodo, no solo desde *handles* fijos. Esto satisface RI-07.
- `nodesDraggable`/`nodesConnectable` se desactivan durante simulación (`phase !== "idle"`), bloqueando edición.
- `<Background />` y `<Controls />` son componentes auxiliares que React Flow renderiza encima del lienzo (rejilla y controles de zoom).

---

### 4.4 `ObjectNode`

**Ubicación**: `src/presentation/components/graph/ObjectNode.tsx`
**Propósito**: componente personalizado que React Flow utiliza para pintar cada nodo. Recibe los datos del nodo y devuelve JSX.

#### Resolución del estado visual

```ts
const resolveStateName = (data: ObjectNodeData): NodeStateName => {
  if (data.isProcessing) return "processing";
  if (!data.alive) return "collected";
  if (data.isRoot) return "root";
  if (data.marked) return "reachable";
  if (!data.marked && data.phaseDone) return "unreachable";
  return "normal";
};
```

Función pura que transforma flags booleanos en un identificador de estado. La cascada de `if` representa la **prioridad**: si el objeto está siendo procesado ahora mismo, eso prevalece sobre cualquier otro estado.

#### Edición inline con `useState` + `useRef`

```ts
const [draftLabel, setDraftLabel] = useState(data.label);
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (isEditing) {
    setDraftLabel(data.label);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }
}, [isEditing, data.label]);
```

- `draftLabel` es el estado *temporal* del input: el usuario edita aquí sin tocar el dominio hasta que confirma.
- Cuando entra en modo edición, sincronizamos el draft con el valor actual y enfocamos/seleccionamos el input.
- `requestAnimationFrame` difiere el `focus`/`select` al siguiente frame, garantizando que el input ya esté en el DOM.

#### Confirmación / cancelación

```ts
const commitEdit = () => {
  const next = draftLabel.trim();
  if (next.length > 0 && next !== data.label) editObject(id, { label: next });
  setEditingNode(null);
};
```

`editObject` es el caso de uso que actualiza el grafo. La validación (no vacío, distinto del actual) ocurre en presentación porque es ergonomía pura, no regla de dominio.

#### Handle invisible que cubre todo el nodo

```tsx
<Handle
  type="source"
  position={Position.Bottom}
  style={{ width: "100%", height: "100%", top: 0, left: 0,
           transform: "none", background: "transparent",
           border: 0, borderRadius: 0, opacity: 0, pointerEvents: "all" }}
/>
```

`<Handle>` es el componente que React Flow usa para iniciar conexiones. Aquí se estira para cubrir todo el nodo (con `opacity: 0`), de forma que el usuario pueda arrastrar desde cualquier punto del rectángulo, no solo desde un círculo en el borde. Es la implementación visual del `ConnectionMode.Loose`.

---

### 4.5 `ReferenceEdge`

**Ubicación**: `src/presentation/components/graph/ReferenceEdge.tsx`
**Propósito**: componente personalizado para pintar las aristas (referencias).

```ts
const [path] = getBezierPath({
  sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
});
```

`getBezierPath` (utilidad de React Flow) calcula la curva de Bézier entre dos puntos y devuelve `[path, labelX, labelY, ...]`. Tomamos solo el `path` (cadena SVG `d="..."`).

```ts
let stroke: string = EDGE_COLORS.normal;
let strokeWidth: number = EDGE_STROKE_WIDTH.normal;
if (selected) { stroke = EDGE_COLORS.selected; strokeWidth = EDGE_STROKE_WIDTH.selected; }
else if (traversed) { stroke = EDGE_COLORS.traversed; strokeWidth = EDGE_STROKE_WIDTH.traversed; }
```

Selección > recorrida > normal. Mismo patrón de prioridades que en `ObjectNode`.

```tsx
<BaseEdge id={id} path={path} style={{ stroke, strokeWidth }} markerEnd={markerEnd} />
```

`BaseEdge` envuelve el `<path>` SVG con la flecha (`markerEnd`).

---

### 4.6 `RightInfoPanel`

**Ubicación**: `src/presentation/components/layout/RightInfoPanel.tsx`
**Propósito**: muestra fase actual, elemento seleccionado o en proceso, y la explicación textual del paso actual.

#### Tres `useMemo` para tres derivados

```ts
const phaseLabel = useMemo(() => {
  if (steps.length === 0) return PHASE_LABELS.idle;
  const stepPhase = steps[currentStep]?.phase ?? phase;
  return PHASE_LABELS[stepPhase];
}, [steps, currentStep, phase]);
```

La fase visible es la del paso actual (no `phase` global), porque al retroceder con "Paso anterior", el usuario vuelve a fases pasadas (de `done` a `mark`). El `phase` global vale `done` durante toda la navegación, pero queremos que la UI muestre la fase del paso visible.

```ts
const selectedItemLabel = useMemo(() => {
  if (currentObjectId) { /* ...buscar objeto... */ }
  if (selectedElementId) { /* objeto o referencia */ }
  return "—";
}, [currentObjectId, selectedElementId, graph]);
```

Prioridad: si hay objeto en proceso, lo mostramos; si no, lo seleccionado por el usuario; si no, "—". Para una referencia, formateamos `"src → tgt"` resolviendo los labels desde el grafo.

```ts
const explanation = useMemo(() => {
  if (steps.length === 0) return "Pulsa Ejecutar o Paso siguiente para iniciar la simulación.";
  return steps[currentStep]?.log ?? "";
}, [steps, currentStep]);
```

El log lo produce el algoritmo (§7.2) en cada paso; la presentación solo lo expone.

---

### 4.7 `SimulationControls`

**Ubicación**: `src/presentation/components/simulation/SimulationControls.tsx`
**Propósito**: botones Ejecutar/Pausar/Paso anterior/Paso siguiente/Reiniciar y slider de velocidad.

#### Velocidad → delay

```ts
const computeDelay = (speed: number) => Math.round(1000 / speed);
```

Slider de 1 a 10. A `speed = 1` el delay es 1000 ms (un paso por segundo). A `speed = 10`, 100 ms. Inverso, no lineal.

#### `useRef` para el handle del intervalo

```ts
const intervalRef = useRef<number | null>(null);
```

Almacena el ID devuelto por `setInterval`, sin provocar re-renders. Necesitamos persistirlo entre renders para poder cancelar el intervalo después.

#### `startAuto` — el corazón de la ejecución automática

```ts
const startAuto = useCallback(() => {
  if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
  intervalRef.current = window.setInterval(() => {
    const state = useSimulationStore.getState().simulationState;
    if (state.steps.length > 0 && state.currentStep >= state.steps.length - 1) {
      window.clearInterval(intervalRef.current!);
      intervalRef.current = null;
      setRunning(false);
      return;
    }
    stepSimulation("forward");
  }, computeDelay(speed));
  setRunning(true);
}, [speed]);
```

**Por qué se pasa una función a `setInterval`**: `setInterval(fn, ms)` registra `fn` para ser llamada cada `ms`. La función se ejecuta en el contexto del *event loop*; cada invocación es un *tick* independiente.

**Por qué dentro del callback se usa `useSimulationStore.getState()` y no el valor del componente**: la función creada al iniciar el intervalo es una *closure* del momento en que se llamó a `startAuto`. Si leyera `steps` o `currentStep` directamente, capturaría sus valores de ese instante y nunca vería los actualizados. `useSimulationStore.getState()` lee el estado **en vivo** desde Zustand, esquivando la trampa de closure.

**Por qué se cancela y re-crea cuando cambia `speed`**: `setInterval(fn, ms)` no admite cambiar `ms` después; hay que cancelar y crear uno nuevo. El segundo `useEffect` del componente hace exactamente eso.

#### Limpieza al desmontar

```ts
useEffect(() => {
  return () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
}, []);
```

Patrón clásico: el efecto vacío con cleanup que se ejecuta al desmontar. Sin esto, si el componente desaparece mientras el intervalo está activo, seguiría disparando `stepSimulation` para siempre.

#### Diálogo de confirmación sin raíces

```ts
const handlePlay = useCallback(() => {
  if (running) return;
  if (isDone) resetSimulation();
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
```

Si no hay raíces y sí hay objetos, mostramos un modal de confirmación (`confirmingNoRoots`). La opción "Continuar" llama a `handleConfirmNoRoots`, que despacha un primer paso (`stepSimulation("forward")`) — esto **fuerza el cómputo lazy** de los pasos en el caso de uso `stepSimulation` (ver §6) — y arranca el intervalo.

---

### 4.8 `ExecutionLog`

**Ubicación**: `src/presentation/components/simulation/ExecutionLog.tsx`
**Propósito**: tira inferior con histórico de mensajes de la simulación, marcados con hora.

```ts
const lastSeenRef = useRef(-1);

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
```

**Lógica fina**: solo añadir entradas cuando el usuario *avanza*. Si retrocede (Paso anterior), no borramos el log; queda como diario inmutable. `lastSeenRef` recuerda hasta dónde hemos volcado en el log.

Si saltamos varios pasos a la vez (p. ej. al pulsar Ejecutar, que va al último paso), el bucle `for` rellena el rango completo de una sola vez.

```ts
useEffect(() => {
  const el = containerRef.current;
  if (el) el.scrollTop = el.scrollHeight;
}, [entries]);
```

Auto-scroll al final cada vez que añadimos entradas. Manipulación directa del DOM porque scroll no es estado de React.

---

### 4.9 `StateLegend` y `stateColors`

**Ubicación**: `src/presentation/components/simulation/StateLegend.tsx` + `src/presentation/styles/stateColors.ts`

`stateColors.ts` centraliza:

- `NODE_STATE_CLASSES`: mapa `estado → clases Tailwind` (background, border, text, extras).
- `EDGE_COLORS`, `EDGE_STROKE_WIDTH`: valores SVG para aristas (no se pueden expresar en clases Tailwind, porque React Flow renderiza SVG inline).

`StateLegend.tsx` consume ese mapa y renderiza una entrada por estado con un *swatch* (cuadrado coloreado) y su etiqueta.

> **Por qué centralizar colores en un módulo**: separa la **decisión de diseño** (qué color para qué estado) de los **consumidores** (`ObjectNode`, `ReferenceEdge`, `StateLegend`). Cambiar un color es una edición en un único sitio.

---

### 4.10 `notifications`

**Ubicación**: `src/presentation/notifications/notifications.ts`

```ts
export const TOAST_TEXT = {
  duplicateReference: "Esta referencia ya existe entre estos dos objetos",
  // ...
  objectDeletedWithRefs: (n: number) =>
    `Objeto eliminado. También se eliminaron ${n} referencias asociadas.`,
} as const;

export const notify = {
  info(message) { toast(message, { /* style: azul */ }); },
  error(message) { toast.error(message, { /* style: rojo */ }); },
};
```

- `TOAST_TEXT` aglutina todas las cadenas de notificación. El motivo es que **Cypress E2E** las verifica literalmente: tener un único origen de verdad evita desincronizaciones tests-código.
- `objectDeletedWithRefs` es **una función dentro del literal**: cuando el mensaje depende de un valor (número de referencias eliminadas), se expone como factoría. El componente la invoca con el número y obtiene el mensaje formateado.

---

## 5. Capa 3 — Estado global

### `src/application/simulationStore.ts`

GC Visualizer usa **Zustand**, una librería minimalista de estado global. Un *store* es básicamente un objeto reactivo: contiene **estado** + **acciones** que lo modifican.

#### Definición

```ts
export const useSimulationStore = create<SimulationStore>((set) => ({
  graph: createEmptyGraph(),
  simulationState: createInitialSimulationState(),
  connectionMode: initialConnectionMode,
  editingNodeId: null,

  setGraph: (graph) => set({ graph }),
  updateSimulationState: (patch) =>
    set((s) => ({ simulationState: { ...s.simulationState, ...patch } })),
  /* ...más acciones... */
}));
```

> **Concepto teórico — `create((set) => initialState)`**:
> Zustand recibe **una función creadora** que toma `set` (mutador) y devuelve el estado inicial junto con las acciones. El motivo de pasar una función en lugar de un objeto literal es que las acciones necesitan **acceso al `set`** que la propia librería les provee. Es una forma de inyección de dependencias minimalista.

`set(...)` admite dos formas:

- `set({ campo: valor })` — *merge* superficial.
- `set((state) => ({ campo: nuevoValor(state) }))` — *updater* funcional, útil cuando el nuevo valor depende del actual.

#### Por qué un único store

- **Único origen de verdad**: cualquier componente puede suscribirse a la porción que le interesa.
- **Inmutabilidad**: cada acción produce un nuevo objeto raíz; los componentes detectan cambios por comparación de referencias.
- **No hay React aquí**: el store es una variable de módulo. Funciona en tests sin DOM. Un componente *opta* a suscribirse llamando a `useSimulationStore(...)` (que es un hook). Pero los casos de uso (capa de aplicación) leen y escriben mediante `useSimulationStore.getState()` y `.setState()`, sin React.

#### Distinción importante

```ts
// Dentro de un componente:
const phase = useSimulationStore((s) => s.simulationState.phase);
// → suscripción reactiva: el componente re-renderiza si phase cambia.

// Fuera de React (caso de uso):
const { graph } = useSimulationStore.getState();
// → lectura puntual, no reactiva.

// Fuera de React (caso de uso):
useSimulationStore.setState({ graph: nuevo });
// → escritura imperativa.
```

---

## 6. Capa 4 — Casos de uso

**Ubicación**: `src/application/useCases/`

Cada caso de uso es una **función pura desde el punto de vista de la firma** (recibe argumentos, devuelve un resultado), pero con un único efecto secundario controlado: leer y escribir el *store*. Es la única capa que conoce simultáneamente el *store* y el dominio.

Patrón general:

1. Lee el estado (`getState()`).
2. Aplica reglas de negocio (validaciones, llamadas al dominio).
3. Devuelve un `Result` discriminado (con `created`/`deleted`/...) o información para el llamador.
4. Si procede, escribe el nuevo estado (`setState`).

### 6.1 `createObject`

```ts
export const createObject = (options = {}): MemoryObject => {
  const { graph } = useSimulationStore.getState();
  const id = crypto.randomUUID();
  const label = options.label ?? `Objeto ${graph.objects.length + 1}`;
  const obj = createMemoryObject(id, label, options);
  useSimulationStore.setState({ graph: addObject(graph, obj) });
  return obj;
};
```

- `crypto.randomUUID()`: API nativa del navegador para UUIDs v4. Garantía de unicidad sin colaboradores externos.
- `??` (*nullish coalescing*): toma el valor por defecto solo si el operando es `null`/`undefined` (no si es `""` o `0`). Aquí preserva la cadena vacía si el llamador la pasara intencionadamente.
- `addObject` (función pura del dominio) devuelve un nuevo grafo con el objeto añadido. El caso de uso lo escribe en el store. Inmutabilidad de extremo a extremo.

### 6.2 `createReference`

```ts
export const createReference = (sourceObjectId, targetObjectId): CreateReferenceResult => {
  const { graph, simulationState } = useSimulationStore.getState();
  if (simulationState.phase !== "idle") return { created: false, reason: "simulation-active" };
  if (!getObject(graph, sourceObjectId) || !getObject(graph, targetObjectId))
    return { created: false, reason: "missing-endpoint" };
  if (hasReferenceBetween(graph, sourceObjectId, targetObjectId))
    return { created: false, reason: "duplicate" };

  const id = crypto.randomUUID();
  const ref = createMemoryReference(id, sourceObjectId, targetObjectId);
  useSimulationStore.setState({ graph: addReference(graph, ref) });
  return { created: true, referenceId: id };
};
```

> **Concepto teórico — Result discriminado**:
> En lugar de lanzar excepciones, se devuelve un objeto con un campo discriminador (`created`) y, según el valor, otros campos (`reason`, `referenceId`). Esto obliga al llamador a manejar todos los casos y se compone bien con TypeScript (*discriminated unions*). La presentación traduce `reason` a un `notify.error(...)` específico.

### 6.3 `runSimulation` y `stepSimulation` — los dos modos

`runSimulation` ejecuta el algoritmo completo y salta al final:

```ts
const validation = graphValidator.validate(graph);
if (!validation.isValid) return { ran: false, reason: "invalid-graph", errors: validation.errors };
const hasRoots = graph.objects.some((o) => o.isRoot);
if (!hasRoots && !options.skipRootCheck) return { ran: false, reason: "no-roots" };
const steps = computeMarkAndSweepSteps(graph);
useSimulationStore.setState((s) => ({
  simulationState: { ...s.simulationState, steps, logs: ..., currentStep: steps.length - 1, phase: "done" },
}));
```

`stepSimulation` navega un array **precalculado**:

```ts
if (direction === "forward") {
  if (simulationState.steps.length === 0) {
    const steps = computeMarkAndSweepSteps(graph);
    /* ...inicializar y aterrizar en step 0... */
    return;
  }
  const next = Math.min(simulationState.currentStep + 1, simulationState.steps.length - 1);
  /* ...avanzar... */
}
```

Diseño clave: **el algoritmo se ejecuta una sola vez**, al primer paso. Después, navegar adelante/atrás solo mueve el índice. Esto:

- garantiza determinismo (los pasos no se recalculan),
- hace el retroceso trivialmente posible (basta reducir el índice),
- asegura buen rendimiento incluso con grafos grandes.

### 6.4 `resetSimulation`

```ts
useSimulationStore.setState((s) => ({
  simulationState: createInitialSimulationState(),
  graph: {
    objects: s.graph.objects.map((o) => ({ ...o, marked: false, alive: true, visitedOrder: null })),
    references: s.graph.references.map((r) => ({ ...r, traversed: false })),
  },
}));
```

Vuelve la simulación a `idle` y limpia los flags residuales del grafo. La estructura (objetos, referencias, raíces) se conserva: el usuario puede ejecutar de nuevo sin reconstruir el escenario.

### 6.5 `clearScenario` vs `loadPredefinedScenario`

- `clearScenario`: deja el grafo vacío y la simulación en cero. Usado por el botón "Limpiar escenario".
- `loadPredefinedScenario(graph)`: reemplaza el grafo por uno externo (ya parseado). Resetea la simulación. Usado al elegir un escenario del selector.

### 6.6 `importScenario` y `exportScenario` — uso de los puertos

```ts
export const importScenario = (raw: string | unknown): ImportScenarioResult => {
  const parsed = scenarioParser.parse(raw);
  if (isValidationError(parsed)) return { imported: false, error: parsed };
  useSimulationStore.setState({ graph: parsed, simulationState: createInitialSimulationState() });
  return { imported: true };
};

export const exportScenario = (): string => {
  const { graph } = useSimulationStore.getState();
  return scenarioSerializer.serialize(graph);
};
```

`scenarioParser` y `scenarioSerializer` son **adaptadores de infraestructura** que implementan los **puertos** del dominio. La capa de aplicación los consume a través de la interfaz, sin conocer detalles del JSON. Este desacoplamiento es la esencia del patrón puertos/adaptadores.

---

## 7. Capa 5 — Dominio

### 7.1 Modelos

#### `MemoryObject`

```ts
export interface MemoryObject {
  id: string;
  label: string;
  isRoot: boolean;
  marked: boolean;
  alive: boolean;
  visitedOrder: number | null;
  position: Position;
}

export const createMemoryObject = (id, label, options = {}): MemoryObject => ({
  id, label,
  isRoot: options.isRoot ?? false,
  marked: false, alive: true, visitedOrder: null,
  position: options.position ?? { x: 0, y: 0 },
});
```

Patrón **smart constructor**: una función exportada que crea el objeto con valores por defecto seguros. Evita que los llamadores construyan instancias inválidas.

#### `MemoryReference`

Similar: `id`, `sourceObjectId`, `targetObjectId`, `traversed: false` por defecto.

#### `MemoryGraph` — la API funcional del grafo

```ts
export interface MemoryGraph {
  objects: MemoryObject[];
  references: MemoryReference[];
}
```

Y **funciones puras** que operan sobre él:

```ts
export const addObject = (graph, object): MemoryGraph => ({
  ...graph,
  objects: [...graph.objects, object],
});

export const removeObject = (graph, id): MemoryGraph => ({
  ...graph,
  objects: graph.objects.filter((o) => o.id !== id),
  references: graph.references.filter(
    (r) => r.sourceObjectId !== id && r.targetObjectId !== id,
  ),
});

export const updateObject = (graph, id, patch): MemoryGraph => ({
  ...graph,
  objects: graph.objects.map((o) => o.id === id ? { ...o, ...patch } : o),
});
```

> **Concepto teórico — Inmutabilidad estructural**:
> Estas funciones nunca modifican el grafo de entrada: devuelven un nuevo grafo. Esto:
> 1. Permite a Zustand detectar cambios por igualdad referencial.
> 2. Hace los componentes React reactivos sin esfuerzo (si la referencia cambió, hay nuevo render).
> 3. Facilita el testeo: la misma entrada siempre produce la misma salida; no hay efectos colaterales que aislar.
> 4. Habilita histórico/undo trivial (basta guardar referencias antiguas).
>
> Los operadores `...spread` y métodos `.map`/`.filter` (que devuelven arrays nuevos) son los pilares: cada nivel del árbol que cambia se clona; los niveles que no cambian se referencian directamente (*structural sharing*).

`removeObject` también **purga las referencias huérfanas** automáticamente, manteniendo la consistencia: nunca hay una referencia apuntando a un objeto inexistente.

`addReference` rechaza duplicados:

```ts
const isDuplicate = graph.references.some(
  (r) => r.sourceObjectId === reference.sourceObjectId &&
         r.targetObjectId === reference.targetObjectId,
);
if (isDuplicate) return graph;
```

Doble defensa: el caso de uso `createReference` ya valida; pero si alguien usa `addReference` directamente, el dominio se mantiene consistente.

#### `SimulationStep` y `SimulationState`

`SimulationStep` captura el grafo **lógicamente** en un momento de la simulación (qué está marcado, qué se ha recorrido, qué fase, qué objeto se está procesando). `SimulationState` agrega el array completo de pasos y el cursor `currentStep`. El paso visible se obtiene como `steps[currentStep]`.

---

### 7.2 Algoritmo Mark & Sweep

**Ubicación**: `src/domain/algorithms/markAndSweep.ts`. Es el **núcleo computacional** del proyecto. Dos funciones puras: `computeMarkAndSweepSteps` y `applyStepsToGraph`.

#### `computeMarkAndSweepSteps(graph)`

Devuelve `SimulationStep[]`: cada paso es una *foto* lógica de qué hace el algoritmo en ese instante.

Estructura:

1. **Pre-cómputo**: índices auxiliares.

```ts
const objectsById = new Map(graph.objects.map((o) => [o.id, o]));
const outgoingByObjectId = new Map<string, MemoryReference[]>();
for (const ref of graph.references) {
  const list = outgoingByObjectId.get(ref.sourceObjectId);
  if (list) list.push(ref);
  else outgoingByObjectId.set(ref.sourceObjectId, [ref]);
}
```

`outgoingByObjectId` agrupa referencias por nodo origen. Permite encontrar las salidas de un nodo en O(1) en lugar de O(|E|) por nodo. Para |V| nodos esto baja la complejidad total de Mark de O(V·E) a O(V+E).

2. **Paso de inicio**:

```ts
if (roots.length === 0) {
  steps.push({ /* "No hay raíces..." */ });
} else {
  steps.push({ /* "Inicio de fase Mark. Raíces detectadas: ..." */ });
}
```

3. **DFS recursivo**:

```ts
const visit = (objectId: string): void => {
  if (visited.has(objectId)) return;
  visited.add(objectId);
  markedIds.push(objectId);

  const obj = objectsById.get(objectId);
  steps.push({
    stepIndex: stepIndex++,
    phase: "mark",
    currentObjectId: objectId,
    markedIds: [...markedIds],
    traversedReferenceIds: [...traversedReferenceIds],
    log: `Visitando y marcando '${obj.label}'.`,
  });

  const outgoing = outgoingByObjectId.get(objectId) ?? [];
  for (const ref of outgoing) {
    traversedReferenceIds.push(ref.id);
    visit(ref.targetObjectId);
  }
};
for (const root of roots) visit(root.id);
```

> **Concepto teórico — DFS recursivo y closures**:
> `visit` es una función definida **dentro** de `computeMarkAndSweepSteps`. Por closure tiene acceso a `visited`, `markedIds`, `traversedReferenceIds`, `steps`, `stepIndex`, `objectsById`, `outgoingByObjectId`. No necesita recibirlos como parámetros — son su entorno léxico.
>
> Cada llamada a `visit(id)`:
> 1. Si ya visitamos, sale (corta ciclos y autorreferencias).
> 2. Marca como visitado y registra en `markedIds`.
> 3. Empuja un *paso* con la **foto** actual (de ahí los `[...markedIds]` y `[...traversedReferenceIds]` — copias defensivas para que pasos futuros no vean mutaciones futuras).
> 4. Recorre las salidas; por cada arista, anota el id como recorrido y llama recursivamente al destino.
>
> El bucle externo `for (const root of roots) visit(root.id)` arranca un DFS desde cada raíz. Los conjuntos `visited`/`markedIds` son **compartidos**, así que la segunda raíz no re-visita lo que la primera ya tocó.

> **Por qué cada `step` necesita una copia (`[...markedIds]`)**:
> Si guardáramos la referencia directa al array, todos los pasos terminarían apuntando al mismo array — el final, con todo marcado. Las copias preservan el estado **histórico**.

4. **Paso Sweep**: lista los objetos no visitados → candidatos a recolección.

```ts
const collectedIds = graph.objects
  .filter((o) => !visited.has(o.id))
  .map((o) => o.id);
steps.push({ stepIndex: ..., phase: "sweep", ... });
```

5. **Paso `done`**: estado final estable. La presentación lee este paso al pulsar Reiniciar y luego Ejecutar (que va al final).

#### `applyStepsToGraph(graph, steps, upToIndex)`

Reconstruye un `MemoryGraph` "tal como se ve" en el paso `upToIndex`:

```ts
const step = steps[Math.min(targetIndex, steps.length - 1)];
const markedSet = new Set(step.markedIds);
const traversedSet = new Set(step.traversedReferenceIds);
const sweepActive = step.phase === "sweep" || step.phase === "done";

return {
  objects: graph.objects.map((obj) => ({
    ...obj,
    marked: markedSet.has(obj.id),
    visitedOrder: step.markedIds.indexOf(obj.id) >= 0 ? step.markedIds.indexOf(obj.id) : null,
    alive: sweepActive ? markedSet.has(obj.id) : true,
  })),
  references: graph.references.map((ref) => ({ ...ref, traversed: traversedSet.has(ref.id) })),
};
```

- Convertir arrays a `Set`s vuelve los `has(...)` O(1) en lugar de O(n).
- `alive = sweepActive ? marked : true`: durante Mark un objeto sigue vivo aunque no esté marcado; **solo se considera recolectado a partir de Sweep**.

Esta función es la que `GraphCanvas` consume desde su `useMemo` para producir el `snapshot`. Es **idempotente y pura**: misma entrada → misma salida.

---

### 7.3 Validador de grafo

**Ubicación**: `src/domain/validators/graphValidator.ts`. Implementa `IGraphValidator.validate(graph): ValidationResult`.

```ts
const objectIds = new Set<string>();
for (const obj of graph.objects) {
  if (objectIds.has(obj.id)) errors.push(`Identificador de objeto duplicado: '${obj.id}'`);
  else objectIds.add(obj.id);
}
const seenPairs = new Set<string>();
for (const ref of graph.references) {
  /* duplicados de id, referencias huérfanas, pares duplicados */
}
return { isValid: errors.length === 0, errors };
```

Acumula errores en lugar de detenerse en el primero, para que el usuario vea todos a la vez. Esto es importante porque la importación de un JSON puede tener varios problemas, y mostrarlos uno a uno frustraría la experiencia.

---

### 7.4 Puertos

**Ubicación**: `src/domain/ports/`.

```ts
// IScenarioParser.ts
export interface IScenarioParser {
  parse(raw: unknown): MemoryGraph | ValidationError;
}
export const isValidationError = (
  value: MemoryGraph | ValidationError,
): value is ValidationError =>
  (value as ValidationError).kind === "validation-error";
```

```ts
// IScenarioSerializer.ts
export interface IScenarioSerializer {
  serialize(graph: MemoryGraph): string;
  deserialize(data: string): MemoryGraph;
}
```

> **Concepto teórico — Inversión de dependencias**:
> El dominio define la **interfaz** (`I...`), pero **no la implementación**. La implementación vive en `infrastructure/`. La capa de aplicación importa el adaptador concreto sólo en los casos de uso (`importScenario`, `exportScenario`). El dominio sigue ignorando que existe JSON.
>
> Esto permite que mañana añadamos un adaptador YAML, BDD o lo que sea, sin tocar dominio. También facilita los tests: en un test podemos sustituir el adaptador por un *mock*.

---

## 8. Capa 6 — Infraestructura

### 8.1 `scenarioSerializer.ts` — implementación de `IScenarioSerializer`

```ts
serialize(graph): string {
  const minimal: SerializedGraph = {
    objects: graph.objects.map((o) => ({ id: o.id, label: o.label, isRoot: o.isRoot, position: o.position })),
    references: graph.references.map((r) => ({ id: r.id, sourceObjectId: r.sourceObjectId, targetObjectId: r.targetObjectId })),
  };
  return JSON.stringify(minimal, null, 2);
}
```

Filtra los campos **transitorios** (`marked`, `alive`, `visitedOrder`, `traversed`): un escenario exportado describe una *estructura*, no un instante de simulación. Reimportarlo arranca limpio.

`JSON.stringify(value, null, 2)`: el segundo argumento es un *replacer* (aquí `null` = ningún filtro), el tercero el ancho de indentación.

### 8.2 `scenarioParser.ts` — implementación de `IScenarioParser`

```ts
parse(raw: unknown): MemoryGraph | ValidationError {
  let data: unknown = raw;
  if (typeof raw === "string") {
    try { data = JSON.parse(raw); }
    catch { return fail(MSG_FORMAT); }
  }
  if (!isObjectRecord(data)) return fail(MSG_FORMAT);
  /* ...comprobar arrays objects/references... */
  /* ...crear MemoryObject/MemoryReference vía factorías del dominio... */
  const graph: MemoryGraph = { objects, references };
  const validation = graphValidator.validate(graph);
  if (!validation.isValid) {
    const refersToMissing = validation.errors.some((e) => e.includes("inexistente"));
    return fail(refersToMissing ? MSG_MISSING_REF : "El archivo contiene inconsistencias", validation.errors);
  }
  return graph;
}
```

Tres niveles de validación encadenados:

1. **JSON parse-able**.
2. **Forma estructural**: arrays `objects`/`references` con campos correctos.
3. **Coherencia semántica**: delegada al `graphValidator` del dominio.

`fail(...)` es una factoría local de `ValidationError`, una pequeña abstracción para no repetir el literal.

> **Por qué este parser usa las factorías del dominio (`createMemoryObject`)**:
> Para que los objetos importados **tengan los mismos defaults** que los creados desde la UI (`marked: false`, `alive: true`, etc.). Centraliza la inicialización en un solo punto.

---

## 9. Apéndice A — Conceptos teóricos transversales

### A.1 Funciones de orden superior (HOF)

Una **higher-order function** es una función que **recibe otra función como argumento, devuelve una función, o ambas cosas**. Ejemplos en este proyecto:

| Caso | Por qué |
|---|---|
| `array.map(fn)` | Cada elemento se transforma según `fn`. La identidad de la transformación es el argumento. |
| `array.filter(predicado)` | El predicado decide qué elementos pasan. |
| `array.find(predicado)` / `.some` / `.every` | Idem. |
| `useSimulationStore((s) => ...)` | El selector decide qué porción del estado interesa. |
| `setState((prev) => nuevo)` | El updater calcula el nuevo estado a partir del actual; la librería garantiza pasarle el más reciente. |
| `useEffect(() => { ... return cleanup; }, deps)` | El efecto y su cleanup son funciones; React las invoca en momentos concretos del ciclo de vida. |
| `setInterval(fn, ms)` | La función se ejecuta cada `ms`. |
| `reader.onload = fn` | La función se invoca al terminar la lectura. |

Por qué se hace así: **invertir el control**. El llamador decide *qué hacer*, la librería decide *cuándo* (o *para cada elemento*, o *si pasa la condición*).

### A.2 Closures

Una closure es una función que recuerda el ámbito léxico donde se definió. Aparecen masivamente:

- En event handlers definidos dentro del cuerpo del componente: `onClick={() => setSelectedElement(obj.id)}` captura `obj.id`.
- En la función `visit` recursiva del algoritmo: captura `visited`, `markedIds`, etc.
- En el callback de `setInterval`: captura `speed` (y por eso re-creamos el intervalo cuando `speed` cambia).

Riesgo clásico: una closure puede capturar una variable que será **obsoleta** cuando se ejecute. Por eso `setState((prev) => ...)` usa un updater functional y `setInterval`+Zustand prefiere `useSimulationStore.getState()` antes que cerrar sobre el valor actual.

### A.3 Inmutabilidad y *structural sharing*

Cada modificación al grafo produce un nuevo grafo. Pero las partes que no cambian se comparten por referencia. Beneficios:

- **Igualdad por referencia** detecta cambios en O(1).
- **No hay efectos a distancia**: una función no puede sorprender al llamador modificando su entrada.
- **Tests triviales**: la pureza es la regla.

Operadores clave: `...spread`, `Array.prototype.map/filter/concat`, `Object.assign({}, ...)`.

### A.4 Hooks de React (resumen)

| Hook | Función | Cuándo se usa aquí |
|---|---|---|
| `useState(init)` | Estado local del componente. Re-renderiza al cambiar. | Inputs en edición, flag de simulación corriendo, draftLabel... |
| `useRef(init)` | Contenedor mutable persistente. **No** re-renderiza. | IDs de intervalo, refs a inputs DOM, "última fila vista" del log. |
| `useEffect(fn, deps)` | Sincronización con el exterior tras render. | Listeners globales, intervalos, scroll automático. |
| `useMemo(fn, deps)` | Memoización de valores derivados costosos. | Snapshot del grafo, etiquetas derivadas en RightInfoPanel. |
| `useCallback(fn, deps)` | Memoización de funciones (referencias estables). | Handlers que se pasan a React Flow o a hijos memoizados. |

Regla de las dependencias: el array `deps` debe incluir **todas** las variables del ámbito externo que usa la función. Lint (`react-hooks/exhaustive-deps`) lo verifica. El proyecto usa una excepción explícita en `GraphCanvas` cuando la dependencia es lógicamente la "clave de ids" derivada y no las propias `nds`.

### A.5 Ciclo `Componente → Caso de uso → Store → Componente`

Es el flujo unidireccional:

1. El usuario interactúa con un componente.
2. El handler invoca un caso de uso.
3. El caso de uso lee `getState()`, valida, llama al dominio, escribe `setState()`.
4. Zustand notifica a todos los suscriptores cuya selección cambió.
5. Los componentes afectados se vuelven a renderizar.

Nadie modifica el dominio fuera de un caso de uso. Nadie modifica el store fuera de un caso de uso o de las acciones definidas dentro del propio store. Esto centraliza la lógica de negocio y mantiene los componentes como vistas.

### A.6 Type guards y unions discriminadas

```ts
export interface ValidationError {
  kind: "validation-error";
  message: string;
  errors: string[];
}
export const isValidationError = (
  value: MemoryGraph | ValidationError,
): value is ValidationError =>
  (value as ValidationError).kind === "validation-error";
```

`MemoryGraph | ValidationError` es una *unión*: un valor puede ser uno u otro. El campo `kind` es el discriminador. La función `isValidationError` es un *type predicate*: TypeScript estrecha el tipo dentro de un `if (isValidationError(x)) { ... }`. Así, dentro del bloque, `x` es estrictamente `ValidationError` y se accede a `.message` sin error.

---

## 10. Apéndice B — Recorrido de un escenario completo

Para fijar conceptos, sigamos qué ocurre cuando el usuario:

1. **Selecciona "Cadena lineal"** en el desplegable.
2. **Pulsa "Ejecutar"**.

### Paso 1 — Carga de escenario

- `TopBar.handleScenarioChange` es invocado por `<select onChange={...}>`.
- El handler busca la entrada en `PREDEFINED_SCENARIOS` y llama a `scenarioParser.parse(entry.data)`.
- El parser valida estructuralmente, llama a `graphValidator.validate(...)` y devuelve un `MemoryGraph`.
- Como no es `ValidationError`, se llama al caso de uso `loadPredefinedScenario(parsed)`, que escribe el grafo en el *store* y resetea el estado de simulación.
- Zustand notifica a todos los componentes suscritos: `LeftEditorPanel` repinta la lista, `GraphCanvas` reconstruye `localNodes`, `RightInfoPanel` actualiza la fase a "Idle".

### Paso 2 — Ejecutar

- `SimulationControls.handlePlay` se invoca al pulsar "Ejecutar".
- No hay simulación corriendo → `running = false`. No estamos en `done`. Hay raíces. Llamamos a `startAuto()`.
- `startAuto` crea un `setInterval` que cada `1000/speed` ms llama a `stepSimulation("forward")`.

### Paso 3 — Primer tick

- `stepSimulation("forward")` ve `steps.length === 0`, así que llama a `computeMarkAndSweepSteps(graph)`.
- El algoritmo construye los pasos: `[step0_init, step1_visit_R, step2_visit_A, ..., step_sweep, step_done]`.
- El store se actualiza: `steps`, `currentStep = 0`, `phase = step0.phase`.
- Todos los componentes suscritos a `simulationState` re-renderizan.
- `GraphCanvas`, vía `useMemo`, computa el `snapshot` aplicando los pasos hasta `currentStep = 0` con `applyStepsToGraph`. Renderiza nodos pintados según ese estado.
- `ExecutionLog` añade la entrada del paso 0 (la única vista hasta ahora).

### Paso 4 — Ticks sucesivos

- Cada tick avanza `currentStep`. La lógica de `setInterval` llama a `useSimulationStore.getState()` para leer el estado **vivo**.
- Cuando `currentStep = steps.length - 1`, el callback cancela el intervalo y `setRunning(false)`.

### Paso 5 — Estado final

- `phase = "done"`. Los nodos no marcados aparecen como "recolectados" (rojos, opacidad reducida).
- Las aristas recorridas siguen resaltadas en color *teal*.
- El usuario puede pulsar "Paso anterior" para retroceder y revisar la simulación. Cada retroceso solo modifica `currentStep`; el `useMemo` de `GraphCanvas` recalcula el `snapshot` correspondiente.

---

**Fin del documento.**
