/**
 * Tiện ích băm và xác thực mật khẩu an toàn bằng bcrypt
 * Phục vụ US-001 & Mục 7.9 (QUY_TAC_LAM_DU_AN.txt)
 */
const bcrypt = require('bcryptjs');
const cauHinhBaoMat = require('../cauHinh/cauHinhBaoMat');

/**
 * Băm mật khẩu dạng văn bản thuần
 * @param {string} matKhauThuan - Mật khẩu người dùng nhập
 * @returns {Promise<string>} Chuỗi hash bcrypt
 */
async function bamMatKhau(matKhauThuan) {
    if (!matKhauThuan || typeof matKhauThuan !== 'string') {
        const loi = new Error('Mật khẩu không hợp lệ');
        loi.status = 400;
        throw loi;
    }
    const salt = await bcrypt.genSalt(cauHinhBaoMat.vongBamBcrypt);
    return await bcrypt.hash(matKhauThuan, salt);
}

/**
 * Kiểm tra mật khẩu thuần có khớp với chuỗi hash bcrypt không
 * @param {string} matKhauThuan - Mật khẩu người dùng nhập
 * @param {string} matKhauDaBam - Chuỗi hash lưu trong CSDL
 * @returns {Promise<boolean>} Khớp hay không
 */
async function kiemTraMatKhau(matKhauThuan, matKhauDaBam) {
    if (!matKhauThuan || !matKhauDaBam) {
        return false;
    }
    return await bcrypt.compare(matKhauThuan, matKhauDaBam);
}

module.exports = {
    bamMatKhau,
    kiemTraMatKhau
};
