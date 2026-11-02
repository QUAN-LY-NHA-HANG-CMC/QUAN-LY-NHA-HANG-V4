/**
 * Tiện ích tạo mã QR Code (Base64, SVG) và VietQR theo chuẩn Napas
 * Hỗ trợ Sprint 1 (Bàn ăn & Định danh QR) và US-043 (VietQR)
 */
const QRCode = require('qrcode');

/**
 * Sinh chuỗi Base64 Data URI của mã QR
 * @param {string} noiDung
 * @param {Object} tuyChon
 * @returns {Promise<string>}
 */
async function taoAnhQrBase64(noiDung, tuyChon = {}) {
    const cauHinh = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 2,
        width: 300,
        color: {
            dark: '#1e293b',
            light: '#ffffff'
        },
        ...tuyChon
    };
    return await QRCode.toDataURL(noiDung, cauHinh);
}

/**
 * Sinh chuỗi SVG của mã QR
 * @param {string} noiDung
 * @param {Object} tuyChon
 * @returns {Promise<string>}
 */
async function taoMaQrSvg(noiDung, tuyChon = {}) {
    return await QRCode.toString(noiDung, { type: 'svg', ...tuyChon });
}

/**
 * Sinh URL hình ảnh mã VietQR thanh toán chuẩn Napas (US-043)
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
    taoAnhQrBase64,
    taoMaQrSvg,
    taoUrlVietQr
};
