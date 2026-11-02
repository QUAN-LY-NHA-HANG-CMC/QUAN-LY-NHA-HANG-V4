const express = require('express');
const router = express.Router();
const banAnController = require('./banAn.controller.js');
const xacThucNguoiDung = require('../../middleware/xacThuc.js');
const { kiemTraQuyen } = require('../../middleware/phanQuyen.js');

// Sơ đồ bàn chi tiết thời gian thực (KDS/POS xem không bắt buộc chặn nếu nội bộ)
router.get('/so-do-chi-tiet', banAnController.laySoDoChiTiet);

// Xem danh sách bàn & lấy ảnh QR: Nhân viên các bộ phận đều có thể xem
router.get('/', xacThucNguoiDung, banAnController.layDanhSach);
router.get('/:id', xacThucNguoiDung, banAnController.layTheoId);
router.get('/:id/ma-qr', xacThucNguoiDung, banAnController.layAnhQrBan);

// Thao tác quản trị bàn: Cần quyền quan_ly_ban_an
router.post('/', xacThucNguoiDung, kiemTraQuyen('quan_ly_ban_an'), banAnController.taoBanAn);
router.put('/:id', xacThucNguoiDung, kiemTraQuyen('quan_ly_ban_an'), banAnController.capNhatBanAn);
router.post('/:id/lam-moi-qr', xacThucNguoiDung, kiemTraQuyen('quan_ly_ban_an'), banAnController.lamMoiQrToken);
router.patch('/:id/trang-thai', xacThucNguoiDung, banAnController.doiTrangThai);
router.delete('/:id', xacThucNguoiDung, kiemTraQuyen('quan_ly_ban_an'), banAnController.xoaBanAn);

module.exports = router;
