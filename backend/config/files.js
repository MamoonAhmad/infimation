const path = require('path');

const WORKFLOW_FILE = path.join(__dirname, '..', 'workflow.json');
const TEMPLATES_FILE = path.join(__dirname, '..', 'node_templates.json');

module.exports = {
    WORKFLOW_FILE,
    TEMPLATES_FILE
}; 