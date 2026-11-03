/**
 * Controller tiếp nhận yêu cầu đặt món và hủy món
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const donGoiMonService = require('./donGoiMon.service.js');
const phanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function taoDonGoiMon(req, res) {
    try {
        const { phienBanId, banAnId, ghiChu, danhSachMon } = req.body;
        const ketQua = await donGoiMonService.taoDonHang({ phienBanId, banAnId, ghiChu, danhSachMon });
        return phanHoi.taoThanhCong(res, ketQua, 'Đặt món thành công');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi đặt món', 400);
    }
}

async function huyMon(req, res) {
    try {
        const chiTietId = Number(req.params.chiTietId);
        const { lyDo } = req.body;
        const ketQua = await donGoiMonService.huyMon(chiTietId, lyDo);
        return phanHoi.thanhCong(res, ketQua, 'Hủy món thành công');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi hủy món', 400);
    }
}

async function danhDauDaPhucVu(req, res) {
    try {
        const chiTietId = Number(req.params.chiTietId);
        const { nguoiThucHien } = req.body || {};
        const ketQua = await donGoiMonService.danhDauDaPhucVu(chiTietId, nguoiThucHien);
        return phanHoi.thanhCong(res, ketQua, 'Đã đánh dấu món phục vụ lên bàn');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi cập nhật trạng thái món', 400);
    }
}

async function layDonTheoBan(req, res) {
    try {
        const banId = Number(req.params.banId);
        const ketQua = await donGoiMonService.layDonTheoBan(banId);
        return phanHoi.thanhCong(res, ketQua, 'Lấy danh sách đơn gọi món thành công');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi lấy đơn món', 400);
    }
}

module.exports = {
    taoDonGoiMon,
    huyMon,
    danhDauDaPhucVu,
    layDonTheoBan
};
