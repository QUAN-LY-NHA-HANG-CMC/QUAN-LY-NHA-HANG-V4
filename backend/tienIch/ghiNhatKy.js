// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// TIỆN ÍCH GHI NHẬT KÝ KIỂM TOÁN CHỐNG THẤT THOÁT (AUDIT LOGS - FIGMA A20)
// ============================================================================

const { thucThi } = require('../cauHinh/ketNoiCoSoDuLieu');

/**
 * Ghi lại vết hành động nhạy cảm vào bảng nhat_ky_kiem_toan
 * @param {Object} thamSo 
 * @param {number|null} thamSo.taiKhoanId Tài khoản thực hiện
 * @param {string} thamSo.hanhDong Mã hành động (VD: 'HUY_MON', 'DUYET_DOI_CA', 'TACH_BILL')
 * @param {string} thamSo.bangAnhHuong Tên bảng CSDL bị tác động
 * @param {number|null} thamSo.banGhiId ID bản ghi bị tác động
 * @param {Object|null} thamSo.duLieuCu Snapshot dữ liệu trước khi đổi
 * @param {Object|null} thamSo.duLieuMoi Snapshot dữ liệu sau khi đổi
 * @param {string|null} thamSo.diaChiIp Địa chỉ IP thực hiện
 * @param {string|null} thamSo.thietBi Thiết bị thao tác
 * @param {string|null} thamSo.lyDo Diễn giải lý do
 */
function ghiAuditLog({
    taiKhoanId = null,
    hanhDong,
    bangAnhHuong = null,
    doiTuong = null,
    banGhiId = null,
    doiTuongId = null,
    duLieuCu = null,
    duLieuMoi = null,
    diaChiIp = null,
    thietBi = null,
    lyDo = null
}) {
    try {
        const tenBang = bangAnhHuong || doiTuong || 'he_thong';
        const idBanGhi = banGhiId || doiTuongId || null;

        const sql = `
            INSERT INTO nhat_ky_kiem_toan (
                tai_khoan_id, hanh_dong, bang_anh_huong, ban_ghi_id,
                du_lieu_cu, du_lieu_moi, dia_chi_ip, thiet_bi, ly_do
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        thucThi(sql, [
            taiKhoanId,
            hanhDong,
            tenBang,
            idBanGhi,
            duLieuCu ? JSON.stringify(duLieuCu) : null,
            duLieuMoi ? JSON.stringify(duLieuMoi) : null,
            diaChiIp,
            thietBi,
            lyDo
        ]);
        require('../cauHinh/cauHinhSocket').socketPhat.nhatKyThayDoi();
    } catch (loi) {
        console.error('Lỗi khi ghi Audit Log:', loi.message);
    }
}

module.exports = {
    ghiAuditLog
};
