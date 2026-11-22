// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MODEL DỮ LIỆU THỰC ĐƠN, MÓN ĂN & DANH MỤC (FIGMA C02, C03, K04)
// ============================================================================

const { truyVanNhieu, truyVanMot, thucThi } = require('../../cauHinh/ketNoiCoSoDuLieu');

const thucDonModel = {
    coDanhMucHoatDong(id) {
        return Boolean(truyVanMot('SELECT id FROM danh_muc_mon WHERE id=? AND kich_hoat=1', [id]));
    },

    taoDanhMuc(ma, ten) {
        const ketQua = thucThi('INSERT INTO danh_muc_mon (ma_danh_muc,ten_danh_muc) VALUES (?,?) ON CONFLICT(ma_danh_muc) DO NOTHING', [ma, ten]);
        return ketQua.changes ? truyVanMot('SELECT * FROM danh_muc_mon WHERE id=?', [ketQua.lastInsertRowid]) : null;
    },

    layDanhSachDanhMuc() {
        const sql = `
            SELECT id, ma_danh_muc, ten_danh_muc, thu_tu_hien_thi
            FROM danh_muc_mon
            WHERE kich_hoat = 1
            ORDER BY thu_tu_hien_thi ASC;
        `;
        return truyVanNhieu(sql);
    },

    layDanhSachMonAn({ danhMucId = null, tuKhoa = null, chiLayConMon = false } = {}) {
        let sql = `
            SELECT m.id, m.ma_mon, m.ten_mon, m.don_gia, m.don_vi_tinh,
                   m.anh_mon_an, m.mo_ta, m.con_mon, m.la_combo, m.la_ban_chay, m.la_goi_y,
                   m.so_suat_con_lai,
                   dm.id as danh_muc_id, dm.ten_danh_muc, dm.ma_danh_muc
            FROM mon_an m
            JOIN danh_muc_mon dm ON m.danh_muc_id = dm.id
            WHERE m.kich_hoat = 1
        `;
        const params = [];

        if (danhMucId) {
            sql += ` AND m.danh_muc_id = ?`;
            params.push(danhMucId);
        }

        if (chiLayConMon) {
            sql += ` AND m.con_mon = 1`;
        }

        if (tuKhoa && tuKhoa.trim()) {
            sql += ` AND (m.ten_mon LIKE ? OR m.ma_mon LIKE ? OR m.mo_ta LIKE ?)`;
            const keyword = `%${tuKhoa.trim()}%`;
            params.push(keyword, keyword, keyword);
        }

        sql += ` ORDER BY m.la_ban_chay DESC, m.la_goi_y DESC, m.id ASC;`;
        return truyVanNhieu(sql, params);
    },

    timTheoId(id) {
        const sql = `
            SELECT m.*, dm.ten_danh_muc, dm.ma_danh_muc
            FROM mon_an m
            JOIN danh_muc_mon dm ON m.danh_muc_id = dm.id
            WHERE m.id = ?;
        `;
        return truyVanMot(sql, [id]);
    },

    layChiTietCombo(comboId) {
        const sql = `
            SELECT cct.so_luong, m.id as mon_an_id, m.ma_mon, m.ten_mon, m.don_gia, m.don_vi_tinh, m.anh_mon_an
            FROM combo_chi_tiet cct
            JOIN mon_an m ON cct.mon_an_le_id = m.id
            WHERE cct.combo_id = ?;
        `;
        return truyVanNhieu(sql, [comboId]);
    },

    capNhatConMon(id, conMon) {
        const sql = `
            UPDATE mon_an 
            SET con_mon = ?, 
                so_suat_con_lai = CASE WHEN ? = 0 THEN 0 ELSE so_suat_con_lai END,
                ngay_cap_nhat = CURRENT_TIMESTAMP 
            WHERE id = ?;
        `;
        const giaTriCon = conMon ? 1 : 0;
        return thucThi(sql, [giaTriCon, giaTriCon, id]);
    },

    capNhatSoSuat(id, soSuatConLai) {
        let giaTriSuat = null;
        let conMon = 1;

        if (soSuatConLai !== null && soSuatConLai !== undefined && soSuatConLai !== '') {
            giaTriSuat = Math.max(0, parseInt(soSuatConLai, 10));
            if (giaTriSuat === 0) {
                conMon = 0;
            }
        }

        const sql = `
            UPDATE mon_an
            SET so_suat_con_lai = ?,
                con_mon = ?,
                ngay_cap_nhat = CURRENT_TIMESTAMP
            WHERE id = ?;
        `;
        thucThi(sql, [giaTriSuat, conMon, id]);
        return this.timTheoId(id);
    },

    taoMonAn({ danhMucId, maMon, tenMon, donGia, donViTinh = 'phan', anhMonAn = null, moTa = null, laCombo = 0, soSuatConLai = null }) {
        let giaTriSuat = null;
        let conMon = 1;
        if (soSuatConLai !== null && soSuatConLai !== undefined && soSuatConLai !== '') {
            giaTriSuat = Math.max(0, parseInt(soSuatConLai, 10));
            if (giaTriSuat === 0) conMon = 0;
        }

        const sql = `
            INSERT INTO mon_an (
                danh_muc_id, ma_mon, ten_mon, don_gia, don_vi_tinh,
                anh_mon_an, mo_ta, con_mon, la_combo, so_suat_con_lai, kich_hoat
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);
        `;
        const res = thucThi(sql, [
            danhMucId,
            maMon,
            tenMon,
            donGia,
            donViTinh,
            anhMonAn,
            moTa,
            conMon,
            laCombo ? 1 : 0,
            giaTriSuat
        ]);
        return this.timTheoId(Number(res.lastInsertRowid));
    },

    capNhatMonAn(id, { danhMucId, maMon, tenMon, donGia, donViTinh, anhMonAn, moTa, laCombo, conMon, soSuatConLai }) {
        const mon = this.timTheoId(id);
        if (!mon) return null;

        let giaTriSuat = mon.so_suat_con_lai;
        let giaTriConMon = mon.con_mon;

        if (soSuatConLai !== undefined) {
            if (soSuatConLai === null || soSuatConLai === '') {
                giaTriSuat = null;
            } else {
                giaTriSuat = Math.max(0, parseInt(soSuatConLai, 10));
                if (giaTriSuat === 0) giaTriConMon = 0;
                else if (conMon === undefined && mon.con_mon === 0) giaTriConMon = 1;
            }
        }

        if (conMon !== undefined) {
            giaTriConMon = conMon ? 1 : 0;
            if (giaTriConMon === 0 && giaTriSuat !== null) giaTriSuat = 0;
        }

        const sql = `
            UPDATE mon_an
            SET danh_muc_id = COALESCE(?, danh_muc_id),
                ma_mon = COALESCE(?, ma_mon),
                ten_mon = COALESCE(?, ten_mon),
                don_gia = COALESCE(?, don_gia),
                don_vi_tinh = COALESCE(?, don_vi_tinh),
                anh_mon_an = CASE WHEN ? THEN ? ELSE anh_mon_an END,
                mo_ta = COALESCE(?, mo_ta),
                la_combo = COALESCE(?, la_combo),
                con_mon = ?,
                so_suat_con_lai = ?,
                ngay_cap_nhat = CURRENT_TIMESTAMP
            WHERE id = ?;
        `;
        thucThi(sql, [
            danhMucId || null,
            maMon || null,
            tenMon || null,
            donGia !== undefined ? Number(donGia) : null,
            donViTinh || null,
            Number(anhMonAn !== undefined),
            typeof anhMonAn === 'string' ? (anhMonAn.trim() || null) : null,
            moTa !== undefined ? moTa : null,
            laCombo !== undefined ? (laCombo ? 1 : 0) : null,
            giaTriConMon,
            giaTriSuat,
            id
        ]);
        return this.timTheoId(id);
    },

    xoaMonAn(id) {
        // Soft delete bằng cách tắt kích hoạt để bảo toàn tính toàn vẹn khóa ngoại hóa đơn
        const sql = `UPDATE mon_an SET kich_hoat = 0, ngay_cap_nhat = CURRENT_TIMESTAMP WHERE id = ?;`;
        return thucThi(sql, [id]);
    }
};

module.exports = thucDonModel;
