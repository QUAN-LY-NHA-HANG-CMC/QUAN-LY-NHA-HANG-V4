const ghiNhatKy = require('../tienIch/ghiNhatKy.js');
const dinhDangPhanHoi = require('../tienIch/dinhDangPhanHoi.js');

function xuLyLoi(loi, req, res, next) {
    ghiNhatKy.ghiLoi(`Lỗi xử lý tại [${req.method} ${req.originalUrl}]`, loi);

    const maTrangThai = loi.status || (loi.statusCode >= 400 && loi.statusCode < 600 ? loi.statusCode : 500);
    const thongDiep = maTrangThai === 500 ? 'Đã xảy ra lỗi máy chủ nội bộ' : (loi.message || 'Lỗi không xác định');

    return dinhDangPhanHoi.thatBai(res, thongDiep, maTrangThai, loi.duLieu || null);
}

module.exports = xuLyLoi;
