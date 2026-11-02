const dinhDangPhanHoi = require('../tienIch/dinhDangPhanHoi.js');

// Lưu trữ bộ đếm request đơn giản theo IP trong bộ nhớ
const boDemYeuCau = new Map();

function gioiHanYeuCau(gioiHanToiDa = 120, thoiGianCuaSoMs = 60000) {
    return (req, res, next) => {
        const diaChiIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
        const thoiDiemHienTai = Date.now();

        let thongTinIp = boDemYeuCau.get(diaChiIp);
        if (!thongTinIp || thoiDiemHienTai - thongTinIp.batDau > thoiGianCuaSoMs) {
            thongTinIp = { batDau: thoiDiemHienTai, dem: 1 };
            boDemYeuCau.set(diaChiIp, thongTinIp);
            return next();
        }

        thongTinIp.dem += 1;
        if (thongTinIp.dem > gioiHanToiDa) {
            return dinhDangPhanHoi.thatBai(res, 'Quá nhiều yêu cầu, vui lòng thử lại sau', 429);
        }

        next();
    };
}

module.exports = gioiHanYeuCau;
