// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// CONTROLLER ĐIỀU HƯỚNG ĐƠN GỌI MÓN, DUYỆT ĐƠN & TIẾN ĐỘ MÓN
// ============================================================================

const banAnModel = require('../banAn/banAn.model');
const donGoiMonService = require('./donGoiMon.service');
const { phanHoiThanhCong } = require('../../tienIch/dinhDangPhanHoi');
const { yeuCauQuyen } = require('../banAn/thietBiPhienBan');

const donGoiMonController = {
    taoDon(req, res, next) {
        try {
            const { maQrToken, banId, danhSachMon, nguonTao, khoaGui, phienSuaGio } = req.body;
            const datHo = nguonTao === 'phuc_vu_dat_ho';
            const nhanVienTaoId = datHo ? req.nguoiDung?.nhanVienId : null;
            if (datHo && (!nhanVienTaoId || !['phuc_vu', 'thu_ngan', 'quan_ly'].includes(req.nguoiDung.vaiTro))) {
                throw Object.assign(new Error('Cần tài khoản nhân viên để đặt món hộ'), { status: 403 });
            }
            if (!datHo && (typeof maQrToken !== 'string' || !maQrToken)) {
                throw Object.assign(new Error('Vui lòng quét mã QR của bàn'), { status: 403 });
            }

            const ban = !datHo && banAnModel.timTheoQrToken(maQrToken);
            if (!datHo && !ban) throw Object.assign(new Error('Mã QR không khớp bàn'), { status: 403 });
            const thietBi = !datHo ? yeuCauQuyen(ban.id, req.get('X-Device-Key')) : null;
            const ketQua = donGoiMonService.taoDonGoiMon({
                maQrToken: datHo ? null : maQrToken,
                khoaGui,
                phienSuaGio: datHo ? null : phienSuaGio,
                banId: datHo ? Number(banId) : null,
                danhSachMon,
                nguonTao: datHo ? 'phuc_vu_dat_ho' : 'khach_qr',
                nhanVienTaoId,
                thietBi
            });

            return phanHoiThanhCong(res, ketQua, 'Gửi yêu cầu đặt món thành công', 201);
        } catch (loi) {
            next(loi);
        }
    },

    layMonTheoBan(req, res, next) {
        try {
            const banId = Number(req.params.banId);
            let thietBiId = null;
            if (!req.nguoiDung || req.get('X-Device-Key')) {
                const token = req.get('X-Table-Token');
                const ban = token && banAnModel.timTheoQrToken(token);
                if (ban?.id !== banId) throw Object.assign(new Error('Mã QR không khớp bàn'), { status: 403 });
                thietBiId = yeuCauQuyen(banId, req.get('X-Device-Key')).id;
            }
            const ketQua = donGoiMonService.layMonTheoBan(banId, thietBiId);
            return phanHoiThanhCong(res, ketQua, 'Lấy danh sách món theo bàn thành công');
        } catch (loi) {
            next(loi);
        }
    },

    layDonChoDuyet(req, res, next) {
        try {
            const danhSach = donGoiMonService.layDonChoDuyet();
            return phanHoiThanhCong(res, danhSach, 'Lấy danh sách đơn chờ duyệt thành công');
        } catch (loi) {
            next(loi);
        }
    },

    duyetDonQR(req, res, next) {
        try {
            const donId = Number(req.params.id);
            const nhanVienDuyetId = req.nguoiDung ? req.nguoiDung.nhanVienId : null;
            const ketQua = donGoiMonService.duyetDonQR(donId, nhanVienDuyetId);
            return phanHoiThanhCong(res, ketQua, 'Duyệt đơn món chuyển Bếp thành công');
        } catch (loi) {
            next(loi);
        }
    },

    tuChoiDonQR(req, res, next) {
        try {
            const donId = Number(req.params.id);
            const { lyDoTuChoi } = req.body;
            const nhanVienDuyetId = req.nguoiDung ? req.nguoiDung.nhanVienId : null;
            const ketQua = donGoiMonService.tuChoiDonQR(donId, nhanVienDuyetId, lyDoTuChoi);
            return phanHoiThanhCong(res, ketQua, 'Từ chối đơn gọi món thành công');
        } catch (loi) {
            next(loi);
        }
    },

    yeuCauHuyMon(req, res, next) {
        try {
            const { chiTietDonMonId, lyDoHuy } = req.body;
            const nhanVienYeuCauId = req.nguoiDung ? req.nguoiDung.nhanVienId : null;
            const ketQua = donGoiMonService.yeuCauHuyMon({
                chiTietDonMonId: Number(chiTietDonMonId),
                nhanVienYeuCauId,
                lyDoHuy
            });
            return phanHoiThanhCong(res, ketQua, ketQua.msg);
        } catch (loi) {
            next(loi);
        }
    }
};

module.exports = donGoiMonController;
