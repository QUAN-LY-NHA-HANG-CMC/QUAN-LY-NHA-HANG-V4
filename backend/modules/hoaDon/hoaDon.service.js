/**
 * Service xử lý Bảng kê tạm tính & Hóa đơn thanh toán
 * Phụ trách: Minh (Backend Developer)
 */
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');
const khuyenMaiService = require('../khuyenMai/khuyenMai.service.js');

async function taoHoaDonTamTinh(phienBanId, maKhuyenMai = null) {
    const phienBan = ketNoiCoSoDuLieu.layMot(`
        SELECT pb.*, ba.ten_ban, ba.ma_ban, kv.ten_khu_vuc
        FROM phien_ban pb
        JOIN ban_an ba ON pb.ban_an_id = ba.id
        LEFT JOIN khu_vuc kv ON ba.khu_vuc_id = kv.id
        WHERE pb.id = ?
    `, [phienBanId]);

    if (!phienBan) {
        throw new Error('Phiên bàn không tồn tại');
    }

    // Lấy các món ăn hợp lệ (chưa bị hủy hoặc từ chối)
    const sqlMon = `
        SELECT ct.id, ct.mon_an_id, ct.ten_mon, ct.so_luong, ct.don_gia, ct.thanh_tien,
               ct.tuy_chon_chon, ct.ghi_chu_mon, ct.trang_thai, d.lan_goi
        FROM chi_tiet_don_mon ct
        JOIN don_goi_mon d ON ct.don_goi_mon_id = d.id
        WHERE d.phien_ban_id = ? AND ct.trang_thai NOT IN ('da_huy', 'tu_choi')
        ORDER BY d.lan_goi ASC, ct.id ASC
    `;
    const danhSachMon = ketNoiCoSoDuLieu.layNhieu(sqlMon, [phienBanId]);

    let tongTienMon = 0;
    for (const m of danhSachMon) {
        tongTienMon += m.thanh_tien;
    }

    // Tính khuyến mãi
    let khuyenMai = null;
    let tienGiamGia = 0;
    if (maKhuyenMai) {
        const kqKm = await khuyenMaiService.kiemTraMa(maKhuyenMai, tongTienMon);
        if (kqKm.hopLe) {
            khuyenMai = kqKm;
            tienGiamGia = kqKm.tienGiam;
        }
    }

    // Tính thuế VAT và tổng cộng
    const tienSauGiam = Math.max(0, tongTienMon - tienGiamGia);
    const tyLeVat = 10;
    const tienVat = Math.round((tienSauGiam * tyLeVat) / 100);
    const phuPhi = 0;
    const tongThanhToan = tienSauGiam + tienVat + phuPhi;

    return {
        phienBanId: phienBan.id,
        maPhien: phienBan.ma_phien,
        banAnId: phienBan.ban_an_id,
        tenBan: phienBan.ten_ban,
        maBan: phienBan.ma_ban,
        tenKhuVuc: phienBan.ten_khu_vuc,
        thoiGianBatDau: phienBan.thoi_gian_bat_dau,
        soKhach: phienBan.so_khach || 1,
        danhSachMon,
        tongTienMon,
        khuyenMai,
        tienGiamGia,
        tyLeVat,
        tienVat,
        phuPhi,
        tongThanhToan
    };
}

async function layLichSuHoaDon({ tuNgay, denNgay, banId } = {}) {
    let sql = `
        SELECT hd.*, b.ten_ban, b.ma_ban
        FROM hoa_don hd
        JOIN ban_an b ON hd.ban_an_id = b.id
        WHERE 1=1
    `;
    const thamSo = [];
    if (banId) {
        sql += ` AND hd.ban_an_id = ?`;
        thamSo.push(banId);
    }
    if (tuNgay) {
        sql += ` AND hd.thoi_gian_tao >= ?`;
        thamSo.push(tuNgay);
    }
    if (denNgay) {
        sql += ` AND hd.thoi_gian_tao <= ?`;
        thamSo.push(denNgay);
    }
    sql += ` ORDER BY hd.id DESC LIMIT 100`;
    return ketNoiCoSoDuLieu.layNhieu(sql, thamSo);
}

module.exports = {
    taoHoaDonTamTinh,
    layLichSuHoaDon
};
