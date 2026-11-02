const jwt = require('jsonwebtoken');
const cauHinhBaoMat = require('../cauHinh/cauHinhBaoMat.js');
const dinhDangPhanHoi = require('../tienIch/dinhDangPhanHoi.js');

function xacThucNguoiDung(req, res, next) {
    const tieuDeUyQuyen = req.headers.authorization || req.headers['authorization'];
    let token = null;

    if (tieuDeUyQuyen && tieuDeUyQuyen.startsWith('Bearer ')) {
        token = tieuDeUyQuyen.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return dinhDangPhanHoi.thatBai(res, 'Chưa đăng nhập hoặc thiếu token xác thực', 401);
    }

    try {
        const duLieuGiaiMa = jwt.verify(token, cauHinhBaoMat.khoaBiMatJwt);
        req.nguoiDung = duLieuGiaiMa;
        next();
    } catch (loi) {
        return dinhDangPhanHoi.thatBai(res, 'Phiên làm việc không hợp lệ hoặc đã hết hạn', 401);
    }
}

module.exports = xacThucNguoiDung;
