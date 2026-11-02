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

test('Sơ đồ bàn: Lấy sơ đồ bàn chi tiết thời gian thực', async () => {
    const res = await fetch(`${diaChi}/api/ban-an/so-do-chi-tiet`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
    assert.ok(body.data[0].hasOwnProperty('trang_thai'));
});

test('Vận hành Bàn: Mở bàn trực tiếp, Chuyển bàn và Ghép bàn Transaction', async () => {
    // Đảm bảo bàn 2, 3, 4 sạch sẽ trước khi test
    ketNoiCoSoDuLieu.thucThi(`UPDATE phien_ban SET trang_thai = 'da_huy' WHERE ban_an_id IN (2, 3, 4)`);
    ketNoiCoSoDuLieu.thucThi(`UPDATE ban_an SET trang_thai = 'trong' WHERE id IN (2, 3, 4)`);

    // 1. Mở bàn 2 trực tiếp từ POS
    const resMoBan2 = await fetch(`${diaChi}/api/phien-ban/mo-ban-truc-tiep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banId: 2, soKhach: 4, ghiChu: 'Khách VIP' })
    });
    assert.strictEqual(resMoBan2.status, 200);
    const bodyMoBan2 = await resMoBan2.json();
    assert.strictEqual(bodyMoBan2.ok, true);
    const phienBan2Id = bodyMoBan2.data.phienBan.id;

    // Đặt món cho Bàn 2 (Món 1: Nem Nướng Truyền Thống 65k x 1)
    const resDon1 = await fetch(`${diaChi}/api/don-goi-mon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            phienBanId: phienBan2Id,
            banAnId: 2,
            danhSachMon: [
                { monAnId: 1, soLuong: 1 }
            ]
        })
    });
    const bodyDon1 = await resDon1.json();
    assert.strictEqual(resDon1.status, 201, `Lỗi đặt đơn 1: ${JSON.stringify(bodyDon1)}`);

    // 2. Chuyển Bàn 2 sang Bàn 3 (Bàn 3 đang trống)
    const resChuyen = await fetch(`${diaChi}/api/phien-ban/chuyen-ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            phienBanId: phienBan2Id,
            banDichId: 3,
            lyDo: 'Khách muốn ngồi gần cửa sổ'
        })
    });
    assert.strictEqual(resChuyen.status, 200);
    const bodyChuyen = await resChuyen.json();
    assert.strictEqual(bodyChuyen.ok, true);

    // Kiểm tra Bàn 2 trở về 'trong', Bàn 3 thành 'dang_dung'
    const ban2 = ketNoiCoSoDuLieu.layMot(`SELECT trang_thai FROM ban_an WHERE id = 2`);
    const ban3 = ketNoiCoSoDuLieu.layMot(`SELECT trang_thai FROM ban_an WHERE id = 3`);
    assert.strictEqual(ban2.trang_thai, 'trong');
    assert.strictEqual(ban3.trang_thai, 'dang_dung');

    // 3. Mở Bàn 4 và đặt món (Món 2: Khoai Tây Chiên 45k x 2 = 90k)
    const resMoBan4 = await fetch(`${diaChi}/api/phien-ban/mo-ban-truc-tiep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banId: 4, soKhach: 2 })
    });
    const bodyMoBan4 = await resMoBan4.json();
    const phienBan4Id = bodyMoBan4.data.phienBan.id;

    await fetch(`${diaChi}/api/don-goi-mon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            phienBanId: phienBan4Id,
            banAnId: 4,
            danhSachMon: [
                { monAnId: 2, soLuong: 2 }
            ]
        })
    });

    // 4. Ghép Bàn 4 vào Bàn 3
    const resGhep = await fetch(`${diaChi}/api/phien-ban/ghep-ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            phienBanNguonId: phienBan4Id,
            phienBanDichId: phienBan2Id, // lúc này đang ở bàn 3
            lyDo: 'Gặp bạn nên gộp bàn'
        })
    });
    assert.strictEqual(resGhep.status, 200);
    const bodyGhep = await resGhep.json();
    assert.strictEqual(bodyGhep.ok, true);

    // Kiểm tra Bàn 4 đã giải phóng ('trong'), Phiên 4 đã đóng
    const ban4 = ketNoiCoSoDuLieu.layMot(`SELECT trang_thai FROM ban_an WHERE id = 4`);
    const phien4 = ketNoiCoSoDuLieu.layMot(`SELECT trang_thai FROM phien_ban WHERE id = ?`, [phienBan4Id]);
    assert.strictEqual(ban4.trang_thai, 'trong');
    assert.ok(['da_huy', 'da_thanh_toan'].includes(phien4.trang_thai));

    // Kiểm tra tổng tiền tạm tính của Phiên gộp (65k + 90k = 155k)
    const phienGop = ketNoiCoSoDuLieu.layMot(`SELECT tong_tien_tam_tinh FROM phien_ban WHERE id = ?`, [phienBan2Id]);
    assert.strictEqual(phienGop.tong_tien_tam_tinh, 155000);
});

test('Phục vụ: Đánh dấu món đã phục vụ lên bàn', async () => {
    // 1. Lấy 1 món có trạng thái trong chi_tiet_don_mon
    const chiTiet = ketNoiCoSoDuLieu.layMot(`SELECT id FROM chi_tiet_don_mon ORDER BY id DESC LIMIT 1`);
    assert.ok(chiTiet);

    const res = await fetch(`${diaChi}/api/don-goi-mon/da-phuc-vu/${chiTiet.id}`, {
        method: 'PUT'
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.data.trang_thai, 'da_phuc_vu');
});
