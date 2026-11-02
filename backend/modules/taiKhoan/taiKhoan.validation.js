/**
 * Kiểm tra dữ liệu đầu vào cho phân hệ Tài khoản (Input Validation)
 * Phục vụ US-006, US-007 -> US-010
 */
const { laTenDangNhapHopLe, laMatKhauHopLe, laSoDienThoaiHopLe, laEmailHopLe } = require('../../tienIch/kiemTraDuLieu');
const { phanHoiLoi } = require('../../tienIch/dinhDangPhanHoi');
const { lamSachDauVao } = require('../../tienIch/lamSachHtml');

/**
 * Middleware kiểm tra dữ liệu đăng nhập
 */
function kiemTraDangNhap(req, res, next) {
    req.body = lamSachDauVao(req.body);
    const { tenDangNhap, matKhau } = req.body;

    if (!tenDangNhap || typeof tenDangNhap !== 'string' || tenDangNhap.trim() === '') {
        return phanHoiLoi(res, 'Vui lòng cung cấp tên đăng nhập.', 400);
    }

    if (!matKhau || typeof matKhau !== 'string' || matKhau.trim() === '') {
        return phanHoiLoi(res, 'Vui lòng cung cấp mật khẩu.', 400);
    }

    next();
}

/**
 * Middleware kiểm tra dữ liệu làm mới token
 */
function kiemTraLamMoiToken(req, res, next) {
    const refreshToken = req.body.refreshToken || (req.cookies && req.cookies.refresh_token);

    if (!refreshToken || typeof refreshToken !== 'string') {
        return phanHoiLoi(res, 'Không tìm thấy refresh token hợp lệ.', 400);
    }

    req.refreshTokenHopLe = refreshToken.trim();
    next();
}

/**
 * Middleware kiểm tra dữ liệu đổi mật khẩu
 */
function kiemTraDoiMatKhau(req, res, next) {
    const { matKhauCu, matKhauMoi, xacNhanMatKhauMoi } = req.body;

    if (!matKhauCu || typeof matKhauCu !== 'string') {
        return phanHoiLoi(res, 'Vui lòng nhập mật khẩu hiện tại.', 400);
    }

    if (!matKhauMoi || !laMatKhauHopLe(matKhauMoi)) {
        return phanHoiLoi(res, 'Mật khẩu mới phải có độ dài ít nhất 6 ký tự.', 400);
    }

    if (matKhauMoi !== xacNhanMatKhauMoi) {
        return phanHoiLoi(res, 'Xác nhận mật khẩu mới không khớp.', 400);
    }

    if (matKhauCu === matKhauMoi) {
        return phanHoiLoi(res, 'Mật khẩu mới không được trùng với mật khẩu hiện tại.', 400);
    }

    next();
}

/**
 * Middleware kiểm tra dữ liệu cập nhật hồ sơ cá nhân
 */
function kiemTraCapNhatHoSo(req, res, next) {
    req.body = lamSachDauVao(req.body);
    const { hoTen, soDienThoai, email } = req.body;

    if (!hoTen || typeof hoTen !== 'string' || hoTen.trim().length < 2) {
        return phanHoiLoi(res, 'Họ và tên phải có ít nhất 2 ký tự.', 400);
    }

    if (soDienThoai && !laSoDienThoaiHopLe(soDienThoai)) {
        return phanHoiLoi(res, 'Số điện thoại không đúng định dạng (VD: 0901234567).', 400);
    }

    if (email && !laEmailHopLe(email)) {
        return phanHoiLoi(res, 'Địa chỉ email không đúng định dạng.', 400);
    }

    next();
}

module.exports = {
    kiemTraDangNhap,
    kiemTraLamMoiToken,
    kiemTraDoiMatKhau,
    kiemTraCapNhatHoSo
};
