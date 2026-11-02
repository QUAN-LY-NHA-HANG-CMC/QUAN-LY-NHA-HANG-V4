const dinhDangPhanHoi = require('../tienIch/dinhDangPhanHoi.js');

function kiemTraVaiTro(...cacVaiTroHopLe) {
    return (req, res, next) => {
        if (!req.nguoiDung) {
            return dinhDangPhanHoi.thatBai(res, 'Chưa xác thực người dùng', 401);
        }

        const vaiTroHienTai = req.nguoiDung.vaiTro;
        if (vaiTroHienTai === 'quan_ly' || cacVaiTroHopLe.includes(vaiTroHienTai)) {
            return next();
        }

        return dinhDangPhanHoi.thatBai(res, 'Bạn không có quyền thực hiện hành động này', 403);
    };
}

function kiemTraQuyen(maQuyenYeuCau) {
    return (req, res, next) => {
        if (!req.nguoiDung) {
            return dinhDangPhanHoi.thatBai(res, 'Chưa xác thực người dùng', 401);
        }

        const vaiTro = req.nguoiDung.vaiTro;
        if (vaiTro === 'quan_ly') {
            return next();
        }

        const danhSachQuyen = req.nguoiDung.danhSachQuyen || [];
        if (danhSachQuyen.includes(maQuyenYeuCau)) {
            return next();
        }

        return dinhDangPhanHoi.thatBai(res, 'Bạn không đủ quyền hạn để truy cập', 403);
    };
}

module.exports = {
    kiemTraVaiTro,
    kiemTraQuyen
};
