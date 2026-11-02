const danhMucMonRoutes = require('./danhMucMon.routes');
const danhMucMonService = require('./danhMucMon.service');
const danhMucMonModel = require('./danhMucMon.model');

module.exports = {
    danhMucMonRoutes,
    danhMucMonService,
    danhMucMonModel,
    router: danhMucMonRoutes
};
