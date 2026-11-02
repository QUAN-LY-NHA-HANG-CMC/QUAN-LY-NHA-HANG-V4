/**
 * Routes Thanh toán
 * Phụ trách: Minh (Backend Developer)
 */
const express = require('express');
const router = express.Router();
const thanhToanController = require('./thanhToan.controller.js');

// Sinh mã QR chuyển khoản VietQR động theo phiên bàn và số tiền
router.post('/vietqr', thanhToanController.taoVietQr);

// Xác nhận thanh toán (tiền mặt / chuyển khoản) và đóng phiên bàn
router.post('/xac-nhan', thanhToanController.xacNhanThanhToan);

module.exports = router;
