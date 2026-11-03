/**
 * Định tuyến API cho Đơn gọi món
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const express = require('express');
const router = express.Router();
const donGoiMonController = require('./donGoiMon.controller.js');

router.post('/', donGoiMonController.taoDonGoiMon);
router.put('/huy-mon/:chiTietId', donGoiMonController.huyMon);
router.get('/ban/:banId', donGoiMonController.layDonTheoBan);

module.exports = router;
