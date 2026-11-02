const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

function layDanhSach() {
    const sql = `
        SELECT kv.*, COUNT(ba.id) as so_luong_ban
        FROM khu_vuc kv
        LEFT JOIN ban_an ba ON kv.id = ba.khu_vuc_id
        GROUP BY kv.id
        ORDER BY kv.thu_tu_hien_thi ASC, kv.id ASC
    `;
    return ketNoiCoSoDuLieu.layNhieu(sql);
}

function timTheoId(id) {
    return ketNoiCoSoDuLieu.layMot('SELECT * FROM khu_vuc WHERE id = ?', [id]);
}

function taoKhuVuc({ tenKhuVuc, tang, moTa, thuTuHienThi }) {
    const sql = `
        INSERT INTO khu_vuc (ten_khu_vuc, tang, mo_ta, thu_tu_hien_thi, trang_thai)
        VALUES (?, ?, ?, ?, 'hoat_dong')
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [tenKhuVuc, tang || 1, moTa || '', thuTuHienThi || 0]);
}

function capNhatKhuVuc(id, { tenKhuVuc, tang, moTa, thuTuHienThi, trangThai }) {
    const sql = `
        UPDATE khu_vuc
        SET ten_khu_vuc = ?, tang = ?, mo_ta = ?, thu_tu_hien_thi = ?, trang_thai = ?
        WHERE id = ?
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [tenKhuVuc, tang, moTa, thuTuHienThi, trangThai, id]);
}

function xoaKhuVuc(id) {
    return ketNoiCoSoDuLieu.thucThi('DELETE FROM khu_vuc WHERE id = ?', [id]);
}

module.exports = {
    layDanhSach,
    timTheoId,
    taoKhuVuc,
    capNhatKhuVuc,
    xoaKhuVuc
};
