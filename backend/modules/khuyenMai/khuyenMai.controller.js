/**
 * Controller Khuyến mãi
 * Phụ trách: Minh (Backend Developer)
 */
const khuyenMaiService = require('./khuyenMai.service.js');
const phanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function layDanhSach(req, res, next) {
    try {
        const danhSach = await khuyenMaiService.layDanhSachKhuyenMai();
        return phanHoi.thanhCong(res, danhSach, 'Lấy danh sách khuyến mãi thành công');
    } catch (loi) {
        next(loi);
    }
}

async function kiemTraMa(req, res, next) {
    try {
        const { maKhuyenMai, tongTien } = req.body;
        const ketQua = await khuyenMaiService.kiemTraMa(maKhuyenMai, tongTien);
        return phanHoi.thanhCong(res, ketQua, 'Kiểm tra mã khuyến mãi thành công');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    layDanhSach,
    kiemTraMa
};
