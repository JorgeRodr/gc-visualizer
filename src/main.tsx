import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { useSimulationStore } from "./application/simulationStore";
import { createReference } from "./application/useCases/createReference";
import "./index.css";
import App from "./App.tsx";

// Test-only bridge for Cypress E2E. Kept in the production bundle because
// the suite asserts the same behaviour against `npm run preview`. The app is
// 100% client-side, so this exposes nothing a determined user couldn't reach
// from DevTools anyway, and adds no surface for security concerns.
const w = window as unknown as {
  __store: typeof useSimulationStore;
  __useCases: { createReference: typeof createReference };
};
w.__store = useSimulationStore;
w.__useCases = { createReference };

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>,
);
