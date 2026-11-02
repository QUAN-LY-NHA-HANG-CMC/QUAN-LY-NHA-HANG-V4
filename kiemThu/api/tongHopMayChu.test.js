const test = require('node:test');
const assert = require('node:assert/strict');
const ketNoiCoSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu.js');

test.before(async () => {
    await ketNoiCoSoDuLieu.khoiTaoCoSoDuLieu();
});

test('Nghiệp vụ Cấu hình Nhà hàng và Nhật ký hệ thống', async () => {
    const cauHinhService = require('../../backend/modules/cauHinhNhaHang/cauHinhNhaHang.service.js');
    
    // Lấy cấu hình quán
    const cauHinh = await cauHinhService.layToanBoCauHinh();
    assert.ok(cauHinh.ten_nha_hang, 'Phải có tên nhà hàng');
    assert.ok(cauHinh.ty_le_thue_vat, 'Phải có tỷ lệ thuế VAT');

    // Cập nhật cấu hình
    const giaTriMoi = 'Quán Mộc - ' + Date.now();
    await cauHinhService.capNhatCauHinh({
        ten_nha_hang: giaTriMoi,
        ty_le_thue_vat: '10'
    });

    const cauHinhMoi = await cauHinhService.layToanBoCauHinh();
    assert.strictEqual(cauHinhMoi.ten_nha_hang, giaTriMoi);
    assert.strictEqual(cauHinhMoi.ty_le_thue_vat, '10');

    // Ghi và đọc nhật ký
    await cauHinhService.ghiNhatKy(1, 'TEST_LOG', 'Thử nghiệm ghi nhật ký hệ thống', '127.0.0.1');
    const danhSachNhatKy = await cauHinhService.layNhatKyHeThong();
    assert.ok(danhSachNhatKy.length > 0);
    assert.strictEqual(danhSachNhatKy[0].hanh_dong, 'TEST_LOG');
});

test('Khởi tạo ứng dụng Express và định tuyến', () => {
    const app = require('../../backend/ungDung.js');
    assert.ok(app, 'App Express phải được khởi tạo');
});
