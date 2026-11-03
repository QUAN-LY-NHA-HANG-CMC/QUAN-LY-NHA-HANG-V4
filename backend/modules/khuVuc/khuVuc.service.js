const khuVucModel = require('./khuVuc.model.js');
const banAnModel = require('../banAn/banAn.model.js');

async function layDanhSach() {
    return khuVucModel.layDanhSach();
}

async function taoKhuVuc(duLieu) {
    if (!duLieu.tenKhuVuc || duLieu.tenKhuVuc.trim() === '') {
        const loi = new Error('Tên khu vực không được để trống');
        loi.status = 400;
        throw loi;
    }

    const ketQua = khuVucModel.taoKhuVuc({
        tenKhuVuc: duLieu.tenKhuVuc.trim(),
        tang: duLieu.tang ? Number(duLieu.tang) : 1,
        moTa: duLieu.moTa ? duLieu.moTa.trim() : '',
        thuTuHienThi: duLieu.thuTuHienThi ? Number(duLieu.thuTuHienThi) : 0
    });

    return khuVucModel.timTheoId(ketQua.lastInsertRowid);
}

async function capNhatKhuVuc(id, duLieu) {
    const khuVuc = khuVucModel.timTheoId(id);
    if (!khuVuc) {
        const loi = new Error('Khu vực không tồn tại');
        loi.status = 404;
        throw loi;
    }

    khuVucModel.capNhatKhuVuc(id, {
        tenKhuVuc: duLieu.tenKhuVuc ? duLieu.tenKhuVuc.trim() : khuVuc.ten_khu_vuc,
        tang: duLieu.tang !== undefined ? Number(duLieu.tang) : khuVuc.tang,
        moTa: duLieu.moTa !== undefined ? duLieu.moTa.trim() : khuVuc.mo_ta,
        thuTuHienThi: duLieu.thuTuHienThi !== undefined ? Number(duLieu.thuTuHienThi) : khuVuc.thu_tu_hien_thi,
        trangThai: duLieu.trangThai || khuVuc.trang_thai
    });

    return khuVucModel.timTheoId(id);
}

async function xoaKhuVuc(id) {
    const khuVuc = khuVucModel.timTheoId(id);
    if (!khuVuc) {
        const loi = new Error('Khu vực không tồn tại');
        loi.status = 404;
        throw loi;
    }

    const danhSachBan = banAnModel.layTheoKhuVucId(id);
    if (danhSachBan && danhSachBan.length > 0) {
        const loi = new Error('Không thể xóa khu vực đang chứa bàn ăn. Vui lòng di chuyển hoặc xóa các bàn ăn trước.');
        loi.status = 400;
        throw loi;
    }

    khuVucModel.xoaKhuVuc(id);
    return true;
}

module.exports = {
    layDanhSach,
    taoKhuVuc,
    capNhatKhuVuc,
    xoaKhuVuc
};
