import { GraphCanvas } from "../graph/GraphCanvas";
import { ExecutionLog } from "../simulation/ExecutionLog";
import { SimulationControls } from "../simulation/SimulationControls";
import { LeftEditorPanel } from "./LeftEditorPanel";
import { RightInfoPanel } from "./RightInfoPanel";
import { TopBar } from "./TopBar";

export function AppLayout() {
  return (
    <div
      className="h-screen w-screen grid bg-gray-50"
      style={{
        gridTemplateRows: "50px 1fr auto",
        gridTemplateColumns: "260px 1fr 280px",
      }}
    >
      <TopBar />

      <aside className="border-r border-gray-200 bg-white p-3 overflow-hidden">
        <LeftEditorPanel />
      </aside>

      <main className="bg-white relative overflow-hidden">
        <GraphCanvas />
      </main>

      <aside className="border-l border-gray-200 bg-white p-3 overflow-auto">
        <RightInfoPanel />
      </aside>

      <footer className="col-span-3 border-t border-gray-200 bg-white flex flex-col">
        <SimulationControls />
        <ExecutionLog />
      </footer>
    </div>
  );
}
