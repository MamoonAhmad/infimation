import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useUIStore = create(
  devtools(
    (set) => ({
      // Modal states
      envModalOpen: false,
      templatesModalOpen: false,
      workflowRunOpen: false,
      
      // Workflow run state
      workflowRun: null,

      // Actions
      setEnvModalOpen: (open) => set({ envModalOpen: open }),
      setTemplatesModalOpen: (open) => set({ templatesModalOpen: open }),
      setWorkflowRunOpen: (open) => set({ workflowRunOpen: open }),
      
      setWorkflowRun: (workflowRun) => set({ workflowRun }),

      // Helper actions
      openWorkflowRunModal: (workflowRun) => {
        set({ workflowRun, workflowRunOpen: true });
      },

      closeWorkflowRunModal: () => {
        set({ workflowRunOpen: false });
      },

      resetUI: () => {
        set({
          envModalOpen: false,
          templatesModalOpen: false,
          workflowRunOpen: false,
          workflowRun: null,
        });
      },
    }),
    {
      name: 'ui-store',
    }
  )
);

export default useUIStore; 