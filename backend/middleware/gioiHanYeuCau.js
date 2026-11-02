/**
 * Middleware giới hạn tần suất gửi yêu cầu (Rate Limiting) chống spam và tấn công Brute-force
 * Phục vụ US-005 & Mục 10.7 (QUY_TAC_LAM_DU_AN.txt)
 */
const rateLimit = require('express-rate-limit');
const cauHinhBaoMat = require('../cauHinh/cauHinhBaoMat');
const { phanHoiLoi } = require('../tienIch/dinhDangPhanHoi');

/**
 * Giới hạn tần suất chung cho toàn bộ các API
 */
const gioiHanChung = rateLimit({
    windowMs: cauHinhBaoMat.gioiHanYeuCau.cuaSoThoiGianPhut * 60 * 1000,
    max: cauHinhBaoMat.gioiHanYeuCau.soLuongToiDaChung,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return phanHoiLoi(
            res,
            `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${cauHinhBaoMat.gioiHanYeuCau.cuaSoThoiGianPhut} phút.`,
            429
        );
    }
});

/**
 * Giới hạn tần suất nghiêm ngặt cho API đăng nhập và đổi mật khẩu chống tấn công dò mật khẩu (Brute-force)
 */
const gioiHanDangNhap = rateLimit({
    windowMs: cauHinhBaoMat.gioiHanYeuCau.cuaSoThoiGianPhut * 60 * 1000,
    max: cauHinhBaoMat.gioiHanYeuCau.soLuongToiDaDangNhap,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return phanHoiLoi(
            res,
            `Bạn đã thử đăng nhập quá số lần cho phép. Vui lòng chờ ${cauHinhBaoMat.gioiHanYeuCau.cuaSoThoiGianPhut} phút trước khi thử lại.`,
            429
        );
    }
});

module.exports = {
    gioiHanChung,
    gioiHanDangNhap
};
