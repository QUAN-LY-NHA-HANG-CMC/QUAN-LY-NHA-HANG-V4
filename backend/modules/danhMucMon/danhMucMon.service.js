const danhMucModel = require('./danhMucMon.model.js');
const thucDonModel = require('../thucDon/thucDon.model.js');

async function layDanhSach() {
    return danhMucModel.layDanhSach();
}

async function layTheoId(id) {
    const danhMuc = danhMucModel.timTheoId(id);
    if (!danhMuc) {
        const loi = new Error('Danh mục không tồn tại');
        loi.status = 404;
        throw loi;
    }
    return danhMuc;
}

async function taoDanhMuc(duLieu) {
    if (!duLieu.tenDanhMuc || duLieu.tenDanhMuc.trim() === '') {
        const loi = new Error('Tên danh mục không được để trống');
        loi.status = 400;
        throw loi;
    }

    const ketQua = danhMucModel.taoDanhMuc({
        tenDanhMuc: duLieu.tenDanhMuc.trim(),
        moTa: duLieu.moTa ? duLieu.moTa.trim() : '',
        thuTuHienThi: duLieu.thuTuHienThi ? Number(duLieu.thuTuHienThi) : 0
    });

    return danhMucModel.timTheoId(ketQua.lastInsertRowid);
}

async function capNhatDanhMuc(id, duLieu) {
    const danhMuc = await layTheoId(id);

    danhMucModel.capNhatDanhMuc(id, {
        tenDanhMuc: duLieu.tenDanhMuc ? duLieu.tenDanhMuc.trim() : danhMuc.ten_danh_muc,
        moTa: duLieu.moTa !== undefined ? duLieu.moTa.trim() : danhMuc.mo_ta,
        thuTuHienThi: duLieu.thuTuHienThi !== undefined ? Number(duLieu.thuTuHienThi) : danhMuc.thu_tu_hien_thi,
        trangThai: duLieu.trangThai || danhMuc.trang_thai
    });

    return danhMucModel.timTheoId(id);
}

async function xoaDanhMuc(id) {
    await layTheoId(id);
    const cacMonTrongDanhMuc = thucDonModel.layTheoDanhMucId(id);
    if (cacMonTrongDanhMuc && cacMonTrongDanhMuc.length > 0) {
        const loi = new Error('Không thể xóa danh mục đang có món ăn. Vui lòng chuyển hoặc xóa các món ăn trước.');
        loi.status = 400;
        throw loi;
    }

    danhMucModel.xoaDanhMuc(id);
    return true;
}

module.exports = {
    layDanhSach,
    layTheoId,
    taoDanhMuc,
    capNhatDanhMuc,
    xoaDanhMuc
};
