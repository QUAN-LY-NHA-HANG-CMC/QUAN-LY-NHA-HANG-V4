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

async function moBanTrucTiep(req, res) {
    try {
        const { banId, soKhach, ghiChu } = req.body;
        const ketQua = await phienBanService.moBanTrucTiep({ banId, soKhach, ghiChu });
        return phanHoi.thanhCong(res, ketQua, 'Mở bàn thành công');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi mở bàn', 400);
    }
}

async function chuyenBan(req, res) {
    try {
        const { phienBanId, banDichId, lyDo, nguoiThucHien } = req.body;
        const ketQua = await phienBanService.chuyenBan({ phienBanId, banDichId, lyDo, nguoiThucHien });
        return phanHoi.thanhCong(res, ketQua, 'Chuyển bàn thành công');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi chuyển bàn', 400);
    }
}

async function ghepBan(req, res) {
    try {
        const { phienBanNguonId, phienBanDichId, lyDo, nguoiThucHien } = req.body;
        const ketQua = await phienBanService.ghepBan({ phienBanNguonId, phienBanDichId, lyDo, nguoiThucHien });
        return phanHoi.thanhCong(res, ketQua, 'Ghép bàn thành công');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi ghép bàn', 400);
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
    moBanTrucTiep,
    chuyenBan,
    ghepBan,
    layChiTietPhien
};
