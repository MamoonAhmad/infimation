const fastify = require('fastify')();
const cors = require('@fastify/cors');

// Import middleware
const jsonBodyParser = require('./middleware/jsonParser');

// Import route handlers
const workflowRoutes = require('./routes/workflow');
const environmentRoutes = require('./routes/environment');
const templateRoutes = require('./routes/templates');

// Register CORS
fastify.register(cors, {});

// Register JSON body parser
fastify.addContentTypeParser('application/json', { parseAs: 'string' }, jsonBodyParser);

// Register workflow routes
fastify.post('/workflow', workflowRoutes.saveWorkflowHandler);
fastify.get('/workflow', workflowRoutes.getWorkflowHandler);
fastify.post('/run-node', workflowRoutes.runNodeHandler);
fastify.post('/run-workflow', workflowRoutes.runWorkflowHandler);

// Register environment routes
fastify.post('/environment-variables', environmentRoutes.saveEnvironmentVariablesHandler);
fastify.get('/environment-variables', environmentRoutes.getEnvironmentVariablesHandler);

// Register template routes
fastify.get('/node-templates', templateRoutes.getAllTemplatesHandler);
fastify.get('/node-templates/:id', templateRoutes.getTemplateByIdHandler);
fastify.post('/node-templates', templateRoutes.createTemplateHandler);

// Start server
fastify.listen({ port: 3002 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
}); 