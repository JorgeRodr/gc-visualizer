# GC Visualizer — Software Test Plan (STP v1.4)


### Historial de revisiones

| Versión | Fecha | Descripción | Autor |
| --- | --- | --- | --- |
| 1.0 | 04/05/2026 | Versión inicial. Alineado con STS v1.3. | — |
| 1.1 | 04/05/2026 | Correcciones VAL-STP-v1.0 (H-01 a H-05). | — |
| 1.2 | 04/05/2026 | Correcciones VAL2-STP-v1.1 (H2-01, H2-02). | — |
| 1.3 | 04/05/2026 | Correcciones VAL3-STP-v1.2 (H3-01, H3-02, H3-03). | — |
| 1.4 | 05/05/2026 | Correcciones VAL4-STP-v1.3 (HV-01 a HV-05). Adaptación al Modelo en V. | — |
| 1.5 | 05/05/2026 | Segunda versión. Actualización derivada de STS v1.3: referencias actualizadas a SRS v1.4, UCD v1.4, SDD v1.3 y STS v1.3. Total de TC-E actualizado de 17 a 21 en tabla de niveles y sección 6.1. | — |


## 1. Introducción


### 1.1 Propósito

El presente documento define el plan de pruebas del sistema GC Visualizer, elaborado conforme al estándar IEEE 829:2008. Su objetivo es describir la estrategia general de pruebas, los niveles de prueba adoptados, los criterios de entrada y salida de cada nivel, el entorno de ejecución, la integración con el pipeline de CI/CD y la gestión de defectos.

Este documento es complementario al STS GC Visualizer v1.3, que especifica los casos de prueba concretos. El STP define el marco en el que esos casos se ejecutan y gestionan.


### 1.2 Ámbito

El plan cubre las pruebas del sistema GC Visualizer en su totalidad: dominio, algoritmo, integración entre capas e interfaz de usuario. Las pruebas de compatibilidad con navegadores obsoletos o no modernos quedan fuera del ámbito. La compatibilidad con versiones actuales de Chrome, Firefox, Edge y Safari, exigida por RNF-07 del SRS v1.4, se cubre mediante la nota de compatibilidad de la sección 3.2. Las pruebas de rendimiento bajo carga extrema (grafos de más de 50 objetos) quedan igualmente fuera del ámbito, en coherencia con el umbral establecido en RNF-03 del SRS v1.4.


### 1.3 Referencias

IEEE Std 829:2008 — Standard for Software and System Test Documentation.

ISO/IEC/IEEE 29119 — Software Testing.

SRS GC Visualizer v1.4 — Especificación de Requisitos del Software.

UCD GC Visualizer v1.4 — Documento de Casos de Uso.

SDD GC Visualizer v1.3 — Documento de Diseño del Software.

STS GC Visualizer v1.3 — Especificación de Casos de Prueba.


## 2. Estrategia general de pruebas


### 2.1 Enfoque adoptado

La estrategia de pruebas de GC Visualizer sigue un enfoque de pirámide de pruebas, con mayor número de pruebas en los niveles inferiores (unitarias) y menor número en los niveles superiores (e2e). Este enfoque maximiza la velocidad de ejecución y la cobertura del dominio, reservando las pruebas más costosas para la validación de flujos completos de usuario.

La estrategia se articula en tres principios:

Independencia del dominio: las pruebas unitarias verifican el dominio sin dependencias de React ni de la interfaz, en coherencia con la arquitectura Clean Architecture del SDD.

Trazabilidad completa: cada caso de prueba del STS está trazado a al menos un requisito funcional del SRS v1.4.

Automatización total: los tres niveles de prueba se ejecutan automáticamente en el pipeline de CI/CD al completar cada fase de implementación, garantizando la verificación sistemática sin intervención manual.


### 2.2 Niveles de prueba

El sistema contempla tres niveles de prueba, definidos en detalle en el STS v1.3:

| Nivel | Prefijo | Herramienta | N.º TC | Alcance | Cuándo se ejecuta |
| --- | --- | --- | --- | --- | --- |
| Pruebas unitarias | TC-U-XX | Jest | 14 | Dominio puro: entidades, algoritmo Mark & Sweep, validador de grafo. Sin dependencias externas. | En cada push/PR al repositorio. |
| Pruebas de integración | TC-I-XX | Jest | 10 | Interacción entre capas: casos de uso, store, serialización JSON. | En cada push/PR al repositorio. |
| Pruebas end-to-end | TC-E-XX | Cypress | 21 | Flujos completos de usuario desde el navegador. | Al completar la fase de implementación. El pipeline CI/CD actúa como mecanismo de ejecución automática al cerrar la fase. |


### 2.3 Cobertura objetivo

Los objetivos de cobertura son:

Cobertura de requisitos: el 100% de los RF del SRS v1.4 tiene al menos un caso de prueba en el STS v1.3.

Cobertura de ramas del algoritmo: el 100% de los casos estructurales del algoritmo Mark & Sweep (cadena lineal, árbol, ciclo alcanzable, ciclo inalcanzable, múltiples raíces, autorreferencia, escenario vacío, escenario sin raíces) tiene un caso de prueba unitario.

Cobertura de flujos de usuario: el 100% de los casos de uso del UCD v1.4 tiene al menos un caso de prueba e2e.

Cobertura de código: se establece como objetivo orientativo un 80% de cobertura de líneas en los módulos de dominio y aplicación, medida con el informe de cobertura de Jest.


## 3. Entorno de pruebas


### 3.1 Entorno local

Las pruebas unitarias e de integración se ejecutan en el entorno local de desarrollo. Los requisitos mínimos son:

| Elemento | Detalle |
| --- | --- |
| Sistema operativo | Cualquier SO moderno con soporte para Node.js (Windows, macOS, Linux). |
| Node.js | Versión 18 LTS o superior. |
| Gestor de paquetes | npm o pnpm. |
| Herramienta de pruebas | Jest (incluido como dependencia de desarrollo del proyecto). |
| Comando de ejecución | npm run test (pruebas unitarias e integración). npm run test:coverage (con informe de cobertura). |


### 3.2 Entorno de pruebas e2e

Las pruebas end-to-end con Cypress requieren la aplicación en ejecución. Los requisitos son:

| Elemento | Detalle |
| --- | --- |
| Aplicación | GC Visualizer ejecutándose en modo desarrollo (npm run dev) o servida en modo producción (npm run preview). |
| Navegador | Cypress ejecuta las pruebas sobre Chromium embebido por defecto. Compatible también con Firefox y Edge mediante configuración. |
| Comando de ejecución | npm run cypress:run (ejecución headless en CI/CD). npm run cypress:open (modo interactivo para desarrollo de pruebas). |
| URL base | http://localhost:5173 (puerto por defecto de Vite en desarrollo). |

Convención de selectores: los componentes React que sean objeto de pruebas e2e incluirán el atributo data-testid con un identificador descriptivo (por ejemplo, data-testid="btn-ejecutar", data-testid="node-objeto"). Los selectores Cypress utilizarán exclusivamente estos atributos, evitando selectores CSS frágiles dependientes de la estructura interna de los componentes.

Compatibilidad de navegadores: el pipeline CI/CD ejecuta las pruebas e2e sobre Chromium por defecto, en cumplimiento del RNF-07 del SRS v1.4, se recomienda ejecutar TC-E-10 (simulación completa) y TC-E-15 (importación/exportación) sobre Firefox y Edge en entorno local antes de cada release.


### 3.3 Entorno de CI/CD

El pipeline de integración continua se implementa mediante GitHub Actions. La configuración contempla dos workflows:

| Workflow | Descripción |
| --- | --- |
| ci.yml — Pruebas unitarias e integración | Se ejecuta en cada push y en cada pull request a cualquier rama. Pasos: checkout del repositorio, instalación de dependencias, ejecución de Jest con informe de cobertura, publicación del informe como artefacto del workflow. |
| e2e.yml — Pruebas end-to-end | Se ejecuta al completar la fase de implementación, cuando las pruebas unitarias e integración han pasado satisfactoriamente. En el repositorio, el disparador es el push a la rama principal que marca el cierre de la fase. Pasos: checkout, instalación de dependencias, construcción de la aplicación, arranque del servidor de preview, ejecución de Cypress en modo headless, publicación de vídeos y capturas como artefactos del workflow. |


## 4. Criterios de entrada y salida


### 4.1 Criterios de entrada

Las condiciones que deben cumplirse antes de iniciar la ejecución de cada nivel de prueba son:


#### 4.1.1 Pruebas unitarias e integración

El código del módulo bajo prueba ha sido implementado y compilado sin errores de TypeScript.

Los casos de prueba del STS v1.3 correspondientes al nivel han sido implementados en Jest.

Las dependencias del proyecto están instaladas (npm install completado sin errores).


#### 4.1.2 Pruebas end-to-end

Las pruebas unitarias e de integración de la fase de implementación actual han pasado satisfactoriamente.

La aplicación arranca correctamente en modo desarrollo o preview sin errores en consola.

Los casos de prueba del STS v1.3 correspondientes al nivel e2e han sido implementados en Cypress.


### 4.2 Criterios de salida

Las condiciones que deben cumplirse para considerar un nivel de prueba completado son:

Definición de fallo justificado: se considera fallo justificado aquel caso de prueba que falla por una causa conocida, documentada en un issue del repositorio y aceptada explícitamente. Los fallos justificados deben ser minoría y estar acotados en el tiempo con una fecha de resolución comprometida.


#### 4.2.1 Pruebas unitarias e integración

El 100% de los casos de prueba TC-U y TC-I del STS v1.3 han sido ejecutados.

El 0% de los casos de prueba presenta fallos no justificados.

La cobertura de líneas en los módulos domain/ y application/ supera el 80%. El informe de cobertura se genera automáticamente en cada ejecución del pipeline y se revisa como indicador de progreso al finalizar cada fase de implementación. El umbral del 80% es el objetivo al cierre del proyecto.

El informe de cobertura ha sido generado y publicado como artefacto del pipeline.


#### 4.2.2 Pruebas end-to-end

El 100% de los casos de prueba TC-E del STS v1.3 han sido ejecutados.

El 0% de los casos de prueba presenta fallos no justificados.

Los vídeos de ejecución de Cypress han sido publicados como artefactos del pipeline.

No existen regresiones respecto a la ejecución anterior del pipeline e2e.


### 4.3 Criterios de suspensión y reanudación

Si durante la ejecución de las pruebas se detecta un bloqueo (un fallo que impide la ejecución de casos de prueba dependientes), se suspenderá la ejecución del nivel afectado hasta que el bloqueo sea resuelto. La reanudación requiere que el defecto bloqueante haya sido corregido y que los casos de prueba afectados hayan vuelto a pasar.


## 5. Gestión de defectos


### 5.1 Clasificación de defectos

Los defectos detectados durante la ejecución de las pruebas se clasifican según su severidad:

| Severidad | Descripción | Ejemplo |
| --- | --- | --- |
| Bloqueante | El defecto impide la ejecución de otros casos de prueba o hace el sistema inutilizable. Requiere corrección inmediata antes de continuar. | El algoritmo entra en bucle infinito con un grafo cíclico. |
| Alta | El defecto afecta a un requisito funcional principal y no tiene solución alternativa aceptable. | Un objeto recolectado aparece visualmente como objeto marcado (alcanzable). |
| Media | El defecto afecta a un requisito funcional secundario o tiene una solución alternativa. | La notificación de referencias eliminadas no aparece. |
| Baja | El defecto afecta a aspectos visuales o de usabilidad sin impacto funcional. | El color de un estado visual no coincide exactamente con la leyenda. |


### 5.2 Ciclo de vida de un defecto

Todo defecto detectado durante la ejecución de las pruebas sigue el siguiente ciclo de vida:

| Estado | Descripción |
| --- | --- |
| Detectado | El caso de prueba falla. El sistema de CI/CD registra el fallo automáticamente. |
| Registrado | Se abre un issue en el repositorio con: identificador del TC fallido, descripción del comportamiento observado vs esperado, severidad asignada y evidencias (log, captura, vídeo Cypress). |
| Analizado | El desarrollador analiza la causa raíz del defecto. |
| Corregido | Se implementa la corrección en una rama específica. |
| Verificado | Los casos de prueba afectados se ejecutan de nuevo. Si pasan, el defecto se cierra. |
| Cerrado | El issue se cierra y la corrección se integra en la rama principal. |


## 6. Planificación y secuencia de ejecución


### 6.1 Secuencia de ejecución

Las pruebas se ejecutan en el siguiente orden, respetando las dependencias entre niveles:

| Orden | Nivel | Herramienta | Condición de inicio |
| --- | --- | --- | --- |
| 1 | Pruebas unitarias (TC-U-01 a TC-U-14) | Jest | Primer nivel. Independientes. Se ejecutan al completar la codificación de cada módulo. En el pipeline CI/CD, se disparan automáticamente ante cada integración de código. |
| 2 | Pruebas de integración (TC-I-01 a TC-I-10) | Jest | Segundo nivel. Requieren que las unitarias pasen. |
| 3 | Pruebas end-to-end (TC-E-01 a TC-E-21) | Cypress | Tercer nivel. Requieren que las pruebas unitarias e integración de la fase de implementación actual pasen satisfactoriamente. En el pipeline CI/CD, la condición equivalente es que las pruebas del mismo workflow hayan pasado. |


### 6.2 Estrategia de regresión

Las pruebas unitarias e integración se ejecutan automáticamente mediante el pipeline CI/CD ante cada integración de código en el repositorio, garantizando que ningún módulo previamente verificado se ve afectado por nuevas incorporaciones. En el Modelo en V, las pruebas de regresión formales se ejecutan cuando un defecto detectado en una fase superior obliga a corregir la implementación y volver a verificar los niveles inferiores.

Si se detecta una regresión (un caso de prueba que pasaba anteriormente y ahora falla), se trata como un defecto de severidad alta, se registra como issue en el repositorio y bloquea el avance a la siguiente fase hasta su resolución.


### 6.3 Prioridad de ejecución manual

En caso de necesidad de ejecución manual fuera del pipeline, los casos de prueba se ejecutan en el siguiente orden de prioridad:

1ª prioridad: TC-U-06 a TC-U-14 (algoritmo Mark & Sweep y casos especiales).

2ª prioridad: TC-I-05 (grafo mixto, cobertura amplia de integración).

3ª prioridad: TC-E-10 (simulación completa, flujo principal del sistema).


## 7. Relación con el STS

El presente STP referencia el STS GC Visualizer v1.3 como documento de especificación de casos de prueba. La relación entre ambos documentos es la siguiente:

| Sección STP | Sección STS | Descripción |
| --- | --- | --- |
| 2.2 Niveles de prueba | Secciones 2, 3 y 4 del STS | Los niveles y herramientas definidos en el STP corresponden a las secciones de pruebas unitarias, integración y e2e del STS. |
| 2.3 Cobertura objetivo | Sección 1.4 del STS (matriz RF↔TC) | La cobertura del 100% de RF se verifica mediante la matriz de trazabilidad del STS. |
| 4.2 Criterios de salida | Todos los TC del STS | Los criterios de salida exigen que el 100% de los TC del STS pasen satisfactoriamente. |
| 6.1 Secuencia de ejecución | TC-U, TC-I, TC-E del STS | La secuencia de ejecución sigue el orden de los prefijos de identificación definidos en el STS. |


## 8. Riesgos del proceso de pruebas

Los siguientes riesgos pueden afectar al proceso de pruebas y deben ser tenidos en cuenta durante la implementación:

| ID | Riesgo | Prob. | Impacto | Mitigación |
| --- | --- | --- | --- | --- |
| RP-01 | Inestabilidad de pruebas e2e | Media | Las pruebas Cypress pueden ser inestables ante cambios de layout o tiempos de respuesta variables. | Uso de selectores semánticos (data-testid) en lugar de selectores CSS frágiles. Configuración de tiempos de espera adecuados. |
| RP-02 | Cobertura insuficiente del algoritmo | Alta | Casos límite del algoritmo no contemplados en el STS pueden quedar sin verificar. | El STS cubre los 8 casos estructurales del CP original. Revisión de cobertura Jest al finalizar cada fase de implementación. |
| RP-03 | Acoplamiento entre pruebas e2e | Media | Pruebas e2e con dependencias implícitas entre sí pueden fallar por orden de ejecución. | Cada TC-E define su propia precondición y parte de un estado limpio de la aplicación. |
| RP-04 | Cambios en React Flow | Baja | Actualizaciones de la librería React Flow pueden romper pruebas e2e que dependan de su estructura interna. | Uso de selectores propios de la aplicación, no de la estructura interna de React Flow. |
