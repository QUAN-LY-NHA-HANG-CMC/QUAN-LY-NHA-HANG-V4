// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// CẤU HÌNH HỆ THỐNG CHUNG TOÀN DỰ ÁN
// ============================================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

if (process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('quan_moc_secret_key'))) {
    throw new Error('Production yêu cầu JWT_SECRET riêng, dài ít nhất 32 ký tự');
}

const cauHinhChung = {
    congBackend: Number(process.env.CONG_BACKEND || 3001),
    moiTruong: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'quan_moc_secret_key_jwt_2026_super_secure',
    jwtThoiGianHetHan: process.env.JWT_EXPIRES_IN || '24h',
    
    // Đường dẫn tệp CSDL SQLite3
    duongDanCsdl: process.env.DB_PATH || path.join(__dirname, '../../database/coSoDuLieu.sqlite'),
    
    // Cấu hình nghiệp vụ nhà hàng
    thoiGianPhienBanPhut: 180, // Phiên bàn tự đóng sau 3 tiếng không gọi món
    thoiGianTimeoutHuyMonGiay: 90, // Cơ chế Timeout 90s hủy món bếp KDS (US-W08)
    soMonToiDaMoiLanGoi: 30,
    gioiHanTepTaiLenMB: 5,
    vatMacDinh: 8, // VAT 8%
    
    // Danh sách nguồn Frontend được phép truy cập CORS
    nguonFrontendChoPhep: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        ...(process.env.FRONTEND_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean)
    ]
};

module.exports = cauHinhChung;
