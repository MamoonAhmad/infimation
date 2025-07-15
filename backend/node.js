


function runFlow(flowConfig, nodeMap) {
    const responses = flowConfig.nodes.map(nodeConfig => {
        return runNode(nodeConfig, nodeMap);
    })
}

function runNode(nodeConfig, nodeMap) {
    const { id, type, next } = nodeConfig;
    if (type === "node") {
        const node = nodeMap[id];
        let nodeFunc;
        try {
            nodeFunc = new Function(node.code);
        } catch (e) {
            throw new Error(
                `Error creating the node function ${node.name || ""} (${id}): ${e}`
            );
        }

        try {
            nodeFunc();
        } catch (e) {
            throw new Error(
                `Error executing the node ${node.name || ""} (${id}): ${e}`
            );
        }

        if (next) {
            runNode(next, nodeMap)
        }
    } else if (type === "flow") { }
    else {
        throw new Error("Invalid node type received while running the flow.");
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

// Start server
fastify.listen({ port: 3002 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});