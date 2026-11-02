const test = require('node:test');
const assert = require('node:assert/strict');
const ketNoiCoSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu.js');

test('Kiểm tra bảng CSDL Sprint 4 tồn tại và dữ liệu mẫu (Phát - DB)', async (t) => {
    await ketNoiCoSoDuLieu.khoiTaoCoSoDuLieu();

    await t.test('Bảng danh_gia, ca_lam_viec, phien_ca_thu_ngan, phieu_thu_chi phải tồn tại', () => {
        const bang = ketNoiCoSoDuLieu.layNhieu(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name IN ('danh_gia', 'ca_lam_viec', 'phien_ca_thu_ngan', 'phieu_thu_chi')
        `);
        const danhSachTen = bang.map(b => b.name);
        assert.ok(danhSachTen.includes('danh_gia'), 'Bảng danh_gia phải tồn tại');
        assert.ok(danhSachTen.includes('ca_lam_viec'), 'Bảng ca_lam_viec phải tồn tại');
        assert.ok(danhSachTen.includes('phien_ca_thu_ngan'), 'Bảng phien_ca_thu_ngan phải tồn tại');
        assert.ok(danhSachTen.includes('phieu_thu_chi'), 'Bảng phieu_thu_chi phải tồn tại');
    });

    await t.test('Dữ liệu ca làm việc mẫu và ràng buộc đánh giá sao', () => {
        const cacCa = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM ca_lam_viec');
        assert.ok(cacCa.length >= 3, 'Phải có ít nhất 3 ca làm việc chuẩn');
        const maCa = cacCa.map(c => c.ma_ca);
        assert.ok(maCa.includes('CA_SANG'), 'Phải có ca sáng');
        assert.ok(maCa.includes('CA_CHIEU'), 'Phải có ca chiều');

        const danhGia = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM danh_gia');
        assert.ok(danhGia.length >= 2, 'Phải có đánh giá mẫu từ khách hàng');

        // Thử chèn đánh giá vượt quá 5 sao -> phải thất bại vì ràng buộc CHECK
        assert.throws(() => {
            ketNoiCoSoDuLieu.thucThi(`
                INSERT INTO danh_gia (so_sao, nhan_xet) VALUES (10, 'Quá tuyệt vời')
            `);
        }, /CHECK constraint failed/);
    });

    await t.test('Kiểm tra các chỉ mục Aggregation phục vụ Dashboard thống kê', () => {
        const chiMuc = ketNoiCoSoDuLieu.layNhieu(`
            SELECT name FROM sqlite_master 
            WHERE type='index' AND name IN ('idx_hoa_don_thoi_gian_tao', 'idx_danh_gia_so_sao', 'idx_phien_ca_nhan_vien')
        `);
        const danhSachIndex = chiMuc.map(i => i.name);
        assert.ok(danhSachIndex.includes('idx_hoa_don_thoi_gian_tao'), 'Index ngày tạo hóa đơn phải tồn tại');
        assert.ok(danhSachIndex.includes('idx_danh_gia_so_sao'), 'Index số sao đánh giá phải tồn tại');
    });
});
