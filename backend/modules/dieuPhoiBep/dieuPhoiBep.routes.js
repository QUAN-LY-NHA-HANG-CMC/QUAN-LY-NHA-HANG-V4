// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// ROUTE ĐIỀU PHỐI BẾP KDS (FIGMA K01, K02, K03, K05)
// ============================================================================

const express = require('express');
const router = express.Router();
const dieuPhoiBepController = require('./dieuPhoiBep.controller');
const { xacThucNguoiDung } = require('../../middleware/xacThuc');
const { phanQuyen } = require('../../middleware/phanQuyen');
const yeuCauVaoCa = require('../../middleware/yeuCauVaoCa');

// 1. Lấy danh sách hàng đợi món bếp (Hỗ trợ chế độ gom món và theo bàn)
router.get(
    '/hang-doi',
    xacThucNguoiDung,
    phanQuyen('bep', 'quan_ly', 'phuc_vu'),
    dieuPhoiBepController.layHangDoi
);

// 2. Lấy danh sách các món đã hoàn thành
router.get(
    '/da-hoan-thanh',
    xacThucNguoiDung,
    phanQuyen('bep', 'quan_ly', 'phuc_vu'),
    yeuCauVaoCa,
    dieuPhoiBepController.layMonDaHoanThanh
);

// 3. Bếp cập nhật trạng thái chế biến (đang nấu / nấu xong / đã phục vụ)
router.put(
    '/chi-tiet/:id/trang-thai',
    xacThucNguoiDung,
    phanQuyen('bep', 'quan_ly', 'phuc_vu'),
    yeuCauVaoCa,
    dieuPhoiBepController.chuyenTrangThai
);

// 4. Đặt cờ ưu tiên khẩn cấp cho món ăn
router.put(
    '/chi-tiet/:id/uu-tien',
    xacThucNguoiDung,
    phanQuyen('bep', 'quan_ly'),
    dieuPhoiBepController.datLenhUuTien
);

// 5. Quản lý phát lệnh điều phối toàn diện (Bếp, Phục vụ, Thu ngân, Tất cả)
router.post(
    '/phat-lenh',
    xacThucNguoiDung,
    phanQuyen('quan_ly'),
    dieuPhoiBepController.phatLenh
);

// 6. Lấy lịch sử các lệnh điều phối
router.get(
    '/lich-su-lenh',
    xacThucNguoiDung,
    phanQuyen('quan_ly', 'bep', 'phuc_vu', 'thu_ngan'),
    dieuPhoiBepController.layLichSuLenh
);

// 7. Nhân sự (Bếp, Phục vụ, Thu ngân) xác nhận tiếp nhận lệnh điều phối
router.put(
    '/lenh/:id/xac-nhan',
    xacThucNguoiDung,
    phanQuyen('quan_ly', 'bep', 'phuc_vu', 'thu_ngan'),
    dieuPhoiBepController.xacNhanTiepNhan
);

module.exports = router;
