const API_BASE_URL = 'http://localhost:3002';

export const API_ENDPOINTS = {
    WORKFLOW: `${API_BASE_URL}/workflow`,
    RUN_WORKFLOW: `${API_BASE_URL}/run-workflow`,
    RUN_NODE: `${API_BASE_URL}/run-node`,
    ENVIRONMENT_VARIABLES: `${API_BASE_URL}/environment-variables`,
    NODE_TEMPLATES: `${API_BASE_URL}/node-templates`,
    NODE_TEMPLATE_BY_ID: (id) => `${API_BASE_URL}/node-templates/${id}`,
};

export default API_BASE_URL; 