# GC Visualizer — Risk Management Plan (RMP v1.1)


### Historial de revisiones

| Versión | Fecha | Descripción | Autor |
| --- | --- | --- | --- |
| 1.0 | 04/05/2026 | Versión inicial del RMP. | — |
| 1.1 | 04/05/2026 | Correcciones VAL-RMP-v1.0 (H-01 a H-04). Eliminadas referencias al contexto académico. Categoría 'Académicos' renombrada a 'Documentación y trazabilidad'. Reformulados R-09, R-10, R-11 y R-13. | — |
| 1.2 | 05/05/2026 | Segunda versión. Actualización de referencias a SRS v1.4, SDD v1.3, STP v1.5 y STS v1.3. | — |


## 1. Introducción


### 1.1 Propósito

El presente documento constituye el Plan de Gestión de Riesgos (RMP) del proyecto GC Visualizer, elaborado conforme a los estándares ISO 31000:2018 e IEEE 16085:2021. Su objetivo es identificar, analizar, evaluar y planificar la respuesta a los riesgos que pueden afectar al desarrollo y entrega del proyecto, tanto desde la perspectiva técnica como organizativa.


### 1.2 Ámbito

El plan cubre los riesgos del proyecto GC Visualizer en su totalidad: riesgos técnicos de implementación, riesgos de diseño arquitectónico, riesgos de pruebas, riesgos de documentación y trazabilidad, y riesgos de gestión del proyecto. No cubre riesgos de producción ni de operación, ya que el sistema no está destinado a un entorno de producción real.


### 1.3 Referencias

ISO 31000:2018 — Risk Management. Guidelines.

IEEE Std 16085:2021 — Systems and Software Engineering — Risk Management.

SRS GC Visualizer v1.4 — Especificación de Requisitos del Software.

SDD GC Visualizer v1.3 — Documento de Diseño del Software.

STP GC Visualizer v1.5 — Plan de Pruebas del Software.

STS GC Visualizer v1.3 — Especificación de Casos de Prueba.


## 2. Marco de gestión de riesgos


### 2.1 Proceso de gestión de riesgos

El proceso de gestión de riesgos sigue el ciclo definido por ISO 31000:2018 y se aplica de forma iterativa a lo largo del proyecto:

| Fase | Descripción |
| --- | --- |
| Identificación | Detección de eventos que pueden afectar negativamente al proyecto. |
| Análisis | Evaluación de la probabilidad e impacto de cada riesgo. |
| Evaluación | Cálculo de la exposición y priorización de los riesgos. |
| Tratamiento | Definición de la estrategia y planes de mitigación y contingencia. |
| Seguimiento | Revisión periódica del estado de los riesgos a lo largo del proyecto. |


### 2.2 Escalas de probabilidad e impacto

Los riesgos se evalúan utilizando las siguientes escalas:


#### 2.2.1 Escala de probabilidad

| Nivel | Definición |
| --- | --- |
| Alta | Probabilidad superior al 60%. El evento es probable que ocurra durante el proyecto. |
| Media | Probabilidad entre 30% y 60%. El evento puede ocurrir. |
| Baja | Probabilidad inferior al 30%. El evento es poco probable pero no descartable. |


#### 2.2.2 Escala de impacto

| Nivel | Definición |
| --- | --- |
| Alta | El riesgo compromete la entrega del proyecto, un requisito funcional principal o la calidad del algoritmo. |
| Media | El riesgo afecta a requisitos secundarios, al calendario o a la calidad visual del sistema. |
| Baja | El riesgo tiene un impacto menor y gestionable sin afectar a los objetivos principales. |


#### 2.2.3 Cálculo de la exposición

La exposición al riesgo se calcula combinando probabilidad e impacto según la siguiente matriz:

| Probabilidad \ Impacto | Baja | Media | Alta |
| --- | --- | --- | --- |
| Alta | Media | Alta | Crítica |
| Media | Baja | Media | Alta |
| Baja | Baja | Baja | Media |


### 2.3 Estrategias de tratamiento

| Estrategia | Descripción |
| --- | --- |
| Evitar | Modificar el plan del proyecto para eliminar el riesgo o proteger los objetivos de su impacto. |
| Mitigar | Reducir la probabilidad o el impacto del riesgo mediante acciones preventivas. |
| Transferir | Trasladar el impacto del riesgo a un tercero (herramienta alternativa, documentación externa). |
| Aceptar | Reconocer la existencia del riesgo y no actuar proactivamente, asumiendo las consecuencias si ocurre. |


## 3. Registro de riesgos

El registro recoge los 14 riesgos identificados para el proyecto GC Visualizer, organizados en cinco categorías: técnicos de dominio, arquitectónicos, de pruebas, de documentación y trazabilidad, y de gestión.


### 3.1 Riesgos técnicos de dominio


#### R-01  Implementación incorrecta del algoritmo Mark & Sweep

| Categoría | Técnico — Dominio |
| --- | --- |
| Descripción | El algoritmo no produce el resultado correcto para algún caso estructural del grafo (ciclos, autorreferencias, múltiples raíces, escenario vacío), comprometiendo la corrección del sistema. |
| Probabilidad | Media |
| Impacto | Alta |
| Exposición | Alta |
| Estrategia | Mitigar |
| Plan de mitigación | El dominio está completamente separado de la presentación (SDD RT-02), lo que permite testearlo de forma unitaria e independiente. El STS v1.3 cubre los 8 casos estructurales del algoritmo (TC-U-06 a TC-U-14). Las garantías formales del algoritmo están documentadas en el SDD v1.3 sección 4.5. |
| Plan de contingencia | Si se detecta un error en la fase de pruebas unitarias, corregir el módulo markAndSweep.ts y re-ejecutar el conjunto completo de pruebas unitarias antes de avanzar a integración. |
| Estado | Activo |


#### R-02  Bucle infinito en grafos con ciclos o autorreferencias

| Categoría | Técnico — Dominio |
| --- | --- |
| Descripción | El algoritmo entra en un bucle infinito al procesar un grafo con ciclos o autorreferencias, bloqueando la ejecución del sistema. |
| Probabilidad | Baja |
| Impacto | Alta |
| Exposición | Media |
| Estrategia | Mitigar |
| Plan de mitigación | El algoritmo usa un conjunto de nodos visitados (patrón DFS con conjunto de visitados) que previene la revisita. TC-U-09 y TC-U-14 verifican específicamente este comportamiento. La garantía de terminación está documentada en SDD v1.3 sección 4.5. |
| Plan de contingencia | Si se detecta un bucle en tiempo de ejecución, añadir un límite máximo de iteraciones como salvaguarda de emergencia y abrir un defecto bloqueante. |
| Estado | Activo |


#### R-03  Inconsistencia entre el estado lógico del grafo y su representación visual

| Categoría | Técnico — Dominio |
| --- | --- |
| Descripción | El estado interno del MemoryGraph diverge de lo que React Flow muestra al usuario, produciendo una visualización incorrecta o engañosa del resultado del algoritmo. |
| Probabilidad | Media |
| Impacto | Alta |
| Exposición | Alta |
| Estrategia | Mitigar |
| Plan de mitigación | La transformación dominio→React Flow está centralizada en GraphCanvas.tsx (SDD sección 6.4). El store centralizado garantiza que cualquier cambio de estado se propaga reactivamente. TC-E-10 verifica la coherencia entre el resultado del algoritmo y la representación visual. |
| Plan de contingencia | Si se detecta una divergencia visual, verificar primero el store (estado lógico) y luego la transformación en GraphCanvas. El dominio puede testearse independientemente para aislar si el error es del algoritmo o de la visualización. |
| Estado | Activo |


### 3.2 Riesgos arquitectónicos


#### R-04  Acoplamiento inadvertido entre el dominio y React

| Categoría | Arquitectónico |
| --- | --- |
| Descripción | Durante la implementación, el código del dominio adquiere dependencias de React (hooks, componentes, contextos), violando la regla de dependencia de Clean Architecture y dificultando las pruebas unitarias. |
| Probabilidad | Media |
| Impacto | Media |
| Exposición | Media |
| Estrategia | Mitigar |
| Plan de mitigación | La regla de dependencia está documentada en SDD sección 2.3 y es verificable mediante herramientas de análisis estático (eslint-plugin-boundaries o similar). Las pruebas unitarias de Jest sin entorno de React detectarán de forma inmediata cualquier dependencia inadvertida porque fallarán al intentar importar módulos de React. |
| Plan de contingencia | Si se detecta acoplamiento, refactorizar el módulo afectado para mover la lógica de React a la capa de presentación. El dominio nunca importa de React. |
| Estado | Activo |


#### R-05  Limitaciones de React Flow para los requisitos de visualización

| Categoría | Arquitectónico |
| --- | --- |
| Descripción | La librería React Flow no soporta alguno de los requisitos visuales del sistema (autorreferencias, estados diferenciados de nodos, representación de referencias recorridas), obligando a implementar soluciones complejas o a cambiar de librería. |
| Probabilidad | Baja |
| Impacto | Alta |
| Exposición | Media |
| Estrategia | Mitigar |
| Plan de mitigación | React Flow soporta nodos y aristas completamente personalizables mediante los componentes ObjectNode.tsx y ReferenceEdge.tsx (SDD sección 5.2). Las autorreferencias son aristas con mismo origen y destino, que React Flow gestiona mediante aristas curvas. Los estados visuales se implementan mediante clases de Tailwind CSS en los componentes personalizados. |
| Plan de contingencia | Si un requisito visual específico no es implementable con React Flow, evaluar si puede resolverse con CSS avanzado antes de considerar un cambio de librería. Un cambio de librería en fase avanzada tendría impacto Alto en el calendario. |
| Estado | Activo |


#### R-06  Rendimiento degradado con grafos de tamaño medio

| Categoría | Arquitectónico |
| --- | --- |
| Descripción | El sistema presenta degradación perceptible (lag visual, respuesta lenta) con grafos de más de 30 objetos, incumpliendo RNF-03 del SRS (hasta 50 objetos sin degradación significativa). |
| Probabilidad | Media |
| Impacto | Media |
| Exposición | Media |
| Estrategia | Mitigar |
| Plan de mitigación | React Flow implementa virtualización de nodos para mejorar el rendimiento. El algoritmo Mark & Sweep es O(V+E) en tiempo y espacio, adecuado para grafos de tamaño docente. TC-U-05 y TC-I-05 verifican el comportamiento con grafos de tamaño medio. RNF-03 establece umbrales cuantitativos verificables (200ms, 100ms, 30fps). |
| Plan de contingencia | Si se detecta degradación, perfilar la aplicación para identificar el cuello de botella (algoritmo vs renderizado). Si es de renderizado, considerar memoización de componentes React o reducción de re-renders innecesarios. |
| Estado | Activo |


### 3.3 Riesgos de pruebas


#### R-07  Inestabilidad de pruebas end-to-end con Cypress

| Categoría | Pruebas |
| --- | --- |
| Descripción | Las pruebas Cypress producen resultados inconsistentes (pasan en unas ejecuciones y fallan en otras) por tiempos de espera variables o selectores frágiles, dificultando la verificación fiable del sistema. |
| Probabilidad | Media |
| Impacto | Media |
| Exposición | Media |
| Estrategia | Mitigar |
| Plan de mitigación | El STP v1.5 establece como convención el uso de selectores data-testid en todos los componentes bajo prueba, evitando selectores CSS frágiles. Los tiempos de espera de Cypress se configuran mediante cy.intercept y cy.wait para operaciones asíncronas. Cada TC-E parte de un estado limpio de la aplicación (precondición explícita). |
| Plan de contingencia | Si una prueba es persistentemente inestable, marcarla como pendiente de estabilización, documentar el problema como issue y ejecutar el TC manualmente hasta que se estabilice. |
| Estado | Activo |


#### R-08  Cobertura insuficiente de casos límite del algoritmo

| Categoría | Pruebas |
| --- | --- |
| Descripción | Casos límite del algoritmo no contemplados en el STS v1.3 quedan sin verificar, permitiendo que defectos en el dominio lleguen a la fase de integración o sistema. |
| Probabilidad | Baja |
| Impacto | Alta |
| Exposición | Media |
| Estrategia | Mitigar |
| Plan de mitigación | El STS v1.3 cubre los 8 casos estructurales del CP original: cadena lineal, árbol, ciclo alcanzable, ciclo inalcanzable, múltiples raíces, autorreferencia, escenario vacío y escenario sin raíces. El informe de cobertura de Jest identifica ramas no cubiertas. |
| Plan de contingencia | Si el informe de cobertura revela ramas del algoritmo sin cubrir, añadir los TC unitarios necesarios antes de avanzar a la siguiente fase de implementación. |
| Estado | Activo |


### 3.4 Riesgos de documentación y trazabilidad


#### R-09  Decisiones arquitectónicas sin justificación formal documentada

| Categoría | Documentación y trazabilidad |
| --- | --- |
| Descripción | Las decisiones de diseño relevantes del sistema (elección de Clean Architecture, uso de React Flow, paradigma mixto OO/funcional) no están suficientemente justificadas en los documentos del proyecto, dificultando la comprensión y el mantenimiento del sistema por parte de terceros. |
| Probabilidad | Media |
| Impacto | Media |
| Exposición | Media |
| Estrategia | Mitigar |
| Plan de mitigación | El SDD v1.3 documenta explícitamente todas las decisiones de diseño relevantes con su justificación (secciones 2.1, 2.4 y 5.1). La nota sobre el carácter iterativo del diseño está recogida en el SDD v1.3 sección 5.1. El proceso de validación aplicado a cada documento garantiza la coherencia entre las decisiones documentadas. |
| Plan de contingencia | Si durante la revisión del sistema se detecta que alguna decisión de diseño carece de justificación formal, añadir la justificación en el SDD antes de cerrar la fase de implementación correspondiente. |
| Estado | Activo |


#### R-10  Divergencia entre especificación e implementación sin actualización documental

| Categoría | Documentación y trazabilidad |
| --- | --- |
| Descripción | Durante el desarrollo, la implementación diverge de lo especificado en el SRS o el SDD sin actualizar los documentos, generando inconsistencias entre la especificación y el sistema real que dificultan el mantenimiento y la verificación del sistema. |
| Probabilidad | Alta |
| Impacto | Media |
| Exposición | Alta |
| Estrategia | Mitigar |
| Plan de mitigación | El historial de revisiones de cada documento registra los cambios aplicados. La trazabilidad RF↔TC del STS permite detectar rápidamente si un cambio en el comportamiento del sistema afecta a algún requisito. El proceso de validación de dos ciclos aplicado a cada documento proporciona una línea base de calidad documentada. |
| Plan de contingencia | Si durante la implementación se detecta que un requisito no es implementable tal como está especificado, actualizar el SRS con el cambio y registrarlo en el historial de revisiones antes de cerrar la fase de implementación. La trazabilidad entre documentos es la clave para detectar el alcance del impacto. |
| Estado | Activo |


#### R-11  Complejidad visual insuficiente para demostrar el valor didáctico

| Categoría | Documentación y trazabilidad |
| --- | --- |
| Descripción | La interfaz resultante no transmite con suficiente claridad el funcionamiento del algoritmo, comprometiendo el objetivo principal del sistema: facilitar la comprensión del algoritmo Mark & Sweep mediante visualización interactiva. |
| Probabilidad | Baja |
| Impacto | Alta |
| Exposición | Media |
| Estrategia | Mitigar |
| Plan de mitigación | Los requisitos de interfaz RI-03, RI-05, RI-06 y RI-09 del SRS v1.4 especifican exactamente los elementos visuales necesarios: estados diferenciados, leyenda, explicaciones textuales e indicador de fase. Los TC-E-07, TC-E-09 y TC-E-14 verifican estos elementos. El carácter didáctico está documentado como objetivo principal en el SRS v1.4 sección 1.2. |
| Plan de contingencia | Si en la revisión de la implementación el valor didáctico no es evidente, revisar primero la leyenda (StateLegend.tsx) y las explicaciones textuales (ExecutionLog.tsx), que son los elementos de mayor impacto didáctico según los requisitos. |
| Estado | Activo |


### 3.5 Riesgos de gestión del proyecto


#### R-12  Subestimación del esfuerzo de implementación de la interfaz

| Categoría | Gestión |
| --- | --- |
| Descripción | La implementación de los componentes React y la integración con React Flow requiere más tiempo del estimado, comprimiendo el tiempo disponible para las pruebas. |
| Probabilidad | Alta |
| Impacto | Media |
| Exposición | Alta |
| Estrategia | Mitigar |
| Plan de mitigación | La arquitectura Clean Architecture garantiza que el dominio y el algoritmo pueden implementarse y probarse de forma independiente a la interfaz. Si la interfaz se retrasa, las pruebas unitarias e de integración pueden completarse mientras tanto. El modelo en V permite avanzar en la verificación de los niveles inferiores sin esperar a la presentación. |
| Plan de contingencia | Si el esfuerzo de interfaz supera lo estimado, priorizar los componentes que afectan a los TC-E de mayor criticidad (TC-E-07, TC-E-10) y aplazar los de menor prioridad (TC-E-14, TC-E-15). |
| Estado | Activo |


#### R-13  Cambios de alcance no controlados durante la implementación

| Categoría | Gestión |
| --- | --- |
| Descripción | Durante la implementación surgen nuevas ideas de funcionalidad (nuevos algoritmos, nuevos modos de visualización) que no estaban en el SRS y consumen tiempo del proyecto. |
| Probabilidad | Media |
| Impacto | Media |
| Exposición | Media |
| Estrategia | Evitar |
| Plan de mitigación | El SRS v1.4 define explícitamente en la sección 2.2 el alcance excluido: no se implementarán algoritmos alternativos, optimizaciones avanzadas ni análisis de código real. Cualquier idea nueva durante la implementación debe evaluarse contra el alcance del SRS antes de incorporarse. |
| Plan de contingencia | Si surge una idea de mejora relevante durante la implementación, documentarla en un registro de mejoras futuras del proyecto para su consideración en versiones posteriores del sistema. La prioridad es mantener el alcance del SRS v1.4 y no comprometer la calidad de lo ya especificado. |
| Estado | Activo |


#### R-14  Obsolescencia de dependencias durante el desarrollo

| Categoría | Gestión |
| --- | --- |
| Descripción | Una actualización de React, React Flow, Vite o Cypress durante el desarrollo introduce cambios incompatibles que obligan a refactorizar código ya implementado. |
| Probabilidad | Baja |
| Impacto | Media |
| Exposición | Baja |
| Estrategia | Aceptar |
| Plan de mitigación | El package.json del proyecto fijará las versiones de las dependencias principales mediante versiones exactas (sin ^ ni ~) para evitar actualizaciones automáticas. Las versiones utilizadas están documentadas en el SRS sección 2.4. |
| Plan de contingencia | Si una actualización forzada (por ejemplo, por una vulnerabilidad de seguridad) introduce incompatibilidades, evaluar el impacto módulo a módulo y corregir solo los componentes afectados. El dominio, al no depender de ninguna librería externa, no se verá afectado. |
| Estado | Activo |


## 4. Resumen y priorización de riesgos

La siguiente tabla recoge el resumen de todos los riesgos identificados, ordenados por exposición:

| ID | Nombre | Categoría | Prob. | Impacto | Exposición |
| --- | --- | --- | --- | --- | --- |
| R-01 | Implementación incorrecta del algoritmo | Técnico | Media | Alta | Alta |
| R-03 | Inconsistencia estado lógico vs visual | Técnico | Media | Alta | Alta |
| R-10 | Divergencia especificación vs implementación | Doc. y trazabilidad | Alta | Media | Alta |
| R-12 | Subestimación esfuerzo de interfaz | Gestión | Alta | Media | Alta |
| R-02 | Bucle infinito en grafos con ciclos | Técnico | Baja | Alta | Media |
| R-04 | Acoplamiento dominio con React | Arquitectónico | Media | Media | Media |
| R-05 | Limitaciones de React Flow | Arquitectónico | Baja | Alta | Media |
| R-06 | Rendimiento degradado con grafos medios | Arquitectónico | Media | Media | Media |
| R-07 | Inestabilidad pruebas e2e Cypress | Pruebas | Media | Media | Media |
| R-08 | Cobertura insuficiente casos límite | Pruebas | Baja | Alta | Media |
| R-09 | Decisiones arquitectónicas sin justificación | Doc. y trazabilidad | Media | Media | Media |
| R-11 | Complejidad visual insuficiente | Doc. y trazabilidad | Baja | Alta | Media |
| R-13 | Cambios de alcance no controlados | Gestión | Media | Media | Media |
| R-14 | Obsolescencia de dependencias | Gestión | Baja | Media | Baja |


## 5. Plan de seguimiento

Los riesgos se revisan al inicio de cada fase de implementación del Modelo en V. En cada revisión se actualiza el estado de cada riesgo activo y se verifica si han materializado nuevos riesgos no identificados inicialmente.


### 5.1 Estados de un riesgo

| Estado | Descripción |
| --- | --- |
| Activo | El riesgo está identificado y su plan de mitigación está en curso o pendiente de activar. |
| Materializado | El evento de riesgo ha ocurrido. Se activa el plan de contingencia. |
| Mitigado | Las acciones de mitigación han reducido la exposición a un nivel aceptable. |
| Cerrado | El riesgo ya no aplica al estado actual del proyecto. |


### 5.2 Umbrales de escalada

Se establece el siguiente umbral de escalada para la toma de decisiones:

Exposición Crítica: requiere decisión inmediata sobre el alcance o el calendario del proyecto.

Exposición Alta: requiere revisión del plan de mitigación en la siguiente fase.

Exposición Media: se gestiona mediante el plan de mitigación establecido sin escalada.

Exposición Baja: se monitoriza sin acción proactiva.
