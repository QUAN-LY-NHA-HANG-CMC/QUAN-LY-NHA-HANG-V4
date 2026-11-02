const express = require('express');
const router = express.Router();
const danhMucController = require('./danhMucMon.controller.js');
const xacThucNguoiDung = require('../../middleware/xacThuc.js');
const { kiemTraQuyen } = require('../../middleware/phanQuyen.js');

// Xem danh mục: công khai hoặc cho khách hàng & nhân viên
router.get('/', danhMucController.layDanhSach);
router.get('/:id', danhMucController.layTheoId);

// Thao tác quản trị danh mục: cần quyền quan_ly_thuc_don
router.post('/', xacThucNguoiDung, kiemTraQuyen('quan_ly_thuc_don'), danhMucController.taoDanhMuc);
router.put('/:id', xacThucNguoiDung, kiemTraQuyen('quan_ly_thuc_don'), danhMucController.capNhatDanhMuc);
router.delete('/:id', xacThucNguoiDung, kiemTraQuyen('quan_ly_thuc_don'), danhMucController.xoaDanhMuc);

module.exports = router;
