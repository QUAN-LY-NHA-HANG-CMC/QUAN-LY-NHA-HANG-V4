/**
 * Service xử lý nghiệp vụ Điều phối Bếp (KDS) & Kiểm soát Hết món
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');
const { phatSuKienBep, phatSuKienBan, phatSuKienThuNgan, phatToanHeThong } = require('../../cauHinh/cauHinhSocket.js');

async function layDonCho() {
    const sql = `
        SELECT ct.id, ct.don_goi_mon_id, ct.mon_an_id, ct.ten_mon, ct.so_luong, 
               ct.don_gia, ct.thanh_tien, ct.tuy_chon_chon, ct.ghi_chu_mon, ct.trang_thai,
               d.ban_an_id, d.lan_goi, d.thoi_gian_dat, b.ten_ban, b.ma_ban,
               ROUND((JULIANDAY('now') - JULIANDAY(d.thoi_gian_dat)) * 24 * 60) AS so_phut_cho
        FROM chi_tiet_don_mon ct
        JOIN don_goi_mon d ON ct.don_goi_mon_id = d.id
        JOIN ban_an b ON d.ban_an_id = b.id
        WHERE ct.trang_thai IN ('cho_xac_nhan', 'dang_che_bien')
        ORDER BY d.thoi_gian_dat ASC, ct.id ASC
    `;
    const danhSachCho = ketNoiCoSoDuLieu.layNhieu(sql);

    // Đánh dấu cảnh báo nếu chờ quá 15 phút
    danhSachCho.forEach(item => {
        item.canh_bao_qua_gio = (item.so_phut_cho || 0) >= 15;
    });

    return {
        danhSachCho,
        tongMonDangCho: danhSachCho.length
    };
}

async function gomMon() {
    const sql = `
        SELECT ct.mon_an_id, ct.ten_mon, SUM(ct.so_luong) AS tong_so_luong,
               COUNT(DISTINCT d.ban_an_id) AS so_ban_dat
        FROM chi_tiet_don_mon ct
        JOIN don_goi_mon d ON ct.don_goi_mon_id = d.id
        WHERE ct.trang_thai IN ('cho_xac_nhan', 'dang_che_bien')
        GROUP BY ct.mon_an_id, ct.ten_mon
        ORDER BY tong_so_luong DESC
    `;
    return ketNoiCoSoDuLieu.layNhieu(sql);
}

async function chuyenTrangThai(chiTietId, trangThaiMoi, nguoiThucHien = 'Bếp trưởng') {
    const cacTrangThaiHopLe = ['cho_xac_nhan', 'dang_che_bien', 'hoan_thanh', 'da_phuc_vu', 'tu_choi', 'da_huy'];
    if (!cacTrangThaiHopLe.includes(trangThaiMoi)) {
        throw new Error('Trạng thái món không hợp lệ');
    }

    const chiTiet = ketNoiCoSoDuLieu.layMot(`
        SELECT ct.*, d.ban_an_id, d.phien_ban_id, b.ten_ban
        FROM chi_tiet_don_mon ct
        JOIN don_goi_mon d ON ct.don_goi_mon_id = d.id
        JOIN ban_an b ON d.ban_an_id = b.id
        WHERE ct.id = ?
    `, [chiTietId]);

    if (!chiTiet) {
        throw new Error('Món ăn không tồn tại trong đơn');
    }

    const trangThaiCu = chiTiet.trang_thai;

    // Cập nhật trạng thái
    ketNoiCoSoDuLieu.thucThi(
        `UPDATE chi_tiet_don_mon SET trang_thai = ? WHERE id = ?`,
        [trangThaiMoi, chiTietId]
    );

    // Ghi nhật ký lịch sử
    ketNoiCoSoDuLieu.thucThi(`
        INSERT INTO lich_su_don_mon (don_goi_mon_id, chi_tiet_don_mon_id, trang_thai_cu, trang_thai_moi, nguoi_thuc_hien, ly_do)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [chiTiet.don_goi_mon_id, chiTietId, trangThaiCu, trangThaiMoi, nguoiThucHien, `Bếp đổi trạng thái sang ${trangThaiMoi}`]);

    const chiTietCapNhat = ketNoiCoSoDuLieu.layMot(`SELECT * FROM chi_tiet_don_mon WHERE id = ?`, [chiTietId]);

    // Bắn Socket Real-time
    phatSuKienBan(chiTiet.ban_an_id, 'cap_nhat_don_mon', {
        chiTietId,
        trangThai: trangThaiMoi,
        tenMon: chiTiet.ten_mon
    });

    if (trangThaiMoi === 'hoan_thanh') {
        // Thông báo cho Phục vụ & Thu ngân bưng món lên bàn
        phatSuKienThuNgan('mon_san_sang', {
            chiTietId,
            tenMon: chiTiet.ten_mon,
            soLuong: chiTiet.so_luong,
            tenBan: chiTiet.ten_ban,
            banAnId: chiTiet.ban_an_id
        });
        phatToanHeThong('mon_san_sang', {
            chiTietId,
            tenMon: chiTiet.ten_mon,
            soLuong: chiTiet.so_luong,
            tenBan: chiTiet.ten_ban,
            banAnId: chiTiet.ban_an_id
        });
    }

    return chiTietCapNhat;
}

async function toggleHetMon(monAnId) {
    const mon = ketNoiCoSoDuLieu.layMot(`SELECT id, ten_mon, trang_thai FROM mon_an WHERE id = ? AND da_xoa = 0`, [monAnId]);
    if (!mon) {
        throw new Error('Món ăn không tồn tại');
    }

    const trangThaiMoi = mon.trang_thai === 'dang_ban' ? 'tam_het' : 'dang_ban';
    ketNoiCoSoDuLieu.thucThi(`UPDATE mon_an SET trang_thai = ? WHERE id = ?`, [trangThaiMoi, monAnId]);

    // Phát socket cho toàn bộ hệ thống
    phatToanHeThong('cap_nhat_thuc_don', {
        monAnId,
        tenMon: mon.ten_mon,
        trangThai: trangThaiMoi
    });

    return {
        id: mon.id,
        ten_mon: mon.ten_mon,
        trang_thai: trangThaiMoi
    };
}

async function tuChoiMon(chiTietId, lyDo = 'Hết nguyên liệu chế biến') {
    const chiTiet = ketNoiCoSoDuLieu.layMot(`
        SELECT ct.*, d.ban_an_id, d.phien_ban_id, d.tong_tien_don, b.ten_ban
        FROM chi_tiet_don_mon ct
        JOIN don_goi_mon d ON ct.don_goi_mon_id = d.id
        JOIN ban_an b ON d.ban_an_id = b.id
        WHERE ct.id = ?
    `, [chiTietId]);

    if (!chiTiet) {
        throw new Error('Món ăn không tồn tại');
    }

    ketNoiCoSoDuLieu.chayGiaoDich((db) => {
        // Cập nhật trạng thái
        db.prepare(`UPDATE chi_tiet_don_mon SET trang_thai = 'tu_choi' WHERE id = ?`).run(chiTietId);

        // Giảm tiền đơn hàng
        const tongTienMoi = Math.max(0, (chiTiet.tong_tien_don || 0) - chiTiet.thanh_tien);
        db.prepare(`UPDATE don_goi_mon SET tong_tien_don = ? WHERE id = ?`).run(tongTienMoi, chiTiet.don_goi_mon_id);

        // Giảm tiền tạm tính phiên bàn
        const phien = db.prepare(`SELECT tong_tien_tam_tinh FROM phien_ban WHERE id = ?`).get(chiTiet.phien_ban_id);
        if (phien) {
            const tongPhienMoi = Math.max(0, (phien.tong_tien_tam_tinh || 0) - chiTiet.thanh_tien);
            db.prepare(`UPDATE phien_ban SET tong_tien_tam_tinh = ? WHERE id = ?`).run(tongPhienMoi, chiTiet.phien_ban_id);
        }

        // Ghi lịch sử
        db.prepare(`
            INSERT INTO lich_su_don_mon (don_goi_mon_id, chi_tiet_don_mon_id, trang_thai_cu, trang_thai_moi, nguoi_thuc_hien, ly_do)
            VALUES (?, ?, ?, 'tu_choi', 'Bếp', ?)
        `).run(chiTiet.don_goi_mon_id, chiTietId, chiTiet.trang_thai, lyDo);
    });

    // Phát socket
    phatSuKienBan(chiTiet.ban_an_id, 'bep_tu_choi_mon', {
        chiTietId,
        tenMon: chiTiet.ten_mon,
        lyDo
    });
    phatSuKienThuNgan('bep_tu_choi_mon', {
        chiTietId,
        tenBan: chiTiet.ten_ban,
        tenMon: chiTiet.ten_mon,
        lyDo
    });

    return { id: chiTietId, trang_thai: 'tu_choi', lyDo };
}

async function layLichSuBep() {
    const sql = `
        SELECT ct.id, ct.ten_mon, ct.so_luong, ct.thanh_tien, ct.tuy_chon_chon, ct.ghi_chu_mon,
               d.ban_an_id, b.ten_ban, ls.thoi_gian AS thoi_gian_hoan_thanh
        FROM chi_tiet_don_mon ct
        JOIN don_goi_mon d ON ct.don_goi_mon_id = d.id
        JOIN ban_an b ON d.ban_an_id = b.id
        JOIN lich_su_don_mon ls ON ls.chi_tiet_don_mon_id = ct.id AND ls.trang_thai_moi = 'hoan_thanh'
        ORDER BY ls.thoi_gian DESC LIMIT 50
    `;
    return ketNoiCoSoDuLieu.layNhieu(sql);
}

module.exports = {
    layDonCho,
    gomMon,
    chuyenTrangThai,
    toggleHetMon,
    tuChoiMon,
    layLichSuBep
};
