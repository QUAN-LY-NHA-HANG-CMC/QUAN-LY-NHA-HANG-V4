const vaiTroService = require('./vaiTro.service.js');
const dinhDangPhanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function layDanhSachVaiTro(req, res, next) {
    try {
        const danhSach = vaiTroService.layDanhSachVaiTro();
        return dinhDangPhanHoi.thanhCong(res, danhSach, 'Lấy danh sách vai trò thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layDanhSachQuyen(req, res, next) {
    try {
        const danhSachQuyen = vaiTroService.layToanBoQuyenHan();
        return dinhDangPhanHoi.thanhCong(res, danhSachQuyen, 'Lấy danh sách quyền thành công');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    layDanhSachVaiTro,
    layDanhSachQuyen
};
