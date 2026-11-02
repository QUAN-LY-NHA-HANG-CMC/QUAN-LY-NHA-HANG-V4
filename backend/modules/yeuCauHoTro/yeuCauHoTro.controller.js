/**
 * Controller xử lý các yêu cầu hỗ trợ bàn
 * Phụ trách: Minh (Backend Nghiệp vụ)
 */
const yeuCauHoTroService = require('./yeuCauHoTro.service.js');
const phanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function taoYeuCau(req, res) {
    try {
        const { phienBanId, banAnId, loaiYeuCau, lyDo } = req.body;
        const ketQua = await yeuCauHoTroService.taoYeuCau({ phienBanId, banAnId, loaiYeuCau, lyDo });
        return phanHoi.taoThanhCong(res, ketQua, 'Yêu cầu hỗ trợ đã được gửi tới nhân viên');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi gửi yêu cầu hỗ trợ', 400);
    }
}

async function tiepNhanYeuCau(req, res) {
    try {
        const id = Number(req.params.id);
        const ketQua = await yeuCauHoTroService.tiepNhanYeuCau(id);
        return phanHoi.thanhCong(res, ketQua, 'Tiếp nhận yêu cầu thành công');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi tiếp nhận yêu cầu', 400);
    }
}

async function layDanhSach(req, res) {
    try {
        const ketQua = await yeuCauHoTroService.layDanhSachYeuCau();
        return phanHoi.thanhCong(res, ketQua, 'Lấy danh sách yêu cầu thành công');
    } catch (loi) {
        return phanHoi.thatBai(res, loi.message || 'Lỗi khi tải danh sách yêu cầu', 400);
    }
}

module.exports = {
    taoYeuCau,
    tiepNhanYeuCau,
    layDanhSach
};
