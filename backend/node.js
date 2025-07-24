

async function runFlow(flowConfig, nodeMap, env) {
    const outputs = {
        nodeOutputs: {},
        chain: []
    }
    for (const nodeConfig of flowConfig.nodes) {
        try {
            const res = await runNodeInFlow(nodeConfig, nodeMap, env, outputs.nodeOutputs, outputs.chain);
        } catch (e) {
            outputs.error = `Failed to execute workflow. ${e?.toString()}`
        }
    }

    return outputs;
}

async function runNodeInFlow(nodeConfig, nodeMap, env, outputContext, outputChain) {
    const { id, type, next } = nodeConfig;
    if (type === "node") {
        const node = nodeMap[id];
        try {
            const res = await runNode(node, env, outputChain)
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
            await runNodeInFlow(next, nodeMap, env, outputContext, outputChain)
        }
    } else if (type === "flow") { }
    else {
        throw new Error("Invalid node type received while running the flow.");
    }
}

async function runNode(node, env = {}, outputChain = []) {
    let nodeFunc;
    const id = node.id;
    
    // If node has a template_id, fetch the template and use its code
    if (node.template_id) {
        try {
            const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8'));
            const template = templates.find(t => t.id === node.template_id);
            if (!template) {
                throw new Error(`Template with ID ${node.template_id} not found`);
            }
            node.code = template.code;
        } catch (e) {
            throw new Error(`Error loading template ${node.template_id}: ${e.message}`);
        }
    }
    
    try {
        // Create async function from node code
        nodeFunc = new Function("params", `return (async () => { ${node.code} })()`);
    } catch (e) {
        throw new Error(
            `Error creating the node function ${node.name || ""} (${id}): ${e}`
        );
    }

    try {
        const res = await nodeFunc({ 
            env, 
            outputs: outputChain,
            settings: node.settings || {}
        });
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
const TEMPLATES_FILE = path.join(__dirname, 'node_templates.json');

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
            output = await runNode(node);
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
        const output = await runFlow(flow, nodeMap, env);
        reply.send(output);
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
});

// --- NODE TEMPLATES ENDPOINTS ---
// Get all node templates
fastify.get('/node-templates', async (request, reply) => {
    try {
        if (!fs.existsSync(TEMPLATES_FILE)) {
            return reply.send([]);
        }
        const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8'));
        reply.send(templates);
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
});

// Get a specific node template by ID
fastify.get('/node-templates/:id', async (request, reply) => {
    try {
        const { id } = request.params;
        if (!fs.existsSync(TEMPLATES_FILE)) {
            return reply.status(404).send({ error: 'Template not found' });
        }
        const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8'));
        const template = templates.find(t => t.id === id);
        if (!template) {
            return reply.status(404).send({ error: 'Template not found' });
        }
        reply.send(template);
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
});

// Create a new node template
fastify.post('/node-templates', async (request, reply) => {
    try {
        const newTemplate = request.body;
        if (!newTemplate.id || !newTemplate.name || !newTemplate.setting_schema || !newTemplate.code) {
            return reply.status(400).send({ error: 'Missing required fields: id, name, setting_schema, code' });
        }
        
        let templates = [];
        if (fs.existsSync(TEMPLATES_FILE)) {
            templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8'));
        }
        
        // Check if template with same ID already exists
        if (templates.find(t => t.id === newTemplate.id)) {
            return reply.status(400).send({ error: 'Template with this ID already exists' });
        }
        
        templates.push(newTemplate);
        fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
        reply.send({ success: true, template: newTemplate });
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