/**
 * KỊCH BẢN KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN (AUTOMATED TEST SUITE)
 * Kiểm tra đầy đủ các User Story của Sprint 1:
 * - Bảo mật nền tảng: US-001 -> US-006
 * - Tài khoản cá nhân: US-007 -> US-010
 * - Vai trò & Quyền hạn: US-015 -> US-022
 * - Quản trị nền tảng: US-041 -> US-044
 */
process.env.NODE_ENV = 'test';
const http = require('http');
const app = require('../backend/ungDung');
const { khoiTaoCoSoDuLieu } = require('../backend/cauHinh/ketNoiCoSoDuLieu');

const TEST_PORT = 3099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let server = null;
let tongSoKiemThu = 0;
let soKiemThuThanhCong = 0;
let soKiemThuThatBai = 0;

function ghiKetQua(tenKiemThu, thanhCong, thongDiep = '') {
    tongSoKiemThu++;
    if (thanhCong) {
        soKiemThuThanhCong++;
        console.log(`  \x1b[32m✔ [PASS]\x1b[0m ${tenKiemThu}`);
    } else {
        soKiemThuThatBai++;
        console.error(`  \x1b[31m✖ [FAIL]\x1b[0m ${tenKiemThu} - ${thongDiep}`);
    }
}

async function guiYeuCau(duongDan, tuyChon = {}) {
    const url = `${BASE_URL}${duongDan}`;
    const headers = tuyChon.headers || {};
    if (tuyChon.body && typeof tuyChon.body === 'object') {
        headers['Content-Type'] = 'application/json';
        tuyChon.body = JSON.stringify(tuyChon.body);
    }
    const phanHoi = await fetch(url, { ...tuyChon, headers });
    const duLieuJson = await phanHoi.json().catch(() => null);
    return {
        status: phanHoi.status,
        headers: phanHoi.headers,
        body: duLieuJson
    };
}

async function chayToanBoKiemThu() {
    console.log('================================================================');
    console.log('  BẮT ĐẦU CHẠY KIỂM THỬ TỰ ĐỘNG BACKEND & API (SPRINT 1)');
    console.log('================================================================\n');

    // Khởi tạo CSDL
    khoiTaoCoSoDuLieu();

    // Khởi động server test
    await new Promise((resolve) => {
        server = http.createServer(app);
        server.listen(TEST_PORT, () => resolve());
    });

    try {
        let tokenQuanLy = null;
        let refreshTokenQuanLy = null;
        let tokenThuNgan = null;
        let vaiTroMoiId = null;

        // -------------------------------------------------------------
        // NHÓM 1: BẢO MẬT NỀN TẢNG & KIỂM TRA ĐẦU VÀO (US-001 -> US-006)
        // -------------------------------------------------------------
        console.log('--- 1. BẢO MẬT NỀN TẢNG (US-001 -> US-006) ---');

        // Kiểm tra Health Check
        const resHealth = await guiYeuCau('/api/kiem-tra-suc-khoe');
        ghiKetQua('API Health Check hoạt động bình thường', resHealth.status === 200 && resHealth.body.ok === true);

        // US-006: Input validation - thiếu tên đăng nhập
        const resVal1 = await guiYeuCau('/api/tai-khoan/dang-nhap', {
            method: 'POST',
            body: { matKhau: 'MatKhau@123' }
        });
        ghiKetQua('US-006: Bắt lỗi khi thiếu tên đăng nhập', resVal1.status === 400 && resVal1.body.ok === false);

        // US-006: Input validation - làm sạch HTML (Sanitize chống XSS)
        const { lamSachHtml } = require('../backend/tienIch/lamSachHtml');
        const chuoiDoc = '<script>alert("XSS")</script>';
        const chuoiSach = lamSachHtml(chuoiDoc);
        ghiKetQua('US-006: Làm sạch chuỗi HTML/Script độc hại', !chuoiSach.includes('<script>') && chuoiSach.includes('&lt;script&gt;'));

        // US-001: Bcrypt hashing
        const { bamMatKhau, kiemTraMatKhau } = require('../backend/tienIch/maHoaMatKhau');
        const hash = await bamMatKhau('MatKhauKiemThu@123');
        const khop = await kiemTraMatKhau('MatKhauKiemThu@123', hash);
        const sai = await kiemTraMatKhau('MatKhauSai@123', hash);
        ghiKetQua('US-001: Băm và xác thực mật khẩu bcrypt chính xác', khop === true && sai === false);

        // US-004: Chặn truy cập trái phép khi chưa đăng nhập (401)
        const res401 = await guiYeuCau('/api/tai-khoan/ho-so');
        ghiKetQua('US-004: Chặn truy cập trái phép vào API hồ sơ khi chưa có Token (HTTP 401)', res401.status === 401 && res401.body.ok === false);

        // -------------------------------------------------------------
        // NHÓM 2: TÀI KHOẢN CÁ NHÂN (US-007 -> US-010)
        // -------------------------------------------------------------
        console.log('\n--- 2. TÀI KHOẢN CÁ NHÂN (US-007 -> US-010) ---');

        // US-007: Đăng nhập sai mật khẩu
        const resDangNhapSai = await guiYeuCau('/api/tai-khoan/dang-nhap', {
            method: 'POST',
            body: { tenDangNhap: 'quanly', matKhau: 'MatKhauSai' }
        });
        ghiKetQua('US-007: Từ chối đăng nhập khi sai mật khẩu (HTTP 401)', resDangNhapSai.status === 401 && resDangNhapSai.body.ok === false);

        // US-007: Đăng nhập thành công với tài khoản Quản lý
        const resDangNhapQL = await guiYeuCau('/api/tai-khoan/dang-nhap', {
            method: 'POST',
            body: { tenDangNhap: 'quanly', matKhau: 'MatKhau@123' }
        });
        tokenQuanLy = resDangNhapQL.body?.data?.tokens?.accessToken;
        refreshTokenQuanLy = resDangNhapQL.body?.data?.tokens?.refreshToken;
        ghiKetQua(
            'US-007: Đăng nhập thành công với vai trò Quản lý và nhận JWT Token',
            resDangNhapQL.status === 200 && !!tokenQuanLy && resDangNhapQL.body.data.taiKhoan.vaiTro.includes('QUAN_LY')
        );

        // Đăng nhập tài khoản Thu ngân để kiểm tra phân quyền sau
        const resDangNhapTN = await guiYeuCau('/api/tai-khoan/dang-nhap', {
            method: 'POST',
            body: { tenDangNhap: 'thungan', matKhau: 'MatKhau@123' }
        });
        tokenThuNgan = resDangNhapTN.body?.data?.tokens?.accessToken;
        ghiKetQua(
            'US-007: Đăng nhập thành công với tài khoản Thu ngân',
            resDangNhapTN.status === 200 && !!tokenThuNgan
        );

        // US-003: Làm mới token (Refresh Token)
        const resRefresh = await guiYeuCau('/api/tai-khoan/lam-moi-token', {
            method: 'POST',
            body: { refreshToken: refreshTokenQuanLy }
        });
        ghiKetQua(
            'US-003: Cơ chế Refresh Token cấp lại Access Token mới thành công',
            resRefresh.status === 200 && !!resRefresh.body?.data?.accessToken
        );

        // US-010: Xem hồ sơ cá nhân
        const resHoSo = await guiYeuCau('/api/tai-khoan/ho-so', {
            headers: { Authorization: `Bearer ${tokenQuanLy}` }
        });
        ghiKetQua(
            'US-010: Xem thông tin hồ sơ cá nhân thành công',
            resHoSo.status === 200 && resHoSo.body?.data?.tenDangNhap === 'quanly'
        );

        // US-010: Cập nhật hồ sơ cá nhân
        const resCapNhatHoSo = await guiYeuCau('/api/tai-khoan/ho-so', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${tokenQuanLy}` },
            body: { hoTen: 'Nguyễn Văn Quản Lý Cập Nhật', soDienThoai: '0901234567' }
        });
        ghiKetQua(
            'US-010: Cập nhật hồ sơ cá nhân thành công',
            resCapNhatHoSo.status === 200 && resCapNhatHoSo.body?.data?.hoTen === 'Nguyễn Văn Quản Lý Cập Nhật'
        );

        // US-009: Đổi mật khẩu cá nhân
        const resDoiMatKhau = await guiYeuCau('/api/tai-khoan/doi-mat-khau', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${tokenQuanLy}` },
            body: {
                matKhauCu: 'MatKhau@123',
                matKhauMoi: 'MatKhauMoi@456',
                xacNhanMatKhauMoi: 'MatKhauMoi@456'
            }
        });
        ghiKetQua('US-009: Đổi mật khẩu cá nhân thành công', resDoiMatKhau.status === 200 && resDoiMatKhau.body.ok === true);

        // Đổi lại mật khẩu cũ để không ảnh hưởng kiểm thử tiếp theo
        const resDangNhapMoi = await guiYeuCau('/api/tai-khoan/dang-nhap', {
            method: 'POST',
            body: { tenDangNhap: 'quanly', matKhau: 'MatKhauMoi@456' }
        });
        tokenQuanLy = resDangNhapMoi.body.data.tokens.accessToken;
        await guiYeuCau('/api/tai-khoan/doi-mat-khau', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${tokenQuanLy}` },
            body: {
                matKhauCu: 'MatKhauMoi@456',
                matKhauMoi: 'MatKhau@123',
                xacNhanMatKhauMoi: 'MatKhau@123'
            }
        });
        // Lấy lại token với mật khẩu gốc
        const resDangNhapReset = await guiYeuCau('/api/tai-khoan/dang-nhap', {
            method: 'POST',
            body: { tenDangNhap: 'quanly', matKhau: 'MatKhau@123' }
        });
        tokenQuanLy = resDangNhapReset.body.data.tokens.accessToken;

        // US-008: Đăng xuất
        const resDangXuat = await guiYeuCau('/api/tai-khoan/dang-xuat', {
            method: 'POST',
            body: { refreshToken: refreshTokenQuanLy }
        });
        ghiKetQua('US-008: Đăng xuất và thu hồi Refresh Token thành công', resDangXuat.status === 200 && resDangXuat.body.ok === true);

        // -------------------------------------------------------------
        // NHÓM 3: VAI TRÒ & PHÂN QUYỀN (US-015 -> US-022)
        // -------------------------------------------------------------
        console.log('\n--- 3. VAI TRÒ & QUYỀN HẠN (US-015 -> US-022) ---');

        // US-004 & US-021: Thu ngân không có quyền truy cập API quản lý vai trò (403)
        const res403VaiTro = await guiYeuCau('/api/vai-tro', {
            headers: { Authorization: `Bearer ${tokenThuNgan}` }
        });
        ghiKetQua(
            'US-004 & US-021: Chặn tài khoản Thu ngân truy cập API quản lý Vai trò (HTTP 403 Forbidden)',
            res403VaiTro.status === 403 && res403VaiTro.body.ok === false
        );

        // US-015: Xem danh sách vai trò (Quản lý)
        const resDanhSachVaiTro = await guiYeuCau('/api/vai-tro', {
            headers: { Authorization: `Bearer ${tokenQuanLy}` }
        });
        ghiKetQua(
            'US-015: Quản lý xem danh sách các vai trò trong nhà hàng kèm quyền',
            resDanhSachVaiTro.status === 200 && Array.isArray(resDanhSachVaiTro.body.data) && resDanhSachVaiTro.body.data.length >= 4
        );

        // Lấy danh mục quyền
        const resDanhMucQuyen = await guiYeuCau('/api/vai-tro/danh-muc-quyen', {
            headers: { Authorization: `Bearer ${tokenQuanLy}` }
        });
        ghiKetQua(
            'Lấy danh mục tất cả quyền có trong hệ thống',
            resDanhMucQuyen.status === 200 && Array.isArray(resDanhMucQuyen.body.data) && resDanhMucQuyen.body.data.length >= 16
        );

        // US-016: Tạo mới vai trò
        const resTaoVaiTro = await guiYeuCau('/api/vai-tro', {
            method: 'POST',
            headers: { Authorization: `Bearer ${tokenQuanLy}` },
            body: {
                maVaiTro: 'TO_TRUONG_TEST',
                tenVaiTro: 'Tổ trưởng phục vụ Test',
                moTa: 'Vai trò dùng kiểm thử tự động'
            }
        });
        vaiTroMoiId = resTaoVaiTro.body?.data?.id;
        ghiKetQua(
            'US-016: Tạo mới vai trò thành công',
            resTaoVaiTro.status === 201 && !!vaiTroMoiId && resTaoVaiTro.body.data.ma_vai_tro === 'TO_TRUONG_TEST'
        );

        // US-016: Chỉnh sửa vai trò
        const resSuaVaiTro = await guiYeuCau(`/api/vai-tro/${vaiTroMoiId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${tokenQuanLy}` },
            body: {
                tenVaiTro: 'Tổ trưởng phục vụ Đã sửa',
                moTa: 'Mô tả đã được cập nhật'
            }
        });
        ghiKetQua(
            'US-016: Chỉnh sửa thông tin vai trò thành công',
            resSuaVaiTro.status === 200 && resSuaVaiTro.body.data.ten_vai_tro === 'Tổ trưởng phục vụ Đã sửa'
        );

        // US-018: Cấu hình quyền truy cập chi tiết cho vai trò
        const resCapNhatQuyen = await guiYeuCau(`/api/vai-tro/${vaiTroMoiId}/quyen`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${tokenQuanLy}` },
            body: { danhSachQuyenId: [3, 4, 9] }
        });
        ghiKetQua(
            'US-018: Cấu hình danh sách quyền chi tiết cho vai trò thành công',
            resCapNhatQuyen.status === 200 && resCapNhatQuyen.body.data.quyenHan.length === 3
        );

        // US-017: Gán vai trò cho tài khoản nhân viên
        const resGanVaiTro = await guiYeuCau('/api/vai-tro/gan-vai-tro', {
            method: 'POST',
            headers: { Authorization: `Bearer ${tokenQuanLy}` },
            body: {
                taiKhoanId: 4, // phucvu
                danhSachVaiTroId: [4, vaiTroMoiId]
            }
        });
        ghiKetQua(
            'US-017: Gán vai trò cho nhân viên thành công',
            resGanVaiTro.status === 200 && resGanVaiTro.body.data.taiKhoanId === 4
        );

        // US-022: Xem lịch sử thay đổi quyền hạn nhân sự
        const resLichSuPhanQuyen = await guiYeuCau('/api/vai-tro/lich-su-thay-doi', {
            headers: { Authorization: `Bearer ${tokenQuanLy}` }
        });
        ghiKetQua(
            'US-022: Ghi nhận và xem lịch sử thay đổi quyền hạn nhân sự (Audit Trail)',
            resLichSuPhanQuyen.status === 200 && resLichSuPhanQuyen.body.data.danhSach.length > 0
        );

        // US-016: Thử xóa vai trò hệ thống mặc định (phải bị từ chối)
        const resXoaVaiTroHeThong = await guiYeuCau('/api/vai-tro/1', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${tokenQuanLy}` }
        });
        ghiKetQua(
            'US-016: Ngăn chặn xóa vai trò hệ thống mặc định (QUAN_LY)',
            resXoaVaiTroHeThong.status === 403
        );

        // US-016: Xóa vai trò tùy chỉnh vừa tạo
        const resXoaVaiTro = await guiYeuCau(`/api/vai-tro/${vaiTroMoiId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${tokenQuanLy}` }
        });
        ghiKetQua('US-016: Xóa vai trò tùy chỉnh thành công', resXoaVaiTro.status === 200);

        // -------------------------------------------------------------
        // NHÓM 4: QUẢN TRỊ NỀN TẢNG (US-041 -> US-044)
        // -------------------------------------------------------------
        console.log('\n--- 4. QUẢN TRỊ NỀN TẢNG (US-041 -> US-044) ---');

        // Thông tin công khai E-Menu
        const resCongKhai = await guiYeuCau('/api/cau-hinh-nha-hang/cong-khai');
        ghiKetQua(
            'API công khai thông tin nhà hàng cho E-Menu khách hàng truy cập không cần token',
            resCongKhai.status === 200 && !!resCongKhai.body.data.tenNhaHang
        );

        // US-041: Xem thông tin cấu hình nhà hàng
        const resThongTin = await guiYeuCau('/api/cau-hinh-nha-hang/thong-tin', {
            headers: { Authorization: `Bearer ${tokenQuanLy}` }
        });
        ghiKetQua(
            'US-041: Xem thông tin nhà hàng (Tên, địa chỉ, hotline, wifi)',
            resThongTin.status === 200 && resThongTin.body.data.tenNhaHang.includes('Quán Mộc')
        );

        // US-041: Cập nhật thông tin cấu hình nhà hàng
        const resCapNhatThongTin = await guiYeuCau('/api/cau-hinh-nha-hang/thong-tin', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${tokenQuanLy}` },
            body: {
                tenNhaHang: 'Nhà Hàng Quán Mộc Sài Gòn',
                wifiMatKhau: 'quanmoc999'
            }
        });
        ghiKetQua(
            'US-041: Cập nhật cấu hình thông tin nhà hàng thành công',
            resCapNhatThongTin.status === 200 && resCapNhatThongTin.body.data.tenNhaHang === 'Nhà Hàng Quán Mộc Sài Gòn'
        );

        // US-042: Xem cấu hình thuế VAT và phí phục vụ
        const resThuePhi = await guiYeuCau('/api/cau-hinh-nha-hang/thue-phi', {
            headers: { Authorization: `Bearer ${tokenQuanLy}` }
        });
        ghiKetQua(
            'US-042: Xem cấu hình thuế VAT và phí phục vụ',
            resThuePhi.status === 200 && resThuePhi.body.data.vatPhanTram !== undefined
        );

        // US-042: Cập nhật thuế VAT và phí phục vụ
        const resCapNhatThuePhi = await guiYeuCau('/api/cau-hinh-nha-hang/thue-phi', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${tokenQuanLy}` },
            body: {
                vatPhanTram: 10.0,
                phiPhucVuPhanTram: 5.0,
                apDungVat: 1,
                apDungPhiPhucVu: 1
            }
        });
        ghiKetQua(
            'US-042: Cập nhật cấu hình thuế VAT (10%) và phí phục vụ (5%) thành công',
            resCapNhatThuePhi.status === 200 && resCapNhatThuePhi.body.data.vatPhanTram === 10
        );

        // US-043: Xem cấu hình tài khoản VietQR
        const resVietQr = await guiYeuCau('/api/cau-hinh-nha-hang/viet-qr', {
            headers: { Authorization: `Bearer ${tokenQuanLy}` }
        });
        ghiKetQua(
            'US-043: Xem cấu hình tài khoản ngân hàng nhận thanh toán VietQR',
            resVietQr.status === 200 && !!resVietQr.body.data.soTaiKhoan
        );

        // US-043: Cập nhật thông tin VietQR
        const resCapNhatVietQr = await guiYeuCau('/api/cau-hinh-nha-hang/viet-qr', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${tokenQuanLy}` },
            body: {
                nganHangMa: 'VCB',
                nganHangTen: 'Vietcombank',
                soTaiKhoan: '9876543210',
                chuTaiKhoan: 'NHA HANG QUAN MOC'
            }
        });
        ghiKetQua(
            'US-043: Cập nhật tài khoản ngân hàng VietQR thành công',
            resCapNhatVietQr.status === 200 && resCapNhatVietQr.body.data.nganHangMa === 'VCB'
        );

        // US-043: Tạo mã QR thanh toán động VietQR Napas
        const resTaoMaQr = await guiYeuCau('/api/cau-hinh-nha-hang/viet-qr/tao-ma', {
            method: 'POST',
            headers: { Authorization: `Bearer ${tokenQuanLy}` },
            body: {
                soTien: 350000,
                maHoaDon: 'HD-20261019-088'
            }
        });
        ghiKetQua(
            'US-043: Sinh URL ảnh mã VietQR thanh toán tự động theo chuẩn Napas',
            resTaoMaQr.status === 200 && !!resTaoMaQr.body.data.qrImageUrl && resTaoMaQr.body.data.qrImageUrl.includes('vietqr.io')
        );

        // US-044: Truy xuất nhật ký hệ thống (System Logs)
        const resNhatKy = await guiYeuCau('/api/cau-hinh-nha-hang/nhat-ky-he-thong', {
            headers: { Authorization: `Bearer ${tokenQuanLy}` }
        });
        ghiKetQua(
            'US-044: Truy xuất nhật ký hệ thống (System Logs) có phân trang và bộ lọc',
            resNhatKy.status === 200 && Array.isArray(resNhatKy.body.data.danhSach) && resNhatKy.body.data.tongSo > 0
        );

    } catch (loi) {
        console.error('Lỗi ngoại lệ trong quá trình chạy kiểm thử:', loi);
    } finally {
        if (server) {
            server.close();
        }

        console.log('\n================================================================');
        console.log(` KẾT QUẢ KIỂM THỬ TỔNG HỢP:`);
        console.log(`   Tổng số test case: ${tongSoKiemThu}`);
        console.log(`   Thành công        : \x1b[32m${soKiemThuThanhCong}\x1b[0m`);
        console.log(`   Thất bại          : \x1b[31m${soKiemThuThatBai}\x1b[0m`);
        console.log('================================================================');

        process.exit(soKiemThuThatBai > 0 ? 1 : 0);
    }
}

chayToanBoKiemThu();
