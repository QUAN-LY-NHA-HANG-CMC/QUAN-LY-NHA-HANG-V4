/**
 * Tuyến đường API Thống kê & Dashboard Analytics
 * Phụ trách: Nhật (PM / Backend Core Architect)
 */
const express = require('express');
const router = express.Router();
const thongKeController = require('./thongKe.controller.js');
const xacThuc = require('../../middleware/xacThuc.js');
const { kiemTraVaiTro } = require('../../middleware/phanQuyen.js');

// Toàn bộ API thống kê yêu cầu xác thực và quyền Quản lý
router.use(xacThuc);
router.use(kiemTraVaiTro('quan_ly'));

router.get('/tong-quan', thongKeController.layTongQuan);
router.get('/doanh-thu', thongKeController.layDoanhThu);
router.get('/phuong-thuc', thongKeController.layPhuongThuc);
router.get('/danh-muc', thongKeController.layDanhMuc);
router.get('/top-mon', thongKeController.layTopMon);
router.get('/khung-gio', thongKeController.layKhungGio);
router.get('/huy-mon', thongKeController.layHuyMon);

module.exports = router;
