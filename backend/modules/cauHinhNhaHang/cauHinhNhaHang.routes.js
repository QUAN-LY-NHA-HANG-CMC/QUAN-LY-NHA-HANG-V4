/**
 * Định tuyến (Routes) phân hệ Cấu hình nhà hàng & Nhật ký hệ thống
 * Phục vụ US-041 -> US-044
 */
const express = require('express');
const router = express.Router();

const cauHinhController = require('./cauHinhNhaHang.controller');
const {
    kiemTraThongTinNhaHang,
    kiemTraThuePhi,
    kiemTraVietQr,
    kiemTraTaoMaVietQr
} = require('./cauHinhNhaHang.validation');

const { xacThuc } = require('../../middleware/xacThuc');
const { kiemTraVaiTro, kiemTraQuyen } = require('../../middleware/phanQuyen');

// 1. API công khai thông tin nhà hàng cho khách xem thực đơn QR (Không cần đăng nhập)
router.get('/cong-khai', cauHinhController.layThongTinCongKhai);

// Toàn bộ các API phía dưới bắt buộc đã đăng nhập
router.use(xacThuc);

// 2. Cấu hình thông tin nhà hàng (US-041)
router.get('/thong-tin', cauHinhController.layThongTinNhaHang);
router.put('/thong-tin', kiemTraVaiTro(['QUAN_LY']), kiemTraThongTinNhaHang, cauHinhController.capNhatThongTinNhaHang);

// 3. Cấu hình thuế VAT và phí phục vụ (US-042)
router.get('/thue-phi', cauHinhController.layThuePhi);
router.put('/thue-phi', kiemTraVaiTro(['QUAN_LY']), kiemTraThuePhi, cauHinhController.capNhatThuePhi);

// 4. Cấu hình tài khoản VietQR (US-043)
router.get('/viet-qr', cauHinhController.layCauHinhVietQr);
router.put('/viet-qr', kiemTraVaiTro(['QUAN_LY']), kiemTraVietQr, cauHinhController.capNhatCauHinhVietQr);
router.post('/viet-qr/tao-ma', kiemTraVaiTro(['QUAN_LY', 'THU_NGAN']), kiemTraTaoMaVietQr, cauHinhController.taoMaVietQrThanhToan);

// 5. Truy xuất nhật ký hệ thống - System Logs (US-044)
router.get('/nhat-ky-he-thong', kiemTraVaiTro(['QUAN_LY']), cauHinhController.layDanhSachNhatKy);

module.exports = router;
