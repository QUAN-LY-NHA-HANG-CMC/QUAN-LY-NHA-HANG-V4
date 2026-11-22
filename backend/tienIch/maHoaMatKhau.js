// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// TIỆN ÍCH BĂM VÀ XÁC THỰC MẬT KHẨU BẰNG BCRYPT
// ============================================================================

const bcrypt = require('bcryptjs');

/**
 * Băm mật khẩu thuần sang chuỗi băm an toàn
 * @param {string} matKhauGoc Mật khẩu thô do người dùng nhập
 * @returns {Promise<string>} Chuỗi hash bcrypt
 */
async function bamMatKhau(matKhauGoc) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(matKhauGoc, salt);
}

/**
 * So sánh mật khẩu thuần với chuỗi hash trong CSDL
 * @param {string} matKhauGoc 
 * @param {string} matKhauHash 
 * @returns {Promise<boolean>} Đúng hay sai
 */
async function soSanhMatKhau(matKhauGoc, matKhauHash) {
    return await bcrypt.compare(matKhauGoc, matKhauHash);
}

module.exports = {
    bamMatKhau,
    soSanhMatKhau
};
