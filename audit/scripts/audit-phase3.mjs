// Orquestador Fase 3 (Tests). Todas las herramientas se ejecutan con cwd=raíz.
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AUDIT_DIR = dirname(fileURLToPath(import.meta.url)) + "/..";
const ROOT_DIR = resolve(AUDIT_DIR, "..");
const AUDIT_BIN = `${AUDIT_DIR}/node_modules/.bin`;

mkdirSync(`${AUDIT_DIR}/reports`, { recursive: true });

const steps = [
  {
    name: "jest coverage",
    cmd: `jest --coverage --coverageDirectory="${AUDIT_DIR}/reports/coverage" --coverageReporters=json-summary --coverageReporters=lcov --coverageReporters=html --coverageReporters=text-summary --coverageReporters=json`,
    cwd: ROOT_DIR,
  },
  {
    name: "eslint sobre tests",
    cmd: `eslint "src/**/*.test.{ts,tsx}" --config "${AUDIT_DIR}/eslint.audit.config.js" --format json -o "${AUDIT_DIR}/reports/eslint-tests.json"`,
    cwd: ROOT_DIR,
  },
  {
    name: "audit-mocks",
    cmd: `bash "${AUDIT_DIR}/scripts/audit-mocks.sh"`,
    cwd: ROOT_DIR,
  },
  {
    name: "stryker (mutation testing) — puede tardar 5-30 min",
    cmd: `"${AUDIT_BIN}/stryker" run "${AUDIT_DIR}/stryker.config.mjs"`,
    cwd: ROOT_DIR,
  },
];

let hadFailure = false;
for (const { name, cmd, cwd } of steps) {
  console.log(`\n=== ${name} ===`);
  try {
    execSync(cmd, { stdio: "inherit", shell: true, cwd });
  } catch {
    hadFailure = true;
    console.error(`(${name} exited with non-zero — continuing)`);
  }
}

console.log("\nReportes generados en audit/reports/.");
console.log("- audit/reports/coverage/index.html");
console.log("- audit/reports/stryker/index.html");
if (hadFailure) {
  console.log(
    "\nAl menos una herramienta detectó findings o falló (exit != 0). Revisa los reportes.",
  );
}
