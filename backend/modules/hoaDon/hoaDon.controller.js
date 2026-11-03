/**
 * Controller Hóa đơn
 * Phụ trách: Minh (Backend Developer)
 */
const hoaDonService = require('./hoaDon.service.js');
const phanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function layHoaDonTamTinh(req, res, next) {
    try {
        const phienBanId = parseInt(req.params.phienBanId, 10);
        const { maKhuyenMai } = req.query;
        const ketQua = await hoaDonService.taoHoaDonTamTinh(phienBanId, maKhuyenMai);
        return phanHoi.thanhCong(res, ketQua, 'Lấy bảng kê hóa đơn tạm tính thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layLichSuHoaDon(req, res, next) {
    try {
        const { tuNgay, denNgay, banId } = req.query;
        const ketQua = await hoaDonService.layLichSuHoaDon({ tuNgay, denNgay, banId });
        return phanHoi.thanhCong(res, ketQua, 'Lấy lịch sử hóa đơn thành công');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    layHoaDonTamTinh,
    layLichSuHoaDon
};
