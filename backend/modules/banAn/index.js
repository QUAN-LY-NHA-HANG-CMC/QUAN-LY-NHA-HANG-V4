const router = require('./banAn.routes');
const banAnService = require('./banAn.service');
const banAnModel = require('./banAn.model');
const banAnController = require('./banAn.controller');

module.exports = {
    router,
    banAnRoutes: router,
    banAnService,
    banAnModel,
    banAnController
};
