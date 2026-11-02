const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

function layDanhSach({ khuVucId, trangThai } = {}) {
    let sql = `
        SELECT ba.*, kv.ten_khu_vuc, kv.tang
        FROM ban_an ba
        JOIN khu_vuc kv ON ba.khu_vuc_id = kv.id
        WHERE 1=1
    `;
    const thamSo = [];

    if (khuVucId) {
        sql += ` AND ba.khu_vuc_id = ?`;
        thamSo.push(Number(khuVucId));
    }

    if (trangThai) {
        sql += ` AND ba.trang_thai = ?`;
        thamSo.push(trangThai);
    }

    sql += ` ORDER BY kv.thu_tu_hien_thi ASC, ba.ma_ban ASC`;
    return ketNoiCoSoDuLieu.layNhieu(sql, thamSo);
}

function layTheoId(id) {
    const sql = `
        SELECT ba.*, kv.ten_khu_vuc, kv.tang
        FROM ban_an ba
        JOIN khu_vuc kv ON ba.khu_vuc_id = kv.id
        WHERE ba.id = ?
    `;
    return ketNoiCoSoDuLieu.layMot(sql, [id]);
}

function layTheoMaBan(maBan) {
    const sql = `
        SELECT ba.*, kv.ten_khu_vuc, kv.tang
        FROM ban_an ba
        JOIN khu_vuc kv ON ba.khu_vuc_id = kv.id
        WHERE ba.ma_ban = ?
    `;
    return ketNoiCoSoDuLieu.layMot(sql, [maBan]);
}

function layTheoKhuVucId(khuVucId) {
    return ketNoiCoSoDuLieu.layNhieu('SELECT * FROM ban_an WHERE khu_vuc_id = ?', [khuVucId]);
}

function taoBanAn({ maBan, tenBan, khuVucId, sucChua, maQrToken, urlMaQr }) {
    const sql = `
        INSERT INTO ban_an (ma_ban, ten_ban, khu_vuc_id, suc_chua, trang_thai, ma_qr_token, url_ma_qr)
        VALUES (?, ?, ?, ?, 'trong', ?, ?)
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [maBan, tenBan, khuVucId, sucChua, maQrToken, urlMaQr]);
}

function capNhatBanAn(id, { tenBan, khuVucId, sucChua }) {
    const sql = `
        UPDATE ban_an
        SET ten_ban = ?, khu_vuc_id = ?, suc_chua = ?
        WHERE id = ?
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [tenBan, khuVucId, sucChua, id]);
}

function capNhatQrToken(id, maQrToken, urlMaQr) {
    const sql = `
        UPDATE ban_an
        SET ma_qr_token = ?, url_ma_qr = ?
        WHERE id = ?
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [maQrToken, urlMaQr, id]);
}

function doiTrangThai(id, trangThai) {
    const sql = `
        UPDATE ban_an
        SET trang_thai = ?
        WHERE id = ?
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [trangThai, id]);
}

function xoaBanAn(id) {
    return ketNoiCoSoDuLieu.thucThi('DELETE FROM ban_an WHERE id = ?', [id]);
}

module.exports = {
    layDanhSach,
    layTheoId,
    layTheoMaBan,
    layTheoKhuVucId,
    taoBanAn,
    capNhatBanAn,
    capNhatQrToken,
    doiTrangThai,
    xoaBanAn
};
