import apiService from './api';

class EnvironmentService {
    async loadEnvironmentVariables() {
        try {
            const envVars = await apiService.loadEnvironmentVariables();
            return JSON.stringify(envVars, null, 2);
        } catch (error) {
            console.error('Failed to load environment variables:', error);
            return "{}";
        }
    }

    async saveEnvironmentVariables(envVars) {
        try {
            return await apiService.saveEnvironmentVariables(envVars);
        } catch (error) {
            console.error(error)
            throw new Error('Invalid JSON');
        }
    }
}

export default new EnvironmentService(); 