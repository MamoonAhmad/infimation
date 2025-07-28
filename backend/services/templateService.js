const fs = require('fs');
const { TEMPLATES_FILE } = require('../config/files');

function loadTemplates() {
    try {
        if (!fs.existsSync(TEMPLATES_FILE)) {
            return [];
        }
        const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8'));
        return templates;
    } catch (e) {
        throw new Error(e.message);
    }
}

function saveTemplates(templates) {
    try {
        fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
        return { success: true };
    } catch (e) {
        throw new Error(e.message);
    }
}

function getTemplateById(id) {
    try {
        const templates = loadTemplates();
        const template = templates.find(t => t.id === id);
        return template || null;
    } catch (e) {
        throw new Error(e.message);
    }
}

function createTemplate(newTemplate) {
    try {
        if (!newTemplate.id || !newTemplate.name || !newTemplate.setting_schema || !newTemplate.code) {
            throw new Error('Missing required fields: id, name, setting_schema, code');
        }
        
        let templates = loadTemplates();
        
        // Check if template with same ID already exists
        if (templates.find(t => t.id === newTemplate.id)) {
            throw new Error('Template with this ID already exists');
        }
        
        templates.push(newTemplate);
        saveTemplates(templates);
        return { success: true, template: newTemplate };
    } catch (e) {
        throw new Error(e.message);
    }
}

module.exports = {
    loadTemplates,
    saveTemplates,
    getTemplateById,
    createTemplate
}; 