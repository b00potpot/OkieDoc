
module.exports.blueprints = {

  // Prefixes all automatic blueprint/REST routes with /api
  prefix: '/api',

  // Disable browser URL shortcuts (Highly Recommended for Security)
  // When true, you could accidentally run operations via a simple browser URL,
  // like going to: http://localhost:1337/api/soap/create?subjective=cough
  shortcuts: false,

  // Automatic REST routes (e.g., GET /api/soap, POST /api/soap)
  // Set to true if you want Sails to automatically build CRUD endpoints for every model.
  // Set to false if you prefer to explicitly define every single endpoint in config/routes.js.
  rest: true,

  // Automatic action routes (e.g., /api/soap/findbyconsultation)
  // Set to false to prevent Sails from guessing routes based on controller method names.
  actions: false,

};