/**
 * Controller tiếp nhận yêu cầu liên quan đến Phiên bàn
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const phienBanService = require('./phienBan.service.js');
const phanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function xacThucQr(req, res) {
    try {
        const { banId, maDinhDanhQr } = req.body;
        const ketQua = await phienBanService.xacThucQrVaMoPhien({ banId, maDinhDanhQr });
        return phanHoi.thanhCong(res, ketQua, 'Xác thực bàn thành công');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi xác thực bàn', 400);
    }
}

async function layChiTietPhien(req, res) {
    try {
        const { maPhien } = req.params;
        const ketQua = await phienBanService.layChiTietPhien(maPhien);
        return phanHoi.thanhCong(res, ketQua, 'Lấy thông tin phiên bàn thành công');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi tải phiên bàn', 404);
    }
}

module.exports = {
    xacThucQr,
    layChiTietPhien
};
