/**
 * Tiện ích ghi nhận nhật ký hệ thống (System Logs & Audit Trail)
 * Phục vụ US-044 & Mục 10.9 (QUY_TAC_LAM_DU_AN.txt)
 * Nghiêm cấm ghi mật khẩu, token hoặc thông tin nhạy cảm vào nhật ký
 */
const { thucThi } = require('../cauHinh/ketNoiCoSoDuLieu');

/**
 * Loại bỏ các trường nhạy cảm khỏi đối tượng trước khi ghi log
 * @param {Object} duLieu
 * @returns {string} Chuỗi JSON an toàn
 */
function locDuLieuNhayCam(duLieu) {
    if (!duLieu) return null;
    try {
        const banSao = JSON.parse(JSON.stringify(duLieu));
        const cacTruongNhayCam = [
            'matKhau', 'matKhauCu', 'matKhauMoi', 'xacNhanMatKhau',
            'password', 'oldPassword', 'newPassword',
            'accessToken', 'refreshToken', 'token', 'authorization'
        ];

        function deQuyXoa(obj) {
            if (obj && typeof obj === 'object') {
                for (const key of Object.keys(obj)) {
                    if (cacTruongNhayCam.includes(key)) {
                        obj[key] = '***DA_GIAU_THONG_TIN_BAO_MAT***';
                    } else if (typeof obj[key] === 'object') {
                        deQuyXoa(obj[key]);
                    }
                }
            }
        }

        deQuyXoa(banSao);
        return JSON.stringify(banSao);
    } catch {
        return null;
    }
}

/**
 * Ghi nhật ký hành động vào cơ sở dữ liệu
 * @param {Object} thamSo
 * @param {number|null} thamSo.taiKhoanId - ID tài khoản thực hiện (nếu có)
 * @param {string} thamSo.loaiHanhDong - Tên hành động (DANG_NHAP, DOI_MAT_KHAU, ...)
 * @param {string} thamSo.module - Tên phân hệ (TAI_KHOAN, VAI_TRO, CAU_HINH, ...)
 * @param {string} thamSo.moTa - Mô tả chi tiết hành động
 * @param {string} [thamSo.diaChiIp] - Địa chỉ IP máy khách
 * @param {string} [thamSo.thongTinThietBi] - User-Agent trình duyệt/thiết bị
 * @param {any} [thamSo.duLieuYeuCau] - Dữ liệu kèm theo yêu cầu (đã tự động lọc nhạy cảm)
 */
async function ghiNhatKyHeThong({
    taiKhoanId = null,
    loaiHanhDong,
    module: tenModule,
    moTa,
    diaChiIp = null,
    thongTinThietBi = null,
    duLieuYeuCau = null
}) {
    try {
        const duLieuAnToan = locDuLieuNhayCam(duLieuYeuCau);
        const thoiGian = new Date().toISOString().replace('T', ' ').substring(0, 19);

        await thucThi(
            `INSERT INTO nhat_ky_he_thong 
            (tai_khoan_id, loai_hanh_dong, module, mo_ta, dia_chi_ip, thong_tin_thiet_bi, du_lieu_yeu_cau, ngay_tao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [taiKhoanId, loaiHanhDong, tenModule, moTa, diaChiIp, thongTinThietBi, duLieuAnToan, thoiGian]
        );
    } catch (loi) {
        // Ghi nhật ký lỗi console, không để lỗi ghi log làm sập luồng chính
        console.error('Lỗi khi ghi nhật ký hệ thống:', loi.message);
    }
}

module.exports = {
    ghiNhatKyHeThong,
    locDuLieuNhayCam
};
