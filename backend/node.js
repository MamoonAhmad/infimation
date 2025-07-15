


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

runFlow(flow, nodeMap);