import { useEffect } from "react";
import {
  Background,
  Controls,
  MarkerType,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
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
import { ReactFlow } from "./components/ReactFlow/ReactFlow";

/**
 * @typedef {import('@xyflow/react').Node} Node
 * @typedef {import('@xyflow/react').Edge} Edge
 * @typedef {import('@xyflow/react').OnNodeClick} OnNodeClick
 * @typedef {import('@xyflow/react').OnEdgesChange} OnEdgesChange
 * @typedef {import('@xyflow/react').OnNodesChange} OnNodesChange
 */

/**
 * Main application component that renders the workflow editor
 * @returns {JSX.Element} The main application component
 */
function App() {
  const { nodes, edges, loadWorkflow, setNodes, setEdges, setNodeToEdit } =
    useWorkflowStore();

  const { loadTemplates, loadNodeTemplate } = useTemplateStore();

  const { loadEnvironmentVariables } = useEnvironmentStore();

  // Load initial data on mount
  useEffect(() => {
    loadWorkflow();
    loadTemplates();
    loadEnvironmentVariables();
  }, [loadWorkflow, loadTemplates, loadEnvironmentVariables]);

  /**
   * Handle node click with template loading
   * @param {React.MouseEvent} event - The click event
   * @param {Node} node - The clicked node
   */
  const handleNodeClick = (event, node) => {
    setNodeToEdit(node);

    if (node?.data?.template_id) {
      loadNodeTemplate(node.data.template_id);
    }
  };

  /**
   * Handle edge changes
   * @param {import('@xyflow/react').EdgeChange[]} changes - Array of edge changes
   */
  const handleEdgesChange = (changes) => {
    setEdges(applyEdgeChanges(changes, edges));
  };

  /**
   * Handle node changes
   * @param {import('@xyflow/react').NodeChange[]} changes - Array of node changes
   */
  const handleNodesChange = (changes) => {
    console.log(changes);
    setNodes(applyNodeChanges(changes, nodes));
  };

  const handleOnConnect = (params) => {
    const e = addEdge(
      {
        ...params,
        type: "floating",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 15,
          color: "#000",
        },
        style: {
          strokeWidth: 2,
          stroke: "#000",
        },
      },
      edges
    );

    setEdges(e);
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
            onEdgesChange={handleEdgesChange}
            onNodesChange={handleNodesChange}
            onConnect={handleOnConnect}
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
