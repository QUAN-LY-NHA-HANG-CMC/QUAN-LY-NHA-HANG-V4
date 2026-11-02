const gioHangRoutes = require('./gioHang.routes');
const gioHangService = require('./gioHang.service');
const gioHangController = require('./gioHang.controller');

module.exports = {
    gioHangRoutes,
    gioHangService,
    gioHangController,
    router: gioHangRoutes
};
