const caLamViecRoutes = require('./caLamViec.routes');
const caLamViecService = require('./caLamViec.service');
const caLamViecModel = require('./caLamViec.model');
const caLamViecController = require('./caLamViec.controller');

module.exports = {
    router: caLamViecRoutes,
    caLamViecRoutes,
    caLamViecService,
    caLamViecModel,
    caLamViecController
};
