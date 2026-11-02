const test = require('node:test');
const assert = require('node:assert/strict');
const ketNoiCoSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu.js');

test.before(async () => {
    await ketNoiCoSoDuLieu.khoiTaoCoSoDuLieu();
});

test('Xác thực đăng nhập và bảo mật mật khẩu', async () => {
    const taiKhoanService = require('../../backend/modules/taiKhoan/taiKhoan.service.js');
    
    // Đăng nhập thành công
    const ketQua = await taiKhoanService.dangNhap('admin', '123456');
    assert.ok(ketQua.token, 'Phải có JWT token');
    assert.strictEqual(ketQua.nguoiDung.tenDangNhap, 'admin');
    assert.strictEqual(ketQua.nguoiDung.vaiTro, 'quan_ly');
    assert.strictEqual(ketQua.nguoiDung.matKhauBam, undefined, 'Không được trả về mật khẩu băm');

    // Đăng nhập sai mật khẩu
    await assert.rejects(
        async () => {
            await taiKhoanService.dangNhap('admin', 'sai_mat_khau');
        },
        (loi) => {
            assert.strictEqual(loi.status, 401);
            return true;
        }
    );

    // Đăng nhập tài khoản không tồn tại
    await assert.rejects(
        async () => {
            await taiKhoanService.dangNhap('khong_ton_tai', '123456');
        },
        (loi) => {
            assert.strictEqual(loi.status, 401);
            return true;
        }
    );
});

test('Đổi mật khẩu người dùng', async () => {
    const taiKhoanService = require('../../backend/modules/taiKhoan/taiKhoan.service.js');
    
    // Đổi mật khẩu cho user thungan
    const userThuNgan = ketNoiCoSoDuLieu.layMot('SELECT id FROM tai_khoan WHERE ten_dang_nhap = ?', ['thungan']);
    await taiKhoanService.doiMatKhau(userThuNgan.id, '123456', 'matkhau_moi_999');

    // Đăng nhập với mật khẩu mới
    const ketQuaMoi = await taiKhoanService.dangNhap('thungan', 'matkhau_moi_999');
    assert.ok(ketQuaMoi.token);

    // Trả lại mật khẩu cũ để không ảnh hưởng dữ liệu mẫu
    await taiKhoanService.doiMatKhau(userThuNgan.id, 'matkhau_moi_999', '123456');
});

test('Kiểm tra Middleware phân quyền theo vai trò', async () => {
    const phanQuyenMiddleware = require('../../backend/middleware/phanQuyen.js');
    
    const reqQuanLy = { nguoiDung: { vaiTro: 'quan_ly', danhSachQuyen: ['quan_ly_he_thong', 'quan_ly_thuc_don'] } };
    const reqBep = { nguoiDung: { vaiTro: 'bep', danhSachQuyen: ['dieu_phoi_bep'] } };
    
    let daGoiNext = false;
    const next = () => { daGoiNext = true; };

    // Quản lý truy cập chức năng thuc-don
    daGoiNext = false;
    const middlewareThucDon = phanQuyenMiddleware.kiemTraQuyen('quan_ly_thuc_don');
    middlewareThucDon(reqQuanLy, {}, next);
    assert.strictEqual(daGoiNext, true, 'Quản lý phải có quyền quan_ly_thuc_don');

    // Bếp truy cập chức năng thuc-don (bị từ chối 403)
    let maLoi = null;
    const resChan = {
        status(code) {
            maLoi = code;
            return this;
        },
        json(duLieu) {
            return duLieu;
        }
    };
    daGoiNext = false;
    middlewareThucDon(reqBep, resChan, next);
    assert.strictEqual(daGoiNext, false, 'Bếp không được đi qua');
    assert.strictEqual(maLoi, 403, 'Phải trả về 403 Forbidden');
});
