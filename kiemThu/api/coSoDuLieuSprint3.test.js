const test = require('node:test');
const assert = require('node:assert/strict');
const ketNoiCoSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu.js');

test.before(async () => {
    await ketNoiCoSoDuLieu.khoiTaoCoSoDuLieu();
});

test('Kiểm tra bảng CSDL Sprint 3 tồn tại và dữ liệu mẫu', () => {
    // 1. Bảng khuyen_mai
    const khuyenMai = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM khuyen_mai');
    assert.ok(Array.isArray(khuyenMai), 'Bảng khuyen_mai phải tồn tại');
    assert.ok(khuyenMai.length >= 3, 'Phải có ít nhất 3 mã khuyến mãi mẫu');

    // 2. Bảng hoa_don
    const hoaDon = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM hoa_don');
    assert.ok(Array.isArray(hoaDon), 'Bảng hoa_don phải tồn tại');

    // 3. Bảng chi_tiet_hoa_don
    const chiTiet = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM chi_tiet_hoa_don');
    assert.ok(Array.isArray(chiTiet), 'Bảng chi_tiet_hoa_don phải tồn tại');

    // 4. Bảng giao_dich_thanh_toan
    const giaoDich = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM giao_dich_thanh_toan');
    assert.ok(Array.isArray(giaoDich), 'Bảng giao_dich_thanh_toan phải tồn tại');

    // 5. Bảng lich_su_chuyen_ghep_ban
    const chuyenBan = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM lich_su_chuyen_ghep_ban');
    assert.ok(Array.isArray(chuyenBan), 'Bảng lich_su_chuyen_ghep_ban phải tồn tại');

    // 6. Bảng yeu_cau_huy_tra_mon
    const huyTra = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM yeu_cau_huy_tra_mon');
    assert.ok(Array.isArray(huyTra), 'Bảng yeu_cau_huy_tra_mon phải tồn tại');
});

test('Kiểm tra Transaction chuyển bàn và ghi nhật ký nguyên tử', () => {
    const maPhien = 'PB_CHUYEN_' + Date.now();
    const resPhien = ketNoiCoSoDuLieu.thucThi(
        `INSERT INTO phien_ban (ban_an_id, ma_phien, trang_thai, tong_tien_tam_tinh) VALUES (1, ?, 'dang_su_dung', 200000)`,
        [maPhien]
    );
    const phienId = resPhien.lastInsertRowid;

    // Chuyển từ Bàn 1 sang Bàn 4 (bàn trống)
    ketNoiCoSoDuLieu.chayGiaoDich((db) => {
        // Cập nhật phiên bàn sang bàn 4
        db.prepare(`UPDATE phien_ban SET ban_an_id = 4 WHERE id = ?`).run(phienId);
        // Cập nhật trạng thái bàn 1 thành 'trong'
        db.prepare(`UPDATE ban_an SET trang_thai = 'trong' WHERE id = 1`).run();
        // Cập nhật trạng thái bàn 4 thành 'dang_dung'
        db.prepare(`UPDATE ban_an SET trang_thai = 'dang_dung' WHERE id = 4`).run();
        // Ghi nhật ký chuyển bàn
        db.prepare(`
            INSERT INTO lich_su_chuyen_ghep_ban (loai_thao_tac, ban_nguon_id, ban_dich_id, phien_ban_nguon_id, ly_do)
            VALUES ('chuyen_ban', 1, 4, ?, 'Khách đổi sang bàn rộng hơn')
        `).run(phienId);
    });

    const phienMoi = ketNoiCoSoDuLieu.layMot('SELECT * FROM phien_ban WHERE id = ?', [phienId]);
    assert.strictEqual(phienMoi.ban_an_id, 4, 'Phiên bàn phải thuộc về bàn 4');

    const lichSu = ketNoiCoSoDuLieu.layMot('SELECT * FROM lich_su_chuyen_ghep_ban WHERE phien_ban_nguon_id = ?', [phienId]);
    assert.ok(lichSu, 'Phải có lịch sử chuyển bàn');
    assert.strictEqual(lichSu.ban_dich_id, 4);
});

test('Kiểm tra Transaction thanh toán hóa đơn và đóng phiên phục vụ bàn', () => {
    const maPhien = 'PB_PAY_' + Date.now();
    const resPhien = ketNoiCoSoDuLieu.thucThi(
        `INSERT INTO phien_ban (ban_an_id, ma_phien, trang_thai, tong_tien_tam_tinh) VALUES (5, ?, 'cho_thanh_toan', 300000)`,
        [maPhien]
    );
    const phienId = resPhien.lastInsertRowid;
    const maHD = 'HD_' + Date.now();

    // Thanh toán nguyên tử
    ketNoiCoSoDuLieu.chayGiaoDich((db) => {
        // 1. Tạo hóa đơn
        const resHD = db.prepare(`
            INSERT INTO hoa_don (ma_hoa_don, phien_ban_id, ban_an_id, tong_tien_mon, tien_giam_gia, tien_vat, tong_thanh_toan, phuong_thuc_thanh_toan, trang_thai, thoi_gian_thanh_toan)
            VALUES (?, ?, 5, 300000, 30000, 27000, 297000, 'tien_mat', 'da_thanh_toan', CURRENT_TIMESTAMP)
        `).run(maHD, phienId);
        const hoaDonId = resHD.lastInsertRowid;

        // 2. Ghi nhận giao dịch thanh toán
        db.prepare(`
            INSERT INTO giao_dich_thanh_toan (hoa_don_id, ma_giao_dich, phuong_thuc, so_tien_phai_tra, so_tien_khach_dua, tien_thoi_lai, trang_thai)
            VALUES (?, ?, 'tien_mat', 297000, 300000, 3000, 'thanh_cong')
        `).run(hoaDonId, 'GD_' + Date.now());

        // 3. Đóng phiên bàn
        db.prepare(`UPDATE phien_ban SET trang_thai = 'da_thanh_toan', thoi_gian_ket_thuc = CURRENT_TIMESTAMP WHERE id = ?`).run(phienId);

        // 4. Giải phóng bàn về trạng thái trống
        db.prepare(`UPDATE ban_an SET trang_thai = 'trong' WHERE id = 5`).run();
    });

    const hoaDon = ketNoiCoSoDuLieu.layMot('SELECT * FROM hoa_don WHERE ma_hoa_don = ?', [maHD]);
    assert.ok(hoaDon, 'Hóa đơn phải được tạo');
    assert.strictEqual(hoaDon.tong_thanh_toan, 297000);
    assert.strictEqual(hoaDon.trang_thai, 'da_thanh_toan');

    const phienBan = ketNoiCoSoDuLieu.layMot('SELECT * FROM phien_ban WHERE id = ?', [phienId]);
    assert.strictEqual(phienBan.trang_thai, 'da_thanh_toan');

    const banAn = ketNoiCoSoDuLieu.layMot('SELECT * FROM ban_an WHERE id = 5');
    assert.strictEqual(banAn.trang_thai, 'trong');
});
