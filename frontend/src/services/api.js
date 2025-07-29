import { API_ENDPOINTS } from '../config/api';

class ApiService {
    async makeRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            throw new Error(error.message || 'Network error');
        }
    }

    // Workflow endpoints
    async saveWorkflow(workflow) {
        return this.makeRequest(API_ENDPOINTS.WORKFLOW, {
            method: 'POST',
            body: JSON.stringify(workflow),
        });
    }

    async loadWorkflow() {
        return this.makeRequest(API_ENDPOINTS.WORKFLOW, {
            method: 'GET',
        });
    }

    async runWorkflow() {
        return this.makeRequest(API_ENDPOINTS.RUN_WORKFLOW, {
            method: 'POST',
            body: JSON.stringify({}),
        });
    }

    async runNode(nodeId) {
        return this.makeRequest(API_ENDPOINTS.RUN_NODE, {
            method: 'POST',
            body: JSON.stringify({ nodeId }),
        });
    }

    // Environment variables endpoints
    async saveEnvironmentVariables(envVars) {
        return this.makeRequest(API_ENDPOINTS.ENVIRONMENT_VARIABLES, {
            method: 'POST',
            body: JSON.stringify(envVars),
        });
    }

    async loadEnvironmentVariables() {
        return this.makeRequest(API_ENDPOINTS.ENVIRONMENT_VARIABLES, {
            method: 'GET',
        });
    }

    // Template endpoints
    async loadTemplates() {
        return this.makeRequest(API_ENDPOINTS.NODE_TEMPLATES, {
            method: 'GET',
        });
    }

    async loadTemplateById(id) {
        return this.makeRequest(API_ENDPOINTS.NODE_TEMPLATE_BY_ID(id), {
            method: 'GET',
        });
    }
}

export default new ApiService(); 