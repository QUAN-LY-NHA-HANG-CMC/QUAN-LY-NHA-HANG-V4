const heThongRoutes = require('./heThong.routes');
const heThongService = require('./heThong.service');
const heThongModel = require('./heThong.model');
const heThongController = require('./heThong.controller');

module.exports = {
    router: heThongRoutes,
    heThongRoutes,
    heThongService,
    heThongModel,
    heThongController
};
