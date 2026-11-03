const danhMucService = require('./danhMucMon.service.js');
const dinhDangPhanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function layDanhSach(req, res, next) {
    try {
        const danhSach = await danhMucService.layDanhSach();
        return dinhDangPhanHoi.thanhCong(res, danhSach, 'Lấy danh sách danh mục thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layTheoId(req, res, next) {
    try {
        const danhMuc = await danhMucService.layTheoId(req.params.id);
        return dinhDangPhanHoi.thanhCong(res, danhMuc, 'Lấy danh mục thành công');
    } catch (loi) {
        next(loi);
    }
}

async function taoDanhMuc(req, res, next) {
    try {
        const danhMucMoi = await danhMucService.taoDanhMuc(req.body);
        return dinhDangPhanHoi.thanhCong(res, danhMucMoi, 'Tạo danh mục món ăn thành công', 201);
    } catch (loi) {
        next(loi);
    }
}

async function capNhatDanhMuc(req, res, next) {
    try {
        const danhMuc = await danhMucService.capNhatDanhMuc(req.params.id, req.body);
        return dinhDangPhanHoi.thanhCong(res, danhMuc, 'Cập nhật danh mục thành công');
    } catch (loi) {
        next(loi);
    }
}

async function xoaDanhMuc(req, res, next) {
    try {
        await danhMucService.xoaDanhMuc(req.params.id);
        return dinhDangPhanHoi.thanhCong(res, null, 'Xóa danh mục thành công');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    layDanhSach,
    layTheoId,
    taoDanhMuc,
    capNhatDanhMuc,
    xoaDanhMuc
};
