/**
 * Định tuyến API cho Phiên bàn phục vụ
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const express = require('express');
const router = express.Router();
const phienBanController = require('./phienBan.controller.js');

// Public endpoints cho khách quét mã QR
router.post('/xac-thuc-qr', phienBanController.xacThucQr);
router.get('/:maPhien', phienBanController.layChiTietPhien);

module.exports = router;
