import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const root = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
      "@domain": path.resolve(root, "src/domain"),
      "@application": path.resolve(root, "src/application"),
      "@presentation": path.resolve(root, "src/presentation"),
      "@infrastructure": path.resolve(root, "src/infrastructure"),
    },
  },
});
