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

function laySoDoChiTiet() {
    const sql = `
        SELECT ba.*, kv.ten_khu_vuc, kv.tang,
               pb.id AS phien_ban_id, pb.ma_phien, pb.thoi_gian_bat_dau, pb.tong_tien_tam_tinh, pb.so_khach,
               ROUND((JULIANDAY('now') - JULIANDAY(pb.thoi_gian_bat_dau)) * 24 * 60) AS so_phut_ngoi
        FROM ban_an ba
        JOIN khu_vuc kv ON ba.khu_vuc_id = kv.id
        LEFT JOIN phien_ban pb ON pb.ban_an_id = ba.id AND pb.trang_thai IN ('dang_su_dung', 'cho_thanh_toan')
        ORDER BY kv.thu_tu_hien_thi ASC, ba.ma_ban ASC
    `;
    const danhSach = ketNoiCoSoDuLieu.layNhieu(sql);
    for (const ban of danhSach) {
        ban.mon_cho = 0;
        ban.mon_dang_nau = 0;
        ban.mon_san_sang = 0;
        ban.mon_da_phuc_vu = 0;
        if (ban.phien_ban_id) {
            const thongKe = ketNoiCoSoDuLieu.layNhieu(`
                SELECT ct.trang_thai, SUM(ct.so_luong) as so_luong
                FROM chi_tiet_don_mon ct
                JOIN don_goi_mon d ON ct.don_goi_mon_id = d.id
                WHERE d.phien_ban_id = ?
                GROUP BY ct.trang_thai
            `, [ban.phien_ban_id]);
            for (const tk of thongKe) {
                if (tk.trang_thai === 'cho_xac_nhan') ban.mon_cho += tk.so_luong;
                else if (tk.trang_thai === 'dang_che_bien') ban.mon_dang_nau += tk.so_luong;
                else if (tk.trang_thai === 'hoan_thanh') ban.mon_san_sang += tk.so_luong;
                else if (tk.trang_thai === 'da_phuc_vu') ban.mon_da_phuc_vu += tk.so_luong;
            }
        }
    }
    return danhSach;
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
    xoaBanAn,
    laySoDoChiTiet
};
