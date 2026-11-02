const banAnService = require('./banAn.service.js');
const dinhDangPhanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function layDanhSach(req, res, next) {
    try {
        const { khuVucId, trangThai } = req.query;
        const danhSach = await banAnService.layDanhSach({ khuVucId, trangThai });
        return dinhDangPhanHoi.thanhCong(res, danhSach, 'Lấy danh sách bàn ăn thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layTheoId(req, res, next) {
    try {
        const ban = await banAnService.layTheoId(req.params.id);
        return dinhDangPhanHoi.thanhCong(res, ban, 'Lấy thông tin bàn thành công');
    } catch (loi) {
        next(loi);
    }
}

async function taoBanAn(req, res, next) {
    try {
        const banMoi = await banAnService.taoBanAn(req.body);
        return dinhDangPhanHoi.thanhCong(res, banMoi, 'Tạo bàn ăn thành công', 201);
    } catch (loi) {
        next(loi);
    }
}

async function capNhatBanAn(req, res, next) {
    try {
        const banCapNhat = await banAnService.capNhatBanAn(req.params.id, req.body);
        return dinhDangPhanHoi.thanhCong(res, banCapNhat, 'Cập nhật bàn ăn thành công');
    } catch (loi) {
        next(loi);
    }
}

async function lamMoiQrToken(req, res, next) {
    try {
        const banCapNhat = await banAnService.lamMoiQrToken(req.params.id);
        return dinhDangPhanHoi.thanhCong(res, banCapNhat, 'Làm mới mã QR bàn thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layAnhQrBan(req, res, next) {
    try {
        const qr = await banAnService.layAnhQrBan(req.params.id);
        return dinhDangPhanHoi.thanhCong(res, qr, 'Lấy ảnh QR bàn thành công');
    } catch (loi) {
        next(loi);
    }
}

async function doiTrangThai(req, res, next) {
    try {
        const { trangThai } = req.body;
        await banAnService.doiTrangThai(req.params.id, trangThai);
        return dinhDangPhanHoi.thanhCong(res, null, 'Cập nhật trạng thái bàn thành công');
    } catch (loi) {
        next(loi);
    }
}

async function xoaBanAn(req, res, next) {
    try {
        await banAnService.xoaBanAn(req.params.id);
        return dinhDangPhanHoi.thanhCong(res, null, 'Xóa bàn ăn thành công');
    } catch (loi) {
        next(loi);
    }
}

async function laySoDoChiTiet(req, res, next) {
    try {
        const danhSach = await banAnService.laySoDoChiTiet();
        return dinhDangPhanHoi.thanhCong(res, danhSach, 'Lấy sơ đồ bàn chi tiết thành công');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    layDanhSach,
    layTheoId,
    taoBanAn,
    capNhatBanAn,
    lamMoiQrToken,
    layAnhQrBan,
    doiTrangThai,
    xoaBanAn,
    laySoDoChiTiet
};
