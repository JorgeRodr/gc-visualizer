// Configuración ESLint de auditoría. Extiende la del proyecto principal y
// añade las reglas anti-patrones IA + complejidad + anti-patrones Jest.
// Esta config NO se aplica al desarrollo normal — sólo cuando se ejecuta
// ESLint desde audit/ con `--config audit/eslint.audit.config.js`.

import jestPlugin from "eslint-plugin-jest";
import { defineConfig } from "eslint/config";
import baseConfig from "../eslint.config.js";

export default defineConfig([
  // Heredar todo lo del proyecto principal (parsing TS, React, etc.).
  ...baseConfig,

  // Reglas anti-patrones IA (Fase 1) + complejidad (Fase 2).
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Fase 1
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-unused-expressions": "error",
      "@typescript-eslint/no-empty-function": "warn",
      // Fase 2
      complexity: ["warn", { max: 10 }],
      "max-depth": ["warn", { max: 3 }],
      "max-lines-per-function": [
        "warn",
        { max: 50, skipBlankLines: true, skipComments: true },
      ],
      "max-params": ["warn", { max: 4 }],
      "max-lines": [
        "warn",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Override para ficheros de test (Fase 3): reglas Jest + relajar
  // max-lines-per-function porque los bloques `describe(...)` son legítimos.
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      "max-lines-per-function": "off",
      "jest/expect-expect": "error",
      "jest/no-focused-tests": "error",
      "jest/no-disabled-tests": "warn",
      "jest/no-standalone-expect": "error",
      "jest/no-conditional-expect": "error",
      "jest/no-identical-title": "error",
    },
  },
]);
