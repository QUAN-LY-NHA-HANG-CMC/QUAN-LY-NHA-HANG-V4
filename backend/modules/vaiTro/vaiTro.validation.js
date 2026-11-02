/**
 * Kiểm tra dữ liệu đầu vào cho phân hệ Vai trò & Quyền hạn
 * Phục vụ US-006, US-015 -> US-022
 */
const { laIdHopLe } = require('../../tienIch/kiemTraDuLieu');
const { phanHoiLoi } = require('../../tienIch/dinhDangPhanHoi');
const { lamSachDauVao } = require('../../tienIch/lamSachHtml');

/**
 * Kiểm tra dữ liệu tạo mới vai trò
 */
function kiemTraTaoVaiTro(req, res, next) {
    req.body = lamSachDauVao(req.body);
    const { maVaiTro, tenVaiTro } = req.body;

    if (!maVaiTro || typeof maVaiTro !== 'string' || maVaiTro.trim().length < 2) {
        return phanHoiLoi(res, 'Mã vai trò phải có ít nhất 2 ký tự (chữ in hoa không dấu, ví dụ: TO_TRUONG).', 400);
    }

    const regexMa = /^[A-Z0-9_]{2,30}$/;
    if (!regexMa.test(maVaiTro.trim().toUpperCase())) {
        return phanHoiLoi(res, 'Mã vai trò chỉ được chứa chữ cái in hoa, số và gạch dưới (VD: QUAN_LY, THU_NGAN).', 400);
    }

    if (!tenVaiTro || typeof tenVaiTro !== 'string' || tenVaiTro.trim().length < 2) {
        return phanHoiLoi(res, 'Tên vai trò phải có ít nhất 2 ký tự.', 400);
    }

    req.body.maVaiTro = maVaiTro.trim().toUpperCase();
    req.body.tenVaiTro = tenVaiTro.trim();
    next();
}

/**
 * Kiểm tra dữ liệu cập nhật vai trò
 */
function kiemTraCapNhatVaiTro(req, res, next) {
    req.body = lamSachDauVao(req.body);
    const { id } = req.params;
    const { tenVaiTro } = req.body;

    if (!laIdHopLe(id)) {
        return phanHoiLoi(res, 'ID vai trò không hợp lệ.', 400);
    }

    if (!tenVaiTro || typeof tenVaiTro !== 'string' || tenVaiTro.trim().length < 2) {
        return phanHoiLoi(res, 'Tên vai trò phải có ít nhất 2 ký tự.', 400);
    }

    req.body.tenVaiTro = tenVaiTro.trim();
    next();
}

/**
 * Kiểm tra dữ liệu cập nhật quyền cho vai trò
 */
function kiemTraCapNhatQuyen(req, res, next) {
    const { id } = req.params;
    const { danhSachQuyenId } = req.body;

    if (!laIdHopLe(id)) {
        return phanHoiLoi(res, 'ID vai trò không hợp lệ.', 400);
    }

    if (!Array.isArray(danhSachQuyenId)) {
        return phanHoiLoi(res, 'danhSachQuyenId phải là một mảng các ID quyền.', 400);
    }

    for (const qId of danhSachQuyenId) {
        if (!laIdHopLe(qId)) {
            return phanHoiLoi(res, `ID quyền ${qId} không hợp lệ.`, 400);
        }
    }

    next();
}

/**
 * Kiểm tra dữ liệu gán vai trò cho nhân viên
 */
function kiemTraGanVaiTro(req, res, next) {
    const { taiKhoanId, danhSachVaiTroId } = req.body;

    if (!laIdHopLe(taiKhoanId)) {
        return phanHoiLoi(res, 'ID tài khoản nhân viên không hợp lệ.', 400);
    }

    if (!Array.isArray(danhSachVaiTroId) || danhSachVaiTroId.length === 0) {
        return phanHoiLoi(res, 'Vui lòng chọn ít nhất một vai trò để gán cho nhân viên.', 400);
    }

    for (const vtId of danhSachVaiTroId) {
        if (!laIdHopLe(vtId)) {
            return phanHoiLoi(res, `ID vai trò ${vtId} không hợp lệ.`, 400);
        }
    }

    next();
}

module.exports = {
    kiemTraTaoVaiTro,
    kiemTraCapNhatVaiTro,
    kiemTraCapNhatQuyen,
    kiemTraGanVaiTro
};
