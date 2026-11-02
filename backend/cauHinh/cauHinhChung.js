const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const cauHinhChung = {
    congBackend: Number(process.env.CONG_BACKEND || 3001),
    moiTruong: process.env.MOI_TRUONG || 'development',
    thoiGianPhienBanPhut: 180,
    soMonToiDaMoiLanGoi: 20,
    gioiHanTepTaiLenMB: 5,
    duongDanCoSoDuLieu: process.env.DUONG_DAN_CO_SO_DU_LIEU || path.resolve(__dirname, '../../database/quanLyNhaHang.sqlite'),
    urlGiaoDien: process.env.URL_GIAO_DIEN || 'http://localhost:3001'
};

module.exports = cauHinhChung;
