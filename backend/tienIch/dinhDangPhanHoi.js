// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// ĐỊNH DẠNG CẤU TRÚC PHẢN HỒI API CHUẨN TOÀN HỆ THỐNG
// ============================================================================

/**
 * Định dạng phản hồi HTTP thành công chuẩn
 * @param {import('express').Response} res 
 * @param {*} data Dữ liệu trả về (mảng hoặc đối tượng)
 * @param {string} msg Thông điệp kết quả
 * @param {number} statusCode Mã trạng thái HTTP (mặc định 200)
 */
function phanHoiThanhCong(res, data = {}, msg = 'Thành công', statusCode = 200) {
    return res.status(statusCode).json({
        ok: true,
        data,
        msg
    });
}

/**
 * Định dạng phản hồi HTTP thất bại chuẩn
 * @param {import('express').Response} res 
 * @param {string} msg Diễn giải lỗi tiếng Việt
 * @param {number} statusCode Mã trạng thái HTTP lỗi (400, 401, 403, 404, 500)
 * @param {*} data Dữ liệu chi tiết lỗi (nếu có)
 */
function phanHoiLoi(res, msg = 'Dữ liệu không hợp lệ', statusCode = 400, data = null) {
    return res.status(statusCode).json({
        ok: false,
        data,
        msg
    });
}

module.exports = {
    phanHoiThanhCong,
    phanHoiLoi
};
