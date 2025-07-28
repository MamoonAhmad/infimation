const workflowStorage = require('../services/workflowStorage');

async function saveEnvironmentVariablesHandler(request, reply) {
    try {
        const envVars = request.body;
        const result = workflowStorage.saveEnvironmentVariables(envVars);
        reply.send(result);
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
}

async function getEnvironmentVariablesHandler(request, reply) {
    try {
        const envVars = workflowStorage.loadEnvironmentVariables();
        reply.send(envVars);
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
}

module.exports = {
    saveEnvironmentVariablesHandler,
    getEnvironmentVariablesHandler
}; 