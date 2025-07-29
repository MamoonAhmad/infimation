import apiService from './api';

class WorkflowService {
    createWorkflow(nodes, edges) {
        // Build nodeMap
        const nodeMap = nodes.reduce((acc, node) => {
            acc[node.id] = {
                name: node.data.label,
                code: node.data.code,
                id: node.id,
                template_id: node.data.template_id,
                settings: node.data.settings || {},
            };
            return acc;
        }, {});

        const edgeMap = {};
        const flowNodes = [];
        edges.forEach((edge) => {
            const sourceNodeID = edge.source;
            const targetNodeID = edge.target;

            if (!edgeMap[sourceNodeID]) {
                const flowNode = {
                    type: "node",
                    id: sourceNodeID,
                };
                edgeMap[sourceNodeID] = flowNode;
                flowNodes.push(flowNode);
            }
            const flowNode = {
                type: "node",
                id: targetNodeID,
            };
            edgeMap[sourceNodeID].next = flowNode;
            edgeMap[targetNodeID] = flowNode;
        });

        const flow = {
            type: "flow",
            nodes: flowNodes,
        };

        return { flow, nodeMap };
    }

    convertFlowToReactFlow(flow, nodeMap) {
        if (!flow || !flow.nodes) return { nodes: [], edges: [] };

        const loadedNodes = [];
        const loadedEdges = [];
        const visited = new Set();

        function traverse(node, idx) {
            if (!node || visited.has(node.id)) return;
            visited.add(node.id);
            const nodeData = nodeMap[node.id];
            loadedNodes.push({
                id: node.id,
                position: { x: 100, y: (loadedNodes.length + 1) * 100 },
                data: {
                    label: nodeData?.name || node.id,
                    code: nodeData?.code || "",
                    template_id: nodeData?.template_id,
                    settings: nodeData?.settings || {},
                },
            });
            if (node.next && node.next.id) {
                loadedEdges.push({
                    id: node.id + "-" + node.next.id,
                    source: node.id,
                    target: node.next.id,
                });
                traverse(node.next, idx + 1);
            }
        }

        flow.nodes.forEach((node, idx) => traverse(node, idx));
        return { nodes: loadedNodes, edges: loadedEdges };
    }

    async loadWorkflow() {
        try {
            const workflow = await apiService.loadWorkflow();
            return this.convertFlowToReactFlow(workflow.flow, workflow.nodeMap);
        } catch (error) {
            console.error('Failed to load workflow:', error);
            return { nodes: [], edges: [] };
        }
    }

    async saveWorkflow(nodes, edges) {
        const workflow = this.createWorkflow(nodes, edges);
        return await apiService.saveWorkflow(workflow);
    }

    async runWorkflow() {
        return await apiService.runWorkflow();
    }

    async runNode(nodeId) {
        return await apiService.runNode(nodeId);
    }
}

export default new WorkflowService(); 