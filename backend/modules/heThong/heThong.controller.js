// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// CONTROLLER CẤU HÌNH HỆ THỐNG, THỐNG KÊ & AUDIT LOG (FIGMA A01, A20, S01)
// ============================================================================

const cauHinh = require('../../cauHinh/cauHinhChung');
const heThongService = require('./heThong.service');
const { phanHoiThanhCong, phanHoiLoi } = require('../../tienIch/dinhDangPhanHoi');

const heThongController = {
    async layCauHinh(req, res) {
        try {
            const ketQua = await heThongService.layCauHinh();
            return phanHoiThanhCong(res, ketQua, 'Lấy cấu hình nhà hàng thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async capNhatCauHinh(req, res) {
        try {
            const ketQua = await heThongService.capNhatCauHinh(req.body, req.nguoiDung);
            return phanHoiThanhCong(res, ketQua, 'Cập nhật cấu hình nhà hàng thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 400);
        }
    },

    async layNhatKy(req, res) {
        try {
            const { limit, offset, hanhDong } = req.query;
            const ketQua = await heThongService.layNhatKy({ limit, offset, hanhDong });
            return phanHoiThanhCong(res, ketQua, 'Lấy danh sách nhật ký kiểm toán thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async layThongKeDashboard(req, res) {
        try {
            const ketQua = await heThongService.layThongKeDashboard();
            return phanHoiThanhCong(res, ketQua, 'Lấy số liệu thống kê Dashboard thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async sinhDuLieuMau(req, res) {
        if (cauHinh.moiTruong === 'production') return phanHoiLoi(res, 'Chức năng chỉ dùng ở môi trường phát triển', 403);
        try {
            const { sinhDuLieuMau } = require('../../../database/sinhDuLieuMau');
            const ketQua = sinhDuLieuMau();
            return phanHoiThanhCong(res, ketQua, ketQua.msg);
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async lamSachDuLieu(req, res) {
        if (cauHinh.moiTruong === 'production') return phanHoiLoi(res, 'Chức năng chỉ dùng ở môi trường phát triển', 403);
        try {
            const { lamSachDuLieu } = require('../../../database/lamSachDuLieu');
            const toanBo = req.body?.toanBo === true;
            const ketQua = lamSachDuLieu({ toanBo });
            return phanHoiThanhCong(res, ketQua, ketQua.msg);
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async saoLuuCsdl(req, res) {
        try {
            const { thucHienSaoLuu } = require('../../../database/saoLuuCsdl');
            const ketQua = thucHienSaoLuu();
            return phanHoiThanhCong(res, ketQua, 'Sao lưu cơ sở dữ liệu thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    }
};

module.exports = heThongController;
