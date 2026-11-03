/**
 * Tuyến đường API Xuất báo cáo CSV
 * Phụ trách: Minh (Backend Developer)
 */
const express = require('express');
const router = express.Router();
const xuatBaoCaoController = require('./xuatBaoCao.controller.js');
const xacThuc = require('../../middleware/xacThuc.js');
const { kiemTraVaiTro } = require('../../middleware/phanQuyen.js');

router.use(xacThuc);
router.use(kiemTraVaiTro('quan_ly', 'thu_ngan'));

router.get('/doanh-thu-csv', xuatBaoCaoController.xuatDoanhThuCsv);
router.get('/hoa-don-csv', xuatBaoCaoController.xuatHoaDonCsv);

module.exports = router;
