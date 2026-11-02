const bcrypt = require('bcryptjs');
const cauHinhBaoMat = require('../cauHinh/cauHinhBaoMat.js');

async function bamMatKhau(matKhau) {
    return await bcrypt.hash(matKhau, cauHinhBaoMat.vongBămMatKhau);
}

async function soSanhMatKhau(matKhauChuaBam, matKhauBam) {
    return await bcrypt.compare(matKhauChuaBam, matKhauBam);
}

module.exports = {
    bamMatKhau,
    soSanhMatKhau
};
