const banAnModel = require('../modules/banAn/banAn.model');
const { phanHoiLoi } = require('../tienIch/dinhDangPhanHoi');
const { yeuCauQuyen } = require('../modules/banAn/thietBiPhienBan');

function xacThucBan(req, res, next) {
    const token = req.get('X-Table-Token');
    const ban = token && banAnModel.timTheoQrToken(token);
    if (ban?.id !== Number(req.params.banId || req.params.id)) {
        return phanHoiLoi(res, 'Vui lòng quét đúng mã QR của bàn', 403);
    }
    req.ban = ban;
    return next();
}

xacThucBan.yeuCauThietBi = (req, res, next) => {
    req.thietBi = yeuCauQuyen(req.ban.id, req.get('X-Device-Key'));
    next();
};
module.exports = xacThucBan;
