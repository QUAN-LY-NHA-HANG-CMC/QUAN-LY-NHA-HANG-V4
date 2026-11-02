const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const cauHinhBaoMat = {
    khoaBiMatJwt: process.env.KHOA_BI_MAT_JWT || 'bi_mat_jwt_mac_dinh_quan_moc_2026',
    thoiHanToken: process.env.THOI_HAN_TOKEN || '24h',
    vongBămMatKhau: 10,
    gioiHanYeuCauMoiPhut: 120
};

module.exports = cauHinhBaoMat;
