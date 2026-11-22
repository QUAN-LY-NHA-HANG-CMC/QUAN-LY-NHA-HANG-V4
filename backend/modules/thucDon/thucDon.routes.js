// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// ĐỊNH TUYẾN ĐƯỜNG DẪN API THỰC ĐƠN, MÓN ĂN & SỐ SUẤT CÒN LẠI (A12, K04)
// ============================================================================

const express = require('express');
const router = express.Router();
const thucDonController = require('./thucDon.controller');
const { xacThucNguoiDung } = require('../../middleware/xacThuc');
const { phanQuyen } = require('../../middleware/phanQuyen');

// Khách hàng & Nhân viên đều xem được thực đơn (Public)
router.get('/', thucDonController.layThucDon);
router.get('/:id', thucDonController.layChiTiet);

// Bếp hoặc Quản lý cập nhật trạng thái còn/hết món (Protected)
router.put('/:id/trang-thai-mon', xacThucNguoiDung, phanQuyen('bep', 'quan_ly'), thucDonController.doiTrangThaiConMon);

// Cài đặt và điều chỉnh số suất còn lại trong ngày (Bếp, Quản lý)
router.put('/:id/so-suat', xacThucNguoiDung, phanQuyen('bep', 'quan_ly'), thucDonController.capNhatSoSuat);

// Thêm, sửa, xóa món ăn trong thực đơn (Chỉ Quản lý)
router.post('/danh-muc', xacThucNguoiDung, phanQuyen('quan_ly'), thucDonController.taoDanhMuc);
router.post('/', xacThucNguoiDung, phanQuyen('quan_ly'), thucDonController.taoMonAn);
router.put('/:id', xacThucNguoiDung, phanQuyen('quan_ly'), thucDonController.capNhatMonAn);
router.delete('/:id', xacThucNguoiDung, phanQuyen('quan_ly'), thucDonController.xoaMonAn);

module.exports = router;
