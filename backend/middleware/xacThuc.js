// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MIDDLEWARE XÁC THỰC DANH TÍNH NGƯỜI DÙNG BẰNG JSON WEB TOKEN (JWT)
// ============================================================================

const jwt = require('jsonwebtoken');
const cauHinh = require('../cauHinh/cauHinhChung');
const { phanHoiLoi } = require('../tienIch/dinhDangPhanHoi');
const { truyVanMot } = require('../cauHinh/ketNoiCoSoDuLieu');

function layTaiKhoanTuToken(token) {
    const payload = jwt.verify(token, cauHinh.jwtSecret);
    
    // Kiểm tra tài khoản trong CSDL xem có bị tạm khóa hay xóa không
    const sql = `
        SELECT t.id as tai_khoan_id, t.ten_dang_nhap, t.trang_thai, v.ma_vai_tro,
               n.id as nhan_vien_id, n.ho_ten
        FROM tai_khoan t
        JOIN vai_tro v ON t.vai_tro_id = v.id
        LEFT JOIN nhan_vien n ON n.tai_khoan_id = t.id
        WHERE t.id = ?;
    `;
    return truyVanMot(sql, [payload.taiKhoanId]);

}

/**
 * Middleware bắt buộc đăng nhập tài khoản nội bộ (Nhân viên, Quản lý)
 */
function xacThucNguoiDung(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return phanHoiLoi(res, 'Vui lòng đăng nhập để truy cập tài nguyên này', 401);
    }

    const token = authHeader.split(' ')[1];
    try {
        const taiKhoan = layTaiKhoanTuToken(token);

        if (!taiKhoan) {
            return phanHoiLoi(res, 'Tài khoản không tồn tại trên hệ thống', 401);
        }

        if (taiKhoan.trang_thai !== 'hoat_dong') {
            return phanHoiLoi(res, 'Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động', 403);
        }

        // Gán thông tin người dùng vào request (Hỗ trợ cả camelCase và snake_case)
        req.nguoiDung = {
            id: taiKhoan.tai_khoan_id,
            taiKhoanId: taiKhoan.tai_khoan_id,
            tai_khoan_id: taiKhoan.tai_khoan_id,
            tenDangNhap: taiKhoan.ten_dang_nhap,
            ten_dang_nhap: taiKhoan.ten_dang_nhap,
            vaiTro: taiKhoan.ma_vai_tro,
            vai_tro: taiKhoan.ma_vai_tro,
            nhanVienId: taiKhoan.nhan_vien_id,
            nhan_vien_id: taiKhoan.nhan_vien_id,
            hoTen: taiKhoan.ho_ten,
            ho_ten: taiKhoan.ho_ten
        };

        next();
    } catch (loi) {
        if (loi.name === 'TokenExpiredError') {
            return phanHoiLoi(res, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 401);
        }
        return phanHoiLoi(res, 'Mã xác thực không hợp lệ', 401);
    }
}

/**
 * Middleware tùy chọn (nếu có token thì gán, không có thì bỏ qua)
 */
function xacThucTuyChon(req, res, next) {
    if (req.headers.authorization?.startsWith('Bearer ')) {
        return xacThucNguoiDung(req, res, next);
    }
    next();
}

module.exports = {
    layTaiKhoanTuToken,
    xacThucNguoiDung,
    xacThucTuyChon
};
