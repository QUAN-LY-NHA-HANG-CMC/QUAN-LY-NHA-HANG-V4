/**
 * Model thao tác dữ liệu Cấu hình nhà hàng và Nhật ký hệ thống
 * Phục vụ US-041 -> US-044
 */
const { truyVanDanhSach, truyVanMotBanGhi, thucThi, thucThiGiaoDich } = require('../../cauHinh/ketNoiCoSoDuLieu');

/**
 * Lấy tất cả cấu hình theo nhóm
 * @param {string} nhomCauHinh
 * @returns {Promise<Array>}
 */
async function layTheoNhom(nhomCauHinh) {
    return await truyVanDanhSach(
        `SELECT id, ma_cau_hinh, gia_tri, mo_ta, nhom_cau_hinh, ngay_cap_nhat, nguoi_cap_nhat_id
         FROM cau_hinh_nha_hang
         WHERE nhom_cau_hinh = ?`,
        [nhomCauHinh]
    );
}

/**
 * Lấy một giá trị cấu hình theo mã
 * @param {string} maCauHinh
 * @returns {Promise<Object|null>}
 */
async function layTheoMa(maCauHinh) {
    return await truyVanMotBanGhi(
        `SELECT id, ma_cau_hinh, gia_tri, mo_ta, nhom_cau_hinh, ngay_cap_nhat
         FROM cau_hinh_nha_hang
         WHERE ma_cau_hinh = ?`,
        [maCauHinh]
    );
}

/**
 * Cập nhật một bản ghi cấu hình
 * @param {string} maCauHinh
 * @param {string} giaTri
 * @param {number} nguoiCapNhatId
 */
async function capNhatGiaTri(maCauHinh, giaTri, nguoiCapNhatId) {
    const thoiGian = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await thucThi(
        `UPDATE cau_hinh_nha_hang
         SET gia_tri = ?, ngay_cap_nhat = ?, nguoi_cap_nhat_id = ?
         WHERE ma_cau_hinh = ?`,
        [String(giaTri), thoiGian, nguoiCapNhatId, maCauHinh]
    );
}

/**
 * Cập nhật nhiều cấu hình cùng lúc trong một giao dịch
 * @param {Object} danhSachCauHinh - Object dạng { MA_CAU_HINH: giaTri }
 * @param {number} nguoiCapNhatId
 */
async function capNhatNhieuGiaTri(danhSachCauHinh, nguoiCapNhatId) {
    const thoiGian = new Date().toISOString().replace('T', ' ').substring(0, 19);
    return await thucThiGiaoDich(async ({ thucThi: thucThiLocal }) => {
        for (const [ma, giaTri] of Object.entries(danhSachCauHinh)) {
            await thucThiLocal(
                `UPDATE cau_hinh_nha_hang
                 SET gia_tri = ?, ngay_cap_nhat = ?, nguoi_cap_nhat_id = ?
                 WHERE ma_cau_hinh = ?`,
                [String(giaTri), thoiGian, nguoiCapNhatId, ma]
            );
        }
    });
}

/**
 * Lấy danh sách nhật ký hệ thống có phân trang và bộ lọc (US-044)
 * @param {Object} thamSo
 */
async function layDanhSachNhatKy({ trang = 1, soLuong = 20, loaiHanhDong, module: tenModule, tuNgay, denNgay, taiKhoanId }) {
    const offset = (trang - 1) * soLuong;
    const dieuKien = [];
    const thamSoSql = [];

    if (loaiHanhDong) {
        dieuKien.push('nk.loai_hanh_dong = ?');
        thamSoSql.push(loaiHanhDong);
    }

    if (tenModule) {
        dieuKien.push('nk.module = ?');
        thamSoSql.push(tenModule);
    }

    if (taiKhoanId) {
        dieuKien.push('nk.tai_khoan_id = ?');
        thamSoSql.push(taiKhoanId);
    }

    if (tuNgay) {
        dieuKien.push('nk.ngay_tao >= ?');
        thamSoSql.push(`${tuNgay} 00:00:00`);
    }

    if (denNgay) {
        dieuKien.push('nk.ngay_tao <= ?');
        thamSoSql.push(`${denNgay} 23:59:59`);
    }

    const chuoiDieuKien = dieuKien.length > 0 ? `WHERE ${dieuKien.join(' AND ')}` : '';

    // Đếm tổng số bản ghi
    const tongRow = await truyVanMotBanGhi(
        `SELECT COUNT(*) AS tong FROM nhat_ky_he_thong nk ${chuoiDieuKien}`,
        thamSoSql
    );
    const tongSo = tongRow ? tongRow.tong : 0;

    // Lấy dữ liệu phân trang
    const danhSach = await truyVanDanhSach(
        `SELECT nk.id, nk.tai_khoan_id, tk.ten_dang_nhap, tk.ho_ten,
                nk.loai_hanh_dong, nk.module, nk.mo_ta,
                nk.dia_chi_ip, nk.thong_tin_thiet_bi, nk.du_lieu_yeu_cau, nk.ngay_tao
         FROM nhat_ky_he_thong nk
         LEFT JOIN tai_khoan tk ON nk.tai_khoan_id = tk.id
         ${chuoiDieuKien}
         ORDER BY nk.id DESC
         LIMIT ? OFFSET ?`,
        [...thamSoSql, soLuong, offset]
    );

    return {
        danhSach,
        tongSo,
        trang,
        tongSoTrang: Math.ceil(tongSo / soLuong)
    };
}

module.exports = {
    layTheoNhom,
    layTheoMa,
    capNhatGiaTri,
    capNhatNhieuGiaTri,
    layDanhSachNhatKy
};
