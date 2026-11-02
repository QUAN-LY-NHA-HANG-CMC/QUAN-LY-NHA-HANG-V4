/**
 * Routes Điều phối Bếp (KDS)
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const express = require('express');
const router = express.Router();
const kdsController = require('./kds.controller.js');

// Lấy danh sách hàng đợi món chờ chế biến (FIFO, cảnh báo >15p)
router.get('/don-cho', kdsController.layDonCho);

// Gom nhóm món chờ nấu
router.get('/gom-mon', kdsController.gomMon);

// Chuyển trạng thái nấu món (dang_che_bien, hoan_thanh, ...)
router.put('/chuyen-trang-thai/:id', kdsController.chuyenTrangThai);

// Bật tắt món hết hàng tức thì từ bếp
router.put('/toggle-het-mon/:id', kdsController.toggleHetMon);

// Bếp từ chối món (hết hàng, hủy món)
router.post('/tu-choi/:id', kdsController.tuChoiMon);

// Lịch sử món đã chế biến xong
router.get('/lich-su', kdsController.layLichSuBep);

module.exports = router;
