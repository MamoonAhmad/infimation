const fs = require('fs');
const { WORKFLOW_FILE } = require('../config/files');

function saveWorkflow(flow, nodeMap) {
    try {
        let workflow = { flow, nodeMap }
        if (fs.existsSync(WORKFLOW_FILE)) {
            let data = fs.readFileSync(WORKFLOW_FILE, 'utf-8');
            data = JSON.parse(data);
            workflow = { ...data, ...workflow };
        }

        fs.writeFileSync(WORKFLOW_FILE, JSON.stringify(workflow, null, 2));
        return { success: true };
    } catch (e) {
        throw new Error(e.message);
    }
}

function loadWorkflow() {
    try {
        if (!fs.existsSync(WORKFLOW_FILE)) {
            return null;
        }
        const data = fs.readFileSync(WORKFLOW_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        throw new Error(e.message);
    }
}

function saveEnvironmentVariables(envVars) {
    try {
        if (typeof envVars !== 'object' || Array.isArray(envVars)) {
            throw new Error('Environment variables must be a JSON object.');
        }
        
        let workflow = { flow: {}, nodeMap: {}, env: {} };
        if (fs.existsSync(WORKFLOW_FILE)) {
            workflow = JSON.parse(fs.readFileSync(WORKFLOW_FILE, 'utf-8'));
        }
        workflow.env = envVars;
        fs.writeFileSync(WORKFLOW_FILE, JSON.stringify(workflow, null, 2));
        return { success: true };
    } catch (e) {
        throw new Error(e.message);
    }
}

function loadEnvironmentVariables() {
    try {
        if (!fs.existsSync(WORKFLOW_FILE)) {
            return {};
        }
        const workflow = JSON.parse(fs.readFileSync(WORKFLOW_FILE, 'utf-8'));
        return workflow.env || {};
    } catch (e) {
        throw new Error(e.message);
    }
}

module.exports = {
    saveWorkflow,
    loadWorkflow,
    saveEnvironmentVariables,
    loadEnvironmentVariables
}; 