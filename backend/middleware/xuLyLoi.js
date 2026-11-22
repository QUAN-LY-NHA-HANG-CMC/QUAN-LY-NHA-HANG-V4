// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MIDDLEWARE XỬ LÝ LỖI TẬP TRUNG TOÀN ỨNG DỤNG
// ============================================================================

const { phanHoiLoi } = require('../tienIch/dinhDangPhanHoi');
const cauHinh = require('../cauHinh/cauHinhChung');

/**
 * Middleware bắt lỗi 404 cho các route không tồn tại
 */
function xuLyKhongTimThay(req, res, next) {
    return phanHoiLoi(res, `Đường dẫn [${req.method}] ${req.originalUrl} không tồn tại`, 404);
}

/**
 * Middleware bắt và xử lý mọi ngoại lệ chưa được xử lý
 */
function xuLyLoiChung(err, req, res, next) {
    console.error('🔥 [LỖI HỆ THỐNG]:', err);

    const statusCode = err.status || err.statusCode || 500;
    const thongBaoLoi = err.message || 'Lỗi xử lý nội bộ phía máy chủ';

    // Không để lộ stack trace chi tiết trên môi trường production
    const duLieuLoi = cauHinh.moiTruong === 'development' ? { stack: err.stack } : null;

    return phanHoiLoi(res, thongBaoLoi, statusCode, duLieuLoi);
}

module.exports = {
    xuLyKhongTimThay,
    xuLyLoiChung
};
