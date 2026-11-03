/**
 * Model thao tác dữ liệu bảng phien_ban
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

function timPhienDangHoatDongTheoBanId(banId) {
    const sql = `
        SELECT * FROM phien_ban 
        WHERE ban_an_id = ? AND trang_thai = 'dang_su_dung'
        ORDER BY id DESC LIMIT 1
    `;
    return ketNoiCoSoDuLieu.layMot(sql, [banId]);
}

function timTheoMaPhien(maPhien) {
    const sql = `SELECT * FROM phien_ban WHERE ma_phien = ?`;
    return ketNoiCoSoDuLieu.layMot(sql, [maPhien]);
}

function timTheoId(id) {
    const sql = `SELECT * FROM phien_ban WHERE id = ?`;
    return ketNoiCoSoDuLieu.layMot(sql, [id]);
}

function taoPhienBan({ banAnId, maPhien }) {
    const sql = `
        INSERT INTO phien_ban (ban_an_id, ma_phien, thoi_gian_bat_dau, trang_thai, tong_tien_tam_tinh)
        VALUES (?, ?, CURRENT_TIMESTAMP, 'dang_su_dung', 0)
    `;
    const ketQua = ketNoiCoSoDuLieu.thucThi(sql, [banAnId, maPhien]);
    return timTheoId(ketQua.lastInsertRowid);
}

function capNhatTongTien(phienBanId, tongTienTamTinh) {
    const sql = `UPDATE phien_ban SET tong_tien_tam_tinh = ? WHERE id = ?`;
    return ketNoiCoSoDuLieu.thucThi(sql, [tongTienTamTinh, phienBanId]);
}

function dongPhienBan(phienBanId, trangThai = 'da_thanh_toan') {
    const sql = `
        UPDATE phien_ban 
        SET trang_thai = ?, thoi_gian_ket_thuc = CURRENT_TIMESTAMP 
        WHERE id = ?
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [trangThai, phienBanId]);
}

module.exports = {
    timPhienDangHoatDongTheoBanId,
    timTheoMaPhien,
    timTheoId,
    taoPhienBan,
    capNhatTongTien,
    dongPhienBan
};
