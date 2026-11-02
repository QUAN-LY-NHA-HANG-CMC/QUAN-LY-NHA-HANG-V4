const express = require('express');
const router = express.Router();
const cauHinhController = require('./cauHinhNhaHang.controller.js');
const xacThucNguoiDung = require('../../middleware/xacThuc.js');
const { kiemTraQuyen } = require('../../middleware/phanQuyen.js');

// Xem thông tin nhà hàng (công khai cho E-Menu và khách xem)
router.get('/', cauHinhController.layCauHinh);

// Cập nhật cấu hình và xem logs (Chỉ Quản trị có quyền quan_ly_he_thong)
router.put('/', xacThucNguoiDung, kiemTraQuyen('quan_ly_he_thong'), cauHinhController.capNhatCauHinh);
router.get('/nhat-ky', xacThucNguoiDung, kiemTraQuyen('quan_ly_he_thong'), cauHinhController.layNhatKy);

module.exports = router;
