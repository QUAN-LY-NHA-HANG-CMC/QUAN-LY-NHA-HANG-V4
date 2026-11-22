const dieuPhoiBepRoutes = require('./dieuPhoiBep.routes');
const dieuPhoiBepService = require('./dieuPhoiBep.service');
const dieuPhoiBepModel = require('./dieuPhoiBep.model');
const dieuPhoiBepController = require('./dieuPhoiBep.controller');

module.exports = {
    router: dieuPhoiBepRoutes,
    dieuPhoiBepRoutes,
    dieuPhoiBepService,
    dieuPhoiBepModel,
    dieuPhoiBepController
};
