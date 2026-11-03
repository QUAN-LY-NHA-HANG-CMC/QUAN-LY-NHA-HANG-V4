const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../../backend/ungDung.js');
const db = require('../../backend/cauHinh/ketNoiCoSoDuLieu.js');
const jwt = require('jsonwebtoken');
const cauHinhBaoMat = require('../../backend/cauHinh/cauHinhBaoMat.js');

let server;
let baseUrl;
let tokenQuanLy;

test.before(async () => {
    server = http.createServer(app);
    await new Promise(resolve => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    const admin = db.layMot("SELECT id, ten_dang_nhap, vai_tro_id FROM tai_khoan WHERE ten_dang_nhap = 'admin'");
    tokenQuanLy = jwt.sign(
        { id: admin.id, taiKhoanId: admin.id, tenDangNhap: admin.ten_dang_nhap, vaiTro: 'quan_ly', danhSachQuyen: ['*'] },
        cauHinhBaoMat.khoaBiMatJwt,
        { expiresIn: '2h' }
    );
});

test.after(async () => {
    if (server) await new Promise(resolve => server.close(resolve));
});

test('Task 3: API mẫu phản hồi đánh giá nhanh (/api/danh-gia/mau-phan-hoi)', async () => {
    const res = await fetch(`${baseUrl}/api/danh-gia/mau-phan-hoi`, {
        headers: { Authorization: `Bearer ${tokenQuanLy}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    assert.ok(Array.isArray(data.data), 'Data phải là mảng các mẫu phản hồi');
    assert.ok(data.data.length >= 3, 'Phải có ít nhất 3 mẫu câu phản hồi');
});

test('Task 3: API sơ đồ bàn lọc theo trạng thái (?trangThai=trong)', async () => {
    const res = await fetch(`${baseUrl}/api/ban-an/so-do-chi-tiet?trangThai=trong`, {
        headers: { Authorization: `Bearer ${tokenQuanLy}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    for (const b of data.data) {
        assert.strictEqual(b.trang_thai, 'trong', 'Chỉ trả về các bàn trống');
    }
});

test('Task 3: API doanh thu hỗ trợ khoảng ngày tuNgay & denNgay', async () => {
    const res = await fetch(`${baseUrl}/api/thong-ke/doanh-thu?tuNgay=2026-01-01&denNgay=2026-12-31`, {
        headers: { Authorization: `Bearer ${tokenQuanLy}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    assert.ok(Array.isArray(data.data));
});
