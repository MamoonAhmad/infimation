const templateService = require('../services/templateService');

async function getAllTemplatesHandler(request, reply) {
    try {
        const templates = templateService.loadTemplates();
        reply.send(templates);
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
}

async function getTemplateByIdHandler(request, reply) {
    try {
        const { id } = request.params;
        const template = templateService.getTemplateById(id);
        if (!template) {
            return reply.status(404).send({ error: 'Template not found' });
        }
        reply.send(template);
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
}

async function createTemplateHandler(request, reply) {
    try {
        const newTemplate = request.body;
        const result = templateService.createTemplate(newTemplate);
        reply.send(result);
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
}

module.exports = {
    getAllTemplatesHandler,
    getTemplateByIdHandler,
    createTemplateHandler
}; 