const router = require('./taiKhoan.routes');
const taiKhoanService = require('./taiKhoan.service');
const taiKhoanModel = require('./taiKhoan.model');
const taiKhoanController = require('./taiKhoan.controller');

module.exports = {
    router,
    taiKhoanRoutes: router,
    taiKhoanService,
    taiKhoanModel,
    taiKhoanController
};
