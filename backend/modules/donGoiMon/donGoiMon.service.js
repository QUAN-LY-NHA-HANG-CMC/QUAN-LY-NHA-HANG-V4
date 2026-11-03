/**
 * Service xử lý đặt món, hủy món & đồng bộ trạng thái đơn
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const donGoiMonModel = require('./donGoiMon.model.js');
const phienBanModel = require('../phienBan/phienBan.model.js');
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');
const { phatSuKienBep, phatSuKienBan, phatSuKienThuNgan, phatToanHeThong } = require('../../cauHinh/cauHinhSocket.js');

async function taoDonHang({ phienBanId, banAnId, danhSachMon, ghiChu }) {
    if (!banAnId || !phienBanId || !danhSachMon || !Array.isArray(danhSachMon) || danhSachMon.length === 0) {
        throw new Error('Dữ liệu đơn hàng không hợp lệ');
    }

    // Xác thực phiên bàn còn hoạt động
    const phienBan = phienBanModel.timTheoId(phienBanId);
    if (!phienBan || phienBan.trang_thai !== 'dang_su_dung') {
        throw new Error('Phiên bàn đã kết thúc hoặc không tồn tại');
    }

    // Đếm số lần gọi món của phiên này để gán lan_goi
    const soLanHienTai = ketNoiCoSoDuLieu.layMot(
        `SELECT COUNT(*) AS so_lan FROM don_goi_mon WHERE phien_ban_id = ?`,
        [phienBanId]
    );
    const lanGoi = (soLanHienTai ? soLanHienTai.so_lan : 0) + 1;

    // Tính tổng tiền đơn hàng
    let tongTienDon = 0;
    const danhSachChiTiet = [];

    for (const item of danhSachMon) {
        const monAn = ketNoiCoSoDuLieu.layMot(
            `SELECT id, ten_mon, gia_ban, trang_thai FROM mon_an WHERE id = ? AND da_xoa = 0`,
            [item.monAnId]
        );

        if (!monAn) {
            throw new Error(`Món ăn ID ${item.monAnId} không tồn tại`);
        }
        if (monAn.trang_thai === 'tam_het') {
            throw new Error(`Món "${monAn.ten_mon}" hiện tại đang tạm hết`);
        }

        const soLuong = item.soLuong && item.soLuong > 0 ? item.soLuong : 1;
        const donGia = item.donGia !== undefined && item.donGia !== null ? Number(item.donGia) : (monAn.gia_ban || 0);
        const thanhTien = donGia * soLuong;
        tongTienDon += thanhTien;

        danhSachChiTiet.push({
            monAnId: monAn.id,
            tenMon: item.tenMon || monAn.ten_mon,
            soLuong,
            donGia,
            thanhTien,
            tuyChonChon: item.tuyChonChon ? JSON.stringify(item.tuyChonChon) : null,
            ghiChuMon: item.ghiChuMon || null
        });
    }

    let donHangTao;

    // Thực hiện trong một Transaction nguyên tử
    ketNoiCoSoDuLieu.chayGiaoDich((db) => {
        // 1. Lưu bản ghi don_goi_mon
        const maDon = `DON_${phienBanId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const stmtDon = db.prepare(`
            INSERT INTO don_goi_mon (phien_ban_id, ban_an_id, ma_don, lan_goi, ghi_chu, tong_tien_don, trang_thai)
            VALUES (?, ?, ?, ?, ?, ?, 'cho_xac_nhan')
        `);
        const resDon = stmtDon.run(phienBanId, banAnId, maDon, lanGoi, ghiChu || null, tongTienDon);
        const donHangId = resDon.lastInsertRowid;

        // 2. Lưu từng chi tiết món và ghi lịch sử
        const stmtChiTiet = db.prepare(`
            INSERT INTO chi_tiet_don_mon (don_goi_mon_id, mon_an_id, ten_mon, so_luong, don_gia, thanh_tien, tuy_chon_chon, ghi_chu_mon, trang_thai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'cho_xac_nhan')
        `);

        const stmtLichSu = db.prepare(`
            INSERT INTO lich_su_don_mon (don_goi_mon_id, chi_tiet_don_mon_id, trang_thai_cu, trang_thai_moi, nguoi_thuc_hien, ly_do)
            VALUES (?, ?, NULL, 'cho_xac_nhan', 'Khách hàng', 'Đặt món từ E-Menu QR')
        `);

        for (const ct of danhSachChiTiet) {
            const resCt = stmtChiTiet.run(
                donHangId,
                ct.monAnId,
                ct.tenMon,
                ct.soLuong,
                ct.donGia,
                ct.thanhTien,
                ct.tuyChonChon,
                ct.ghiChuMon
            );
            stmtLichSu.run(donHangId, resCt.lastInsertRowid);
        }

        // 3. Cập nhật tổng tiền tạm tính của phiên bàn
        const tongTienTamTinhMoi = (phienBan.tong_tien_tam_tinh || 0) + tongTienDon;
        const stmtPhien = db.prepare(`
            UPDATE phien_ban SET tong_tien_tam_tinh = ? WHERE id = ?
        `);
        stmtPhien.run(tongTienTamTinhMoi, phienBanId);

        donHangTao = donGoiMonModel.timTheoId(donHangId);
        donHangTao.chiTiet = donGoiMonModel.layChiTietTheoDonId(donHangId);
    });

    // Phát Real-time qua WebSocket
    phatSuKienBep('don_mon_moi', {
        donHang: donHangTao,
        banAnId,
        lanGoi
    });

    phatSuKienThuNgan('don_mon_moi', {
        donHang: donHangTao,
        banAnId,
        lanGoi
    });

    phatSuKienBan(banAnId, 'don_mon_moi', {
        donHang: donHangTao
    });

    return {
        ...donHangTao,
        donGoiMon: donHangTao,
        danhSachMon: donHangTao.chiTiet
    };
}

async function huyMon(chiTietId, lyDo, nguoiThucHien = 'Khách hàng') {
    const chiTiet = donGoiMonModel.timChiTietTheoId(chiTietId);
    if (!chiTiet) {
        throw new Error('Món ăn không tồn tại trong đơn');
    }

    if (chiTiet.trang_thai !== 'cho_xac_nhan') {
        throw new Error('Chỉ có thể hủy món khi bếp chưa bắt đầu chế biến');
    }

    const donHang = donGoiMonModel.timDonTheoId(chiTiet.don_goi_mon_id);
    const phienBan = donHang ? phienBanModel.timTheoId(donHang.phien_ban_id) : null;

    ketNoiCoSoDuLieu.chayGiaoDich((db) => {
        // 1. Cập nhật trạng thái chi tiết món sang da_huy
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

async function danhDauDaPhucVu(chiTietId, nguoiThucHien = 'Phục vụ') {
    const chiTiet = donGoiMonModel.timChiTietTheoId(chiTietId);
    if (!chiTiet) {
        throw new Error('Món ăn không tồn tại trong đơn');
    }

    const donHang = donGoiMonModel.timDonTheoId(chiTiet.don_goi_mon_id);

    ketNoiCoSoDuLieu.chayGiaoDich((db) => {
        db.prepare(`UPDATE chi_tiet_don_mon SET trang_thai = 'da_phuc_vu' WHERE id = ?`).run(chiTietId);
        db.prepare(`
            INSERT INTO lich_su_don_mon (don_goi_mon_id, chi_tiet_don_mon_id, trang_thai_cu, trang_thai_moi, nguoi_thuc_hien, ly_do)
            VALUES (?, ?, ?, 'da_phuc_vu', ?, 'Đã bưng món lên bàn')
        `).run(chiTiet.don_goi_mon_id, chiTietId, chiTiet.trang_thai, nguoiThucHien);
    });

    const capNhat = donGoiMonModel.timChiTietTheoId(chiTietId);

    if (donHang) {
        phatSuKienBan(donHang.ban_an_id, 'cap_nhat_don_mon', { chiTietId, trangThai: 'da_phuc_vu' });
        phatToanHeThong('mon_da_phuc_vu', { chiTietId, banAnId: donHang.ban_an_id });
    }

    return capNhat;
}

async function layDonTheoBan(banId) {
    return donGoiMonModel.layDonMonTheoBan(banId);
}

module.exports = {
    taoDonHang,
    huyMon,
    danhDauDaPhucVu,
    layDonTheoBan
};
