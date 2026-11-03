const nhanVienRoutes = require('./nhanVien.routes');
const nhanVienService = require('./nhanVien.service');
const nhanVienModel = require('./nhanVien.model');

module.exports = {
    nhanVienRoutes,
    nhanVienService,
    nhanVienModel,
    router: nhanVienRoutes
};
