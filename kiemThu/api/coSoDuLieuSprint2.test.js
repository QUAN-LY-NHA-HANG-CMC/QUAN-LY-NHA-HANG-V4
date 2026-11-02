const test = require('node:test');
const assert = require('node:assert/strict');
const ketNoiCoSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu.js');

test.before(async () => {
    await ketNoiCoSoDuLieu.khoiTaoCoSoDuLieu();
});

test('Kiểm tra bảng CSDL Sprint 2 tồn tại và truy vấn được', () => {
    // Kiểm tra bảng phien_ban
    const phienBan = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM phien_ban');
    assert.ok(Array.isArray(phienBan), 'Bảng phien_ban phải tồn tại');

    // Kiểm tra bảng don_goi_mon
    const donGoiMon = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM don_goi_mon');
    assert.ok(Array.isArray(donGoiMon), 'Bảng don_goi_mon phải tồn tại');

    // Kiểm tra bảng chi_tiet_don_mon
    const chiTietDon = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM chi_tiet_don_mon');
    assert.ok(Array.isArray(chiTietDon), 'Bảng chi_tiet_don_mon phải tồn tại');

    // Kiểm tra bảng yeu_cau_ho_tro
    const hoTro = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM yeu_cau_ho_tro');
    assert.ok(Array.isArray(hoTro), 'Bảng yeu_cau_ho_tro phải tồn tại');
});

test('Kiểm tra Database Transaction khi tạo đơn gọi món', () => {
    const maPhien = 'PB_TEST_' + Date.now();
    const maDon = 'ORD_TEST_' + Date.now();

    // 1. Tạo phiên bàn thử nghiệm
    const ketQuaPhien = ketNoiCoSoDuLieu.thucThi(`
        INSERT INTO phien_ban (ban_an_id, ma_phien, thoi_gian_bat_dau, trang_thai, tong_tien_tam_tinh)
        VALUES (1, ?, CURRENT_TIMESTAMP, 'dang_su_dung', 0)
    `, [maPhien]);
    const phienBanId = ketQuaPhien.lastInsertRowid;

    // 2. Chạy Transaction tạo đơn hàng và chi tiết
    ketNoiCoSoDuLieu.chayGiaoDich((db) => {
        const stmtDon = db.prepare(`
            INSERT INTO don_goi_mon (phien_ban_id, ban_an_id, ma_don, lan_goi, tong_tien_don, trang_thai)
            VALUES (?, 1, ?, 1, 100000, 'cho_xac_nhan')
        `);
        const resDon = stmtDon.run(phienBanId, maDon);
        const donId = resDon.lastInsertRowid;

        const stmtChiTiet = db.prepare(`
            INSERT INTO chi_tiet_don_mon (don_goi_mon_id, mon_an_id, ten_mon, so_luong, don_gia, thanh_tien, trang_thai)
            VALUES (?, 1, 'Bò tơ cuốn', 2, 50000, 100000, 'cho_xac_nhan')
        `);
        stmtChiTiet.run(donId);
    });

    // 3. Kiểm tra dữ liệu đã ghi nhận chuẩn xác
    const donVuaTao = ketNoiCoSoDuLieu.layMot('SELECT * FROM don_goi_mon WHERE ma_don = ?', [maDon]);
    assert.ok(donVuaTao, 'Đơn hàng phải được ghi nhận trong CSDL');
    assert.strictEqual(donVuaTao.tong_tien_don, 100000);

    const chiTiet = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM chi_tiet_don_mon WHERE don_goi_mon_id = ?', [donVuaTao.id]);
    assert.strictEqual(chiTiet.length, 1);
    assert.strictEqual(chiTiet[0].so_luong, 2);
});
