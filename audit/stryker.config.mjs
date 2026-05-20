/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
// Stryker se ejecuta desde audit/ pero mutará y testeará código del proyecto
// principal (../src/). Para que tanto el checker TS como el runner Jest
// encuentren sus deps, se invoca con `cd .. && stryker run --configFile audit/stryker.config.mjs`
// (ver scripts/audit-phase3.mjs).
export default {
  testRunner: "jest",
  jest: {
    projectType: "custom",
    configFile: "jest.config.js",
    enableFindRelatedTests: true,
  },
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.app.json",

  // Mutar src/ del proyecto principal (Stryker se ejecutará con cwd=raíz).
  mutate: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.spec.{ts,tsx}",
    "!src/types/**",
    "!src/main.tsx",
    "!src/test/**",
  ],

  reporters: ["html", "json", "progress"],
  htmlReporter: { fileName: "audit/reports/stryker/index.html" },
  jsonReporter: { fileName: "audit/reports/stryker/report.json" },

  thresholds: {
    high: 80,
    low: 60,
    break: 40,
  },

  concurrency: 4,
  timeoutMS: 10000,
  timeoutFactor: 1.5,
  ignoreStatic: true,

  // Directorio temporal dentro de audit/ para no contaminar la raíz del proyecto.
  tempDirName: "audit/.stryker-tmp",
};
