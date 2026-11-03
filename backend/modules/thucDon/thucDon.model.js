const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

function layDanhSach({ danhMucId, tuKhoa, trangThai, laMonNoiBat, baoGomDaXoa = false, trang = 1, gioiHan = 50 } = {}) {
    let sql = `
        SELECT ma.*, dm.ten_danh_muc
        FROM mon_an ma
        JOIN danh_muc_mon dm ON ma.danh_muc_id = dm.id
        WHERE 1=1
    `;
    const thamSo = [];

    if (!baoGomDaXoa) {
        sql += ` AND ma.da_xoa = 0`;
    }

    if (danhMucId) {
        sql += ` AND ma.danh_muc_id = ?`;
        thamSo.push(Number(danhMucId));
    }

    if (trangThai) {
        sql += ` AND ma.trang_thai = ?`;
        thamSo.push(trangThai);
    }

    if (laMonNoiBat !== undefined) {
        sql += ` AND ma.la_mon_noi_bat = ?`;
        thamSo.push(Number(laMonNoiBat));
    }

    if (tuKhoa && tuKhoa.trim()) {
        sql += ` AND (ma.ten_mon LIKE ? OR ma.ma_mon LIKE ?)`;
        const tuKhoaLike = `%${tuKhoa.trim()}%`;
        thamSo.push(tuKhoaLike, tuKhoaLike);
    }

    const sqlDem = `SELECT COUNT(*) as tongSo FROM (${sql})`;
    const tongSo = (ketNoiCoSoDuLieu.layMot(sqlDem, thamSo) || {}).tongSo || 0;

    sql += ` ORDER BY ma.la_mon_noi_bat DESC, ma.id ASC LIMIT ? OFFSET ?`;
    const offset = (Number(trang) - 1) * Number(gioiHan);
    thamSo.push(Number(gioiHan), offset);

    const danhSach = ketNoiCoSoDuLieu.layNhieu(sql, thamSo);

    return {
        danhSach,
        tongSo,
        trang: Number(trang),
        gioiHan: Number(gioiHan)
    };
}

function layTheoId(id, { baoGomDaXoa = false } = {}) {
    let sql = `
        SELECT ma.*, dm.ten_danh_muc
        FROM mon_an ma
        JOIN danh_muc_mon dm ON ma.danh_muc_id = dm.id
        WHERE ma.id = ?
    `;
    if (!baoGomDaXoa) {
        sql += ` AND ma.da_xoa = 0`;
    }
    return ketNoiCoSoDuLieu.layMot(sql, [id]);
}

function layTheoMaMon(maMon) {
    return ketNoiCoSoDuLieu.layMot('SELECT * FROM mon_an WHERE ma_mon = ? AND da_xoa = 0', [maMon]);
}

function layTheoDanhMucId(danhMucId) {
    return ketNoiCoSoDuLieu.layNhieu('SELECT * FROM mon_an WHERE danh_muc_id = ? AND da_xoa = 0', [danhMucId]);
}

function taoMonAn({ danhMucId, maMon, tenMon, moTa, giaBan, donViTinh, hinhAnh, laMonNoiBat }) {
    const sql = `
        INSERT INTO mon_an (danh_muc_id, ma_mon, ten_mon, mo_ta, gia_ban, don_vi_tinh, hinh_anh, la_mon_noi_bat, trang_thai, da_xoa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'dang_ban', 0)
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [
        danhMucId,
        maMon,
        tenMon,
        moTa || '',
        giaBan,
        donViTinh || 'Phần',
        hinhAnh || null,
        laMonNoiBat ? 1 : 0
    ]);
}

function capNhatMonAn(id, { danhMucId, tenMon, moTa, giaBan, donViTinh, hinhAnh, laMonNoiBat }) {
    const sql = `
        UPDATE mon_an
        SET danh_muc_id = ?, ten_mon = ?, mo_ta = ?, gia_ban = ?, don_vi_tinh = ?, 
            hinh_anh = COALESCE(?, hinh_anh), la_mon_noi_bat = ?, ngay_cap_nhat = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [
        danhMucId,
        tenMon,
        moTa,
        giaBan,
        donViTinh,
        hinhAnh,
        laMonNoiBat ? 1 : 0,
        id
    ]);
}

function doiTrangThai(id, trangThai) {
    const sql = `UPDATE mon_an SET trang_thai = ?, ngay_cap_nhat = CURRENT_TIMESTAMP WHERE id = ?`;
    return ketNoiCoSoDuLieu.thucThi(sql, [trangThai, id]);
}

function xoaMem(id) {
    const sql = `UPDATE mon_an SET da_xoa = 1, ngay_cap_nhat = CURRENT_TIMESTAMP WHERE id = ?`;
    return ketNoiCoSoDuLieu.thucThi(sql, [id]);
}

// Tùy chọn món ăn
function layTuyChonTheoMonId(monAnId) {
    return ketNoiCoSoDuLieu.layNhieu('SELECT * FROM tuy_chon_mon WHERE mon_an_id = ? ORDER BY id ASC', [monAnId]);
}

function xoaTuyChon(monAnId) {
    return ketNoiCoSoDuLieu.thucThi('DELETE FROM tuy_chon_mon WHERE mon_an_id = ?', [monAnId]);
}

function taoTuyChon(monAnId, { loaiTuyChon, tenTuyChon, giaThem, batBuoc }) {
    const sql = `
        INSERT INTO tuy_chon_mon (mon_an_id, loai_tuy_chon, ten_tuy_chon, gia_them, bat_buoc)
        VALUES (?, ?, ?, ?, ?)
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [monAnId, loaiTuyChon, tenTuyChon, giaThem || 0, batBuoc ? 1 : 0]);
}

module.exports = {
    layDanhSach,
    layTheoId,
    layTheoMaMon,
    layTheoDanhMucId,
    taoMonAn,
    capNhatMonAn,
    doiTrangThai,
    xoaMem,
    layTuyChonTheoMonId,
    xoaTuyChon,
    taoTuyChon
};
