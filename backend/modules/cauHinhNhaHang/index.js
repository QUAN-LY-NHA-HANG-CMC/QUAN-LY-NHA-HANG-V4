/**
 * Điểm xuất công khai module cauHinhNhaHang (Rule 4.7)
 */
const cauHinhNhaHangRoutes = require('./cauHinhNhaHang.routes');
const cauHinhNhaHangService = require('./cauHinhNhaHang.service');
const cauHinhNhaHangModel = require('./cauHinhNhaHang.model');

module.exports = {
    cauHinhNhaHangRoutes,
    cauHinhNhaHangService,
    cauHinhNhaHangModel
};
