/**
 * Model quản lý Đánh giá & Nhận xét của khách hàng
 * Phụ trách: Minh (Backend Developer)
 */
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

function taoDanhGia({ phienBanId, monAnId, tenKhachHang, soSao, nhanXet, anDanh }) {
    const sql = `
        INSERT INTO danh_gia (phien_ban_id, mon_an_id, ten_khach_hang, so_sao, nhan_xet, an_danh, trang_thai)
        VALUES (?, ?, ?, ?, ?, ?, 'da_duyet')
    `;
    const ketQua = ketNoiCoSoDuLieu.thucThi(sql, [
        phienBanId || null,
        monAnId || null,
        anDanh ? 'Khách hàng giấu tên' : (tenKhachHang || 'Khách hàng'),
        soSao,
        nhanXet || '',
        anDanh ? 1 : 0
    ]);
    return layTheoId(ketQua.lastInsertRowid);
}

function layTheoId(id) {
    const sql = `
        SELECT dg.*, m.ten_mon, pb.ma_phien
        FROM danh_gia dg
        LEFT JOIN mon_an m ON dg.mon_an_id = m.id
        LEFT JOIN phien_ban pb ON dg.phien_ban_id = pb.id
        WHERE dg.id = ?
    `;
    return ketNoiCoSoDuLieu.layMot(sql, [id]);
}

function layDanhSach({ chiTieuCuc, soSao, trangThai, gioiHan = 50 }) {
    let sql = `
        SELECT dg.*, m.ten_mon, pb.ma_phien
        FROM danh_gia dg
        LEFT JOIN mon_an m ON dg.mon_an_id = m.id
        LEFT JOIN phien_ban pb ON dg.phien_ban_id = pb.id
        WHERE 1=1
    `;
    const thamSo = [];

    if (chiTieuCuc === 'true' || chiTieuCuc === true) {
        sql += ` AND dg.so_sao <= 2`;
    } else if (soSao) {
        sql += ` AND dg.so_sao = ?`;
        thamSo.push(Number(soSao));
    }

    if (trangThai) {
        sql += ` AND dg.trang_thai = ?`;
        thamSo.push(trangThai);
    }

    sql += ` ORDER BY dg.thoi_gian_tao DESC LIMIT ?`;
    thamSo.push(gioiHan);

    return ketNoiCoSoDuLieu.layNhieu(sql, thamSo);
}

function layDiemTrungBinh() {
    const row = ketNoiCoSoDuLieu.layMot(`
        SELECT COUNT(id) AS tong_luot,
               COALESCE(AVG(so_sao), 0) AS diem_tb
        FROM danh_gia
        WHERE trang_thai != 'an'
    `);

    const phanBo = ketNoiCoSoDuLieu.layNhieu(`
        SELECT so_sao, COUNT(id) AS so_luong
        FROM danh_gia
        WHERE trang_thai != 'an'
        GROUP BY so_sao
        ORDER BY so_sao DESC
    `);

    return {
        tongLuotDanhGia: row ? row.tong_luot : 0,
        diemTrungBinh: row ? Number(Number(row.diem_tb).toFixed(1)) : 0,
        phanBo
    };
}

function capNhatPhanHoi(id, phanHoi) {
    const sql = `
        UPDATE danh_gia 
        SET phan_hoi_quan_ly = ?, thoi_gian_phan_hoi = datetime('now', 'localtime')
        WHERE id = ?
    `;
    ketNoiCoSoDuLieu.thucThi(sql, [phanHoi, id]);
    return layTheoId(id);
}

function doiTrangThai(id, trangThai) {
    const sql = `UPDATE danh_gia SET trang_thai = ? WHERE id = ?`;
    ketNoiCoSoDuLieu.thucThi(sql, [trangThai, id]);
    return layTheoId(id);
}

module.exports = {
    taoDanhGia,
    layTheoId,
    layDanhSach,
    layDiemTrungBinh,
    capNhatPhanHoi,
    doiTrangThai
};
