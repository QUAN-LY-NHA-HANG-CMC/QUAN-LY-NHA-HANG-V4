const thucDonService = require('./thucDon.service.js');
const dinhDangPhanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function layDanhSach(req, res, next) {
    try {
        const { danhMucId, tuKhoa, trangThai, laMonNoiBat, trang, gioiHan } = req.query;
        const ketQua = await thucDonService.layDanhSach({
            danhMucId,
            tuKhoa,
            trangThai,
            laMonNoiBat,
            trang,
            gioiHan
        });
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy danh sách thực đơn thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layTheoId(req, res, next) {
    try {
        const mon = await thucDonService.layTheoId(req.params.id);
        return dinhDangPhanHoi.thanhCong(res, mon, 'Lấy chi tiết món ăn thành công');
    } catch (loi) {
        next(loi);
    }
}

async function taoMonAn(req, res, next) {
    try {
        const duLieu = req.body;
        if (req.file) {
            duLieu.hinhAnh = `/tepTaiLen/${req.file.filename}`;
        }
        if (typeof duLieu.tuyChon === 'string') {
            try {
                duLieu.tuyChon = JSON.parse(duLieu.tuyChon);
            } catch (e) {
                duLieu.tuyChon = [];
            }
        }
        const monMoi = await thucDonService.taoMonAn(duLieu);
        return dinhDangPhanHoi.thanhCong(res, monMoi, 'Tạo món ăn thành công', 201);
    } catch (loi) {
        next(loi);
    }
}

async function capNhatMonAn(req, res, next) {
    try {
        const duLieu = req.body;
        if (req.file) {
            duLieu.hinhAnh = `/tepTaiLen/${req.file.filename}`;
        }
        if (typeof duLieu.tuyChon === 'string') {
            try {
                duLieu.tuyChon = JSON.parse(duLieu.tuyChon);
            } catch (e) {
                duLieu.tuyChon = [];
            }
        }
        const monCapNhat = await thucDonService.capNhatMonAn(req.params.id, duLieu);
        return dinhDangPhanHoi.thanhCong(res, monCapNhat, 'Cập nhật món ăn thành công');
    } catch (loi) {
        next(loi);
    }
}

async function doiTrangThai(req, res, next) {
    try {
        const { trangThai } = req.body;
        await thucDonService.doiTrangThai(req.params.id, trangThai);
        return dinhDangPhanHoi.thanhCong(res, null, 'Cập nhật trạng thái món ăn thành công');
    } catch (loi) {
        next(loi);
    }
}

async function xoaMemMonAn(req, res, next) {
    try {
        await thucDonService.xoaMemMonAn(req.params.id);
        return dinhDangPhanHoi.thanhCong(res, null, 'Xóa món ăn thành công');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    layDanhSach,
    layTheoId,
    taoMonAn,
    capNhatMonAn,
    doiTrangThai,
    xoaMemMonAn
};
