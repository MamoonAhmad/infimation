const workflowStorage = require('../services/workflowStorage');
const workflowEngine = require('../services/workflowEngine');

async function saveWorkflowHandler(request, reply) {
    const { flow, nodeMap } = request.body;
    try {
        const result = workflowStorage.saveWorkflow(flow, nodeMap);
        reply.send(result);
    } catch (e) {
        reply.status(500).send({ success: false, error: e.message });
    }
}

async function getWorkflowHandler(request, reply) {
    try {
        const workflow = workflowStorage.loadWorkflow();
        if (!workflow) {
            return reply.status(404).send({ error: 'Workflow not found' });
        }
        reply.send(workflow);
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
}

async function runNodeHandler(request, reply) {
    const { nodeId } = request.body;
    if (!nodeId) {
        return reply.status(400).send({ error: 'Missing nodeId' });
    }
    try {
        const workflow = workflowStorage.loadWorkflow();
        if (!workflow) {
            return reply.status(404).send({ error: 'Workflow not found' });
        }
        const { nodeMap } = workflow;
        const node = nodeMap[nodeId];
        if (!node) {
            return reply.status(404).send({ error: 'Node not found.' });
        }
        let output;
        try {
            output = await workflowEngine.runNode(node);
        } catch (err) {
            return reply.status(500).send({ error: err.message });
        }
        reply.send({ output: output });
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
}

async function runWorkflowHandler(request, reply) {
    try {
        const workflow = workflowStorage.loadWorkflow();
        if (!workflow) {
            return reply.status(404).send({ error: 'Workflow not found' });
        }
        const { nodeMap, flow, env } = workflow;
        const output = await workflowEngine.runFlow(flow, nodeMap, env);
        reply.send(output);
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
}

module.exports = {
    saveWorkflowHandler,
    getWorkflowHandler,
    runNodeHandler,
    runWorkflowHandler
}; 