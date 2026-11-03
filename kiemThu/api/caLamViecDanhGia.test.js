const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../../backend/ungDung.js');
const ketNoiCoSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu.js');

let server;
let diaChi;
let tokenQuanLy = '';
let tokenThuNgan = '';

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

    // 2. Đăng nhập Thu ngân (thungan / 123456)
    const resThuNgan = await fetch(`${diaChi}/api/tai-khoan/dang-nhap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenDangNhap: 'thungan', matKhau: '123456' })
    });
    const bodyThuNgan = await resThuNgan.json();
    assert.strictEqual(resThuNgan.status, 200);
    tokenThuNgan = bodyThuNgan.data.token;
});

test.after(async () => {
    if (server) {
        if (server.closeAllConnections) server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
    }
});

test('Bộ API Đánh giá khách hàng, Quản lý ca thu ngân & Xuất CSV (Minh - BE)', async (t) => {
    let danhGiaId = 0;
    let phienCaId = 0;

    await t.test('1. Khách hàng gửi đánh giá và xem điểm sao trung bình (/api/danh-gia)', async () => {
        const resTao = await fetch(`${diaChi}/api/danh-gia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phienBanId: 1,
                monAnId: 1,
                tenKhachHang: 'Hoàng Anh',
                soSao: 5,
                nhanXet: 'Món ăn rất vừa miệng, không gian ấm cúng!',
                anDanh: false
            })
        });

        assert.strictEqual(resTao.status, 201);
        const bodyTao = await resTao.json();
        assert.strictEqual(bodyTao.ok, true);
        assert.ok(bodyTao.data.id > 0);
        danhGiaId = bodyTao.data.id;

        // Điểm sao trung bình
        const resDiem = await fetch(`${diaChi}/api/danh-gia/diem-trung-binh`);
        assert.strictEqual(resDiem.status, 200);
        const bodyDiem = await resDiem.json();
        assert.strictEqual(bodyDiem.ok, true);
        assert.ok(bodyDiem.data.diemTrungBinh >= 1);
        assert.ok(bodyDiem.data.tongLuotDanhGia >= 1);
    });

    await t.test('2. Quản lý xem danh sách đánh giá, lọc tiêu cực và phản hồi khách', async () => {
        // Lấy danh sách đánh giá
        const resList = await fetch(`${diaChi}/api/danh-gia`, {
            headers: { 'Authorization': `Bearer ${tokenQuanLy}` }
        });
        assert.strictEqual(resList.status, 200);
        const bodyList = await resList.json();
        assert.ok(bodyList.data.length > 0);

        // Lọc tiêu cực (sao <= 2)
        const resTieuCuc = await fetch(`${diaChi}/api/danh-gia?chiTieuCuc=true`, {
            headers: { 'Authorization': `Bearer ${tokenQuanLy}` }
        });
        assert.strictEqual(resTieuCuc.status, 200);
        const bodyTieuCuc = await resTieuCuc.json();
        bodyTieuCuc.data.forEach(item => {
            assert.ok(item.so_sao <= 2);
        });

        // Quản lý phản hồi đánh giá
        const resPhanHoi = await fetch(`${diaChi}/api/danh-gia/${danhGiaId}/phan-hoi`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${tokenQuanLy}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phanHoi: 'Dạ Quán Mộc cảm ơn quý khách nhiều ạ!' })
        });
        assert.strictEqual(resPhanHoi.status, 200);
        const bodyPhanHoi = await resPhanHoi.json();
        assert.strictEqual(bodyPhanHoi.ok, true);
        assert.strictEqual(bodyPhanHoi.data.phan_hoi_quan_ly, 'Dạ Quán Mộc cảm ơn quý khách nhiều ạ!');
    });

    await t.test('3. Thu ngân mở ca làm việc và ghi nhận tiền đầu ca (/api/ca-lam-viec/mo-ca)', async () => {
        // Đóng các ca cũ nếu còn mở
        ketNoiCoSoDuLieu.thucThi(`UPDATE phien_ca_thu_ngan SET trang_thai = 'da_dong' WHERE trang_thai = 'dang_mo'`);

        const resMoCa = await fetch(`${diaChi}/api/ca-lam-viec/mo-ca`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenThuNgan}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                caLamViecId: 1,
                tienDauCa: 1000000,
                ghiChu: 'Bắt đầu ca sáng'
            })
        });

        assert.strictEqual(resMoCa.status, 201);
        const bodyMoCa = await resMoCa.json();
        assert.strictEqual(bodyMoCa.ok, true);
        assert.strictEqual(bodyMoCa.data.tien_dau_ca, 1000000);
        assert.strictEqual(bodyMoCa.data.trang_thai, 'dang_mo');
        phienCaId = bodyMoCa.data.id;
    });

    await t.test('4. Lập phiếu thu và phiếu chi tiền mặt trong ca (/api/ca-lam-viec/phieu-thu-chi)', async () => {
        // Lập phiếu chi mua đá lạnh 50.000đ
        const resChi = await fetch(`${diaChi}/api/ca-lam-viec/phieu-thu-chi`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenThuNgan}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phienCaId,
                loaiPhieu: 'chi',
                soTien: 50000,
                lyDo: 'Mua thêm túi đá lạnh'
            })
        });

        assert.strictEqual(resChi.status, 201);
        const bodyChi = await resChi.json();
        assert.strictEqual(bodyChi.ok, true);
        assert.strictEqual(bodyChi.data.so_tien, 50000);
        assert.strictEqual(bodyChi.data.loai_phieu, 'chi');
    });

    await t.test('5. Kết ca thu ngân, đối soát quỹ và tính tiền chênh lệch (/api/ca-lam-viec/ket-ca)', async () => {
        // Đếm thực tế 960.000đ (khi đầu ca 1.000.000đ - chi 50.000đ = hệ thống 950.000đ -> thừa 10.000đ)
        const resKetCa = await fetch(`${diaChi}/api/ca-lam-viec/ket-ca`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenThuNgan}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phienCaId,
                tienMatThucTe: 960000,
                ghiChu: 'Kiểm đếm cuối ca, khách boa dư 10k'
            })
        });

        assert.strictEqual(resKetCa.status, 200);
        const bodyKetCa = await resKetCa.json();
        assert.strictEqual(bodyKetCa.ok, true);
        assert.strictEqual(bodyKetCa.data.trang_thai, 'da_dong');
        assert.strictEqual(bodyKetCa.data.tien_mat_thuc_te, 960000);
        assert.strictEqual(bodyKetCa.data.chenh_lech, 10000); // Thừa 10.000đ
    });

    await t.test('6. Xuất báo cáo doanh thu & hóa đơn ra CSV với UTF-8 BOM (/api/xuat-bao-cao/*)', async () => {
        // Xuất báo cáo doanh thu
        const resCsvDoanhThu = await fetch(`${diaChi}/api/xuat-bao-cao/doanh-thu-csv`, {
            headers: { 'Authorization': `Bearer ${tokenQuanLy}` }
        });
        assert.strictEqual(resCsvDoanhThu.status, 200);
        assert.ok(resCsvDoanhThu.headers.get('content-type').includes('text/csv'));
        const bufDoanhThu = Buffer.from(await resCsvDoanhThu.arrayBuffer());
        assert.strictEqual(bufDoanhThu[0], 0xEF, 'Byte 0 phải là 0xEF');
        assert.strictEqual(bufDoanhThu[1], 0xBB, 'Byte 1 phải là 0xBB');
        assert.strictEqual(bufDoanhThu[2], 0xBF, 'Byte 2 phải là 0xBF');
        const textDoanhThu = bufDoanhThu.toString('utf8');
        assert.ok(textDoanhThu.includes('Ngày,Tổng Doanh Thu,Số Hóa Đơn'));

        // Xuất danh sách hóa đơn
        const resCsvHoaDon = await fetch(`${diaChi}/api/xuat-bao-cao/hoa-don-csv`, {
            headers: { 'Authorization': `Bearer ${tokenQuanLy}` }
        });
        assert.strictEqual(resCsvHoaDon.status, 200);
        const bufHoaDon = Buffer.from(await resCsvHoaDon.arrayBuffer());
        assert.strictEqual(bufHoaDon[0], 0xEF);
        assert.strictEqual(bufHoaDon[1], 0xBB);
        assert.strictEqual(bufHoaDon[2], 0xBF);
        const textHoaDon = bufHoaDon.toString('utf8');
        assert.ok(textHoaDon.includes('Mã Hóa Đơn'));
        assert.ok(textHoaDon.includes('Tổng Thanh Toán'));
    });
});
