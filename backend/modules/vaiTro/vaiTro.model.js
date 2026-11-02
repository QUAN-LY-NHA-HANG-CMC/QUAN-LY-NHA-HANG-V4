/**
 * Model thao tác dữ liệu Vai trò, Quyền hạn và Lịch sử phân quyền
 * Phục vụ US-015 -> US-022
 */
const { truyVanDanhSach, truyVanMotBanGhi, thucThi, thucThiGiaoDich } = require('../../cauHinh/ketNoiCoSoDuLieu');

/**
 * Lấy danh sách tất cả các vai trò
 * @returns {Promise<Array>}
 */
async function layDanhSachVaiTro() {
    return await truyVanDanhSach(
        `SELECT vt.id, vt.ma_vai_tro, vt.ten_vai_tro, vt.mo_ta, vt.la_he_thong, vt.trang_thai, vt.ngay_tao, vt.ngay_cap_nhat,
                COUNT(tkvt.tai_khoan_id) AS so_luong_nhan_vien
         FROM vai_tro vt
         LEFT JOIN tai_khoan_vai_tro tkvt ON vt.id = tkvt.vai_tro_id
         GROUP BY vt.id
         ORDER BY vt.id ASC`
    );
}

/**
 * Lấy chi tiết một vai trò theo ID kèm danh sách quyền
 * @param {number} vaiTroId
 * @returns {Promise<Object|null>}
 */
async function layVaiTroTheoId(vaiTroId) {
    return await truyVanMotBanGhi(
        `SELECT id, ma_vai_tro, ten_vai_tro, mo_ta, la_he_thong, trang_thai, ngay_tao, ngay_cap_nhat
         FROM vai_tro 
         WHERE id = ?`,
        [vaiTroId]
    );
}

/**
 * Tìm vai trò theo mã
 * @param {string} maVaiTro
 * @returns {Promise<Object|null>}
 */
async function layVaiTroTheoMa(maVaiTro) {
    return await truyVanMotBanGhi(
        `SELECT id, ma_vai_tro, ten_vai_tro, mo_ta, la_he_thong, trang_thai
         FROM vai_tro 
         WHERE ma_vai_tro = ?`,
        [maVaiTro]
    );
}

/**
 * Tạo mới vai trò
 * @param {Object} duLieu
 * @returns {Promise<number>} ID vai trò vừa tạo
 */
async function taoVaiTro({ maVaiTro, tenVaiTro, moTa }) {
    const thoiGian = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const ketQua = await thucThi(
        `INSERT INTO vai_tro (ma_vai_tro, ten_vai_tro, mo_ta, la_he_thong, trang_thai, ngay_tao, ngay_cap_nhat)
         VALUES (?, ?, ?, 0, 1, ?, ?)`,
        [maVaiTro, tenVaiTro, moTa, thoiGian, thoiGian]
    );
    return ketQua.lastInsertRowid;
}

/**
 * Cập nhật thông tin vai trò
 * @param {number} vaiTroId
 * @param {Object} duLieu
 */
async function capNhatVaiTro(vaiTroId, { tenVaiTro, moTa, trangThai }) {
    const thoiGian = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await thucThi(
        `UPDATE vai_tro 
         SET ten_vai_tro = ?, mo_ta = ?, trang_thai = ?, ngay_cap_nhat = ?
         WHERE id = ?`,
        [tenVaiTro, moTa, trangThai, thoiGian, vaiTroId]
    );
}

/**
 * Xóa vai trò (nếu không phải là vai trò hệ thống và chưa có nhân viên)
 * @param {number} vaiTroId
 */
async function xoaVaiTro(vaiTroId) {
    await thucThi(`DELETE FROM vai_tro WHERE id = ?`, [vaiTroId]);
}

/**
 * Lấy toàn bộ danh mục quyền hạn có trong hệ thống
 * @returns {Promise<Array>}
 */
async function layTatCaDanhMucQuyen() {
    return await truyVanDanhSach(
        `SELECT id, ma_quyen, ten_quyen, nhom_quyen, mo_ta 
         FROM quyen_han 
         ORDER BY nhom_quyen ASC, id ASC`
    );
}

/**
 * Lấy danh sách quyền hạn của một vai trò
 * @param {number} vaiTroId
 * @returns {Promise<Array>}
 */
async function layQuyenCuaVaiTro(vaiTroId) {
    return await truyVanDanhSach(
        `SELECT qh.id, qh.ma_quyen, qh.ten_quyen, qh.nhom_quyen, qh.mo_ta
         FROM quyen_han qh
         INNER JOIN vai_tro_quyen_han vtqh ON qh.id = vtqh.quyen_han_id
         WHERE vtqh.vai_tro_id = ?
         ORDER BY qh.nhom_quyen ASC, qh.id ASC`,
        [vaiTroId]
    );
}

/**
 * Cập nhật danh sách quyền hạn cho vai trò (Giao dịch Transaction)
 * @param {number} vaiTroId
 * @param {Array<number>} danhSachQuyenId
 */
async function capNhatQuyenCuaVaiTro(vaiTroId, danhSachQuyenId) {
    return await thucThiGiaoDich(async ({ thucThi: thucThiLocal }) => {
        // Xóa hết quyền cũ của vai trò
        await thucThiLocal(`DELETE FROM vai_tro_quyen_han WHERE vai_tro_id = ?`, [vaiTroId]);

        // Thêm danh sách quyền mới
        for (const quyenId of danhSachQuyenId) {
            await thucThiLocal(
                `INSERT INTO vai_tro_quyen_han (vai_tro_id, quyen_han_id) VALUES (?, ?)`,
                [vaiTroId, quyenId]
            );
        }
    });
}

/**
 * Gán danh sách vai trò cho một tài khoản nhân viên (Giao dịch Transaction)
 * @param {number} taiKhoanId
 * @param {Array<number>} danhSachVaiTroId
 */
async function ganVaiTroChoTaiKhoan(taiKhoanId, danhSachVaiTroId) {
    return await thucThiGiaoDich(async ({ thucThi: thucThiLocal }) => {
        // Xóa các vai trò cũ của tài khoản
        await thucThiLocal(`DELETE FROM tai_khoan_vai_tro WHERE tai_khoan_id = ?`, [taiKhoanId]);

        // Thêm vai trò mới
        for (const vaiTroId of danhSachVaiTroId) {
            await thucThiLocal(
                `INSERT INTO tai_khoan_vai_tro (tai_khoan_id, vai_tro_id) VALUES (?, ?)`,
                [taiKhoanId, vaiTroId]
            );
        }
    });
}

/**
 * Ghi nhận lịch sử thay đổi phân quyền (US-022)
 * @param {Object} thamSo
 */
async function ghiLichSuPhanQuyen({ nguoiThucHienId, taiKhoanId = null, vaiTroId = null, hanhDong, noiDungChiTiet }) {
    const thoiGian = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await thucThi(
        `INSERT INTO lich_su_phan_quyen 
         (nguoi_thuc_hien_id, tai_khoan_id, vai_tro_id, hanh_dong, noi_dung_chi_tiet, ngay_tao)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nguoiThucHienId, taiKhoanId, vaiTroId, hanhDong, noiDungChiTiet, thoiGian]
    );
}

/**
 * Lấy danh sách lịch sử phân quyền có phân trang
 * @param {Object} thamSo
 * @param {number} thamSo.trang
 * @param {number} thamSo.soLuong
 * @returns {Promise<{danhSach: Array, tongSo: number}>}
 */
async function layLichSuPhanQuyen({ trang = 1, soLuong = 20 }) {
    const offset = (trang - 1) * soLuong;

    const tongRow = await truyVanMotBanGhi(`SELECT COUNT(*) AS tong FROM lich_su_phan_quyen`);
    const tongSo = tongRow ? tongRow.tong : 0;

    const danhSach = await truyVanDanhSach(
        `SELECT lspq.id, lspq.hanh_dong, lspq.noi_dung_chi_tiet, lspq.ngay_tao,
                lspq.nguoi_thuc_hien_id, tk_nguoi_thuc_hien.ho_ten AS ten_nguoi_thuc_hien,
                lspq.tai_khoan_id, tk_duoc_gan.ho_ten AS ten_tai_khoan_duoc_gan,
                lspq.vai_tro_id, vt.ten_vai_tro
         FROM lich_su_phan_quyen lspq
         LEFT JOIN tai_khoan tk_nguoi_thuc_hien ON lspq.nguoi_thuc_hien_id = tk_nguoi_thuc_hien.id
         LEFT JOIN tai_khoan tk_duoc_gan ON lspq.tai_khoan_id = tk_duoc_gan.id
         LEFT JOIN vai_tro vt ON lspq.vai_tro_id = vt.id
         ORDER BY lspq.id DESC
         LIMIT ? OFFSET ?`,
        [soLuong, offset]
    );

    return {
        danhSach,
        tongSo,
        trang,
        tongSoTrang: Math.ceil(tongSo / soLuong)
    };
}

module.exports = {
    layDanhSachVaiTro,
    layVaiTroTheoId,
    layVaiTroTheoMa,
    taoVaiTro,
    capNhatVaiTro,
    xoaVaiTro,
    layTatCaDanhMucQuyen,
    layQuyenCuaVaiTro,
    capNhatQuyenCuaVaiTro,
    ganVaiTroChoTaiKhoan,
    ghiLichSuPhanQuyen,
    layLichSuPhanQuyen
};
