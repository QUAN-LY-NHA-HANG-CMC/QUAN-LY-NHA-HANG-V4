/**
 * Service xử lý thanh toán, VietQR và đóng phiên bàn
 * Phụ trách: Minh (Backend Developer)
 */
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');
const hoaDonService = require('../hoaDon/hoaDon.service.js');
const { phatSuKienBan, phatSuKienThuNgan, phatToanHeThong } = require('../../cauHinh/cauHinhSocket.js');

async function taoVietQr({ phienBanId, soTien, ghiChu }) {
    if (!phienBanId) {
        throw new Error('Mã phiên bàn không hợp lệ');
    }

    const phien = ketNoiCoSoDuLieu.layMot(`SELECT * FROM phien_ban WHERE id = ?`, [phienBanId]);
    if (!phien) {
        throw new Error('Phiên bàn không tồn tại');
    }

    const soTienThanhToan = Math.round(soTien || phien.tong_tien_tam_tinh || 0);
    const noiDung = ghiChu || `TT BAN PB${phienBanId}`;
    const maNganHang = 'MB'; // MBBank mặc định
    const soTaiKhoan = '0987654321';
    const chuTaiKhoan = 'NHA HANG QUAN MOC';

    const urlVietQr = `https://img.vietqr.io/image/${maNganHang}-${soTaiKhoan}-compact2.jpg?amount=${soTienThanhToan}&addInfo=${encodeURIComponent(noiDung)}&accountName=${encodeURIComponent(chuTaiKhoan)}`;

    return {
        phienBanId,
        soTien: soTienThanhToan,
        maNganHang,
        soTaiKhoan,
        chuTaiKhoan,
        noiDung,
        urlVietQr
    };
}

async function xacNhanThanhToan({ phienBanId, maKhuyenMai, phuongThuc = 'tien_mat', soTienKhachDua, maChuyenKhoan, nguoiThucHien = 'Thu ngân', ghiChu = '' }) {
    const phienBan = ketNoiCoSoDuLieu.layMot(`SELECT * FROM phien_ban WHERE id = ?`, [phienBanId]);
    if (!phienBan || !['dang_su_dung', 'cho_thanh_toan'].includes(phienBan.trang_thai)) {
        throw new Error('Phiên bàn không tồn tại hoặc đã thanh toán');
    }

    const hoaDonTamTinh = await hoaDonService.taoHoaDonTamTinh(phienBanId, maKhuyenMai);
    const banAnId = phienBan.ban_an_id;
    const tongThanhToan = hoaDonTamTinh.tongThanhToan;
    const khachDua = soTienKhachDua !== undefined && soTienKhachDua !== null ? Number(soTienKhachDua) : tongThanhToan;

    if (khachDua < tongThanhToan && phuongThuc === 'tien_mat') {
        throw new Error(`Số tiền khách đưa (${khachDua.toLocaleString('vi-VN')}đ) không đủ thanh toán tổng hóa đơn (${tongThanhToan.toLocaleString('vi-VN')}đ)`);
    }

    const tienThoiLai = Math.max(0, khachDua - tongThanhToan);
    const maHoaDon = `HD_${phienBanId}_${Date.now()}`;
    const maGiaoDich = `GD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let hoaDonLuu;
    let giaoDichLuu;

    // Transaction nguyên tử khép kín
    ketNoiCoSoDuLieu.chayGiaoDich((db) => {
        // 1. Lưu hóa đơn
        const stmtHd = db.prepare(`
            INSERT INTO hoa_don (
                ma_hoa_don, phien_ban_id, ban_an_id, tong_tien_mon, khuyen_mai_id,
                tien_giam_gia, ty_le_vat, tien_vat, phu_phi, tong_thanh_toan,
                phuong_thuc_thanh_toan, trang_thai, thoi_gian_tao, thoi_gian_thanh_toan, ghi_chu
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'da_thanh_toan', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
        `);
        const resHd = stmtHd.run(
            maHoaDon,
            phienBanId,
            banAnId,
            hoaDonTamTinh.tongTienMon,
            hoaDonTamTinh.khuyenMai ? hoaDonTamTinh.khuyenMai.khuyenMaiId : null,
            hoaDonTamTinh.tienGiamGia,
            hoaDonTamTinh.tyLeVat,
            hoaDonTamTinh.tienVat,
            hoaDonTamTinh.phuPhi,
            tongThanhToan,
            phuongThuc === 'chuyen_khoan_vietqr' ? 'chuyen_khoan' : phuongThuc,
            ghiChu || null
        );
        const hoaDonId = resHd.lastInsertRowid;

        // 2. Lưu từng chi tiết hóa đơn
        const stmtCt = db.prepare(`
            INSERT INTO chi_tiet_hoa_don (hoa_don_id, mon_an_id, ten_mon, so_luong, don_gia, thanh_tien, tuy_chon_chon)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const mon of hoaDonTamTinh.danhSachMon) {
            stmtCt.run(hoaDonId, mon.mon_an_id, mon.ten_mon, mon.so_luong, mon.don_gia, mon.thanh_tien, mon.tuy_chon_chon);
        }

        // 3. Lưu giao dịch thanh toán
        const stmtGd = db.prepare(`
            INSERT INTO giao_dich_thanh_toan (
                hoa_don_id, ma_giao_dich, phuong_thuc, so_tien_phai_tra,
                so_tien_khach_dua, tien_thoi_lai, ma_chuyen_khoan, trang_thai
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'thanh_cong')
        `);
        stmtGd.run(
            hoaDonId,
            maGiaoDich,
            phuongThuc,
            tongThanhToan,
            khachDua,
            tienThoiLai,
            maChuyenKhoan || null
        );

        // 4. Tăng lượt dùng mã khuyến mãi nếu có
        if (hoaDonTamTinh.khuyenMai) {
            db.prepare(`UPDATE khuyen_mai SET so_luot_dung = so_luot_dung + 1 WHERE id = ?`).run(hoaDonTamTinh.khuyenMai.khuyenMaiId);
        }

        // 5. Đóng phiên bàn
        db.prepare(`
            UPDATE phien_ban 
            SET trang_thai = 'da_thanh_toan', thoi_gian_ket_thuc = CURRENT_TIMESTAMP 
            WHERE id = ?
        `).run(phienBanId);

        // 6. Chuyển trạng thái bàn về 'trong'
        db.prepare(`UPDATE ban_an SET trang_thai = 'trong' WHERE id = ?`).run(banAnId);

        hoaDonLuu = db.prepare(`SELECT * FROM hoa_don WHERE id = ?`).get(hoaDonId);
        giaoDichLuu = db.prepare(`SELECT * FROM giao_dich_thanh_toan WHERE hoa_don_id = ?`).get(hoaDonId);
    });

    // Phát socket cho bàn, bếp, thu ngân
    phatSuKienBan(banAnId, 'thanh_toan_thanh_cong', {
        hoaDonId: hoaDonLuu.id,
        maHoaDon,
        tongThanhToan
    });

    phatToanHeThong('cap_nhat_ban', {
        banId: banAnId,
        trangThai: 'trong'
    });

    phatToanHeThong('thanh_toan_hoan_tat', {
        hoaDonId: hoaDonLuu.id,
        maHoaDon,
        banAnId,
        tongThanhToan
    });

    return {
        hoaDon: hoaDonLuu,
        giaoDich: giaoDichLuu
    };
}

module.exports = {
    taoVietQr,
    xacNhanThanhToan
};
