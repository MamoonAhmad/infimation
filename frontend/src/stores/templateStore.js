import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import templateService from '../services/templateService';

const useTemplateStore = create(
  devtools(
    (set, get) => ({
      // State
      templates: [],
      loadingTemplates: false,
      nodeTemplate: null,

      // Actions
      setTemplates: (templates) => set({ templates }),
      setLoadingTemplates: (loading) => set({ loadingTemplates: loading }),
      setNodeTemplate: (template) => set({ nodeTemplate: template }),

      // Async Actions
      loadTemplates: async () => {
        set({ loadingTemplates: true });
        try {
          const templates = await templateService.loadTemplates();
          set({ templates });
        } catch (error) {
          console.error('Failed to load templates:', error);
        } finally {
          set({ loadingTemplates: false });
        }
      },

      loadNodeTemplate: async (templateId) => {
        try {
          const template = await templateService.loadTemplateById(templateId);
          set({ nodeTemplate: template });
        } catch (error) {
          console.error('Failed to load template:', error);
        }
      },

      createNodeFromTemplate: (template) => {
        return templateService.createNodeFromTemplate(template);
      },

      resetNodeTemplate: () => {
        set({ nodeTemplate: null });
      },
    }),
    {
      name: 'template-store',
    }
  )
);

export default useTemplateStore; 