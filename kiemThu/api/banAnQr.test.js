const test = require('node:test');
const assert = require('node:assert/strict');
const ketNoiCoSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu.js');

test.before(async () => {
    await ketNoiCoSoDuLieu.khoiTaoCoSoDuLieu();
});

test('Tiện ích sinh mã QR Code', async () => {
    const taoMaQr = require('../../backend/tienIch/taoMaQr.js');
    const chuoiThuNghiem = 'http://localhost:3001/menu?ban=B01&token=xyz';
    const anhBase64 = await taoMaQr.taoAnhQrBase64(chuoiThuNghiem);
    
    assert.ok(anhBase64.startsWith('data:image/png;base64,'), 'Phải là chuỗi Base64 Data URI của PNG');
});

test('Nghiệp vụ Khu vực và Bàn ăn kèm mã QR định danh', async () => {
    const khuVucService = require('../../backend/modules/khuVuc/khuVuc.service.js');
    const banAnService = require('../../backend/modules/banAn/banAn.service.js');

    // Thêm khu vực mới
    const khuVucMoi = await khuVucService.taoKhuVuc({
        tenKhuVuc: 'Tầng Thượng Rooftop',
        tang: 3,
        moTa: 'View toàn thành phố'
    });
    assert.ok(khuVucMoi.id);
    assert.strictEqual(khuVucMoi.ten_khu_vuc, 'Tầng Thượng Rooftop');

    // Thêm bàn mới vào khu vực vừa tạo
    const banMoi = await banAnService.taoBanAn({
        maBan: 'RT01',
        tenBan: 'Bàn Rooftop 01',
        khuVucId: khuVucMoi.id,
        sucChua: 6
    });

    assert.ok(banMoi.id);
    assert.strictEqual(banMoi.ma_ban, 'RT01');
    assert.ok(banMoi.ma_qr_token, 'Phải tự động sinh mã QR token');
    assert.ok(banMoi.url_ma_qr.includes('ban=RT01'), 'URL phải chứa mã bàn');

    // Lấy ảnh QR của bàn
    const qrDuLieu = await banAnService.layAnhQrBan(banMoi.id);
    assert.ok(qrDuLieu.anhBase64.startsWith('data:image/png;base64,'));

    // Làm mới mã QR của bàn
    const tokenCu = banMoi.ma_qr_token;
    const banCapNhat = await banAnService.lamMoiQrToken(banMoi.id);
    assert.notStrictEqual(banCapNhat.ma_qr_token, tokenCu, 'Token QR phải được làm mới');

    // Đổi trạng thái bàn
    await banAnService.doiTrangThai(banMoi.id, 'dang_dung');
    const banDangDung = await banAnService.layTheoId(banMoi.id);
    assert.strictEqual(banDangDung.trang_thai, 'dang_dung');
});
