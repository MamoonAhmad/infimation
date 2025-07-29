import { create } from "zustand";
import { devtools } from "zustand/middleware";
import workflowService from "../services/workflowService";

const useWorkflowStore = create(
  devtools(
    (set, get) => ({
      // Core workflow state
      nodes: [],
      edges: [],
      nodeToEdit: null,

      // Actions
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),

      addNode: (node) => {
        const { nodes, edges } = get();
        const newNode = {
          id: node.id,
          position: { x: 100, y: (nodes.length + 1) * 100 },
          data: {
            label: node.name || node.id,
            code: node.code,
            template_id: node.template_id,
            settings: node.settings,
          },
        };

        set({ nodes: [...nodes, newNode] });

        if (nodes.length) {
          const newEdge = {
            id: new Date().getTime().toString() + "1",
            source: nodes[nodes.length - 1].id,
            target: node.id,
          };
          set({ edges: [...edges, newEdge] });
        }
      },

      updateNodeData: (nodeId, data) => {
        const { nodes } = get();
        const updatedNodes = nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        );
        set({ nodes: updatedNodes });
      },

      setNodeToEdit: (node) => {
        set({ nodeToEdit: node });
      },

      resetNodeEdit: () => {
        set({ nodeToEdit: null });
      },

      // Async Actions
      loadWorkflow: async () => {
        try {
          const { nodes, edges } = await workflowService.loadWorkflow();
          set({ nodes, edges });
        } catch (error) {
          console.error("Failed to load workflow:", error);
        }
      },

      saveWorkflow: async () => {
        const { nodes, edges } = get();
        try {
          await workflowService.saveWorkflow(nodes, edges);
        } catch (error) {
          console.error("Failed to save workflow:", error);
        }
      },

      runWorkflow: async () => {
        try {
          const result = await workflowService.runWorkflow();
          return result;
        } catch (error) {
          console.error("Failed to run workflow:", error);
          throw error;
        }
      },

      runNode: async (nodeId) => {
        const result = await workflowService.runNode(nodeId);
        return result;
      },
    }),
    {
      name: "workflow-store",
    }
  )
);

export default useWorkflowStore;
