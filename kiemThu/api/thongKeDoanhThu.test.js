const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../../backend/ungDung.js');
const ketNoiCoSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu.js');

let server;
let diaChi;
let tokenQuanLy = '';
let tokenPhucVu = '';

test.before(async () => {
    await ketNoiCoSoDuLieu.khoiTaoCoSoDuLieu();
    server = http.createServer(app);
    await new Promise((resolve) => {
        server.listen(0, () => {
            diaChi = `http://localhost:${server.address().port}`;
            resolve();
        });
    });

    // 1. Đăng nhập Quản lý (admin / 123456)
    const resAdmin = await fetch(`${diaChi}/api/tai-khoan/dang-nhap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenDangNhap: 'admin', matKhau: '123456' })
    });
    const bodyAdmin = await resAdmin.json();
    assert.strictEqual(resAdmin.status, 200);
    tokenQuanLy = bodyAdmin.data.token;

    // 2. Đăng nhập Phục vụ (phucvu / 123456)
    const resPhucVu = await fetch(`${diaChi}/api/tai-khoan/dang-nhap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenDangNhap: 'phucvu', matKhau: '123456' })
    });
    const bodyPhucVu = await resPhucVu.json();
    assert.strictEqual(resPhucVu.status, 200);
    tokenPhucVu = bodyPhucVu.data.token;
});

test.after(async () => {
    if (server) {
        if (server.closeAllConnections) server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
    }
});

test('Bộ API Thống kê Doanh thu & Dashboard Analytics (Nhật - PM/BE)', async (t) => {
    await t.test('1. API Tổng quan trong ngày (/api/thong-ke/tong-quan)', async () => {
        const res = await fetch(`${diaChi}/api/thong-ke/tong-quan`, {
            headers: { 'Authorization': `Bearer ${tokenQuanLy}` }
        });

        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.strictEqual(body.ok, true);
        assert.ok(body.data.hasOwnProperty('tongDoanhThuNgay'));
        assert.ok(body.data.hasOwnProperty('soHoaDonNgay'));
        assert.ok(body.data.hasOwnProperty('soKhachPhucVu'));
        assert.ok(body.data.hasOwnProperty('giaTriTrungBinhDon'));
    });

    await t.test('2. API Biểu đồ doanh thu theo chu kỳ (/api/thong-ke/doanh-thu)', async () => {
        const res = await fetch(`${diaChi}/api/thong-ke/doanh-thu?ky=ngay`, {
            headers: { 'Authorization': `Bearer ${tokenQuanLy}` }
        });

        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.strictEqual(body.ok, true);
        assert.ok(Array.isArray(body.data));
    });

    await t.test('3. API Tỷ trọng phương thức thanh toán (/api/thong-ke/phuong-thuc)', async () => {
        const res = await fetch(`${diaChi}/api/thong-ke/phuong-thuc`, {
            headers: { 'Authorization': `Bearer ${tokenQuanLy}` }
        });

        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.strictEqual(body.ok, true);
        assert.ok(body.data.hasOwnProperty('tienMat'));
        assert.ok(body.data.hasOwnProperty('chuyenKhoan'));
        assert.ok(body.data.hasOwnProperty('tongCong'));
    });

    await t.test('4. API Top món bán chạy và doanh thu theo danh mục (/api/thong-ke/top-mon, /danh-muc)', async () => {
        const resTop = await fetch(`${diaChi}/api/thong-ke/top-mon?gioiHan=5`, {
            headers: { 'Authorization': `Bearer ${tokenQuanLy}` }
        });

        assert.strictEqual(resTop.status, 200);
        const bodyTop = await resTop.json();
        assert.strictEqual(bodyTop.ok, true);
        assert.ok(Array.isArray(bodyTop.data.topBanChay));

        const resDm = await fetch(`${diaChi}/api/thong-ke/danh-muc`, {
            headers: { 'Authorization': `Bearer ${tokenQuanLy}` }
        });

        assert.strictEqual(resDm.status, 200);
        const bodyDm = await resDm.json();
        assert.strictEqual(bodyDm.ok, true);
        assert.ok(Array.isArray(bodyDm.data));
    });

    await t.test('5. API Khung giờ cao điểm và Tỷ lệ hủy món (/api/thong-ke/khung-gio, /huy-mon)', async () => {
        const resKhungGio = await fetch(`${diaChi}/api/thong-ke/khung-gio`, {
            headers: { 'Authorization': `Bearer ${tokenQuanLy}` }
        });

        assert.strictEqual(resKhungGio.status, 200);
        const bodyKg = await resKhungGio.json();
        assert.strictEqual(bodyKg.ok, true);
        assert.strictEqual(bodyKg.data.length, 24);

        const resHuyMon = await fetch(`${diaChi}/api/thong-ke/huy-mon`, {
            headers: { 'Authorization': `Bearer ${tokenQuanLy}` }
        });

        assert.strictEqual(resHuyMon.status, 200);
        const bodyHuy = await resHuyMon.json();
        assert.strictEqual(bodyHuy.ok, true);
        assert.ok(bodyHuy.data.hasOwnProperty('tongSoMonHuy'));
    });

    await t.test('6. Kiểm tra phân quyền: Nhân viên phục vụ không được xem báo cáo doanh thu', async () => {
        const res = await fetch(`${diaChi}/api/thong-ke/tong-quan`, {
            headers: { 'Authorization': `Bearer ${tokenPhucVu}` }
        });

        // Phục vụ không có quyền quan_ly -> 403 Forbidden
        assert.strictEqual(res.status, 403);
    });
});
