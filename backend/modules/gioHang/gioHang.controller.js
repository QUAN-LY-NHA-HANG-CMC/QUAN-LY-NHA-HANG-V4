/**
 * Controller xử lý các yêu cầu Giỏ hàng
 * Phụ trách: Minh (Backend Nghiệp vụ)
 */
const gioHangService = require('./gioHang.service.js');
const phanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function kiemTraGia(req, res) {
    try {
        const { danhSachMon } = req.body;
        const ketQua = await gioHangService.kiemTraVaTinhGia(danhSachMon);
        return phanHoi.thanhCong(res, ketQua, 'Tính giá giỏ hàng thành công');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi kiểm tra giá', 400);
    }
}

async function luuGioHangTam(req, res) {
    try {
        const phienBanId = Number(req.params.phienBanId);
        const { gioHang } = req.body;
        const ketQua = await gioHangService.luuGioHangTam(phienBanId, gioHang);
        return phanHoi.thanhCong(res, ketQua, 'Lưu giỏ hàng tạm thành công');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi lưu giỏ hàng', 400);
    }
}

async function layGioHangTam(req, res) {
    try {
        const phienBanId = Number(req.params.phienBanId);
        const ketQua = await gioHangService.layGioHangTam(phienBanId);
        return phanHoi.thanhCong(res, ketQua, 'Lấy giỏ hàng tạm thành công');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi lấy giỏ hàng', 400);
    }
}

module.exports = {
    kiemTraGia,
    luuGioHangTam,
    layGioHangTam
};
