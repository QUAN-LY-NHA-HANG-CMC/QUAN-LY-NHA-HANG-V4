/**
 * Cấu hình chung cho toàn bộ ứng dụng Backend
 * Tuân thủ mục 6: Quy tắc hằng số và cấu hình (QUY_TAC_LAM_DU_AN.txt)
 */
require('dotenv').config();

const cauHinhChung = {
    // Cấu hình mạng máy chủ
    congBackend: Number(process.env.CONG_BACKEND || 3001),
    moiTruong: process.env.MOI_TRUONG || 'development',
    laMoiTruongPhatTrien: (process.env.MOI_TRUONG || 'development') === 'development',

    // Cấu hình cơ sở dữ liệu
    coSoDuLieu: {
        loai: process.env.DB_LOAI || 'sqlite',
        duongDanSqlite: process.env.DB_SQLITE_PATH || './database/quan_ly_nha_hang.sqlite',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'quan_ly_nha_hang'
    },

    // Cấu hình nguồn gốc được phép truy cập (CORS)
    nguonGocChoPhep: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173')
        .split(',')
        .map(url => url.trim()),

    // Thời gian phiên bàn và giới hạn nghiệp vụ
    thoiGianPhienBanPhut: 180,
    soMonToiDaMoiLanGoi: 20,
    gioiHanTepTaiLenMB: 5
};

module.exports = cauHinhChung;
