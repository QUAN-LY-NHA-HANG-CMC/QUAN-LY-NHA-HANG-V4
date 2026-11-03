/**
 * Controller Thanh toán
 * Phụ trách: Minh (Backend Developer)
 */
const thanhToanService = require('./thanhToan.service.js');
const phanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function taoVietQr(req, res, next) {
    try {
        const { phienBanId, soTien, ghiChu } = req.body;
        const ketQua = await thanhToanService.taoVietQr({ phienBanId, soTien, ghiChu });
        return phanHoi.thanhCong(res, ketQua, 'Tạo mã VietQR thành công');
    } catch (loi) {
        next(loi);
    }
}

async function xacNhanThanhToan(req, res, next) {
    try {
        const { phienBanId, maKhuyenMai, phuongThuc, soTienKhachDua, maChuyenKhoan, nguoiThucHien, ghiChu } = req.body;
        const ketQua = await thanhToanService.xacNhanThanhToan({
            phienBanId,
            maKhuyenMai,
            phuongThuc,
            soTienKhachDua,
            maChuyenKhoan,
            nguoiThucHien,
            ghiChu
        });
        return phanHoi.thanhCong(res, ketQua, 'Thanh toán và đóng phiên thành công');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    taoVietQr,
    xacNhanThanhToan
};
