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

test('KDS: Lấy hàng đợi đơn món chờ chế biến (FIFO) và gom nhóm món', async () => {
    // 1. Tạo phiên và đặt món cho Bàn 1
    const resPhien = await fetch(`${diaChi}/api/phien-ban/xac-thuc-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banId: 1, maDinhDanhQr: 'QR_BAN_1' })
    });
    const bodyPhien = await resPhien.json();
    const phienId = bodyPhien.data.phienBan.id;

    await fetch(`${diaChi}/api/don-goi-mon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            phienBanId: phienId,
            banAnId: 1,
            ghiChu: 'Bàn 1 gọi',
            danhSachMon: [
                { monAnId: 1, tenMon: 'Bò tơ nướng tảng', soLuong: 2, donGia: 150000, ghiChuMon: 'Nấu kỹ' }
            ]
        })
    });

    // 2. Lấy hàng đợi KDS
    const resKds = await fetch(`${diaChi}/api/kds/don-cho`);
    assert.strictEqual(resKds.status, 200);
    const bodyKds = await resKds.json();
    assert.strictEqual(bodyKds.ok, true);
    assert.ok(Array.isArray(bodyKds.data.danhSachCho));
    assert.ok(bodyKds.data.danhSachCho.length > 0);

    // 3. Gom món
    const resGom = await fetch(`${diaChi}/api/kds/gom-mon`);
    assert.strictEqual(resGom.status, 200);
    const bodyGom = await resGom.json();
    assert.strictEqual(bodyGom.ok, true);
    assert.ok(Array.isArray(bodyGom.data));
    const boNuong = bodyGom.data.find(m => m.mon_an_id === 1);
    assert.ok(boNuong, 'Món bò tơ nướng phải có trong danh sách gom');
    assert.ok(boNuong.tong_so_luong >= 2);
});

test('KDS: Chuyển trạng thái nấu món và kiểm soát hết món', async () => {
    // 1. Lấy 1 món đang chờ
    const resKds = await fetch(`${diaChi}/api/kds/don-cho`);
    const bodyKds = await resKds.json();
    const monCho = bodyKds.data.danhSachCho[0];
    assert.ok(monCho);

    // 2. Chuyển sang đang chế biến
    const resCheBien = await fetch(`${diaChi}/api/kds/chuyen-trang-thai/${monCho.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trangThaiMoi: 'dang_che_bien' })
    });
    assert.strictEqual(resCheBien.status, 200);
    const bodyCheBien = await resCheBien.json();
    assert.strictEqual(bodyCheBien.data.trang_thai, 'dang_che_bien');

    // 3. Chuyển sang hoàn thành (món sẵn sàng phục vụ)
    const resHoanThanh = await fetch(`${diaChi}/api/kds/chuyen-trang-thai/${monCho.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trangThaiMoi: 'hoan_thanh' })
    });
    assert.strictEqual(resHoanThanh.status, 200);
    const bodyHoanThanh = await resHoanThanh.json();
    assert.strictEqual(bodyHoanThanh.data.trang_thai, 'hoan_thanh');

    // 4. Bật/tắt trạng thái hết món từ bếp
    const resToggle = await fetch(`${diaChi}/api/kds/toggle-het-mon/1`, {
        method: 'PUT'
    });
    assert.strictEqual(resToggle.status, 200);
    const bodyToggle = await resToggle.json();
    assert.ok(['dang_ban', 'tam_het'].includes(bodyToggle.data.trang_thai));

    // Khôi phục lại dang_ban
    if (bodyToggle.data.trang_thai === 'tam_het') {
        await fetch(`${diaChi}/api/kds/toggle-het-mon/1`, { method: 'PUT' });
    }
});
