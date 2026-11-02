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

test('Xác thực QR Bàn ăn và khởi tạo phiên bàn mới nếu chưa có', async () => {
    // 1. Gửi request xác thực QR với Bàn 1
    const res = await fetch(`${diaChi}/api/phien-ban/xac-thuc-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banId: 1, maDinhDanhQr: 'QR_BAN_1' })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.ok(body.data.phienBan, 'Phải có dữ liệu phiên bàn');
    assert.strictEqual(body.data.phienBan.ban_an_id, 1);
    assert.strictEqual(body.data.phienBan.trang_thai, 'dang_su_dung');

    const phienIdDau = body.data.phienBan.id;

    // 2. Gửi lại xác thực cùng Bàn 1 -> phải tái sử dụng phiên bàn đang hoạt động
    const resLai = await fetch(`${diaChi}/api/phien-ban/xac-thuc-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banId: 1, maDinhDanhQr: 'QR_BAN_1' })
    });

    assert.strictEqual(resLai.status, 200);
    const bodyLai = await resLai.json();
    assert.strictEqual(bodyLai.data.phienBan.id, phienIdDau, 'Phiên bàn phải được giữ nguyên');
});

test('Đặt món thời gian thực với Transaction, tích lũy hóa đơn và cập nhật trạng thái', async () => {
    // Đóng phiên cũ của Bàn 2 nếu có để đảm bảo tính độc lập
    ketNoiCoSoDuLieu.thucThi(`UPDATE phien_ban SET trang_thai = 'da_thanh_toan' WHERE ban_an_id = 2`);

    // 1. Tạo phiên bàn cho Bàn 2
    const resPhien = await fetch(`${diaChi}/api/phien-ban/xac-thuc-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banId: 2, maDinhDanhQr: 'QR_BAN_2' })
    });
    const bodyPhien = await resPhien.json();
    const phienBan = bodyPhien.data.phienBan;

    // 2. Đặt món lần 1
    const resDon1 = await fetch(`${diaChi}/api/don-goi-mon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            phienBanId: phienBan.id,
            banAnId: 2,
            ghiChu: 'Không cay, làm nhanh giúp',
            danhSachMon: [
                { monAnId: 1, tenMon: 'Bò tơ nướng tảng', soLuong: 2, donGia: 150000, ghiChuMon: 'Chín vừa' },
                { monAnId: 2, tenMon: 'Trà đá', soLuong: 3, donGia: 5000, ghiChuMon: 'Ít đá' }
            ]
        })
    });

    assert.strictEqual(resDon1.status, 201);
    const bodyDon1 = await resDon1.json();
    assert.strictEqual(bodyDon1.ok, true);
    assert.strictEqual(bodyDon1.data.donGoiMon.lan_goi, 1);
    assert.strictEqual(bodyDon1.data.donGoiMon.tong_tien_don, 315000);
    assert.strictEqual(bodyDon1.data.danhSachMon.length, 2);

    const monHuyThuNghiem = bodyDon1.data.danhSachMon[1]; // Trà đá 3 ly = 15000

    // 3. Khách hàng hủy món khi món vẫn ở trạng thái "cho_xac_nhan"
    const resHuy = await fetch(`${diaChi}/api/don-goi-mon/huy-mon/${monHuyThuNghiem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyDo: 'Khách đổi ý không uống trà đá' })
    });

    assert.strictEqual(resHuy.status, 200);
    const bodyHuy = await resHuy.json();
    assert.strictEqual(bodyHuy.ok, true);
    assert.strictEqual(bodyHuy.data.trang_thai, 'da_huy');

    // 4. Lấy lại thông tin phiên bàn để xác nhận tiền tích lũy đã trừ món hủy (315000 - 15000 = 300000)
    const resKiemTraPhien = await fetch(`${diaChi}/api/phien-ban/${phienBan.ma_phien}`);
    assert.strictEqual(resKiemTraPhien.status, 200);
    const bodyKiemTraPhien = await resKiemTraPhien.json();
    assert.strictEqual(bodyKiemTraPhien.data.tong_tien_tam_tinh, 300000);

    // 5. Thử hủy món khi món đã chuyển sang "dang_che_bien" -> phải bị từ chối
    const monConLai = bodyDon1.data.danhSachMon[0];
    ketNoiCoSoDuLieu.thucThi(
        `UPDATE chi_tiet_don_mon SET trang_thai = 'dang_che_bien' WHERE id = ?`,
        [monConLai.id]
    );

    const resHuyThatBai = await fetch(`${diaChi}/api/don-goi-mon/huy-mon/${monConLai.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyDo: 'Hủy bò tơ' })
    });

    assert.strictEqual(resHuyThatBai.status, 400);
    const bodyHuyThatBai = await resHuyThatBai.json();
    assert.strictEqual(bodyHuyThatBai.ok, false);
});
