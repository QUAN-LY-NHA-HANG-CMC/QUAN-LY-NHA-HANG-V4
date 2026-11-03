const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Task 5: Kiểm tra mã nguồn Frontend của Quân (E-Menu gọi món & Chờ thanh toán VietQR)', () => {
    // 1. E-Menu QR: phải có ảnh món ăn, tag đặc sản/bán chạy và giỏ hàng nổi
    const fileMenu = fs.readFileSync(path.resolve(__dirname, '../../frontend/trang/thucDonQr/thucDonQr.js'), 'utf8');
    assert.match(fileMenu, /hinh_anh|tepTaiLen/, 'E-Menu phải hiển thị hình ảnh món ăn');
    assert.match(fileMenu, /emenu-gio-hang-noi|gio-hang-noi/, 'E-Menu phải có thanh giỏ hàng nổi chân trang');
    assert.match(fileMenu, /onerror.*mac_dinh\.svg/, 'Phải có cơ chế fallback ảnh mặc định khi lỗi');

    // 2. Theo dõi đơn & Chờ thanh toán: phải hiển thị mã VietQR tại bàn khi bấm thanh toán
    const fileTheoDoi = fs.readFileSync(path.resolve(__dirname, '../../frontend/trang/theoDoiDonMon/theoDoiDonMon.js'), 'utf8');
    assert.match(fileTheoDoi, /vietqr|api\.vietqr\.io|qr_url|Napas/, 'Màn hình chờ thanh toán phải hiển thị mã Napas VietQR tại bàn cho khách');
    assert.match(fileTheoDoi, /cho_thanh_toan|Chờ thanh toán/, 'Phải hiển thị trạng thái chờ thanh toán rõ ràng');

    // 3. Đánh giá quản trị: phải tích hợp mẫu phản hồi nhanh
    const fileDanhGia = fs.readFileSync(path.resolve(__dirname, '../../frontend/trang/danhGia/danhGia.js'), 'utf8');
    assert.match(fileDanhGia, /mau-phan-hoi|mauPhanHoi/, 'Trang đánh giá phải gọi API mẫu phản hồi nhanh');
});
