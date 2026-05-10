# GC Visualizer — Software Requirements Specification (SRS v1.2)


### Historial de revisiones

| Versión | Fecha | Descripción | Autor |
| --- | --- | --- | --- |
| 1.0 | 04/05/2026 | Versión inicial del documento SRS. | — |
| 1.1 | 04/05/2026 | Correcciones derivadas del informe VAL-SRS-v1.0 (H-01 a H-12). Actualización de RF-02, RF-09, RF-11, RF-13, RF-15, RF-17, RF-18, RF-19, RF-25, RNF-03 y Apéndice A. | — |
| 1.2 | 04/05/2026 | Correcciones derivadas del informe VAL2-SRS-v1.1 (H2-01 a H2-04). Actualización de RF-03, RF-09, RF-12 y sección 1.3. | — |
| 1.4 | 05/05/2026 | Correcciones VAL-SRS-v1.3 (H-01 a H-07). Eliminadas referencias académicas. Sustituido 'Segunda iteración' por 'Segunda versión' en historial. Añadido texto exacto toast en RF-26. Eliminado 'superviviente' de RF-13 y RF-16. Alineados escenarios RF-18 con UI_SPEC. Actualizado RI-10 con referencia a RF-26. Añadida nota de impacto en documentos relacionados. | — |
| 1.5 | 10/05/2026 | Ajustes derivados de la sesión de bugfix/mejoras. RF-04 reescrito: dos handles laterales (left/right) sustituyen al "nodo completo como punto de conexión", con resolución por proximidad en arrastre y regla right→left en modo botón. RI-04 actualizado en consecuencia. RF-11, RF-14 y RF-15 amplían criterios de aceptación con la condición "grafo no vacío" para habilitar Ejecutar / Paso siguiente / Reiniciar. RF-25 anota campos opcionales `sourceHandle` / `targetHandle` en `references[]` del JSON. | — |


## 1. Introducción


### 1.1 Propósito del documento

El presente documento constituye la Especificación de Requisitos del Software (SRS) del proyecto GC Visualizer. Su objetivo es describir de forma completa, precisa y verificable los requisitos funcionales, no funcionales y de interfaz que debe satisfacer el sistema, siguiendo el estándar IEEE 29148:2018.

Este documento sirve como referencia principal para el desarrollo, la verificación y la validación del proyecto. Los requisitos aquí recogidos definen el comportamiento esperado del sistema y constituyen la base para la planificación de pruebas.

Nota de impacto en documentos relacionados: la versión 1.3 del SRS requiere actualización de los siguientes documentos: UCD (CU-02, incorporar los dos métodos de creación de referencias de RF-04), SDD (implementación de onNodesChange en el store para satisfacer RF-03), STS (nuevos casos de prueba para RF-03, RF-04, RF-05, RF-10, RF-11 y RF-26).


### 1.2 Ámbito del sistema

comprensión del algoritmo Mark & Sweep, mecanismo central del recolector de basura empleado en motores de ejecución de JavaScript como V8.

El sistema permite al usuario construir escenarios de memoria simulada mediante grafos dirigidos, ejecutar el algoritmo de forma completa o paso a paso, y observar visualmente cómo se determinan los objetos alcanzables y cuáles son candidatos a recolección.

El sistema no pretende simular el comportamiento exacto de ningún motor JavaScript real, ni implementar optimizaciones avanzadas como recolección generacional, compactación de memoria o write barriers.


### 1.3 Definiciones, acrónimos y abreviaturas

| Término / Acrónimo | Definición |
| --- | --- |
| GC | Garbage Collector — Recolector de basura. |
| Mark & Sweep | Algoritmo de recolección de basura basado en dos fases: marcado de objetos alcanzables y barrido de objetos no marcados. |
| Heap | Zona de memoria dinámica donde se almacenan los objetos en ejecución. |
| Objeto raíz (Root) | Término canónico. Véase definición completa en el Apéndice A. Sinónimos aceptados: 'nodo raíz', 'raíz'. El conjunto de todos los objetos raíz se denomina 'conjunto de raíces'. |
| Alcanzabilidad | Propiedad de un objeto que puede ser accedido directamente o transitivamente desde al menos una raíz. |
| Nodo | Representación visual de un objeto de memoria en el grafo. |
| Arista | Representación visual de una referencia dirigida entre dos objetos. |
| SRS | Software Requirements Specification — Especificación de Requisitos del Software. |
| RF | Requisito Funcional. |
| RNF | Requisito No Funcional. |
| RI | Requisito de Interfaz. |
| IEEE | Institute of Electrical and Electronics Engineers. |


### 1.4 Referencias

IEEE Std 29148-2018 — Systems and Software Engineering — Life Cycle Processes — Requirements Engineering.

IEEE Std 830-1998 — Recommended Practice for Software Requirements Specifications.

ECMAScript 2023 Language Specification (ECMA-262). Ecma International.

Jones, R. & Lins, R. (1996). Garbage Collection: Algorithms for Automatic Dynamic Memory Management. Wiley.

React Documentation (v18). Meta Open Source. https://react.dev

TypeScript Handbook. Microsoft. https://www.typescriptlang.org/docs

Vite Documentation. https://vitejs.dev

Tailwind CSS Documentation. https://tailwindcss.com/docs

Jest Documentation. https://jestjs.io/docs

Cypress Documentation. https://docs.cypress.io


### 1.5 Visión general del documento

El presente documento se organiza en los siguientes apartados:

| Sección | Contenido |
| --- | --- |
| Sección 1 | Introducción, propósito, ámbito, glosario y referencias. |
| Sección 2 | Descripción general del sistema: perspectiva, funciones principales, usuarios y restricciones. |
| Sección 3 | Requisitos funcionales detallados con criterios de aceptación. |
| Sección 4 | Requisitos de interfaz de usuario. |
| Sección 5 | Requisitos no funcionales y atributos de calidad. |
| Apéndice A | Glosario ampliado de términos del dominio. |


## 2. Descripción general


### 2.1 Perspectiva del producto

GC Visualizer es un sistema software autónomo de naturaleza web, sin dependencias de sistemas externos en tiempo de ejecución. No forma parte de un sistema mayor ni requiere integración con servicios de terceros.

La aplicación se ejecuta íntegramente en el navegador del usuario. La persistencia de escenarios se realiza mediante exportación e importación de archivos JSON en el sistema de archivos local del usuario, sin necesidad de servidor backend ni base de datos.


### 2.2 Funciones principales del producto

El sistema proporciona las siguientes funcionalidades de alto nivel:

Construcción interactiva de escenarios de memoria simulada mediante grafos dirigidos.

Definición de objetos, referencias entre objetos y objetos raíz.

Ejecución del algoritmo Mark & Sweep de forma completa, paso a paso o automática.

Visualización diferenciada de los estados de los objetos durante la simulación.

Navegación hacia adelante y hacia atrás entre los pasos de la simulación.

Registro secuencial de eventos de ejecución y explicaciones didácticas.

Carga de escenarios predefinidos para ilustrar comportamientos específicos.

Exportación e importación de escenarios en formato JSON.

Visualización del grafo resultante tras la fase de recolección.


### 2.3 Características de los usuarios

El sistema está dirigido a un único tipo de usuario final:

Estudiante, docente o profesional interesado en comprender el funcionamiento del recolector de basura de JavaScript.

Este usuario puede no poseer conocimientos avanzados de sistemas de gestión de memoria. La herramienta debe poder utilizarse sin formación técnica previa, apoyándose en los elementos didácticos integrados en la propia interfaz.


### 2.4 Supuestos y dependencias


#### 2.4.1 Supuestos

La simulación se basa en un grafo dirigido donde los nodos representan objetos y las aristas representan referencias.

Existe un conjunto de nodos marcados como raíces que actúan como puntos de inicio del recorrido de alcanzabilidad.

La alcanzabilidad se calcula recorriendo el grafo desde las raíces mediante búsqueda en profundidad (DFS).

Los objetos no alcanzables desde ninguna raíz son candidatos a recolección durante la fase Sweep.

Los ciclos en el grafo son válidos y el algoritmo los gestiona sin entrar en bucles infinitos.

El usuario dispone de un navegador web moderno con soporte para ES2020 o superior.


#### 2.4.2 Dependencias tecnológicas

| Tecnología | Rol en el sistema |
| --- | --- |
| React 18+ | Biblioteca de interfaz de usuario. |
| TypeScript 5+ | Superset tipado de JavaScript para el desarrollo del sistema. |
| Vite | Herramienta de construcción y servidor de desarrollo. |
| Tailwind CSS | Framework de estilos utilitarios para la capa visual. |
| Jest | Framework de pruebas unitarias e integración. |
| Cypress | Framework de pruebas funcionales end-to-end. |
| Librería de visualización de grafos | Componente para la representación visual del grafo (a determinar en diseño; p. ej. React Flow). |


### 2.5 Restricciones generales

La aplicación es exclusivamente web y debe ejecutarse en navegadores modernos (Chrome, Firefox, Edge, Safari en sus versiones actuales).

No se implementará backend ni base de datos. Toda la lógica reside en el cliente.

La persistencia de datos se limita a exportación/importación de archivos JSON locales.

El sistema no analizará código fuente JavaScript real para inferir el estado del heap.

No se implementarán algoritmos de recolección alternativos como recolección generacional, conteo de referencias o compactación.

El sistema no tendrá en cuenta concurrencia ni pausas incrementales reales.

El rendimiento objetivo se establece para grafos de hasta 50 objetos sin degradación significativa de la experiencia.


## 3. Requisitos funcionales

Los requisitos funcionales se presentan agrupados por bloque temático. Cada requisito incluye identificador, descripción, detalle y criterios de aceptación verificables.


#### RF-01. Representación de objetos

El sistema debe permitir crear objetos dentro de una memoria simulada.

Detalle:

Cada objeto tendrá un identificador único asignado por el sistema.

Cada objeto dispondrá de una etiqueta o nombre visible editable por el usuario.

Cada objeto mantendrá un estado de marcado (marcado / no marcado).

Cada objeto mantendrá un estado de existencia (activo / recolectado).

Cada objeto dispondrá de una colección de referencias salientes.

Criterios de aceptación:

El usuario puede crear un nuevo objeto desde la interfaz.

El objeto aparece visualmente en el grafo tras su creación.

El sistema le asigna automáticamente un identificador único.

El objeto se crea en estado desmarcado y activo.


#### RF-02. Eliminación de objetos por acción del usuario

El sistema debe permitir eliminar manualmente un objeto del escenario antes de ejecutar la simulación.

Detalle:

Al eliminar un objeto se eliminan automáticamente todas sus referencias asociadas, tanto entrantes como salientes.

Si el objeto estaba marcado como raíz, deja de pertenecer al conjunto de raíces.

El sistema actualiza de forma inmediata el estado del escenario y su representación visual.

Se muestra al usuario una notificación breve indicando que también se han eliminado las referencias asociadas, con el número exacto de referencias eliminadas.

Criterios de aceptación:

El usuario puede seleccionar un objeto y eliminarlo mediante el botón 'Eliminar elemento' o las teclas Delete/Backspace.

Todas las referencias asociadas desaparecen correctamente.

Si el objeto era raíz, deja de existir dentro del conjunto de raíces.

No quedan referencias colgantes ni inconsistencias en el grafo.

La interfaz refleja el cambio de forma inmediata.

Si la simulación está en ejecución o pausada, la eliminación de objetos queda bloqueada hasta que la simulación finalice o se reinicie.


#### RF-03. Edición de objetos

El sistema debe permitir modificar atributos básicos de un objeto.

Detalle:

Atributos editables: etiqueta o nombre visible, posición visual en el canvas, condición de raíz.

La edición de la etiqueta se realiza mediante doble clic sobre el nodo en el canvas, que activa un campo de texto inline con el valor actual seleccionado. Al confirmar (Enter o clic fuera) el cambio se guarda; al cancelar (Escape) se descarta.

La posición visual se modifica arrastrando el nodo por el canvas con el ratón.

La condición de raíz se gestiona exclusivamente mediante el botón 'Marcar como raíz' del panel de edición, no desde la edición inline.

Criterios de aceptación:

El usuario puede editar la etiqueta de un objeto mediante doble clic y el cambio se refleja inmediatamente.

El usuario puede modificar la posición visual del objeto arrastrando el nodo por el canvas.

La posición modificada persiste al re-renderizar el grafo.

El usuario puede marcar o desmarcar un objeto como raíz mediante el botón correspondiente.

Si la simulación está en ejecución o pausada, la edición de atributos del objeto queda bloqueada hasta que la simulación finalice o se reinicie.


#### RF-04. Representación de referencias

El sistema debe permitir crear referencias dirigidas entre dos objetos.

Detalle:

Una referencia tiene origen, destino e identidad visual.

No se permiten referencias sin origen y destino válidos.

No se permiten referencias duplicadas exactas entre el mismo origen y destino.

Se permiten autorreferencias (origen = destino). El algoritmo las gestiona sin bucles infinitos.

Cada nodo expone dos puntos de anclaje: lateral izquierdo y lateral derecho. Bajo ConnectionMode.Loose, ambos lados son utilizables tanto como origen (source) como destino (target).

Método principal de creación: arrastre desde un lateral del nodo origen hasta un lateral del nodo destino. El sistema resuelve el anclaje por proximidad: el lado del nodo origen y el lado del nodo destino más cercanos al cursor durante el arrastre quedan registrados con la referencia para que la arista permanezca anclada a esos lados al re-renderizar.

Método alternativo de creación: botón 'Crear referencia' en el panel de edición, que activa un modo de conexión por clic secuencial (primero origen, luego destino). En este modo el lateral derecho del nodo origen actúa como source y el lateral izquierdo del nodo destino actúa como target.

Los lados elegidos se persisten como atributos opcionales `sourceHandle` y `targetHandle` de la referencia y se exportan al JSON cuando están presentes (ver RF-25).

Criterios de aceptación:

El usuario puede crear una referencia arrastrando desde un lateral del nodo origen hasta un lateral del nodo destino. El lado al que se ancla la arista en cada extremo coincide con el lado más próximo al cursor en el momento del drop.

El usuario puede crear una referencia mediante el botón 'Crear referencia' y clic secuencial en origen y destino. La arista resultante queda anclada con source en el lateral derecho del origen y target en el lateral izquierdo del destino.

La referencia se visualiza correctamente con dirección.

El sistema no permite crear referencias duplicadas exactas y muestra un aviso al usuario.

El sistema permite crear autorreferencias (A→A) y las representa correctamente.

El modo de conexión por botón puede cancelarse en cualquier momento pulsando Escape.

Al soltar el arrastre fuera de un nodo, no se crea ninguna referencia.


#### RF-05. Eliminación de referencias

El sistema debe permitir eliminar referencias existentes entre objetos.

Detalle:

Las referencias son seleccionables mediante clic simple directamente sobre la arista en el canvas.

Una referencia seleccionada puede eliminarse mediante el botón 'Eliminar elemento' o las teclas Delete/Backspace, de forma análoga a la eliminación de objetos.

Criterios de aceptación:

El usuario puede seleccionar una referencia haciendo clic sobre ella.

La referencia seleccionada se resalta visualmente para indicar que está activa.

El usuario puede eliminar la referencia seleccionada mediante el botón o las teclas correspondientes.

Tras el borrado, la conectividad del grafo cambia correctamente.


#### RF-06. Gestión de raíces

El sistema debe permitir definir uno o varios objetos como raíces del recorrido de alcanzabilidad.

Criterios de aceptación:

El usuario puede marcar un objeto como raíz.

El usuario puede desmarcar un objeto como raíz.

La interfaz distingue claramente los nodos raíz del resto.


#### RF-07. Visualización del grafo de memoria

El sistema debe representar visualmente la estructura de objetos y referencias.

Detalle:

Nodos para los objetos, conexiones dirigidas para las referencias.

Diferenciación visual de raíces y de los distintos estados del algoritmo.

Criterios de aceptación:

Todos los objetos existentes se representan como nodos.

Todas las referencias válidas se representan como conexiones dirigidas.

Los nodos raíz se distinguen claramente del resto.

Los estados normal, marcado y recolectado se muestran de forma diferenciada.

Cualquier cambio en el estado del sistema se refleja de forma inmediata.


#### RF-08. Estado inicial de simulación

El sistema debe preparar un estado inicial válido previo a la ejecución del algoritmo.

Detalle:

Todos los objetos aparecen desmarcados.

Todos los objetos existentes siguen activos.

Las raíces definidas se conservan correctamente.

El escenario está libre de inconsistencias como referencias inválidas o estados residuales.

Criterios de aceptación:

Antes de iniciar la simulación, ningún objeto aparece marcado.

Todos los objetos existentes se mantienen activos.

Las raíces definidas se conservan correctamente.

El sistema permite iniciar la ejecución desde un estado válido.


#### RF-09. Ejecución de la fase Mark

El sistema debe ejecutar la fase de marcado recorriendo el grafo desde las raíces y marcando todos los objetos alcanzables.

Detalle:

Comienza en todas las raíces.

Visita y marca cada objeto alcanzable.

Evita bucles infinitos en presencia de ciclos.

Si no existe ninguna raíz definida, la fase Mark no marca ningún objeto. Todos los objetos existentes quedarán como candidatos a recolección en la fase Sweep. El sistema informará al usuario de esta situación antes de iniciar la ejecución.

Criterios de aceptación:

Todo objeto alcanzable desde alguna raíz termina marcado.

Ningún objeto inalcanzable termina marcado.

Los ciclos no bloquean la ejecución.

Si no existe ninguna raíz definida, el sistema muestra un aviso al usuario antes de iniciar la ejecución e informa de que todos los objetos serán considerados inalcanzables.


#### RF-10. Visualización paso a paso del marcado

El sistema debe permitir visualizar el proceso de marcado de forma incremental.

Detalle:

El usuario puede ver cuál es el nodo actual, qué nodos ya han sido marcados, qué referencias se están recorriendo y el orden del recorrido.

El modo paso a paso es accesible directamente sin necesidad de haber ejecutado la simulación automática previamente. Si no existen pasos precalculados al pulsar 'Paso siguiente', el sistema los calcula en ese momento.

Criterios de aceptación:

El usuario puede identificar visualmente el nodo que está siendo procesado en cada paso.

Los nodos ya marcados se distinguen claramente de los no visitados.

Las referencias recorridas se muestran de forma diferenciada.

El orden de visita se representa de forma comprensible.

Cada avance de la simulación actualiza correctamente el estado visual.

El usuario puede usar el paso a paso sin haber pulsado 'Ejecutar' previamente.


#### RF-11. Ejecución automática del marcado

El sistema debe ofrecer una opción de ejecución automática de la fase Mark con velocidad configurable, pausa y reanudación.

Detalle:

La velocidad de ejecución se controla mediante un slider con rango de 1x a 10x, siendo 5x el valor por defecto.

La velocidad determina el intervalo de tiempo entre pasos: velocidad 1x equivale a 1000ms por paso, velocidad 10x a 100ms por paso. La fórmula es: delay(ms) = 1000 / velocidad.

El avance entre pasos se implementa mediante un mecanismo asíncrono real (setInterval o setTimeout encadenado), nunca mediante un bucle síncrono.

El cambio de velocidad mediante el slider es efectivo de forma inmediata, incluso durante la ejecución.

Criterios de aceptación:

El usuario puede lanzar la ejecución automática.

El sistema avanza por los pasos con un delay real perceptible entre cada uno.

El slider de velocidad (1x-10x) modifica el delay de la animación.

El cambio de velocidad durante la ejecución surte efecto en el paso siguiente.

El usuario puede pausar y reanudar la ejecución.

Mientras la ejecución automática está activa, los controles de avance y retroceso manual quedan deshabilitados. Solo la pausa está disponible.

El control 'Ejecutar' permanece deshabilitado mientras el grafo no contenga al menos un objeto. No es posible iniciar la ejecución automática sobre un escenario vacío.


#### RF-12. Ejecución de la fase Sweep

El sistema debe ejecutar la fase de barrido tras el marcado.

Detalle:

Identifica objetos no marcados y los marca como recolectados dentro de la simulación.

Conserva los objetos marcados.

Criterios de aceptación:

Todo objeto no marcado es recolectado.

Ningún objeto marcado pasa al estado recolectado ni es suprimido del escenario.

El resultado final coincide con la alcanzabilidad calculada.


#### RF-13. Visualización del barrido

El sistema debe mostrar visualmente qué objetos son marcados como recolectados durante la fase Sweep.

Detalle:

Los objetos recolectados se distinguen mediante opacidad reducida, borde atenuado e indicador visible con el estado 'Recolectado'. El detalle visual completo del estado recolectado se especifica en RI-03.

Criterios de aceptación:

Se distingue claramente qué objetos están marcados (alcanzables) y cuáles son recolectados.


#### RF-14. Ejecución completa del algoritmo

El sistema debe permitir ejecutar el ciclo completo de Mark & Sweep con una sola acción.

Criterios de aceptación:

Al pulsar 'Ejecutar', se realiza la fase Mark y después la fase Sweep.

El resultado final es correcto y consistente.

Si el grafo está vacío, el sistema rechaza la operación sin modificar el estado y el control 'Ejecutar' permanece deshabilitado.


#### RF-15. Ejecución paso a paso global

El sistema debe permitir avanzar y retroceder manualmente por los pasos del algoritmo completo.

Detalle:

Paso 1: inicialización. Paso 2: comienzo en raíces. Pasos 3..n: marcado incremental. Paso final: barrido.

El usuario puede avanzar al siguiente paso, visualizar el estado de cada transición, identificar la fase actual y retroceder al paso anterior.

Criterios de aceptación:

El usuario puede avanzar por la simulación paso a paso.

Cada paso muestra un estado consistente y comprensible.

La simulación finaliza correctamente tras el último paso.

Al retroceder, el usuario puede volver al paso anterior sin inconsistencias.

Al reiniciar, el paso actual vuelve al inicio.

Los controles de paso a paso solo están disponibles cuando la ejecución automática está pausada o no ha sido iniciada.

Los controles 'Paso siguiente' y 'Reiniciar' permanecen deshabilitados mientras el grafo no contenga al menos un objeto.


#### RF-16. Visualización del grafo tras la recolección

El sistema debe mostrar una vista final del grafo ocultando visualmente los objetos recolectados y sus referencias, disponible una vez completada la simulación.

Detalle:

Los objetos recolectados dejan de mostrarse en el grafo.

Se eliminan visualmente todas las referencias asociadas a dichos objetos.

El usuario puede volver a la vista completa.

Esta funcionalidad no modifica el escenario original.

Criterios de aceptación:

El usuario puede activar la visualización del grafo tras la recolección.

Los objetos recolectados dejan de mostrarse visualmente.

Solo permanecen visibles los objetos marcados (alcanzables) y sus conexiones válidas.

El usuario puede volver a la vista completa sin perder el estado de la simulación.


#### RF-17. Reinicio de la simulación

El sistema debe permitir reiniciar la simulación o limpiar completamente el escenario.

Detalle:

Reinicio de simulación: elimina marcas, estados recolectados, pasos, recorrido y logs, pero conserva objetos, referencias y raíces.

Limpieza total: elimina todos los objetos, referencias y raíces.

El escenario no persiste entre sesiones de navegador. Al recargar la página, la aplicación comienza con un canvas vacío. No se utiliza ningún mecanismo de almacenamiento local automático.

Criterios de aceptación:

Tras reiniciar la simulación, no queda ningún objeto marcado ni recolectado.

Los objetos, referencias y raíces se conservan tras reiniciar.

Tras limpiar el escenario, no queda ningún objeto, referencia ni raíz.

El sistema permite volver a ejecutar Mark & Sweep tras reiniciar.

Al reiniciar la simulación, si la vista de grafo tras recolección estaba activa, el sistema vuelve automáticamente a la vista completa.

Al recargar la página, el canvas aparece vacío. No hay recuperación automática de escenarios previos.


#### RF-18. Carga de escenarios predefinidos

El sistema debe incluir escenarios predefinidos listos para cargar.

Detalle:

Escenarios disponibles: Cadena lineal (A(raíz)→B→C), Ciclo alcanzable (A(raíz)→B→C→B), Ciclo inalcanzable (A(raíz), B→C→B), Múltiples raíces (A(raíz)→B, C(raíz)→D, E aislado), Sin raíces (A, B, C sin raíces definidas).

Criterios de aceptación:

El usuario puede cargar cualquiera de los cinco escenarios predefinidos.

El escenario se visualiza correctamente.

Cada escenario ilustra un comportamiento concreto del algoritmo.

Al cargar un escenario predefinido, el sistema reinicia automáticamente el estado de la simulación, incluyendo marcas, logs y pasos.


#### RF-19. Validación de consistencia del escenario

El sistema debe impedir o gestionar estados inválidos, tanto durante la edición como durante la importación de escenarios.

Detalle:

Referencias a objetos inexistentes, raíces inexistentes, duplicación conflictiva de identificadores y referencias duplicadas son consideradas estados inválidos.

La validación de consistencia se aplica también durante la importación de escenarios JSON.

Criterios de aceptación:

El sistema no entra en estados incoherentes.

Los errores se informan al usuario de forma clara.


#### RF-20. Leyenda visual

El sistema debe mostrar una leyenda que explique el significado de los distintos estados visuales.

Detalle:

La leyenda cubre: objeto normal, objeto raíz, objeto marcado, objeto en procesamiento, objeto recolectado, referencia normal, referencia recorrida.

Criterios de aceptación:

La leyenda está visible o accesible desde la interfaz.

Cada estado visual usado en el grafo aparece explicado.

La información de la leyenda coincide con la representación visual real.


#### RF-21. Explicación textual del algoritmo

El sistema debe mostrar explicaciones textuales breves que acompañen las distintas fases y pasos.

Detalle:

Las explicaciones informan sobre: fase actual, acción del paso, motivo de marcado, motivo de recolección y resultado final.

Criterios de aceptación:

El usuario puede saber en qué fase se encuentra.

Cada paso relevante muestra una explicación comprensible.

Las explicaciones coinciden con el estado visual mostrado.


#### RF-22. Registro de ejecución

El sistema debe mantener y mostrar un registro secuencial de los eventos producidos durante la simulación.

Detalle:

El registro refleja: detección de raíces, inicio de Mark, visita y marcado de nodos, detección de nodos ya visitados, inicio de Sweep, identificación de recolectables, marcado como recolectados y finalización.

Criterios de aceptación:

El usuario puede consultar el historial desde la interfaz.

Cada paso relevante genera una entrada en el registro.

El orden de los eventos se mantiene correctamente.

El registro se reinicia al reiniciar la simulación.


#### RF-23. Soporte para ciclos

El sistema debe gestionar correctamente grafos con ciclos.

Criterios de aceptación:

Un ciclo alcanzable desde una raíz sobrevive.

Un ciclo no alcanzable desde ninguna raíz se marca como recolectado.

La simulación no entra en bucle infinito al procesar ciclos.


#### RF-24. Soporte para múltiples raíces

El sistema debe permitir más de una raíz.

Criterios de aceptación:

El recorrido parte de todas las raíces definidas.

Un objeto alcanzable desde cualquiera de ellas sobrevive.


#### RF-25. Gestión reutilizable de escenarios

El sistema debe permitir guardar un escenario construido por el usuario y volver a cargarlo posteriormente.

Detalle:

El usuario puede exportar un escenario en formato JSON e importar uno previamente guardado.

Un escenario exportado incluye: objetos, referencias, raíces y configuración necesaria para reconstruir el escenario.

Cada referencia puede llevar opcionalmente los campos `sourceHandle` y `targetHandle` (valores `"left"` o `"right"`) que indican el lado de anclaje en el nodo origen y destino respectivamente. Estos campos solo se emiten cuando están presentes en la referencia y permiten preservar el anclaje visual al hacer round-trip de exportación/importación. Los escenarios sin estos campos se importan sin error y el sistema elige el lado por defecto al renderizar.

Criterios de aceptación:

El usuario puede exportar un escenario y el sistema genera un archivo JSON válido.

El usuario puede importar un escenario y se restauran correctamente objetos, referencias y raíces.

La estructura del grafo importado coincide con la del escenario exportado.

Si el JSON importado contiene referencias a objetos inexistentes, la importación se rechaza y se muestra un aviso.

Si el JSON importado contiene identificadores duplicados, la importación se rechaza y se muestra un aviso.

Al importar un escenario, el sistema reinicia automáticamente el estado de la simulación, incluyendo marcas, logs y pasos.


#### RF-26. Sistema de notificaciones al usuario

El sistema debe proporcionar feedback inmediato al usuario mediante notificaciones no intrusivas (toasts) para todas las operaciones relevantes, errores y avisos.

Detalle:

Las notificaciones son mensajes temporales que aparecen y desaparecen automáticamente tras aproximadamente 3 segundos, sin requerir acción del usuario para cerrarse.

Las notificaciones de error indican al usuario por qué una operación no puede realizarse.

Las notificaciones informativas confirman que una operación se ha completado correctamente.

El aviso de ejecución sin raíces definidas requiere confirmación explícita del usuario antes de continuar (diálogo de confirmación, no toast).

Criterios de aceptación:

Al intentar eliminar durante simulación activa: se muestra notificación de error.

Al intentar editar durante simulación activa: se muestra notificación de error.

Al intentar crear una referencia duplicada: se muestra notificación de error.

Al eliminar un objeto con referencias asociadas: se muestra notificación informativa con el texto 'Objeto eliminado. También se eliminaron N referencias asociadas.' donde N es el número real de referencias eliminadas.

Al ejecutar sin raíces definidas: se muestra diálogo de confirmación antes de continuar.

Al importar JSON inválido o inconsistente: se muestra notificación de error descriptiva.

Al importar o exportar correctamente: se muestra notificación informativa de confirmación.

Al pulsar 'Eliminar elemento' sin elemento seleccionado: se muestra notificación de aviso.

Al pulsar 'Marcar como raíz' sin objeto seleccionado: se muestra notificación de aviso.


## 4. Requisitos de interfaz de usuario


#### RI-01

La interfaz debe disponer de un área principal de visualización del grafo con espacio suficiente para representar escenarios de complejidad media.


#### RI-02

La interfaz debe disponer de una zona de controles organizada por grupos funcionales: edición del escenario, simulación, gestión de escenarios y visualización.


#### RI-03

Debe existir un sistema visual de estados para los objetos: normal (representación estándar), raíz (borde o indicador distintivo), marcado (resaltado visual), objeto actual en procesamiento (indicador diferenciado) y recolectado (opacidad reducida, borde atenuado y etiqueta de estado).


#### RI-04

Las referencias deben visualizar su dirección mediante indicador gráfico (flecha). La interfaz debe permitir crear referencias de forma intuitiva mediante dos puntos de anclaje laterales (izquierdo y derecho) en cada nodo. Bajo ConnectionMode.Loose ambos lados sirven como origen y destino; el lado utilizado en cada extremo se resuelve por proximidad al cursor durante el arrastre y se persiste con la referencia para que el anclaje permanezca al re-renderizar.


#### RI-05

La interfaz debe incluir una leyenda visual accesible que explique el significado de todos los estados representados en el grafo.


#### RI-06

La interfaz debe incluir un área destinada a mostrar información textual sobre la simulación, combinando la explicación didáctica y el registro secuencial de eventos.


#### RI-07

La interfaz debe permitir seleccionar objetos y referencias de forma clara, precisa e intuitiva. La selección se realiza mediante clic simple sobre el elemento. Los objetos son editables mediante doble clic, que activa edición inline de la etiqueta. La creación de referencias se realiza principalmente mediante arrastre desde cualquier punto del nodo origen, con un cursor crosshair como indicador visual; como método alternativo, el botón 'Crear referencia' activa un modo de conexión por clic secuencial cancelable con Escape.


#### RI-08

La interfaz debe evitar la saturación visual cuando el grafo contiene un número medio de objetos y referencias.


#### RI-09

Debe quedar claro en todo momento en qué fase se encuentra la simulación: edición, mark, sweep o finalizado.


#### RI-10

La interfaz debe proporcionar feedback inmediato a las acciones del usuario, incluyendo notificaciones para operaciones relevantes como eliminación de referencias asociadas. El sistema completo de notificaciones está especificado en RF-26.


## 5. Requisitos no funcionales

| ID | Atributo | Descripción | Criterio de verificación |
| --- | --- | --- | --- |
| RNF-01 | Usabilidad | La interfaz debe ser intuitiva para un usuario sin experiencia previa en sistemas de gestión de memoria. | Creación sencilla de nodos y referencias, controles claramente etiquetados, textos comprensibles y elementos didácticos integrados. |
| RNF-02 | Comprensibilidad visual | El diseño visual debe favorecer la lectura del grafo y la interpretación inequívoca de los estados. | Colores diferenciados por estado, tamaño de nodos legible, distribución clara del grafo y mínima ambigüedad visual. |
| RNF-03 | Rendimiento | La aplicación debe mantener un funcionamiento fluido en escenarios de complejidad docente media. | Soporte para grafos de hasta 50 objetos y 100 referencias. Las operaciones de edición deben responder en menos de 200 ms. Los avances de paso en la simulación deben producirse en menos de 100 ms. La renderización del grafo no debe caer por debajo de 30 fps. |
| RNF-04 | Robustez | La aplicación no debe fallar ante operaciones inválidas o secuencias de interacción no ideales. | Manejo controlado de errores, ausencia de estados inconsistentes y mensajes de error informativos. |
| RNF-05 | Mantenibilidad | El sistema debe estar diseñado de forma que facilite su mantenimiento, modificación y ampliación futura. | Código claro, modular y con separación de responsabilidades que permita incorporar nuevas funcionalidades sin afectar significativamente al resto del sistema. |
| RNF-06 | Extensibilidad | La arquitectura debe permitir añadir futuros algoritmos de recolección u otras mejoras visuales. | Separación clara entre la lógica del dominio y la capa de presentación. |
| RNF-07 | Portabilidad | La aplicación debe poder ejecutarse correctamente en navegadores modernos. | Compatibilidad con las versiones actuales de Chrome, Firefox, Edge y Safari. |
| RNF-08 | Accesibilidad básica | La interfaz no debe depender exclusivamente del color para representar los distintos estados. | Los objetos y referencias deben poder identificarse también mediante etiquetas, iconos, bordes diferenciados o cambios de opacidad. |
| RNF-09 | Consistencia | Todas las operaciones deben comportarse de manera predecible y uniforme. | El sistema debe mantener coherencia entre el estado lógico de la simulación y su representación visual en todo momento. |
| RNF-10 | Trazabilidad | Cada requisito funcional debe poder relacionarse con una o varias pruebas. | Documentación de la matriz de trazabilidad en el plan de pruebas asociado. |


### Apéndice A — Glosario ampliado

Algoritmo Mark & Sweep: Algoritmo de recolección de basura en dos fases. La fase Mark recorre el grafo de objetos desde las raíces y marca todos los objetos alcanzables. La fase Sweep identifica los objetos no marcados y los considera candidatos a eliminación.

Alcanzabilidad: Propiedad de un objeto que puede ser accedido directamente o de forma transitiva desde al menos una raíz del grafo.

Arista: Representación visual de una referencia dirigida entre dos nodos del grafo.

Autorreferencia: Referencia en la que el objeto origen y el objeto destino son el mismo. El algoritmo la gestiona sin entrar en bucles infinitos.

Ciclo: Cadena de referencias que forma un camino cerrado en el grafo. Un ciclo no garantiza supervivencia; solo sobrevive si es alcanzable desde una raíz.

Clean Architecture: Patrón de diseño que organiza el código en capas concéntricas con dependencias dirigidas hacia el interior, garantizando que la lógica de negocio no depende de detalles de implementación.

DFS (Depth-First Search): Búsqueda en profundidad. Estrategia de recorrido de grafos utilizada en la fase Mark para visitar todos los objetos alcanzables.

Escenario: Conjunto de objetos, referencias y raíces que definen un estado concreto de la memoria simulada.

Estado recolectado: Estado de un objeto que no ha sido marcado durante la fase Mark y que, por tanto, es candidato a eliminación en la fase Sweep.

Fase Mark: Primera fase del algoritmo. Recorre el grafo desde las raíces y marca todos los objetos alcanzables.

Fase Sweep: Segunda fase del algoritmo. Identifica los objetos no marcados y los marca como recolectados.

Grafo dirigido: Estructura de datos formada por nodos y aristas con dirección. En GC Visualizer, los nodos son objetos y las aristas son referencias.

Heap simulado: Representación abstracta de la zona de memoria dinámica, modelada como un grafo dirigido.

Nodo: Representación visual de un objeto de memoria en el grafo.

Objeto raíz (Root): Término canónico para referirse a un objeto marcado como punto de inicio del recorrido de alcanzabilidad. Representa variables globales, marcos de pila u otros puntos de entrada al grafo. Sinónimos aceptados en el documento: 'nodo raíz', 'raíz'. El conjunto de todos los objetos raíz se denomina 'conjunto de raíces'.

Recolectado: Estado visual de un objeto no alcanzable tras la fase Sweep. El objeto no se elimina físicamente del escenario sino que cambia su representación visual (opacidad reducida, borde atenuado, etiqueta de estado). No debe confundirse con 'eliminado', que implica supresión física del escenario por acción del usuario.

Referencia: Puntero lógico de un objeto a otro. En el grafo, se representa como una arista dirigida.

Referencia colgante: Referencia cuyo objeto destino ha sido eliminado del escenario. El sistema impide su existencia mediante validación de consistencia.

Serialización: Proceso de convertir el estado del escenario en un formato textual (JSON) que puede almacenarse y recuperarse posteriormente.

Visitado: Estado intermedio de un objeto durante la fase Mark, una vez que ha sido alcanzado y procesado para evitar revisitas en grafos con ciclos.
