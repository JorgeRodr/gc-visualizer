// Orquestador Fase 2 (Complejidad).
// Todas las herramientas se ejecutan con cwd=raíz del proyecto.
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
    name: "eslint (complexity + Fase 1)",
    cmd: `eslint src/ --config "${AUDIT_DIR}/eslint.audit.config.js" --format json -o "${AUDIT_DIR}/reports/eslint-complexity.json"`,
    cwd: ROOT_DIR,
  },
  {
    name: "madge (dependencias circulares)",
    cmd: `"${AUDIT_BIN}/madge" --circular --extensions ts,tsx --json src/ > "${AUDIT_DIR}/reports/madge-circular.json"`,
    cwd: ROOT_DIR,
  },
  {
    name: "git-hotspots",
    cmd: `bash "${AUDIT_DIR}/scripts/git-hotspots.sh" 200 src/`,
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
