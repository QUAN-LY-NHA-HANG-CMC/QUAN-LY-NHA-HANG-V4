/**
 * Routes Khuyến mãi
 * Phụ trách: Minh (Backend Developer)
 */
const express = require('express');
const router = express.Router();
const khuyenMaiController = require('./khuyenMai.controller.js');

// Lấy danh sách mã khuyến mãi đang áp dụng
router.get('/', khuyenMaiController.layDanhSach);

// Kiểm tra tính hợp lệ & tính tiền giảm của mã khuyến mãi
router.post('/kiem-tra', khuyenMaiController.kiemTraMa);

module.exports = router;
