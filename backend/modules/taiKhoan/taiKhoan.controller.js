const taiKhoanService = require('./taiKhoan.service.js');
const dinhDangPhanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function dangNhap(req, res, next) {
    try {
        const { tenDangNhap, matKhau } = req.body;
        const ketQua = await taiKhoanService.dangNhap(tenDangNhap, matKhau);
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Đăng nhập thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layHoSo(req, res, next) {
    try {
        const thongTin = await taiKhoanService.layThongTinCaNhan(req.nguoiDung.taiKhoanId);
        return dinhDangPhanHoi.thanhCong(res, thongTin, 'Lấy thông tin tài khoản thành công');
    } catch (loi) {
        next(loi);
    }
}

async function doiMatKhau(req, res, next) {
    try {
        const { matKhauCu, matKhauMoi } = req.body;
        await taiKhoanService.doiMatKhau(req.nguoiDung.taiKhoanId, matKhauCu, matKhauMoi);
        return dinhDangPhanHoi.thanhCong(res, null, 'Đổi mật khẩu thành công');
    } catch (loi) {
        next(loi);
    }
}

async function capNhatHoSo(req, res, next) {
    try {
        const thongTinMoi = await taiKhoanService.capNhatHoSo(req.nguoiDung.taiKhoanId, req.body);
        return dinhDangPhanHoi.thanhCong(res, thongTinMoi, 'Cập nhật thông tin cá nhân thành công');
    } catch (loi) {
        next(loi);
    }
}

async function dangXuat(req, res) {
    return dinhDangPhanHoi.thanhCong(res, null, 'Đăng xuất thành công');
}

module.exports = {
    dangNhap,
    layHoSo,
    doiMatKhau,
    capNhatHoSo,
    dangXuat
};
