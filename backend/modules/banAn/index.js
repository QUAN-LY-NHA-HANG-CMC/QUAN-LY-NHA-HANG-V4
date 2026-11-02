const banAnRoutes = require('./banAn.routes');
const banAnService = require('./banAn.service');
const banAnModel = require('./banAn.model');

module.exports = {
    banAnRoutes,
    banAnService,
    banAnModel,
    router: banAnRoutes
};
