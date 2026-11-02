const nhanVienModel = require('./nhanVien.model.js');
const taiKhoanModel = require('../taiKhoan/taiKhoan.model.js');
const maHoaMatKhau = require('../../tienIch/maHoaMatKhau.js');

async function layDanhSach(boLoc) {
    return nhanVienModel.layDanhSach(boLoc);
}

async function taoNhanVien(duLieu) {
    if (!duLieu.tenDangNhap || !duLieu.matKhau || !duLieu.hoTen || !duLieu.vaiTroId) {
        const loi = new Error('Thiếu các trường thông tin bắt buộc');
        loi.status = 400;
        throw loi;
    }

    const tonTai = taiKhoanModel.timTheoTenDangNhap(duLieu.tenDangNhap.trim());
    if (tonTai) {
        const loi = new Error('Tên đăng nhập đã tồn tại trong hệ thống');
        loi.status = 409;
        throw loi;
    }

    const matKhauBam = await maHoaMatKhau.bamMatKhau(duLieu.matKhau);
    const ketQua = nhanVienModel.taoNhanVien({
        tenDangNhap: duLieu.tenDangNhap.trim(),
        matKhauBam: matKhauBam,
        hoTen: duLieu.hoTen.trim(),
        soDienThoai: duLieu.soDienThoai ? duLieu.soDienThoai.trim() : null,
        email: duLieu.email ? duLieu.email.trim() : null,
        vaiTroId: Number(duLieu.vaiTroId)
    });

    return taiKhoanModel.timTheoId(ketQua.lastInsertRowid);
}

async function capNhatNhanVien(id, duLieu) {
    const nhanVien = taiKhoanModel.timTheoId(id);
    if (!nhanVien) {
        const loi = new Error('Không tìm thấy nhân viên');
        loi.status = 404;
        throw loi;
    }

    nhanVienModel.capNhatNhanVien(id, {
        hoTen: duLieu.hoTen || nhanVien.ho_ten,
        soDienThoai: duLieu.soDienThoai !== undefined ? duLieu.soDienThoai : nhanVien.so_dien_thoai,
        email: duLieu.email !== undefined ? duLieu.email : nhanVien.email,
        vaiTroId: duLieu.vaiTroId ? Number(duLieu.vaiTroId) : nhanVien.vai_tro_id
    });

    return taiKhoanModel.timTheoId(id);
}

async function doiTrangThai(id, trangThai) {
    if (!['hoat_dong', 'bi_khoa', 'nghi_viec'].includes(trangThai)) {
        const loi = new Error('Trạng thái nhân viên không hợp lệ');
        loi.status = 400;
        throw loi;
    }

    const nhanVien = taiKhoanModel.timTheoId(id);
    if (!nhanVien) {
        const loi = new Error('Không tìm thấy nhân viên');
        loi.status = 404;
        throw loi;
    }

    nhanVienModel.doiTrangThai(id, trangThai);
    return true;
}

async function datLaiMatKhau(id, matKhauMoi = '123456') {
    const nhanVien = taiKhoanModel.timTheoId(id);
    if (!nhanVien) {
        const loi = new Error('Không tìm thấy nhân viên');
        loi.status = 404;
        throw loi;
    }

    const matKhauBam = await maHoaMatKhau.bamMatKhau(matKhauMoi);
    taiKhoanModel.capNhatMatKhau(id, matKhauBam);
    return true;
}

module.exports = {
    layDanhSach,
    taoNhanVien,
    capNhatNhanVien,
    doiTrangThai,
    datLaiMatKhau
};
