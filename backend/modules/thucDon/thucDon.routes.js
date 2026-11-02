const path = require('node:path');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const thucDonController = require('./thucDon.controller.js');
const xacThucNguoiDung = require('../../middleware/xacThuc.js');
const { kiemTraQuyen } = require('../../middleware/phanQuyen.js');
const cauHinhChung = require('../../cauHinh/cauHinhChung.js');

// Cấu hình tải tệp hình ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, '../../../tepTaiLen'));
    },
    filename: (req, file, cb) => {
        const phanMoRong = path.extname(file.originalname).toLowerCase();
        const tenTepDuyNhat = `mon_${Date.now()}_${Math.round(Math.random() * 1e9)}${phanMoRong}`;
        cb(null, tenTepDuyNhat);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: cauHinhChung.gioiHanTepTaiLenMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const cacDinhDangHopLe = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const duoiTep = path.extname(file.originalname).toLowerCase();
        if (cacDinhDangHopLe.includes(duoiTep)) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận tệp hình ảnh (.jpg, .jpeg, .png, .webp, .gif)'), false);
        }
    }
});

// Tuyến đường xem thực đơn: Khách hàng và nhân viên đều xem được
router.get('/', thucDonController.layDanhSach);
router.get('/:id', thucDonController.layTheoId);

// Tuyến đường Bếp hoặc Quản lý cập nhật trạng thái "Đang bán" / "Tạm hết"
router.patch('/:id/trang-thai', xacThucNguoiDung, thucDonController.doiTrangThai);

// Tuyến đường Quản trị thực đơn: Cần quyền quan_ly_thuc_don
router.post('/', xacThucNguoiDung, kiemTraQuyen('quan_ly_thuc_don'), upload.single('hinhAnh'), thucDonController.taoMonAn);
router.put('/:id', xacThucNguoiDung, kiemTraQuyen('quan_ly_thuc_don'), upload.single('hinhAnh'), thucDonController.capNhatMonAn);
router.delete('/:id', xacThucNguoiDung, kiemTraQuyen('quan_ly_thuc_don'), thucDonController.xoaMemMonAn);

module.exports = router;
