const express = require('express');
const router = express.Router();
const khuVucController = require('./khuVuc.controller.js');
const xacThucNguoiDung = require('../../middleware/xacThuc.js');
const { kiemTraQuyen } = require('../../middleware/phanQuyen.js');

// Xem danh sách khu vực: Phục vụ, Thu ngân, Quản lý đều được xem
router.get('/', xacThucNguoiDung, khuVucController.layDanhSach);

// Thêm, sửa, xóa: Chỉ Quản lý có quyền quan_ly_ban_an
router.post('/', xacThucNguoiDung, kiemTraQuyen('quan_ly_ban_an'), khuVucController.taoKhuVuc);
router.put('/:id', xacThucNguoiDung, kiemTraQuyen('quan_ly_ban_an'), khuVucController.capNhatKhuVuc);
router.delete('/:id', xacThucNguoiDung, kiemTraQuyen('quan_ly_ban_an'), khuVucController.xoaKhuVuc);

module.exports = router;
