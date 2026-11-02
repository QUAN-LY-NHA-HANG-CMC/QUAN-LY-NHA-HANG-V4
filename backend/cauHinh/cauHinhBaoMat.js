/**
 * Cấu hình bảo mật hệ thống (JWT, Bcrypt, Rate Limit, Cookie)
 * Phục vụ US-001 -> US-006 & Quy tắc bảo mật web
 */
require('dotenv').config();

const cauHinhBaoMat = {
    // Bcrypt
    vongBamBcrypt: 10,

    // JSON Web Token (JWT)
    jwt: {
        biMatAccessToken: process.env.JWT_ACCESS_SECRET || 'mac_dinh_bi_mat_access_token_quan_ly_nha_hang_2026_!@#$',
        biMatRefreshToken: process.env.JWT_REFRESH_SECRET || 'mac_dinh_bi_mat_refresh_token_quan_ly_nha_hang_2026_&*()_',
        thoiGianHetHanAccess: process.env.JWT_ACCESS_HET_HAN || '1h',
        thoiGianHetHanRefresh: process.env.JWT_REFRESH_HET_HAN || '7d',
        thoiGianHetHanRefreshNgay: 7
    },

    // Giới hạn tần suất yêu cầu (Rate Limiting)
    gioiHanYeuCau: {
        cuaSoThoiGianPhut: Number(process.env.GIOI_HAN_YEU_CAU_CUA_SO_PHUT || 15),
        soLuongToiDaChung: process.env.NODE_ENV === 'test' ? 1000 : Number(process.env.GIOI_HAN_YEU_CAU_SO_LUONG_TOI_DA || 100),
        soLuongToiDaDangNhap: process.env.NODE_ENV === 'test' ? 1000 : Number(process.env.GIOI_HAN_DANG_NHAP_TOI_DA || 5)
    },

    // Cấu hình Cookie phiên đăng nhập
    cookie: {
        httpOnly: true,
        secure: process.env.MOI_TRUONG === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    }
};

module.exports = cauHinhBaoMat;
