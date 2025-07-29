import { useState } from "react";
import { Button } from "./ui/button";
import { LoaderCircle, Play, Plus, Save } from "lucide-react";
import useUIStore from "../stores/uiStore";
import useWorkflowStore from "../stores/workflowStore";

export function WorkflowToolbar() {
  const { setEnvModalOpen, setTemplatesModalOpen, openWorkflowRunModal } = useUIStore();
  const { saveWorkflow, runWorkflow } = useWorkflowStore();
  
  // Local loading states
  const [savingWorkflow, setSavingWorkflow] = useState(false);
  const [runningWorkflow, setRunningWorkflow] = useState(false);

  // Handle workflow save
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

  // Handle workflow run
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
      <Button
        onClick={() => setEnvModalOpen(true)}
        variant="outline"
        size="sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        Environment Variables
      </Button>

      <Button
        onClick={() => setTemplatesModalOpen(true)}
        variant="outline"
        size="sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Node
      </Button>

      <Button
        onClick={handleSaveWorkflow}
        disabled={savingWorkflow}
        size="sm"
      >
        {savingWorkflow ? (
          <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save Workflow
      </Button>

      <Button
        onClick={handleRunWorkflow}
        disabled={runningWorkflow}
        size="sm"
      >
        {runningWorkflow ? (
          <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
        ) : (
          <Play className="h-4 w-4 mr-2" />
        )}
        Run Workflow
      </Button>
    </>
  );
} 