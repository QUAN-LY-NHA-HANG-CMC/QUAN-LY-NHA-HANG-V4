const express = require('express');
const router = express.Router();
const nhanVienController = require('./nhanVien.controller.js');
const xacThucNguoiDung = require('../../middleware/xacThuc.js');
const { kiemTraQuyen } = require('../../middleware/phanQuyen.js');

router.use(xacThucNguoiDung);
router.use(kiemTraQuyen('quan_ly_nhan_vien'));

router.get('/', nhanVienController.layDanhSach);
router.post('/', nhanVienController.taoNhanVien);
router.put('/:id', nhanVienController.capNhatNhanVien);
router.patch('/:id/trang-thai', nhanVienController.doiTrangThai);
router.post('/:id/dat-lai-mat-khau', nhanVienController.datLaiMatKhau);

module.exports = router;
