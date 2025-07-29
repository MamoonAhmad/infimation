import { create } from "zustand";
import { devtools } from "zustand/middleware";
import environmentService from "../services/environmentService";

const useEnvironmentStore = create(
  devtools(
    (set) => ({
      // Environment variables state
      envVars: {},

      // Actions
      setEnvVars: (envVars) => set({ envVars }),

      // Async actions
      loadEnvironmentVariables: async () => {
        try {
          const envVars = await environmentService.loadEnvironmentVariables();
          set({ envVars: JSON.parse(envVars) });
        } catch (error) {
          console.error("Failed to load environment variables:", error);
        }
      },

      saveEnvironmentVariables: async (envVars) => {
        try {
          await environmentService.saveEnvironmentVariables(envVars);
          set({ envVars });
        } catch (error) {
          console.error("Failed to save environment variables:", error);
          throw error;
        }
      },

      // Helper actions
      resetEnvironment: () => {
        set({ envVars: {} });
      },
    }),
    {
      name: "environment-store",
    }
  )
);

export default useEnvironmentStore;
