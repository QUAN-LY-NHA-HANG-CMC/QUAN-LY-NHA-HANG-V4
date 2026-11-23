// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// SERVICE NGHIỆP VỤ TÀI KHOẢN VÀ XÁC THỰC ĐĂNG NHẬP
// ============================================================================

const jwt = require('jsonwebtoken');
const taiKhoanModel = require('./taiKhoan.model');
const { soSanhMatKhau, bamMatKhau } = require('../../tienIch/maHoaMatKhau');
const cauHinh = require('../../cauHinh/cauHinhChung');
const { ghiAuditLog } = require('../../tienIch/ghiNhatKy');

function kiemTraLichTaoNhanSu(lichLamViec, ngayVaoLam) {
    const hopLe = new Set(['ca_sang', 'ca_chieu', 'ca_toi', 'ca_gay']);
    const gio = /^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/;
    const ngayDaChon = new Set();
    if (!Array.isArray(lichLamViec) || !lichLamViec.length) {
        throw Object.assign(new Error('Vui lòng chọn ít nhất một ngày làm việc.'), { status: 400 });
    }
    for (const ca of lichLamViec) {
        const ngay = ca?.ngayLam;
        const moc = typeof ngay === 'string' && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(ngay) ? Date.parse(ngay) : NaN;
        if (!Number.isFinite(moc) || new Date(moc).toISOString().slice(0, 10) !== ngay ||
            ngay < ngayVaoLam || ngayDaChon.has(ngay) || !hopLe.has(ca.tenCa) ||
            typeof ca.gioBatDau !== 'string' || typeof ca.gioKetThuc !== 'string' ||
            !gio.test(ca.gioBatDau) || !gio.test(ca.gioKetThuc) || ca.gioBatDau === ca.gioKetThuc) {
            throw Object.assign(new Error('Mỗi ngày từ ngày vào làm phải có một ca hợp lệ và khung giờ khác nhau.'), { status: 400 });
        }
        ngayDaChon.add(ngay);
    }
}

const taiKhoanService = {
    layBanCoTheGiao() {
        return taiKhoanModel.layBanCoTheGiao();
    },

    /**
     * Xác thực đăng nhập và sinh mã JWT
     */
    async dangNhap({ tenDangNhap, matKhau, diaChiIp, thietBi }) {
        if (!tenDangNhap || !matKhau) {
            const loi = new Error('Tên đăng nhập và mật khẩu không được để trống');
            loi.status = 400;
            throw loi;
        }

        const taiKhoan = taiKhoanModel.timTheoTenDangNhap(tenDangNhap.trim());
        if (!taiKhoan) {
            const loi = new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
            loi.status = 401;
            throw loi;
        }

        const hopLe = !(cauHinh.moiTruong === 'production' && matKhau === '123456') &&
            await soSanhMatKhau(matKhau, taiKhoan.mat_khau_hash);
        if (!hopLe) {
            const loi = new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
            loi.status = 401;
            throw loi;
        }
        if (taiKhoan.trang_thai !== 'hoat_dong') {
            throw Object.assign(new Error(taiKhoan.trang_thai === 'da_xoa'
                ? 'Quản lý đã xác nhận nghỉ việc. Quyền đăng nhập đã kết thúc.'
                : 'Tài khoản của bạn đang bị khóa hoặc ngừng hoạt động'), { status: 403 });
        }

        // Cập nhật mốc thời gian đăng nhập
        taiKhoanModel.capNhatLanDangNhapCuoi(taiKhoan.id);

        // Sinh JWT Token
        const token = jwt.sign(
            {
                taiKhoanId: taiKhoan.id,
                tenDangNhap: taiKhoan.ten_dang_nhap,
                vaiTro: taiKhoan.ma_vai_tro,
                nhanVienId: taiKhoan.nhan_vien_id,
                hoTen: taiKhoan.ho_ten
            },
            cauHinh.jwtSecret,
            { expiresIn: cauHinh.jwtThoiGianHetHan }
        );

        // Ghi Audit Log đăng nhập
        ghiAuditLog({
            taiKhoanId: taiKhoan.id,
            hanhDong: 'DANG_NHAP_HE_THONG',
            bangAnhHuong: 'tai_khoan',
            banGhiId: taiKhoan.id,
            diaChiIp,
            thietBi,
            lyDo: `Đăng nhập thành công với vai trò ${taiKhoan.ten_vai_tro}`
        });

        const thongTinNguoiDung = {
            id: taiKhoan.id,
            taiKhoanId: taiKhoan.id,
            tenDangNhap: taiKhoan.ten_dang_nhap,
            vaiTro: taiKhoan.ma_vai_tro,
            tenVaiTro: taiKhoan.ten_vai_tro,
            nhanVienId: taiKhoan.nhan_vien_id,
            hoTen: taiKhoan.ho_ten,
            soDienThoai: taiKhoan.so_dien_thoai
        };

        return {
            token,
            nguoiDung: thongTinNguoiDung,
            nhanVien: thongTinNguoiDung
        };
    },

    /**
     * Lấy thông tin tài khoản hiện tại từ token
     */
    layThongTinHienTai(taiKhoanId) {
        const taiKhoan = taiKhoanModel.timTheoId(taiKhoanId);
        if (!taiKhoan) {
            const loi = new Error('Không tìm thấy tài khoản');
            loi.status = 404;
            throw loi;
        }
        return taiKhoan;
    },

    /**
     * Đổi mật khẩu
     */
    async doiMatKhau(taiKhoanId, { matKhauCu, matKhauMoi }) {
        if (!matKhauCu || !matKhauMoi) {
            const loi = new Error('Vui lòng cung cấp mật khẩu cũ và mật khẩu mới');
            loi.status = 400;
            throw loi;
        }

        if (matKhauMoi.length < (cauHinh.moiTruong === 'production' ? 12 : 6)) {
            const loi = new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
            loi.status = 400;
            throw loi;
        }

        const taiKhoan = taiKhoanModel.timTheoId(taiKhoanId);
        // Lấy lại mật khẩu hash
        const tkFull = taiKhoanModel.timTheoTenDangNhap(taiKhoan.ten_dang_nhap);
        const dungMatKhauCu = await soSanhMatKhau(matKhauCu, tkFull.mat_khau_hash);
        if (!dungMatKhauCu) {
            const loi = new Error('Mật khẩu hiện tại không chính xác');
            loi.status = 400;
            throw loi;
        }

        const hashMoi = await bamMatKhau(matKhauMoi);
        taiKhoanModel.capNhatMatKhau(taiKhoanId, hashMoi);

        ghiAuditLog({
            taiKhoanId,
            hanhDong: 'DOI_MAT_KHAU',
            bangAnhHuong: 'tai_khoan',
            banGhiId: taiKhoanId,
            lyDo: 'Người dùng đổi mật khẩu cá nhân'
        });

        return true;
    },

    // =========================================================================
    // QUẢN TRỊ NHÂN SỰ TOÀN HỆ THỐNG (A02, A03, A04, A05)
    // =========================================================================

    layDanhSachNhanSu(baoGomLuuTru) {
        return taiKhoanModel.layDanhSachNhanSu(baoGomLuuTru);
    },

    layChiTietNhanSu(id) {
        const nv = taiKhoanModel.layChiTietNhanSu(id);
        if (!nv) {
            const loi = new Error(`Không tìm thấy nhân viên có ID: ${id}`);
            loi.status = 404;
            throw loi;
        }
        return nv;
    },

    async taoNhanSu(duLieu, nguoiThucHien) {
        const { hoTen, tenDangNhap, matKhau = '123456', vaiTro = 'phuc_vu', soDienThoai, email, cccd, mucLuong, hinhThucLamViec, ngayVaoLam, lichLamViec, banAnIds = [] } = duLieu;

        if (!hoTen || !tenDangNhap) {
            const loi = new Error('Họ tên và tên đăng nhập không được để trống');
            loi.status = 400;
            throw loi;
        }

        // Kiểm tra trùng tên đăng nhập
        const tonTai = taiKhoanModel.timTheoTenDangNhap(tenDangNhap.trim());
        if (tonTai) {
            const loi = new Error(`Tên đăng nhập "${tenDangNhap}" đã được sử dụng`);
            loi.status = 409;
            throw loi;
        }

        const vaiTroDb = taiKhoanModel.timVaiTro(vaiTro);
        if (!vaiTroDb) {
            const loi = new Error(`Vai trò "${vaiTro}" không hợp lệ`);
            loi.status = 400;
            throw loi;
        }

        if (cauHinh.moiTruong === 'production' && (typeof matKhau !== 'string' || matKhau.length < 12)) {
            throw Object.assign(new Error('Mật khẩu nhân viên cần ít nhất 12 ký tự'), { status: 400 });
        }
        const ngayBatDau = ngayVaoLam || new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
        if (lichLamViec !== undefined) {
            if (typeof soDienThoai !== 'string' || !soDienThoai.trim() ||
                typeof cccd !== 'string' || !/^[0-9]{12}$/.test(cccd.trim()) ||
                mucLuong === undefined || !Number.isSafeInteger(Number(mucLuong)) || Number(mucLuong) < 0 ||
                !['toan_thoi_gian', 'ban_thoi_gian'].includes(hinhThucLamViec)) {
                throw Object.assign(new Error('Vui lòng kiểm tra số điện thoại, căn cước 12 số, mức lương và hình thức làm việc.'), { status: 400 });
            }
            kiemTraLichTaoNhanSu(lichLamViec, ngayBatDau);
        }
        if (!Array.isArray(banAnIds) || banAnIds.some(id => !Number.isSafeInteger(id) || id <= 0) ||
            (banAnIds.length > 0 && vaiTroDb.ma_vai_tro !== 'phuc_vu')) {
            throw Object.assign(new Error('Chỉ nhân viên phục vụ mới được phân công bàn. Vui lòng kiểm tra danh sách bàn.'), { status: 400 });
        }

        const matKhauHash = await bamMatKhau(matKhau);
        const nvMoi = taiKhoanModel.taoNhanSuVoiTaiKhoan({
            hoTen: hoTen.trim(),
            tenDangNhap: tenDangNhap.trim(),
            matKhauHash,
            vaiTroId: vaiTroDb.id,
            soDienThoai: soDienThoai ? soDienThoai.trim() : '',
            email: email ? email.trim() : '',
            cccd: cccd ? cccd.trim() : '',
            mucLuong: Number(mucLuong) || 0,
            hinhThucLamViec: hinhThucLamViec || 'toan_thoi_gian',
            ngayVaoLam: lichLamViec === undefined ? ngayVaoLam : ngayBatDau,
            lichLamViec,
            banAnIds: [...new Set(banAnIds)]
        });

        ghiAuditLog({
            taiKhoanId: nguoiThucHien?.taiKhoanId || 1,
            hanhDong: 'TAO_NHAN_SU_MOI',
            bangAnhHuong: 'nhan_vien',
            banGhiId: nvMoi.id,
            lyDo: `Tạo mới nhân viên ${hoTen} (${tenDangNhap}) vai trò ${vaiTroDb.ten_vai_tro}`
        });

        return nvMoi;
    },

    async capNhatNhanSu(id, duLieu, nguoiThucHien) {
        const nvCu = this.layChiTietNhanSu(id);
        const { hoTen, soDienThoai, email, cccd, mucLuong, hinhThucLamViec, vaiTro, matKhauMoi } = duLieu;

        let vaiTroId = null;
        if (vaiTro) {
            const vaiTroDb = taiKhoanModel.timVaiTro(vaiTro);
            if (!vaiTroDb) {
                const loi = new Error(`Vai trò "${vaiTro}" không hợp lệ`);
                loi.status = 400;
                throw loi;
            }
            vaiTroId = vaiTroDb.id;
        }

        let matKhauHash = null;
        if (matKhauMoi && matKhauMoi.trim().length < (cauHinh.moiTruong === 'production' ? 12 : 6)) {
            throw Object.assign(new Error('Mật khẩu mới chưa đủ độ dài'), { status: 400 });
        }
        if (matKhauMoi) {
            matKhauHash = await bamMatKhau(matKhauMoi.trim());
        }

        const nvCapNhat = taiKhoanModel.capNhatThongTinNhanSu(id, {
            hoTen: hoTen ? hoTen.trim() : nvCu.ho_ten,
            soDienThoai: soDienThoai !== undefined ? soDienThoai.trim() : nvCu.so_dien_thoai,
            email: email !== undefined ? email.trim() : nvCu.email,
            cccd: cccd !== undefined ? cccd.trim() : nvCu.cccd,
            mucLuong: mucLuong !== undefined ? Number(mucLuong) : nvCu.muc_luong,
            hinhThucLamViec: hinhThucLamViec || nvCu.hinh_thuc_lam_viec,
            vaiTroId,
            matKhauHash
        });

        ghiAuditLog({
            taiKhoanId: nguoiThucHien?.taiKhoanId || 1,
            hanhDong: 'CAP_NHAT_THONG_TIN_NHAN_SU',
            bangAnhHuong: 'nhan_vien',
            banGhiId: id,
            lyDo: `Cập nhật thông tin nhân viên ${nvCu.ho_ten}`
        });

        return nvCapNhat;
    },

    doiTrangThaiNhanSu(id, trangThai, nguoiThucHien) {
        const hopLe = ['dang_lam', 'tam_khoa', 'tam_nghi', 'dinh_chi', 'da_nghi'];
        if (!hopLe.includes(trangThai)) {
            const loi = new Error(`Trạng thái "${trangThai}" không hợp lệ`);
            loi.status = 400;
            throw loi;
        }

        const nvCu = this.layChiTietNhanSu(id);
        if (trangThai === 'da_nghi' && nvCu.ma_vai_tro === 'quan_ly') {
            throw Object.assign(new Error('Không thể xác nhận nghỉ việc cho tài khoản quản lý tại đây.'), { status: 409 });
        }
        const nvMoi = taiKhoanModel.doiTrangThaiNhanSu(id, trangThai);
        if (trangThai === 'da_nghi' && nvCu.trang_thai !== 'da_nghi') {
            require('../../cauHinh/cauHinhSocket').socketPhat.xacNhanNghiViec(id);
        }

        ghiAuditLog({
            taiKhoanId: nguoiThucHien?.taiKhoanId || 1,
            hanhDong: trangThai === 'da_nghi' ? 'XAC_NHAN_NGHI_VIEC' :
                trangThai === 'dang_lam' ? 'MO_KHOA_NHAN_SU' : 'DINH_CHI_NHAN_SU',
            bangAnhHuong: 'nhan_vien',
            banGhiId: id,
            lyDo: `Đổi trạng thái nhân sự ${nvCu.ho_ten} thành ${trangThai}`
        });

        return nvMoi;
    },

    khoiPhucNhanSu(id, nguoiThucHien) {
        const nhanVien = taiKhoanModel.khoiPhucNhanSu(id);
        if (!nhanVien) {
            throw Object.assign(new Error('Không tìm thấy hồ sơ nhân sự đã lưu trữ.'), { status: 404 });
        }
        ghiAuditLog({
            taiKhoanId: nguoiThucHien.taiKhoanId,
            hanhDong: 'KHOI_PHUC_NHAN_SU',
            bangAnhHuong: 'nhan_vien',
            banGhiId: id,
            lyDo: `Khôi phục hồ sơ và kích hoạt tài khoản của ${nhanVien.ho_ten}`
        });
        return nhanVien;
    },

    xoaNhanSu(id, nguoiThucHien) {
        const nvCu = this.layChiTietNhanSu(id);
        const ketQua = taiKhoanModel.xoaNhanSu(id, nguoiThucHien?.taiKhoanId);

        ghiAuditLog({
            taiKhoanId: nguoiThucHien?.taiKhoanId || 1,
            hanhDong: 'XOA_NHAN_SU',
            bangAnhHuong: 'nhan_vien',
            banGhiId: id,
            lyDo: `Lưu trữ hồ sơ và thu hồi quyền đăng nhập của ${nvCu.ho_ten} (${nvCu.ten_dang_nhap})`
        });

        return ketQua;
    },

    // =========================================================================
    // PHÂN CÔNG BÀN PHỤ TRÁCH (CHỈ DÀNH CHO PHỤC VỤ)
    // =========================================================================

    layBanPhuTrach(nhanVienId) {
        return taiKhoanModel.layBanPhuTrach(nhanVienId);
    },

    capNhatBanPhuTrach(nhanVienId, banAnIds, nguoiThucHien) {
        const nv = this.layChiTietNhanSu(nhanVienId);
        if (nv.ma_vai_tro !== 'phuc_vu') {
            const loi = new Error('Chỉ nhân viên vai trò Phục vụ mới cần phân công bàn phụ trách');
            loi.status = 400;
            throw loi;
        }

        const ketQua = taiKhoanModel.capNhatBanPhuTrach(nhanVienId, banAnIds);
        require('../../cauHinh/cauHinhSocket').socketPhat.viecBanThayDoi();

        ghiAuditLog({
            taiKhoanId: nguoiThucHien?.taiKhoanId || 1,
            hanhDong: 'PHAN_CONG_BAN_PHU_TRACH',
            bangAnhHuong: 'phan_cong_ban',
            banGhiId: nhanVienId,
            lyDo: `Phân công ${banAnIds.length} bàn phụ trách cho nhân viên ${nv.ho_ten}`
        });

        return ketQua;
    }
};

module.exports = taiKhoanService;
