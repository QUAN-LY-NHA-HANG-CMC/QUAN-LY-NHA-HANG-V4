// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// CONTROLLER ĐIỀU HƯỚNG TÀI KHOẢN VÀ XÁC THỰC
// ============================================================================

const taiKhoanService = require('./taiKhoan.service');
const { phanHoiThanhCong, phanHoiLoi } = require('../../tienIch/dinhDangPhanHoi');

const taiKhoanController = {
    async dangNhap(req, res, next) {
        try {
            const tenDangNhap = req.body.tenDangNhap || req.body.ten_dang_nhap;
            const matKhau = req.body.matKhau || req.body.mat_khau;
            const diaChiIp = req.ip || req.connection.remoteAddress;
            const thietBi = req.headers['user-agent'];

            const ketQua = await taiKhoanService.dangNhap({
                tenDangNhap,
                matKhau,
                diaChiIp,
                thietBi
            });

            return phanHoiThanhCong(res, ketQua, 'Đăng nhập thành công');
        } catch (loi) {
            next(loi);
        }
    },

    layThongTinMe(req, res, next) {
        try {
            const taiKhoan = taiKhoanService.layThongTinHienTai(req.nguoiDung.taiKhoanId);
            return phanHoiThanhCong(res, taiKhoan, 'Lấy thông tin tài khoản thành công');
        } catch (loi) {
            next(loi);
        }
    },

    async doiMatKhau(req, res, next) {
        try {
            const { matKhauCu, matKhauMoi } = req.body;
            await taiKhoanService.doiMatKhau(req.nguoiDung.taiKhoanId, { matKhauCu, matKhauMoi });
            return phanHoiThanhCong(res, null, 'Đổi mật khẩu thành công');
        } catch (loi) {
            next(loi);
        }
    },

    // =========================================================================
    // QUẢN TRỊ NHÂN SỰ (A02, A03, A04, A05)
    // =========================================================================

    layDanhSachNhanSu(req, res, next) {
        try {
            const danhSach = taiKhoanService.layDanhSachNhanSu();
            return phanHoiThanhCong(res, danhSach, 'Lấy danh sách nhân sự thành công');
        } catch (loi) {
            next(loi);
        }
    },

    layChiTietNhanSu(req, res, next) {
        try {
            const nhanVien = taiKhoanService.layChiTietNhanSu(req.params.id);
            return phanHoiThanhCong(res, nhanVien, 'Lấy chi tiết nhân viên thành công');
        } catch (loi) {
            next(loi);
        }
    },

    layBanCoTheGiao(req, res, next) {
        try {
            return phanHoiThanhCong(res, taiKhoanService.layBanCoTheGiao());
        } catch (loi) {
            next(loi);
        }
    },

    async taoNhanSu(req, res, next) {
        try {
            const duLieu = {
                hoTen: req.body.hoTen || req.body.ho_ten,
                tenDangNhap: req.body.tenDangNhap || req.body.ten_dang_nhap,
                matKhau: req.body.matKhau || req.body.mat_khau || '123456',
                vaiTro: req.body.vaiTro || req.body.vai_tro || 'phuc_vu',
                soDienThoai: req.body.soDienThoai || req.body.so_dien_thoai,
                email: req.body.email,
                cccd: req.body.cccd,
                mucLuong: req.body.mucLuong ?? req.body.muc_luong,
                hinhThucLamViec: req.body.hinhThucLamViec || req.body.hinh_thuc_lam_viec,
                ngayVaoLam: req.body.ngayVaoLam || req.body.ngay_vao_lam,
                lichLamViec: req.body.lichLamViec,
                banAnIds: req.body.banAnIds
            };

            const nhanVienMoi = await taiKhoanService.taoNhanSu(duLieu, req.nguoiDung);
            return phanHoiThanhCong(res, nhanVienMoi, 'Tạo nhân viên và cấp tài khoản thành công', 201);
        } catch (loi) {
            next(loi);
        }
    },

    async capNhatNhanSu(req, res, next) {
        try {
            const duLieu = {
                hoTen: req.body.hoTen || req.body.ho_ten,
                soDienThoai: req.body.soDienThoai || req.body.so_dien_thoai,
                email: req.body.email,
                cccd: req.body.cccd,
                mucLuong: req.body.mucLuong || req.body.muc_luong,
                hinhThucLamViec: req.body.hinhThucLamViec || req.body.hinh_thuc_lam_viec,
                vaiTro: req.body.vaiTro || req.body.vai_tro,
                matKhauMoi: req.body.matKhauMoi || req.body.mat_khau_moi
            };

            const nhanVienCapNhat = await taiKhoanService.capNhatNhanSu(req.params.id, duLieu, req.nguoiDung);
            return phanHoiThanhCong(res, nhanVienCapNhat, 'Cập nhật thông tin nhân viên thành công');
        } catch (loi) {
            next(loi);
        }
    },

    doiTrangThaiNhanSu(req, res, next) {
        try {
            const { trangThai } = req.body;
            const nhanVien = taiKhoanService.doiTrangThaiNhanSu(req.params.id, trangThai, req.nguoiDung);
            return phanHoiThanhCong(res, nhanVien, `Đổi trạng thái nhân sự thành "${trangThai}" thành công`);
        } catch (loi) {
            next(loi);
        }
    },

    xoaNhanSu(req, res, next) {
        try {
            taiKhoanService.xoaNhanSu(req.params.id, req.nguoiDung);
            return phanHoiThanhCong(res, null, 'Xóa nhân sự thành công');
        } catch (loi) {
            next(loi);
        }
    },

    layBanPhuTrach(req, res, next) {
        try {
            const danhSach = taiKhoanService.layBanPhuTrach(req.params.id);
            return phanHoiThanhCong(res, danhSach, 'Lấy danh sách bàn phụ trách thành công');
        } catch (loi) {
            next(loi);
        }
    },

    capNhatBanPhuTrach(req, res, next) {
        try {
            const banAnIds = req.body.banAnIds || req.body.danhSachBanId || [];
            const ketQua = taiKhoanService.capNhatBanPhuTrach(req.params.id, banAnIds, req.nguoiDung);
            return phanHoiThanhCong(res, ketQua, 'Cập nhật phân công bàn phụ trách thành công');
        } catch (loi) {
            next(loi);
        }
    }
};

module.exports = taiKhoanController;
