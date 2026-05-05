# GC Visualizer — Software Design Description (SDD v1.2)


### Historial de revisiones

| Versión | Fecha | Descripción | Autor |
| --- | --- | --- | --- |
| 1.0 | 04/05/2026 | Versión inicial del documento SDD. | — |
| 1.1 | 04/05/2026 | Correcciones derivadas del informe VAL-SDD-v1.0 (H-01 a H-08). Actualización de secciones 3.2.3, 3.3, 4.5, 5.1, 5.2, 6.1, 7 y 9. | — |
| 1.2 | 04/05/2026 | Correcciones derivadas del informe VAL2-SDD-v1.1 (H2-01 a H2-04). Actualización de secciones 5.2, 6, 7.1 y 8. | — |
| 1.3 | 05/05/2026 | Segunda versión. Actualización derivada de SRS v1.4 y UCD v1.4. Eliminadas referencias académicas. Sección 7.4 actualizada: onNodesChange, ConnectionMode.Loose, doble clic, setInterval/delay real, RF-26. Trazabilidad sección 9 actualizada con RF-26 y nuevos elementos de diseño. | — |


## 1. Introducción


### 1.1 Propósito del documento

El presente documento constituye la Descripción de Diseño del Software (SDD) del proyecto GC Visualizer, elaborado conforme al estándar IEEE 1016:2009. Su objetivo es describir la arquitectura del sistema, el modelo de dominio, las decisiones de diseño relevantes y la estructura de implementación, sirviendo como referencia técnica para el desarrollo y la verificación del proyecto.

Este documento es complementario al SRS GC Visualizer v1.4, que define los requisitos del sistema, y al UCD GC Visualizer v1.4, que describe las interacciones del usuario. El SDD describe cómo se satisfacen esos requisitos mediante decisiones de diseño concretas.


### 1.2 Ámbito

El documento cubre el diseño completo de GC Visualizer: arquitectura por capas, modelo de dominio, estructura de módulos, flujo de datos entre capas, decisiones tecnológicas y estructura de ficheros del proyecto.


### 1.3 Referencias

IEEE Std 1016:2009 — Software Design Descriptions.

SRS GC Visualizer v1.4 — Especificación de Requisitos del Software.

UCD GC Visualizer v1.4 — Documento de Casos de Uso.

Martin, R. C. (2017). Clean Architecture: A Craftsman's Guide to Software Structure and Design. Prentice Hall.

Cockburn, A. (2005). Hexagonal Architecture. https://alistair.cockburn.us/hexagonal-architecture/

React Flow Documentation. https://reactflow.dev/docs

React Documentation (v18). https://react.dev

TypeScript Handbook. https://www.typescriptlang.org/docs


### 1.4 Glosario de diseño

| Término | Definición |
| --- | --- |
| Clean Architecture | Patrón de diseño que organiza el sistema en capas concéntricas con dependencias dirigidas hacia el interior. La lógica de negocio no depende de detalles de implementación. |
| Puerto (Port) | Interfaz definida por el dominio que especifica cómo el exterior puede interactuar con él. Permite invertir las dependencias. |
| Adaptador (Adapter) | Implementación concreta de un puerto. Reside en la capa de infraestructura y traduce entre el dominio y el mundo exterior. |
| Caso de uso (Use Case) | Unidad de lógica de aplicación que orquesta el dominio para satisfacer una interacción de usuario. Corresponde a los CU del UCD. |
| Store | Mecanismo centralizado de gestión del estado de la aplicación. En este proyecto se implementa en la capa de aplicación. |
| React Flow | Librería de visualización de grafos interactivos para React. Actúa como adaptador visual en la capa de presentación. |
| Componente funcional | Componente React implementado como función. Es el patrón estándar en React 18 y el utilizado en este proyecto. |
| Hook | Función de React que permite a los componentes funcionales acceder a estado y efectos secundarios. |
| DFS | Depth-First Search. Búsqueda en profundidad. Estrategia de recorrido utilizada en la fase Mark del algoritmo. |


## 2. Arquitectura del sistema


### 2.1 Estilo arquitectónico

GC Visualizer sigue una arquitectura basada en Clean Architecture (Robert C. Martin), organizada en cuatro capas concéntricas con la regla de dependencia como principio rector: las dependencias siempre apuntan hacia el interior, nunca hacia el exterior.

Adicionalmente, se incorpora el concepto de puertos y adaptadores (Alistair Cockburn) para definir los puntos de contacto entre el dominio y la infraestructura, garantizando que la lógica de negocio permanece independiente de los detalles tecnológicos.


### 2.2 Capas del sistema

El sistema se organiza en las siguientes cuatro capas, de interior a exterior:

| Capa | Carpeta | Responsabilidad | Dependencias |
| --- | --- | --- | --- |
| Dominio | domain/ | La capa más interna. Contiene las entidades del modelo de memoria simulada, las reglas del algoritmo Mark & Sweep, los validadores de consistencia del grafo y los puertos que definen cómo el exterior puede interactuar con el dominio. No tiene ninguna dependencia hacia capas externas. | Ninguna |
| Aplicación | application/ | Orquesta el dominio para satisfacer los casos de uso del sistema. Gestiona el estado centralizado de la simulación y coordina las operaciones entre el dominio y la presentación. Depende únicamente del dominio. | Dominio |
| Presentación | presentation/ | Implementa la interfaz de usuario mediante componentes React. Consume el estado de la capa de aplicación y traduce las interacciones del usuario en llamadas a los casos de uso. Utiliza React Flow para la visualización del grafo. | Aplicación, Dominio |
| Infraestructura | infrastructure/ | Implementa los adaptadores concretos para la serialización y deserialización de escenarios JSON. Es la única capa con conocimiento de los detalles de persistencia y formato externo. | Dominio (puertos) |


### 2.3 Regla de dependencia

La regla de dependencia es el principio arquitectónico central del sistema. Se formula de la siguiente manera:

El código fuente de una capa solo puede depender de código de capas más internas. Ninguna entidad del dominio puede conocer nada de la presentación o la infraestructura.

En términos prácticos, esto significa:

domain/ no importa nada de application/, presentation/ ni infrastructure/.

application/ puede importar de domain/ pero no de presentation/ ni infrastructure/.

presentation/ puede importar de application/ y domain/ pero no de infrastructure/.

infrastructure/ implementa interfaces definidas en domain/ (puertos).


### 2.4 Decisiones tecnológicas

Las siguientes decisiones tecnológicas han sido adoptadas y son parte del diseño del sistema:

| Tecnología | Rol en el diseño | Capa |
| --- | --- | --- |
| React 18 | Biblioteca de interfaz de usuario. Se utilizan exclusivamente componentes funcionales y hooks. No se usan componentes de clase. | Presentación |
| TypeScript 5 | Superset tipado de JavaScript. Tipado estático en todas las capas, incluyendo el dominio y los algoritmos. | Todas las capas |
| Vite | Herramienta de construcción y servidor de desarrollo. No influye en la arquitectura en tiempo de ejecución. | Infraestructura de build |
| React Flow | Librería de visualización de grafos interactivos. Actúa como adaptador visual en la capa de presentación. Los nodos y aristas de React Flow son transformaciones de las entidades del dominio, no las entidades mismas. | Presentación |
| Tailwind CSS | Framework de estilos utilitarios. Se aplica exclusivamente en la capa de presentación. | Presentación |
| Jest | Framework de pruebas unitarias e integración. Se aplica sobre el dominio y la aplicación de forma independiente a React. | Tests unitarios e integración |
| Cypress | Framework de pruebas end-to-end. Prueba la aplicación completa desde el navegador. | Tests e2e |


## 3. Modelo de dominio


### 3.1 Visión general

El dominio de GC Visualizer modela una memoria simulada como un grafo dirigido. Las entidades del dominio son objetos de TypeScript con tipado estricto. El paradigma predominante en el dominio es orientado a objetos para las entidades y funcional puro para el algoritmo.


### 3.2 Entidades principales


#### 3.2.1 MemoryObject

Representa un objeto en la memoria simulada. Es la entidad central del dominio.

Responsabilidad: Modelar un objeto de memoria con su identidad, estado de marcado, estado de existencia y referencias salientes.

Atributos: id: string — identificador único. label: string — etiqueta visible. isRoot: boolean — si es objeto raíz. marked: boolean — si ha sido marcado durante la fase Mark. alive: boolean — si está activo (no recolectado). visitedOrder: number | null — orden de visita durante el marcado. position: {x: number, y: number} — posición visual en el grafo.


#### 3.2.2 MemoryReference

Representa una referencia dirigida entre dos objetos de memoria.

Responsabilidad: Modelar una arista dirigida del grafo con su origen, destino y estado de recorrido durante el marcado.

Atributos: id: string — identificador único. sourceObjectId: string — identificador del objeto origen. targetObjectId: string — identificador del objeto destino. traversed: boolean — si la referencia fue recorrida durante la fase Mark.


#### 3.2.3 MemoryGraph

Representa el grafo completo de memoria simulada en un momento dado.

Responsabilidad: Agregar objetos y referencias, y proporcionar operaciones de consulta sobre la estructura del grafo.

Atributos: objects: MemoryObject[] — colección de objetos. references: MemoryReference[] — colección de referencias.

Operaciones relevantes: getObject(id), getRoots(), getOutgoingReferences(objectId), getIncomingReferences(objectId).

Nota: los atributos name y description del modelo de dominio del SRS no forman parte de MemoryGraph. Se gestionan como metadatos en el JSON de exportación, en la capa de infraestructura, sin necesidad de ser parte del modelo de dominio en memoria. MemoryGraph modela exclusivamente la estructura del grafo necesaria para ejecutar el algoritmo.


#### 3.2.4 SimulationState

Representa el estado completo de la simulación en un momento dado.

Responsabilidad: Encapsular la fase actual, el paso actual, el historial de pasos, los logs de ejecución y el estado visual de la simulación.

Atributos: phase: 'idle' | 'mark' | 'sweep' | 'done' — fase actual. currentStep: number — índice del paso actual. steps: SimulationStep[] — historial de pasos. logs: string[] — registro de eventos. selectedElementId: string | null — elemento seleccionado. showCollectedView: boolean — si la vista tras recolección está activa.


#### 3.2.5 SimulationStep

Representa un paso individual de la simulación, permitiendo la navegación hacia adelante y hacia atrás.

Responsabilidad: Capturar el estado completo del grafo en un momento concreto de la simulación para permitir la reproducción y el retroceso.

Atributos: stepIndex: number. phase: string. currentObjectId: string | null — objeto siendo procesado. markedIds: string[] — objetos marcados hasta este paso. traversedReferenceIds: string[] — referencias recorridas. log: string — entrada del registro para este paso.


### 3.3 Puertos del dominio

Los puertos son interfaces TypeScript definidas en el dominio que especifican cómo las capas externas pueden interactuar con él, sin que el dominio conozca las implementaciones concretas.

| Puerto | Descripción y ubicación de la implementación |
| --- | --- |
| IScenarioSerializer | Interfaz para la serialización de escenarios. Define los métodos serialize(graph: MemoryGraph): string y deserialize(data: string): MemoryGraph. Implementada en infrastructure/json/scenarioSerializer.ts. |
| IScenarioParser | Interfaz para la validación y parseo de escenarios importados. Define el método parse(raw: unknown): MemoryGraph \| ValidationError. Implementada en infrastructure/json/scenarioParser.ts. |

Nota sobre IGraphValidator: la interfaz IGraphValidator no es un puerto en sentido estricto, ya que su implementación (graphValidator.ts) reside dentro del propio dominio en domain/validators/. Se trata de una interfaz interna del dominio que formaliza el contrato de validación. Por esta razón, IGraphValidator se ubica en domain/validators/ junto a su implementación, no en domain/ports/. Los únicos puertos reales del dominio son IScenarioSerializer e IScenarioParser, cuyas implementaciones residen en la capa de infraestructura.


## 4. Diseño del algoritmo Mark & Sweep


### 4.1 Ubicación y naturaleza

El algoritmo Mark & Sweep reside en domain/algorithms/markAndSweep.ts y se implementa como un conjunto de funciones puras. No tiene efectos secundarios: recibe un grafo como entrada y devuelve una secuencia de pasos como salida. Este diseño garantiza que el algoritmo es completamente testeable de forma independiente a React y a cualquier otro componente del sistema.


### 4.2 Interfaz del algoritmo

El algoritmo expone la siguiente interfaz principal:

function computeMarkAndSweepSteps(graph: MemoryGraph): SimulationStep[]

La función recibe el grafo de memoria y devuelve el array completo de pasos de la simulación, incluyendo inicialización, marcado incremental y barrido. La capa de aplicación consume este array para implementar la navegación paso a paso.


### 4.3 Fase Mark

La fase de marcado implementa una búsqueda en profundidad (DFS) desde todas las raíces del grafo. El diseño garantiza:

Inicio simultáneo desde todos los objetos raíz definidos.

Mantenimiento de un conjunto de objetos visitados para evitar revisitas y bucles infinitos en grafos con ciclos.

Soporte explícito para autorreferencias (un objeto que se referencia a sí mismo), tratadas como referencias válidas sin generar bucle infinito.

Registro del orden de visita (visitedOrder) en cada objeto marcado.

Generación de un SimulationStep por cada objeto visitado, capturando el estado del grafo en ese momento.

Si no existen raíces definidas, la fase Mark no marca ningún objeto y genera un paso de aviso informando al usuario de que todos los objetos serán candidatos a recolección.


### 4.4 Fase Sweep

La fase de barrido recorre todos los objetos del grafo e identifica los no marcados. El diseño garantiza:

Los objetos no marcados pasan al estado alive = false (recolectado).

Los objetos marcados se conservan sin modificación.

Se genera un único SimulationStep para la fase Sweep completa, con el estado final del grafo.

Los objetos recolectados no se eliminan del grafo: permanecen en él con estado alive = false para permitir su visualización diferenciada y la vista 'grafo tras recolección'.


### 4.5 Garantías de corrección

El algoritmo garantiza las siguientes propiedades, verificables mediante pruebas unitarias:

| Propiedad | Descripción |
| --- | --- |
| Inicio en raíces | Todo objeto marcado como raíz es considerado alcanzable de partida y actúa como nodo inicial del recorrido DFS, independientemente de si tiene referencias entrantes. |
| Completitud del marcado | Todo objeto alcanzable desde alguna raíz mediante cualquier cadena de referencias termina marcado. |
| Corrección del barrido | Todo objeto no marcado termina recolectado. Ningún objeto marcado termina recolectado. |
| Terminación | El algoritmo termina en tiempo finito para cualquier grafo dirigido, incluyendo grafos con ciclos y autorreferencias. |
| Determinismo | Para un mismo grafo de entrada, el algoritmo produce siempre la misma secuencia de pasos. |
| Pureza | El algoritmo no modifica el grafo de entrada. Produce un nuevo array de pasos sin efectos secundarios. |


## 5. Estructura de módulos y ficheros


### 5.1 Árbol de directorios

La estructura de directorios del proyecto refleja directamente la arquitectura por capas. Cada carpeta de primer nivel bajo src/ corresponde a una capa del sistema:

Nota sobre application/useCases/: en Clean Architecture, los casos de uso de aplicación son unidades de lógica que orquestan el dominio para satisfacer una interacción concreta del usuario. No deben confundirse con los casos de uso del UCD, que describen interacciones desde el punto de vista del usuario. Un caso de uso de aplicación como createObject.ts no crea el objeto directamente: valida el estado actual, invoca las entidades del dominio, actualiza el store y coordina la respuesta hacia la presentación. Es la capa de coordinación entre el dominio y la interfaz.

Nota sobre el carácter del diseño: el presente documento recoge las decisiones arquitectónicas principales adoptadas antes del inicio de la implementación. Es habitual que durante el desarrollo emerjan refinamentos o ajustes puntuales. Cualquier cambio relevante respecto a este diseño inicial quedará registrado en el historial de revisiones del documento.

| Ruta | Módulos |
| --- | --- |
| src/domain/models/ | MemoryObject.ts, MemoryReference.ts, MemoryGraph.ts, SimulationState.ts, SimulationStep.ts |
| src/domain/algorithms/ | markAndSweep.ts |
| src/domain/validators/ | graphValidator.ts, IGraphValidator.ts |
| src/domain/ports/ | IScenarioSerializer.ts, IScenarioParser.ts |
| src/application/ | simulationStore.ts |
| src/application/useCases/ | createObject.ts, deleteObject.ts, editObject.ts, createReference.ts, deleteReference.ts, markAsRoot.ts, runSimulation.ts, stepSimulation.ts, resetSimulation.ts, loadPredefinedScenario.ts, clearScenario.ts, importScenario.ts, exportScenario.ts |
| src/presentation/components/layout/ | AppShell.tsx, TopBar.tsx, LeftEditorPanel.tsx, RightInfoPanel.tsx, BottomSimulationPanel.tsx |
| src/presentation/components/graph/ | GraphCanvas.tsx, ObjectNode.tsx, ReferenceEdge.tsx |
| src/presentation/components/simulation/ | SimulationControls.tsx, ExecutionLog.tsx, StateLegend.tsx |
| src/presentation/components/scenarios/ | ScenarioSelector.tsx |
| src/infrastructure/json/ | scenarioParser.ts, scenarioSerializer.ts |
| src/tests/unit/ | Pruebas unitarias del dominio y algoritmo |
| src/tests/integration/ | Pruebas de integración entre capas |
| src/tests/e2e/ | Pruebas end-to-end con Cypress |


### 5.2 Descripción de módulos clave

La siguiente tabla describe los módulos más relevantes del sistema. Las entidades del dominio están descritas en detalle en la sección 3.2. Los puertos están descritos en la sección 3.3. Los casos de uso de aplicación menores (createObject.ts, deleteObject.ts, editObject.ts, createReference.ts, deleteReference.ts, markAsRoot.ts, resetSimulation.ts, loadPredefinedScenario.ts, clearScenario.ts) siguen el mismo patrón que los descritos a continuación: responsabilidad única de orquestar la operación correspondiente en el dominio y actualizar el store. La funcionalidad de CU-11 (visualizar grafo tras recolección) se implementa mediante el atributo booleano showCollectedView del simulationStore.ts, sin necesidad de un caso de uso propio.

| Módulo | Capa | Responsabilidad |
| --- | --- | --- |
| markAndSweep.ts | Dominio | Implementa el algoritmo Mark & Sweep como funciones puras. Entrada: MemoryGraph. Salida: SimulationStep[]. Sin dependencias externas. |
| graphValidator.ts | Dominio | Valida la consistencia estructural del grafo: referencias a objetos inexistentes, identificadores duplicados, raíces inexistentes. |
| simulationStore.ts | Aplicación | Gestión centralizada del estado de la simulación. Expone el estado actual y los métodos para modificarlo. Coordina la capa de presentación con los casos de uso. |
| runSimulation.ts | Aplicación | Caso de uso que invoca el algoritmo y almacena los pasos resultantes en el store. |
| stepSimulation.ts | Aplicación | Caso de uso que avanza o retrocede un paso en la simulación consultando el array de pasos precalculados. |
| importScenario.ts | Aplicación | Caso de uso que delega en el puerto IScenarioParser para validar e importar un escenario JSON. |
| exportScenario.ts | Aplicación | Caso de uso que delega en el puerto IScenarioSerializer para serializar el MemoryGraph actual y generar el archivo JSON descargable. |
| GraphCanvas.tsx | Presentación | Componente principal de visualización. Traduce MemoryObject y MemoryReference a nodos y aristas de React Flow. |
| ObjectNode.tsx | Presentación | Componente personalizado de React Flow para representar un objeto de memoria con sus estados visuales diferenciados. |
| ReferenceEdge.tsx | Presentación | Componente personalizado de React Flow para representar una referencia dirigida con su estado de recorrido. |
| SimulationControls.tsx | Presentación | Controles de la simulación: ejecutar, paso a paso, automático, pausar, reiniciar y velocidad. |
| scenarioSerializer.ts | Infraestructura | Implementación del puerto IScenarioSerializer. Convierte MemoryGraph a JSON y viceversa. |
| scenarioParser.ts | Infraestructura | Implementación del puerto IScenarioParser. Valida y parsea archivos JSON importados por el usuario. |


## 6. Flujo de datos entre capas


### 6.1 Flujo de ejecución de la simulación

El flujo de datos para la ejecución completa del algoritmo sigue el siguiente recorrido entre capas:

| Paso | Capa | Descripción |
| --- | --- | --- |
| 1 | Presentación | El usuario pulsa 'Ejecutar'. SimulationControls.tsx invoca el caso de uso runSimulation.ts. |
| 2 | Aplicación | runSimulation.ts obtiene el grafo actual del store, invoca IGraphValidator para verificar consistencia del grafo y llama a computeMarkAndSweepSteps(graph). |
| 3 | Dominio | markAndSweep.ts ejecuta el algoritmo y devuelve SimulationStep[]. |
| 4 | Aplicación | runSimulation.ts almacena los pasos en simulationStore.ts y actualiza la fase a 'done'. |
| 5 | Presentación | GraphCanvas.tsx lee el estado actualizado del store y transforma los objetos y referencias en nodos y aristas de React Flow con los estilos visuales correspondientes. |


### 6.2 Flujo de importación de escenario

El flujo de datos para la importación de un escenario JSON sigue el siguiente recorrido:

| Paso | Capa | Descripción |
| --- | --- | --- |
| 1 | Presentación | El usuario selecciona un archivo JSON. El componente correspondiente invoca el caso de uso importScenario.ts con el contenido del archivo. |
| 2 | Aplicación | importScenario.ts delega en el puerto IScenarioParser (implementado en infraestructura) para validar y parsear el JSON. |
| 3 | Infraestructura | scenarioParser.ts valida la estructura del JSON y construye un MemoryGraph si es válido. En caso de error, devuelve un ValidationError. |
| 4 | Aplicación | importScenario.ts actualiza el store con el nuevo grafo y reinicia el estado de la simulación. |
| 5 | Presentación | GraphCanvas.tsx refleja el nuevo grafo importado. |


### 6.3 Flujo de ejecución paso a paso y automática

El flujo de datos para la ejecución paso a paso (CU-08) y automática (CU-09) sigue un patrón arquitectónicamente distinto al de la ejecución completa. El algoritmo no se invoca de nuevo en cada paso: los pasos fueron precalculados por runSimulation.ts y almacenados en el store.

| Paso | Capa | Descripción |
| --- | --- | --- |
| 1 | Presentación | El usuario pulsa 'Siguiente paso' o el temporizador automático dispara el avance. SimulationControls.tsx invoca el caso de uso stepSimulation.ts. |
| 2 | Aplicación | stepSimulation.ts lee el array steps[] del store y avanza el índice currentStep en +1 (o -1 para retroceder). No invoca el algoritmo. |
| 3 | Aplicación | El store actualiza currentStep y el paso correspondiente queda accesible para la presentación. |
| 4 | Presentación | GraphCanvas.tsx lee el SimulationStep actual del store y actualiza la representación visual del grafo: nodo actual, nodos marcados, referencias recorridas. |
| 5 | Presentación | RightInfoPanel muestra el log del paso actual y la explicación textual correspondiente. |

La ejecución automática (CU-09) es una repetición temporizada de este mismo patrón: SimulationControls.tsx lanza un setInterval que invoca stepSimulation.ts periódicamente con un delay real determinado por la velocidad configurada en el slider (delay = 1000ms / velocidad, rango 1x-10x). El intervalo se cancela cuando currentStep alcanza el último paso, cuando el usuario pulsa pausa, o cuando cambia la velocidad durante la ejecución (en ese caso se cancela el intervalo actual y se crea uno nuevo con el nuevo delay). Este mecanismo garantiza que el avance entre pasos sea perceptible y controlable por el usuario, en coherencia con RF-11.


### 6.4 Transformación dominio → React Flow

La capa de presentación es responsable de transformar las entidades del dominio en los tipos que React Flow requiere. Esta transformación es unidireccional y sin efectos sobre el dominio:

MemoryObject → Node<ObjectNodeData>: cada objeto se traduce a un nodo de React Flow con su posición, etiqueta y datos de estado (marked, alive, isRoot, visitedOrder).

MemoryReference → Edge<ReferenceEdgeData>: cada referencia se traduce a una arista de React Flow con su origen, destino y estado de recorrido.

Los estilos visuales (colores, opacidad, bordes) se calculan en los componentes ObjectNode.tsx y ReferenceEdge.tsx a partir de los datos de estado, no en el dominio.


## 7. Diseño de la interfaz de usuario


### 7.1 Estructura de layout

La interfaz se organiza en un layout de panel único con cinco zonas funcionales:

| Componente | Responsabilidad |
| --- | --- |
| TopBar | Barra superior con el nombre de la aplicación, selector de escenarios predefinidos y controles de importación/exportación. |
| LeftEditorPanel | Panel lateral izquierdo con los controles de edición del escenario: crear objeto, crear referencia, marcar raíz y eliminar elementos. |
| GraphCanvas | Área central principal donde se renderiza el grafo interactivo mediante React Flow. Ocupa la mayor parte del espacio disponible. |
| RightInfoPanel | Panel lateral derecho con la leyenda visual, la explicación textual del paso actual y el registro de ejecución. |
| BottomSimulationPanel | Panel inferior con los controles de simulación: ejecutar, paso a paso, automático, pausar, reiniciar y control de velocidad. |

Trazabilidad RI-01 a RI-06: RI-01 (área principal de visualización) → GraphCanvas. RI-02 (controles organizados por grupos funcionales) → LeftEditorPanel (edición), BottomSimulationPanel (simulación), TopBar (gestión de escenarios). RI-03 y RI-04 (estados visuales de objetos y referencias) → ObjectNode.tsx y ReferenceEdge.tsx. RI-05 (leyenda visual) → StateLegend.tsx en RightInfoPanel. RI-06 (área de información textual) → RightInfoPanel (explicación textual y registro de ejecución).


### 7.2 Estados visuales de los objetos

El sistema diferencia cinco estados visuales para los objetos del grafo, implementados en ObjectNode.tsx mediante clases de Tailwind CSS:

| Estado | Representación visual |
| --- | --- |
| Normal | Objeto activo sin estado especial. Representación estándar con borde y fondo neutros. |
| Raíz | Objeto marcado como raíz. Borde distintivo de color primario y símbolo identificativo. |
| En procesamiento | Objeto que está siendo visitado en el paso actual. Resaltado visual diferenciado. |
| Marcado | Objeto alcanzable marcado durante la fase Mark. Color de fondo diferenciado. |
| Recolectado | Objeto no alcanzable tras la fase Sweep. Opacidad reducida, borde atenuado y etiqueta de estado visible. |


### 7.3 Estados visuales de las referencias

Las referencias se representan con dos estados visuales en ReferenceEdge.tsx:

Normal: arista dirigida con flecha en el extremo destino, color y grosor estándar.

Recorrida: arista que fue traversada durante la fase Mark. Color y grosor diferenciados.


### 7.4 Consideraciones de usabilidad e interacción

Los siguientes requisitos de interfaz del SRS se satisfacen mediante los mecanismos descritos:

| RI | Requisito | Cómo se satisface |
| --- | --- | --- |
| RI-07 | Selección y creación de referencias | React Flow gestiona la selección de nodos y aristas mediante clic simple (onNodeClick, onEdgeClick). La creación de referencias por arrastre se implementa con ConnectionMode.Loose, que permite iniciar una conexión desde cualquier punto del nodo (no solo desde handles fijos). El cursor cambia a crosshair al pasar sobre un nodo. La edición de etiqueta se implementa con onNodeDoubleClick, que activa un input inline sobre el nodo. El evento onNodesChange debe estar conectado al store para que los cambios de posición persistan al re-renderizar. |
| RI-08 | Evitar saturación visual | React Flow proporciona zoom, paneo y layout automático. El diseño de componentes utiliza espaciado y tamaños mínimos definidos en Tailwind CSS para mantener la legibilidad con grafos de hasta 50 objetos. |
| RI-09 | Fase actual siempre visible | BottomSimulationPanel.tsx muestra en todo momento la fase actual de la simulación (idle, mark, sweep, done) mediante un indicador de estado prominente que refleja el atributo phase del store. |
| RI-10 | Feedback inmediato y notificaciones | El store centralizado garantiza que cualquier cambio de estado se propaga reactivamente a todos los componentes suscritos. El sistema de notificaciones (RF-26) se implementa mediante una librería de toasts (react-hot-toast o sonner) invocada desde los casos de uso de aplicación cuando se producen errores, bloqueos o confirmaciones. El diálogo de confirmación para ejecución sin raíces se implementa como un componente modal independiente. |


## 8. Requisitos técnicos de arquitectura

Los siguientes requisitos técnicos de arquitectura, definidos en el presente documento como parte del diseño del sistema, se satisfacen de la siguiente manera:

| RT | Nombre | Cómo se satisface |
| --- | --- | --- |
| RT-01 | Arquitectura modular por capas | Satisfecho mediante la estructura de cuatro capas domain/, application/, presentation/, infrastructure/ descrita en las secciones 2 y 5. |
| RT-02 | Independencia del dominio | Satisfecho: domain/ no importa nada de React, React Flow ni ninguna librería visual. El algoritmo markAndSweep.ts es una función pura sin dependencias externas. |
| RT-03 | Flujo de dependencias | Satisfecho: las dependencias siempre apuntan hacia el interior. La regla de dependencia se describe en la sección 2.3. |
| RT-04 | Gestión centralizada del estado | Satisfecho mediante simulationStore.ts en la capa de aplicación, que centraliza el estado del escenario y de la simulación. |
| RT-05 | Serialización de escenarios | Satisfecho mediante scenarioSerializer.ts y scenarioParser.ts en la capa de infraestructura, con formato JSON. |


## 9. Trazabilidad diseño ↔ requisitos

La siguiente tabla relaciona los elementos de diseño principales con los requisitos funcionales del SRS v1.4 que satisfacen:

| Elemento de diseño | Módulo | RF relacionados |
| --- | --- | --- |
| MemoryObject, MemoryGraph | domain/models/ | RF-01, RF-06, RF-07 |
| MemoryReference | domain/models/ | RF-04, RF-07 |
| SimulationState, SimulationStep | domain/models/ | RF-08, RF-10, RF-15 |
| markAndSweep.ts — fase Mark | domain/algorithms/ | RF-09, RF-10, RF-23, RF-24 |
| markAndSweep.ts — fase Sweep | domain/algorithms/ | RF-12, RF-13 |
| graphValidator.ts | domain/validators/ | RF-19 |
| simulationStore.ts | application/ | RF-08, RF-16, RF-17, RF-21, RF-22 |
| runSimulation.ts | application/useCases/ | RF-14 |
| stepSimulation.ts | application/useCases/ | RF-15 |
| deleteObject.ts | application/useCases/ | RF-02, RF-26 |
| editObject.ts | application/useCases/ | RF-03 |
| deleteReference.ts | application/useCases/ | RF-05, RF-26 |
| createReference.ts | application/useCases/ | RF-04, RF-26 |
| importScenario.ts | application/useCases/ | RF-25, RF-26 |
| exportScenario.ts | application/useCases/ | RF-25, RF-26 |
| loadPredefinedScenario.ts | application/useCases/ | RF-18 |
| clearScenario.ts | application/useCases/ | RF-17 |
| GraphCanvas.tsx (onNodesChange) | presentation/ | RF-03 — persiste posición de nodos al re-renderizar |
| GraphCanvas.tsx (ConnectionMode.Loose) | presentation/ | RF-04 — nodo completo como handle de conexión |
| GraphCanvas.tsx, ObjectNode.tsx | presentation/ | RF-07, RF-10, RF-13, RF-16, RF-20 |
| ObjectNode.tsx (onNodeDoubleClick) | presentation/ | RF-03 — edición inline de etiqueta |
| SimulationControls.tsx (setInterval) | presentation/ | RF-11 — delay real entre pasos, slider 1x-10x |
| SimulationControls.tsx | presentation/ | RF-14, RF-15 |
| ExecutionLog.tsx | presentation/ | RF-22 |
| StateLegend.tsx | presentation/ | RF-20 |
| ScenarioSelector.tsx | presentation/ | RF-18 |
| ToastNotifications (react-hot-toast) | presentation/ | RF-26 — sistema completo de notificaciones |
| scenarioSerializer.ts | infrastructure/ | RF-25 |
| scenarioParser.ts | infrastructure/ | RF-19, RF-25 |
