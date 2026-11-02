/**
 * Tiện ích tạo thông tin VietQR theo chuẩn Napas
 * Phục vụ US-043 (Cấu hình thông tin tài khoản ngân hàng nhận thanh toán VietQR)
 */

/**
 * Sinh URL hình ảnh mã VietQR thanh toán chuẩn
 * @param {Object} thongTin
 * @param {string} thongTin.maNganHang - Mã định danh ngân hàng (VD: MB, VCB, TCB)
 * @param {string} thongTin.soTaiKhoan - Số tài khoản thụ hưởng
 * @param {string} thongTin.chuTaiKhoan - Tên chủ tài khoản
 * @param {number} [thongTin.soTien] - Số tiền thanh toán (VND)
 * @param {string} [thongTin.noiDung] - Nội dung chuyển khoản
 * @param {string} [thongTin.mauGiaoDien] - Mẫu template QR (compact, qr_only, print)
 * @returns {string} URL ảnh mã VietQR
 */
function taoUrlVietQr({
    maNganHang = 'MB',
    soTaiKhoan,
    chuTaiKhoan = '',
    soTien = 0,
    noiDung = '',
    mauGiaoDien = 'compact'
}) {
    if (!soTaiKhoan) return null;

    const baseNganHang = encodeURIComponent(maNganHang.trim());
    const baseSoTaiKhoan = encodeURIComponent(soTaiKhoan.trim());
    let url = `https://img.vietqr.io/image/${baseNganHang}-${baseSoTaiKhoan}-${mauGiaoDien}.png`;

    const cacThamSo = [];
    if (soTien && Number(soTien) > 0) {
        cacThamSo.push(`amount=${Math.round(Number(soTien))}`);
    }
    if (noiDung) {
        cacThamSo.push(`addInfo=${encodeURIComponent(noiDung.trim())}`);
    }
    if (chuTaiKhoan) {
        cacThamSo.push(`accountName=${encodeURIComponent(chuTaiKhoan.trim())}`);
    }

    if (cacThamSo.length > 0) {
        url += `?${cacThamSo.join('&')}`;
    }

    return url;
}

module.exports = {
    taoUrlVietQr
};
