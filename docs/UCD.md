# GC Visualizer — Use Case Document (UCD v1.5)

Referencia: SRS GC Visualizer v1.5


### Historial de revisiones

| Versión | Fecha | Descripción | Autor |
| --- | --- | --- | --- |
| 1.0 | 04/05/2026 | Versión inicial. Alineado con SRS GC Visualizer v1.2. Incluye revisión cruzada RF↔CU previa a la generación. | — |
| 1.1 | 04/05/2026 | Correcciones derivadas del informe VAL-UCD-v1.0 (H-01 a H-08). Actualización de CU-02, CU-04, CU-07, CU-08, CU-09, CU-10, CU-11, CU-15 y matriz. | — |
| 1.2 | 04/05/2026 | Correcciones derivadas del informe VAL2-UCD-v1.1 (H2-01 a H2-04). Actualización de CU-09, CU-11, sección 1.4 y matriz de trazabilidad. | — |
| 1.4 | 05/05/2026 | Correcciones VAL-UCD-v1.3 (H-01 a H-06). Eliminado TFM de portada. Actualizada referencia SRS v1.2→v1.4. CU-02 flujo principal renombrado a esquema estándar. CU-04 precondición ampliada. CU-07 FA-07A añadida referencia RF-26. CU-09 paso 1 reformulado como opcional. CU-12 con 5 escenarios concretos. | — |
| 1.5 | 12/05/2026 | Alineado con SRS v1.5 (handles laterales en RF-04, guard de grafo vacío en RF-11/14/15). CU-02 añade FA-02E (drop fuera de nodo no crea referencia) y precisa el método principal con resolución de lado por proximidad y la regla right→left del modo botón. CU-07/CU-08/CU-09/CU-10 actualizados: precondición "el escenario contiene al menos un objeto" y FA correspondiente para el guard de grafo vacío. Referencias internas a SRS actualizadas a v1.5. | — |


## 1. Introducción


### 1.1 Propósito del documento

El presente documento recoge los casos de uso del sistema GC Visualizer, describiendo las interacciones entre el actor principal y el sistema para cada funcionalidad definida en el SRS GC Visualizer v1.5. Su objetivo es proporcionar una vista comportamental del sistema complementaria a la vista de requisitos del SRS.

Este documento ha sido generado tras una revisión cruzada sistemática entre los casos de uso originales y el SRS v1.5, incorporando los ajustes necesarios para garantizar la trazabilidad y coherencia entre ambos documentos.


### 1.2 Ámbito

El documento cubre las 15 interacciones principales del sistema GC Visualizer, organizadas en cuatro bloques funcionales: gestión del escenario, ejecución de la simulación, visualización y gestión de escenarios persistentes.


### 1.3 Actor del sistema

El sistema tiene un único actor: el usuario final, que puede ser estudiante, docente o profesional interesado en comprender el funcionamiento del recolector de basura de JavaScript. No se contemplan actores secundarios ni sistemas externos.


### 1.4 Relación con el SRS

Cada caso de uso referencia los requisitos funcionales del SRS v1.5 que ejercita. La trazabilidad es bidireccional: todo RF del SRS tiene al menos un CU que lo ejercita, y todo CU tiene al menos un RF de respaldo.

Cuatro requisitos del SRS no tienen caso de uso propio por las siguientes razones justificadas, que no constituyen una omisión sino una decisión de diseño del documento:

RF-13 (Visualización del barrido): funcionalidad activada automáticamente como parte de CU-07 (ejecución completa) y CU-09 (ejecución automática), sin acción de usuario independiente.

RF-20 (Leyenda visual): funcionalidad pasiva siempre visible, no requiere acción de usuario.

RF-23 (Soporte para ciclos): propiedad del algoritmo verificable mediante casos de prueba, no mediante casos de uso.

RF-24 (Soporte para múltiples raíces): ídem RF-23.


### 1.5 Convenciones del documento

Cada caso de uso se presenta en formato tabla estructurada con los siguientes campos:

| Campo | Descripción |
| --- | --- |
| Identificador | Código único del caso de uso (CU-XX). |
| Nombre | Nombre descriptivo de la interacción. |
| Actor | Siempre: Usuario. |
| Precondición | Estado del sistema necesario para que el CU pueda iniciarse. |
| Flujo principal | Secuencia normal de pasos cuando todo va bien. |
| Flujos alternativos | Variaciones o situaciones de error contempladas. |
| Postcondición | Estado del sistema tras la ejecución correcta del CU. |
| RF relacionados | Requisitos funcionales del SRS v1.5 que este CU ejercita. |


## 2. Matriz de trazabilidad RF ↔ CU

La siguiente tabla muestra la cobertura bidireccional entre los requisitos funcionales del SRS v1.5 y los casos de uso de este documento.

| RF | Nombre | Casos de uso |
| --- | --- | --- |
| RF-01 | Representación de objetos | CU-01 |
| RF-02 | Eliminación de objetos | CU-05 |
| RF-03 | Edición de objetos | CU-04 |
| RF-04 | Representación de referencias | CU-02 |
| RF-05 | Eliminación de referencias | CU-06 |
| RF-06 | Gestión de raíces | CU-03 |
| RF-07 | Visualización del grafo | CU-01, CU-02, CU-03, CU-04 |
| RF-08 | Estado inicial de simulación | CU-07 |
| RF-09 | Ejecución fase Mark | CU-07 |
| RF-10 | Visualización paso a paso | CU-08 |
| RF-11 | Ejecución automática | CU-09 |
| RF-12 | Ejecución fase Sweep | CU-07 |
| RF-13 | Visualización del barrido | CU-07, CU-09 |
| RF-14 | Ejecución completa | CU-07, CU-09 |
| RF-15 | Ejecución paso a paso global | CU-08, CU-09 |
| RF-16 | Vista tras recolección | CU-11 |
| RF-17 | Reinicio de simulación | CU-08, CU-10, CU-13 |
| RF-18 | Escenarios predefinidos | CU-12 |
| RF-19 | Validación de consistencia | CU-01, CU-02, CU-05, CU-07, CU-09, CU-15 |
| RF-20 | Leyenda visual | Funcionalidad pasiva — sin CU propio |
| RF-21 | Explicación textual | CU-07, CU-08 |
| RF-22 | Registro de ejecución | CU-07, CU-08 |
| RF-23 | Soporte para ciclos | Propiedad del algoritmo — sin CU propio |
| RF-24 | Soporte para múltiples raíces | Propiedad del algoritmo — sin CU propio |
| RF-25 | Gestión reutilizable de escenarios | CU-14, CU-15 |
| RF-26 | Sistema de notificaciones | CU-02, CU-04, CU-05, CU-06, CU-07, CU-09 — RF transversal implementado como comportamiento reactivo de los CU existentes |


## 3. Casos de uso


### 3.1 Gestión del escenario


#### CU-01 — Crear objeto

| Identificador | CU-01 |
| --- | --- |
| Nombre | Crear objeto |
| Actor | Usuario |
| Precondición | La aplicación está cargada. |
| Flujo principal | 1. El usuario selecciona la opción 'Crear objeto'.2. El sistema crea un nuevo objeto con identificador único, etiqueta por defecto, estado desmarcado y activo.3. El sistema muestra el nuevo objeto como nodo en el grafo. |
| Flujos alternativos | FA-01A: Si el escenario ya contiene objetos con identificadores en conflicto, el sistema resuelve el conflicto automáticamente antes de crear el nuevo objeto (RF-19). |
| Postcondición | El objeto queda disponible en el escenario y visible en el grafo. |
| RF relacionados | RF-01, RF-07, RF-19 |


#### CU-02 — Crear referencia

| Identificador | CU-02 |
| --- | --- |
| Nombre | Crear referencia |
| Actor | Usuario |
| Precondición | Existen al menos dos objetos en el escenario. |
| Flujo principal | El método principal de creación es por arrastre. El método alternativo se describe en FA-02A.1. El usuario sitúa el cursor sobre uno de los dos handles laterales del nodo origen (lateral izquierdo o derecho). El cursor cambia a crosshair indicando que puede iniciar una conexión.2. El usuario arrastra desde el handle del nodo origen hasta un handle del nodo destino. El sistema resuelve el lado de anclaje en cada extremo por proximidad al cursor en el momento del drop.3. El sistema crea una referencia dirigida entre ambos objetos y persiste los handles utilizados (`sourceHandle`, `targetHandle`) para que el anclaje lateral se mantenga al re-renderizar.4. La referencia se muestra visualmente en el grafo. |
| Flujos alternativos | FA-02A: Método alternativo por botón — El usuario pulsa 'Crear referencia', hace clic en el nodo origen y luego en el nodo destino. En este modo se aplica la regla fija de anclaje source=right, target=left (el usuario no elige el lado). El modo conexión puede cancelarse en cualquier momento pulsando Escape (RF-04).FA-02B: Si ya existe una referencia idéntica entre el mismo origen y destino, el sistema no la crea y muestra una notificación de error al usuario (RF-04, RF-26).FA-02C: Si el objeto destino no es válido o no existe, la operación se cancela (RF-04, RF-19).FA-02D: Si el origen y el destino son el mismo objeto, el sistema crea la autorreferencia y la representa correctamente como arco sobre el nodo (RF-04).FA-02E: Si el usuario suelta el arrastre fuera de cualquier handle (zona vacía del canvas o cuerpo central de un nodo), la línea de conexión provisional desaparece sin crear referencia y sin mostrar notificación de error (RF-04). |
| Postcondición | Ambos objetos quedan conectados mediante una referencia dirigida válida. En caso de cancelación (FA-02B, FA-02C), el escenario no sufre modificaciones y el grafo permanece en el estado previo a la operación. |
| RF relacionados | RF-04, RF-07, RF-19, RF-26 |


#### CU-03 — Marcar objeto raíz

| Identificador | CU-03 |
| --- | --- |
| Nombre | Marcar objeto raíz |
| Actor | Usuario |
| Precondición | Existe al menos un objeto en el escenario. |
| Flujo principal | 1. El usuario selecciona un objeto.2. El usuario activa la opción 'Marcar como raíz'.3. El sistema actualiza el estado del objeto.4. La interfaz resalta el objeto como raíz. |
| Flujos alternativos | FA-03A: El usuario puede desmarcar un objeto raíz siguiendo el mismo flujo y desactivando la opción (RF-06). |
| Postcondición | El objeto seleccionado queda incluido en el conjunto de raíces y se identifica correctamente como objeto raíz en la simulación. |
| RF relacionados | RF-06, RF-07 |


#### CU-04 — Editar objeto

| Identificador | CU-04 |
| --- | --- |
| Nombre | Editar objeto |
| Actor | Usuario |
| Precondición | Existe al menos un objeto en el escenario. Si la simulación está en ejecución o pausada, los controles de edición estarán deshabilitados (ver FA-04A). |
| Flujo principal | 1a. Edición de etiqueta: el usuario hace doble clic sobre el nodo en el canvas. La etiqueta se convierte en un campo de texto inline con el valor actual seleccionado.1b. El usuario modifica el texto y pulsa Enter o hace clic fuera para confirmar. El sistema actualiza el label del objeto de forma inmediata.2. Edición de posición: el usuario arrastra el nodo por el canvas. La nueva posición persiste al re-renderizar.3. La condición de raíz se gestiona exclusivamente mediante el botón 'Marcar como raíz' (CU-03), no desde esta edición. |
| Flujos alternativos | FA-04A: Si la simulación está en ejecución o pausada, los controles de edición quedan deshabilitados. Se muestra una notificación de error al usuario. El usuario debe finalizar o reiniciar la simulación antes de editar (RF-03, RF-26).FA-04B: Si el usuario pulsa Escape durante la edición inline, se cancela sin guardar cambios. |
| Postcondición | El objeto refleja los atributos modificados en el escenario y en el grafo. |
| RF relacionados | RF-03, RF-07, RF-26 |


#### CU-05 — Eliminar objeto

| Identificador | CU-05 |
| --- | --- |
| Nombre | Eliminar objeto |
| Actor | Usuario |
| Precondición | Existe al menos un objeto en el escenario. |
| Flujo principal | 1. El usuario selecciona un objeto mediante clic simple.2. El usuario pulsa el botón 'Eliminar elemento' o las teclas Delete/Backspace.3. El sistema elimina el objeto y todas sus referencias entrantes y salientes.4. Si el objeto era raíz, se elimina del conjunto de raíces.5. El sistema muestra una notificación informativa: 'Objeto eliminado. También se eliminaron N referencias asociadas.' donde N es el número real de referencias eliminadas (RF-26).6. La interfaz actualiza el grafo. |
| Flujos alternativos | FA-05A: Si la simulación está en ejecución o pausada, la eliminación queda bloqueada. Se muestra una notificación de error al usuario (RF-02, RF-26).FA-05B: Si no hay ningún elemento seleccionado al pulsar 'Eliminar elemento', se muestra una notificación de aviso: 'Selecciona primero un objeto o referencia' (RF-26). |
| Postcondición | El objeto y sus referencias asociadas desaparecen del escenario. No quedan referencias colgantes. |
| RF relacionados | RF-02, RF-19, RF-26 |


#### CU-06 — Eliminar referencia

| Identificador | CU-06 |
| --- | --- |
| Nombre | Eliminar referencia |
| Actor | Usuario |
| Precondición | Existe al menos una referencia entre objetos. |
| Flujo principal | 1. El usuario hace clic simple sobre una arista en el canvas para seleccionarla. La arista seleccionada se resalta visualmente.2. El usuario pulsa el botón 'Eliminar elemento' o las teclas Delete/Backspace.3. El sistema elimina la referencia.4. La interfaz actualiza el grafo. |
| Flujos alternativos | FA-06A: Si la simulación está en ejecución o pausada, la eliminación queda bloqueada. Se muestra una notificación de error (RF-26).FA-06B: Si no hay ningún elemento seleccionado al pulsar 'Eliminar elemento', se muestra una notificación de aviso (RF-26). |
| Postcondición | La conexión eliminada deja de afectar a la alcanzabilidad del grafo. |
| RF relacionados | RF-05, RF-26 |


### 3.2 Ejecución de la simulación


#### CU-07 — Ejecutar simulación completa

| Identificador | CU-07 |
| --- | --- |
| Nombre | Ejecutar simulación completa |
| Actor | Usuario |
| Precondición | Existe un escenario válido cargado o creado y el grafo contiene al menos un objeto. Con grafo vacío el botón 'Ejecutar' permanece deshabilitado (RF-14). |
| Flujo principal | 1. El usuario pulsa 'Ejecutar'.2. El sistema prepara el estado inicial de simulación: todos los objetos desmarcados y activos.3. El sistema ejecuta la fase Mark: recorre el grafo desde todas las raíces y marca los objetos alcanzables.4. El sistema ejecuta la fase Sweep: identifica los objetos no marcados y los marca como recolectados.5. La interfaz muestra el resultado: objetos marcados (alcanzables) y objetos recolectados diferenciados visualmente.6. El registro de ejecución recoge todos los eventos producidos.7. La explicación textual resume el resultado final. |
| Flujos alternativos | FA-07A: Si no existen raíces definidas, el sistema muestra un diálogo de confirmación informando de que todos los objetos serán considerados inalcanzables y permite continuar. En la fase Sweep, todos los objetos quedan recolectados (RF-09, RF-26).FA-07B: Si el grafo no contiene objetos, el botón 'Ejecutar' permanece deshabilitado y el sistema rechaza la operación sin modificar el estado (segunda línea de defensa en el caso de uso, RF-14).FA-07C: Si existe una inconsistencia estructural, el sistema bloquea la ejecución hasta su corrección (RF-19). |
| Postcondición | La simulación finaliza y el resultado del algoritmo queda representado visualmente. |
| RF relacionados | RF-08, RF-09, RF-12, RF-13, RF-14, RF-19, RF-21, RF-22 |


#### CU-08 — Ejecutar simulación paso a paso

| Identificador | CU-08 |
| --- | --- |
| Nombre | Ejecutar simulación paso a paso |
| Actor | Usuario |
| Precondición | Existe un escenario válido cargado o creado y el grafo contiene al menos un objeto. Con grafo vacío el botón 'Paso siguiente' permanece deshabilitado (RF-15). |
| Flujo principal | 1. El usuario pulsa 'Siguiente paso'.2. Si no existen pasos precalculados, el sistema los calcula en ese momento invocando el algoritmo.3. El sistema avanza una transición del algoritmo.4. La interfaz actualiza el estado visual: nodo actual, nodos marcados, referencias recorridas.5. El sistema muestra la explicación textual y el registro correspondientes al paso.6. El usuario repite la acción hasta finalizar la simulación. |
| Flujos alternativos | FA-08A: El usuario puede retroceder al paso anterior pulsando 'Paso anterior'. El sistema restaura el estado visual sin inconsistencias. Si está en el primer paso, 'Paso anterior' queda deshabilitado (RF-15).FA-08B: Al pulsar 'Reiniciar', el sistema vuelve al paso inicial conservando el escenario (RF-17).FA-08C: Si el grafo no contiene objetos, los botones 'Paso siguiente' y 'Reiniciar' permanecen deshabilitados (RF-15). |
| Postcondición | El sistema avanza un paso en la simulación y muestra el estado actualizado. La simulación puede estar en curso o haber finalizado dependiendo del paso alcanzado. |
| RF relacionados | RF-10, RF-15, RF-17, RF-21, RF-22 |


#### CU-09 — Ejecutar simulación automática

| Identificador | CU-09 |
| --- | --- |
| Nombre | Ejecutar simulación automática |
| Actor | Usuario |
| Precondición | Existe un escenario válido cargado o creado y el grafo contiene al menos un objeto. Con grafo vacío el botón 'Ejecutar' permanece deshabilitado (RF-11). |
| Flujo principal | 1. Opcionalmente, el usuario puede ajustar la velocidad de ejecución mediante el slider (1x a 10x). Si no se modifica, la velocidad por defecto es 5x.2. El usuario pulsa 'Reproducir'.3. El sistema avanza automáticamente por los pasos del algoritmo con un delay real entre pasos determinado por la velocidad (delay = 1000ms / velocidad).4. La interfaz muestra los cambios visuales en cada paso.5. Mientras la ejecución automática está activa, los controles de avance y retroceso manual quedan deshabilitados.6. La simulación finaliza mostrando el resultado completo. |
| Flujos alternativos | FA-09A: El usuario puede pausar la ejecución en cualquier momento. El sistema conserva el estado actual hasta la reanudación (RF-11).FA-09B: El usuario puede cambiar la velocidad durante la ejecución. El cambio surte efecto en el paso siguiente (RF-11).FA-09C: Tras pausar, el usuario puede reanudar la ejecución automática o cambiar al modo paso a paso (RF-11, RF-15).FA-09D: Si no existe un escenario válido, el sistema impide el inicio y muestra un aviso (RF-19, RF-26).FA-09E: Si el grafo no contiene objetos, el botón 'Ejecutar' permanece deshabilitado y la ejecución automática no puede iniciarse (RF-11). |
| Postcondición | El algoritmo se completa y se muestran los objetos marcados (alcanzables) y los objetos recolectados. |
| RF relacionados | RF-11, RF-13, RF-14, RF-15, RF-19, RF-26 |


#### CU-10 — Reiniciar simulación

| Identificador | CU-10 |
| --- | --- |
| Nombre | Reiniciar simulación |
| Actor | Usuario |
| Precondición | Existe un escenario cargado o creado y el grafo contiene al menos un objeto. Con grafo vacío el botón 'Reiniciar' permanece deshabilitado. |
| Flujo principal | 1. El usuario pulsa 'Reiniciar simulación'.2. El sistema elimina las marcas, estados recolectados, pasos, recorrido y logs de ejecución.3. El sistema conserva los objetos, referencias y raíces definidos por el usuario.4. La interfaz muestra el escenario en estado inicial de simulación. |
| Flujos alternativos | FA-10A: Si la vista 'grafo tras recolección' estaba activa, el sistema vuelve automáticamente a la vista completa antes de reiniciar (RF-17).FA-10B: Si el grafo no contiene objetos, el botón 'Reiniciar' permanece deshabilitado (no hay estado de simulación que reiniciar). |
| Postcondición | El escenario queda listo para una nueva ejecución. No quedan marcas ni estados residuales. El sistema queda en disposición de ejecutar Mark & Sweep nuevamente sobre el mismo escenario. |
| RF relacionados | RF-17 |


### 3.3 Visualización


#### CU-11 — Visualizar grafo tras recolección

| Identificador | CU-11 |
| --- | --- |
| Nombre | Visualizar grafo tras recolección |
| Actor | Usuario |
| Precondición | La simulación ha finalizado completamente mediante CU-07 (ejecución completa) o CU-09 (ejecución automática). |
| Flujo principal | 1. El usuario activa la vista 'Grafo tras recolección'.2. El sistema oculta visualmente los objetos recolectados y sus referencias.3. La interfaz muestra únicamente los objetos marcados (alcanzables) y sus conexiones válidas. |
| Flujos alternativos | FA-11A: El usuario puede volver a la vista completa en cualquier momento. El sistema restaura la visualización del estado final completo mostrando los objetos recolectados con su estado correspondiente (RF-16). |
| Postcondición | El usuario puede alternar entre la vista completa y la vista simplificada sin modificar el estado lógico de la simulación. |
| RF relacionados | RF-16 |


### 3.4 Gestión de escenarios


#### CU-12 — Cargar escenario predefinido

| Identificador | CU-12 |
| --- | --- |
| Nombre | Cargar escenario predefinido |
| Actor | Usuario |
| Precondición | La aplicación está iniciada. Escenarios disponibles: Cadena lineal, Ciclo alcanzable, Ciclo inalcanzable, Múltiples raíces, Sin raíces. |
| Flujo principal | 1. El usuario selecciona uno de los cinco escenarios predefinidos del dropdown: Cadena lineal, Ciclo alcanzable, Ciclo inalcanzable, Múltiples raíces o Sin raíces.2. El sistema carga los objetos, referencias y raíces del escenario seleccionado.3. El sistema reinicia automáticamente el estado de la simulación, incluyendo marcas, logs y pasos.4. La interfaz muestra el grafo cargado.5. El sistema queda preparado para editar o ejecutar la simulación. |
| Flujos alternativos |  |
| Postcondición | El escenario seleccionado queda disponible en la aplicación con el estado de simulación limpio. |
| RF relacionados | RF-18 |


#### CU-13 — Limpiar escenario

| Identificador | CU-13 |
| --- | --- |
| Nombre | Limpiar escenario |
| Actor | Usuario |
| Precondición | Existe un escenario cargado o creado. |
| Flujo principal | 1. El usuario pulsa 'Limpiar escenario'.2. El sistema elimina todos los objetos, referencias y raíces.3. La interfaz muestra el lienzo vacío. |
| Flujos alternativos |  |
| Postcondición | El escenario queda completamente vacío. |
| RF relacionados | RF-17 |


#### CU-14 — Exportar escenario

| Identificador | CU-14 |
| --- | --- |
| Nombre | Exportar escenario |
| Actor | Usuario |
| Precondición | Existe un escenario creado o cargado. |
| Flujo principal | 1. El usuario selecciona 'Exportar escenario'.2. El sistema genera un archivo JSON con los objetos, referencias y raíces del escenario.3. El usuario guarda el archivo en su sistema de archivos local. |
| Flujos alternativos |  |
| Postcondición | El escenario queda disponible como archivo JSON para su reutilización posterior. |
| RF relacionados | RF-25 |


#### CU-15 — Importar escenario

| Identificador | CU-15 |
| --- | --- |
| Nombre | Importar escenario |
| Actor | Usuario |
| Precondición | El usuario dispone de un archivo JSON con la estructura de escenario válida. |
| Flujo principal | 1. El usuario selecciona 'Importar escenario'.2. El usuario carga un archivo JSON desde su sistema de archivos.3. El sistema valida el contenido del archivo.4. El sistema reconstruye objetos, referencias y raíces.5. El sistema reinicia automáticamente el estado de la simulación, incluyendo marcas, logs y pasos.6. La interfaz muestra el escenario importado. |
| Flujos alternativos | FA-15A: Si el archivo no tiene formato JSON válido, el sistema rechaza la importación y muestra un aviso (RF-25).FA-15B: Si faltan datos obligatorios en el JSON, la importación se cancela y se muestra un aviso (RF-25).FA-15C: Si el JSON contiene referencias a objetos inexistentes, el sistema rechaza la importación y muestra un aviso (RF-25, RF-19).FA-15D: Si el JSON contiene identificadores duplicados, el sistema rechaza la importación y muestra un aviso (RF-25, RF-19). |
| Postcondición | El escenario importado queda disponible para edición o simulación con el estado de simulación limpio. |
| RF relacionados | RF-25, RF-19 |
