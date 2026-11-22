// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// ROUTE CẤU HÌNH HỆ THỐNG, THỐNG KÊ & AUDIT LOG (FIGMA A01, A20, S01)
// ============================================================================

const express = require('express');
const router = express.Router();
const heThongController = require('./heThong.controller');
const { xacThucNguoiDung, xacThucTuyChon } = require('../../middleware/xacThuc');
const { phanQuyen } = require('../../middleware/phanQuyen');

// 1. Xem cấu hình nhà hàng (Công khai hoặc có đăng nhập để lấy thông tin VietQR, Hotline, Tên quán)
router.get(
    '/cau-hinh',
    xacThucTuyChon,
    heThongController.layCauHinh
);

// 2. Chỉnh sửa cấu hình nhà hàng (Quản lý)
router.put(
    '/cau-hinh',
    xacThucNguoiDung,
    phanQuyen('quan_ly'),
    heThongController.capNhatCauHinh
);

// 3. Xem nhật ký kiểm toán (Audit Log - Figma A20)
router.get(
    '/nhat-ky',
    xacThucNguoiDung,
    phanQuyen('quan_ly'),
    heThongController.layNhatKy
);

// 4. Xem thống kê báo cáo Dashboard (Figma A01)
router.get(
    '/thong-ke',
    xacThucNguoiDung,
    phanQuyen('quan_ly'),
    heThongController.layThongKeDashboard
);

// 5. Sinh dữ liệu mẫu chuẩn Figma (Quản lý)
router.post(
    '/sinh-du-lieu-mau',
    xacThucNguoiDung,
    phanQuyen('quan_ly'),
    heThongController.sinhDuLieuMau
);

// 6. Làm sạch dữ liệu CSDL (Quản lý)
router.post(
    '/lam-sach-du-lieu',
    xacThucNguoiDung,
    phanQuyen('quan_ly'),
    heThongController.lamSachDuLieu
);

// 7. Sao lưu CSDL tức thì (Snapshot Backup - Quản lý)
router.post(
    '/sao-luu-csdl',
    xacThucNguoiDung,
    phanQuyen('quan_ly'),
    heThongController.saoLuuCsdl
);

module.exports = router;
