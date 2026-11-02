const test = require('node:test');
const assert = require('node:assert/strict');

test('Kiểm tra khởi tạo cơ sở dữ liệu và truy vấn dữ liệu mẫu', async () => {
    const ketNoiCoSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu.js');
    
    // Khởi tạo bảng và nạp dữ liệu
    await ketNoiCoSoDuLieu.khoiTaoCoSoDuLieu();
    
    // Kiểm tra danh sách vai trò
    const danhSachVaiTro = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM vai_tro');
    assert.ok(danhSachVaiTro.length >= 4, 'Phải có ít nhất 4 vai trò: QuanLy, ThuNgan, Bep, PhucVu');
    
    const vaiTroQuanLy = ketNoiCoSoDuLieu.layMot('SELECT * FROM vai_tro WHERE ma_vai_tro = ?', ['quan_ly']);
    assert.ok(vaiTroQuanLy, 'Vai trò quan_ly phải tồn tại');
    assert.strictEqual(vaiTroQuanLy.ten_vai_tro, 'Quản lý');

    // Kiểm tra tài khoản admin mặc định
    const taiKhoanAdmin = ketNoiCoSoDuLieu.layMot('SELECT * FROM tai_khoan WHERE ten_dang_nhap = ?', ['admin']);
    assert.ok(taiKhoanAdmin, 'Tài khoản admin phải tồn tại');
    assert.strictEqual(taiKhoanAdmin.trang_thai, 'hoat_dong');

    // Kiểm tra khu vực và bàn ăn
    const danhSachKhuVuc = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM khu_vuc');
    assert.ok(danhSachKhuVuc.length > 0, 'Phải có khu vực mẫu');

    const danhSachBan = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM ban_an');
    assert.ok(danhSachBan.length > 0, 'Phải có bàn ăn mẫu');

    // Kiểm tra danh mục và món ăn
    const danhSachDanhMuc = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM danh_muc_mon');
    assert.ok(danhSachDanhMuc.length > 0, 'Phải có danh mục món');

    const danhSachMon = ketNoiCoSoDuLieu.layNhieu('SELECT * FROM mon_an');
    assert.ok(danhSachMon.length > 0, 'Phải có món ăn mẫu');
});
