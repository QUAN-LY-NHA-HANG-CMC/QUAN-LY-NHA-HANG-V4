// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MIDDLEWARE PHÂN QUYỀN TRUY CẬP THEO VAI TRÒ (RBAC)
// ============================================================================

const { phanHoiLoi } = require('../tienIch/dinhDangPhanHoi');

/**
 * Middleware kiểm tra vai trò người dùng được phép thực thi API
 * @param  {...string} danhSachVaiTro Danh sách mã vai trò (quan_ly, thu_ngan, bep, phuc_vu)
 */
function phanQuyen(...danhSachVaiTro) {
    return (req, res, next) => {
        if (!req.nguoiDung) {
            return phanHoiLoi(res, 'Chưa xác thực danh tính người dùng', 401);
        }

        const vaiTroHienTai = req.nguoiDung.vaiTro;

        // Quản lý luôn có quyền cao nhất
        if (vaiTroHienTai === 'quan_ly' || danhSachVaiTro.includes(vaiTroHienTai)) {
            return next();
        }

        return phanHoiLoi(res, 'Bạn không có quyền thực hiện chức năng này', 403);
    };
}

module.exports = {
    phanQuyen
};
