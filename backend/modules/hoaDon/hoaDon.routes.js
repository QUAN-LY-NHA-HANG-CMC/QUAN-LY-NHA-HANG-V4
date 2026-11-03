/**
 * Routes Hóa đơn
 * Phụ trách: Minh (Backend Developer)
 */
const express = require('express');
const router = express.Router();
const hoaDonController = require('./hoaDon.controller.js');

// Xem bảng kê tạm tính (hỗ trợ áp dụng mã khuyến mãi xem trước)
router.get('/tam-tinh/:phienBanId', hoaDonController.layHoaDonTamTinh);

// Tra cứu lịch sử hóa đơn
router.get('/lich-su', hoaDonController.layLichSuHoaDon);

module.exports = router;
