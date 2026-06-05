# Auditoría de calidad — gc-visualizer

Este directorio contiene el workflow de auditoría de calidad de código del proyecto **gc-visualizer**. Está deliberadamente aislado del proyecto principal: dependencias, configuración, scripts y reportes viven aquí dentro y no contaminan el código de producción.

## Requisitos previos

1. Haber instalado las dependencias del proyecto principal:
   ```bash
   # Desde la raíz del repo
   npm install
   ```
   El workflow de auditoría reutiliza Jest, TypeScript y otras herramientas del proyecto principal para no duplicar binarios. Esto es estándar — cualquier proyecto Node exige tener las deps instaladas antes de correr nada.

2. Instalar las dependencias específicas de auditoría:
   ```bash
   # Desde la raíz, una sola vez
   cd audit
   npm install
   ```

## Cómo ejecutar la auditoría completa

```bash
# Desde audit/
npm run audit:all-phases
```

Tarda aproximadamente **6-8 minutos** (la mayor parte la consume Stryker en la mutación). Genera todos los reportes en `audit/reports/`.

## Cómo ejecutar fases individuales

```bash
npm run audit:all        # Fase 1: inventario (knip, depcheck, jscpd, eslint)
npm run audit:phase2     # Fase 2: complejidad (eslint complexity, madge, git-hotspots)
npm run audit:phase3     # Fase 3: tests (jest coverage, stryker, eslint-plugin-jest, mocks)
```

Las fases 2 y 3 pueden ejecutarse de forma independiente; sus reportes no dependen de la fase anterior. El orquestador `audit:all-phases` las encadena en orden por conveniencia.

## Output

Tras `audit:all-phases` se genera en `audit/reports/`:

| Reporte | Fase | Contenido |
| --- | --- | --- |
| `knip.json` | 1 | Ficheros, exports y dependencias sin usar. |
| `depcheck.json` | 1 | devDeps no utilizadas, deps no declaradas. |
| `jscpd/jscpd-report.json` | 1 | Duplicación entre ficheros. |
| `eslint.json` | 1 | Findings de ESLint (reglas anti-patrones IA). |
| `eslint-complexity.json` | 2 | Findings de complejidad (Fase 1 + reglas de Fase 2). |
| `madge-circular.json` | 2 | Dependencias circulares. |
| `git-hotspots.txt` | 2 | Top de ficheros con mayor churn. |
| `coverage/` | 3 | Reporte HTML + JSON de Jest coverage. |
| `stryker/` | 3 | Reporte HTML + JSON de mutation testing. |
| `eslint-tests.json` | 3 | Anti-patrones específicos de tests Jest. |
| `mock-audit.txt` | 3 | Uso de `jest.mock`, `jest.fn`, `jest.spyOn`. |

`reports/` está ignorado por git (se regenera con cada ejecución).

## Estructura

```
audit/
├── package.json              # Dependencies de auditoría aisladas
├── package-lock.json
├── node_modules/             # (gitignored)
├── .gitignore
├── README.md                 # Este fichero
├── knip.json                 # Config Knip (paths relativos al proyecto principal)
├── .jscpd.json               # Config jscpd
├── stryker.config.mjs        # Config Stryker (mutation testing)
├── eslint.audit.config.js    # Config ESLint con reglas de auditoría
├── scripts/
│   ├── audit.mjs             # Orquestador Fase 1
│   ├── audit-phase2.mjs      # Orquestador Fase 2
│   ├── audit-phase3.mjs      # Orquestador Fase 3
│   ├── audit-mocks.sh        # Helper bash para detectar mocks
│   └── git-hotspots.sh       # Helper bash para hotspots git
└── reports/                  # Reportes generados (gitignored)
```

## Diseño

- **Aislamiento total del proyecto principal**: las únicas modificaciones que necesita el código del producto son **cero**. Toda la auditoría se ejecuta desde `audit/` y produce sus reportes aquí.
- **Reúso de Jest y ESLint del proyecto principal**: para no duplicar 200 MB de `node_modules`, los scripts de auditoría que necesitan Jest o ESLint los invocan desde la raíz usando configuraciones de `audit/` para las reglas específicas.
- **Configuración paralela de ESLint**: `audit/eslint.audit.config.js` extiende la configuración del proyecto principal añadiendo las reglas de auditoría (complexity, max-lines, anti-patrones Jest). El `eslint.config.js` del raíz queda intacto.
- **Sin CI ni hooks**: el workflow se ejecuta manualmente. Su propósito es ofrecer **reproducibilidad por terceros**, no automatización continua.

## Reproducibilidad

Para reproducir las métricas:

```bash
git clone <repo>
cd <repo>
npm install            # deps del proyecto principal
cd audit
npm install            # deps de auditoría
npm run audit:all-phases
```

Tras ~6-8 minutos tendrás los reportes en `audit/reports/`. Las cifras de coverage, mutation score, hotspots, complejidad, dependencias circulares, etc. son deterministas y deben coincidir entre ejecuciones (salvo el dato de churn de git, que crecerá con cada commit nuevo).
