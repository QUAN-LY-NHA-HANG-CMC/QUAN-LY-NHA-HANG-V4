const { truyVanMot, thucThi } = require('../backend/cauHinh/ketNoiCoSoDuLieu');
const { bamMatKhau } = require('../backend/tienIch/maHoaMatKhau');
const taiKhoanModel = require('../backend/modules/taiKhoan/taiKhoan.model');

async function khoiTao() {
    const { MOC_ADMIN_USERNAME, MOC_ADMIN_PASSWORD, MOC_ADMIN_PHONE } = process.env;
    if (!MOC_ADMIN_USERNAME || !MOC_ADMIN_PHONE || !MOC_ADMIN_PASSWORD ||
        MOC_ADMIN_PASSWORD.length < 12 || Buffer.byteLength(MOC_ADMIN_PASSWORD) > 72) {
        throw new Error('Cần MOC_ADMIN_USERNAME, MOC_ADMIN_PHONE và MOC_ADMIN_PASSWORD dài từ 12 ký tự, tối đa 72 byte');
    }
    if (truyVanMot(`SELECT tk.id FROM tai_khoan tk JOIN vai_tro vt ON vt.id = tk.vai_tro_id
        WHERE vt.ma_vai_tro = 'quan_ly' AND tk.trang_thai = 'hoat_dong'`)) {
        throw new Error('CSDL đã có quản lý hoạt động');
    }
    thucThi(`INSERT OR IGNORE INTO vai_tro (ma_vai_tro, ten_vai_tro) VALUES
        ('quan_ly', 'Quản lý'), ('thu_ngan', 'Thu ngân'), ('phuc_vu', 'Phục vụ'), ('bep', 'Bếp')`);
    thucThi(`INSERT OR IGNORE INTO khu_vuc (ma_khu_vuc, ten_khu_vuc) VALUES ('KHU_CHINH', 'Khu chính')`);
    thucThi(`INSERT OR IGNORE INTO danh_muc_mon (ma_danh_muc, ten_danh_muc) VALUES ('THUC_DON', 'Thực đơn')`);
    const vaiTro = truyVanMot("SELECT id FROM vai_tro WHERE ma_vai_tro = 'quan_ly'");
    taiKhoanModel.taoNhanSuVoiTaiKhoan({
        hoTen: 'Quản lý', tenDangNhap: MOC_ADMIN_USERNAME,
        soDienThoai: MOC_ADMIN_PHONE, vaiTroId: vaiTro.id,
        matKhauHash: await bamMatKhau(MOC_ADMIN_PASSWORD)
    });
    console.log('Đã tạo tài khoản quản lý.');
}

khoiTao().catch(err => {
    console.error(err.message);
    process.exitCode = 1;
});
