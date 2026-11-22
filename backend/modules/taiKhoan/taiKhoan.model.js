// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MODEL DỮ LIỆU TÀI KHOẢN VÀ XÁC THỰC NGƯỜI DÙNG
// ============================================================================

const { truyVanMot, truyVanNhieu, thucThi, chayGiaoDich } = require('../../cauHinh/ketNoiCoSoDuLieu');

const caLamViecModel = require('../caLamViec/caLamViec.model');

function ghiPhanCongBan(nhanVienId, banAnIds) {
    const ngay = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    for (const banId of banAnIds) {
        thucThi(
            "INSERT INTO phan_cong_ban (nhan_vien_id, ban_an_id, ngay_phan_cong, ten_ca) VALUES (?, ?, ?, 'ca_toi')",
            [nhanVienId, Number(banId), ngay]
        );
    }
}

const taiKhoanModel = {
    timTheoTenDangNhap(tenDangNhap) {
        const sql = `
            SELECT t.id, t.ten_dang_nhap, t.mat_khau_hash, t.trang_thai,
                   v.id as vai_tro_id, v.ma_vai_tro, v.ten_vai_tro,
                   n.id as nhan_vien_id, n.ho_ten, n.so_dien_thoai, n.email
            FROM tai_khoan t
            JOIN vai_tro v ON t.vai_tro_id = v.id
            LEFT JOIN nhan_vien n ON n.tai_khoan_id = t.id
            WHERE t.ten_dang_nhap = ?;
        `;
        return truyVanMot(sql, [tenDangNhap]);
    },

    timTheoId(id) {
        const sql = `
            SELECT t.id, t.ten_dang_nhap, t.trang_thai, t.lan_dang_nhap_cuoi,
                   v.id as vai_tro_id, v.ma_vai_tro, v.ten_vai_tro,
                   n.id as nhan_vien_id, n.ho_ten, n.so_dien_thoai, n.email, n.muc_luong
            FROM tai_khoan t
            JOIN vai_tro v ON t.vai_tro_id = v.id
            LEFT JOIN nhan_vien n ON n.tai_khoan_id = t.id
            WHERE t.id = ?;
        `;
        return truyVanMot(sql, [id]);
    },

    capNhatLanDangNhapCuoi(id) {
        const sql = `
            UPDATE tai_khoan 
            SET lan_dang_nhap_cuoi = CURRENT_TIMESTAMP 
            WHERE id = ?;
        `;
        return thucThi(sql, [id]);
    },

    capNhatMatKhau(id, matKhauHashMoi) {
        const sql = `
            UPDATE tai_khoan 
            SET mat_khau_hash = ?, ngay_cap_nhat = CURRENT_TIMESTAMP 
            WHERE id = ?;
        `;
        return thucThi(sql, [matKhauHashMoi, id]);
    },

    // =========================================================================
    // QUẢN LÝ NHÂN SỰ TOÀN HỆ THỐNG (A02, A03, A04, A05)
    // =========================================================================

    layDanhSachNhanSu() {
        const sql = `
            SELECT n.id, n.tai_khoan_id, n.ho_ten, n.so_dien_thoai, n.email, n.cccd,
                   n.hinh_thuc_lam_viec, n.muc_luong, n.ngay_vao_lam, n.trang_thai,
                   t.ten_dang_nhap, t.trang_thai as trang_thai_tk, t.lan_dang_nhap_cuoi,
                   v.id as vai_tro_id, v.ma_vai_tro, v.ten_vai_tro,
                   (
                       SELECT GROUP_CONCAT(b.ma_ban, ', ')
                       FROM phan_cong_ban p
                       JOIN ban_an b ON p.ban_an_id = b.id
                       WHERE p.nhan_vien_id = n.id
                   ) as khu_vuc_phu_trach
            FROM nhan_vien n
            JOIN tai_khoan t ON n.tai_khoan_id = t.id
            JOIN vai_tro v ON t.vai_tro_id = v.id
            WHERE n.ngay_luu_tru IS NULL
            ORDER BY n.id ASC;
        `;
        return truyVanNhieu(sql);
    },

    layChiTietNhanSu(id) {
        const sql = `
            SELECT n.id, n.tai_khoan_id, n.ho_ten, n.so_dien_thoai, n.email, n.cccd,
                   n.hinh_thuc_lam_viec, n.muc_luong, n.ngay_vao_lam, n.trang_thai,
                   t.ten_dang_nhap, t.trang_thai as trang_thai_tk, t.lan_dang_nhap_cuoi,
                   v.id as vai_tro_id, v.ma_vai_tro, v.ten_vai_tro,
                   (
                       SELECT GROUP_CONCAT(b.ma_ban, ', ')
                       FROM phan_cong_ban p
                       JOIN ban_an b ON p.ban_an_id = b.id
                       WHERE p.nhan_vien_id = n.id
                   ) as khu_vuc_phu_trach
            FROM nhan_vien n
            JOIN tai_khoan t ON n.tai_khoan_id = t.id
            JOIN vai_tro v ON t.vai_tro_id = v.id
            WHERE n.id = ? AND n.ngay_luu_tru IS NULL;
        `;
        return truyVanMot(sql, [id]);
    },

    timVaiTro(dinhDanh) {
        const sql = `SELECT id, ma_vai_tro, ten_vai_tro FROM vai_tro WHERE ma_vai_tro = ? OR id = ?;`;
        return truyVanMot(sql, [dinhDanh, Number(dinhDanh) || 0]);
    },

    taoNhanSuVoiTaiKhoan({ hoTen, tenDangNhap, matKhauHash, vaiTroId, soDienThoai, email, cccd, mucLuong, hinhThucLamViec, ngayVaoLam, lichLamViec = [], banAnIds = [] }) {
        return chayGiaoDich(() => {
            // 1. Tạo tài khoản đăng nhập
            const sqlTk = `
                INSERT INTO tai_khoan (ten_dang_nhap, mat_khau_hash, vai_tro_id, trang_thai)
                VALUES (?, ?, ?, 'hoat_dong');
            `;
            const resTk = thucThi(sqlTk, [tenDangNhap, matKhauHash, vaiTroId]);
            const taiKhoanId = Number(resTk.lastInsertRowid);

            // 2. Tạo hồ sơ nhân viên (email và cccd nếu rỗng thì truyền null để tránh vi phạm UNIQUE)
            // Số điện thoại nếu không nhập thì sinh số duy nhất theo mã tài khoản để không vi phạm NOT NULL UNIQUE
            const soDienThoaiHopLe = (soDienThoai && soDienThoai.trim()) 
                ? soDienThoai.trim() 
                : (`09${String(Date.now()).slice(-8)}`);

            const sqlNv = `
                INSERT INTO nhan_vien (tai_khoan_id, ho_ten, so_dien_thoai, email, cccd, hinh_thuc_lam_viec, muc_luong, ngay_vao_lam, trang_thai)
                VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_DATE), 'dang_lam');
            `;
            const resNv = thucThi(sqlNv, [
                taiKhoanId,
                hoTen.trim(),
                soDienThoaiHopLe,
                email && email.trim() ? email.trim() : null,
                cccd && cccd.trim() ? cccd.trim() : null,
                hinhThucLamViec || 'toan_thoi_gian',
                mucLuong || 0,
                ngayVaoLam || null
            ]);

            const nhanVienId = Number(resNv.lastInsertRowid);
            for (const ca of lichLamViec) caLamViecModel.taoCa({ ...ca, nhanVienId });
            for (const banId of banAnIds) {
                if (!truyVanMot('SELECT id FROM ban_an WHERE id = ? AND kich_hoat = 1', [banId])) {
                    throw Object.assign(new Error('Có bàn đã ngừng hoạt động hoặc không còn tồn tại. Vui lòng chọn lại bàn.'), { status: 409 });
                }
            }
            ghiPhanCongBan(nhanVienId, banAnIds);
            return this.layChiTietNhanSu(nhanVienId);
        });
    },

    capNhatThongTinNhanSu(id, { hoTen, soDienThoai, email, cccd, hinhThucLamViec, mucLuong, vaiTroId, matKhauHash }) {
        const nv = this.layChiTietNhanSu(id);
        if (!nv) return null;

        // Cập nhật thông tin hồ sơ nhân viên (null nếu rỗng để không trùng UNIQUE)
        const giaTriEmail = email !== undefined ? (email && email.trim() ? email.trim() : null) : nv.email;
        const giaTriCccd = cccd !== undefined ? (cccd && cccd.trim() ? cccd.trim() : null) : nv.cccd;
        const giaTriSdt = (soDienThoai !== undefined && soDienThoai.trim()) ? soDienThoai.trim() : nv.so_dien_thoai;

        const sqlNv = `
            UPDATE nhan_vien 
            SET ho_ten = ?, so_dien_thoai = ?, email = ?, cccd = ?, 
                hinh_thuc_lam_viec = ?, muc_luong = ?, ngay_cap_nhat = CURRENT_TIMESTAMP
            WHERE id = ?;
        `;
        thucThi(sqlNv, [
            hoTen ? hoTen.trim() : nv.ho_ten,
            giaTriSdt,
            giaTriEmail,
            giaTriCccd,
            hinhThucLamViec || nv.hinh_thuc_lam_viec,
            mucLuong !== undefined ? Number(mucLuong) : nv.muc_luong,
            id
        ]);

        // Cập nhật tài khoản nếu có đổi vai trò hoặc mật khẩu
        if (vaiTroId || matKhauHash) {
            let sqlTk = `UPDATE tai_khoan SET ngay_cap_nhat = CURRENT_TIMESTAMP`;
            const params = [];
            if (vaiTroId) {
                sqlTk += `, vai_tro_id = ?`;
                params.push(vaiTroId);
            }
            if (matKhauHash) {
                sqlTk += `, mat_khau_hash = ?`;
                params.push(matKhauHash);
            }
            sqlTk += ` WHERE id = ?;`;
            params.push(nv.tai_khoan_id);
            thucThi(sqlTk, params);
        }

        return this.layChiTietNhanSu(id);
    },

    doiTrangThaiNhanSu(id, trangThai) {
        const nv = this.layChiTietNhanSu(id);
        if (!nv) return null;

        // Chuẩn hóa trạng thái phù hợp CHECK constraint ('dang_lam', 'tam_nghi', 'da_nghi')
        let trangThaiNv = 'dang_lam';
        let trangThaiTk = 'hoat_dong';

        if (trangThai === 'tam_khoa' || trangThai === 'tam_nghi' || trangThai === 'dinh_chi') {
            trangThaiNv = 'tam_nghi';
            trangThaiTk = 'tam_khoa';
        } else if (trangThai === 'da_nghi' || trangThai === 'da_xoa') {
            trangThaiNv = 'da_nghi';
            trangThaiTk = 'da_xoa';
        }

        // Cập nhật trạng thái nhân viên
        const sqlNv = `UPDATE nhan_vien SET trang_thai = ?, ngay_cap_nhat = CURRENT_TIMESTAMP WHERE id = ?;`;
        thucThi(sqlNv, [trangThaiNv, id]);

        // Đồng bộ trạng thái tài khoản đăng nhập (Khóa tài khoản không cho đăng nhập)
        const sqlTk = `UPDATE tai_khoan SET trang_thai = ?, ngay_cap_nhat = CURRENT_TIMESTAMP WHERE id = ?;`;
        thucThi(sqlTk, [trangThaiTk, nv.tai_khoan_id]);

        return this.layChiTietNhanSu(id);
    },

    xoaNhanSu(id, taiKhoanThucHienId) {
        return chayGiaoDich(() => {
            const nv = this.layChiTietNhanSu(id);
            if (!nv) return false;

            if (nv.tai_khoan_id === taiKhoanThucHienId) {
                throw Object.assign(new Error('Bạn không thể xóa tài khoản đang đăng nhập.'), { status: 409 });
            }
            if (nv.ma_vai_tro === 'quan_ly' && nv.trang_thai_tk === 'hoat_dong') {
                const conQuanLy = truyVanMot(`
                    SELECT t.id FROM tai_khoan t JOIN vai_tro v ON v.id = t.vai_tro_id
                    WHERE v.ma_vai_tro = 'quan_ly' AND t.trang_thai = 'hoat_dong' AND t.id <> ?
                    LIMIT 1
                `, [nv.tai_khoan_id]);
                if (!conQuanLy) {
                    throw Object.assign(new Error('Phải giữ ít nhất một tài khoản quản lý đang hoạt động.'), { status: 409 });
                }
            }

            thucThi(`
                UPDATE nhan_vien SET trang_thai = 'da_nghi', ngay_luu_tru = CURRENT_TIMESTAMP,
                    ngay_cap_nhat = CURRENT_TIMESTAMP WHERE id = ?
            `, [id]);
            thucThi("UPDATE tai_khoan SET trang_thai = 'da_xoa', ngay_cap_nhat = CURRENT_TIMESTAMP WHERE id = ?", [nv.tai_khoan_id]);
            thucThi(`
                UPDATE ca_lam_viec SET trang_thai = 'da_huy'
                WHERE nhan_vien_id = ? AND trang_thai = 'ke_hoach' AND ngay_lam >= DATE('now', '+7 hours')
            `, [id]);
            return true;
        });
    },

    // =========================================================================
    // PHÂN CÔNG BÀN PHỤ TRÁCH (CHỈ DÀNH CHO NHÂN VIÊN PHỤC VỤ)
    // =========================================================================

    layBanCoTheGiao() {
        return truyVanNhieu(`
            SELECT b.id, b.ten_ban, k.ten_khu_vuc,
                (SELECT GROUP_CONCAT(phan_cong.ho_ten, ', ') FROM (
                    SELECT n.ho_ten FROM phan_cong_ban p
                    JOIN nhan_vien n ON n.id = p.nhan_vien_id
                    JOIN tai_khoan t ON t.id = n.tai_khoan_id
                    WHERE p.ban_an_id = b.id AND p.ngay_phan_cong <= DATE('now', '+7 hours')
                        AND n.trang_thai = 'dang_lam' AND t.trang_thai = 'hoat_dong'
                    GROUP BY n.id ORDER BY MAX(p.ngay_phan_cong) DESC, MAX(p.id) DESC
                ) phan_cong) AS nguoi_phu_trach
            FROM ban_an b JOIN khu_vuc k ON k.id = b.khu_vuc_id
            WHERE b.kich_hoat = 1 ORDER BY k.ten_khu_vuc, b.ten_ban, b.id
        `);
    },

    layBanPhuTrach(nhanVienId) {
        const sql = `
            SELECT p.ban_an_id, b.ma_ban, b.ten_ban, b.suc_chua, b.trang_thai, k.id as khu_vuc_id, k.ten_khu_vuc
            FROM phan_cong_ban p
            JOIN ban_an b ON p.ban_an_id = b.id
            JOIN khu_vuc k ON b.khu_vuc_id = k.id
            WHERE p.nhan_vien_id = ?
            ORDER BY b.id ASC;
        `;
        return truyVanNhieu(sql, [nhanVienId]);
    },

    capNhatBanPhuTrach(nhanVienId, banAnIds = []) {
        return chayGiaoDich(() => {
            // Xóa phân công cũ của nhân viên
            thucThi(`DELETE FROM phan_cong_ban WHERE nhan_vien_id = ?;`, [nhanVienId]);

            ghiPhanCongBan(nhanVienId, banAnIds);
            return this.layBanPhuTrach(nhanVienId);
        });
    }
};

module.exports = taiKhoanModel;
