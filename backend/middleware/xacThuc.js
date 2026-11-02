/**
 * Middleware xác thực danh tính người dùng bằng JWT Token
 * Phục vụ US-002, US-003, US-004 & Mục 7 (QUY_TAC_LAM_DU_AN.txt)
 */
const jwt = require('jsonwebtoken');
const cauHinhBaoMat = require('../cauHinh/cauHinhBaoMat');
const { phanHoiLoi } = require('../tienIch/dinhDangPhanHoi');
const { truyVanMotBanGhi, truyVanDanhSach } = require('../cauHinh/ketNoiCoSoDuLieu');

/**
 * Middleware bắt buộc phải đăng nhập hợp lệ
 */
async function xacThuc(req, res, next) {
    try {
        let token = null;

        // Trích xuất token từ Authorization Header (Bearer <token>)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies && req.cookies.access_token) {
            token = req.cookies.access_token;
        }

        if (!token) {
            return phanHoiLoi(
                res,
                'Yêu cầu chưa được xác thực. Vui lòng đăng nhập để tiếp tục.',
                401
            );
        }

        // Giải mã và kiểm tra chữ ký JWT
        let payload;
        try {
            payload = jwt.verify(token, cauHinhBaoMat.jwt.biMatAccessToken);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return phanHoiLoi(
                    res,
                    'Phiên đăng nhập đã hết hạn. Vui lòng làm mới token hoặc đăng nhập lại.',
                    401,
                    { hetHan: true }
                );
            }
            return phanHoiLoi(
                res,
                'Mã xác thực không hợp lệ hoặc đã bị chỉnh sửa.',
                401
            );
        }

        // Kiểm tra tài khoản trong cơ sở dữ liệu
        const taiKhoan = await truyVanMotBanGhi(
            `SELECT id, ten_dang_nhap, ho_ten, so_dien_thoai, email, trang_thai 
             FROM tai_khoan 
             WHERE id = ?`,
            [payload.taiKhoanId]
        );

        if (!taiKhoan) {
            return phanHoiLoi(res, 'Tài khoản không tồn tại trên hệ thống.', 401);
        }

        if (taiKhoan.trang_thai !== 1) {
            return phanHoiLoi(res, 'Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động.', 403);
        }

        // Lấy danh sách vai trò hiện tại của tài khoản
        const danhSachVaiTro = await truyVanDanhSach(
            `SELECT vt.id, vt.ma_vai_tro, vt.ten_vai_tro 
             FROM vai_tro vt
             INNER JOIN tai_khoan_vai_tro tkvt ON vt.id = tkvt.vai_tro_id
             WHERE tkvt.tai_khoan_id = ? AND vt.trang_thai = 1`,
            [taiKhoan.id]
        );

        const mangMaVaiTro = danhSachVaiTro.map(v => v.ma_vai_tro);

        // Lấy danh sách mã quyền hạn của tài khoản thông qua các vai trò
        const danhSachQuyen = await truyVanDanhSach(
            `SELECT DISTINCT qh.ma_quyen 
             FROM quyen_han qh
             INNER JOIN vai_tro_quyen_han vtqh ON qh.id = vtqh.quyen_han_id
             INNER JOIN tai_khoan_vai_tro tkvt ON vtqh.vai_tro_id = tkvt.vai_tro_id
             WHERE tkvt.tai_khoan_id = ?`,
            [taiKhoan.id]
        );

        const mangMaQuyen = danhSachQuyen.map(q => q.ma_quyen);

        // Gắn thông tin tài khoản vào đối tượng req để các middleware và controller phía sau sử dụng
        req.taiKhoan = {
            id: taiKhoan.id,
            tenDangNhap: taiKhoan.ten_dang_nhap,
            hoTen: taiKhoan.ho_ten,
            soDienThoai: taiKhoan.so_dien_thoai,
            email: taiKhoan.email,
            vaiTro: mangMaVaiTro,
            danhSachQuyen: mangMaQuyen
        };

        next();
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    xacThuc
};
