/**
 * Service xử lý nghiệp vụ Cấu hình nhà hàng và Nhật ký hệ thống
 * Phục vụ US-041 -> US-044
 */
const cauHinhModel = require('./cauHinhNhaHang.model');
const { ghiNhatKyHeThong } = require('../../tienIch/ghiNhatKy');
const { taoUrlVietQr } = require('../../tienIch/taoMaQr');

/**
 * Chuyển danh sách row cấu hình từ CSDL thành Object key-value thân thiện
 */
function bienDoiMangCauHinh(rows) {
    const ketQua = {};
    for (const row of rows) {
        ketQua[row.ma_cau_hinh] = row.gia_tri;
    }
    return ketQua;
}

/**
 * Lấy cấu hình thông tin nhà hàng (US-041)
 */
async function layThongTinNhaHang() {
    const rows = await cauHinhModel.layTheoNhom('THONG_TIN_CHUNG');
    const map = bienDoiMangCauHinh(rows);
    return {
        tenNhaHang: map.TEN_NHA_HANG || '',
        diaChi: map.DIA_CHI || '',
        soDienThoai: map.SO_DIEN_THOAI || '',
        email: map.EMAIL || '',
        wifiTen: map.WIFI_TEN || '',
        wifiMatKhau: map.WIFI_MAT_KHAU || '',
        khauHieu: map.KHAU_HIEU || '',
        gioMoCua: map.GIO_MO_CUA || '09:00',
        gioDongCua: map.GIO_DONG_CUA || '22:30'
    };
}

/**
 * Lấy thông tin công khai cho khách hàng xem trên E-Menu
 */
async function layThongTinCongKhai() {
    const thongTin = await layThongTinNhaHang();
    return {
        tenNhaHang: thongTin.tenNhaHang,
        diaChi: thongTin.diaChi,
        soDienThoai: thongTin.soDienThoai,
        wifiTen: thongTin.wifiTen,
        wifiMatKhau: thongTin.wifiMatKhau,
        khauHieu: thongTin.khauHieu,
        gioMoCua: thongTin.gioMoCua,
        gioDongCua: thongTin.gioDongCua
    };
}

/**
 * Cập nhật cấu hình thông tin chung nhà hàng (US-041)
 */
async function capNhatThongTinNhaHang(duLieu, nguoiCapNhatId, diaChiIp, thongTinThietBi) {
    const capNhat = {};
    if (duLieu.tenNhaHang !== undefined) capNhat.TEN_NHA_HANG = duLieu.tenNhaHang.trim();
    if (duLieu.diaChi !== undefined) capNhat.DIA_CHI = duLieu.diaChi.trim();
    if (duLieu.soDienThoai !== undefined) capNhat.SO_DIEN_THOAI = duLieu.soDienThoai.trim();
    if (duLieu.email !== undefined) capNhat.EMAIL = duLieu.email.trim();
    if (duLieu.wifiTen !== undefined) capNhat.WIFI_TEN = duLieu.wifiTen.trim();
    if (duLieu.wifiMatKhau !== undefined) capNhat.WIFI_MAT_KHAU = duLieu.wifiMatKhau.trim();
    if (duLieu.khauHieu !== undefined) capNhat.KHAU_HIEU = duLieu.khauHieu.trim();
    if (duLieu.gioMoCua !== undefined) capNhat.GIO_MO_CUA = duLieu.gioMoCua.trim();
    if (duLieu.gioDongCua !== undefined) capNhat.GIO_DONG_CUA = duLieu.gioDongCua.trim();

    await cauHinhModel.capNhatNhieuGiaTri(capNhat, nguoiCapNhatId);

    // Ghi nhật ký
    await ghiNhatKyHeThong({
        taiKhoanId: nguoiCapNhatId,
        loaiHanhDong: 'CAP_NHAT_THONG_TIN_NHA_HANG',
        module: 'CAU_HINH',
        moTa: 'Cập nhật thông tin chung của nhà hàng',
        diaChiIp,
        thongTinThietBi,
        duLieuYeuCau: duLieu
    });

    return await layThongTinNhaHang();
}

/**
 * Lấy cấu hình thuế VAT và phí phục vụ (US-042)
 */
async function layThuePhi() {
    const rows = await cauHinhModel.layTheoNhom('THUE_PHI');
    const map = bienDoiMangCauHinh(rows);
    return {
        vatPhanTram: parseFloat(map.VAT_PHAN_TRAM || '8.0'),
        phiPhucVuPhanTram: parseFloat(map.PHI_PHUC_VU_PHAN_TRAM || '0.0'),
        apDungVat: map.AP_DUNG_VAT === '1' || map.AP_DUNG_VAT === 'true',
        apDungPhiPhucVu: map.AP_DUNG_PHI_PHUC_VU === '1' || map.AP_DUNG_PHI_PHUC_VU === 'true'
    };
}

/**
 * Cập nhật cấu hình thuế VAT và phí phục vụ (US-042)
 */
async function capNhatThuePhi(duLieu, nguoiCapNhatId, diaChiIp, thongTinThietBi) {
    const capNhat = {};
    if (duLieu.vatPhanTram !== undefined) capNhat.VAT_PHAN_TRAM = Number(duLieu.vatPhanTram).toFixed(1);
    if (duLieu.phiPhucVuPhanTram !== undefined) capNhat.PHI_PHUC_VU_PHAN_TRAM = Number(duLieu.phiPhucVuPhanTram).toFixed(1);
    if (duLieu.apDungVat !== undefined) capNhat.AP_DUNG_VAT = duLieu.apDungVat ? '1' : '0';
    if (duLieu.apDungPhiPhucVu !== undefined) capNhat.AP_DUNG_PHI_PHUC_VU = duLieu.apDungPhiPhucVu ? '1' : '0';

    await cauHinhModel.capNhatNhieuGiaTri(capNhat, nguoiCapNhatId);

    // Ghi nhật ký
    await ghiNhatKyHeThong({
        taiKhoanId: nguoiCapNhatId,
        loaiHanhDong: 'CAP_NHAT_THUE_PHI',
        module: 'CAU_HINH',
        moTa: `Cập nhật chính sách VAT (${capNhat.VAT_PHAN_TRAM || ''}%) và phí dịch vụ`,
        diaChiIp,
        thongTinThietBi,
        duLieuYeuCau: duLieu
    });

    return await layThuePhi();
}

/**
 * Lấy thông tin tài khoản VietQR (US-043)
 */
async function layCauHinhVietQr() {
    const rows = await cauHinhModel.layTheoNhom('VIET_QR');
    const map = bienDoiMangCauHinh(rows);
    return {
        nganHangMa: map.VIETQR_NGAN_HANG_MA || 'MB',
        nganHangTen: map.VIETQR_NGAN_HANG_TEN || 'Ngân hàng Quân Đội',
        soTaiKhoan: map.VIETQR_SO_TAI_KHOAN || '',
        chuTaiKhoan: map.VIETQR_CHU_TAI_KHOAN || '',
        cuPhapChuyenKhoan: map.VIETQR_CU_PHAP || 'QUANMOC {maHoaDon}'
    };
}

/**
 * Cập nhật cấu hình tài khoản VietQR (US-043)
 */
async function capNhatCauHinhVietQr(duLieu, nguoiCapNhatId, diaChiIp, thongTinThietBi) {
    const capNhat = {};
    if (duLieu.nganHangMa !== undefined) capNhat.VIETQR_NGAN_HANG_MA = duLieu.nganHangMa.trim().toUpperCase();
    if (duLieu.nganHangTen !== undefined) capNhat.VIETQR_NGAN_HANG_TEN = duLieu.nganHangTen.trim();
    if (duLieu.soTaiKhoan !== undefined) capNhat.VIETQR_SO_TAI_KHOAN = duLieu.soTaiKhoan.trim();
    if (duLieu.chuTaiKhoan !== undefined) capNhat.VIETQR_CHU_TAI_KHOAN = duLieu.chuTaiKhoan.trim().toUpperCase();
    if (duLieu.cuPhapChuyenKhoan !== undefined) capNhat.VIETQR_CU_PHAP = duLieu.cuPhapChuyenKhoan.trim();

    await cauHinhModel.capNhatNhieuGiaTri(capNhat, nguoiCapNhatId);

    // Ghi nhật ký
    await ghiNhatKyHeThong({
        taiKhoanId: nguoiCapNhatId,
        loaiHanhDong: 'CAP_NHAT_VIETQR',
        module: 'CAU_HINH',
        moTa: `Cập nhật thông tin nhận thanh toán VietQR: Ngân hàng ${capNhat.VIETQR_NGAN_HANG_MA || ''} - STK ${capNhat.VIETQR_SO_TAI_KHOAN || ''}`,
        diaChiIp,
        thongTinThietBi,
        duLieuYeuCau: duLieu
    });

    return await layCauHinhVietQr();
}

/**
 * Tạo URL mã QR thanh toán VietQR theo số tiền và mã hóa đơn (US-043)
 */
async function taoMaVietQrThanhToan({ soTien = 0, maHoaDon = '' }) {
    const cauHinh = await layCauHinhVietQr();

    let noiDung = cauHinh.cuPhapChuyenKhoan.replace('{maHoaDon}', maHoaDon || 'TEST');

    const qrUrl = taoUrlVietQr({
        maNganHang: cauHinh.nganHangMa,
        soTaiKhoan: cauHinh.soTaiKhoan,
        chuTaiKhoan: cauHinh.chuTaiKhoan,
        soTien: Number(soTien),
        noiDung: noiDung
    });

    return {
        nganHangMa: cauHinh.nganHangMa,
        nganHangTen: cauHinh.nganHangTen,
        soTaiKhoan: cauHinh.soTaiKhoan,
        chuTaiKhoan: cauHinh.chuTaiKhoan,
        soTien: Number(soTien),
        noiDungChuyenKhoan: noiDung,
        qrImageUrl: qrUrl
    };
}

/**
 * Lấy danh sách nhật ký hệ thống (US-044)
 */
async function layDanhSachNhatKy({ trang = 1, soLuong = 20, loaiHanhDong, module: tenModule, tuNgay, denNgay, taiKhoanId }) {
    return await cauHinhModel.layDanhSachNhatKy({
        trang,
        soLuong,
        loaiHanhDong,
        module: tenModule,
        tuNgay,
        denNgay,
        taiKhoanId
    });
}

module.exports = {
    layThongTinNhaHang,
    layThongTinCongKhai,
    capNhatThongTinNhaHang,
    layThuePhi,
    capNhatThuePhi,
    layCauHinhVietQr,
    capNhatCauHinhVietQr,
    taoMaVietQrThanhToan,
    layDanhSachNhatKy
};
