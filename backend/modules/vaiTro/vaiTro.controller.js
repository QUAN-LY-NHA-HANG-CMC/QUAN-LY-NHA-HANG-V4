/**
 * Controller tiếp nhận yêu cầu HTTP phân hệ Vai trò & Quyền hạn
 * Phục vụ US-015 -> US-022
 */
const vaiTroService = require('./vaiTro.service');
const { phanHoiThanhCong } = require('../../tienIch/dinhDangPhanHoi');

/**
 * [GET] /api/vai-tro - Xem danh sách các vai trò (US-015)
 */
async function layDanhSachVaiTro(req, res, next) {
    try {
        const danhSach = await vaiTroService.layDanhSachVaiTro();
        return phanHoiThanhCong(res, danhSach, 'Lấy danh sách vai trò thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [GET] /api/vai-tro/danh-muc-quyen - Lấy danh mục tất cả quyền có trong hệ thống
 */
async function layTatCaDanhMucQuyen(req, res, next) {
    try {
        const danhSach = await vaiTroService.layTatCaDanhMucQuyen();
        return phanHoiThanhCong(res, danhSach, 'Lấy danh mục quyền thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [GET] /api/vai-tro/lich-su-thay-doi - Xem lịch sử thay đổi quyền hạn nhân sự (US-022)
 */
async function layLichSuPhanQuyen(req, res, next) {
    try {
        const trang = Math.max(1, parseInt(req.query.trang) || 1);
        const soLuong = Math.min(100, Math.max(1, parseInt(req.query.soLuong) || 20));

        const ketQua = await vaiTroService.layLichSuPhanQuyen({ trang, soLuong });
        return phanHoiThanhCong(res, ketQua, 'Lấy lịch sử phân quyền thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [GET] /api/vai-tro/:id - Lấy chi tiết vai trò
 */
async function layChiTietVaiTro(req, res, next) {
    try {
        const vaiTroId = Number(req.params.id);
        const ketQua = await vaiTroService.layChiTietVaiTro(vaiTroId);
        return phanHoiThanhCong(res, ketQua, 'Lấy thông tin vai trò thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [POST] /api/vai-tro - Tạo mới vai trò (US-016)
 */
async function taoVaiTro(req, res, next) {
    try {
        const { maVaiTro, tenVaiTro, moTa } = req.body;
        const nguoiThucHienId = req.taiKhoan.id;
        const diaChiIp = req.ip || req.connection.remoteAddress;
        const thongTinThietBi = req.headers['user-agent'] || 'Không rõ';

        const ketQua = await vaiTroService.taoVaiTro({
            maVaiTro,
            tenVaiTro,
            moTa,
            nguoiThucHienId,
            diaChiIp,
            thongTinThietBi
        });

        return phanHoiThanhCong(res, ketQua, 'Tạo vai trò mới thành công.', 201);
    } catch (loi) {
        next(loi);
    }
}

/**
 * [PUT] /api/vai-tro/:id - Chỉnh sửa thông tin vai trò (US-016)
 */
async function capNhatVaiTro(req, res, next) {
    try {
        const vaiTroId = Number(req.params.id);
        const { tenVaiTro, moTa, trangThai } = req.body;
        const nguoiThucHienId = req.taiKhoan.id;
        const diaChiIp = req.ip || req.connection.remoteAddress;
        const thongTinThietBi = req.headers['user-agent'] || 'Không rõ';

        const ketQua = await vaiTroService.capNhatVaiTro(vaiTroId, {
            tenVaiTro,
            moTa,
            trangThai,
            nguoiThucHienId,
            diaChiIp,
            thongTinThietBi
        });

        return phanHoiThanhCong(res, ketQua, 'Cập nhật vai trò thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [DELETE] /api/vai-tro/:id - Xóa vai trò (US-016)
 */
async function xoaVaiTro(req, res, next) {
    try {
        const vaiTroId = Number(req.params.id);
        const nguoiThucHienId = req.taiKhoan.id;
        const diaChiIp = req.ip || req.connection.remoteAddress;
        const thongTinThietBi = req.headers['user-agent'] || 'Không rõ';

        await vaiTroService.xoaVaiTro(vaiTroId, {
            nguoiThucHienId,
            diaChiIp,
            thongTinThietBi
        });

        return phanHoiThanhCong(res, null, 'Xóa vai trò thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [PUT] /api/vai-tro/:id/quyen - Cấu hình quyền truy cập chi tiết cho vai trò (US-018)
 */
async function capNhatQuyenCuaVaiTro(req, res, next) {
    try {
        const vaiTroId = Number(req.params.id);
        const { danhSachQuyenId } = req.body;
        const nguoiThucHienId = req.taiKhoan.id;
        const diaChiIp = req.ip || req.connection.remoteAddress;
        const thongTinThietBi = req.headers['user-agent'] || 'Không rõ';

        const ketQua = await vaiTroService.capNhatQuyenCuaVaiTro(
            vaiTroId,
            danhSachQuyenId,
            { nguoiThucHienId, diaChiIp, thongTinThietBi }
        );

        return phanHoiThanhCong(res, ketQua, 'Cập nhật phân quyền cho vai trò thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [POST] /api/vai-tro/gan-vai-tro - Gán vai trò cho nhân viên (US-017)
 */
async function ganVaiTroChoTaiKhoan(req, res, next) {
    try {
        const { taiKhoanId, danhSachVaiTroId } = req.body;
        const nguoiThucHienId = req.taiKhoan.id;
        const diaChiIp = req.ip || req.connection.remoteAddress;
        const thongTinThietBi = req.headers['user-agent'] || 'Không rõ';

        const ketQua = await vaiTroService.ganVaiTroChoTaiKhoan({
            taiKhoanId,
            danhSachVaiTroId,
            nguoiThucHienId,
            diaChiIp,
            thongTinThietBi
        });

        return phanHoiThanhCong(res, ketQua, 'Gán vai trò cho nhân viên thành công.');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    layDanhSachVaiTro,
    layTatCaDanhMucQuyen,
    layLichSuPhanQuyen,
    layChiTietVaiTro,
    taoVaiTro,
    capNhatVaiTro,
    xoaVaiTro,
    capNhatQuyenCuaVaiTro,
    ganVaiTroChoTaiKhoan
};
