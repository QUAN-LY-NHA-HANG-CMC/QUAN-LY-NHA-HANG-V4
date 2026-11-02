/**
 * Service xử lý nghiệp vụ đặt món, transaction và cập nhật trạng thái
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const donGoiMonModel = require('./donGoiMon.model.js');
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');
const { phatSuKienBan, phatSuKienBep, phatSuKienThuNgan } = require('../../cauHinh/cauHinhSocket.js');

async function taoDonHang({ phienBanId, banAnId, ghiChu, danhSachMon }) {
    if (!phienBanId || !banAnId) {
        throw new Error('Thiếu thông tin phiên bàn hoặc bàn ăn');
    }
    if (!Array.isArray(danhSachMon) || danhSachMon.length === 0) {
        throw new Error('Danh sách món không được để trống');
    }

    // Kiểm tra phiên bàn
    const phienBan = ketNoiCoSoDuLieu.layMot('SELECT * FROM phien_ban WHERE id = ?', [phienBanId]);
    if (!phienBan || phienBan.trang_thai !== 'dang_su_dung') {
        throw new Error('Phiên bàn không tồn tại hoặc đã đóng');
    }

    // Tính tổng tiền đơn
    let tongTienDon = 0;
    for (const item of danhSachMon) {
        if (!item.soLuong || item.soLuong <= 0) {
            throw new Error(`Số lượng món không hợp lệ: ${item.tenMon || item.monAnId}`);
        }
        tongTienDon += (Number(item.donGia) || 0) * item.soLuong;
    }

    const maDon = `ORD_${banAnId}_${Date.now()}`;
    const soLanGoiHienTai = donGoiMonModel.demSoLanGoiCuaPhien(phienBanId);
    const lanGoi = soLanGoiHienTai + 1;

    let donGoiMonId = null;
    const danhSachChiTietDaLuu = [];

    // Chạy Transaction đảm bảo tính nguyên tử
    ketNoiCoSoDuLieu.chayGiaoDich((db) => {
        // 1. Tạo đơn đặt món
        const stmtDon = db.prepare(`
            INSERT INTO don_goi_mon (phien_ban_id, ban_an_id, ma_don, lan_goi, tong_tien_don, ghi_chu, trang_thai)
            VALUES (?, ?, ?, ?, ?, ?, 'cho_xac_nhan')
        `);
        const resDon = stmtDon.run(phienBanId, banAnId, maDon, lanGoi, tongTienDon, ghiChu || '');
        donGoiMonId = resDon.lastInsertRowid;

        // 2. Thêm từng món vào chi tiết đơn
        const stmtChiTiet = db.prepare(`
            INSERT INTO chi_tiet_don_mon (don_goi_mon_id, mon_an_id, ten_mon, so_luong, don_gia, thanh_tien, tuy_chon_chon, ghi_chu_mon, trang_thai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'cho_xac_nhan')
        `);

        for (const m of danhSachMon) {
            const thanhTien = (Number(m.donGia) || 0) * m.soLuong;
            const resCT = stmtChiTiet.run(
                donGoiMonId,
                m.monAnId,
                m.tenMon || 'Món ăn',
                m.soLuong,
                m.donGia,
                thanhTien,
                m.tuyChonChon ? JSON.stringify(m.tuyChonChon) : '',
                m.ghiChuMon || ''
            );
            danhSachChiTietDaLuu.push({
                id: resCT.lastInsertRowid,
                don_goi_mon_id: donGoiMonId,
                mon_an_id: m.monAnId,
                ten_mon: m.tenMon,
                so_luong: m.soLuong,
                don_gia: m.donGia,
                thanh_tien: thanhTien,
                tuy_chon_chon: m.tuyChonChon,
                ghi_chu_mon: m.ghiChuMon,
                trang_thai: 'cho_xac_nhan'
            });
        }

        // 3. Tích lũy tổng tiền phiên bàn
        const tongTienMoi = (phienBan.tong_tien_tam_tinh || 0) + tongTienDon;
        const stmtCapNhatPhien = db.prepare(`UPDATE phien_ban SET tong_tien_tam_tinh = ? WHERE id = ?`);
        stmtCapNhatPhien.run(tongTienMoi, phienBanId);

        // 4. Ghi lịch sử đơn
        const stmtLichSu = db.prepare(`
            INSERT INTO lich_su_don_mon (don_goi_mon_id, trang_thai_cu, trang_thai_moi, nguoi_thuc_hien, ly_do)
            VALUES (?, NULL, 'cho_xac_nhan', 'Khách hàng', 'Tạo đơn đặt món mới')
        `);
        stmtLichSu.run(donGoiMonId);
    });

    const donGoiMon = donGoiMonModel.timDonTheoId(donGoiMonId);

    // Phát sự kiện Socket Real-time tới Bếp và Bàn
    phatSuKienBep('don_mon_moi', {
        donGoiMon,
        danhSachMon: danhSachChiTietDaLuu,
        banAnId
    });

    phatSuKienBan(banAnId, 'don_mon_moi', {
        donGoiMon,
        danhSachMon: danhSachChiTietDaLuu
    });

    return {
        donGoiMon,
        danhSachMon: danhSachChiTietDaLuu
    };
}

async function huyMon({ chiTietId, lyDo, nguoiThucHien = 'Khách hàng' }) {
    const chiTiet = donGoiMonModel.timChiTietTheoId(chiTietId);
    if (!chiTiet) {
        throw new Error('Món ăn không tồn tại trong đơn hàng');
    }

    if (chiTiet.trang_thai !== 'cho_xac_nhan') {
        throw new Error('Không thể hủy món ăn đã tiếp nhận chế biến hoặc đã hoàn thành');
    }

    const donHang = donGoiMonModel.timDonTheoId(chiTiet.don_goi_mon_id);
    const phienBan = ketNoiCoSoDuLieu.layMot('SELECT * FROM phien_ban WHERE id = ?', [donHang.phien_ban_id]);

    ketNoiCoSoDuLieu.chayGiaoDich((db) => {
        // 1. Cập nhật trạng thái món sang da_huy
        const stmtHuy = db.prepare(`UPDATE chi_tiet_don_mon SET trang_thai = 'da_huy' WHERE id = ?`);
        stmtHuy.run(chiTietId);

        // 2. Trừ tiền khỏi đơn hàng
        const tongTienDonMoi = Math.max(0, (donHang.tong_tien_don || 0) - chiTiet.thanh_tien);
        const stmtDon = db.prepare(`UPDATE don_goi_mon SET tong_tien_don = ? WHERE id = ?`);
        stmtDon.run(tongTienDonMoi, donHang.id);

        // 3. Trừ tiền khỏi tổng tạm tính của phiên bàn
        if (phienBan) {
            const tongTienPhienMoi = Math.max(0, (phienBan.tong_tien_tam_tinh || 0) - chiTiet.thanh_tien);
            const stmtPhien = db.prepare(`UPDATE phien_ban SET tong_tien_tam_tinh = ? WHERE id = ?`);
            stmtPhien.run(tongTienPhienMoi, phienBan.id);
        }

        // 4. Ghi lịch sử
        const stmtLichSu = db.prepare(`
            INSERT INTO lich_su_don_mon (don_goi_mon_id, chi_tiet_don_mon_id, trang_thai_cu, trang_thai_moi, nguoi_thuc_hien, ly_do)
            VALUES (?, ?, 'cho_xac_nhan', 'da_huy', ?, ?)
        `);
        stmtLichSu.run(donHang.id, chiTietId, nguoiThucHien, lyDo || 'Hủy món');
    });

    const chiTietCapNhat = donGoiMonModel.timChiTietTheoId(chiTietId);

    // Phát Socket
    phatSuKienBep('huy_mon', { chiTietId, lyDo, banAnId: donHang.ban_an_id });
    phatSuKienBan(donHang.ban_an_id, 'huy_mon', { chiTietId, lyDo });

    return chiTietCapNhat;
}

async function layDonTheoBan(banId) {
    return donGoiMonModel.layDonMonTheoBan(banId);
}

module.exports = {
    taoDonHang,
    huyMon,
    layDonTheoBan
};
