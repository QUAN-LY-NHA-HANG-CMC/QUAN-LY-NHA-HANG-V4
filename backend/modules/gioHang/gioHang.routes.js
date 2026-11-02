/**
 * Định tuyến API cho Giỏ hàng
 * Phụ trách: Minh (Backend Nghiệp vụ)
 */
const express = require('express');
const router = express.Router();
const gioHangController = require('./gioHang.controller.js');

router.post('/kiem-tra-gia', gioHangController.kiemTraGia);
router.put('/tam-thoi/:phienBanId', gioHangController.luuGioHangTam);
router.get('/tam-thoi/:phienBanId', gioHangController.layGioHangTam);

module.exports = router;
