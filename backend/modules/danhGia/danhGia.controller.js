/**
 * Controller Đánh giá khách hàng
 * Phụ trách: Minh (Backend Developer)
 */
const danhGiaService = require('./danhGia.service.js');
const dinhDangPhanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function taoDanhGia(req, res, next) {
    try {
        const ketQua = await danhGiaService.taoDanhGia(req.body);
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Gửi đánh giá thành công', 201);
    } catch (loi) {
        next(loi);
    }
}

async function layDanhSach(req, res, next) {
    try {
        const { chiTieuCuc, soSao, trangThai, gioiHan } = req.query;
        const ketQua = await danhGiaService.layDanhSach({ chiTieuCuc, soSao, trangThai, gioiHan });
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy danh sách đánh giá thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layDiemTrungBinh(req, res, next) {
    try {
        const ketQua = await danhGiaService.layDiemTrungBinh();
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy điểm đánh giá trung bình thành công');
    } catch (loi) {
        next(loi);
    }
}

async function phanHoiDanhGia(req, res, next) {
    try {
        const { phanHoi } = req.body;
        const ketQua = await danhGiaService.phanHoiDanhGia(req.params.id, phanHoi);
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Phản hồi đánh giá thành công');
    } catch (loi) {
        next(loi);
    }
}

async function doiTrangThai(req, res, next) {
    try {
        const { trangThai } = req.body;
        const ketQua = await danhGiaService.doiTrangThai(req.params.id, trangThai);
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Cập nhật trạng thái đánh giá thành công');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    taoDanhGia,
    layDanhSach,
    layDiemTrungBinh,
    phanHoiDanhGia,
    doiTrangThai
};
