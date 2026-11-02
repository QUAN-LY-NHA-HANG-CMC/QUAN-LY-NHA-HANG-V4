/**
 * Chuẩn hóa định dạng phản hồi API theo Mục 9 (QUY_TAC_LAM_DU_AN.txt)
 * Thành công: { "ok": true, "data": ..., "msg": "..." }
 * Thất bại: { "ok": false, "data": null, "msg": "..." }
 */

/**
 * Trả về phản hồi thành công chuẩn RESTful
 * @param {Object} res - Đối tượng response của Express
 * @param {any} duLieu - Dữ liệu trả về cho client
 * @param {string} thongBao - Thông điệp thông báo
 * @param {number} maHttp - Mã trạng thái HTTP (mặc định 200, tạo mới 201)
 */
function phanHoiThanhCong(res, duLieu = {}, thongBao = 'Thành công', maHttp = 200) {
    return res.status(maHttp).json({
        ok: true,
        data: duLieu,
        msg: thongBao
    });
}

/**
 * Trả về phản hồi tạo mới thành công HTTP 201
 */
function taoThanhCong(res, duLieu = {}, thongBao = 'Tạo thành công') {
    return phanHoiThanhCong(res, duLieu, thongBao, 201);
}

/**
 * Trả về phản hồi lỗi chuẩn
 * @param {Object} res - Đối tượng response của Express
 * @param {string} thongBaoLoi - Thông điệp lỗi
 * @param {number} maHttp - Mã trạng thái HTTP (400, 401, 403, 404, 409, 429, 500)
 * @param {any} chiTietLoi - Dữ liệu bổ sung nếu cần (mặc định null)
 */
function phanHoiLoi(res, thongBaoLoi = 'Có lỗi xảy ra', maHttp = 400, chiTietLoi = null) {
    return res.status(maHttp).json({
        ok: false,
        data: chiTietLoi,
        msg: thongBaoLoi
    });
}

module.exports = {
    phanHoiThanhCong,
    phanHoiLoi,
    thanhCong: phanHoiThanhCong,
    thatBai: phanHoiLoi,
    loi: phanHoiLoi,
    taoThanhCong
};
