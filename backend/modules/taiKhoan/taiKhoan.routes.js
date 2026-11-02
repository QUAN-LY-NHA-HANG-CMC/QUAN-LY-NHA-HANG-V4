const express = require('express');
const router = express.Router();
const taiKhoanController = require('./taiKhoan.controller.js');
const xacThucNguoiDung = require('../../middleware/xacThuc.js');

// Tuyến đường công khai
router.post('/dang-nhap', taiKhoanController.dangNhap);

// Tuyến đường cần xác thực
router.use(xacThucNguoiDung);
router.get('/ho-so', taiKhoanController.layHoSo);
router.put('/ho-so', taiKhoanController.capNhatHoSo);
router.post('/doi-mat-khau', taiKhoanController.doiMatKhau);
router.post('/dang-xuat', taiKhoanController.dangXuat);

module.exports = router;
