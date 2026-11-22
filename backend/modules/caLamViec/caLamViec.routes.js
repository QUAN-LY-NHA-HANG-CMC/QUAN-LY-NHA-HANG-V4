// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// ROUTE CA LÀM VIỆC & ĐỔI CA / NGHỈ PHÉP (FIGMA W11, A07)
// ============================================================================

const express = require('express');
const router = express.Router();
const caLamViecController = require('./caLamViec.controller');
const { xacThucNguoiDung } = require('../../middleware/xacThuc');
const { phanQuyen } = require('../../middleware/phanQuyen');
router.get('/trang-thai-ca', xacThucNguoiDung, caLamViecController.trangThaiCa);
router.get('/dong-nghiep', xacThucNguoiDung, caLamViecController.layDongNghiep);
router.post('/vao-ca-tu-dong', xacThucNguoiDung, caLamViecController.vaoCaTuDong);

// 1. Lịch làm việc cá nhân (Dành cho nhân viên xem ca của mình - Figma W11)
router.get(
    '/lich-ca-nhan',
    xacThucNguoiDung,
    caLamViecController.layLichCaNhan
);

// 2. Toàn bộ lịch làm việc nhà hàng (Quản lý)
router.get(
    '/tat-ca-lich',
    xacThucNguoiDung,
    phanQuyen('quan_ly'),
    caLamViecController.layToanBoLich
);

// 3. Xếp ca làm việc mới (Quản lý)
router.post(
    '/tao-ca',
    xacThucNguoiDung,
    phanQuyen('quan_ly'),
    caLamViecController.taoCaLamViec
);

// 3.1 Cập nhật ca làm việc (Quản lý)
router.put(
    '/:id',
    xacThucNguoiDung,
    phanQuyen('quan_ly'),
    caLamViecController.capNhatCaLamViec
);

// 3.2 Xóa ca làm việc (Quản lý)
router.delete(
    '/:id',
    xacThucNguoiDung,
    phanQuyen('quan_ly'),
    caLamViecController.xoaCaLamViec
);

// 4. Điểm danh vào ca
router.put(
    '/:id/checkin',
    xacThucNguoiDung,
    caLamViecController.checkinCa
);

// 5. Kết thúc ca
router.put(
    '/:id/checkout',
    xacThucNguoiDung,
    caLamViecController.checkoutCa
);

// 6. Danh sách yêu cầu đổi ca / xin nghỉ (Nhân viên xem của mình, Quản lý xem toàn bộ)
router.get(
    '/yeu-cau-doi-ca',
    xacThucNguoiDung,
    caLamViecController.layDanhSachYeuCau
);

// 7. Nhân viên tạo yêu cầu đổi ca / xin nghỉ (US-W09)
router.post(
    '/yeu-cau-doi-ca',
    xacThucNguoiDung,
    caLamViecController.taoYeuCauDoiCa
);

// 8. Quản lý duyệt yêu cầu đổi ca / xin nghỉ (Figma A07)
router.put(
    '/yeu-cau-doi-ca/:id/phe-duyet',
    xacThucNguoiDung,
    phanQuyen('quan_ly'),
    caLamViecController.pheDuyetYeuCau
);

module.exports = router;
