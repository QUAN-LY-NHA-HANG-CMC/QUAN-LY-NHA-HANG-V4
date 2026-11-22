// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// CONTROLLER ĐIỀU HƯỚNG THỰC ĐƠN, MÓN ĂN & BÁO HẾT MÓN / SỐ SUẤT
// ============================================================================

const thucDonService = require('./thucDon.service');
const { phanHoiThanhCong } = require('../../tienIch/dinhDangPhanHoi');

const thucDonController = {
    layThucDon(req, res, next) {
        try {
            const { danhMucId, tuKhoa, chiLayConMon } = req.query;
            const ketQua = thucDonService.layThucDonTongThe({
                danhMucId: danhMucId ? Number(danhMucId) : null,
                tuKhoa,
                chiLayConMon: chiLayConMon === 'true' || chiLayConMon === '1'
            });
            return phanHoiThanhCong(res, ketQua, 'Lấy danh sách thực đơn thành công');
        } catch (loi) {
            next(loi);
        }
    },

    layChiTiet(req, res, next) {
        try {
            const mon = thucDonService.layChiTietMon(Number(req.params.id));
            return phanHoiThanhCong(res, mon, 'Lấy chi tiết món ăn thành công');
        } catch (loi) {
            next(loi);
        }
    },

    doiTrangThaiConMon(req, res, next) {
        try {
            const monId = Number(req.params.id);
            const { conMon } = req.body;
            const nguoiThaoTacId = req.nguoiDung ? req.nguoiDung.taiKhoanId : null;

            const ketQua = thucDonService.doiTrangThaiConMon(monId, conMon, nguoiThaoTacId);
            return phanHoiThanhCong(res, ketQua, 'Cập nhật trạng thái còn món thành công');
        } catch (loi) {
            next(loi);
        }
    },

    capNhatSoSuat(req, res, next) {
        try {
            const monId = Number(req.params.id);
            const { soSuatConLai } = req.body;
            const nguoiThaoTacId = req.nguoiDung ? req.nguoiDung.taiKhoanId : null;

            const ketQua = thucDonService.capNhatSoSuat(monId, soSuatConLai, nguoiThaoTacId);
            return phanHoiThanhCong(res, ketQua, 'Cập nhật số suất món ăn thành công');
        } catch (loi) {
            next(loi);
        }
    },

    taoDanhMuc(req, res, next) {
        try {
            return phanHoiThanhCong(res, thucDonService.taoDanhMuc(req.body ?? {}), 'Đã tạo danh mục', 201);
        } catch (loi) {
            next(loi);
        }
    },

    taoMonAn(req, res, next) {
        try {
            const nguoiThaoTacId = req.nguoiDung ? req.nguoiDung.taiKhoanId : null;
            const { danhMucId, maMon, tenMon, donGia, donViTinh, anhMonAn, moTa, laCombo, soSuatConLai } = req.body;

            const monMoi = thucDonService.taoMonAn({
                danhMucId: Number(danhMucId),
                maMon,
                tenMon,
                donGia: Number(donGia),
                donViTinh,
                anhMonAn,
                moTa,
                laCombo: Boolean(laCombo),
                soSuatConLai: soSuatConLai !== undefined ? soSuatConLai : null
            }, nguoiThaoTacId);

            return phanHoiThanhCong(res, monMoi, 'Tạo món ăn mới thành công', 201);
        } catch (loi) {
            next(loi);
        }
    },

    capNhatMonAn(req, res, next) {
        try {
            const monId = Number(req.params.id);
            const nguoiThaoTacId = req.nguoiDung ? req.nguoiDung.taiKhoanId : null;
            const duLieu = req.body;

            const monCapNhat = thucDonService.capNhatMonAn(monId, duLieu, nguoiThaoTacId);
            return phanHoiThanhCong(res, monCapNhat, 'Cập nhật thông tin món ăn thành công');
        } catch (loi) {
            next(loi);
        }
    },

    xoaMonAn(req, res, next) {
        try {
            const monId = Number(req.params.id);
            const nguoiThaoTacId = req.nguoiDung ? req.nguoiDung.taiKhoanId : null;

            const ketQua = thucDonService.xoaMonAn(monId, nguoiThaoTacId);
            return phanHoiThanhCong(res, ketQua, 'Xóa món ăn khỏi thực đơn thành công');
        } catch (loi) {
            next(loi);
        }
    }
};

module.exports = thucDonController;
