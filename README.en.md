# GC Visualizer

> Interactive visualizer for the **Mark & Sweep** garbage collection algorithm.

🌐 <https://jorgerodr.github.io/gc-visualizer/>

**English** · [Español](./README.md)

A web app to build in-memory object graphs, mark roots and run the Mark & Sweep algorithm step by step in order to understand how a garbage collector identifies and reclaims unreachable memory.

## Table of contents

- [Background](#background)
- [Features](#features)
- [Stack](#stack)
- [Install](#install)
- [Usage](#usage)
- [Docker](#docker)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Background

Developed as a Master's Thesis (TFM) at Universidad Internacional de La Rioja (UNIR). The goal is to provide an educational tool that helps visualize the internal behavior of a classic garbage collector by means of an interactive, manipulable graph.

## Features

- Create, edit and delete memory objects through a graphical UI.
- Define references between objects and mark GC roots.
- Run Mark & Sweep step by step or end to end, with phase highlighting.
- Predefined scenarios for case studies (cycles, orphan objects, etc.).
- Import/export scenarios as JSON.
- Execution log with the trace of every step of the algorithm.

## Stack

- **React 19** + **TypeScript** as the UI foundation.
- **Vite** as bundler and dev server.
- **Tailwind CSS** for styling.
- **Zustand** for state management.
- **@xyflow/react** for graph rendering.
- **Jest** + **Testing Library** for unit and integration tests.
- **Cypress** for end-to-end tests.

## Install

Prerequisites:

- [Node.js](https://nodejs.org/) ≥ 20
- npm ≥ 10

```bash
git clone git@github.com:JorgeRodr/gc-visualizer.git
cd gc-visualizer
npm install
```

## Usage

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

To produce a production build:

```bash
npm run build
npm run preview
```

## Docker

As an alternative to installing Node locally, you can run the app with Docker. You only need [Docker Desktop](https://www.docker.com/products/docker-desktop/) running; no Node or dependency install required.

From the project root:

```bash
docker compose up --build
```

The first run produces the production build and serves it with nginx. Once it finishes, open <http://localhost:8080/> in your browser: it redirects automatically to `/gc-visualizer/` and loads the app.

To stop and clean up the containers:

```bash
docker compose down
```

The `--build` flag is only needed the first time or whenever something inside the image changes (`src/` code, dependencies, `Dockerfile` or `nginx.conf`):

| Situation                       | Command                       |
| ------------------------------- | ----------------------------- |
| First run or after code changes | `docker compose up --build`   |
| Restart with no changes         | `docker compose up -d`        |
| Stop and clean up               | `docker compose down`         |

> This is a static production build served by nginx, so there is **no hot reload**. If you change the code, run `docker compose up --build` again. If port `8080` is taken, change the mapping in `docker-compose.yml` (e.g. `"3000:80"`).

## Available scripts

| Script                  | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Dev server with HMR.                                     |
| `npm run build`         | Type-checks and builds the production bundle.            |
| `npm run preview`       | Serves the production build locally.                     |
| `npm run lint`          | Runs ESLint on the source code.                          |
| `npm test`              | Runs unit and integration tests (Jest).                  |
| `npm run test:coverage` | Runs tests with a coverage report.                       |
| `npm run cypress:open`  | Opens Cypress in interactive mode.                       |
| `npm run cypress:run`   | Runs Cypress E2E tests in headless mode.                 |

## Project structure

The project follows a layered (Clean) architecture:

```
src/
├── domain/          # Pure models, algorithms and business rules
│   ├── algorithms/  # Mark & Sweep implementation
│   ├── models/      # MemoryGraph, MemoryObject, MemoryReference, SimulationStep
│   ├── ports/       # Interfaces to infrastructure
│   └── validators/  # Graph and entity validation
├── application/     # Use cases and application state
│   ├── useCases/    # createObject, runSimulation, etc.
│   └── simulationStore.ts
├── infrastructure/  # Adapters (JSON serialization, etc.)
└── presentation/    # React components, styles and UI utilities
    └── components/  # graph/, layout/, simulation/
```

## Testing

- **Unit and integration** (Jest + Testing Library): `src/tests/unit` and `src/tests/integration`.
- **End-to-end** (Cypress): `cypress/e2e`.
- **Quality audit** (knip, jscpd, ESLint, Stryker, etc.): isolated sub-project in [`audit/`](./audit/README.md).

```bash
npm test                # unit + integration
npm run test:coverage   # with coverage
npm run cypress:run     # E2E
```

## Deployment

The `main` branch is automatically deployed to <https://jorgerodr.github.io/gc-visualizer/> via the [`.github/workflows/deploy.yaml`](./.github/workflows/deploy.yaml) workflow.

## Contributing

Commits follow the [Conventional Commits](https://www.conventionalcommits.org/) style on a single line. The working branch is `develop`; PRs are integrated into `main` via rebase-merge.

## License

Academic project developed in the context of a Master's Thesis (TFM, UNIR). Educational use.
