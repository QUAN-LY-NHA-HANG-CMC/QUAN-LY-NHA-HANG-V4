/**
 * Định tuyến (Routes) phân hệ Tài khoản cá nhân & Xác thực
 * Phục vụ US-001 -> US-003, US-007 -> US-010
 */
const express = require('express');
const router = express.Router();

const taiKhoanController = require('./taiKhoan.controller');
const {
    kiemTraDangNhap,
    kiemTraLamMoiToken,
    kiemTraDoiMatKhau,
    kiemTraCapNhatHoSo
} = require('./taiKhoan.validation');

const { xacThuc } = require('../../middleware/xacThuc');
const { gioiHanDangNhap } = require('../../middleware/gioiHanYeuCau');

// 1. Đăng nhập hệ thống (US-007)
router.post('/dang-nhap', gioiHanDangNhap, kiemTraDangNhap, taiKhoanController.dangNhap);

// 2. Làm mới Token khi hết hạn (US-003)
router.post('/lam-moi-token', kiemTraLamMoiToken, taiKhoanController.lamMoiToken);

// 3. Đăng xuất khỏi hệ thống (US-008)
router.post('/dang-xuat', taiKhoanController.dangXuat);

// 4. Đổi mật khẩu cá nhân (US-009)
router.put('/doi-mat-khau', xacThuc, gioiHanDangNhap, kiemTraDoiMatKhau, taiKhoanController.doiMatKhau);

// 5. Xem thông tin hồ sơ cá nhân (US-010)
router.get('/ho-so', xacThuc, taiKhoanController.layHoSo);

// 6. Cập nhật thông tin hồ sơ cá nhân (US-010)
router.put('/ho-so', xacThuc, kiemTraCapNhatHoSo, taiKhoanController.capNhatHoSo);

module.exports = router;
