const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../../backend/ungDung.js');
const ketNoiCoSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu.js');

let server;
let diaChi;

test.before(async () => {
    await ketNoiCoSoDuLieu.khoiTaoCoSoDuLieu();
    server = http.createServer(app);
    await new Promise((resolve) => {
        server.listen(0, () => {
            diaChi = `http://localhost:${server.address().port}`;
            resolve();
        });
    });
});

test.after(async () => {
    if (server) {
        if (server.closeAllConnections) server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
    }
});

test('Khuyến mãi: Kiểm tra mã hợp lệ và tính tiền giảm giá', async () => {
    // Mã KM10: Giảm 10% đơn từ 200k, tối đa 50k
    const res = await fetch(`${diaChi}/api/khuyen-mai/kiem-tra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maKhuyenMai: 'KM10', tongTien: 300000 })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.data.hopLe, true);
    assert.strictEqual(body.data.tienGiam, 30000); // 10% của 300k
});

test('Hóa đơn: Lấy bảng kê tạm tính và tính toán VAT', async () => {
    // Mở bàn 5 và đặt món
    ketNoiCoSoDuLieu.thucThi(`UPDATE phien_ban SET trang_thai = 'da_huy' WHERE ban_an_id = 5`);
    ketNoiCoSoDuLieu.thucThi(`UPDATE ban_an SET trang_thai = 'trong' WHERE id = 5`);

    const resMoBan = await fetch(`${diaChi}/api/phien-ban/mo-ban-truc-tiep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banId: 5, soKhach: 2 })
    });
    const bodyMoBan = await resMoBan.json();
    const phienBanId = bodyMoBan.data.phienBan.id;

    // Đặt món 1 (65k) và món 2 (45k x 3 = 135k) -> tổng món 200k
    await fetch(`${diaChi}/api/don-goi-mon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            phienBanId,
            banAnId: 5,
            danhSachMon: [
                { monAnId: 1, soLuong: 1 },
                { monAnId: 2, soLuong: 3 }
            ]
        })
    });

    // Lấy hóa đơn tạm tính có áp dụng mã KM10
    const resTamTinh = await fetch(`${diaChi}/api/hoa-don/tam-tinh/${phienBanId}?maKhuyenMai=KM10`);
    assert.strictEqual(resTamTinh.status, 200);
    const bodyTamTinh = await resTamTinh.json();
    assert.strictEqual(bodyTamTinh.ok, true);
    const { tongTienMon, tienGiamGia, tienVat, tongThanhToan } = bodyTamTinh.data;

    assert.strictEqual(tongTienMon, 200000);
    assert.strictEqual(tienGiamGia, 20000); // 10% của 200k
    // Sau giảm giá: 180,000; VAT 10%: 18,000; Tổng thanh toán: 198,000
    assert.strictEqual(tienVat, 18000);
    assert.strictEqual(tongThanhToan, 198000);
});

test('Thanh toán: Tạo Napas VietQR và Hoàn tất thanh toán tiền mặt', async () => {
    // Lấy phiên bàn 5 đang mở
    const phien = ketNoiCoSoDuLieu.layMot(`SELECT id FROM phien_ban WHERE ban_an_id = 5 AND trang_thai = 'dang_su_dung'`);
    assert.ok(phien);
    const phienBanId = phien.id;

    // 1. Tạo liên kết VietQR động
    const resQr = await fetch(`${diaChi}/api/thanh-toan/vietqr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phienBanId, soTien: 198000 })
    });
    assert.strictEqual(resQr.status, 200);
    const bodyQr = await resQr.json();
    assert.strictEqual(bodyQr.ok, true);
    assert.ok(bodyQr.data.urlVietQr.includes('vietqr.io'));

    // 2. Xác nhận thanh toán tiền mặt (khách đưa 200,000đ)
    const resThanhToan = await fetch(`${diaChi}/api/thanh-toan/xac-nhan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            phienBanId,
            maKhuyenMai: 'KM10',
            phuongThuc: 'tien_mat',
            soTienKhachDua: 200000,
            nguoiThucHien: 'Thu ngân'
        })
    });
    assert.strictEqual(resThanhToan.status, 200);
    const bodyThanhToan = await resThanhToan.json();
    assert.strictEqual(bodyThanhToan.ok, true);
    assert.strictEqual(bodyThanhToan.data.giaoDich.tien_thoi_lai, 2000); // 200k - 198k = 2k

    // 3. Kiểm tra bàn 5 đã chuyển về 'trong' và phiên đã đóng 'da_thanh_toan'
    const ban5 = ketNoiCoSoDuLieu.layMot(`SELECT trang_thai FROM ban_an WHERE id = 5`);
    const phien5 = ketNoiCoSoDuLieu.layMot(`SELECT trang_thai FROM phien_ban WHERE id = ?`, [phienBanId]);
    assert.strictEqual(ban5.trang_thai, 'trong');
    assert.strictEqual(phien5.trang_thai, 'da_thanh_toan');
});
