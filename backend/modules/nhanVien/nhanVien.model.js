const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

function layDanhSach({ tuKhoa, vaiTroId, trangThai, trang = 1, gioiHan = 20 } = {}) {
    let sql = `
        SELECT tk.id, tk.ten_dang_nhap, tk.ho_ten, tk.so_dien_thoai, tk.email,
               tk.vai_tro_id, tk.trang_thai, tk.ngay_tao, tk.ngay_cap_nhat,
               vt.ma_vai_tro, vt.ten_vai_tro
        FROM tai_khoan tk
        JOIN vai_tro vt ON tk.vai_tro_id = vt.id
        WHERE 1=1
    `;
    const thamSo = [];

    if (tuKhoa && tuKhoa.trim()) {
        sql += ` AND (tk.ten_dang_nhap LIKE ? OR tk.ho_ten LIKE ? OR tk.so_dien_thoai LIKE ?)`;
        const tuKhoaLike = `%${tuKhoa.trim()}%`;
        thamSo.push(tuKhoaLike, tuKhoaLike, tuKhoaLike);
    }

    if (vaiTroId) {
        sql += ` AND tk.vai_tro_id = ?`;
        thamSo.push(Number(vaiTroId));
    }

    if (trangThai) {
        sql += ` AND tk.trang_thai = ?`;
        thamSo.push(trangThai);
    }

    // Đếm tổng số bản ghi
    const sqlDem = `SELECT COUNT(*) as tongSo FROM (${sql})`;
    const tongSoBanGhi = (ketNoiCoSoDuLieu.layMot(sqlDem, thamSo) || {}).tongSo || 0;

    sql += ` ORDER BY tk.id DESC LIMIT ? OFFSET ?`;
    const offset = (Number(trang) - 1) * Number(gioiHan);
    thamSo.push(Number(gioiHan), offset);

    const danhSach = ketNoiCoSoDuLieu.layNhieu(sql, thamSo);

    return {
        danhSach,
        tongSo: tongSoBanGhi,
        trang: Number(trang),
        gioiHan: Number(gioiHan)
    };
}

function taoNhanVien({ tenDangNhap, matKhauBam, hoTen, soDienThoai, email, vaiTroId }) {
    const sql = `
        INSERT INTO tai_khoan (ten_dang_nhap, mat_khau_bam, ho_ten, so_dien_thoai, email, vai_tro_id, trang_thai)
        VALUES (?, ?, ?, ?, ?, ?, 'hoat_dong')
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [tenDangNhap, matKhauBam, hoTen, soDienThoai, email, vaiTroId]);
}

function capNhatNhanVien(id, { hoTen, soDienThoai, email, vaiTroId }) {
    const sql = `
        UPDATE tai_khoan
        SET ho_ten = ?, so_dien_thoai = ?, email = ?, vai_tro_id = ?, ngay_cap_nhat = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [hoTen, soDienThoai, email, vaiTroId, id]);
}

function doiTrangThai(id, trangThai) {
    const sql = `
        UPDATE tai_khoan
        SET trang_thai = ?, ngay_cap_nhat = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [trangThai, id]);
}

module.exports = {
    layDanhSach,
    taoNhanVien,
    capNhatNhanVien,
    doiTrangThai
};
