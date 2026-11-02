/**
 * Middleware phân quyền truy cập dựa trên Vai trò (RBAC) và Quyền hạn chi tiết
 * Phục vụ US-004, US-018 -> US-021 & Mục 7.14 (QUY_TAC_LAM_DU_AN.txt)
 */
const { phanHoiLoi } = require('../tienIch/dinhDangPhanHoi');

/**
 * Kiểm tra xem tài khoản có thuộc ít nhất một trong các vai trò được phép hay không
 * @param {Array<string>} danhSachVaiTroChoPhep - Ví dụ: ['QUAN_LY'], ['THU_NGAN', 'QUAN_LY']
 */
function kiemTraVaiTro(danhSachVaiTroChoPhep = []) {
    return (req, res, next) => {
        if (!req.taiKhoan) {
            return phanHoiLoi(res, 'Chưa xác thực thông tin người dùng.', 401);
        }

        const vaiTroHienTai = req.taiKhoan.vaiTro || [];

        // Quản lý mặc định có quyền truy cập quản trị
        if (vaiTroHienTai.includes('QUAN_LY')) {
            return next();
        }

        const coQuyen = danhSachVaiTroChoPhep.some(vaiTro => vaiTroHienTai.includes(vaiTro));
        if (!coQuyen) {
            return phanHoiLoi(
                res,
                'Bạn không có quyền truy cập vào chức năng này (Yêu cầu vai trò: ' + danhSachVaiTroChoPhep.join(', ') + ').',
                403
            );
        }

        next();
    };
}

/**
 * Kiểm tra xem tài khoản có quyền hạn chi tiết hay không
 * @param {Array<string>|string} quyenCanKiemTra - Mã quyền (VD: 'QUAN_LY_THUC_DON' hoặc ['XEM_DON_BEP', 'CHE_BIEN_MON'])
 * @param {string} cheDo - 'MOT_TRONG_CAC' (mặc định) hoặc 'TAT_CA'
 */
function kiemTraQuyen(quyenCanKiemTra, cheDo = 'MOT_TRONG_CAC') {
    const danhSachCan = Array.isArray(quyenCanKiemTra) ? quyenCanKiemTra : [quyenCanKiemTra];

    return (req, res, next) => {
        if (!req.taiKhoan) {
            return phanHoiLoi(res, 'Chưa xác thực thông tin người dùng.', 401);
        }

        const vaiTroHienTai = req.taiKhoan.vaiTro || [];
        const quyenHienTai = req.taiKhoan.danhSachQuyen || [];

        // Nếu là Quản lý, mặc định bypass qua mọi quyền
        if (vaiTroHienTai.includes('QUAN_LY')) {
            return next();
        }

        let hopLe = false;
        if (cheDo === 'TAT_CA') {
            hopLe = danhSachCan.every(q => quyenHienTai.includes(q));
        } else {
            hopLe = danhSachCan.some(q => quyenHienTai.includes(q));
        }

        if (!hopLe) {
            return phanHoiLoi(
                res,
                `Bạn không có quyền thực hiện hành động này (Quyền yêu cầu: ${danhSachCan.join(', ')}).`,
                403
            );
        }

        next();
    };
}

module.exports = {
    kiemTraVaiTro,
    kiemTraQuyen
};
