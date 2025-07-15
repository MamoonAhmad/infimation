


function runFlow(flowConfig, nodeMap) {
    const outputs = {
        nodeOutputs: {}
    }
    flowConfig.nodes.forEach(nodeConfig => {
        try {
            const res = runNodeInFlow(nodeConfig, nodeMap, outputs.nodeOutputs);
        } catch (e) {
            outputs.error = `Failed to execute workflow. ${e?.toString()}`
        }
    });

    return outputs;
}

function runNodeInFlow(nodeConfig, nodeMap, outputContext) {
    const { id, type, next } = nodeConfig;
    if (type === "node") {
        const node = nodeMap[id];
        try {
            const res = runNode(node)
            outputContext[id] = {
                output: res || null
            };
            if (next) {
                runNodeInFlow(next, nodeMap, outputContext)
            }
        } catch (e) {
            outputContext[id] = {
                error: e?.toString()
            };
            throw new Error(`Failed to run node ${node.name}.`);
        }
    } else if (type === "flow") { }
    else {
        throw new Error("Invalid node type received while running the flow.");
    }
}

function runNode(node) {

    let nodeFunc;
    try {
        nodeFunc = new Function(node.code);
    } catch (e) {
        throw new Error(
            `Error creating the node function ${node.name || ""} (${id}): ${e}`
        );
    }

    try {
        const res = nodeFunc();
        return res;
    } catch (e) {
        throw new Error(
            `Error executing the node ${node.name || ""} (${id}): ${e}`
        );
    }

}


const flow = {
    type: "flow",
    nodes: [
        {
            id: "node1",
            type: "node",
            next: {
                id: "node2",
                type: "node"
            }
        }
    ]
}

const nodeMap = {
    node1: {
        name: "First Node",
        code: `
            console.log("Executed First Node.")
        `
    },
    node2: {
        name: "Second Node",
        code: `
            console.log("Executed Second Node.")
        `
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
        fs.writeFileSync(WORKFLOW_FILE, JSON.stringify({ flow, nodeMap }, null, 2));
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
            output = runNode({
                id: nodeId,
                type: "node"
            }, nodeMap);
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
        const { nodeMap, flow } = JSON.parse(data);
        const output = runFlow(flow, nodeMap);
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