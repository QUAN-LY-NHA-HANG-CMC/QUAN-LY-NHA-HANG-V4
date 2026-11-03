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
        if (server.closeAllConnections) {
            server.closeAllConnections();
        }
        await new Promise((resolve) => server.close(resolve));
    }
});

test('Kiểm tra giá giỏ hàng phía Server chống gian lận giá', async () => {
    // Giả lập client gửi giá sai (ví dụ 100đ thay vì giá thật)
    const res = await fetch(`${diaChi}/api/gio-hang/kiem-tra-gia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            danhSachMon: [
                { monAnId: 1, soLuong: 2, giaClientGiaMao: 100 }
            ]
        })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.ok(body.data.tongTienTamTinh > 200, 'Server phải tính giá thực tế từ CSDL thay vì giá client gửi');
    assert.strictEqual(body.data.danhSachHopLe[0].monAnId, 1);
});

test('Lưu trữ và khôi phục giỏ hàng tạm thời theo phiên bàn', async () => {
    // 1. Tạo phiên bàn cho Bàn 3
    ketNoiCoSoDuLieu.thucThi(`UPDATE phien_ban SET trang_thai = 'da_thanh_toan' WHERE ban_an_id = 3`);
    const resPhien = await fetch(`${diaChi}/api/phien-ban/xac-thuc-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banId: 3, maDinhDanhQr: 'QR_BAN_3' })
    });
    const bodyPhien = await resPhien.json();
    const phienId = bodyPhien.data.phienBan.id;

    // 2. Lưu giỏ hàng tạm
    const duLieuGioHang = [
        { monAnId: 1, soLuong: 1, ghiChu: 'Ít tiêu' }
    ];
    const resLuu = await fetch(`${diaChi}/api/gio-hang/tam-thoi/${phienId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gioHang: duLieuGioHang })
    });
    assert.strictEqual(resLuu.status, 200);

    // 3. Khôi phục giỏ hàng tạm
    const resLay = await fetch(`${diaChi}/api/gio-hang/tam-thoi/${phienId}`);
    assert.strictEqual(resLay.status, 200);
    const bodyLay = await resLay.json();
    assert.strictEqual(bodyLay.ok, true);
    assert.strictEqual(bodyLay.data.gioHang.length, 1);
    assert.strictEqual(bodyLay.data.gioHang[0].monAnId, 1);
});

test('Gửi yêu cầu hỗ trợ và yêu cầu thanh toán tại bàn', async () => {
    // 1. Gửi yêu cầu gọi nhân viên cho Bàn 3
    const resHoTro = await fetch(`${diaChi}/api/yeu-cau-ho-tro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            banAnId: 3,
            loaiYeuCau: 'goi_nhan_vien',
            lyDo: 'Cần thêm khăn lạnh'
        })
    });
    assert.strictEqual(resHoTro.status, 201);
    const bodyHoTro = await resHoTro.json();
    assert.strictEqual(bodyHoTro.ok, true);
    assert.strictEqual(bodyHoTro.data.trang_thai, 'cho_tiep_nhan');
    const yeuCauId = bodyHoTro.data.id;

    // 2. Nhân viên tiếp nhận yêu cầu
    const resTiepNhan = await fetch(`${diaChi}/api/yeu-cau-ho-tro/${yeuCauId}/tiep-nhan`, {
        method: 'PUT'
    });
    assert.strictEqual(resTiepNhan.status, 200);
    const bodyTiepNhan = await resTiepNhan.json();
    assert.strictEqual(bodyTiepNhan.data.trang_thai, 'hoan_thanh');

    // 3. Khách gửi yêu cầu thanh toán
    const resThanhToan = await fetch(`${diaChi}/api/yeu-cau-ho-tro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            banAnId: 3,
            loaiYeuCau: 'yeu_cau_thanh_toan',
            lyDo: 'Khách yêu cầu tính tiền'
        })
    });
    assert.strictEqual(resThanhToan.status, 201);

    // Kiểm tra trạng thái bàn đã chuyển sang cho_thanh_toan
    const banAn = ketNoiCoSoDuLieu.layMot('SELECT trang_thai FROM ban_an WHERE id = 3');
    assert.strictEqual(banAn.trang_thai, 'cho_thanh_toan');
});
