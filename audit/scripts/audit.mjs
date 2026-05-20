// Orquestador Fase 1 (Inventario).
// Todas las herramientas se ejecutan con cwd=raíz del proyecto para que
// resuelvan bien sus configs (vite.config.ts, tsconfig.json, etc.) y los
// imports del código. Las configs de audit/ se pasan vía --config.
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
    name: "knip",
    cmd: `"${AUDIT_BIN}/knip" --config "${AUDIT_DIR}/knip.json" --reporter json > "${AUDIT_DIR}/reports/knip.json"`,
    cwd: ROOT_DIR,
  },
  {
    name: "depcheck",
    cmd: `"${AUDIT_BIN}/depcheck" --json > "${AUDIT_DIR}/reports/depcheck.json"`,
    cwd: ROOT_DIR,
  },
  {
    name: "jscpd",
    cmd: `"${AUDIT_BIN}/jscpd" --config "${AUDIT_DIR}/.jscpd.json" src/`,
    cwd: ROOT_DIR,
  },
  {
    name: "eslint",
    cmd: `eslint src/ --config "${AUDIT_DIR}/eslint.audit.config.js" --format json -o "${AUDIT_DIR}/reports/eslint.json"`,
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

if (hadFailure) {
  console.log("\nAuditoría finalizada con findings. Revisa los reportes.");
} else {
  console.log(
    "\nAuditoría finalizada sin findings. Reportes generados en audit/reports/.",
  );
}
