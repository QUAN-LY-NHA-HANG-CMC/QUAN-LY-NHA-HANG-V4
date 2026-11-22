// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// CONTROLLER ĐIỀU PHỐI BẾP KDS (FIGMA K01, K02, K03, K05)
// ============================================================================

const dieuPhoiBepService = require('./dieuPhoiBep.service');
const { phanHoiThanhCong, phanHoiLoi } = require('../../tienIch/dinhDangPhanHoi');

const dieuPhoiBepController = {
    async layHangDoi(req, res) {
        try {
            const { cheDo } = req.query; // 'theo_ban' hoặc 'gom_mon'
            const ketQua = await dieuPhoiBepService.layHangDoi(cheDo);
            return phanHoiThanhCong(res, ketQua, 'Lấy danh sách hàng đợi bếp thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async layMonDaHoanThanh(req, res) {
        try {
            const ketQua = await dieuPhoiBepService.layMonDaHoanThanh(req.query.choBung === '1');
            return phanHoiThanhCong(res, ketQua, 'Lấy danh sách món đã hoàn thành gần đây');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async chuyenTrangThai(req, res) {
        try {
            const chiTietId = parseInt(req.params.id, 10);
            const { trangThaiMoi } = req.body;

            if (!trangThaiMoi) {
                return phanHoiLoi(res, 'Vui lòng cung cấp trạng thái mới', 400);
            }
            const vaiTro = req.nguoiDung?.vaiTro || req.nguoiDung?.ma_vai_tro;
            const canVaiTro = trangThaiMoi === 'da_phuc_vu' ? 'phuc_vu' : 'bep';
            if (![canVaiTro, 'quan_ly'].includes(vaiTro)) {
                return phanHoiLoi(res, 'Bạn không có quyền xác nhận trạng thái món này', 403);
            }
            if (trangThaiMoi === 'da_phuc_vu')
                require('../banAn/dieuPhoiBan').kiemTraNguoiNhan(req.nguoiDung, 'bung_mon', chiTietId);

            const ketQua = await dieuPhoiBepService.chuyenTrangThai(
                chiTietId,
                trangThaiMoi,
                trangThaiMoi === 'da_phuc_vu' ? null : req.nguoiDung?.nhan_vien_id ?? null,
                req.nguoiDung
            );
            return phanHoiThanhCong(res, ketQua, 'Cập nhật tiến độ món ăn thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, loi.status || 400);
        }
    },

    async datLenhUuTien(req, res) {
        try {
            const chiTietId = parseInt(req.params.id, 10);
            const { laUuTien } = req.body;

            const ketQua = await dieuPhoiBepService.datLenhUuTien(
                chiTietId,
                laUuTien !== undefined ? laUuTien : 1,
                req.nguoiDung
            );
            return phanHoiThanhCong(res, ketQua, 'Cập nhật độ ưu tiên thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 400);
        }
    },

    async phatLenh(req, res) {
        try {
            const ketQua = await dieuPhoiBepService.phatLenhDieuPhoi(req.body, req.nguoiDung);
            return phanHoiThanhCong(res, ketQua, 'Phát lệnh điều phối thành công', 201);
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 400);
        }
    },

    async layLichSuLenh(req, res) {
        try {
            const boPhan = req.nguoiDung.vaiTro === 'quan_ly' ? req.query.boPhan : req.nguoiDung.vaiTro;
            const ketQua = await dieuPhoiBepService.layLichSuLenh(boPhan);
            return phanHoiThanhCong(res, ketQua, 'Lấy lịch sử điều phối thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async xacNhanTiepNhan(req, res) {
        try {
            const lenhId = parseInt(req.params.id, 10);
            const ketQua = await dieuPhoiBepService.xacNhanTiepNhan(lenhId, req.nguoiDung);
            return phanHoiThanhCong(res, ketQua, 'Xác nhận tiếp nhận lệnh điều phối thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 400);
        }
    }
};

module.exports = dieuPhoiBepController;
