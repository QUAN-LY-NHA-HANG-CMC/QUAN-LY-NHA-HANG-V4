/**
 * Kiểm tra dữ liệu đầu vào cho phân hệ Cấu hình nhà hàng
 * Phục vụ US-006, US-041 -> US-044
 */
const { laSoDienThoaiHopLe, laEmailHopLe } = require('../../tienIch/kiemTraDuLieu');
const { phanHoiLoi } = require('../../tienIch/dinhDangPhanHoi');
const { lamSachDauVao } = require('../../tienIch/lamSachHtml');

/**
 * Kiểm tra dữ liệu cấu hình thông tin nhà hàng (US-041)
 */
function kiemTraThongTinNhaHang(req, res, next) {
    req.body = lamSachDauVao(req.body);
    const { tenNhaHang, soDienThoai, email } = req.body;

    if (tenNhaHang !== undefined && (typeof tenNhaHang !== 'string' || tenNhaHang.trim().length < 2)) {
        return phanHoiLoi(res, 'Tên nhà hàng phải có ít nhất 2 ký tự.', 400);
    }

    if (soDienThoai && !laSoDienThoaiHopLe(soDienThoai)) {
        // Cho phép cả số cố định hoặc di động
        if (soDienThoai.trim().length < 8) {
            return phanHoiLoi(res, 'Số điện thoại nhà hàng không hợp lệ.', 400);
        }
    }

    if (email && !laEmailHopLe(email)) {
        return phanHoiLoi(res, 'Địa chỉ email không đúng định dạng.', 400);
    }

    next();
}

/**
 * Kiểm tra dữ liệu cấu hình thuế VAT và phí phục vụ (US-042)
 */
function kiemTraThuePhi(req, res, next) {
    const { vatPhanTram, phiPhucVuPhanTram, apDungVat, apDungPhiPhucVu } = req.body;

    if (vatPhanTram !== undefined) {
        const vat = Number(vatPhanTram);
        if (isNaN(vat) || vat < 0 || vat > 100) {
            return phanHoiLoi(res, 'Tỷ lệ thuế VAT phải nằm trong khoảng từ 0% đến 100%.', 400);
        }
    }

    if (phiPhucVuPhanTram !== undefined) {
        const phi = Number(phiPhucVuPhanTram);
        if (isNaN(phi) || phi < 0 || phi > 100) {
            return phanHoiLoi(res, 'Tỷ lệ phí phục vụ phải nằm trong khoảng từ 0% đến 100%.', 400);
        }
    }

    if (apDungVat !== undefined && ![0, 1, true, false, '0', '1'].includes(apDungVat)) {
        return phanHoiLoi(res, 'Trạng thái áp dụng VAT không hợp lệ (0 hoặc 1).', 400);
    }

    if (apDungPhiPhucVu !== undefined && ![0, 1, true, false, '0', '1'].includes(apDungPhiPhucVu)) {
        return phanHoiLoi(res, 'Trạng thái áp dụng phí phục vụ không hợp lệ (0 hoặc 1).', 400);
    }

    next();
}

/**
 * Kiểm tra dữ liệu cấu hình tài khoản VietQR (US-043)
 */
function kiemTraVietQr(req, res, next) {
    req.body = lamSachDauVao(req.body);
    const { nganHangMa, soTaiKhoan, chuTaiKhoan } = req.body;

    if (nganHangMa !== undefined && (!nganHangMa || typeof nganHangMa !== 'string' || nganHangMa.trim() === '')) {
        return phanHoiLoi(res, 'Mã ngân hàng không được để trống (VD: MB, VCB, TCB).', 400);
    }

    if (soTaiKhoan !== undefined && (!soTaiKhoan || typeof soTaiKhoan !== 'string' || soTaiKhoan.trim() === '')) {
        return phanHoiLoi(res, 'Số tài khoản ngân hàng không được để trống.', 400);
    }

    if (chuTaiKhoan !== undefined && (!chuTaiKhoan || typeof chuTaiKhoan !== 'string' || chuTaiKhoan.trim() === '')) {
        return phanHoiLoi(res, 'Tên chủ tài khoản thụ hưởng không được để trống.', 400);
    }

    next();
}

/**
 * Kiểm tra dữ liệu tạo mã thanh toán VietQR động
 */
function kiemTraTaoMaVietQr(req, res, next) {
    const { soTien } = req.body;
    if (soTien !== undefined && (isNaN(Number(soTien)) || Number(soTien) < 0)) {
        return phanHoiLoi(res, 'Số tiền thanh toán phải lớn hơn hoặc bằng 0.', 400);
    }
    next();
}

module.exports = {
    kiemTraThongTinNhaHang,
    kiemTraThuePhi,
    kiemTraVietQr,
    kiemTraTaoMaVietQr
};
