

function runFlow(flowConfig, nodeMap, env) {
    const outputs = {
        nodeOutputs: {},
        chain: []
    }
    flowConfig.nodes.forEach(nodeConfig => {
        try {
            const res = runNodeInFlow(nodeConfig, nodeMap, env, outputs.nodeOutputs, outputs.chain);
        } catch (e) {
            outputs.error = `Failed to execute workflow. ${e?.toString()}`
        }
    });

    return outputs;
}

function runNodeInFlow(nodeConfig, nodeMap, env, outputContext, outputChain) {
    const { id, type, next } = nodeConfig;
    if (type === "node") {
        const node = nodeMap[id];
        try {
            const res = runNode(node, env, outputChain)
            outputContext[id] = {
                output: res || null
            };
            outputChain.push(res);
        } catch (e) {
            outputContext[id] = {
                error: e?.toString()
            };
            throw new Error(`Failed to run node ${node.name}.`);
        }
        if (next) {
            runNodeInFlow(next, nodeMap, env, outputContext, outputChain)
        }
    } else if (type === "flow") { }
    else {
        throw new Error("Invalid node type received while running the flow.");
    }
}

function runNode(node, env = {}, outputChain = []) {

    let nodeFunc;
    const id = node.id;
    try {
        nodeFunc = new Function("params", node.code);
    } catch (e) {
        throw new Error(
            `Error creating the node function ${node.name || ""} (${id}): ${e}`
        );
    }

    try {
        const res = nodeFunc({ env, outputs: outputChain });
        return res;
    } catch (e) {
        throw new Error(
            `Error executing the node ${node.name || ""} (${id}): ${e}`
        );
    }

}


const fastify = require('fastify')();
const cors = require('@fastify/cors');
const fs = require('fs');
const path = require('path');

// Register CORS
fastify.register(cors, {});

// Register JSON body parser (built-in)
fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
    try {
        const json = JSON.parse(body);
        done(null, json);
    } catch (err) {
        err.statusCode = 400;
        done(err, undefined);
    }
});

const WORKFLOW_FILE = path.join(__dirname, 'workflow.json');

// Endpoint to save workflow
fastify.post('/workflow', async (request, reply) => {
    const { flow, nodeMap } = request.body;
    try {
        let workflow = { flow, nodeMap }
        if (fs.existsSync(WORKFLOW_FILE)) {
            let data = fs.readFileSync(WORKFLOW_FILE, 'utf-8');
            data = JSON.parse(data);
            workflow = { ...data, ...workflow };
        }

        fs.writeFileSync(WORKFLOW_FILE, JSON.stringify(workflow, null, 2));
        reply.send({ success: true });
    } catch (e) {
        reply.status(500).send({ success: false, error: e.message });
    }
});

// Endpoint to get workflow
fastify.get('/workflow', async (request, reply) => {
    try {
        if (!fs.existsSync(WORKFLOW_FILE)) {
            return reply.status(404).send({ error: 'Workflow not found' });
        }
        const data = fs.readFileSync(WORKFLOW_FILE, 'utf-8');
        reply.send(JSON.parse(data));
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
});

// --- ENVIRONMENT VARIABLES ENDPOINTS ---
// Save environment variables
fastify.post('/environment-variables', async (request, reply) => {
    try {
        let envVars = request.body;
        if (typeof envVars !== 'object' || Array.isArray(envVars)) {
            return reply.status(400).send({ error: 'Environment variables must be a JSON object.' });
        }
        let workflow = { flow: {}, nodeMap: {}, env: {} };
        if (fs.existsSync(WORKFLOW_FILE)) {
            workflow = JSON.parse(fs.readFileSync(WORKFLOW_FILE, 'utf-8'));
        }
        workflow.env = envVars;
        fs.writeFileSync(WORKFLOW_FILE, JSON.stringify(workflow, null, 2));
        reply.send({ success: true });
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
});

// Get environment variables
fastify.get('/environment-variables', async (request, reply) => {
    try {
        if (!fs.existsSync(WORKFLOW_FILE)) {
            return reply.send({});
        }
        const workflow = JSON.parse(fs.readFileSync(WORKFLOW_FILE, 'utf-8'));
        reply.send(workflow.env || {});
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
});

// Endpoint to run a node by id
fastify.post('/run-node', async (request, reply) => {
    const { nodeId } = request.body;
    if (!nodeId) {
        return reply.status(400).send({ error: 'Missing nodeId' });
    }
    try {
        if (!fs.existsSync(WORKFLOW_FILE)) {
            return reply.status(404).send({ error: 'Workflow not found' });
        }
        const data = fs.readFileSync(WORKFLOW_FILE, 'utf-8');
        const { nodeMap } = JSON.parse(data);
        const node = nodeMap[nodeId];
        if (!node) {
            return reply.status(404).send({ error: 'Node not found.' });
        }
        let output;
        try {
            output = runNode(node);
        } catch (err) {
            return reply.status(500).send({ error: err.message });
        }
        reply.send({ output: output });
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
});

// Endpoint to run a node by id
fastify.post('/run-workflow', async (request, reply) => {

    try {
        if (!fs.existsSync(WORKFLOW_FILE)) {
            return reply.status(404).send({ error: 'Workflow not found' });
        }
        const data = fs.readFileSync(WORKFLOW_FILE, 'utf-8');
        const { nodeMap, flow, env } = JSON.parse(data);
        const output = runFlow(flow, nodeMap, env);
        reply.send(output);
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
});

// Start server
fastify.listen({ port: 3002 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});