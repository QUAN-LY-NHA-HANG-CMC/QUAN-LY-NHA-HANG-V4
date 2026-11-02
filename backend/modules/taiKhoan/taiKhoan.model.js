/**
 * Model thao tác dữ liệu bảng tai_khoan và phien_dang_nhap
 * Phục vụ US-001 -> US-003, US-007 -> US-010
 */
const { truyVanMotBanGhi, truyVanDanhSach, thucThi } = require('../../cauHinh/ketNoiCoSoDuLieu');

/**
 * Tìm tài khoản theo tên đăng nhập
 * @param {string} tenDangNhap
 * @returns {Promise<Object|null>}
 */
async function timTheoTenDangNhap(tenDangNhap) {
    return await truyVanMotBanGhi(
        `SELECT id, ten_dang_nhap, mat_khau, ho_ten, so_dien_thoai, email, anh_dai_dien, trang_thai, dang_nhap_cuoi, ngay_tao, ngay_cap_nhat
         FROM tai_khoan 
         WHERE ten_dang_nhap = ?`,
        [tenDangNhap]
    );
}

/**
 * Tìm tài khoản theo ID
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function timTheoId(id) {
    return await truyVanMotBanGhi(
        `SELECT id, ten_dang_nhap, ho_ten, so_dien_thoai, email, anh_dai_dien, trang_thai, dang_nhap_cuoi, ngay_tao, ngay_cap_nhat
         FROM tai_khoan 
         WHERE id = ?`,
        [id]
    );
}

/**
 * Lấy mật khẩu đã băm của tài khoản theo ID (dùng cho đổi mật khẩu)
 * @param {number} id
 * @returns {Promise<string|null>}
 */
async function layMatKhauDaBam(id) {
    const res = await truyVanMotBanGhi(
        `SELECT mat_khau FROM tai_khoan WHERE id = ?`,
        [id]
    );
    return res ? res.mat_khau : null;
}

/**
 * Cập nhật thời điểm đăng nhập gần nhất
 * @param {number} id
 */
async function capNhatDangNhapCuoi(id) {
    const thoiGian = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await thucThi(
        `UPDATE tai_khoan SET dang_nhap_cuoi = ? WHERE id = ?`,
        [thoiGian, id]
    );
}

/**
 * Cập nhật mật khẩu mới cho tài khoản
 * @param {number} id
 * @param {string} matKhauHash
 */
async function capNhatMatKhau(id, matKhauHash) {
    const thoiGian = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await thucThi(
        `UPDATE tai_khoan SET mat_khau = ?, ngay_cap_nhat = ? WHERE id = ?`,
        [matKhauHash, thoiGian, id]
    );
}

/**
 * Cập nhật thông tin hồ sơ cá nhân
 * @param {number} id
 * @param {Object} duLieu
 */
async function capNhatHoSo(id, { hoTen, soDienThoai, email, anhDaiDien }) {
    const thoiGian = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await thucThi(
        `UPDATE tai_khoan 
         SET ho_ten = ?, so_dien_thoai = ?, email = ?, anh_dai_dien = ?, ngay_cap_nhat = ? 
         WHERE id = ?`,
        [hoTen, soDienThoai, email, anhDaiDien, thoiGian, id]
    );
}

/**
 * Lấy danh sách vai trò của một tài khoản
 * @param {number} taiKhoanId
 * @returns {Promise<Array>}
 */
async function layDanhSachVaiTro(taiKhoanId) {
    return await truyVanDanhSach(
        `SELECT vt.id, vt.ma_vai_tro, vt.ten_vai_tro, vt.mo_ta
         FROM vai_tro vt
         INNER JOIN tai_khoan_vai_tro tkvt ON vt.id = tkvt.vai_tro_id
         WHERE tkvt.tai_khoan_id = ? AND vt.trang_thai = 1`,
        [taiKhoanId]
    );
}

/**
 * Lấy danh sách các quyền của tài khoản qua vai trò
 * @param {number} taiKhoanId
 * @returns {Promise<Array>}
 */
async function layDanhSachQuyen(taiKhoanId) {
    return await truyVanDanhSach(
        `SELECT DISTINCT qh.id, qh.ma_quyen, qh.ten_quyen, qh.nhom_quyen
         FROM quyen_han qh
         INNER JOIN vai_tro_quyen_han vtqh ON qh.id = vtqh.quyen_han_id
         INNER JOIN tai_khoan_vai_tro tkvt ON vtqh.vai_tro_id = tkvt.vai_tro_id
         WHERE tkvt.tai_khoan_id = ?`,
        [taiKhoanId]
    );
}

/**
 * Lưu phiên đăng nhập và refresh token vào cơ sở dữ liệu
 * @param {number} taiKhoanId
 * @param {string} refreshToken
 * @param {string} thietBi
 * @param {string} diaChiIp
 * @param {string} hetHanLuc
 */
async function luuRefreshToken(taiKhoanId, refreshToken, thietBi, diaChiIp, hetHanLuc) {
    const thoiGian = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await thucThi(
        `INSERT INTO phien_dang_nhap 
         (tai_khoan_id, refresh_token, thong_tin_thiet_bi, dia_chi_ip, het_han_luc, da_thu_hoi, ngay_tao)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [taiKhoanId, refreshToken, thietBi, diaChiIp, hetHanLuc, thoiGian]
    );
}

/**
 * Tìm phiên đăng nhập theo refresh token
 * @param {string} refreshToken
 * @returns {Promise<Object|null>}
 */
async function timPhienRefreshToken(refreshToken) {
    return await truyVanMotBanGhi(
        `SELECT id, tai_khoan_id, refresh_token, het_han_luc, da_thu_hoi
         FROM phien_dang_nhap 
         WHERE refresh_token = ?`,
        [refreshToken]
    );
}

/**
 * Thu hồi một refresh token (khi đăng xuất)
 * @param {string} refreshToken
 */
async function thuHoiRefreshToken(refreshToken) {
    await thucThi(
        `UPDATE phien_dang_nhap SET da_thu_hoi = 1 WHERE refresh_token = ?`,
        [refreshToken]
    );
}

/**
 * Thu hồi tất cả refresh token của một tài khoản (khi đổi mật khẩu hoặc bị khóa)
 * @param {number} taiKhoanId
 */
async function thuHoiTatCaRefreshToken(taiKhoanId) {
    await thucThi(
        `UPDATE phien_dang_nhap SET da_thu_hoi = 1 WHERE tai_khoan_id = ?`,
        [taiKhoanId]
    );
}

module.exports = {
    timTheoTenDangNhap,
    timTheoId,
    layMatKhauDaBam,
    capNhatDangNhapCuoi,
    capNhatMatKhau,
    capNhatHoSo,
    layDanhSachVaiTro,
    layDanhSachQuyen,
    luuRefreshToken,
    timPhienRefreshToken,
    thuHoiRefreshToken,
    thuHoiTatCaRefreshToken
};
