const nhanVienService = require('./nhanVien.service.js');
const dinhDangPhanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function layDanhSach(req, res, next) {
    try {
        const { tuKhoa, vaiTroId, trangThai, trang, gioiHan } = req.query;
        const ketQua = await nhanVienService.layDanhSach({ tuKhoa, vaiTroId, trangThai, trang, gioiHan });
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy danh sách nhân viên thành công');
    } catch (loi) {
        next(loi);
    }
}

async function taoNhanVien(req, res, next) {
    try {
        const nhanVienMoi = await nhanVienService.taoNhanVien(req.body);
        return dinhDangPhanHoi.thanhCong(res, nhanVienMoi, 'Tạo tài khoản nhân viên thành công', 201);
    } catch (loi) {
        next(loi);
    }
}

async function capNhatNhanVien(req, res, next) {
    try {
        const nhanVienCapNhat = await nhanVienService.capNhatNhanVien(req.params.id, req.body);
        return dinhDangPhanHoi.thanhCong(res, nhanVienCapNhat, 'Cập nhật nhân viên thành công');
    } catch (loi) {
        next(loi);
    }
}

async function doiTrangThai(req, res, next) {
    try {
        const { trangThai } = req.body;
        await nhanVienService.doiTrangThai(req.params.id, trangThai);
        return dinhDangPhanHoi.thanhCong(res, null, 'Cập nhật trạng thái nhân viên thành công');
    } catch (loi) {
        next(loi);
    }
}

async function datLaiMatKhau(req, res, next) {
    try {
        const { matKhauMoi } = req.body;
        await nhanVienService.datLaiMatKhau(req.params.id, matKhauMoi);
        return dinhDangPhanHoi.thanhCong(res, null, 'Đặt lại mật khẩu thành công');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    layDanhSach,
    taoNhanVien,
    capNhatNhanVien,
    doiTrangThai,
    datLaiMatKhau
};
