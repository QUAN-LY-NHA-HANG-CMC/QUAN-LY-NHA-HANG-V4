// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// ĐỊNH TUYẾN API PHÂN HỆ BÁO CÁO DOANH THU & TÀI CHÍNH
// ============================================================================

const express = require('express');
const router = express.Router();
const baoCaoController = require('./baoCao.controller');
const { xacThucNguoiDung } = require('../../middleware/xacThuc');
const { phanQuyen } = require('../../middleware/phanQuyen');

// Toàn bộ báo cáo yêu cầu đăng nhập với vai trò Quản lý hoặc Thu ngân
router.use(xacThucNguoiDung);
router.use(phanQuyen('quan_ly', 'thu_ngan'));

// 1. Lấy toàn bộ 6 nhóm báo cáo
router.get('/tat-ca', baoCaoController.layTatCaBaoCao);

// 2. Từng báo cáo lẻ theo tab
router.get('/tong-quan', baoCaoController.layTongQuan);
router.get('/thoi-gian', baoCaoController.layTheoThoiGian);
router.get('/mon-an', baoCaoController.layMonAn);
router.get('/khu-vuc-ban', baoCaoController.layKhuVucBan);
router.get('/so-quy', baoCaoController.laySoQuy);
router.get('/kenh-danh-gia', baoCaoController.layKenhVaDanhGia);

// 3. Xuất file CSV / Excel
router.get('/xuat-csv', baoCaoController.xuatBaoCaoCsv);

module.exports = router;
