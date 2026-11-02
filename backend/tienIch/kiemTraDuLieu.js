/**
 * Tiện ích kiểm tra tính hợp lệ của dữ liệu đầu vào (Input Validation)
 * Phục vụ US-006 & Mục 4.5, 9.4 (QUY_TAC_LAM_DU_AN.txt)
 */

/**
 * Kiểm tra tên đăng nhập hợp lệ: 3-30 ký tự, chỉ gồm chữ cái, số, gạch dưới
 * @param {string} tenDangNhap
 * @returns {boolean}
 */
function laTenDangNhapHopLe(tenDangNhap) {
    if (!tenDangNhap || typeof tenDangNhap !== 'string') return false;
    const regex = /^[a-zA-Z0-9_]{3,30}$/;
    return regex.test(tenDangNhap.trim());
}

/**
 * Kiểm tra độ mạnh của mật khẩu: ít nhất 6 ký tự
 * @param {string} matKhau
 * @returns {boolean}
 */
function laMatKhauHopLe(matKhau) {
    if (!matKhau || typeof matKhau !== 'string') return false;
    return matKhau.length >= 6;
}

/**
 * Kiểm tra số điện thoại Việt Nam hợp lệ: 10 chữ số, bắt đầu bằng 0
 * @param {string} soDienThoai
 * @returns {boolean}
 */
function laSoDienThoaiHopLe(soDienThoai) {
    if (!soDienThoai || typeof soDienThoai !== 'string') return false;
    const regex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    return regex.test(soDienThoai.trim());
}

/**
 * Kiểm tra định dạng Email hợp lệ
 * @param {string} email
 * @returns {boolean}
 */
function laEmailHopLe(email) {
    if (!email || typeof email !== 'string') return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
}

/**
 * Kiểm tra ID số nguyên dương
 * @param {any} id
 * @returns {boolean}
 */
function laIdHopLe(id) {
    const so = Number(id);
    return Number.isInteger(so) && so > 0;
}

module.exports = {
    laTenDangNhapHopLe,
    laMatKhauHopLe,
    laSoDienThoaiHopLe,
    laEmailHopLe,
    laIdHopLe
};
