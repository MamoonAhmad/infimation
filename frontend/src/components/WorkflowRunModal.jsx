import { useState } from "react";
import { Dialog as Modal, DialogContent, DialogHeader } from "./ui/dialog";
import { Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useWorkflowStore from "../stores/workflowStore";
import useUIStore from "../stores/uiStore";
import { ReactFlow } from "./ReactFlow/ReactFlow";

export function WorkflowRunModal() {
  const { nodes, edges } = useWorkflowStore();
  const { workflowRunOpen, workflowRun, setWorkflowRunOpen } = useUIStore();

  // Local state for selected node in workflow run
  const [selectedRunNode, setSelectedRunNode] = useState(null);

  return (
    <Modal
      open={workflowRunOpen}
      onOpenChange={(open) => {
        setWorkflowRunOpen(open);
        if (!open) {
          setSelectedRunNode(null);
        }
      }}
    >
      <DialogContent className="h-[80vh] min-w-[80vw] flex flex-col justify-start">
        <DialogHeader>
          <h2 className="text-xl font-bold">Workflow Run</h2>
        </DialogHeader>
        <div className="flex flex-col gap-4 grow">
          <ReactFlow
            nodes={nodes.map((n) => {
              return {
                ...n,
                data: {
                  ...n.data,
                  workflow_node_type: "workflow_run_node",
                  success: !workflowRun?.nodeOutputs?.[n.id]?.error,
                },
              };
            })}
            edges={edges}
            onNodeClick={(_, node) => setSelectedRunNode(node)}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
          {selectedRunNode && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">
                Node Output: {selectedRunNode.data.label}
              </h3>
              {workflowRun?.nodeOutputs?.[selectedRunNode.id] === undefined ? (
                <pre className="bg-red-100 text-red-800 p-2 rounded text-xs whitespace-pre-wrap">
                  Node did not run.
                </pre>
              ) : workflowRun?.nodeOutputs?.[selectedRunNode.id]?.error ? (
                <pre className="bg-red-100 text-red-800 p-2 rounded text-xs whitespace-pre-wrap">
                  {JSON.stringify(
                    workflowRun.nodeOutputs[selectedRunNode.id].error,
                    null,
                    2
                  )}
                </pre>
              ) : (
                <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs whitespace-pre-wrap max-h-64 overflow-auto">
                  {workflowRun?.nodeOutputs?.[selectedRunNode.id]?.output ===
                    undefined ||
                  workflowRun?.nodeOutputs?.[selectedRunNode.id]?.output ===
                    null
                    ? "Node did not return any output."
                    : JSON.stringify(
                        workflowRun.nodeOutputs[selectedRunNode.id].output,
                        null,
                        2
                      )}
                </pre>
              )}
            </div>
          )}
          {workflowRun?.error && (
            <div className="mt-4">
              <pre className="bg-red-100 text-red-800 p-2 rounded text-xs whitespace-pre-wrap">
                {JSON.stringify(workflowRun.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Modal>
  );
}
