import { useEffect } from "react";
import { Background, Controls, ReactFlow, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Import stores
import useWorkflowStore from "./stores/workflowStore";
import useTemplateStore from "./stores/templateStore";
import useEnvironmentStore from "./stores/environmentStore";

// Import components
import { Navigation } from "./components/Navigation";
import { WorkflowToolbar } from "./components/WorkflowToolbar";
import { NodeEditDialog } from "./components/NodeEditDialog";
import { WorkflowRunModal } from "./components/WorkflowRunModal";
import { EnvironmentModal } from "./components/EnvironmentModal";
import { TemplatesModal } from "./components/TemplatesModal";

function App() {
  const {
    nodes,
    edges,
    loadWorkflow,
    setNodes,
    setEdges,
    setNodeToEdit,
  } = useWorkflowStore();

  const {
    loadTemplates,
    loadNodeTemplate,
  } = useTemplateStore();

  const {
    loadEnvironmentVariables,
  } = useEnvironmentStore();

  // Load initial data on mount
  useEffect(() => {
    loadWorkflow();
    loadTemplates();
    loadEnvironmentVariables();
  }, [loadWorkflow, loadTemplates, loadEnvironmentVariables]);

  // Handle node click with template loading
  const handleNodeClick = (__, node) => {
    setNodeToEdit(node);
    
    if (node?.data?.template_id) {
      loadNodeTemplate(node.data.template_id);
    }
  };

  return (
    <>
      <div className="w-screen h-screen bg-gray-50 relative">
        {/* Navigation with Toolbar */}
        <Navigation>
          <WorkflowToolbar />
        </Navigation>

        {/* ReactFlow with top margin for toolbar */}
        <div className="pt-16 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            onEdgesChange={(changes) => {
              setEdges(applyEdgeChanges(changes, edges));
            }}
            onNodesChange={(changes) => {
              setNodes(applyNodeChanges(changes, nodes));
            }}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>

      {/* Modals */}
      <EnvironmentModal />
      <TemplatesModal />
      <WorkflowRunModal />
      <NodeEditDialog />
    </>
  );
}

export default App;
