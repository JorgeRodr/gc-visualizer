# GC Visualizer — Software Test Specification (STS v1.2)


### Historial de revisiones

| Versión | Fecha | Descripción | Autor |
| --- | --- | --- | --- |
| 1.0 | 04/05/2026 | Versión inicial. 38 casos de prueba. Campo RB eliminado. | — |
| 1.1 | 04/05/2026 | Correcciones VAL-STS-v1.0 (H-01 a H-07). Añadidos TC-U-14, TC-E-16, TC-E-17. Total: 41 casos. | — |
| 1.2 | 04/05/2026 | Correcciones VAL2-STS-v1.1 (H2-01 a H2-04). Actualizada matriz RF-09, TC-E-02, TC-E-04, TC-E-11. | — |
| 1.3 | 05/05/2026 | Segunda versión. Derivada de SRS v1.4. Eliminadas referencias académicas. TC-E-02 ampliado (toast texto exacto, RF-26). TC-E-04 ampliado (dos métodos, RF-04). TC-E-05 ampliado (clic arista, Delete). TC-E-08 ampliado (slider velocidad). Añadidos TC-E-18, TC-E-19 (RF-04), TC-E-20 (RF-05), TC-E-21 (RF-10). RF-26 añadido a matriz. Total: 45 casos de prueba. | — |
| 1.4 | 10/05/2026 | Derivada de SRS v1.5 y UI_SPEC v2.2. Añadidos TC-U-15..21 (findFreePosition), TC-U-22..24 (factory MemoryReference con handles), TC-I-11..12 (createReference con handles), TC-I-13..16 (export/import con handles), TC-I-17..18 (runSimulation con grafo vacío), TC-E-22..27 (E2E pendientes de implementar — ver TEST_IMPLEMENTATION_PLAN.md). Total: 67 casos de prueba (61 implementados + 6 pendientes). | — |


## 1. Introducción


### 1.1 Propósito

El presente documento especifica los casos de prueba del sistema GC Visualizer, organizados por nivel de prueba: unitarias, integración y end-to-end. Su objetivo es proporcionar una especificación verificable y trazable de cómo se valida cada requisito funcional del SRS v1.4.

Este documento es complementario al STP (Software Test Plan), que define la estrategia general de pruebas. El STS define los casos concretos que el STP referenciará.


### 1.2 Niveles de prueba

| Nivel | Prefijo | Herramienta | Descripción |
| --- | --- | --- | --- |
| Unitarias | TC-U-XX | Jest | Pruebas del dominio puro: algoritmo Mark & Sweep, entidades, validador de grafo. Sin dependencias de React ni de la interfaz. |
| Integración | TC-I-XX | Jest | Pruebas que cruzan dos o más capas: casos de uso de aplicación invocando el dominio, actualización del store, serialización/deserialización JSON. |
| End-to-End | TC-E-XX | Cypress | Pruebas que ejercitan la aplicación completa desde el navegador, simulando interacciones reales de usuario sobre la interfaz. |


### 1.3 Convenciones

Cada caso de prueba incluye los siguientes campos:

| Campo | Descripción |
| --- | --- |
| Identificador | Código único: TC-U-XX (unitaria), TC-I-XX (integración), TC-E-XX (e2e). |
| Nivel / Herramienta | Nivel de prueba y herramienta de ejecución. |
| RF relacionados | Requisitos funcionales del SRS v1.4 que verifica. |
| CP base | Caso de prueba base del documento original que corresponde, si aplica. |
| Precondición | Estado del sistema necesario antes de ejecutar el caso. |
| Pasos | Secuencia de acciones para ejecutar el caso. |
| Resultado esperado | Estado del sistema tras la ejecución correcta. |


### 1.4 Trazabilidad con el SRS

La siguiente tabla muestra la cobertura de los requisitos funcionales del SRS v1.4 en este documento:

| RF | Nombre | Casos de prueba |
| --- | --- | --- |
| RF-01 | Representación de objetos | TC-U-01, TC-I-01, TC-E-01, TC-U-15, TC-U-16, TC-U-17, TC-U-18, TC-U-19, TC-U-20, TC-U-21 (apoyo de UX: posicionamiento sin solape) |
| RF-02 | Eliminación de objetos | TC-U-02, TC-E-02, TC-E-16 |
| RF-03 | Edición de objetos | TC-E-03, TC-E-24 |
| RF-04 | Representación de referencias | TC-U-03, TC-U-14, TC-I-02, TC-E-04, TC-E-18, TC-E-19, TC-U-22, TC-U-23, TC-U-24, TC-I-11, TC-I-12, TC-E-25, TC-E-26, TC-E-27 |
| RF-05 | Eliminación de referencias | TC-E-05, TC-E-20 |
| RF-06 | Gestión de raíces | TC-U-04, TC-E-06 |
| RF-07 | Visualización del grafo | TC-E-01, TC-E-04, TC-E-06 |
| RF-08 | Estado inicial de simulación | TC-U-05, TC-I-03 |
| RF-09 | Ejecución fase Mark | TC-U-06, TC-U-07, TC-U-08, TC-U-09, TC-U-10, TC-U-14, TC-E-17 |
| RF-10 | Visualización paso a paso | TC-I-04, TC-E-07, TC-E-21 |
| RF-11 | Ejecución automática | TC-E-08, TC-E-23 (criterio "grafo vacío") |
| RF-12 | Ejecución fase Sweep | TC-U-11, TC-U-12 |
| RF-13 | Visualización del barrido | TC-E-09 |
| RF-14 | Ejecución completa | TC-I-05, TC-E-10, TC-I-17, TC-I-18, TC-E-23 |
| RF-15 | Ejecución paso a paso global | TC-I-04, TC-E-07, TC-E-23 (criterio "grafo vacío") |
| RF-16 | Vista tras recolección | TC-E-11, TC-E-22 |
| RF-17 | Reinicio de simulación | TC-I-06, TC-E-12 |
| RF-18 | Escenarios predefinidos | TC-E-13 |
| RF-19 | Validación de consistencia | TC-U-13, TC-I-07, TC-I-10 |
| RF-20 | Leyenda visual | TC-E-14 |
| RF-21 | Explicación textual | TC-E-07, TC-E-10 |
| RF-22 | Registro de ejecución | TC-I-08, TC-E-10 |
| RF-23 | Soporte para ciclos | TC-U-09, TC-U-10 |
| RF-24 | Soporte para múltiples raíces | TC-U-08, TC-I-05 |
| RF-25 | Importación/exportación | TC-I-09, TC-I-10, TC-E-15, TC-I-13, TC-I-14, TC-I-15, TC-I-16 |
| RF-26 | Sistema de notificaciones | TC-E-02, TC-E-16, TC-E-17 — RF transversal |


## 2. Pruebas unitarias

Las pruebas unitarias verifican el comportamiento del dominio de forma aislada. Se ejecutan con Jest sin dependencias de React ni de la interfaz. El módulo principal bajo prueba es markAndSweep.ts, junto con las entidades del dominio y el validador de grafo.


#### TC-U-01  Creación de objeto con estado inicial correcto

| Identificador | TC-U-01 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-01 |
| CP base | CP-02 |
| Precondición | Módulo MemoryObject disponible. |
| Pasos | 1. Crear un nuevo MemoryObject con id='A', label='Objeto A', isRoot=false.2. Verificar los atributos del objeto creado. |
| Resultado esperado | El objeto tiene id='A', label='Objeto A', isRoot=false, marked=false, alive=true, visitedOrder=null. |


#### TC-U-02  Eliminación lógica de objeto y sus referencias

| Identificador | TC-U-02 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-02 |
| CP base | CP-13 |
| Precondición | MemoryGraph con objetos A, B, C y referencias A→B, B→C, C→A. |
| Pasos | 1. Invocar la operación de eliminación sobre el objeto B.2. Verificar el estado del grafo resultante. |
| Resultado esperado | B no existe en el grafo. Las referencias A→B y B→C han sido eliminadas. La referencia C→A permanece. No quedan referencias colgantes. |


#### TC-U-03  Rechazo de referencia duplicada

| Identificador | TC-U-03 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-04 |
| CP base | CP-15 |
| Precondición | MemoryGraph con objetos A y B y referencia A→B. |
| Pasos | 1. Intentar crear una segunda referencia A→B.2. Verificar el estado del grafo. |
| Resultado esperado | El sistema rechaza la creación. El grafo mantiene una única referencia A→B. |


#### TC-U-04  Marcado de objeto como raíz

| Identificador | TC-U-04 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-06 |
| CP base | — |
| Precondición | MemoryGraph con objeto A, isRoot=false. |
| Pasos | 1. Marcar el objeto A como raíz (isRoot=true).2. Verificar que A pertenece al conjunto de raíces del grafo. |
| Resultado esperado | A.isRoot=true. getRoots() devuelve [A]. |


#### TC-U-05  Estado inicial de simulación antes de ejecutar

| Identificador | TC-U-05 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-08 |
| CP base | — |
| Precondición | MemoryGraph con objetos A(raíz), B, C y referencias A→B, B→C. |
| Pasos | 1. Verificar el estado inicial de todos los objetos antes de invocar el algoritmo. |
| Resultado esperado | Todos los objetos tienen marked=false, alive=true, visitedOrder=null. Todas las referencias tienen traversed=false. |


#### TC-U-06  Fase Mark: marcado de cadena lineal desde raíz

| Identificador | TC-U-06 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-09 |
| CP base | CP-04 |
| Precondición | MemoryGraph: A(raíz)→B→C. |
| Pasos | 1. Invocar computeMarkAndSweepSteps(graph).2. Verificar el estado de marcado de cada objeto tras la fase Mark. |
| Resultado esperado | A.marked=true, B.marked=true, C.marked=true. El orden de visita es A(0), B(1), C(2). |


#### TC-U-07  Fase Mark: objeto aislado sin raíz no se marca

| Identificador | TC-U-07 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-09 |
| CP base | CP-03, CP-05 |
| Precondición | MemoryGraph: A(raíz), C aislado sin referencias. |
| Pasos | 1. Invocar computeMarkAndSweepSteps(graph).2. Verificar el estado de C tras la fase Mark. |
| Resultado esperado | A.marked=true. C.marked=false. |


#### TC-U-08  Fase Mark: múltiples raíces

| Identificador | TC-U-08 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-09, RF-24 |
| CP base | CP-09 |
| Precondición | MemoryGraph: A(raíz)→B, C(raíz)→D, E aislado. |
| Pasos | 1. Invocar computeMarkAndSweepSteps(graph).2. Verificar el estado de todos los objetos tras la fase Mark. |
| Resultado esperado | A, B, C, D marcados. E no marcado. |


#### TC-U-09  Fase Mark: ciclo alcanzable no produce bucle infinito

| Identificador | TC-U-09 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-09, RF-23 |
| CP base | CP-07 |
| Precondición | MemoryGraph: A(raíz)→B→C→B (ciclo en B-C). |
| Pasos | 1. Invocar computeMarkAndSweepSteps(graph).2. Verificar que el algoritmo termina y los objetos quedan correctamente marcados. |
| Resultado esperado | A, B, C marcados. El algoritmo termina sin error. B no es procesado dos veces. |


#### TC-U-10  Fase Mark: ciclo inalcanzable queda sin marcar

| Identificador | TC-U-10 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-09, RF-23 |
| CP base | CP-08 |
| Precondición | MemoryGraph: A(raíz), B→C→B (ciclo no alcanzable desde raíz). |
| Pasos | 1. Invocar computeMarkAndSweepSteps(graph).2. Verificar el estado de B y C. |
| Resultado esperado | A marcado. B y C no marcados. El algoritmo termina sin error. |


#### TC-U-11  Fase Sweep: objetos no marcados quedan recolectados

| Identificador | TC-U-11 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-12 |
| CP base | CP-05 |
| Precondición | MemoryGraph tras fase Mark: A marcado, B no marcado. |
| Pasos | 1. Ejecutar la fase Sweep sobre el grafo.2. Verificar el estado de alive de cada objeto. |
| Resultado esperado | A.alive=true. B.alive=false. B permanece en el grafo con estado recolectado. |


#### TC-U-12  Fase Sweep: objetos marcados no se recolectan

| Identificador | TC-U-12 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-12 |
| CP base | — |
| Precondición | MemoryGraph tras fase Mark completa: A, B, C marcados. |
| Pasos | 1. Ejecutar la fase Sweep.2. Verificar que ningún objeto marcado queda recolectado. |
| Resultado esperado | A.alive=true, B.alive=true, C.alive=true. Ningún objeto pasa al estado recolectado. |


#### TC-U-13  Validación: rechazo de referencia a objeto inexistente

| Identificador | TC-U-13 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-19 |
| CP base | CP-16 |
| Precondición | MemoryGraph con objeto A. |
| Pasos | 1. Intentar crear una referencia con sourceObjectId='A' y targetObjectId='Z' (Z no existe).2. Verificar la respuesta del validador. |
| Resultado esperado | El validador devuelve un error de consistencia. La referencia no se crea. |


#### TC-U-14  Fase Mark: autorreferencia no produce bucle infinito

| Identificador | TC-U-14 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-04, RF-09 |
| CP base | CP-10 |
| Precondición | MemoryGraph: A(raíz)→A (autorreferencia). |
| Pasos | 1. Invocar computeMarkAndSweepSteps(graph).2. Verificar que el algoritmo termina y el estado de A es correcto. |
| Resultado esperado | A.marked=true, A.visitedOrder=0. El algoritmo termina sin error. A no es procesado más de una vez. |


#### TC-U-15  findFreePosition: dentro de los bounds con grafo vacío

| Identificador | TC-U-15 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-01 (apoyo de UX) |
| CP base | — |
| Precondición | Utilidad findFreePosition disponible. Sin posiciones ocupadas. |
| Pasos | 1. Invocar findFreePosition([], { minX:0, minY:0, maxX:800, maxY:500 }, seqRandom([0.5, 0.5])). |
| Resultado esperado | La posición devuelta cumple x∈[minX+24, maxX-NODE_W-24] e y∈[minY+24, maxY-NODE_H-24]. |


#### TC-U-16  findFreePosition: comportamiento determinista con random inyectado

| Identificador | TC-U-16 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-01 (apoyo de UX) |
| CP base | — |
| Precondición | Utilidad findFreePosition disponible. |
| Pasos | 1. Invocar findFreePosition([], bounds, seqRandom([0, 0])). |
| Resultado esperado | La posición devuelta es exactamente { x: minX + 24, y: minY + 24 }. |


#### TC-U-17  findFreePosition: respeta el origen no nulo de los bounds (viewport zoomeado)

| Identificador | TC-U-17 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-01 (apoyo de UX) |
| CP base | — |
| Precondición | Utilidad findFreePosition disponible. |
| Pasos | 1. Invocar findFreePosition con bounds de origen no nulo, p. ej. { minX:200, minY:150, maxX:600, maxY:450 }, y random determinista. |
| Resultado esperado | La posición devuelta queda dentro del rectángulo simulado del viewport zoomeado y nunca por debajo de minX/minY. |


#### TC-U-18  findFreePosition: no solapa con un único nodo ocupado

| Identificador | TC-U-18 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-01 (apoyo de UX) |
| CP base | — |
| Precondición | Utilidad findFreePosition disponible. |
| Pasos | 1. Invocar findFreePosition([{x:100, y:100}], bounds, secuencia random que en el primer intento cae sobre (100,100) y en el segundo en una esquina alejada. |
| Resultado esperado | La función rechaza el primer candidato (solape) y devuelve el segundo, dentro de bounds, sin solapamiento. |


#### TC-U-19  findFreePosition: fallback de tile-scan con muchos nodos ocupados

| Identificador | TC-U-19 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-01 (apoyo de UX) |
| CP base | — |
| Precondición | Utilidad findFreePosition disponible. |
| Pasos | 1. Crear un set de 5 nodos ocupados.2. Forzar que todas las muestras random caigan sobre el primer nodo (random fijo). |
| Resultado esperado | Tras agotar los MAX_ATTEMPTS, la función entra en el fallback de tile-scan y devuelve una posición sin solapamiento con ninguno de los 5 nodos. |


#### TC-U-20  findFreePosition: dos llamadas con seeds distintos no producen solape

| Identificador | TC-U-20 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-01 (apoyo de UX) |
| CP base | — |
| Precondición | Utilidad findFreePosition disponible. |
| Pasos | 1. first = findFreePosition([], bounds, seqRandom([0.1, 0.1]).2. second = findFreePosition([first], bounds, seqRandom([0.9, 0.9]). |
| Resultado esperado | first y second no solapan (distancia mayor a NODE_WIDTH/HEIGHT en al menos un eje). |


#### TC-U-21  findFreePosition: usa bounds por defecto cuando no se proporcionan

| Identificador | TC-U-21 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-01 (apoyo de UX) |
| CP base | — |
| Precondición | Utilidad findFreePosition disponible. |
| Pasos | 1. Invocar findFreePosition([]) sin pasar bounds. |
| Resultado esperado | Devuelve una posición con coordenadas no negativas (los bounds por defecto del módulo se aplican). No lanza excepción. |


#### TC-U-22  Factory MemoryReference: estado por defecto sin handles

| Identificador | TC-U-22 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-04 |
| CP base | — |
| Precondición | Factory createMemoryReference disponible. |
| Pasos | 1. Crear ref = createMemoryReference("r1", "A", "B"). |
| Resultado esperado | ref.id="r1", sourceObjectId="A", targetObjectId="B", traversed=false, sourceHandle y targetHandle son undefined. |


#### TC-U-23  Factory MemoryReference: acepta source y target handle

| Identificador | TC-U-23 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-04 |
| CP base | — |
| Precondición | Factory createMemoryReference disponible. |
| Pasos | 1. Crear ref = createMemoryReference("r1", "A", "B", { sourceHandle: "right", targetHandle: "left" }). |
| Resultado esperado | ref.sourceHandle="right" y ref.targetHandle="left". |


#### TC-U-24  Factory MemoryReference: acepta solo uno de los dos handles

| Identificador | TC-U-24 |
| --- | --- |
| Nivel | Unitaria |
| Herramienta | Jest |
| RF relacionados | RF-04 |
| CP base | — |
| Precondición | Factory createMemoryReference disponible. |
| Pasos | 1. Crear ref = createMemoryReference("r1", "A", "B", { sourceHandle: "left" }). |
| Resultado esperado | ref.sourceHandle="left" y ref.targetHandle es undefined. |


## 3. Pruebas de integración

Las pruebas de integración verifican la interacción entre capas: casos de uso de aplicación invocando el dominio, actualización del store y serialización de escenarios. Se ejecutan con Jest.


#### TC-I-01  Caso de uso createObject actualiza el store

| Identificador | TC-I-01 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-01 |
| CP base | — |
| Precondición | Store inicializado con grafo vacío. |
| Pasos | 1. Invocar el caso de uso createObject con label='Nodo A'.2. Leer el estado del store tras la invocación. |
| Resultado esperado | El store contiene un objeto con label='Nodo A', marked=false, alive=true, isRoot=false. Se ha asignado un id único. |


#### TC-I-02  Caso de uso createReference valida y actualiza el store

| Identificador | TC-I-02 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-04 |
| CP base | CP-15 |
| Precondición | Store con objetos A y B. |
| Pasos | 1. Invocar createReference con sourceId='A', targetId='B'.2. Intentar invocar createReference de nuevo con los mismos parámetros.3. Verificar el estado del store. |
| Resultado esperado | Primera invocación: referencia A→B creada en el store. Segunda invocación: rechazada. El store contiene una única referencia A→B. |


#### TC-I-03  Estado inicial limpio antes de ejecutar simulación

| Identificador | TC-I-03 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-08 |
| CP base | CP-19 |
| Precondición | Store con objetos A(raíz), B y referencia A→B. Simulación ejecutada previamente. |
| Pasos | 1. Invocar resetSimulation.2. Verificar el estado del store. |
| Resultado esperado | Todos los objetos tienen marked=false, alive=true. El store tiene phase='idle', steps=[], logs=[]. Los objetos, referencias y raíces se conservan. |


#### TC-I-04  stepSimulation avanza y retrocede sobre pasos precalculados

| Identificador | TC-I-04 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-10, RF-15 |
| CP base | CP-17, CP-17B |
| Precondición | Store con grafo A(raíz)→B→C. Simulación completa ejecutada (steps precalculados). |
| Pasos | 1. Invocar stepSimulation con dirección 'forward' tres veces.2. Invocar stepSimulation con dirección 'backward' una vez.3. Verificar currentStep y el estado visual del paso actual. |
| Resultado esperado | Tras tres avances: currentStep=3. Tras un retroceso: currentStep=2. El estado visual corresponde al SimulationStep[2]. |


#### TC-I-05  runSimulation produce resultado correcto en grafo mixto

| Identificador | TC-I-05 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-14, RF-24 |
| CP base | CP-11 |
| Precondición | Store con grafo: A(raíz)→B, C(raíz)→D, E aislado, F→G→F (ciclo inalcanzable). |
| Pasos | 1. Invocar runSimulation.2. Verificar el estado final de todos los objetos. |
| Resultado esperado | A, B, C, D marcados y alive=true. E, F, G no marcados y alive=false. Simulación terminada sin error. |


#### TC-I-06  resetSimulation restaura estado de ejecución conservando escenario

| Identificador | TC-I-06 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-17 |
| CP base | CP-19 |
| Precondición | Store con grafo y simulación completada: objetos marcados y recolectados. |
| Pasos | 1. Invocar resetSimulation.2. Verificar estado del store. |
| Resultado esperado | phase='idle'. Ningún objeto marcado. Ningún objeto recolectado. Objetos, referencias y raíces conservados. logs=[], steps=[]. |


#### TC-I-07  graphValidator detecta inconsistencias estructurales

| Identificador | TC-I-07 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-19 |
| CP base | CP-16 |
| Precondición | Módulo graphValidator disponible. |
| Pasos | 1. Crear un grafo con una referencia cuyo targetObjectId apunta a un objeto inexistente.2. Invocar validate(graph).3. Verificar el resultado. |
| Resultado esperado | El validador devuelve ValidationResult con isValid=false y descripción del error. La simulación no puede iniciarse. |


#### TC-I-08  Registro de ejecución refleja todos los eventos de la simulación

| Identificador | TC-I-08 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-22 |
| CP base | — |
| Precondición | Store con grafo A(raíz)→B→C. |
| Pasos | 1. Invocar runSimulation.2. Leer el array logs del store al finalizar. |
| Resultado esperado | Los logs contienen entradas para: inicio de fase Mark, visita de A, visita de B, visita de C, inicio de fase Sweep, identificación de recolectables y finalización. |


#### TC-I-09  exportScenario genera JSON válido con estructura completa

| Identificador | TC-I-09 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-25 |
| CP base | CP-28 |
| Precondición | Store con grafo: A(raíz)→B, C aislado. |
| Pasos | 1. Invocar exportScenario.2. Parsear el JSON resultante.3. Verificar su estructura. |
| Resultado esperado | El JSON contiene arrays objects (3 elementos), references (1 elemento) y roots (['A']). Es parseable sin error. |


#### TC-I-10  importScenario rechaza JSON con referencias inconsistentes

| Identificador | TC-I-10 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-25, RF-19 |
| CP base | CP-30 |
| Precondición | Módulo importScenario disponible. |
| Pasos | 1. Construir un JSON con una referencia cuyo targetObjectId apunta a un objeto no incluido en el JSON.2. Invocar importScenario con ese JSON.3. Verificar el resultado. |
| Resultado esperado | La importación es rechazada. El store no se modifica. Se genera un error descriptivo. |


#### TC-I-11  createReference persiste handles cuando se proporcionan

| Identificador | TC-I-11 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-04 |
| CP base | — |
| Precondición | Store con dos objetos A y B. |
| Pasos | 1. Invocar createReference(a.id, b.id, { source: "right", target: "left" }).2. Leer la referencia resultante del store. |
| Resultado esperado | La referencia almacenada tiene sourceHandle="right" y targetHandle="left". |


#### TC-I-12  createReference por defecto no asigna handles

| Identificador | TC-I-12 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-04 |
| CP base | — |
| Precondición | Store con dos objetos A y B. |
| Pasos | 1. Invocar createReference(a.id, b.id) sin pasar handles. |
| Resultado esperado | La referencia almacenada tiene sourceHandle=undefined y targetHandle=undefined. |


#### TC-I-13  exportScenario incluye handles cuando la referencia los lleva

| Identificador | TC-I-13 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-25, RF-04 |
| CP base | — |
| Precondición | Store con A(raíz) y B y una referencia A→B con sourceHandle="right" y targetHandle="left". |
| Pasos | 1. Invocar exportScenario.2. Parsear el JSON. |
| Resultado esperado | references[0].sourceHandle === "right" y references[0].targetHandle === "left". |


#### TC-I-14  exportScenario omite las claves de handle cuando la referencia no los tiene

| Identificador | TC-I-14 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-25, RF-04 |
| CP base | — |
| Precondición | Store con A(raíz) y B y una referencia A→B sin handles. |
| Pasos | 1. Invocar exportScenario. 2. Parsear el JSON. |
| Resultado esperado | references[0] no contiene la propiedad sourceHandle ni targetHandle (no existen las claves en el JSON serializado). |


#### TC-I-15  Round-trip de exportación/importación preserva los handles

| Identificador | TC-I-15 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-25, RF-04 |
| CP base | — |
| Precondición | Store con A(raíz) y B y una referencia A→B con sourceHandle="right" y targetHandle="left". |
| Pasos | 1. Exportar JSON. 2. Resetear el store. 3. Importar el JSON. |
| Resultado esperado | La referencia en el store tras la importación tiene sourceHandle="right" y targetHandle="left". |


#### TC-I-16  importScenario acepta JSON sin handles (estilo escenario predefinido)

| Identificador | TC-I-16 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-25, RF-04 |
| CP base | — |
| Precondición | Módulo importScenario disponible. |
| Pasos | 1. Construir un JSON válido con una referencia A→B sin sourceHandle ni targetHandle. 2. Invocar importScenario con ese JSON. |
| Resultado esperado | imported=true. La referencia en el store tiene sourceHandle=undefined y targetHandle=undefined. |


#### TC-I-17  runSimulation rechaza un grafo vacío (segunda línea de defensa)

| Identificador | TC-I-17 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-14 |
| CP base | — |
| Precondición | Store inicializado con grafo vacío. |
| Pasos | 1. Invocar runSimulation. 2. Comprobar el resultado. |
| Resultado esperado | result.ran=false, result.reason="empty-graph". El simulationState no se modifica respecto al estado previo. |


#### TC-I-18  runSimulation rechaza grafo vacío también con skipRootCheck=true

| Identificador | TC-I-18 |
| --- | --- |
| Nivel | Integración |
| Herramienta | Jest |
| RF relacionados | RF-14 |
| CP base | — |
| Precondición | Store inicializado con grafo vacío. |
| Pasos | 1. Invocar runSimulation({ skipRootCheck: true }). |
| Resultado esperado | result.ran=false, result.reason="empty-graph". El guard de grafo vacío precede al chequeo de raíces. |


## 4. Pruebas end-to-end

Las pruebas end-to-end verifican la aplicación completa desde el navegador, simulando interacciones reales del usuario. Se ejecutan con Cypress sobre la aplicación desplegada en entorno de desarrollo.


#### TC-E-01  Crear objeto y verificar su aparición en el grafo

| Identificador | TC-E-01 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-01, RF-07 |
| CP base | CP-02 |
| Precondición | Aplicación cargada con escenario vacío. |
| Pasos | 1. Pulsar el botón 'Crear objeto'.2. Verificar que aparece un nuevo nodo en el área de visualización.3. Verificar que el nodo tiene estado desmarcado y activo. |
| Resultado esperado | Un nodo aparece en el grafo con la etiqueta por defecto, sin marcas visuales de raíz, marcado ni recolectado. |


#### TC-E-02  Eliminar objeto y verificar eliminación de referencias asociadas

| Identificador | TC-E-02 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-02, RF-26 |
| CP base | CP-13 |
| Precondición | Escenario con objetos A, B, C y referencias A→B, B→C. |
| Pasos | 1. Seleccionar el objeto B con clic simple.2. Pulsar el botón 'Eliminar elemento' o la tecla Delete.3. Verificar que B desaparece del grafo.4. Verificar que las referencias A→B y B→C desaparecen.5. Verificar que la notificación muestra el texto 'Objeto eliminado. También se eliminaron 2 referencias asociadas.'6. Verificar que no quedan aristas huérfanas. |
| Resultado esperado | B desaparece del grafo. Las referencias A→B y B→C desaparecen. La notificación muestra el texto exacto con el número correcto de referencias eliminadas. No quedan aristas huérfanas. |


#### TC-E-03  Editar nombre de objeto y verificar actualización visual

| Identificador | TC-E-03 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-03 |
| CP base | — |
| Precondición | Escenario con objeto A con etiqueta 'Objeto A'. |
| Pasos | 1. Seleccionar el objeto A.2. Editar la etiqueta a 'Nodo modificado'.3. Verificar la representación visual.4. Iniciar la simulación automática.5. Intentar editar la etiqueta del objeto durante la ejecución.6. Verificar que los controles de edición están deshabilitados. |
| Resultado esperado | El nodo muestra 'Nodo modificado' como etiqueta tras la edición exitosa. Durante la simulación activa, los controles de edición quedan deshabilitados y no es posible modificar el objeto. |


#### TC-E-04  Crear referencia por arrastre y por botón

| Identificador | TC-E-04 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-04, RF-07 |
| CP base | CP-10 |
| Precondición | Escenario con objetos A, B y C sin referencias. |
| Pasos | 1. Crear una referencia desde A hacia B arrastrando desde el nodo A hasta el nodo B. Verificar que aparece la arista dirigida.2. Crear una referencia desde B hacia C usando el botón 'Crear referencia': pulsar el botón, clic en B (origen), clic en C (destino). Verificar que aparece la arista dirigida.3. Crear una autorreferencia desde A hacia sí mismo arrastrando.4. Verificar que la autorreferencia A→A se representa correctamente en el grafo. |
| Resultado esperado | La referencia A→B aparece como arista dirigida al soltar el arrastre. La referencia B→C aparece tras el clic secuencial. La autorreferencia A→A se representa como arco sobre el nodo sin errores visuales. |


#### TC-E-05  Seleccionar y eliminar referencia con clic y Delete

| Identificador | TC-E-05 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-05 |
| CP base | CP-12 |
| Precondición | Escenario con A(raíz)→B→C. |
| Pasos | 1. Hacer clic simple sobre la arista B→C para seleccionarla.2. Verificar que la arista queda resaltada visualmente como seleccionada.3. Pulsar la tecla Delete o el botón 'Eliminar elemento'.4. Ejecutar la simulación completa.5. Verificar el resultado. |
| Resultado esperado | La arista B→C se resalta al seleccionarla. Tras eliminar, la referencia desaparece. Tras la simulación, C queda recolectado porque ya no es alcanzable desde la raíz. |


#### TC-E-06  Marcar y desmarcar objeto raíz y verificar diferenciación visual

| Identificador | TC-E-06 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-06, RF-07 |
| CP base | — |
| Precondición | Escenario con objetos A y B. |
| Pasos | 1. Marcar A como raíz.2. Verificar diferenciación visual de A respecto a B.3. Desmarcar A como raíz.4. Verificar que A vuelve a representación normal. |
| Resultado esperado | Al marcar: A muestra indicador visual de raíz. B no lo muestra. Al desmarcar: A vuelve a representación normal. |


#### TC-E-07  Ejecutar simulación paso a paso y verificar actualización visual

| Identificador | TC-E-07 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-10, RF-15, RF-21 |
| CP base | CP-17, CP-17B |
| Precondición | Escenario con A(raíz)→B→C. |
| Pasos | 1. Pulsar 'Siguiente paso' repetidamente.2. Verificar en cada paso el nodo resaltado, los nodos marcados y la explicación textual.3. Pulsar 'Paso anterior' para retroceder.4. Verificar que el estado visual vuelve al paso anterior. |
| Resultado esperado | Cada paso muestra correctamente el nodo en procesamiento y los ya marcados. La explicación textual es coherente con el estado visual. El retroceso restaura el estado anterior sin inconsistencias. |


#### TC-E-08  Ejecutar simulación automática con pausa, reanudación y control de velocidad

| Identificador | TC-E-08 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-11 |
| CP base | CP-21 |
| Precondición | Escenario con A(raíz)→B→C→D. |
| Pasos | 1. Ajustar el slider de velocidad a 1x.2. Pulsar 'Reproducir' y verificar que el avance entre pasos es perceptiblemente lento.3. Cambiar el slider a 10x durante la ejecución y verificar que la velocidad aumenta.4. Pulsar 'Pausa' y verificar que los controles manuales de avance y retroceso están deshabilitados durante la ejecución pero se habilitan al pausar.5. Pulsar 'Reanudar' y verificar que la simulación continúa y finaliza correctamente. |
| Resultado esperado | El slider modifica la velocidad de ejecución de forma perceptible. Los controles manuales están deshabilitados durante la ejecución automática. La simulación se pausa y reanuda correctamente conservando el estado. |


#### TC-E-09  Verificar diferenciación visual de objetos recolectados

| Identificador | TC-E-09 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-13 |
| CP base | CP-22 |
| Precondición | Escenario con A(raíz)→B, C aislado. |
| Pasos | 1. Ejecutar la simulación completa.2. Verificar la representación visual de C. |
| Resultado esperado | C aparece con opacidad reducida, borde atenuado y etiqueta de estado 'Recolectado'. A y B tienen representación normal de objetos marcados. |


#### TC-E-10  Ejecutar simulación completa y verificar resultado y registro

| Identificador | TC-E-10 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-14, RF-21, RF-22 |
| CP base | CP-09 |
| Precondición | Escenario con A(raíz)→B, C(raíz)→D, E aislado. |
| Pasos | 1. Pulsar 'Ejecutar'.2. Verificar el estado visual final.3. Verificar el registro de ejecución.4. Verificar la explicación textual del resultado. |
| Resultado esperado | A, B, C, D aparecen como marcados. E aparece como recolectado. El registro contiene todos los eventos. La explicación textual resume correctamente el resultado. |


#### TC-E-11  Activar vista tras recolección y volver a vista completa

| Identificador | TC-E-11 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-16 |
| CP base | CP-23 |
| Precondición | Simulación completada con objeto A marcado (alcanzable) y objeto B recolectado. |
| Pasos | 1. Activar la vista 'Grafo tras recolección'.2. Verificar que B desaparece visualmente.3. Desactivar la vista.4. Verificar que B vuelve a mostrarse con estado recolectado. |
| Resultado esperado | Al activar: solo A y sus conexiones son visibles. Al desactivar: B vuelve a mostrarse con representación de recolectado. El estado lógico no se ha modificado. |


#### TC-E-12  Reiniciar simulación y volver a ejecutar sobre el mismo escenario

| Identificador | TC-E-12 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-17 |
| CP base | CP-19, CP-20 |
| Precondición | Simulación completada con objetos marcados y recolectados. |
| Pasos | 1. Activar la vista 'Grafo tras recolección'.2. Pulsar 'Reiniciar simulación'.3. Verificar que el sistema vuelve automáticamente a la vista completa.4. Verificar que las marcas desaparecen pero el escenario se conserva.5. Ejecutar la simulación de nuevo.6. Verificar que el resultado es idéntico al anterior. |
| Resultado esperado | Al reiniciar con la vista activa: el sistema vuelve automáticamente a la vista completa. Tras reiniciar: ningún objeto marcado ni recolectado, objetos y referencias conservados. Tras segunda ejecución: mismo resultado que la primera. |


#### TC-E-13  Cargar escenario predefinido y verificar estado limpio

| Identificador | TC-E-13 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-18 |
| CP base | CP-26 |
| Precondición | Aplicación con simulación parcialmente ejecutada. |
| Pasos | 1. Seleccionar el escenario predefinido 'Ciclo alcanzable'.2. Verificar que el escenario se carga correctamente.3. Verificar que el estado de simulación se ha reiniciado. |
| Resultado esperado | El grafo muestra el escenario de ciclo alcanzable. No hay objetos marcados ni recolectados. phase='idle'. logs=[]. |


#### TC-E-14  Verificar que la leyenda visual está visible y es coherente

| Identificador | TC-E-14 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-20 |
| CP base | — |
| Precondición | Aplicación cargada. |
| Pasos | 1. Localizar la leyenda visual en la interfaz.2. Ejecutar una simulación parcial.3. Comparar los estados visuales del grafo con las entradas de la leyenda. |
| Resultado esperado | La leyenda es visible o accesible. Contiene entradas para objeto normal, raíz, marcado, en procesamiento, recolectado, referencia normal y referencia recorrida. Los estilos visuales del grafo coinciden con los descritos en la leyenda. |


#### TC-E-15  Exportar e importar escenario y verificar fidelidad

| Identificador | TC-E-15 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-25 |
| CP base | CP-28, CP-29 |
| Precondición | Escenario con A(raíz)→B, C aislado. |
| Pasos | 1. Exportar el escenario como JSON.2. Limpiar el escenario.3. Importar el JSON exportado.4. Verificar que el escenario importado es idéntico al original. |
| Resultado esperado | El grafo importado contiene los mismos objetos, referencias y raíces que el exportado. El estado de simulación está limpio. |


#### TC-E-16  Bloqueo de eliminación de objeto durante simulación activa

| Identificador | TC-E-16 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-02 |
| CP base | — |
| Precondición | Escenario con A(raíz)→B, simulación en ejecución automática. |
| Pasos | 1. Iniciar la simulación automática.2. Durante la ejecución, intentar seleccionar y eliminar el objeto B.3. Verificar la respuesta del sistema. |
| Resultado esperado | La eliminación queda bloqueada. Se muestra un aviso al usuario indicando que no es posible eliminar objetos durante la ejecución. B permanece en el grafo. |


#### TC-E-17  Ejecutar simulación sin raíces definidas

| Identificador | TC-E-17 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-09 |
| CP base | — |
| Precondición | Escenario con objetos A, B, C sin ninguno marcado como raíz. |
| Pasos | 1. Pulsar 'Ejecutar'.2. Verificar la respuesta del sistema antes de iniciar.3. Confirmar la ejecución.4. Verificar el estado final de todos los objetos. |
| Resultado esperado | El sistema muestra un aviso informando de que no hay raíces definidas y de que todos los objetos serán considerados inalcanzables. Tras confirmar, todos los objetos quedan recolectados (alive=false). |


#### TC-E-18  Crear referencia por arrastre desde nodo origen hasta destino

| Identificador | TC-E-18 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-04 |
| CP base | — |
| Precondición | Escenario con objetos A y B sin referencias. |
| Pasos | 1. Pasar el cursor sobre el nodo A y verificar que el cursor cambia a crosshair.2. Arrastrar desde el nodo A hasta el nodo B.3. Soltar sobre B y verificar que aparece la arista dirigida A→B. |
| Resultado esperado | El cursor cambia a crosshair al pasar sobre el nodo. Al soltar sobre B aparece una arista dirigida A→B. La referencia es navegable y funciona correctamente en la simulación. |


#### TC-E-19  Crear referencia por botón modo conexión y cancelar con Escape

| Identificador | TC-E-19 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-04 |
| CP base | — |
| Precondición | Escenario con objetos A, B y C sin referencias. |
| Pasos | 1. Pulsar el botón 'Crear referencia'. Verificar que el botón queda resaltado indicando modo conexión activo.2. Hacer clic en A (origen). Verificar indicador visual de origen seleccionado.3. Hacer clic en B (destino). Verificar que aparece la referencia A→B.4. Pulsar 'Crear referencia' de nuevo. Hacer clic en A. Pulsar Escape.5. Verificar que el modo conexión se cancela y no se crea ninguna referencia. |
| Resultado esperado | La referencia A→B se crea correctamente mediante el modo de conexión por botón. Al pulsar Escape, el modo conexión se cancela sin crear ninguna referencia. |


#### TC-E-20  Seleccionar arista por clic simple y eliminar con Delete

| Identificador | TC-E-20 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-05 |
| CP base | — |
| Precondición | Escenario con A(raíz)→B→C. |
| Pasos | 1. Hacer clic simple sobre la arista B→C.2. Verificar que la arista queda visualmente resaltada como seleccionada.3. Pulsar la tecla Delete.4. Verificar que la arista B→C desaparece del grafo.5. Verificar que A→B permanece intacta. |
| Resultado esperado | La arista B→C se resalta al seleccionarla por clic. Tras pulsar Delete, B→C desaparece. La referencia A→B no se ve afectada. |


#### TC-E-21  Ejecutar paso a paso sin haber pulsado Ejecutar previamente

| Identificador | TC-E-21 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-10 |
| CP base | — |
| Precondición | Escenario con A(raíz)→B→C. Simulación en estado idle (no iniciada). |
| Pasos | 1. Sin pulsar 'Ejecutar', pulsar directamente 'Siguiente paso'.2. Verificar que el sistema calcula los pasos y avanza al primero.3. Pulsar 'Siguiente paso' dos veces más.4. Verificar el estado visual en cada paso. |
| Resultado esperado | El sistema calcula los pasos al pulsar 'Siguiente paso' por primera vez sin necesidad de ejecutar previamente. Cada paso muestra el estado visual correcto. |


#### TC-E-22  Vista tras recolección: el botón oculta y restaura nodos recolectados

| Identificador | TC-E-22 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-16 |
| CP base | — |
| Precondición | Escenario "Múltiples raíces" cargado y simulación finalizada (phase=done). E aislado queda recolectado, A/B/C/D alcanzables. |
| Pasos | 1. Verificar que `[data-testid="btn-vista-recoleccion"]` es visible y muestra "Ver grafo tras recolección". 2. Pulsar el botón. 3. Verificar que `[data-testid="node-{idE}"]` deja de existir y el botón pasa a "Volver a vista completa". 4. Pulsar de nuevo. 5. Verificar que el nodo E vuelve a aparecer y el botón vuelve al texto inicial. |
| Resultado esperado | El botón aparece solo cuando phase=done. Al activarlo, los nodos `alive=false` desaparecen del DOM del canvas; al desactivarlo, vuelven a aparecer. El estado lógico no cambia (objects en el store siguen siendo los mismos). |
| Estado | Pendiente de implementar (ver TEST_IMPLEMENTATION_PLAN.md). |


#### TC-E-23  Bloqueo de controles de simulación con grafo vacío

| Identificador | TC-E-23 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-11, RF-14, RF-15 (criterios añadidos en SRS v1.5) |
| CP base | — |
| Precondición | Aplicación cargada con escenario vacío (`graph.objects.length === 0`). |
| Pasos | 1. Verificar que `[data-testid="btn-ejecutar"]` está `disabled`. 2. Idem `btn-paso-siguiente` y `btn-reiniciar`. 3. Crear un objeto. 4. Verificar que los tres botones quedan habilitados. 5. Limpiar el escenario. 6. Verificar que vuelven a `disabled`. |
| Resultado esperado | Con grafo vacío los tres botones permanecen deshabilitados; al añadir un objeto se habilitan; al limpiar vuelven a deshabilitarse. |
| Estado | Pendiente de implementar (ver TEST_IMPLEMENTATION_PLAN.md). |


#### TC-E-24  Drag handle dedicado: el cuerpo del nodo no mueve el nodo

| Identificador | TC-E-24 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-03 (clarificación derivada de UI_SPEC §4) |
| CP base | — |
| Precondición | Escenario con un nodo A en posición conocida. |
| Pasos | 1. Capturar la posición inicial de A en el store. 2. Realizar un drag desde el cuerpo central de A (no desde la franja superior). 3. Verificar que la posición de A en el store no ha cambiado. 4. Realizar un drag desde la franja superior (`.object-node-drag-handle`). 5. Verificar que la posición de A sí ha cambiado. |
| Resultado esperado | El cuerpo del nodo no inicia drag; la franja superior con icono ⠿ sí. |
| Estado | Pendiente de implementar (ver TEST_IMPLEMENTATION_PLAN.md). |


#### TC-E-25  Modo botón persiste sourceHandle/targetHandle por la regla right→left

| Identificador | TC-E-25 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-04 |
| CP base | — |
| Precondición | Escenario con dos objetos A y B sin referencias. |
| Pasos | 1. Pulsar `btn-crear-referencia`. 2. Hacer clic en A (origen). 3. Hacer clic en B (destino). 4. Leer la referencia resultante en el store (`__store.getState().graph.references`). |
| Resultado esperado | Se crea exactamente una referencia A→B con sourceHandle="right" y targetHandle="left". |
| Estado | Pendiente de implementar (ver TEST_IMPLEMENTATION_PLAN.md). |


#### TC-E-26  Drop al vacío en modo arrastre no crea referencia

| Identificador | TC-E-26 |
| --- | --- |
| Nivel | E2E |
| Herramienta | Cypress |
| RF relacionados | RF-04 (UI_SPEC §7.6 paso 5) |
| CP base | — |
| Precondición | Escenario con un único nodo A. |
| Pasos | 1. Realizar un drag desde el handle derecho de A hasta una zona vacía del canvas (sin nodo destino). 2. Soltar. 3. Verificar el estado del store. |
| Resultado esperado | No se crea ninguna referencia. `graph.references` sigue vacío. No se muestra ningún toast de error. |
| Estado | Pendiente de implementar (ver TEST_IMPLEMENTATION_PLAN.md). |


#### TC-E-27  onConnect (drag) persiste el lado más cercano al cursor

| Identificador | TC-E-27 |
| --- | --- |
| Nivel | E2E (puede degradarse a Integración) |
| Herramienta | Cypress |
| RF relacionados | RF-04 |
| CP base | — |
| Precondición | Escenario con A y B en posiciones conocidas que permitan un drag horizontal de A.right a B.left. |
| Pasos | 1. Realizar un drag visualmente plausible desde el handle derecho de A hasta el handle izquierdo de B. 2. Leer la referencia resultante. **Nota**: si el motor de drag de Cypress no logra disparar `onConnect` de ReactFlow de forma fiable (limitación conocida en el helper `dragNodeToNode`), el caso degrada a una prueba de integración del callback `onConnect` con un objeto Connection sintético; en ese supuesto se realiza con jest sin Cypress. |
| Resultado esperado | La referencia en el store tiene sourceHandle="right" y targetHandle="left". |
| Estado | Pendiente de implementar (ver TEST_IMPLEMENTATION_PLAN.md). |


## 5. Resumen de casos de prueba

Relación completa de los 67 casos de prueba especificados en este documento (61 implementados + 6 E2E pendientes en TEST_IMPLEMENTATION_PLAN.md):

| ID | Nivel | Nombre | RF cubiertos |
| --- | --- | --- | --- |
| TC-U-01 | Unitaria | Creación de objeto con estado inicial correcto | RF-01 |
| TC-U-02 | Unitaria | Eliminación lógica de objeto y sus referencias | RF-02 |
| TC-U-03 | Unitaria | Rechazo de referencia duplicada | RF-04 |
| TC-U-04 | Unitaria | Marcado de objeto como raíz | RF-06 |
| TC-U-05 | Unitaria | Estado inicial de simulación antes de ejecutar | RF-08 |
| TC-U-06 | Unitaria | Fase Mark: cadena lineal desde raíz | RF-09 |
| TC-U-07 | Unitaria | Fase Mark: objeto aislado sin raíz | RF-09 |
| TC-U-08 | Unitaria | Fase Mark: múltiples raíces | RF-09, RF-24 |
| TC-U-09 | Unitaria | Fase Mark: ciclo alcanzable | RF-09, RF-23 |
| TC-U-10 | Unitaria | Fase Mark: ciclo inalcanzable | RF-09, RF-23 |
| TC-U-11 | Unitaria | Fase Sweep: objetos no marcados recolectados | RF-12 |
| TC-U-12 | Unitaria | Fase Sweep: objetos marcados conservados | RF-12 |
| TC-U-13 | Unitaria | Validación: referencia a objeto inexistente | RF-19 |
| TC-U-14 | Unitaria | Fase Mark: autorreferencia A→A | RF-04, RF-09 |
| TC-I-01 | Integración | createObject actualiza el store | RF-01 |
| TC-I-02 | Integración | createReference valida y actualiza el store | RF-04 |
| TC-I-03 | Integración | Estado inicial limpio antes de simulación | RF-08 |
| TC-I-04 | Integración | stepSimulation avanza y retrocede | RF-10, RF-15 |
| TC-I-05 | Integración | runSimulation en grafo mixto | RF-14, RF-24 |
| TC-I-06 | Integración | resetSimulation conserva escenario | RF-17 |
| TC-I-07 | Integración | graphValidator detecta inconsistencias | RF-19 |
| TC-I-08 | Integración | Registro de ejecución completo | RF-22 |
| TC-I-09 | Integración | exportScenario genera JSON válido | RF-25 |
| TC-I-10 | Integración | importScenario rechaza JSON inconsistente | RF-25, RF-19 |
| TC-E-01 | E2E | Crear objeto y verificar en grafo | RF-01, RF-07 |
| TC-E-02 | E2E | Eliminar objeto y verificar toast con texto exacto | RF-02, RF-26 |
| TC-E-03 | E2E | Editar objeto y bloqueo durante simulación | RF-03 |
| TC-E-04 | E2E | Crear referencia por arrastre y por botón | RF-04, RF-07 |
| TC-E-05 | E2E | Seleccionar y eliminar referencia con clic y Delete | RF-05 |
| TC-E-06 | E2E | Marcar y desmarcar objeto raíz | RF-06, RF-07 |
| TC-E-07 | E2E | Simulación paso a paso con retroceso | RF-10, RF-15, RF-21 |
| TC-E-08 | E2E | Simulación automática con pausa y control de velocidad | RF-11 |
| TC-E-09 | E2E | Diferenciación visual de recolectados | RF-13 |
| TC-E-10 | E2E | Simulación completa: resultado y registro | RF-14, RF-21, RF-22 |
| TC-E-11 | E2E | Vista tras recolección y retorno | RF-16 |
| TC-E-12 | E2E | Reiniciar con vista activa y volver a ejecutar | RF-17 |
| TC-E-13 | E2E | Cargar escenario predefinido | RF-18 |
| TC-E-14 | E2E | Leyenda visual coherente | RF-20 |
| TC-E-15 | E2E | Exportar e importar escenario | RF-25 |
| TC-E-16 | E2E | Bloqueo de eliminación durante simulación activa | RF-02, RF-26 |
| TC-E-17 | E2E | Ejecutar simulación sin raíces definidas | RF-09, RF-26 |
| TC-E-18 | E2E | Crear referencia por arrastre | RF-04 |
| TC-E-19 | E2E | Crear referencia por botón y cancelar con Escape | RF-04 |
| TC-E-20 | E2E | Seleccionar arista por clic y eliminar con Delete | RF-05 |
| TC-E-21 | E2E | Paso a paso sin haber pulsado Ejecutar | RF-10 |
| TC-U-15 | Unitaria | findFreePosition: dentro de bounds | RF-01 (apoyo) |
| TC-U-16 | Unitaria | findFreePosition: determinismo con random inyectado | RF-01 (apoyo) |
| TC-U-17 | Unitaria | findFreePosition: respeta origen no nulo | RF-01 (apoyo) |
| TC-U-18 | Unitaria | findFreePosition: no solape con un nodo | RF-01 (apoyo) |
| TC-U-19 | Unitaria | findFreePosition: fallback tile-scan | RF-01 (apoyo) |
| TC-U-20 | Unitaria | findFreePosition: dos llamadas no solapan | RF-01 (apoyo) |
| TC-U-21 | Unitaria | findFreePosition: bounds por defecto | RF-01 (apoyo) |
| TC-U-22 | Unitaria | Factory MemoryReference por defecto sin handles | RF-04 |
| TC-U-23 | Unitaria | Factory MemoryReference acepta dos handles | RF-04 |
| TC-U-24 | Unitaria | Factory MemoryReference acepta solo uno | RF-04 |
| TC-I-11 | Integración | createReference persiste handles | RF-04 |
| TC-I-12 | Integración | createReference sin handles por defecto | RF-04 |
| TC-I-13 | Integración | exportScenario incluye handles cuando existen | RF-25, RF-04 |
| TC-I-14 | Integración | exportScenario omite handles cuando no existen | RF-25, RF-04 |
| TC-I-15 | Integración | Round-trip preserva handles | RF-25, RF-04 |
| TC-I-16 | Integración | importScenario acepta JSON sin handles | RF-25, RF-04 |
| TC-I-17 | Integración | runSimulation rechaza grafo vacío | RF-14 |
| TC-I-18 | Integración | runSimulation rechaza grafo vacío con skipRootCheck | RF-14 |
| TC-E-22 | E2E | Vista tras recolección — botón oculta/restaura nodos | RF-16 |
| TC-E-23 | E2E | Bloqueo de controles con grafo vacío | RF-11, RF-14, RF-15 |
| TC-E-24 | E2E | Drag handle dedicado: cuerpo del nodo no mueve | RF-03 |
| TC-E-25 | E2E | Modo botón persiste sourceHandle="right"/targetHandle="left" | RF-04 |
| TC-E-26 | E2E | Drop al vacío en arrastre no crea referencia | RF-04 |
| TC-E-27 | E2E (o integración) | onConnect persiste el lado más cercano al cursor | RF-04 |
