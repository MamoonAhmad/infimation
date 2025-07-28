const fs = require('fs');
const { TEMPLATES_FILE } = require('../config/files');

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

module.exports = {
    runFlow,
    runNodeInFlow,
    runNode
}; 