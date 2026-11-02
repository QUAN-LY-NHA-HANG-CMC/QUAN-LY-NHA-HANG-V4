const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

async function layToanBoCauHinh() {
    const danhSach = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM cau_hinh_nha_hang');
    const ketQua = {};
    for (const item of danhSach) {
        ketQua[item.khoa] = item.gia_tri;
    }
    return ketQua;
}

async function capNhatCauHinh(duLieuCauHinh) {
    for (const [khoa, giaTri] of Object.entries(duLieuCauHinh)) {
        const tonTai = ketNoiCoSoDuLieu.layMot('SELECT khoa FROM cau_hinh_nha_hang WHERE khoa = ?', [khoa]);
        if (tonTai) {
            ketNoiCoSoDuLieu.thucThi(
                'UPDATE cau_hinh_nha_hang SET gia_tri = ?, ngay_cap_nhat = CURRENT_TIMESTAMP WHERE khoa = ?',
                [String(giaTri), khoa]
            );
        } else {
            ketNoiCoSoDuLieu.thucThi(
                'INSERT INTO cau_hinh_nha_hang (khoa, gia_tri) VALUES (?, ?)',
                [khoa, String(giaTri)]
            );
        }
    }
    return await layToanBoCauHinh();
}

async function ghiNhatKy(taiKhoanId, hanhDong, chiTiet = '', ip = '') {
    const sql = `
        INSERT INTO nhat_ky_he_thong (tai_khoan_id, hanh_dong, chi_tiet, ip)
        VALUES (?, ?, ?, ?)
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [taiKhoanId || null, hanhDong, chiTiet, ip]);
}

async function layNhatKyHeThong(gioiHan = 100) {
    const sql = `
        SELECT nk.*, tk.ten_dang_nhap, tk.ho_ten
        FROM nhat_ky_he_thong nk
        LEFT JOIN tai_khoan tk ON nk.tai_khoan_id = tk.id
        ORDER BY nk.id DESC
        LIMIT ?
    `;
    return ketNoiCoSoDuLieu.layNhieu(sql, [gioiHan]);
}

module.exports = {
    layToanBoCauHinh,
    capNhatCauHinh,
    ghiNhatKy,
    layNhatKyHeThong
};
