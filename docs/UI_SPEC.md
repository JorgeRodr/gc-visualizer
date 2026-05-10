# GC Visualizer — UI Specification v2.2

> Descripción estructurada del mockup y comportamientos de interacción para implementación.
> Referencia visual: `docs/mockup.jpg`
> Documentos relacionados: @SRS.md (RF-01 a RF-26, RI-01 a RI-10), @SDD.md (sección 7)
> Estándar de referencia para decisiones de usabilidad: ISO 9241-110
> Versión anterior: v2.1
> v2.2 (10/05/2026): nodos con drag handle dedicado (⠿) y dos handles laterales (left/right). §1 ajusta altura del log a fija. §4 reescribe la descripción del nodo. §7.6/§7.7 documentan creación por arrastre lateral y regla right→left del modo botón. §8 incorpora condición "grafo vacío" y el botón "Ver grafo tras recolección". §11 añade campos opcionales `sourceHandle`/`targetHandle` en referencias. §12 actualiza checklist.

---

## 1. Layout general

La aplicación ocupa el viewport completo y se divide en cinco zonas fijas. El layout es de escritorio únicamente (no responsive).

```
┌─────────────────────────────────────────────────────────────────┐
│                         TOP BAR                                  │
├──────────────┬──────────────────────────────────┬───────────────┤
│              │                                  │               │
│  LEFT PANEL  │        GRAPH CANVAS              │  RIGHT PANEL  │
│  (edición)   │        (área central)            │  (info algo.) │
│              │                                  │               │
├──────────────┴──────────────────────────────────┴───────────────┤
│                      BOTTOM PANEL                                │
│              (controles simulación + log)                        │
└─────────────────────────────────────────────────────────────────┘
```

- **Left panel**: ancho fijo ~260px, borde derecho separador
- **Graph canvas**: área flexible que ocupa todo el espacio restante entre paneles
- **Right panel**: ancho fijo ~280px, borde izquierdo separador
- **Top bar**: altura fija ~50px, fondo blanco, borde inferior sutil
- **Bottom panel**: altura fija, dividida en controles (arriba) y log (abajo). El log tiene altura fija de 128px desde el inicio con scroll interno cuando el contenido la supera (no crece con el contenido).

---

## 2. Top Bar (`TopBar.tsx`)

### Zona izquierda
- **Nombre de la app**: "GC Visualizer" en texto grande y negrita
- **Subtítulo**: "Simulador Mark & Sweep" en texto gris más pequeño, separado por divisor vertical sutil

### Zona central/derecha — controles de escenario

| Botón | Icono | Texto | `data-testid` |
|---|---|---|---|
| Cargar escenario | dropdown ▾ | "Cargar escenario" | `btn-cargar-escenario` |
| Importar JSON | upload ↑ | "Importar JSON" | `btn-importar-json` |
| Exportar JSON | download ↓ | "Exportar JSON" | `btn-exportar-json` |
| Limpiar escenario | papelera 🗑 | "Limpiar escenario" | `btn-limpiar-escenario` |

- "Cargar escenario" es un dropdown con los escenarios predefinidos disponibles
- Estilo: botones con borde, fondo blanco, texto oscuro
- Zona extremo derecho: icono de ayuda `?` circular (reservado para modal de ayuda v2.0)

---

## 3. Left Panel — Edición del escenario (`LeftEditorPanel.tsx`)

### Botones de acción (apilados verticalmente)

| Botón | Texto | Estilo | `data-testid` |
|---|---|---|---|
| Crear objeto | "+ Crear objeto" | Fondo azul oscuro, texto blanco | `btn-crear-objeto` |
| Crear referencia | "Crear referencia" | Fondo blanco, borde | `btn-crear-referencia` |
| Eliminar elemento | "Eliminar elemento" | Fondo blanco, borde | `btn-eliminar-elemento` |
| Marcar como raíz | "Marcar como raíz" | Fondo blanco, borde | `btn-marcar-raiz` |

**Bloqueo durante simulación activa**: los cuatro botones quedan deshabilitados (apariencia gris, no clickables). Al intentar usarlos mostrar toast de aviso.

### Texto de ayuda inline
Bajo los botones, texto pequeño gris estático:
```
💡 Arrastra desde un objeto para crear una referencia,
   o usa el botón "Crear referencia".
```
Este texto se muestra siempre, incluso cuando los botones están deshabilitados durante la simulación activa. No se modifica en función del estado de la simulación.

### Lista de objetos creados
- Subtítulo: "Objetos creados" en texto pequeño gris
- Lista vertical scrollable de todos los objetos del escenario
- Objetos con `isRoot=true`: badge "Raíz" azul oscuro a la derecha
- Objeto seleccionado: fondo azul muy claro
- `data-testid` de cada ítem: `object-list-item-{id}`

---

## 4. Graph Canvas — Memoria simulada (`GraphCanvas.tsx`)

### Área de visualización
- Fondo blanco con grid de puntos sutil (patrón por defecto de React Flow)
- Zoom con rueda del ratón, paneo arrastrando el fondo
- Los nodos son arrastrables libremente por el canvas
- `data-testid`: `graph-canvas`

### Configuración de React Flow — CRÍTICA

```tsx
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}  // OBLIGATORIO: sin esto los nodos vuelven a su posición al re-renderizar
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}                  // gestiona creación de referencias por arrastre
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  connectionMode={ConnectionMode.Loose}  // ambos lados del nodo sirven como source/target
  connectOnClick={false}                 // un clic sobre un handle nunca inicia conexión
  fitView
/>
```

Cada nodo se construye con `dragHandle: ".object-node-drag-handle"` para que ReactFlow solo permita el arrastre desde la franja superior con icono ⠿.

### Nodos (`ObjectNode.tsx`)
- Rectángulo redondeado, tamaño ~120×40px
- **Drag handle dedicado**: franja superior de ~12px con icono ⠿ (clase `object-node-drag-handle`). Es el ÚNICO punto desde el que el nodo se puede arrastrar para reposicionarlo. Cursor `grab` / `grabbing`. La prop `dragHandle` del nodo de React Flow apunta a esa clase.
- **Puntos de anclaje de aristas**: dos handles laterales pequeños (~8×8px) en `Position.Left` (id `"left"`, `type="target"`) y `Position.Right` (id `"right"`, `type="source"`). Bajo `ConnectionMode.Loose` ambos sirven como source y como target. El `type` declarado solo establece la convención del modo botón (right=source, left=target).
- El cuerpo central del nodo (no la franja superior, no los handles) es zona neutra: clic la selecciona, doble clic activa edición inline; ni mueve el nodo ni inicia conexiones.
- El div raíz del nodo lleva siempre la clase `nopan` para que la zona del nodo no compita con el sistema de pan/zoom de ReactFlow cuando `nodesDraggable=false` (el wrapper de ReactFlow solo añade la clase automáticamente cuando el nodo es arrastrable).
- Doble clic sobre el nodo → edición inline de la etiqueta (ver sección 7.2)
- `data-testid`: `node-{id}`

### Aristas (`ReferenceEdge.tsx`)
- Línea dirigida con flecha en el extremo destino (`arrowclosed`)
- Seleccionables con clic simple
- Autorreferencias (source === target) se representan como arco sobre el nodo
- `data-testid`: `edge-{sourceId}-{targetId}`

---

## 5. Right Panel — Información del algoritmo (`RightInfoPanel.tsx`)

| Elemento | Valor posible | `data-testid` |
|---|---|---|
| Fase actual | "Idle" / "Fase Mark" / "Fase Sweep" / "Completado" | `info-fase-actual` |
| Elemento seleccionado | nombre del objeto en procesamiento o "—" | `info-elemento-seleccionado` |
| Explicación textual | texto descriptivo del paso actual | `info-explicacion` |
| Leyenda de estados | ver tabla sección 6 | `legend-estados` |

---

## 6. Estados visuales de nodos y aristas

### Estados de nodos

| Estado | Condición | Clases Tailwind |
|---|---|---|
| Raíz | `isRoot=true` | `bg-slate-800 border-slate-800 text-white` |
| Normal | `!isRoot && !marked && alive` | `bg-white border-gray-300 text-gray-800` |
| En procesamiento | `id === currentObjectId` | `bg-white border-orange-400 border-2 text-gray-800` |
| Alcanzable | `marked && alive` | `bg-teal-100 border-teal-400 text-gray-800` |
| No alcanzable | `!marked && phase === 'done'` | `bg-gray-100 border-gray-300 text-gray-400` |
| Recolectable | `alive=false` | `bg-red-100 border-red-300 text-gray-400 opacity-60` |

**Prioridad**: "En procesamiento" tiene prioridad sobre todos los demás estados.

### Estados de aristas

| Estado | Condición | Color | Grosor |
|---|---|---|---|
| Normal | `traversed=false` | `#d1d5db` (gray-300) | 1.5px |
| Recorrida | `traversed=true` | `#2dd4bf` (teal-400) | 2.5px |
| Seleccionada | arista seleccionada actualmente | `#6366f1` (indigo-500) | 2px |

Definir todos los colores como constantes en `src/presentation/styles/stateColors.ts`.

---

## 7. Comportamientos de interacción detallados

### 7.1 Crear objeto
1. Usuario pulsa "+ Crear objeto"
2. Se crea objeto con: id único (UUID), label "Objeto N" (N incremental), `isRoot=false`, `marked=false`, `alive=true`
3. Aparece en el canvas en posición no superpuesta con otros nodos
4. Aparece en la lista del panel izquierdo
5. No se abre ningún formulario ni modal

### 7.2 Editar etiqueta de un objeto
1. Usuario hace **doble clic** sobre un nodo en el canvas
2. La etiqueta se convierte en input de texto inline con el texto actual seleccionado
3. Al pulsar Enter o hacer clic fuera: se guarda el nuevo label
4. Al pulsar Escape: se cancela la edición
5. Solo se edita la etiqueta. El estado raíz se gestiona con el botón "Marcar como raíz"
6. Bloqueado durante simulación activa → toast de aviso

### 7.3 Seleccionar un objeto o arista
1. Usuario hace **clic simple** sobre un nodo o arista
2. El elemento queda seleccionado visualmente
3. `selectedElementId` se actualiza en el store
4. Clic en el fondo del canvas → deselecciona el elemento actual
5. Solo puede haber un elemento seleccionado a la vez

### 7.4 Eliminar un objeto o arista
1. Usuario selecciona un elemento (clic simple)
2. Pulsa "Eliminar elemento" **o** tecla `Delete` / `Backspace`
3. Si es objeto: se elimina junto con todas sus referencias. Toast informativo: "Objeto eliminado. También se eliminaron N referencias asociadas."
4. Si es arista: se elimina directamente sin toast adicional
5. Sin selección activa → toast: "Selecciona primero un objeto o referencia"
6. Bloqueado durante simulación activa → toast de aviso

### 7.5 Marcar/desmarcar como raíz
1. Usuario selecciona un objeto
2. Pulsa "Marcar como raíz"
3. Alterna `isRoot`: false→true o true→false
4. Sin objeto seleccionado → toast: "Selecciona primero un objeto"
5. Bloqueado durante simulación activa → toast de aviso

### 7.6 Crear referencia — método principal (arrastre)
1. Usuario pasa el cursor sobre uno de los dos handles laterales del nodo origen (left/right). Cursor cambia a crosshair sobre el handle.
2. Usuario arrastra hacia uno de los handles laterales del nodo destino. ReactFlow resuelve la elección de handle por proximidad: el handle más cercano al cursor en el momento del drop es el que queda anclado en cada extremo.
3. Mientras arrastra: línea de conexión provisional visible.
4. Al soltar sobre un handle del nodo destino: se crea la referencia con `sourceHandle` y `targetHandle` igual a los handles utilizados (`"left"` o `"right"`). El anclaje permanece al re-renderizar.
5. **Al soltar fuera de cualquier handle (vacío del canvas o cuerpo central del nodo)**: la línea desaparece sin crear referencia.
6. Las **autorreferencias están permitidas** (soltar sobre un handle del propio nodo origen → A→A).
7. Referencia duplicada → toast: "Esta referencia ya existe entre estos dos objetos".
8. Bloqueado durante simulación activa → toast: "No es posible crear referencias durante la simulación".

### 7.7 Crear referencia — método alternativo (botón)
1. Usuario pulsa "Crear referencia" → el botón queda resaltado (modo conexión activo)
2. Texto en canvas: "Haz clic en el objeto origen..."
3. Usuario hace clic en nodo origen → nodo resaltado
4. Texto en canvas: "Ahora haz clic en el objeto destino..."
5. Usuario hace clic en nodo destino → referencia creada, modo conexión desactivado
6. Regla fija de anclaje: la referencia se crea con `sourceHandle: "right"` y `targetHandle: "left"`. En el modo botón el usuario no elige el lado.
7. Escape → cancela el modo conexión en cualquier momento
8. Mismas validaciones que el método por arrastre
9. Bloqueado durante simulación activa: el botón queda deshabilitado (ver sección 3)

### 7.8 Ejecución automática de la simulación
1. Usuario pulsa "Ejecutar"
2. El sistema precalcula todos los pasos con `computeMarkAndSweepSteps`
3. La animación avanza con **delay real** entre pasos usando `setInterval` o `setTimeout` encadenado. **NUNCA un bucle síncrono.**
   - Velocidad 1x → delay 1000ms
   - Velocidad 5x → delay 200ms (default)
   - Velocidad 10x → delay 100ms
   - Fórmula: `delay = Math.round(1000 / velocidad)`
4. Durante ejecución: "Paso anterior" y "Paso siguiente" deshabilitados
5. "Pausar" → detiene el intervalo conservando el paso actual
6. Cambio de velocidad durante ejecución → cancelar intervalo actual y crear nuevo con nuevo delay

### 7.9 Control de velocidad
- Slider rango 1-10 (enteros), valor por defecto 5
- Muestra valor actual como texto: "5x"
- Cambio efectivo inmediatamente, incluso durante ejecución
- `data-testid`: `slider-velocidad`

### 7.10 Ejecución paso a paso
1. "Paso siguiente" → `currentStep + 1` en el array precalculado
2. "Paso anterior" → `currentStep - 1`
3. En el último paso: "Paso siguiente" deshabilitado
4. En el primer paso: "Paso anterior" deshabilitado
5. **El paso a paso funciona sin haber pulsado "Ejecutar" previamente**: si no hay pasos precalculados, el sistema los calcula en el momento del primer "Paso siguiente"

### 7.11 Persistencia
- El escenario **NO persiste entre sesiones**. Al recargar la página: canvas vacío.
- No se usa localStorage ni ningún mecanismo de persistencia automática.
- La única forma de conservar un escenario es exportándolo como JSON (CU-14).

---

## 8. Bottom Panel

### Tabla de estados de habilitación de controles

| Botón | idle | running | paused | done | grafo vacío |
|---|---|---|---|---|---|
| Ejecutar | ✓ | ✗ | ✗ | ✓ | ✗ (sobreescribe) |
| Pausar | ✗ | ✓ | ✗ | ✗ | ✗ |
| Paso anterior | según step | ✗ | según step | según step | ✗ |
| Paso siguiente | ✓ | ✗ | ✓ | ✗ | ✗ (sobreescribe) |
| Reiniciar | ✓ | ✓ | ✓ | ✓ | ✗ (sobreescribe) |
| Ver grafo tras recolección | ✗ | ✗ | ✗ | ✓ | ✗ |

La columna "grafo vacío" (`graph.objects.length === 0`) tiene prioridad sobre las demás: cuando el grafo no contiene objetos, Ejecutar / Paso siguiente / Reiniciar quedan deshabilitados aunque la fase en otra columna los habilitase. El slider de velocidad y Pausar mantienen su lógica habitual.

### Botón "Ver grafo tras recolección" (`btn-vista-recoleccion`)

- Visible solo cuando `phase === "done"` (RF-16, CU-11).
- Texto dinámico: `"Ver grafo tras recolección"` cuando `showCollectedView === false`, `"Volver a vista completa"` cuando `true`.
- Al activarse oculta del canvas los nodos con `alive === false` y las aristas que tienen alguno de sus extremos en esos nodos. El estado lógico no se modifica.
- Al desactivarse vuelve a mostrar el grafo completo.
- Al reiniciar la simulación (`resetSimulation`) la vista vuelve automáticamente a `showCollectedView=false` (RF-17 / FA-10A del UCD).

### Log (`ExecutionLog.tsx`)
- Formato: `HH:MM  Descripción del evento`
- Altura fija de 128px desde el inicio. Scroll interno cuando el contenido la supera.
- Scroll automático al final con cada nueva entrada
- `data-testid`: `execution-log`

---

## 9. Sistema de toasts

Toasts en esquina superior o inferior derecha. Duración 3 segundos. Cerrables con clic.

### Toasts de error (fondo rojo claro)
| Situación | Mensaje |
|---|---|
| Referencia duplicada | "Esta referencia ya existe entre estos dos objetos" |
| Crear referencia durante simulación | "No es posible crear referencias durante la simulación" |
| Eliminar durante simulación | "No es posible eliminar elementos durante la simulación" |
| Editar durante simulación | "No es posible editar elementos durante la simulación" |
| Eliminar sin selección | "Selecciona primero un objeto o referencia" |
| Marcar raíz sin selección | "Selecciona primero un objeto" |
| JSON inválido | "El archivo no tiene el formato correcto" |
| JSON con inconsistencias | "El archivo contiene referencias a objetos inexistentes" |

### Toasts informativos (fondo azul claro)
| Situación | Mensaje |
|---|---|
| Eliminar objeto con referencias | "Objeto eliminado. También se eliminaron N referencias asociadas." |
| Importar correctamente | "Escenario importado correctamente" |
| Exportar correctamente | "Escenario exportado correctamente" |

### Diálogo de confirmación (no toast)
| Situación | Mensaje |
|---|---|
| Ejecutar sin raíces | "No hay raíces definidas. Todos los objetos serán considerados inalcanzables. ¿Continuar?" + botones Continuar / Cancelar |

Usar librería `react-hot-toast` o `sonner`. No implementar toasts desde cero.

---

## 10. Modal de bienvenida / ayuda

> **Estado**: funcionalidad identificada para v2.0. No incluida en el alcance del SRS v1.4.
> Si se implementa: documentar como RF nuevo en SRS y CU-16 en UCD.

Descripción: modal con pasos explicativos (cómo crear objetos, referencias, raíces, ejecutar la simulación e interpretar estados visuales). Accesible desde el icono `?` de la TopBar y automáticamente en la primera visita.

---

## 11. Escenarios predefinidos y formato JSON

| Nombre en UI | Estructura |
|---|---|
| Cadena lineal | A(raíz)→B→C |
| Ciclo alcanzable | A(raíz)→B→C→B |
| Ciclo inalcanzable | A(raíz), B→C→B |
| Múltiples raíces | A(raíz)→B, C(raíz)→D, E aislado |
| Sin raíces | A, B, C sin raíces |

### Formato JSON requerido por el parser

**Campos obligatorios**: `objects[].id`, `objects[].label`, `objects[].isRoot`, `references[].id`, `references[].sourceObjectId`, `references[].targetObjectId`
**Campos opcionales**: `objects[].position`, `references[].sourceHandle` (`"left" | "right"`), `references[].targetHandle` (`"left" | "right"`)
**Campos que NO deben estar en el JSON**: `marked`, `alive`, `visitedOrder`, `traversed` (son estado de simulación, no del escenario)

Notas sobre los handles:
- El serializer solo emite `sourceHandle` y `targetHandle` cuando están presentes en la referencia (round-trip limpio para escenarios sin handles, p. ej. los predefinidos).
- El parser acepta JSON sin estos campos sin error: la referencia importada queda sin handles y ReactFlow elige el lado por defecto al renderizar.
- Los escenarios predefinidos de §11 NO incluyen handles; aplican la regla de anclaje por defecto.

### JSON completo de cada escenario

**Cadena lineal** (`cadena-lineal.json`)
```json
{
  "objects": [
    { "id": "raiz-1", "label": "Raíz 1", "isRoot": true, "position": { "x": 100, "y": 200 } },
    { "id": "obj-b", "label": "Objeto B", "isRoot": false, "position": { "x": 300, "y": 200 } },
    { "id": "obj-c", "label": "Objeto C", "isRoot": false, "position": { "x": 500, "y": 200 } }
  ],
  "references": [
    { "id": "ref-raiz-b", "sourceObjectId": "raiz-1", "targetObjectId": "obj-b" },
    { "id": "ref-b-c", "sourceObjectId": "obj-b", "targetObjectId": "obj-c" }
  ]
}
```

**Ciclo alcanzable** (`ciclo-alcanzable.json`)
```json
{
  "objects": [
    { "id": "raiz-1", "label": "Raíz 1", "isRoot": true, "position": { "x": 100, "y": 200 } },
    { "id": "obj-b", "label": "Objeto B", "isRoot": false, "position": { "x": 350, "y": 100 } },
    { "id": "obj-c", "label": "Objeto C", "isRoot": false, "position": { "x": 550, "y": 200 } }
  ],
  "references": [
    { "id": "ref-raiz-b", "sourceObjectId": "raiz-1", "targetObjectId": "obj-b" },
    { "id": "ref-b-c", "sourceObjectId": "obj-b", "targetObjectId": "obj-c" },
    { "id": "ref-c-b", "sourceObjectId": "obj-c", "targetObjectId": "obj-b" }
  ]
}
```

**Ciclo inalcanzable** (`ciclo-inalcanzable.json`)
```json
{
  "objects": [
    { "id": "raiz-1", "label": "Raíz 1", "isRoot": true, "position": { "x": 100, "y": 200 } },
    { "id": "obj-b", "label": "Objeto B", "isRoot": false, "position": { "x": 400, "y": 100 } },
    { "id": "obj-c", "label": "Objeto C", "isRoot": false, "position": { "x": 600, "y": 200 } }
  ],
  "references": [
    { "id": "ref-b-c", "sourceObjectId": "obj-b", "targetObjectId": "obj-c" },
    { "id": "ref-c-b", "sourceObjectId": "obj-c", "targetObjectId": "obj-b" }
  ]
}
```

**Múltiples raíces** (`multiples-raices.json`)
```json
{
  "objects": [
    { "id": "raiz-1", "label": "Raíz 1", "isRoot": true, "position": { "x": 100, "y": 150 } },
    { "id": "obj-b", "label": "Objeto B", "isRoot": false, "position": { "x": 350, "y": 150 } },
    { "id": "raiz-2", "label": "Raíz 2", "isRoot": true, "position": { "x": 100, "y": 350 } },
    { "id": "obj-d", "label": "Objeto D", "isRoot": false, "position": { "x": 350, "y": 350 } },
    { "id": "obj-e", "label": "Objeto E", "isRoot": false, "position": { "x": 600, "y": 250 } }
  ],
  "references": [
    { "id": "ref-raiz1-b", "sourceObjectId": "raiz-1", "targetObjectId": "obj-b" },
    { "id": "ref-raiz2-d", "sourceObjectId": "raiz-2", "targetObjectId": "obj-d" }
  ]
}
```

**Sin raíces** (`sin-raices.json`)
```json
{
  "objects": [
    { "id": "obj-a", "label": "Objeto A", "isRoot": false, "position": { "x": 150, "y": 200 } },
    { "id": "obj-b", "label": "Objeto B", "isRoot": false, "position": { "x": 400, "y": 200 } },
    { "id": "obj-c", "label": "Objeto C", "isRoot": false, "position": { "x": 650, "y": 200 } }
  ],
  "references": [
    { "id": "ref-a-b", "sourceObjectId": "obj-a", "targetObjectId": "obj-b" }
  ]
}
```

---

## 12. Checklist de implementación para el agente

Antes de dar por completado cada componente, verificar:

- [ ] `onNodesChange` conectado al store (posición de nodos persiste al re-renderizar)
- [ ] `connectionMode={ConnectionMode.Loose}` configurado en ReactFlow
- [ ] `connectOnClick={false}` configurado en ReactFlow (un clic sobre handle no inicia conexión)
- [ ] App envuelta en `<ReactFlowProvider>` para que `useReactFlow()` esté disponible fuera del propio canvas (lo necesita el botón "Crear objeto" para calcular posiciones libres)
- [ ] Cada nodo expone dos handles laterales (`id="left"` Position.Left y `id="right"` Position.Right)
- [ ] Cada nodo tiene un drag handle dedicado (`.object-node-drag-handle`) y `dragHandle` en el nodo apunta a esa clase
- [ ] El div raíz del nodo lleva la clase `nopan` (asegura que `dblclick` y `click` llegan al wrapper también cuando `nodesDraggable=false` durante simulación)
- [ ] `onNodeDoubleClick` implementado para edición inline de etiqueta
- [ ] Aristas seleccionables con clic simple (`onEdgeClick` conectado al store)
- [ ] `setInterval`/`setTimeout` usado para ejecución automática (no bucle síncrono)
- [ ] Velocidad del slider afecta al delay de la animación en tiempo real
- [ ] Paso a paso funciona independientemente de si se ha ejecutado antes
- [ ] Botones Ejecutar / Paso siguiente / Reiniciar deshabilitados con grafo vacío
- [ ] Botón `btn-vista-recoleccion` solo visible cuando `phase === "done"` y filtra nodos con `alive=false`
- [ ] Todos los `data-testid` presentes en los componentes correspondientes
- [ ] Toasts implementados para todas las situaciones de la sección 9
- [ ] No se usa localStorage en ningún lugar
- [ ] Verificar en `package.json` que se usa `@xyflow/react` (React Flow v12, compatible con React 18) y no la versión antigua `reactflow`
- [ ] Constantes de color definidas en `stateColors.ts`
- [ ] El log inferior (`ExecutionLog`) tiene altura fija (`h-32`) desde el inicio con scroll interno (no `max-h-32`)
