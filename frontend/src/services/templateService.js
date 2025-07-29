import apiService from './api';

class TemplateService {
    async loadTemplates() {
        try {
            return await apiService.loadTemplates();
        } catch (error) {
            console.error('Failed to load templates:', error);
            return [];
        }
    }

    async loadTemplateById(id) {
        try {
            return await apiService.loadTemplateById(id);
        } catch (error) {
            console.error('Failed to load template:', error);
            return null;
        }
    }

    createNodeFromTemplate(template) {
        const id = new Date().getTime().toString();
        return {
            id,
            name: template.name,
            template_id: template.id,
            settings: Object.keys(template.setting_schema).reduce((acc, key) => {
                acc[key] = "";
                return acc;
            }, {}),
            code: template.code
        };
    }
}

export default new TemplateService(); 