/**
 * Định tuyến (Routes) phân hệ Vai trò, Quyền hạn và Phân quyền (RBAC)
 * Phục vụ US-015 -> US-022
 */
const express = require('express');
const router = express.Router();

const vaiTroController = require('./vaiTro.controller');
const {
    kiemTraTaoVaiTro,
    kiemTraCapNhatVaiTro,
    kiemTraCapNhatQuyen,
    kiemTraGanVaiTro
} = require('./vaiTro.validation');

const { xacThuc } = require('../../middleware/xacThuc');
const { kiemTraVaiTro } = require('../../middleware/phanQuyen');

// Toàn bộ các API vai trò yêu cầu đăng nhập và có vai trò Quản lý (US-004, US-021)
router.use(xacThuc);
router.use(kiemTraVaiTro(['QUAN_LY']));

// 1. Xem danh sách các vai trò (US-015)
router.get('/', vaiTroController.layDanhSachVaiTro);

// 2. Lấy danh mục tất cả quyền có trong hệ thống
router.get('/danh-muc-quyen', vaiTroController.layTatCaDanhMucQuyen);

// 3. Xem lịch sử thay đổi quyền hạn nhân sự (US-022)
router.get('/lich-su-thay-doi', vaiTroController.layLichSuPhanQuyen);

// 4. Lấy chi tiết một vai trò
router.get('/:id', vaiTroController.layChiTietVaiTro);

// 5. Tạo mới vai trò (US-016)
router.post('/', kiemTraTaoVaiTro, vaiTroController.taoVaiTro);

// 6. Chỉnh sửa thông tin vai trò (US-016)
router.put('/:id', kiemTraCapNhatVaiTro, vaiTroController.capNhatVaiTro);

// 7. Xóa vai trò (US-016)
router.delete('/:id', vaiTroController.xoaVaiTro);

// 8. Cấu hình quyền truy cập chi tiết cho vai trò (US-018, US-019 -> US-021)
router.put('/:id/quyen', kiemTraCapNhatQuyen, vaiTroController.capNhatQuyenCuaVaiTro);

// 9. Gán vai trò cho tài khoản nhân viên (US-017)
router.post('/gan-vai-tro', kiemTraGanVaiTro, vaiTroController.ganVaiTroChoTaiKhoan);

module.exports = router;
