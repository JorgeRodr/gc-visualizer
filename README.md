# GC Visualizer

> Visualizador interactivo del algoritmo de recolección de basura **Mark & Sweep**.

🌐 <https://jorgerodr.github.io/gc-visualizer/>

[English](./README.en.md) · **Español**

Aplicación web que permite construir grafos de objetos en memoria, marcar raíces y ejecutar paso a paso el algoritmo Mark & Sweep para entender cómo un recolector de basura identifica y libera memoria inalcanzable.

## Tabla de contenidos

- [Contexto](#contexto)
- [Características](#características)
- [Stack](#stack)
- [Instalación](#instalación)
- [Uso](#uso)
- [Docker](#docker)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Testing](#testing)
- [Despliegue](#despliegue)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Contexto

Proyecto desarrollado como Trabajo de Fin de Máster (TFM) en la Universidad Internacional de La Rioja (UNIR). Su objetivo es proporcionar una herramienta didáctica que ayude a visualizar el comportamiento interno de un recolector de basura clásico mediante un grafo manipulable e interactivo.

## Características

- Creación, edición y borrado de objetos en memoria mediante interfaz gráfica.
- Definición de referencias entre objetos y marcado de raíces (GC roots).
- Ejecución del algoritmo Mark & Sweep paso a paso o completo, con resaltado de fases.
- Escenarios predefinidos para casos de estudio (ciclos, objetos huérfanos, etc.).
- Import/export de escenarios en JSON.
- Registro de ejecución con la traza de cada paso del algoritmo.

## Stack

- **React 19** + **TypeScript** como base de la interfaz.
- **Vite** como bundler y servidor de desarrollo.
- **Tailwind CSS** para estilos.
- **Zustand** para gestión de estado.
- **@xyflow/react** para el renderizado del grafo.
- **Jest** + **Testing Library** para tests unitarios e integración.
- **Cypress** para tests end-to-end.

## Instalación

Requisitos previos:

- [Node.js](https://nodejs.org/) ≥ 20
- npm ≥ 10

```bash
git clone git@github.com:JorgeRodr/gc-visualizer.git
cd gc-visualizer
npm install
```

## Uso

Arranca el servidor de desarrollo:

```bash
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`.

Para generar la build de producción:

```bash
npm run build
npm run preview
```

## Docker

Como alternativa a la instalación local de Node, puedes levantar la aplicación con Docker. Solo necesitas [Docker Desktop](https://www.docker.com/products/docker-desktop/) en marcha; no hace falta instalar Node ni las dependencias.

Desde la raíz del proyecto:

```bash
docker compose up --build
```

La primera ejecución compila la build de producción y la sirve con nginx. Cuando termine, abre <http://localhost:8080/> en el navegador: redirige automáticamente a `/gc-visualizer/` y carga la aplicación.

Para detener y limpiar los contenedores:

```bash
docker compose down
```

El flag `--build` solo es necesario la primera vez o cuando cambia algo que va dentro de la imagen (código de `src/`, dependencias, `Dockerfile` o `nginx.conf`):

| Situación                          | Comando                       |
| ---------------------------------- | ----------------------------- |
| Primera vez o tras cambiar código  | `docker compose up --build`   |
| Volver a arrancar sin cambios      | `docker compose up -d`        |
| Detener y limpiar                  | `docker compose down`         |

> Es una build de producción estática servida por nginx, por lo que **no hay recarga en caliente**. Si cambias el código, vuelve a lanzar `docker compose up --build`. Si el puerto `8080` está ocupado, cambia el mapeo en `docker-compose.yml` (por ejemplo `"3000:80"`).

## Scripts disponibles

| Script                  | Descripción                                              |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo con HMR.                          |
| `npm run build`         | Compila TypeScript y genera la build de producción.      |
| `npm run preview`       | Sirve la build de producción en local.                   |
| `npm run lint`          | Ejecuta ESLint sobre el código fuente.                   |
| `npm test`              | Ejecuta los tests unitarios e integración (Jest).        |
| `npm run test:coverage` | Ejecuta los tests con informe de cobertura.              |
| `npm run cypress:open`  | Abre Cypress en modo interactivo.                        |
| `npm run cypress:run`   | Ejecuta los tests E2E de Cypress en modo headless.       |

## Estructura del proyecto

El proyecto sigue una arquitectura por capas (Clean Architecture):

```
src/
├── domain/          # Modelos, algoritmos y reglas de negocio puras
│   ├── algorithms/  # Implementación de Mark & Sweep
│   ├── models/      # MemoryGraph, MemoryObject, MemoryReference, SimulationStep
│   ├── ports/       # Interfaces hacia infraestructura
│   └── validators/  # Validación de grafos y entidades
├── application/     # Casos de uso y estado de la aplicación
│   ├── useCases/    # createObject, runSimulation, etc.
│   └── simulationStore.ts
├── infrastructure/  # Adaptadores (serialización JSON, etc.)
└── presentation/    # Componentes React, estilos y utilidades de UI
    └── components/  # graph/, layout/, simulation/
```

## Testing

- **Unitarios e integración** (Jest + Testing Library): `src/tests/unit` y `src/tests/integration`.
- **End-to-end** (Cypress): `cypress/e2e`.
- **Auditoría de calidad** (knip, jscpd, ESLint, Stryker, etc.): subproyecto aislado en [`audit/`](./audit/README.md).

```bash
npm test                # unitarios + integración
npm run test:coverage   # con cobertura
npm run cypress:run     # E2E
```

## Despliegue

La rama `main` se despliega automáticamente en <https://jorgerodr.github.io/gc-visualizer/> mediante el workflow [`.github/workflows/deploy.yaml`](./.github/workflows/deploy.yaml).

## Contribución

Los commits siguen el estilo [Conventional Commits](https://www.conventionalcommits.org/) en una sola línea. La rama de trabajo es `develop`; las PRs se integran sobre `main` mediante rebase-merge.

## Licencia

Proyecto académico desarrollado en el contexto de un TFM (UNIR). Uso educativo.
