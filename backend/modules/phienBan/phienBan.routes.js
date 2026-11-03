/**
 * Routes quản lý Phiên bàn
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const express = require('express');
const router = express.Router();
const phienBanController = require('./phienBan.controller.js');

// Xác thực bàn qua mã QR và mở phiên
router.post('/xac-thuc-qr', phienBanController.xacThucQr);

// Mở bàn trực tiếp từ POS thu ngân / phục vụ
router.post('/mo-ban-truc-tiep', phienBanController.moBanTrucTiep);

// Chuyển bàn
router.post('/chuyen-ban', phienBanController.chuyenBan);

// Ghép bàn
router.post('/ghep-ban', phienBanController.ghepBan);

// Lấy thông tin chi tiết phiên
router.get('/:maPhien', phienBanController.layChiTietPhien);

module.exports = router;
