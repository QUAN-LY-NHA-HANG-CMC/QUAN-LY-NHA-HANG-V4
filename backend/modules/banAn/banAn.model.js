// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MODEL DỮ LIỆU PHÒNG BÀN VÀ PHÂN VÙNG KHU VỰC
// ============================================================================

const { randomUUID } = require('node:crypto');
const { truyVanNhieu, truyVanMot, thucThi } = require('../../cauHinh/ketNoiCoSoDuLieu');

const banAnModel = {
    layDanhSach(khuVucId = null) {
        let sql = `
            SELECT b.id, b.ma_ban, b.ten_ban, b.suc_chua, b.trang_thai,
                   b.ma_qr_token, b.tu_dong_duyet_mon, b.kich_hoat,
                   k.id as khu_vuc_id, k.ten_khu_vuc, k.ma_khu_vuc,
                   pb.id as phien_ban_id, pb.ma_phien, pb.so_luong_khach, pb.thoi_gian_bat_dau,
                   (
                       SELECT COUNT(*) 
                       FROM chi_tiet_don_mon ctdm
                       JOIN don_goi_mon dgm ON ctdm.don_goi_mon_id = dgm.id
                       WHERE dgm.phien_ban_id = pb.id AND ctdm.trang_thai_mon IN ('cho_duyet', 'dang_nau')
                   ) as so_mon_cho_nau,
                   (SELECT COUNT(*) FROM yeu_cau_huy_mon_khach h
                        JOIN chi_tiet_don_mon ct ON ct.id = h.chi_tiet_don_mon_id
                        JOIN don_goi_mon d ON d.id = ct.don_goi_mon_id
                        WHERE d.phien_ban_id = pb.id AND h.trang_thai = 'cho_phuc_vu') AS so_huy_mon_khach,
                   (
                       SELECT COALESCE(SUM(hd.tong_tien_thanh_toan), 0)
                       FROM hoa_don hd
                       WHERE hd.phien_ban_id = pb.id AND hd.trang_thai = 'chua_thanh_toan'
                   ) as tong_tien_tam_tinh
            FROM ban_an b
            JOIN khu_vuc k ON b.khu_vuc_id = k.id
            LEFT JOIN phien_ban pb ON pb.ban_an_id = b.id AND pb.trang_thai = 'dang_hoat_dong'
            WHERE b.kich_hoat = 1
        `;
        const params = [];
        if (khuVucId) {
            sql += ` AND b.khu_vuc_id = ?`;
            params.push(khuVucId);
        }
        sql += ` ORDER BY k.thu_tu_hien_thi ASC, b.ma_ban ASC;`;
        return truyVanNhieu(sql, params);
    },

    timTheoId(id) {
        const sql = `
            SELECT b.*, k.ten_khu_vuc, k.ma_khu_vuc
            FROM ban_an b
            JOIN khu_vuc k ON b.khu_vuc_id = k.id
            WHERE b.id = ?;
        `;
        return truyVanMot(sql, [id]);
    },

    timTheoQrToken(token) {
        const sql = `
            SELECT b.id, b.ma_ban, b.ten_ban, b.suc_chua, b.trang_thai, b.kich_hoat, b.tu_dong_duyet_mon,
                   b.ma_qr_token, b.ma_qr_token as qr_token,
                   k.id as khu_vuc_id, k.ten_khu_vuc,
                   pb.id as phien_ban_id, pb.ma_phien, pb.so_luong_khach, pb.thoi_gian_bat_dau
            FROM ban_an b
            JOIN khu_vuc k ON b.khu_vuc_id = k.id
            LEFT JOIN phien_ban pb ON pb.ban_an_id = b.id AND pb.trang_thai = 'dang_hoat_dong'
            WHERE b.ma_qr_token = ? AND b.kich_hoat = 1;
        `;
        return truyVanMot(sql, [token]);
    },

    layPhienBanHienTai(banId) {
        const sql = `
            SELECT * FROM phien_ban 
            WHERE ban_an_id = ? AND trang_thai = 'dang_hoat_dong'
            ORDER BY ngay_tao DESC LIMIT 1;
        `;
        return truyVanMot(sql, [banId]);
    },

    capNhatTrangThai(id, trangThai) {
        const sql = `
            UPDATE ban_an 
            SET trang_thai = ?, ngay_cap_nhat = CURRENT_TIMESTAMP 
            WHERE id = ?;
        `;
        return thucThi(sql, [trangThai, id]);
    },

    layDanhSachKhuVuc() {
        const sql = `
            SELECT * FROM khu_vuc 
            WHERE kich_hoat = 1 
            ORDER BY thu_tu_hien_thi ASC;
        `;
        return truyVanNhieu(sql);
    },

    taoKhuVuc(ma, ten) {
        const ketQua = thucThi('INSERT INTO khu_vuc (ma_khu_vuc,ten_khu_vuc) VALUES (?,?) ON CONFLICT(ma_khu_vuc) DO NOTHING', [ma, ten]);
        return ketQua.changes ? truyVanMot('SELECT * FROM khu_vuc WHERE id=?', [ketQua.lastInsertRowid]) : null;
    },

    capNhatThongTin(id, { tenBan, maBan, khuVucId, sucChua, tuDongDuyetMon, kichHoat = 1 }) {
        const sql = `
            UPDATE ban_an 
            SET ten_ban = COALESCE(?, ten_ban),
                ma_ban = COALESCE(?, ma_ban),
                khu_vuc_id = COALESCE(?, khu_vuc_id),
                suc_chua = COALESCE(?, suc_chua),
                tu_dong_duyet_mon = COALESCE(?, tu_dong_duyet_mon),
                kich_hoat = COALESCE(?, kich_hoat),
                ngay_cap_nhat = CURRENT_TIMESTAMP
            WHERE id = ?;
        `;
        return thucThi(sql, [tenBan, maBan, khuVucId, sucChua, tuDongDuyetMon, kichHoat, id]);
    },

    taoBan({ maBan, tenBan, khuVucId, sucChua = 4, maQrToken, tuDongDuyetMon = 0 }) {
        const token = randomUUID();
        const sql = `
            INSERT INTO ban_an (khu_vuc_id, ma_ban, ten_ban, suc_chua, trang_thai, ma_qr_token, tu_dong_duyet_mon, kich_hoat)
            VALUES (?, ?, ?, ?, 'trong', ?, ?, 1);
        `;
        const res = thucThi(sql, [khuVucId, maBan, tenBan, sucChua, token, tuDongDuyetMon]);
        return {
            id: res.lastInsertRowid,
            maBan,
            tenBan,
            khuVucId,
            sucChua,
            maQrToken: token,
            tuDongDuyetMon
        };
    },

    xoaBan(id) {
        // Vô hiệu hóa bàn ăn (soft delete) để bảo toàn tính toàn vẹn các hóa đơn cũ
        const sql = `
            UPDATE ban_an 
            SET kich_hoat = 0, ngay_cap_nhat = CURRENT_TIMESTAMP 
            WHERE id = ?;
        `;
        return thucThi(sql, [id]);
    }
};

module.exports = banAnModel;
