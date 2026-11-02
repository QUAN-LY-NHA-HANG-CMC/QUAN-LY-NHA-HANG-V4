const express = require('express');
const router = express.Router();
const vaiTroController = require('./vaiTro.controller.js');
const xacThucNguoiDung = require('../../middleware/xacThuc.js');
const { kiemTraQuyen } = require('../../middleware/phanQuyen.js');

router.use(xacThucNguoiDung);
router.use(kiemTraQuyen('quan_ly_nhan_vien'));

router.get('/', vaiTroController.layDanhSachVaiTro);
router.get('/quyen-han', vaiTroController.layDanhSachQuyen);

module.exports = router;
