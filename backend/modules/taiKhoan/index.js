/**
 * Điểm xuất công khai module taiKhoan (Rule 4.7)
 */
const taiKhoanRoutes = require('./taiKhoan.routes');
const taiKhoanService = require('./taiKhoan.service');
const taiKhoanModel = require('./taiKhoan.model');

module.exports = {
    taiKhoanRoutes,
    taiKhoanService,
    taiKhoanModel
};
