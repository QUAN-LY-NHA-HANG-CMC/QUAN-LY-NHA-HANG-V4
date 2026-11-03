/**
 * Service xử lý nghiệp vụ Phiên bàn phục vụ
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const phienBanModel = require('./phienBan.model.js');
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');
const { phatToanHeThong } = require('../../cauHinh/cauHinhSocket.js');

async function xacThucQrVaMoPhien({ banId, maDinhDanhQr }) {
    if (!banId) {
        throw new Error('Mã bàn không hợp lệ');
    }

    const banAn = ketNoiCoSoDuLieu.layMot('SELECT * FROM ban_an WHERE id = ?', [banId]);
    if (!banAn) {
        throw new Error('Bàn ăn không tồn tại hoặc đã ngừng hoạt động');
    }

    // Kiểm tra xem bàn đã có phiên đang hoạt động chưa
    let phienBan = phienBanModel.timPhienDangHoatDongTheoBanId(banId);

    if (!phienBan) {
        // Tạo phiên bàn mới
        const maPhien = `PB_${banId}_${Date.now()}`;
        phienBan = phienBanModel.taoPhienBan({ banAnId: banId, maPhien });

        // Cập nhật trạng thái bàn sang "đang dùng"
        ketNoiCoSoDuLieu.thucThi(
            `UPDATE ban_an SET trang_thai = 'dang_dung' WHERE id = ?`,
            [banId]
        );

        phatToanHeThong('cap_nhat_ban', { banId, trangThai: 'dang_dung' });
    }

    return {
        phienBan,
        banAn
    };
}

async function moBanTrucTiep({ banId, soKhach = 1, ghiChu = '' }) {
    if (!banId) {
        throw new Error('Mã bàn không hợp lệ');
    }

    const banAn = ketNoiCoSoDuLieu.layMot('SELECT * FROM ban_an WHERE id = ?', [banId]);
    if (!banAn) {
        throw new Error('Bàn ăn không tồn tại');
    }

    let phienBan = phienBanModel.timPhienDangHoatDongTheoBanId(banId);
    if (!phienBan) {
        const maPhien = `PB_${banId}_${Date.now()}`;
        ketNoiCoSoDuLieu.chayGiaoDich((db) => {
            const res = db.prepare(`
                INSERT INTO phien_ban (ban_an_id, ma_phien, thoi_gian_bat_dau, trang_thai, tong_tien_tam_tinh, so_khach, ghi_chu)
                VALUES (?, ?, CURRENT_TIMESTAMP, 'dang_su_dung', 0, ?, ?)
            `).run(banId, maPhien, soKhach, ghiChu);
            phienBan = phienBanModel.timTheoId(res.lastInsertRowid);
            db.prepare(`UPDATE ban_an SET trang_thai = 'dang_dung' WHERE id = ?`).run(banId);
        });

        phatToanHeThong('cap_nhat_ban', { banId, trangThai: 'dang_dung' });
    }

    return {
        phienBan,
        banAn
    };
}

async function chuyenBan({ phienBanId, banDichId, lyDo = 'Khách yêu cầu đổi bàn', nguoiThucHien = 'Phục vụ' }) {
    const phienBan = ketNoiCoSoDuLieu.layMot('SELECT * FROM phien_ban WHERE id = ?', [phienBanId]);
    if (!phienBan || !['dang_su_dung', 'cho_thanh_toan'].includes(phienBan.trang_thai)) {
        throw new Error('Phiên bàn không tồn tại hoặc đã kết thúc');
    }

    const banGocId = phienBan.ban_an_id;
    if (banGocId === banDichId) {
        throw new Error('Bàn đích trùng với bàn hiện tại');
    }

    const banDich = ketNoiCoSoDuLieu.layMot('SELECT * FROM ban_an WHERE id = ?', [banDichId]);
    if (!banDich) {
        throw new Error('Bàn đích không tồn tại');
    }
    if (banDich.trang_thai !== 'trong') {
        throw new Error('Bàn đích đang có khách, vui lòng chọn bàn trống hoặc sử dụng tính năng Ghép bàn');
    }

    ketNoiCoSoDuLieu.chayGiaoDich((db) => {
        // Cập nhật phiên bàn sang bàn đích
        db.prepare('UPDATE phien_ban SET ban_an_id = ? WHERE id = ?').run(banDichId, phienBanId);

        // Cập nhật các đơn đặt món thuộc phiên này
        db.prepare('UPDATE don_goi_mon SET ban_an_id = ? WHERE phien_ban_id = ?').run(banDichId, phienBanId);

        // Đổi trạng thái bàn
        db.prepare("UPDATE ban_an SET trang_thai = 'trong' WHERE id = ?").run(banGocId);
        db.prepare("UPDATE ban_an SET trang_thai = 'dang_dung' WHERE id = ?").run(banDichId);

        // Ghi nhật ký chuyển bàn
        db.prepare(`
            INSERT INTO lich_su_chuyen_ghep_ban (loai_thao_tac, ban_nguon_id, ban_dich_id, phien_ban_nguon_id, ly_do, nguoi_thuc_hien)
            VALUES ('chuyen_ban', ?, ?, ?, ?, ?)
        `).run(banGocId, banDichId, phienBanId, lyDo, nguoiThucHien);
    });

    phatToanHeThong('chuyen_ban', {
        phienBanId,
        banGocId,
        banDichId,
        lyDo
    });

    return {
        phienBanId,
        banGocId,
        banDichId
    };
}

async function ghepBan({ phienBanNguonId, phienBanDichId, lyDo = 'Khách yêu cầu ghép bàn', nguoiThucHien = 'Phục vụ' }) {
    if (phienBanNguonId === phienBanDichId) {
        throw new Error('Không thể ghép một phiên với chính nó');
    }

    const phienNguon = ketNoiCoSoDuLieu.layMot('SELECT * FROM phien_ban WHERE id = ?', [phienBanNguonId]);
    const phienDich = ketNoiCoSoDuLieu.layMot('SELECT * FROM phien_ban WHERE id = ?', [phienBanDichId]);

    if (!phienNguon || !['dang_su_dung', 'cho_thanh_toan'].includes(phienNguon.trang_thai)) {
        throw new Error('Phiên nguồn không tồn tại hoặc không ở trạng thái mở');
    }
    if (!phienDich || !['dang_su_dung', 'cho_thanh_toan'].includes(phienDich.trang_thai)) {
        throw new Error('Phiên đích không tồn tại hoặc không ở trạng thái mở');
    }

    const banNguonId = phienNguon.ban_an_id;
    const banDichId = phienDich.ban_an_id;

    ketNoiCoSoDuLieu.chayGiaoDich((db) => {
        // Tìm số lần gọi lớn nhất ở bàn đích
        const maxLanQuery = db.prepare('SELECT COALESCE(MAX(lan_goi), 0) AS max_lan FROM don_goi_mon WHERE phien_ban_id = ?').get(phienBanDichId);
        const maxLan = maxLanQuery ? maxLanQuery.max_lan : 0;

        // Chuyển toàn bộ đơn đặt món từ phiên nguồn sang phiên đích
        db.prepare(`
            UPDATE don_goi_mon 
            SET phien_ban_id = ?, ban_an_id = ?, lan_goi = lan_goi + ?
            WHERE phien_ban_id = ?
        `).run(phienBanDichId, banDichId, maxLan, phienBanNguonId);

        // Tính tổng tiền và số khách mới
        const tongTien = (phienDich.tong_tien_tam_tinh || 0) + (phienNguon.tong_tien_tam_tinh || 0);
        const soKhach = (phienDich.so_khach || 1) + (phienNguon.so_khach || 1);

        db.prepare('UPDATE phien_ban SET tong_tien_tam_tinh = ?, so_khach = ? WHERE id = ?').run(tongTien, soKhach, phienBanDichId);

        // Đóng phiên nguồn
        db.prepare(`
            UPDATE phien_ban 
            SET trang_thai = 'da_huy', thoi_gian_ket_thuc = CURRENT_TIMESTAMP, ghi_chu = ?
            WHERE id = ?
        `).run(`Đã ghép vào phiên #${phienBanDichId}`, phienBanNguonId);

        // Giải phóng bàn nguồn
        db.prepare("UPDATE ban_an SET trang_thai = 'trong' WHERE id = ?").run(banNguonId);

        // Ghi nhật ký ghép bàn
        db.prepare(`
            INSERT INTO lich_su_chuyen_ghep_ban (loai_thao_tac, ban_nguon_id, ban_dich_id, phien_ban_nguon_id, phien_ban_dich_id, ly_do, nguoi_thuc_hien)
            VALUES ('ghep_ban', ?, ?, ?, ?, ?, ?)
        `).run(banNguonId, banDichId, phienBanNguonId, phienBanDichId, lyDo, nguoiThucHien);
    });

    phatToanHeThong('ghep_ban', {
        phienBanNguonId,
        phienBanDichId,
        banNguonId,
        banDichId,
        lyDo
    });

    return {
        phienBanNguonId,
        phienBanDichId,
        banNguonId,
        banDichId
    };
}

async function layChiTietPhien(maPhien) {
    const phienBan = phienBanModel.timTheoMaPhien(maPhien);
    if (!phienBan) {
        throw new Error('Phiên bàn không tồn tại');
    }

    const danhSachDon = ketNoiCoSoDuLieu.layNhieu(
        `SELECT * FROM don_goi_mon WHERE phien_ban_id = ? ORDER BY lan_goi ASC, id ASC`,
        [phienBan.id]
    );

    for (const don of danhSachDon) {
        don.chiTiet = ketNoiCoSoDuLieu.layNhieu(
            `SELECT * FROM chi_tiet_don_mon WHERE don_goi_mon_id = ?`,
            [don.id]
        );
    }

    return {
        ...phienBan,
        danhSachDon
    };
}

module.exports = {
    xacThucQrVaMoPhien,
    moBanTrucTiep,
    chuyenBan,
    ghepBan,
    layChiTietPhien
};
