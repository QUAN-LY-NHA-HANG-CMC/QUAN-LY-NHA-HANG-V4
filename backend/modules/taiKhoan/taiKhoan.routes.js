// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// ĐỊNH TUYẾN ĐƯỜNG DẪN API TÀI KHOẢN VÀ XÁC THỰC
// ============================================================================

const express = require('express');
const router = express.Router();
const taiKhoanController = require('./taiKhoan.controller');
const { xacThucNguoiDung } = require('../../middleware/xacThuc');
const { phanQuyen } = require('../../middleware/phanQuyen');

// Public route: Đăng nhập
router.post('/dang-nhap', taiKhoanController.dangNhap);

// Protected routes: Cần đăng nhập
router.get('/me', xacThucNguoiDung, taiKhoanController.layThongTinMe);
router.put('/doi-mat-khau', xacThucNguoiDung, taiKhoanController.doiMatKhau);

// Quản trị Nhân sự toàn hệ thống (Chỉ Quản lý - Figma A02, A03, A04, A05)
router.get('/nhan-su', xacThucNguoiDung, phanQuyen('quan_ly'), taiKhoanController.layDanhSachNhanSu);
router.post('/nhan-su', xacThucNguoiDung, phanQuyen('quan_ly'), taiKhoanController.taoNhanSu);
router.put('/nhan-su/:id/trang-thai', xacThucNguoiDung, phanQuyen('quan_ly'), taiKhoanController.doiTrangThaiNhanSu);
router.get('/nhan-su/ban-co-the-giao', xacThucNguoiDung, phanQuyen('quan_ly'), taiKhoanController.layBanCoTheGiao);
router.get('/nhan-su/:id', xacThucNguoiDung, phanQuyen('quan_ly'), taiKhoanController.layChiTietNhanSu);
router.put('/nhan-su/:id', xacThucNguoiDung, phanQuyen('quan_ly'), taiKhoanController.capNhatNhanSu);
router.delete('/nhan-su/:id', xacThucNguoiDung, phanQuyen('quan_ly'), taiKhoanController.xoaNhanSu);
router.get('/nhan-su/:id/ban-phu-trach', xacThucNguoiDung, phanQuyen('quan_ly'), taiKhoanController.layBanPhuTrach);
router.put('/nhan-su/:id/ban-phu-trach', xacThucNguoiDung, phanQuyen('quan_ly'), taiKhoanController.capNhatBanPhuTrach);

module.exports = router;
