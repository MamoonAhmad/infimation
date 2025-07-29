import { useState, useEffect } from "react";
import { Background, Controls, ReactFlow, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "./components/ui/button";
import { LoaderCircle, Play, Plus, Save } from "lucide-react";

// Import stores
import useWorkflowStore from "./stores/workflowStore";
import useTemplateStore from "./stores/templateStore";
import useEnvironmentStore from "./stores/environmentStore";
import useUIStore from "./stores/uiStore";

// Import components
import { NodeEditDialog } from "./components/NodeEditDialog";
import { WorkflowRunModal } from "./components/WorkflowRunModal";
import { EnvironmentModal } from "./components/EnvironmentModal";
import { TemplatesModal } from "./components/TemplatesModal";

function App() {
  // Local state for workflow operations
  const [savingWorkflow, setSavingWorkflow] = useState(false);
  const [runningWorkflow, setRunningWorkflow] = useState(false);

  const {
    nodes,
    edges,
    loadWorkflow,
    saveWorkflow,
    runWorkflow,
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

  const {
    setEnvModalOpen,
    setTemplatesModalOpen,
    openWorkflowRunModal,
  } = useUIStore();

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

  // Handle workflow save with local state
  const handleSaveWorkflow = async () => {
    setSavingWorkflow(true);
    try {
      await saveWorkflow();
    } catch (error) {
      console.error('Failed to save workflow:', error);
    } finally {
      setSavingWorkflow(false);
    }
  };

  // Handle workflow run with local state
  const handleRunWorkflow = async () => {
    setRunningWorkflow(true);
    try {
      const result = await runWorkflow();
      openWorkflowRunModal(result);
    } catch (error) {
      openWorkflowRunModal({ error: error.message });
    } finally {
      setRunningWorkflow(false);
    }
  };

  return (
    <>
      <div className="w-screen h-screen bg-gray-50">
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

      <div className="flex gap-2 absolute bottom-2 right-2 z-10">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setEnvModalOpen(true);
          }}
        >
          <Plus />
          Environment Variables
        </Button>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setTemplatesModalOpen(true);
          }}
        >
          <Plus />
          Add Node
        </Button>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleSaveWorkflow();
          }}
        >
          {savingWorkflow ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Save />
          )}
          Save Workflow
        </Button>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleRunWorkflow();
          }}
        >
          {runningWorkflow ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Play />
          )}
          Run Workflow
        </Button>
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
