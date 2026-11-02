/**
 * Tiện ích chuẩn hóa cấu trúc phản hồi HTTP toàn hệ thống
 */

function thanhCong(res, data = {}, msg = 'Thành công', status = 200) {
    return res.status(status).json({
        ok: true,
        data: data,
        msg: msg
    });
}

function taoThanhCong(res, data = {}, msg = 'Tạo thành công') {
    return thanhCong(res, data, msg, 201);
}

function thatBai(res, msg = 'Yêu cầu không hợp lệ', status = 400, data = null) {
    return res.status(status).json({
        ok: false,
        data: data,
        msg: msg
    });
}

module.exports = {
    thanhCong,
    taoThanhCong,
    thatBai
};
