/**
 * Model thao tác dữ liệu bảng don_goi_mon, chi_tiet_don_mon và lich_su_don_mon
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

function demSoLanGoiCuaPhien(phienBanId) {
    const row = ketNoiCoSoDuLieu.layMot(
        `SELECT COUNT(*) AS tong FROM don_goi_mon WHERE phien_ban_id = ?`,
        [phienBanId]
    );
    return row ? row.tong : 0;
}

function timDonTheoId(id) {
    return ketNoiCoSoDuLieu.layMot(`SELECT * FROM don_goi_mon WHERE id = ?`, [id]);
}

function timChiTietTheoId(id) {
    return ketNoiCoSoDuLieu.layMot(`SELECT * FROM chi_tiet_don_mon WHERE id = ?`, [id]);
}

function layChiTietTheoDonId(donId) {
    return ketNoiCoSoDuLieu.layNhieu(`SELECT * FROM chi_tiet_don_mon WHERE don_goi_mon_id = ?`, [donId]);
}

function layDonMonTheoBan(banId) {
    const danhSachDon = ketNoiCoSoDuLieu.layNhieu(
        `SELECT * FROM don_goi_mon WHERE ban_an_id = ? ORDER BY id DESC`,
        [banId]
    );
    for (const don of danhSachDon) {
        don.chiTiet = layChiTietTheoDonId(don.id);
    }
    return danhSachDon;
}

module.exports = {
    demSoLanGoiCuaPhien,
    timDonTheoId,
    timTheoId: timDonTheoId,
    timChiTietTheoId,
    layChiTietTheoDonId,
    layDonMonTheoBan
};
