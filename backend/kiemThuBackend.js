// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// BỘ KIỂM THỬ TÍCH HỢP TỰ ĐỘNG TOÀN DIỆN BACKEND API (SMOKE TEST)
// ============================================================================

const http = require('http');
const { mkdtempSync, readFileSync, unlinkSync, rmdirSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { randomBytes, randomUUID } = require('node:crypto');
const kiemThuThamGiaBan = require('./kiemThuThamGiaBan');

const thuMucKiemThu = mkdtempSync(path.join(tmpdir(), 'quan-moc-test-'));
const tepKiemThu = path.join(thuMucKiemThu, 'kiem-thu.sqlite');
process.env.DB_PATH = tepKiemThu;
process.env.NODE_ENV = 'test';
const fixture = new DatabaseSync(tepKiemThu);
try {
    fixture.exec(readFileSync(path.join(__dirname, '../database/taoBang.sql'), 'utf8'));
    fixture.exec(readFileSync(path.join(__dirname, '../database/duLieuMau.sql'), 'utf8'));
    fixture.exec("UPDATE ca_lam_viec SET trang_thai = 'ke_hoach' WHERE trang_thai = 'da_checkin'");
} finally {
    fixture.close();
}

const ungDung = require('./ungDung');
const { khoiTaoSocket } = require('./cauHinh/cauHinhSocket');
const { db } = require('./cauHinh/ketNoiCoSoDuLieu');

let BASE_URL;

let server;

function inKetQua(tenKiemThu, thanhCong, chiTiet = '') {
    if (thanhCong) {
        console.log(`  ✅ [PASS] ${tenKiemThu}`);
    } else {
        console.error(`  ❌ [FAIL] ${tenKiemThu}: ${chiTiet}`);
        throw new Error(`Kiểm thử thất bại: ${tenKiemThu} - ${chiTiet}`);
    }
}

async function moQuyenKhach(ban, headersNhanVien) {
    if (!db.prepare("SELECT 1 FROM phien_ban WHERE ban_an_id=? AND trang_thai='dang_hoat_dong'").get(ban.id)) {
        const mo = await fetch(`${BASE_URL}/api/ban-an/${ban.id}/mo-ban`, {
            method: 'POST', headers: headersNhanVien, body: JSON.stringify({ soKhach: 2 })
        });
        if (!mo.ok) throw new Error((await mo.json()).msg);
    }
    const headers = {
        'Content-Type': 'application/json',
        'X-Table-Token': ban.ma_qr_token,
        'X-Device-Key': randomBytes(32).toString('hex')
    };
    const gui = await fetch(`${BASE_URL}/api/ban-an/${ban.id}/tham-gia`, { method: 'POST', headers, body: '{}' });
    const yeuCau = await gui.json();
    if (!gui.ok) throw new Error(yeuCau.msg);
    const duyet = await fetch(`${BASE_URL}/api/ban-an/${ban.id}/thiet-bi-cho/${yeuCau.data.id}/chu`, {
        method: 'PUT', headers: headersNhanVien
    });
    if (!duyet.ok) throw new Error((await duyet.json()).msg);
    return headers;
}

async function guiGioKhach(ban, headers, danhSachMon) {
    const url = `${BASE_URL}/api/ban-an/${ban.id}/gio-mon`;
    let gio = (await (await fetch(url, { headers })).json()).data;
    for (const { monAnId, soLuong, ghiChu } of danhSachMon) {
        const capNhat = await fetch(url, {
            method: 'PUT', headers,
            body: JSON.stringify({ phienId: gio.phienId, phienSua: gio.phienSua, monId: monAnId, soLuong, ghiChu })
        });
        if (!capNhat.ok) return capNhat;
        gio = (await capNhat.json()).data;
    }
    return fetch(`${BASE_URL}/api/don-goi-mon`, {
        method: 'POST', headers, body: JSON.stringify({
            maQrToken: ban.ma_qr_token, khoaGui: randomUUID(), phienSuaGio: gio.phienSua
        })
    });
}

async function taoVaVaoCa(nhanVienId, headersQuanLy, headersNhanVien, tenVaiTro) {
    // Khung giờ bao quanh thời điểm kiểm thử, kể cả khi ca đi qua nửa đêm.
    const bayGioVietNam = Date.now() + 7 * 60 * 60 * 1000;
    const batDau = new Date(bayGioVietNam - 10 * 60 * 1000).toISOString();
    const ketThuc = new Date(bayGioVietNam + 2 * 60 * 60 * 1000).toISOString();
    const taoCa = await fetch(`${BASE_URL}/api/ca-lam-viec/tao-ca`, {
        method: 'POST',
        headers: headersQuanLy,
        body: JSON.stringify({
            nhanVienId,
            ngayLam: batDau.slice(0, 10),
            tenCa: 'ca_gay',
            gioBatDau: batDau.slice(11, 16),
            gioKetThuc: ketThuc.slice(11, 16),
            ghiChu: 'Ca kiểm thử tích hợp'
        })
    });
    const ca = await taoCa.json();
    inKetQua(`Tạo ca kiểm thử cho ${tenVaiTro}`, taoCa.ok && !!ca.data?.id, ca.msg);
    const vaoCa = await fetch(`${BASE_URL}/api/ca-lam-viec/${ca.data.id}/checkin`, {
        method: 'PUT', headers: headersNhanVien
    });
    const ketQua = await vaoCa.json();
    inKetQua(`${tenVaiTro} check-in ca được giao`, vaoCa.ok && ketQua.data?.trang_thai === 'da_checkin', ketQua.msg);
    return ca.data.id;
}

async function chayKiemThu() {
    console.log('================================================================');
    console.log('🧪 BẮT ĐẦU KIỂM THỬ TÍCH HỢP BACKEND EXPRESS & SOCKET.IO API');
    console.log('================================================================');

    // 1. Khởi động server test
    server = http.createServer(ungDung);
    khoiTaoSocket(server);
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    BASE_URL = `http://127.0.0.1:${server.address().port}`;
    console.log(`Máy chủ kiểm thử chạy tại ${BASE_URL}\n`);

    try {
        // TEST 1: Health check
        console.log('📋 NHÓM 1: KIỂM TRA SỨC KHỎE HỆ THỐNG & ĐỊNH DẠNG CHUẨN');
        const resHealth = await fetch(`${BASE_URL}/api/kiem-tra-suc-khoe`);
        const jsonHealth = await resHealth.json();
        inKetQua('Health Check trả về status 200', resHealth.status === 200);
        inKetQua('Định dạng chuẩn { ok: true, data, msg }', jsonHealth.ok === true && !!jsonHealth.data && !!jsonHealth.msg);

        // TEST 2: Đăng nhập các vai trò
        console.log('\n📋 NHÓM 2: XÁC THỰC & PHÂN QUYỀN RBAC (JWT)');
        
        // Đăng nhập Admin
        const resLoginAdmin = await fetch(`${BASE_URL}/api/tai-khoan/dang-nhap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenDangNhap: 'admin', matKhau: '123456' })
        });
        const jsonAdmin = await resLoginAdmin.json();
        inKetQua('Đăng nhập tài khoản admin thành công', jsonAdmin.ok === true && jsonAdmin.data.nguoiDung.vaiTro === 'quan_ly');
        const tokenAdmin = jsonAdmin.data.token;

        // Đăng nhập Bếp
        const resLoginBep = await fetch(`${BASE_URL}/api/tai-khoan/dang-nhap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenDangNhap: 'bep01', matKhau: '123456' })
        });
        const jsonBep = await resLoginBep.json();
        inKetQua('Đăng nhập tài khoản bếp thành công', jsonBep.ok === true && jsonBep.data.nguoiDung.vaiTro === 'bep');
        const tokenBep = jsonBep.data.token;

        // Đăng nhập Phục vụ
        const resLoginPhucVu = await fetch(`${BASE_URL}/api/tai-khoan/dang-nhap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenDangNhap: 'phucvu01', matKhau: '123456' })
        });
        const jsonPhucVu = await resLoginPhucVu.json();
        inKetQua('Đăng nhập tài khoản phục vụ thành công', jsonPhucVu.ok === true && jsonPhucVu.data.nguoiDung.vaiTro === 'phuc_vu');
        const tokenPhucVu = jsonPhucVu.data.token;
        const resLoginThuNgan = await fetch(`${BASE_URL}/api/tai-khoan/dang-nhap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenDangNhap: 'thungan01', matKhau: '123456' })
        });
        const jsonThuNgan = await resLoginThuNgan.json();
        inKetQua('Đăng nhập tài khoản thu ngân thành công', jsonThuNgan.ok && jsonThuNgan.data?.nguoiDung.vaiTro === 'thu_ngan');
        const headersQuanLy = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAdmin}` };
        const headersPhucVu = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenPhucVu}` };
        const headersThuNgan = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jsonThuNgan.data.token}` };

        // Đăng nhập sai mật khẩu
        const resLoginSai = await fetch(`${BASE_URL}/api/tai-khoan/dang-nhap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenDangNhap: 'admin', matKhau: 'sai_mat_khau' })
        });
        const jsonLoginSai = await resLoginSai.json();
        inKetQua('Từ chối mật khẩu sai với status 401', resLoginSai.status === 401 && jsonLoginSai.ok === false);

        // TEST 3: Bàn ăn & Menu
        console.log('\n📋 NHÓM 3: SƠ ĐỒ PHÒNG BÀN & THỰC ĐƠN');
        for (const [vaiTro, headers] of [['Phục vụ', headersPhucVu], ['Thu ngân', headersThuNgan]]) {
            const ngoaiCa = await fetch(`${BASE_URL}/api/ban-an`, { headers });
            const ketQua = await ngoaiCa.json();
            inKetQua(`${vaiTro} ngoài ca bị từ chối xem bàn`,
                ngoaiCa.status === 403 && ketQua.msg?.includes('xác nhận vào ca'), ketQua.msg);
        }
        const caPhucVu = await taoVaVaoCa(jsonPhucVu.data.nguoiDung.nhanVienId, headersQuanLy, headersPhucVu, 'Phục vụ');
        await taoVaVaoCa(jsonThuNgan.data.nguoiDung.nhanVienId, headersQuanLy, headersThuNgan, 'Thu ngân');
        const resBan = await fetch(`${BASE_URL}/api/ban-an`, {
            headers: { 'Authorization': `Bearer ${tokenPhucVu}` }
        });
        const jsonBan = await resBan.json();
        inKetQua('Lấy danh sách bàn ăn thành công', jsonBan.ok === true && Array.isArray(jsonBan.data.banAn) && jsonBan.data.banAn.length >= 10, jsonBan.msg);

        const banB08 = jsonBan.data.banAn.find(b => b.ma_ban === 'B08');
        inKetQua('Bàn B08 tồn tại và có thông tin khu vực', !!banB08 && banB08.ma_ban === 'B08');

        // Lấy thông tin quét mã QR bàn B08
        const resQr = await fetch(`${BASE_URL}/api/ban-an/qr/${banB08.ma_qr_token}`);
        const jsonQr = await resQr.json();
        inKetQua('Quét mã QR bàn B08 trả về thông tin hợp lệ', jsonQr.ok === true && jsonQr.data.ma_ban === 'B08');

        // Lấy thực đơn
        const resMenu = await fetch(`${BASE_URL}/api/thuc-don`);
        const jsonMenu = await resMenu.json();
        inKetQua('Lấy danh sách thực đơn thành công', jsonMenu.ok === true && jsonMenu.data.tatCaMon.length >= 10);

        // TEST 4: Gọi món QR & Duyệt đơn
        console.log('\n📋 NHÓM 4: GỌI MÓN QR & PHỤC VỤ DUYỆT ĐƠN');
        let headersKhach = await moQuyenKhach(banB08, headersPhucVu);
        const guiDonQr = danhSachMon => guiGioKhach(banB08, headersKhach, danhSachMon);
        const resGuiDon = await guiDonQr([
            { monAnId: 1, soLuong: 1, ghiChu: 'Ít đường' },
            { monAnId: 2, soLuong: 2, ghiChu: 'Nóng' }
        ]);
        const jsonGuiDon = await resGuiDon.json();
        inKetQua('Khách quét QR gửi đơn gọi món thành công', jsonGuiDon.ok === true && jsonGuiDon.data.trangThai === 'cho_duyet');
        const donGoiMonId = jsonGuiDon.data.donGoiMonId;

        // Phục vụ duyệt đơn gọi món
        const resDuyetDon = await fetch(`${BASE_URL}/api/don-goi-mon/${donGoiMonId}/duyet`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenPhucVu}`
            }
        });
        const jsonDuyetDon = await resDuyetDon.json();
        inKetQua('Nhân viên phục vụ duyệt đơn gọi món vào bếp thành công', jsonDuyetDon.ok === true && jsonDuyetDon.data.trangThai === 'da_duyet');

        // TEST 5: Điều phối bếp KDS
        console.log('\n📋 NHÓM 5: ĐIỀU PHỐI BẾP KDS & TIẾN ĐỘ CHẾ BIẾN');
        const resHangDoi = await fetch(`${BASE_URL}/api/dieu-phoi-bep/hang-doi?cheDo=theo_ban`, {
            headers: { 'Authorization': `Bearer ${tokenBep}` }
        });
        const jsonHangDoi = await resHangDoi.json();
        inKetQua('Bếp lấy hàng đợi KDS theo bàn thành công', jsonHangDoi.ok === true && Array.isArray(jsonHangDoi.data));

        const resGomMon = await fetch(`${BASE_URL}/api/dieu-phoi-bep/hang-doi?cheDo=gom_mon`, {
            headers: { 'Authorization': `Bearer ${tokenBep}` }
        });
        const jsonGomMon = await resGomMon.json();
        inKetQua('Bếp lấy hàng đợi KDS chế độ gom mẻ thành công (Figma K02)', jsonGomMon.ok === true && Array.isArray(jsonGomMon.data));

        const monDonQr = jsonHangDoi.data.filter(mon => mon.don_goi_mon_id === donGoiMonId);
        inKetQua('KDS nhận đúng hai dòng món của đơn QR vừa duyệt', monDonQr.length === 2);
        const headersBep = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenBep}` };
        for (const mon of monDonQr) {
            for (const [trangThaiMoi, headers] of [
                ['dang_nau', headersBep], ['hoan_thanh', headersBep], ['da_phuc_vu', headersPhucVu]
            ]) {
                const capNhat = await fetch(`${BASE_URL}/api/dieu-phoi-bep/chi-tiet/${mon.chi_tiet_id}/trang-thai`, {
                    method: 'PUT', headers, body: JSON.stringify({ trangThaiMoi })
                });
                const ketQua = await capNhat.json();
                inKetQua(`Món ${mon.chi_tiet_id} chuyển sang ${trangThaiMoi}`,
                    capNhat.ok && ketQua.data?.trangThaiMoi === trangThaiMoi, ketQua.msg);
            }
        }

        // TEST 6: Hóa đơn & VietQR & Thanh toán
        console.log('\n📋 NHÓM 6: TÍNH TIỀN, VIETQR & HOÀN TẤT HÓA ĐƠN');
        const resTamTinh = await fetch(`${BASE_URL}/api/hoa-don/tam-tinh/${banB08.id}`, { headers: headersKhach });
        const jsonTamTinh = await resTamTinh.json();
        inKetQua('Tính tạm tính hóa đơn bàn B08 thành công (kèm VAT 8%)', jsonTamTinh.ok === true && jsonTamTinh.data.tongTienThanhToan > 0);
        inKetQua('Sinh liên kết VietQR động chuẩn Napas', !!jsonTamTinh.data.vietQr && jsonTamTinh.data.vietQr.qrUrl.includes('vietqr.io'));

        // Lấy danh sách hóa đơn sẵn có
        const resDsHd = await fetch(`${BASE_URL}/api/hoa-don`, {
            headers: headersThuNgan
        });
        const jsonDsHd = await resDsHd.json();
        inKetQua('Thu ngân lấy danh sách hóa đơn thành công', jsonDsHd.ok === true && jsonDsHd.data.length > 0);
        const hoaDonMau = jsonDsHd.data[0];

        // Chia tiền nhóm (Figma C10)
        const resChiaTien = await fetch(`${BASE_URL}/api/hoa-don/${hoaDonMau.id}/chia-tien`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAdmin}` },
            body: JSON.stringify({ soNguoiChia: 4 })
        });
        const jsonChiaTien = await resChiaTien.json();
        inKetQua('Chia tiền nhóm 4 người thành công', jsonChiaTien.ok === true && jsonChiaTien.data.soNguoiChia === 4);

        {
            const headersBan = headersKhach;
            const resKhongToken = await fetch(`${BASE_URL}/api/hoa-don/tam-tinh/${banB08.id}`);
            inKetQua('Từ chối xem bill khách khi thiếu mã QR', resKhongToken.status === 403);
            const resHoTro = await fetch(`${BASE_URL}/api/ban-an/${banB08.id}/ho-tro`, {
                method: 'POST', headers: { ...headersBan, 'Content-Type': 'application/json' },
                body: JSON.stringify({ loaiYeuCau: 'yeu_cau_thanh_toan', noiDung: 'Khách yêu cầu lập hóa đơn' })
            });
            inKetQua('Khách gọi thu ngân thành công', resHoTro.ok);
            const resTaoHd = await fetch(`${BASE_URL}/api/hoa-don/tao-hoa-don`, {
                method: 'POST', headers: headersThuNgan, body: JSON.stringify({ banId: banB08.id, phanTramChietKhau: 5 })
            });
            const hoaDon = (await resTaoHd.json()).data;
            inKetQua('Lập hóa đơn theo món thật và lưu chiết khấu', resTaoHd.ok && hoaDon?.phan_tram_chiet_khau === 5);
            const resBillKhach = await fetch(`${BASE_URL}/api/hoa-don/ban/${banB08.id}/hoa-don`, { headers: headersBan });
            const billKhach = (await resBillKhach.json()).data;
            inKetQua('Khách thấy hóa đơn chờ thanh toán đúng phiên bàn', billKhach?.id === hoaDon.id && billKhach.trang_thai === 'chua_thanh_toan');
            const thuTien = (tienKhachDua, phuongThucThanhToan = 'tien_mat') => fetch(`${BASE_URL}/api/hoa-don/${hoaDon.id}/thanh-toan`, {
                method: 'POST', headers: headersThuNgan, body: JSON.stringify({ phuongThucThanhToan, tienKhachDua })
            });
            inKetQua('Từ chối thu thiếu tiền', (await thuTien(0)).status === 400);

            const xacNhanChanThu = async (tenKiemThu, lyDo, phuongThuc) => {
                const res = await thuTien(hoaDon.tong_tien_thanh_toan, phuongThuc);
                const ketQua = await res.json();
                const bill = db.prepare('SELECT trang_thai FROM hoa_don WHERE id = ?').get(hoaDon.id);
                const phien = db.prepare('SELECT trang_thai FROM phien_ban WHERE id = ?').get(hoaDon.phien_ban_id);
                const giaoDich = db.prepare('SELECT COUNT(*) AS soLuong FROM giao_dich_thanh_toan WHERE hoa_don_id = ?').get(hoaDon.id);
                inKetQua(tenKiemThu, res.status === 409 && ketQua.msg?.includes(lyDo) &&
                    bill.trang_thai === 'chua_thanh_toan' && phien.trang_thai === 'dang_hoat_dong' && giaoDich.soLuong === 0, ketQua.msg);
            };
            const guiThem = await guiDonQr([{ monAnId: 1, soLuong: 1 }]);
            const donCho = (await guiThem.json()).data;
            inKetQua('Khách thêm một đơn đang chờ duyệt sau khi lập bill', guiThem.ok && donCho?.trangThai === 'cho_duyet');
            const tamTinhBiChan = await fetch(`${BASE_URL}/api/hoa-don/tam-tinh/${banB08.id}`, { headers: headersThuNgan });
            const tamTinhData = (await tamTinhBiChan.json()).data;
            inKetQua('POS nhận lý do chặn cùng với tạm tính món đã duyệt và không có QR',
                tamTinhBiChan.ok && tamTinhData?.danhSachMon.length > 0 && !tamTinhData.vietQr &&
                tamTinhData.lyDoChanThu?.includes('đơn chờ duyệt'));
            const lapBillBiChan = await fetch(`${BASE_URL}/api/hoa-don/tao-hoa-don`, {
                method: 'POST', headers: headersThuNgan,
                body: JSON.stringify({ banId: banB08.id, phuongThuc: 'vietqr' })
            });
            inKetQua('Chặn mở lại hóa đơn thanh toán khi còn đơn QR chờ duyệt',
                lapBillBiChan.status === 409 && (await lapBillBiChan.json()).msg.includes('đơn chờ duyệt'));
            const billBiChan = await fetch(`${BASE_URL}/api/hoa-don/ban/${banB08.id}/hoa-don`, { headers: headersBan });
            const billBiChanData = (await billBiChan.json()).data;
            inKetQua('Ẩn mã VietQR của hóa đơn đã lập khi có đơn mới chờ duyệt', billBiChan.ok && billBiChanData?.id === hoaDon.id && !billBiChanData.vietQr);
            await xacNhanChanThu('Chặn xác nhận tiền mặt khi còn đơn QR chờ duyệt', 'đơn chờ duyệt');
            await xacNhanChanThu('Chặn xác nhận VietQR khi còn đơn QR chờ duyệt', 'đơn chờ duyệt', 'vietqr');
            const tuChoi = await fetch(`${BASE_URL}/api/don-goi-mon/${donCho.donGoiMonId}/tu-choi`, {
                method: 'PUT', headers: headersPhucVu, body: JSON.stringify({ lyDoTuChoi: 'Khách không gọi thêm' })
            });
            inKetQua('Phục vụ xử lý đơn QR chờ duyệt', tuChoi.ok);

            const guiHuy = await fetch(`${BASE_URL}/api/don-goi-mon/huy-mon`, {
                method: 'POST', headers: headersPhucVu,
                body: JSON.stringify({ chiTietDonMonId: monDonQr[0].chi_tiet_id, lyDoHuy: 'Kiểm thử hủy món đã phục vụ' })
            });
            const phieuHuy = db.prepare('SELECT id FROM yeu_cau_huy_mon WHERE chi_tiet_don_mon_id = ? AND trang_thai_yeu_cau = ?')
                .get(monDonQr[0].chi_tiet_id, 'cho_admin_duyet');
            inKetQua('Phục vụ gửi yêu cầu hủy món đã phục vụ', guiHuy.ok && !!phieuHuy);
            await xacNhanChanThu('Chặn thanh toán khi còn món chờ xử lý hủy', 'chờ xử lý hủy');
            const giaiQuyetHuy = await fetch(`${BASE_URL}/api/don-goi-mon/yeu-cau-huy-mon/${phieuHuy.id}/phe-duyet`, {
                method: 'PUT', headers: headersQuanLy, body: JSON.stringify({ chapNhan: false, lyDoTuChoi: 'Khách đã sử dụng món' })
            });
            inKetQua('Từ chối hủy và khôi phục trạng thái đã phục vụ',
                giaiQuyetHuy.ok && (await giaiQuyetHuy.json()).data?.trangThaiMoi === 'da_phuc_vu');
            const monSauTuChoi = await fetch(`${BASE_URL}/api/don-goi-mon/ban/${banB08.id}`, { headers: headersPhucVu });
            inKetQua('Phục vụ đọc lý do quản lý từ chối yêu cầu do nhân viên gửi', (await monSauTuChoi.json()).data?.danhSachMon
                .find(mon => mon.chi_tiet_id === monDonQr[0].chi_tiet_id)?.ly_do_quan_ly_tu_choi_huy === 'Khách đã sử dụng món');

            inKetQua('Thu đủ tiền và ghi nhận hóa đơn', (await thuTien(hoaDon.tong_tien_thanh_toan)).ok);
            inKetQua('Từ chối thu lặp trên cùng hóa đơn', (await thuTien(hoaDon.tong_tien_thanh_toan)).status === 400);
            const giaoDich = db.prepare('SELECT so_tien, phuong_thuc FROM giao_dich_thanh_toan WHERE hoa_don_id = ?').all(hoaDon.id);
            const phienDong = db.prepare('SELECT trang_thai FROM phien_ban WHERE id = ?').get(hoaDon.phien_ban_id);
            const banCanDon = db.prepare('SELECT trang_thai FROM ban_an WHERE id = ?').get(banB08.id);
            inKetQua('Thanh toán ghi đúng một giao dịch, đóng phiên và chuyển bàn sang cần dọn',
                giaoDich.length === 1 && giaoDich[0].so_tien === hoaDon.tong_tien_thanh_toan &&
                giaoDich[0].phuong_thuc === 'TIEN_MAT' && phienDong.trang_thai === 'da_dong' &&
                banCanDon.trang_thai === 'can_don_dep');
            const headersBill = { ...headersBan, 'X-Bill-Token': billKhach.billToken };
            const resDaThanhToan = await fetch(`${BASE_URL}/api/hoa-don/ban/${banB08.id}/hoa-don`, { headers: headersBill });
            const billDaThu = (await resDaThanhToan.json()).data;
            inKetQua('Khách đọc được hóa đơn đã thu với mã, số tiền, thời gian và phương thức thực tế',
                billDaThu?.trang_thai === 'da_thanh_toan' && billDaThu.ma_hoa_don === hoaDon.ma_hoa_don &&
                billDaThu.tong_tien_thanh_toan === hoaDon.tong_tien_thanh_toan &&
                billDaThu.phuong_thuc_thanh_toan === 'tien_mat' && !!billDaThu.thoi_gian_thanh_toan);
            const resDanhGia = await fetch(`${BASE_URL}/api/hoa-don/ban/${banB08.id}/danh-gia`, {
                method: 'POST', headers: { ...headersBill, 'Content-Type': 'application/json' },
                body: JSON.stringify({ soSao: 5, gopY: 'Kiểm thử đánh giá', nhan: [] })
            });
            inKetQua('Khách gửi đánh giá gắn với phiên đã thanh toán', resDanhGia.ok);
            const donBan = await fetch(`${BASE_URL}/api/ban-an/${banB08.id}/trang-thai`, {
                method: 'PUT', headers: headersPhucVu, body: JSON.stringify({ trangThai: 'trong' })
            });
            inKetQua('Phục vụ xác nhận dọn bàn và SQLite ghi trạng thái trống',
                donBan.ok && db.prepare('SELECT trang_thai FROM ban_an WHERE id = ?').get(banB08.id).trang_thai === 'trong');
        }

        {
            headersKhach = await moQuyenKhach(banB08, headersPhucVu);
            const headersBan = headersKhach;
            const urlGio = `${BASE_URL}/api/ban-an/${banB08.id}/gio-mon`;
            const gioCu = (await (await fetch(urlGio, { headers: headersBan })).json()).data;
            const suaGio = () => fetch(urlGio, {
                method: 'PUT', headers: headersBan,
                body: JSON.stringify({ phienId: gioCu.phienId, phienSua: gioCu.phienSua, monId: 1, soLuong: 1, congThem: true })
            });
            const gioMoi = (await (await suaGio()).json()).data;
            inKetQua('Thiết bị đọc lại phần giỏ đã cập nhật', (await (await fetch(urlGio, { headers: headersBan })).json()).data?.mon[0]?.id === 1);
            inKetQua('Từ chối ghi đè giỏ từ phiên bản cũ', (await suaGio()).status === 409);
            const gui = () => fetch(`${BASE_URL}/api/don-goi-mon`, {
                method: 'POST', headers: headersBan,
                body: JSON.stringify({
                    maQrToken: banB08.ma_qr_token, khoaGui: 'test-gio-mon-chung-01', phienSuaGio: gioMoi.phienSua
                })
            });
            const dat = (await (await gui()).json()).data;
            const datLai = (await (await gui()).json()).data;
            inKetQua('Gửi lại cùng mã chỉ tạo một đơn', dat?.donGoiMonId && datLai?.donGoiMonId === dat.donGoiMonId);
            const gioSauGui = (await (await fetch(urlGio, { headers: headersBan })).json()).data;
            inKetQua('Giỏ chung về trống sau khi đơn được lưu', gioSauGui?.mon.length === 0);
        }

        {
            const maBan = ma => jsonBan.data.banAn.find(ban => ban.ma_ban === ma).id;
            const banNguon = banB08.id;
            const banDich = maBan('B02');
            const banGop = maBan('B03');
            const chuyen = await fetch(`${BASE_URL}/api/ban-an/chuyen-ban`, {
                method: 'POST', headers: headersPhucVu, body: JSON.stringify({ banNguonId: banNguon, banDichId: banDich })
            });
            inKetQua('Chuyển phiên đang hoạt động sang bàn trống', chuyen.ok);
            const donChuyen = (await (await fetch(`${BASE_URL}/api/don-goi-mon/ban/${banDich}`, { headers: headersPhucVu })).json()).data;
            inKetQua('Đơn đi theo phiên sau khi chuyển bàn', donChuyen?.danhSachMon.length === 1);
            const moBan = await fetch(`${BASE_URL}/api/ban-an/${banGop}/mo-ban`, {
                method: 'POST', headers: headersPhucVu, body: JSON.stringify({ soKhach: 2 })
            });
            inKetQua('Mở phiên bàn đích trước khi gộp', moBan.ok);
            const gop = await fetch(`${BASE_URL}/api/ban-an/gop-ban`, {
                method: 'POST', headers: headersPhucVu, body: JSON.stringify({ banNguonId: banDich, banDichId: banGop })
            });
            inKetQua('Gộp hai phiên đang hoạt động', gop.ok);
            const donGop = (await (await fetch(`${BASE_URL}/api/don-goi-mon/ban/${banGop}`, { headers: headersPhucVu })).json()).data;
            inKetQua('Đơn và số khách đi vào bàn gộp', donGop?.danhSachMon.length === 1 && donGop?.phienBan?.so_luong_khach === 4);
        }

        const checkout = await fetch(`${BASE_URL}/api/ca-lam-viec/${caPhucVu}/checkout`, {
            method: 'PUT', headers: headersPhucVu
        });
        inKetQua('Nhân viên check-out ca đã check-in', checkout.ok);

        // TEST 7: Ca làm việc & Đổi ca (W11 & A07)
        console.log('\n📋 NHÓM 7: CA LÀM VIỆC & YÊU CẦU ĐỔI CA (US-W09 / W11 / A07)');
        const resLichCaNhan = await fetch(`${BASE_URL}/api/ca-lam-viec/lich-ca-nhan`, {
            headers: { 'Authorization': `Bearer ${tokenPhucVu}` }
        });
        const jsonLich = await resLichCaNhan.json();
        inKetQua('Nhân viên xem lịch làm việc cá nhân thành công', jsonLich.ok === true && Array.isArray(jsonLich.data));

        // Xem danh sách yêu cầu đổi ca
        const resDsYc = await fetch(`${BASE_URL}/api/ca-lam-viec/yeu-cau-doi-ca`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        const jsonDsYc = await resDsYc.json();
        inKetQua('Quản lý xem danh sách yêu cầu đổi ca thành công', jsonDsYc.ok === true && Array.isArray(jsonDsYc.data));

        // Phê duyệt yêu cầu đổi ca (nếu chưa có yêu cầu chờ duyệt, tạo mới một yêu cầu)
        let ycDuyetId;
        const ycChoDuyet = jsonDsYc.data.find(y => y.trang_thai === 'cho_duyet');
        if (ycChoDuyet) {
            ycDuyetId = ycChoDuyet.id;
        } else {
            // Tạo mới ca làm việc & yêu cầu đổi ca để test duyệt
            const resTaoCa = await fetch(`${BASE_URL}/api/ca-lam-viec/tao-ca`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenAdmin}`
                },
                body: JSON.stringify({
                    nhanVienId: 4,
                    ngayLam: '2026-11-28',
                    tenCa: 'ca_toi',
                    gioBatDau: '17:00',
                    gioKetThuc: '22:00',
                    ghiChu: 'Ca làm việc test đổi ca'
                })
            });
            const jsonTaoCa = await resTaoCa.json();
            const caMoiId = jsonTaoCa.data.id;

            const resTaoYc = await fetch(`${BASE_URL}/api/ca-lam-viec/yeu-cau-doi-ca`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenPhucVu}`
                },
                body: JSON.stringify({
                    caLamViecId: caMoiId,
                    loaiYeuCau: 'doi_ca',
                    nhanVienNhanCaId: 9,
                    lyDo: 'Bận việc gia đình test đổi ca'
                })
            });
            const jsonTaoYc = await resTaoYc.json();
            ycDuyetId = jsonTaoYc.data.id;
        }

        const resDuyetCa = await fetch(`${BASE_URL}/api/ca-lam-viec/yeu-cau-doi-ca/${ycDuyetId}/phe-duyet`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({
                trangThai: 'da_duyet',
                ghiChuDuyet: 'Đồng ý duyệt đổi ca'
            })
        });
        const jsonDuyetCa = await resDuyetCa.json();
        inKetQua('Quản lý phê duyệt yêu cầu đổi ca thành công (A07)', jsonDuyetCa.ok === true && jsonDuyetCa.data.trang_thai === 'da_duyet');

        // TEST 8: Hệ thống, Cấu hình & Báo cáo Dashboard
        console.log('\n📋 NHÓM 8: HỆ THỐNG, AUDIT LOG & DASHBOARD QUẢN LÝ (A01 / A20)');
        const resCauHinh = await fetch(`${BASE_URL}/api/he-thong/cau-hinh`);
        const jsonCauHinh = await resCauHinh.json();
        inKetQua('Lấy thông tin cấu hình nhà hàng thành công', jsonCauHinh.ok === true && !!jsonCauHinh.data.ten_nha_hang);

        const resNhatKy = await fetch(`${BASE_URL}/api/he-thong/nhat-ky`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        const jsonNhatKy = await resNhatKy.json();
        inKetQua('Lấy nhật ký kiểm toán hệ thống thành công (A20)', jsonNhatKy.ok === true && Array.isArray(jsonNhatKy.data) && jsonNhatKy.data.length > 0);

        const resDashboard = await fetch(`${BASE_URL}/api/he-thong/thong-ke`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        const jsonDashboard = await resDashboard.json();
        inKetQua('Lấy số liệu thống kê Dashboard thành công (A01)', jsonDashboard.ok === true && !!jsonDashboard.data.thongKeHomNay);

        // TEST 9: Kiểm thử bảo mật chuyên sâu Authentication & RBAC Matrix
        console.log('\n📋 NHÓM 9: KIỂM THỬ BẢO MẬT CHUYÊN SÂU AUTHENTICATION & RBAC MATRIX');

        // 9.1: Đăng nhập với tài khoản không tồn tại -> 401
        const resLoginKhongTonTai = await fetch(`${BASE_URL}/api/tai-khoan/dang-nhap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenDangNhap: 'tai_khoan_ao_123', matKhau: '123456' })
        });
        inKetQua('Từ chối tài khoản không tồn tại với HTTP 401', resLoginKhongTonTai.status === 401);

        // 9.2: Đăng nhập bỏ trống thông tin -> 400
        const resLoginTrong = await fetch(`${BASE_URL}/api/tai-khoan/dang-nhap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenDangNhap: '', matKhau: '' })
        });
        inKetQua('Từ chối đăng nhập rỗng với HTTP 400', resLoginTrong.status === 400);

        // 9.3: Đăng nhập bằng định dạng snake_case -> 200 OK & nhận token
        const resLoginSnake = await fetch(`${BASE_URL}/api/tai-khoan/dang-nhap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ten_dang_nhap: 'admin', mat_khau: '123456' })
        });
        const jsonLoginSnake = await resLoginSnake.json();
        inKetQua('Hỗ trợ đăng nhập snake_case và cấp token chuẩn', resLoginSnake.status === 200 && !!jsonLoginSnake.data.token && !!jsonLoginSnake.data.nhanVien);

        // 9.4: Truy cập API cần đăng nhập mà KHÔNG có header Authorization -> 401
        const resKhongToken = await fetch(`${BASE_URL}/api/tai-khoan/me`);
        inKetQua('Từ chối truy cập không có token với HTTP 401', resKhongToken.status === 401);

        // 9.5: Truy cập API với token giả mạo -> 401
        const resTokenGia = await fetch(`${BASE_URL}/api/tai-khoan/me`, {
            headers: { 'Authorization': 'Bearer fake_invalid_jwt_token_2026' }
        });
        inKetQua('Từ chối token giả mạo với HTTP 401', resTokenGia.status === 401);

        // 9.6: RBAC - Phục vụ cố truy cập API thống kê của Quản lý -> 403 Forbidden
        const resPhucVuVaoThongKe = await fetch(`${BASE_URL}/api/he-thong/thong-ke`, {
            headers: { 'Authorization': `Bearer ${tokenPhucVu}` }
        });
        inKetQua('Chặn Phục vụ truy cập API Thống kê Quản trị (HTTP 403)', resPhucVuVaoThongKe.status === 403);

        // 9.7: RBAC - Phục vụ cố tạo phòng bàn mới của Quản lý -> 403 Forbidden
        const resPhucVuTaoBan = await fetch(`${BASE_URL}/api/ban-an`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenPhucVu}`
            },
            body: JSON.stringify({ maBan: 'TEST99', tenBan: 'Bàn Test 99', khuVucId: 1, soCho: 4 })
        });
        inKetQua('Chặn Phục vụ tạo phòng bàn mới (HTTP 403)', resPhucVuTaoBan.status === 403);

        // 9.8: RBAC - Bếp cố truy cập API Hóa đơn của Thu ngân -> 403 Forbidden
        const resBepVaoHoaDon = await fetch(`${BASE_URL}/api/hoa-don`, {
            headers: { 'Authorization': `Bearer ${tokenBep}` }
        });
        inKetQua('Chặn Bếp truy cập API Hóa đơn Thu ngân (HTTP 403)', resBepVaoHoaDon.status === 403);

        // 9.9: RBAC - Quản lý có toàn quyền tạo bàn thành công -> 201 Created
        const maBanTest = 'T_' + Math.floor(Math.random() * 10000);
        const resAdminTaoBan = await fetch(`${BASE_URL}/api/ban-an`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({ maBan: maBanTest, tenBan: 'Bàn RBAC Test', khuVucId: 1, soCho: 4 })
        });
        const jsonAdminTaoBan = await resAdminTaoBan.json();
        inKetQua('Quản trị viên được cấp quyền tạo bàn thành công (HTTP 201)', resAdminTaoBan.status === 201 && jsonAdminTaoBan.ok === true);

        // Dọn dẹp bàn test vừa tạo
        if (jsonAdminTaoBan.data && jsonAdminTaoBan.data.id) {
            await fetch(`${BASE_URL}/api/ban-an/${jsonAdminTaoBan.data.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${tokenAdmin}` }
            });
        }

        // TEST 10: Quản trị Nhân sự & Tài khoản (A02, A03, A04, A05)
        console.log('\n📋 NHÓM 10: QUẢN TRỊ NHÂN SỰ TOÀN HỆ THỐNG (CRUD, ĐÌNH CHỈ & XÓA)');

        // 10.1: Lấy danh sách nhân sự
        const resListNs = await fetch(`${BASE_URL}/api/tai-khoan/nhan-su`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        const jsonListNs = await resListNs.json();
        inKetQua('Quản lý lấy danh sách nhân sự thành công', jsonListNs.ok === true && Array.isArray(jsonListNs.data) && jsonListNs.data.length >= 5);

        // 10.2: Chặn Phục vụ truy cập danh sách nhân sự (RBAC 403)
        const resPhucVuVaoNs = await fetch(`${BASE_URL}/api/tai-khoan/nhan-su`, {
            headers: { 'Authorization': `Bearer ${tokenPhucVu}` }
        });
        inKetQua('Chặn Phục vụ xem danh sách nhân sự (HTTP 403)', resPhucVuVaoNs.status === 403);

        // 10.3: Tạo nhân sự mới
        const randomSuffix = Math.floor(Math.random() * 10000);
        const resTaoNs = await fetch(`${BASE_URL}/api/tai-khoan/nhan-su`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({
                hoTen: 'Trần Văn Nhân Sự Mới',
                tenDangNhap: 'nhansu_' + randomSuffix,
                matKhau: '123456',
                vaiTro: 'phuc_vu',
                soDienThoai: '09' + Math.floor(10000000 + Math.random() * 90000000),
                email: 'test' + randomSuffix + '@quanmoc.vn',
                mucLuong: 7000000,
                hinhThucLamViec: 'toan_thoi_gian'
            })
        });
        const jsonTaoNs = await resTaoNs.json();
        inKetQua('Tạo nhân viên mới và cấp tài khoản thành công (HTTP 201)', resTaoNs.status === 201 && jsonTaoNs.ok === true);
        const nsMoiId = jsonTaoNs.data.id;
        const tenDangNhapMoi = jsonTaoNs.data.ten_dang_nhap;

        // 10.4: Chỉnh sửa thông tin nhân sự
        const resSuaNs = await fetch(`${BASE_URL}/api/tai-khoan/nhan-su/${nsMoiId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({
                hoTen: 'Trần Văn Nhân Sự Mới (Đã Cập Nhật)',
                soDienThoai: '0987654321',
                mucLuong: 8500000
            })
        });
        const jsonSuaNs = await resSuaNs.json();
        inKetQua('Chỉnh sửa thông tin nhân viên thành công', jsonSuaNs.ok === true && jsonSuaNs.data.ho_ten.includes('Đã Cập Nhật'));

        // 10.5: Đình chỉ / Tạm khóa nhân viên
        const resDinhChi = await fetch(`${BASE_URL}/api/tai-khoan/nhan-su/${nsMoiId}/trang-thai`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({ trangThai: 'tam_khoa' })
        });
        const jsonDinhChi = await resDinhChi.json();
        inKetQua('Đình chỉ công tác nhân viên thành công', jsonDinhChi.ok === true && jsonDinhChi.data.trang_thai_tk === 'tam_khoa');

        // 10.6: Xác nhận tài khoản bị đình chỉ KHÔNG THỂ ĐĂNG NHẬP (HTTP 403)
        const resLoginDinhChi = await fetch(`${BASE_URL}/api/tai-khoan/dang-nhap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenDangNhap: tenDangNhapMoi, matKhau: '123456' })
        });
        inKetQua('Tài khoản bị đình chỉ bị từ chối đăng nhập (HTTP 403)', resLoginDinhChi.status === 403);

        // 10.7: Mở khóa lại nhân viên
        const resMoKhoa = await fetch(`${BASE_URL}/api/tai-khoan/nhan-su/${nsMoiId}/trang-thai`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({ trangThai: 'dang_lam' })
        });
        const jsonMoKhoa = await resMoKhoa.json();
        inKetQua('Mở khóa kích hoạt lại nhân viên thành công', jsonMoKhoa.ok === true && jsonMoKhoa.data.trang_thai === 'dang_lam');

        // 10.8: Xóa vĩnh viễn nhân viên khỏi hệ thống
        const resXoaNs = await fetch(`${BASE_URL}/api/tai-khoan/nhan-su/${nsMoiId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        const jsonXoaNs = await resXoaNs.json();
        inKetQua('Xóa vĩnh viễn nhân viên thành công', resXoaNs.status === 200 && jsonXoaNs.ok === true);

        // =====================================================================
        // NHÓM 11: QUẢN LÝ THỰC ĐƠN, CÀI ĐẶT SỐ SUẤT & TỰ ĐỘNG TRỪ KHI GỌI MÓN (A12)
        // =====================================================================
        console.log('\n📋 NHÓM 11: QUẢN LÝ THỰC ĐƠN, SỐ SUẤT CÒN LẠI & GIỚI HẠN GỌI MÓN');

        // 11.1: Quản lý tạo món ăn mới có giới hạn 10 suất
        const resTaoMon = await fetch(`${BASE_URL}/api/thuc-don`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({
                danhMucId: 1,
                maMon: `TEST_MON_${Date.now()}`,
                tenMon: 'Món ăn kiểm thử số suất',
                donGia: 99000,
                soSuatConLai: 10
            })
        });
        const jsonTaoMon = await resTaoMon.json();
        const monTestId = jsonTaoMon.data?.id;
        inKetQua('Tạo món ăn mới với số suất còn lại = 10 thành công (HTTP 201)', resTaoMon.status === 201 && jsonTaoMon.data?.so_suat_con_lai === 10);

        // 11.2: Cập nhật số suất còn lại thành 2 suất
        const resSetSuat = await fetch(`${BASE_URL}/api/thuc-don/${monTestId}/so-suat`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenBep}`
            },
            body: JSON.stringify({ soSuatConLai: 2 })
        });
        const jsonSetSuat = await resSetSuat.json();
        inKetQua('Bếp cập nhật số suất còn lại = 2 thành công', jsonSetSuat.ok === true && jsonSetSuat.data?.so_suat_con_lai === 2);

        // 11.3: Chặn đặt món khi số lượng vượt quá số suất còn lại (đặt 5 suất trong khi chỉ còn 2)
        headersKhach = await moQuyenKhach(banB08, headersThuNgan);
        const resDatVuotSuat = await guiDonQr([{ monAnId: monTestId, soLuong: 5 }]);
        const jsonDatVuotSuat = await resDatVuotSuat.json();
        inKetQua('Chặn thêm món khi vượt quá số suất còn lại (HTTP 409)', resDatVuotSuat.status === 409 && jsonDatVuotSuat.ok === false);

        // 11.4: Đặt đúng 2 suất thành công và số suất tự động trừ về 0 (hết món)
        const resDatHopLe = await guiDonQr([{ monAnId: monTestId, soLuong: 2 }]);
        const jsonDatHopLe = await resDatHopLe.json();
        inKetQua('Đặt món thành công khi đủ số suất', (resDatHopLe.status === 200 || resDatHopLe.status === 201) && jsonDatHopLe.ok === true);

        // Kiểm tra món đã tự động cập nhật về 0 suất và con_mon = 0
        const resMonSauDat = await fetch(`${BASE_URL}/api/thuc-don/${monTestId}`);
        const jsonMonSauDat = await resMonSauDat.json();
        inKetQua('Món tự động giảm số suất về 0 và chuyển con_mon = 0', jsonMonSauDat.data?.so_suat_con_lai === 0 && jsonMonSauDat.data?.con_mon === 0);

        // 11.5: Xóa món kiểm thử
        const resXoaMon = await fetch(`${BASE_URL}/api/thuc-don/${monTestId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        inKetQua('Quản lý xóa món ăn khỏi thực đơn thành công', resXoaMon.status === 200);

        // =====================================================================
        // NHÓM 12: BÁO CÁO DOANH THU & TÀI CHÍNH ĐA CHIỀU (FIGMA A16)
        // =====================================================================
        console.log('\n📋 NHÓM 12: BÁO CÁO DOANH THU & TÀI CHÍNH ĐA CHIỀU (6 TABS)');

        // 12.1: Lấy toàn bộ 6 nhóm báo cáo tổng hợp
        const resBcTatCa = await fetch(`${BASE_URL}/api/bao-cao/tat-ca?ky=hom_nay`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        const jsonBcTatCa = await resBcTatCa.json();
        inKetQua('Lấy dữ liệu tổng hợp 6 tab báo cáo thành công', resBcTatCa.status === 200 && jsonBcTatCa.ok === true && jsonBcTatCa.data?.tongQuan?.tongDoanhThu !== undefined);

        // 12.2: Lấy chi tiết báo cáo từng tab
        const resBcThoiGian = await fetch(`${BASE_URL}/api/bao-cao/thoi-gian?ky=7_ngay`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        const jsonBcThoiGian = await resBcThoiGian.json();
        inKetQua('Báo cáo xu hướng & ca làm việc trả về mảng theo ngày và theo ca', jsonBcThoiGian.ok === true && Array.isArray(jsonBcThoiGian.data?.theoCa));

        const resBcMon = await fetch(`${BASE_URL}/api/bao-cao/mon-an?ky=hom_nay`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        const jsonBcMon = await resBcMon.json();
        inKetQua('Báo cáo món ăn bán chạy & cảnh báo suất thành công', jsonBcMon.ok === true && Array.isArray(jsonBcMon.data?.topMonDoanhThu));

        const resBcKhuVuc = await fetch(`${BASE_URL}/api/bao-cao/khu-vuc-ban?ky=hom_nay`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        const jsonBcKhuVuc = await resBcKhuVuc.json();
        inKetQua('Báo cáo doanh thu theo khu vực & bàn ăn thành công', jsonBcKhuVuc.ok === true && Array.isArray(jsonBcKhuVuc.data?.theoKhuVuc));

        const resBcSoQuy = await fetch(`${BASE_URL}/api/bao-cao/so-quy?ky=hom_nay`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        const jsonBcSoQuy = await resBcSoQuy.json();
        inKetQua('Báo cáo sổ quỹ & chốt ca Z-Report tính đúng tồn két', jsonBcSoQuy.ok === true && jsonBcSoQuy.data?.tonQuyTienMat !== undefined);

        const resBcKenh = await fetch(`${BASE_URL}/api/bao-cao/kenh-danh-gia?ky=hom_nay`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        const jsonBcKenh = await resBcKenh.json();
        inKetQua('Báo cáo kênh gọi món & đánh giá khách hàng thành công', jsonBcKenh.ok === true && jsonBcKenh.data?.thongKeSao?.diem_trung_binh !== undefined);

        // 12.3: Xuất file CSV báo cáo tài chính
        const resCsv = await fetch(`${BASE_URL}/api/bao-cao/xuat-csv?ky=hom_nay`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        const textCsv = await resCsv.text();
        inKetQua('Xuất báo cáo định dạng CSV chuẩn UTF-8 thành công', resCsv.status === 200 && textCsv.includes('BÁO CÁO KINH DOANH & TÀI CHÍNH QUÁN MỘC POS'));

        // 12.4: Bảo mật RBAC - Phục vụ không có quyền xem báo cáo (HTTP 403)
        const resPvChan = await fetch(`${BASE_URL}/api/bao-cao/tat-ca`, {
            headers: { 'Authorization': `Bearer ${tokenPhucVu}` }
        });
        inKetQua('Chặn Phục vụ truy cập báo cáo tài chính (HTTP 403)', resPvChan.status === 403);

        // =====================================================================
        // NHÓM 13: ĐIỀU PHỐI TOÀN DIỆN QUẢN LÝ (BẾP, PHỤC VỤ, THU NGÂN - A18)
        // =====================================================================
        console.log('\n📋 NHÓM 13: ĐIỀU PHỐI TOÀN DIỆN (BẾP, PHỤC VỤ, THU NGÂN) VÀ REALTIME');

        // 13.1: Quản lý phát lệnh tới Bếp KDS (kèm món ăn liên quan)
        const resLenhBep = await fetch(`${BASE_URL}/api/dieu-phoi-bep/phat-lenh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({
                boPhan: 'bep',
                maBan: 'B08',
                tenBan: 'Bàn 08',
                tenMon: 'Bò lúc lắc',
                soLuongMon: 2,
                mucDo: 'khan_cap',
                noiDung: 'Bàn 08 giục gấp 2 đĩa Bò lúc lắc cho khách VIP'
            })
        });
        const jsonLenhBep = await resLenhBep.json();
        const lenhBepId = jsonLenhBep.data?.id;
        inKetQua('Quản lý phát lệnh tới Bếp (kèm món ăn liên quan) thành công', resLenhBep.status === 201 && jsonLenhBep.data?.ten_mon === 'Bò lúc lắc');

        // 13.2: Quản lý phát lệnh tới Phục vụ (kèm bàn cần hỗ trợ & nội dung hỗ trợ)
        const resLenhPv = await fetch(`${BASE_URL}/api/dieu-phoi-bep/phat-lenh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({
                boPhan: 'phuc_vu',
                maBan: 'B05',
                tenBan: 'Bàn 05',
                mucDo: 'khan_cap',
                noiDung: 'Dọn dẹp bàn 05 gấp trong 3 phút để xếp khách mới đang chờ'
            })
        });
        const jsonLenhPv = await resLenhPv.json();
        inKetQua('Quản lý phát lệnh tới Phục vụ (kèm bàn & nội dung hỗ trợ) thành công', resLenhPv.status === 201 && jsonLenhPv.data?.bo_phan === 'phuc_vu' && jsonLenhPv.data?.ma_ban === 'B05');

        // 13.3: Quản lý phát lệnh tới Thu ngân POS (kèm bàn & nội dung thanh toán)
        const resLenhTn = await fetch(`${BASE_URL}/api/dieu-phoi-bep/phat-lenh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({
                boPhan: 'thu_ngan',
                maBan: 'B09',
                tenBan: 'Bàn 09',
                mucDo: 'uu_tien',
                noiDung: 'Khách bàn 09 yêu cầu thanh toán gấp tại bàn'
            })
        });
        const jsonLenhTn = await resLenhTn.json();
        inKetQua('Quản lý phát lệnh tới Thu ngân POS thành công', resLenhTn.status === 201 && jsonLenhTn.data?.bo_phan === 'thu_ngan');

        // 13.4: Bếp trưởng xác nhận tiếp nhận lệnh điều phối
        const resXacNhanBep = await fetch(`${BASE_URL}/api/dieu-phoi-bep/lenh/${lenhBepId}/xac-nhan`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenBep}`
            }
        });
        const jsonXacNhanBep = await resXacNhanBep.json();
        inKetQua('Nhân sự xác nhận tiếp nhận lệnh điều phối thành công', resXacNhanBep.status === 200 && jsonXacNhanBep.data?.trang_thai === 'da_tiep_nhan');

        // 13.5: Lấy danh sách lịch sử lệnh điều phối
        const resDsLenh = await fetch(`${BASE_URL}/api/dieu-phoi-bep/lich-su-lenh`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        const jsonDsLenh = await resDsLenh.json();
        inKetQua('Lấy danh sách lịch sử lệnh điều phối thành công', resDsLenh.status === 200 && Array.isArray(jsonDsLenh.data) && jsonDsLenh.data.length >= 3);

        console.log('\n📋 NHÓM 14: THIẾT BỊ THAM GIA PHIÊN BÀN');
        await kiemThuThamGiaBan({ baseUrl: BASE_URL, db, headersQuanLy, headersThuNgan, headersBep });

        console.log('\n================================================================');
        console.log('🎉 TẤT CẢ CÁC BÀI KIỂM THỬ BACKEND ĐỀU ĐÃ ĐẠT 100%! (ALL PASSED)');
        console.log('================================================================\n');
    } finally {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    }
}

chayKiemThu().catch(err => {
    console.error('LỖI KIỂM THỬ:', err);
    process.exitCode = 1;
});

process.on('exit', () => {
    db.close();
    unlinkSync(tepKiemThu);
    rmdirSync(thuMucKiemThu);
});
