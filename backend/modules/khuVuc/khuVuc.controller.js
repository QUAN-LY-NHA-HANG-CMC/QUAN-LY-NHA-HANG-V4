const khuVucService = require('./khuVuc.service.js');
const dinhDangPhanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function layDanhSach(req, res, next) {
    try {
        const danhSach = await khuVucService.layDanhSach();
        return dinhDangPhanHoi.thanhCong(res, danhSach, 'Lấy danh sách khu vực thành công');
    } catch (loi) {
        next(loi);
    }
}

async function taoKhuVuc(req, res, next) {
    try {
        const khuVucMoi = await khuVucService.taoKhuVuc(req.body);
        return dinhDangPhanHoi.thanhCong(res, khuVucMoi, 'Tạo khu vực thành công', 201);
    } catch (loi) {
        next(loi);
    }
}

async function capNhatKhuVuc(req, res, next) {
    try {
        const khuVuc = await khuVucService.capNhatKhuVuc(req.params.id, req.body);
        return dinhDangPhanHoi.thanhCong(res, khuVuc, 'Cập nhật khu vực thành công');
    } catch (loi) {
        next(loi);
    }
}

async function xoaKhuVuc(req, res, next) {
    try {
        await khuVucService.xoaKhuVuc(req.params.id);
        return dinhDangPhanHoi.thanhCong(res, null, 'Xóa khu vực thành công');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    layDanhSach,
    taoKhuVuc,
    capNhatKhuVuc,
    xoaKhuVuc
};
