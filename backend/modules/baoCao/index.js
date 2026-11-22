// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// INDEX PHÂN HỆ BÁO CÁO DOANH THU & TÀI CHÍNH
// ============================================================================

const baoCaoRoutes = require('./baoCao.routes');
const baoCaoService = require('./baoCao.service');
const baoCaoModel = require('./baoCao.model');

module.exports = {
    baoCaoRoutes,
    baoCaoService,
    baoCaoModel
};
