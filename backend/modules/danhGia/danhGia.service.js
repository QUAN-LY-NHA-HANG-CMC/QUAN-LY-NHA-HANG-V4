/**
 * Service xử lý nghiệp vụ Đánh giá khách hàng
 * Phụ trách: Minh (Backend Developer)
 */
const danhGiaModel = require('./danhGia.model.js');

async function taoDanhGia(duLieu) {
    if (!duLieu.soSao || duLieu.soSao < 1 || duLieu.soSao > 5) {
        const loi = new Error('Số sao đánh giá phải từ 1 đến 5');
        loi.status = 400;
        throw loi;
    }
    return danhGiaModel.taoDanhGia(duLieu);
}

async function layDanhSach(boLoc) {
    return danhGiaModel.layDanhSach(boLoc);
}

async function layDiemTrungBinh() {
    return danhGiaModel.layDiemTrungBinh();
}

async function phanHoiDanhGia(id, phanHoi) {
    const dg = danhGiaModel.layTheoId(id);
    if (!dg) {
        const loi = new Error('Đánh giá không tồn tại');
        loi.status = 404;
        throw loi;
    }
    return danhGiaModel.capNhatPhanHoi(id, phanHoi);
}

async function doiTrangThai(id, trangThai) {
    const dg = danhGiaModel.layTheoId(id);
    if (!dg) {
        const loi = new Error('Đánh giá không tồn tại');
        loi.status = 404;
        throw loi;
    }
    return danhGiaModel.doiTrangThai(id, trangThai);
}

module.exports = {
    taoDanhGia,
    layDanhSach,
    layDiemTrungBinh,
    phanHoiDanhGia,
    doiTrangThai
};
