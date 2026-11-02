/**
 * Model quản lý Ca làm việc & Phiên thu ngân
 * Phụ trách: Minh (Backend Developer)
 */
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

function layDanhSachCa() {
    const sql = `SELECT * FROM ca_lam_viec WHERE trang_thai = 'hoat_dong' ORDER BY gio_bat_dau ASC`;
    return ketNoiCoSoDuLieu.layNhieu(sql);
}

function layPhienCaTheoId(id) {
    const sql = `
        SELECT pc.*, tk.ho_ten AS ten_thu_ngan, c.ten_ca, c.gio_bat_dau, c.gio_ket_thuc
        FROM phien_ca_thu_ngan pc
        LEFT JOIN tai_khoan tk ON pc.nhan_vien_id = tk.id
        LEFT JOIN ca_lam_viec c ON pc.ca_lam_viec_id = c.id
        WHERE pc.id = ?
    `;
    return ketNoiCoSoDuLieu.layMot(sql, [id]);
}

function layPhienCaHienTai(nhanVienId) {
    const sql = `
        SELECT pc.*, tk.ho_ten AS ten_thu_ngan, c.ten_ca
        FROM phien_ca_thu_ngan pc
        LEFT JOIN tai_khoan tk ON pc.nhan_vien_id = tk.id
        LEFT JOIN ca_lam_viec c ON pc.ca_lam_viec_id = c.id
        WHERE pc.nhan_vien_id = ? AND pc.trang_thai = 'dang_mo'
        ORDER BY pc.id DESC LIMIT 1
    `;
    return ketNoiCoSoDuLieu.layMot(sql, [nhanVienId]);
}

function moCa({ nhanVienId, caLamViecId, tienDauCa = 0, ghiChu = '' }) {
    const maPhienCa = `SHIFT_${Date.now()}`;
    const sql = `
        INSERT INTO phien_ca_thu_ngan (ma_phien_ca, nhan_vien_id, ca_lam_viec_id, tien_dau_ca, ghi_chu, trang_thai)
        VALUES (?, ?, ?, ?, ?, 'dang_mo')
    `;
    const res = ketNoiCoSoDuLieu.thucThi(sql, [maPhienCa, nhanVienId, caLamViecId || null, tienDauCa, ghiChu]);
    return layPhienCaTheoId(res.lastInsertRowid);
}

function taoPhieuThuChi({ phienCaId, loaiPhieu, soTien, lyDo, nguoiThucHienId }) {
    const maPhieu = `${loaiPhieu === 'thu' ? 'PT' : 'PC'}_${Date.now()}`;
    const sql = `
        INSERT INTO phieu_thu_chi (ma_phieu, phien_ca_id, loai_phieu, so_tien, ly_do, nguoi_thuc_hien_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const res = ketNoiCoSoDuLieu.thucThi(sql, [maPhieu, phienCaId, loaiPhieu, soTien, lyDo, nguoiThucHienId]);

    // Cập nhật tổng phát sinh trong phiên
    if (loaiPhieu === 'thu') {
        ketNoiCoSoDuLieu.thucThi(`
            UPDATE phien_ca_thu_ngan 
            SET tong_thu_phat_sinh = tong_thu_phat_sinh + ? 
            WHERE id = ?
        `, [soTien, phienCaId]);
    } else {
        ketNoiCoSoDuLieu.thucThi(`
            UPDATE phien_ca_thu_ngan 
            SET tong_chi_phat_sinh = tong_chi_phat_sinh + ? 
            WHERE id = ?
        `, [soTien, phienCaId]);
    }

    return layPhieuThuChiTheoId(res.lastInsertRowid);
}

function layPhieuThuChiTheoId(id) {
    const sql = `
        SELECT ptc.*, tk.ho_ten AS nguoi_thuc_hien
        FROM phieu_thu_chi ptc
        LEFT JOIN tai_khoan tk ON ptc.nguoi_thuc_hien_id = tk.id
        WHERE ptc.id = ?
    `;
    return ketNoiCoSoDuLieu.layMot(sql, [id]);
}

function layDanhSachPhieuThuChi(phienCaId) {
    const sql = `
        SELECT ptc.*, tk.ho_ten AS nguoi_thuc_hien
        FROM phieu_thu_chi ptc
        LEFT JOIN tai_khoan tk ON ptc.nguoi_thuc_hien_id = tk.id
        WHERE ptc.phien_ca_id = ?
        ORDER BY ptc.thoi_gian_tao ASC
    `;
    return ketNoiCoSoDuLieu.layNhieu(sql, [phienCaId]);
}

function ketCa({ phienCaId, tienMatThucTe, ghiChu }) {
    const phien = layPhienCaTheoId(phienCaId);
    if (!phien) return null;

    // Tính tổng tiền mặt và chuyển khoản từ hóa đơn thu trong khoảng thời gian phiên mở
    const rowTienMat = ketNoiCoSoDuLieu.layMot(`
        SELECT COALESCE(SUM(tong_thanh_toan), 0) AS tien_mat
        FROM hoa_don
        WHERE trang_thai = 'da_thanh_toan' 
          AND phuong_thuc_thanh_toan = 'tien_mat'
          AND thoi_gian_tao >= ?
    `, [phien.thoi_gian_mo]);

    const rowTienCk = ketNoiCoSoDuLieu.layMot(`
        SELECT COALESCE(SUM(tong_thanh_toan), 0) AS tien_ck
        FROM hoa_don
        WHERE trang_thai = 'da_thanh_toan' 
          AND phuong_thuc_thanh_toan = 'chuyen_khoan'
          AND thoi_gian_tao >= ?
    `, [phien.thoi_gian_mo]);

    const tienMatHoaDon = rowTienMat ? rowTienMat.tien_mat : 0;
    const tienCkHoaDon = rowTienCk ? rowTienCk.tien_ck : 0;

    const tienMatHeThong = phien.tien_dau_ca + tienMatHoaDon + phien.tong_thu_phat_sinh - phien.tong_chi_phat_sinh;
    const chenhLech = Number(tienMatThucTe) - tienMatHeThong;

    const sqlUpdate = `
        UPDATE phien_ca_thu_ngan
        SET thoi_gian_dong = datetime('now', 'localtime'),
            tien_mat_he_thong = ?,
            tien_ck_he_thong = ?,
            tien_mat_thuc_te = ?,
            chenh_lech = ?,
            ghi_chu = COALESCE(?, ghi_chu),
            trang_thai = 'da_dong'
        WHERE id = ?
    `;
    ketNoiCoSoDuLieu.thucThi(sqlUpdate, [
        tienMatHeThong,
        tienCkHoaDon,
        Number(tienMatThucTe),
        chenhLech,
        ghiChu,
        phienCaId
    ]);

    return layPhienCaTheoId(phienCaId);
}

function layLichSuPhienCa(gioiHan = 30) {
    const sql = `
        SELECT pc.*, tk.ho_ten AS ten_thu_ngan, c.ten_ca
        FROM phien_ca_thu_ngan pc
        LEFT JOIN tai_khoan tk ON pc.nhan_vien_id = tk.id
        LEFT JOIN ca_lam_viec c ON pc.ca_lam_viec_id = c.id
        ORDER BY pc.thoi_gian_mo DESC
        LIMIT ?
    `;
    return ketNoiCoSoDuLieu.layNhieu(sql, [gioiHan]);
}

module.exports = {
    layDanhSachCa,
    layPhienCaTheoId,
    layPhienCaHienTai,
    moCa,
    taoPhieuThuChi,
    layPhieuThuChiTheoId,
    layDanhSachPhieuThuChi,
    ketCa,
    layLichSuPhienCa
};
