// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// CONTROLLER HÓA ĐƠN & THANH TOÁN (FIGMA P01, P02, P03, P04, P05, C09, C10)
// ============================================================================

const hoaDonService = require('./hoaDon.service');
const { phanHoiThanhCong, phanHoiLoi } = require('../../tienIch/dinhDangPhanHoi');

const hoaDonController = {
    async layDanhSach(req, res) {
        try {
            const { tuNgay, denNgay, trangThai, limit, offset } = req.query;
            const ketQua = await hoaDonService.layDanhSachHoaDon({
                tuNgay,
                denNgay,
                trangThai,
                limit,
                offset
            });
            return phanHoiThanhCong(res, ketQua, 'Lấy danh sách hóa đơn thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async layChiTiet(req, res) {
        try {
            const hoaDonId = parseInt(req.params.id, 10);
            const ketQua = await hoaDonService.layChiTietHoaDon(hoaDonId);
            return phanHoiThanhCong(res, ketQua, 'Lấy thông tin chi tiết hóa đơn thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 404);
        }
    },

    async layTamTinhTheoBan(req, res) {
        try {
            const banId = parseInt(req.params.banId, 10);
            const chietKhau = req.query.chietKhau || 0;
            const ketQua = await hoaDonService.layTamTinhTheoBan(banId, chietKhau,
                ['thu_ngan', 'quan_ly'].includes(req.nguoiDung?.vaiTro));
            return phanHoiThanhCong(res, ketQua, 'Lấy bảng tính tạm hóa đơn bàn thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 400);
        }
    },

    async taoHoaDon(req, res) {
        try {
            const { banId, phanTramChietKhau, ghiChu, phuongThuc } = req.body;
            if (!banId) {
                return phanHoiLoi(res, 'Vui lòng cung cấp mã bàn ăn (banId)', 400);
            }

            const thuNganId = req.nguoiDung ? req.nguoiDung.nhan_vien_id : null;
            const ketQua = await hoaDonService.taoHoaDonTuPhienBan(banId, thuNganId, {
                phanTramChietKhau,
                ghiChu,
                phuongThuc
            });
            return phanHoiThanhCong(res, ketQua, 'Tạo hóa đơn cho bàn thành công', 201);
        } catch (loi) {
            return phanHoiLoi(res, loi.message, loi.status || 400);
        }
    },

    async xacNhanThanhToan(req, res) {
        try {
            const hoaDonId = parseInt(req.params.id, 10);
            const {
                phuongThucThanhToan,
                tienKhachDua,
                maGiaoDichNganHang,
                caLamViecId,
                soTienDuKien,
                ghiChu
            } = req.body;

            const thuNganId = req.nguoiDung ? req.nguoiDung.nhan_vien_id : null;

            const ketQua = await hoaDonService.xacNhanThanhToan(
                hoaDonId,
                {
                    phuongThucThanhToan: phuongThucThanhToan || 'tien_mat',
                    tienKhachDua,
                    maGiaoDichNganHang,
                    thuNganId,
                    caLamViecId,
                    soTienDuKien,
                    ghiChu
                },
                req.nguoiDung
            );

            return phanHoiThanhCong(res, ketQua, 'Thanh toán hóa đơn hoàn tất thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, loi.status || 400);
        }
    },

    async chiaTienNhom(req, res) {
        try {
            const hoaDonId = parseInt(req.params.id, 10);
            const { soNguoiChia } = req.body;

            const ketQua = await hoaDonService.taoChiaTienNhom(hoaDonId, soNguoiChia);
            return phanHoiThanhCong(res, ketQua, 'Tạo chia tiền nhóm VietQR thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 400);
        }
    }
};

module.exports = hoaDonController;
