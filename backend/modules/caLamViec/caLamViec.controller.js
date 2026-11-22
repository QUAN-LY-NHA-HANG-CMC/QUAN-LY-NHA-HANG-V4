// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// CONTROLLER CA LÀM VIỆC & ĐỔI CA / NGHỈ PHÉP (FIGMA W11, A07)
// ============================================================================

const caLamViecService = require('./caLamViec.service');
const { ghiAuditLog } = require('../../tienIch/ghiNhatKy');
const { socketPhat } = require('../../cauHinh/cauHinhSocket');
const { phanHoiThanhCong, phanHoiLoi } = require('../../tienIch/dinhDangPhanHoi');

const caLamViecController = {
    trangThaiCa(req, res) {
        return phanHoiThanhCong(res, caLamViecService.trangThaiCa(req.nguoiDung.nhan_vien_id));
    },

    layDongNghiep(req, res) {
        return phanHoiThanhCong(res, caLamViecService.layDongNghiep(req.nguoiDung.nhan_vien_id));
    },

    async vaoCaTuDong(req, res) {
        try {
            const ca = await caLamViecService.vaoCaTuDong(req.nguoiDung.nhan_vien_id);
            ghiAuditLog({ taiKhoanId: req.nguoiDung.id, hanhDong: 'XAC_NHAN_VAO_CA', doiTuong: 'ca_lam_viec',
                doiTuongId: ca.id, duLieuMoi: { thoiGian: ca.thoi_gian_checkin } });
            socketPhat.trangThaiCaThayDoi(req.nguoiDung.nhan_vien_id);
            return phanHoiThanhCong(res, ca, 'Đã xác nhận vào ca');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 400);
        }
    },
    async layLichCaNhan(req, res) {
        try {
            const nhanVienId = req.nguoiDung.nhan_vien_id;
            if (!nhanVienId) {
                return phanHoiLoi(res, 'Tài khoản không gắn với hồ sơ nhân viên', 403);
            }
            const { tuNgay, denNgay } = req.query;
            const ketQua = await caLamViecService.layLichNhanVien(nhanVienId, tuNgay, denNgay);
            return phanHoiThanhCong(res, ketQua, 'Lấy lịch làm việc cá nhân thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async layToanBoLich(req, res) {
        try {
            const { tuNgay, denNgay } = req.query;
            const ketQua = await caLamViecService.layToanBoLich(tuNgay, denNgay);
            return phanHoiThanhCong(res, ketQua, 'Lấy toàn bộ lịch phân ca thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async taoCaLamViec(req, res) {
        try {
            const ketQua = await caLamViecService.taoCaLamViec(req.body, req.nguoiDung);
            return phanHoiThanhCong(res, ketQua, 'Tạo ca làm việc thành công', 201);
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 400);
        }
    },

    async capNhatCaLamViec(req, res) {
        try {
            const caId = parseInt(req.params.id, 10);
            const ketQua = await caLamViecService.capNhatCaLamViec(caId, req.body, req.nguoiDung);
            return phanHoiThanhCong(res, ketQua, 'Cập nhật ca làm việc thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 400);
        }
    },

    async xoaCaLamViec(req, res) {
        try {
            const caId = parseInt(req.params.id, 10);
            await caLamViecService.xoaCaLamViec(caId, req.nguoiDung);
            return phanHoiThanhCong(res, null, 'Xóa ca làm việc thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 400);
        }
    },

    async checkinCa(req, res) {
        try {
            const caId = parseInt(req.params.id, 10);
            const nhanVienId = req.nguoiDung.nhan_vien_id;
            const ketQua = await caLamViecService.checkinCa(caId, nhanVienId);
            ghiAuditLog({ taiKhoanId: req.nguoiDung.id, hanhDong: 'XAC_NHAN_VAO_CA', doiTuong: 'ca_lam_viec',
                doiTuongId: caId, duLieuMoi: { thoiGian: ketQua.thoi_gian_checkin } });
            socketPhat.trangThaiCaThayDoi(nhanVienId);
            return phanHoiThanhCong(res, ketQua, 'Điểm danh vào ca làm việc thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 400);
        }
    },

    async checkoutCa(req, res) {
        try {
            const caId = parseInt(req.params.id, 10);
            const nhanVienId = req.nguoiDung.nhan_vien_id;
            const ketQua = await caLamViecService.checkoutCa(caId, nhanVienId);
            ghiAuditLog({ taiKhoanId: req.nguoiDung.id, hanhDong: 'XAC_NHAN_HET_CA', doiTuong: 'ca_lam_viec',
                doiTuongId: caId, duLieuMoi: { thoiGian: ketQua.thoi_gian_checkout } });
            socketPhat.trangThaiCaThayDoi(nhanVienId);
            return phanHoiThanhCong(res, ketQua, 'Hoàn thành ca làm việc thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 400);
        }
    },

    async layDanhSachYeuCau(req, res) {
        try {
            const { trangThai, nhanVienId } = req.query;
            // Nếu là nhân viên thường, chỉ cho xem yêu cầu của chính mình
            let locNhanVienId = nhanVienId;
            if (req.nguoiDung.vai_tro !== 'quan_ly') {
                locNhanVienId = req.nguoiDung.nhan_vien_id;
                if (!locNhanVienId) return phanHoiLoi(res, 'Tài khoản chưa có hồ sơ nhân viên', 403);
            }

            const ketQua = await caLamViecService.layDanhSachYeuCauDoiCa({
                trangThai,
                nhanVienId: locNhanVienId
            });
            return phanHoiThanhCong(res, ketQua, 'Lấy danh sách yêu cầu đổi ca thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async taoYeuCauDoiCa(req, res) {
        try {
            const nhanVienYeuCauId = req.nguoiDung.nhan_vien_id;
            const { caLamViecId, loaiYeuCau, nhanVienNhanCaId, lyDo } = req.body;

            const ketQua = await caLamViecService.taoYeuCauDoiCa({
                nhanVienYeuCauId,
                caLamViecId: parseInt(caLamViecId, 10),
                loaiYeuCau,
                nhanVienNhanCaId: nhanVienNhanCaId ? parseInt(nhanVienNhanCaId, 10) : null,
                lyDo
            });

            return phanHoiThanhCong(res, ketQua, 'Gửi yêu cầu đổi ca / xin nghỉ thành công', 201);
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 400);
        }
    },

    async pheDuyetYeuCau(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const { trangThai, ghiChuDuyet } = req.body;
            const quanLyId = req.nguoiDung.nhan_vien_id;

            const ketQua = await caLamViecService.pheDuyetYeuCau(
                id,
                { trangThai, quanLyId, ghiChuDuyet },
                req.nguoiDung
            );
            return phanHoiThanhCong(res, ketQua, 'Phê duyệt yêu cầu đổi ca thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 400);
        }
    }
};

module.exports = caLamViecController;
