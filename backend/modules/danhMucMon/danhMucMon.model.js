const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

function layDanhSach() {
    const sql = `
        SELECT dm.*, COUNT(ma.id) as so_luong_mon
        FROM danh_muc_mon dm
        LEFT JOIN mon_an ma ON dm.id = ma.danh_muc_id AND ma.da_xoa = 0
        GROUP BY dm.id
        ORDER BY dm.thu_tu_hien_thi ASC, dm.id ASC
    `;
    return ketNoiCoSoDuLieu.layNhieu(sql);
}

function timTheoId(id) {
    return ketNoiCoSoDuLieu.layMot('SELECT * FROM danh_muc_mon WHERE id = ?', [id]);
}

function taoDanhMuc({ tenDanhMuc, moTa, thuTuHienThi }) {
    const sql = `
        INSERT INTO danh_muc_mon (ten_danh_muc, mo_ta, thu_tu_hien_thi, trang_thai)
        VALUES (?, ?, ?, 'hien_thi')
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [tenDanhMuc, moTa || '', thuTuHienThi || 0]);
}

function capNhatDanhMuc(id, { tenDanhMuc, moTa, thuTuHienThi, trangThai }) {
    const sql = `
        UPDATE danh_muc_mon
        SET ten_danh_muc = ?, mo_ta = ?, thu_tu_hien_thi = ?, trang_thai = ?
        WHERE id = ?
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [tenDanhMuc, moTa, thuTuHienThi, trangThai, id]);
}

function xoaDanhMuc(id) {
    return ketNoiCoSoDuLieu.thucThi('DELETE FROM danh_muc_mon WHERE id = ?', [id]);
}

module.exports = {
    layDanhSach,
    timTheoId,
    taoDanhMuc,
    capNhatDanhMuc,
    xoaDanhMuc
};
