/**
 * Tuyến đường API Quản lý Ca làm việc & Phiên thu ngân
 * Phụ trách: Minh (Backend Developer)
 */
const express = require('express');
const router = express.Router();
const caLamViecController = require('./caLamViec.controller.js');
const xacThuc = require('../../middleware/xacThuc.js');
const { kiemTraVaiTro } = require('../../middleware/phanQuyen.js');

router.use(xacThuc);

// Thu ngân & Quản lý
router.get('/', caLamViecController.layDanhSachCa);
router.get('/phien-hien-tai', caLamViecController.layPhienHienTai);
router.post('/mo-ca', kiemTraVaiTro('quan_ly', 'thu_ngan'), caLamViecController.moCa);
router.post('/phieu-thu-chi', kiemTraVaiTro('quan_ly', 'thu_ngan'), caLamViecController.taoPhieuThuChi);
router.get('/phieu-thu-chi/:phienCaId', kiemTraVaiTro('quan_ly', 'thu_ngan'), caLamViecController.layDanhSachPhieu);
router.post('/ket-ca', kiemTraVaiTro('quan_ly', 'thu_ngan'), caLamViecController.ketCa);

// Lịch sử bàn giao ca: Quản lý hoặc Thu ngân xem
router.get('/lich-su', kiemTraVaiTro('quan_ly', 'thu_ngan'), caLamViecController.layLichSu);

module.exports = router;
