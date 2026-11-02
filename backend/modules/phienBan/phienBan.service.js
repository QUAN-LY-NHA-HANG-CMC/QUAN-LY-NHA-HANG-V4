/**
 * Service xử lý nghiệp vụ Phiên bàn phục vụ
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const phienBanModel = require('./phienBan.model.js');
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

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
    }

    return {
        phienBan,
        banAn
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
    layChiTietPhien
};
