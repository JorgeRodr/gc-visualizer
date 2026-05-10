import { ReactFlowProvider } from "@xyflow/react";
import { AppLayout } from "./presentation/components/layout/AppLayout";

function App() {
  return (
    <ReactFlowProvider>
      <AppLayout />
    </ReactFlowProvider>
  );
}

export default App;
