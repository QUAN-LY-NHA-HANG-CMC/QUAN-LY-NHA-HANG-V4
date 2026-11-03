/**
 * Routes gọi món và hủy món
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const express = require('express');
const router = express.Router();
const donGoiMonController = require('./donGoiMon.controller.js');

// Khách gửi đơn đặt món từ E-Menu QR
router.post('/', donGoiMonController.taoDonGoiMon);

// Khách hoặc nhân viên hủy món (hỗ trợ cả DELETE và PUT)
router.delete('/:chiTietId', donGoiMonController.huyMon);
router.put('/huy-mon/:chiTietId', donGoiMonController.huyMon);
router.delete('/huy-mon/:chiTietId', donGoiMonController.huyMon);

// Nhân viên phục vụ đánh dấu món đã mang ra bàn
router.put('/da-phuc-vu/:chiTietId', donGoiMonController.danhDauDaPhucVu);

// Lấy lịch sử món ăn theo bàn
router.get('/ban/:banId', donGoiMonController.layDonTheoBan);

module.exports = router;
