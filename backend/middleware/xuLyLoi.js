/**
 * Middleware xử lý lỗi tập trung và xử lý 404
 * Tuân thủ mục 4.6 & 10.10 (QUY_TAC_LAM_DU_AN.txt)
 */
const { phanHoiLoi } = require('../tienIch/dinhDangPhanHoi');
const cauHinhChung = require('../cauHinh/cauHinhChung');

/**
 * Xử lý các đường dẫn API không tồn tại (404)
 */
function xuLyKhongTimThay(req, res, next) {
    return phanHoiLoi(res, `Đường dẫn API '${req.method} ${req.originalUrl}' không tồn tại trên hệ thống.`, 404);
}

/**
 * Xử lý lỗi toàn cục
 */
function xuLyLoiToanCuc(err, req, res, next) {
    const maHttp = err.status || err.statusCode || 500;
    
    // Không để lộ lỗi nội bộ, câu lệnh SQL hoặc file stack ra ngoài ở môi trường production
    let thongDiepLoi = err.message || 'Lỗi máy chủ nội bộ';
    if (maHttp === 500 && !cauHinhChung.laMoiTruongPhatTrien) {
        thongDiepLoi = 'Đã xảy ra sự cố phía máy chủ, vui lòng liên hệ quản trị viên.';
    }

    // In log lỗi máy chủ để debug
    if (maHttp === 500) {
        console.error(`[LỖI SERVER] ${req.method} ${req.originalUrl}:`, err);
    }

    return phanHoiLoi(res, thongDiepLoi, maHttp, err.chiTiet || null);
}

module.exports = {
    xuLyKhongTimThay,
    xuLyLoiToanCuc
};
