/**
 * Controller tiếp nhận yêu cầu HTTP phân hệ Tài khoản & Xác thực
 * Phục vụ US-002, US-003, US-007 -> US-010
 */
const taiKhoanService = require('./taiKhoan.service');
const { phanHoiThanhCong } = require('../../tienIch/dinhDangPhanHoi');
const cauHinhBaoMat = require('../../cauHinh/cauHinhBaoMat');

/**
 * [POST] /api/tai-khoan/dang-nhap
 */
async function dangNhap(req, res, next) {
    try {
        const { tenDangNhap, matKhau } = req.body;
        const diaChiIp = req.ip || req.connection.remoteAddress;
        const thongTinThietBi = req.headers['user-agent'] || 'Không rõ';

        const ketQua = await taiKhoanService.dangNhap({
            tenDangNhap,
            matKhau,
            thongTinThietBi,
            diaChiIp
        });

        // Thiết lập cookie HttpOnly an toàn cho refresh token (Rule 7.11 & Rule 10.8)
        res.cookie('refresh_token', ketQua.tokens.refreshToken, cauHinhBaoMat.cookie);

        return phanHoiThanhCong(res, ketQua, 'Đăng nhập thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [POST] /api/tai-khoan/dang-xuat
 */
async function dangXuat(req, res, next) {
    try {
        const refreshToken = req.body.refreshToken || (req.cookies && req.cookies.refresh_token);
        const taiKhoanId = req.taiKhoan ? req.taiKhoan.id : null;
        const diaChiIp = req.ip || req.connection.remoteAddress;
        const thongTinThietBi = req.headers['user-agent'] || 'Không rõ';

        await taiKhoanService.dangXuat({
            refreshToken,
            taiKhoanId,
            diaChiIp,
            thongTinThietBi
        });

        // Xóa cookie phiên
        res.clearCookie('refresh_token');
        res.clearCookie('access_token');

        return phanHoiThanhCong(res, null, 'Đăng xuất thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [POST] /api/tai-khoan/lam-moi-token
 */
async function lamMoiToken(req, res, next) {
    try {
        const refreshToken = req.refreshTokenHopLe;
        const diaChiIp = req.ip || req.connection.remoteAddress;
        const thongTinThietBi = req.headers['user-agent'] || 'Không rõ';

        const ketQua = await taiKhoanService.lamMoiToken({
            refreshToken,
            diaChiIp,
            thongTinThietBi
        });

        return phanHoiThanhCong(res, ketQua, 'Làm mới token thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [PUT] /api/tai-khoan/doi-mat-khau
 */
async function doiMatKhau(req, res, next) {
    try {
        const taiKhoanId = req.taiKhoan.id;
        const { matKhauCu, matKhauMoi } = req.body;
        const diaChiIp = req.ip || req.connection.remoteAddress;
        const thongTinThietBi = req.headers['user-agent'] || 'Không rõ';

        await taiKhoanService.doiMatKhau({
            taiKhoanId,
            matKhauCu,
            matKhauMoi,
            diaChiIp,
            thongTinThietBi
        });

        // Xóa cookie phiên hiện tại để buộc đăng nhập lại
        res.clearCookie('refresh_token');
        res.clearCookie('access_token');

        return phanHoiThanhCong(res, null, 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại với mật khẩu mới.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [GET] /api/tai-khoan/ho-so
 */
async function layHoSo(req, res, next) {
    try {
        const taiKhoanId = req.taiKhoan.id;
        const ketQua = await taiKhoanService.layHoSo(taiKhoanId);
        return phanHoiThanhCong(res, ketQua, 'Lấy thông tin hồ sơ thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [PUT] /api/tai-khoan/ho-so
 */
async function capNhatHoSo(req, res, next) {
    try {
        const taiKhoanId = req.taiKhoan.id;
        const diaChiIp = req.ip || req.connection.remoteAddress;
        const thongTinThietBi = req.headers['user-agent'] || 'Không rõ';

        const ketQua = await taiKhoanService.capNhatHoSo(taiKhoanId, req.body, diaChiIp, thongTinThietBi);
        return phanHoiThanhCong(res, ketQua, 'Cập nhật hồ sơ cá nhân thành công.');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    dangNhap,
    dangXuat,
    lamMoiToken,
    doiMatKhau,
    layHoSo,
    capNhatHoSo
};
