const caLamViec = require('../modules/caLamViec/caLamViec.service');
const { phanHoiLoi } = require('../tienIch/dinhDangPhanHoi');

module.exports = function yeuCauVaoCa(req, res, next) {
    const nguoiDung = req.nguoiDung;
    if (['phuc_vu', 'thu_ngan'].includes(nguoiDung?.vaiTro) &&
        !caLamViec.trangThaiCa(nguoiDung.nhanVienId).caDangLam) {
        return phanHoiLoi(res, 'Hãy xác nhận vào ca trước khi xem hoặc thao tác với bàn.', 403);
    }
    next();
};
