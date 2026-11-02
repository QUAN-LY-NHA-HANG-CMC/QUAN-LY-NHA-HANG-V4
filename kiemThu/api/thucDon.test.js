const test = require('node:test');
const assert = require('node:assert/strict');
const ketNoiCoSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu.js');

test.before(async () => {
    await ketNoiCoSoDuLieu.khoiTaoCoSoDuLieu();
});

test('Quản lý danh mục món ăn (CRUD)', async () => {
    const danhMucService = require('../../backend/modules/danhMucMon/danhMucMon.service.js');
    
    // Thêm danh mục mới
    const danhMucMoi = await danhMucService.taoDanhMuc({
        tenDanhMuc: 'Món Chay Thanh Đạm',
        moTa: 'Các món thuần chay tự nhiên',
        thuTuHienThi: 5
    });
    assert.ok(danhMucMoi.id);
    assert.strictEqual(danhMucMoi.ten_danh_muc, 'Món Chay Thanh Đạm');

    // Cập nhật danh mục
    const danhMucCapNhat = await danhMucService.capNhatDanhMuc(danhMucMoi.id, {
        tenDanhMuc: 'Món Chay Quán Mộc',
        moTa: 'Cập nhật mô tả',
        thuTuHienThi: 6,
        trangThai: 'hien_thi'
    });
    assert.strictEqual(danhMucCapNhat.ten_danh_muc, 'Món Chay Quán Mộc');

    // Lấy danh sách danh mục
    const danhSach = await danhMucService.layDanhSach();
    assert.ok(danhSach.length >= 5);
});

test('Quản lý thực đơn món ăn (CRUD, validation, toggle, xóa mềm)', async () => {
    const thucDonService = require('../../backend/modules/thucDon/thucDon.service.js');

    // Thêm món mới hợp lệ
    const monMoi = await thucDonService.taoMonAn({
        danhMucId: 1,
        maMon: 'KV99',
        tenMon: 'Salad Rong Nho Sốt Mè',
        giaBan: 55000,
        donViTinh: 'Đĩa',
        moTa: 'Rong nho tươi giòn rụm',
        laMonNoiBat: 1,
        tuyChon: [
            { loaiTuyChon: 'topping', tenTuyChon: 'Thêm Sốt Mè', giaThem: 10000, batBuoc: 0 }
        ]
    });
    assert.ok(monMoi.id);
    assert.strictEqual(monMoi.ma_mon, 'KV99');
    assert.strictEqual(monMoi.trang_thai, 'dang_ban');
    assert.strictEqual(monMoi.tuyChon.length, 1);

    // Kiểm tra validation: giá bán âm phải bị từ chối
    await assert.rejects(
        async () => {
            await thucDonService.taoMonAn({
                danhMucId: 1,
                maMon: 'KV100',
                tenMon: 'Món Lỗi Giá',
                giaBan: -50000
            });
        },
        (loi) => {
            assert.strictEqual(loi.status, 400);
            return true;
        }
    );

    // Toggle nhanh trạng thái sang "Tạm hết"
    await thucDonService.doiTrangThai(monMoi.id, 'tam_het');
    const monTamHet = await thucDonService.layTheoId(monMoi.id);
    assert.strictEqual(monTamHet.trang_thai, 'tam_het');

    // Xóa mềm món ăn
    await thucDonService.xoaMemMonAn(monMoi.id);
    const monDaXoa = await thucDonService.layTheoId(monMoi.id, { baoGomDaXoa: true });
    assert.strictEqual(monDaXoa.da_xoa, 1);

    // Món đã xóa mềm không xuất hiện trong danh sách hiển thị
    const danhSach = await thucDonService.layDanhSach({ tuKhoa: 'Salad Rong Nho' });
    assert.strictEqual(danhSach.danhSach.length, 0);
});
