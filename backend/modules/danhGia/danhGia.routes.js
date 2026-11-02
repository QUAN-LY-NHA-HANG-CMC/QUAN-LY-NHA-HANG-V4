/**
 * Tuyến đường API Đánh giá khách hàng
 * Phụ trách: Minh (Backend Developer)
 */
const express = require('express');
const router = express.Router();
const danhGiaController = require('./danhGia.controller.js');
const xacThuc = require('../../middleware/xacThuc.js');
const { kiemTraVaiTro } = require('../../middleware/phanQuyen.js');

// Khách hàng gửi đánh giá & xem điểm sao: Public (không cần token đăng nhập nhân viên)
router.post('/', danhGiaController.taoDanhGia);
router.get('/diem-trung-binh', danhGiaController.layDiemTrungBinh);

// Quản lý xem và duyệt đánh giá: Yêu cầu xác thực Quản lý
router.get('/', xacThuc, kiemTraVaiTro('quan_ly'), danhGiaController.layDanhSach);
router.patch('/:id/phan-hoi', xacThuc, kiemTraVaiTro('quan_ly'), danhGiaController.phanHoiDanhGia);
router.patch('/:id/trang-thai', xacThuc, kiemTraVaiTro('quan_ly'), danhGiaController.doiTrangThai);

module.exports = router;
