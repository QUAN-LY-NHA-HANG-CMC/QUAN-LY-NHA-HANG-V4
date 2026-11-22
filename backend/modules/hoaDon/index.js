const hoaDonRoutes = require('./hoaDon.routes');
const hoaDonService = require('./hoaDon.service');
const hoaDonModel = require('./hoaDon.model');
const hoaDonController = require('./hoaDon.controller');

module.exports = {
    router: hoaDonRoutes,
    hoaDonRoutes,
    hoaDonService,
    hoaDonModel,
    hoaDonController
};
