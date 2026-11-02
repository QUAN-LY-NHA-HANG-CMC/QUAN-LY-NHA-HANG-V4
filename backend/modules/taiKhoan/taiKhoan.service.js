const jwt = require('jsonwebtoken');
const taiKhoanModel = require('./taiKhoan.model.js');
const maHoaMatKhau = require('../../tienIch/maHoaMatKhau.js');
const cauHinhBaoMat = require('../../cauHinh/cauHinhBaoMat.js');

async function dangNhap(tenDangNhap, matKhau) {
    if (!tenDangNhap || !matKhau) {
        const loi = new Error('Tên đăng nhập và mật khẩu không được để trống');
        loi.status = 400;
        throw loi;
    }

    const nguoiDung = taiKhoanModel.timTheoTenDangNhap(tenDangNhap);
    if (!nguoiDung) {
        const loi = new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
        loi.status = 401;
        throw loi;
    }

    if (nguoiDung.trang_thai !== 'hoat_dong') {
        const loi = new Error('Tài khoản đã bị khóa hoặc ngừng hoạt động');
        loi.status = 403;
        throw loi;
    }

    const khopMatKhau = await maHoaMatKhau.soSanhMatKhau(matKhau, nguoiDung.mat_khau_bam);
    if (!khopMatKhau) {
        const loi = new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
        loi.status = 401;
        throw loi;
    }

    const danhSachQuyen = taiKhoanModel.layDanhSachQuyenTheoVaiTroId(nguoiDung.vai_tro_id);

    // Ký JWT Token
    const payload = {
        taiKhoanId: nguoiDung.id,
        tenDangNhap: nguoiDung.ten_dang_nhap,
        vaiTro: nguoiDung.ma_vai_tro,
        tenVaiTro: nguoiDung.ten_vai_tro,
        danhSachQuyen: danhSachQuyen
    };

    const token = jwt.sign(payload, cauHinhBaoMat.khoaBiMatJwt, {
        expiresIn: cauHinhBaoMat.thoiHanToken
    });

    return {
        token,
        nguoiDung: {
            id: nguoiDung.id,
            tenDangNhap: nguoiDung.ten_dang_nhap,
            hoTen: nguoiDung.ho_ten,
            soDienThoai: nguoiDung.so_dien_thoai,
            email: nguoiDung.email,
            vaiTro: nguoiDung.ma_vai_tro,
            tenVaiTro: nguoiDung.ten_vai_tro,
            danhSachQuyen: danhSachQuyen
        }
    };
}

async function layThongTinCaNhan(taiKhoanId) {
    const nguoiDung = taiKhoanModel.timTheoId(taiKhoanId);
    if (!nguoiDung) {
        const loi = new Error('Không tìm thấy tài khoản người dùng');
        loi.status = 404;
        throw loi;
    }

    const danhSachQuyen = taiKhoanModel.layDanhSachQuyenTheoVaiTroId(nguoiDung.vai_tro_id);
    return {
        id: nguoiDung.id,
        tenDangNhap: nguoiDung.ten_dang_nhap,
        hoTen: nguoiDung.ho_ten,
        soDienThoai: nguoiDung.so_dien_thoai,
        email: nguoiDung.email,
        vaiTro: nguoiDung.ma_vai_tro,
        tenVaiTro: nguoiDung.ten_vai_tro,
        danhSachQuyen: danhSachQuyen
    };
}

async function doiMatKhau(taiKhoanId, matKhauCu, matKhauMoi) {
    if (!matKhauCu || !matKhauMoi) {
        const loi = new Error('Vui lòng cung cấp mật khẩu cũ và mật khẩu mới');
        loi.status = 400;
        throw loi;
    }

    if (matKhauMoi.length < 6) {
        const loi = new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
        loi.status = 400;
        throw loi;
    }

    const nguoiDung = taiKhoanModel.timTheoTenDangNhap((taiKhoanModel.timTheoId(taiKhoanId) || {}).ten_dang_nhap);
    if (!nguoiDung) {
        const loi = new Error('Tài khoản không tồn tại');
        loi.status = 404;
        throw loi;
    }

    const khop = await maHoaMatKhau.soSanhMatKhau(matKhauCu, nguoiDung.mat_khau_bam);
    if (!khop) {
        const loi = new Error('Mật khẩu hiện tại không chính xác');
        loi.status = 400;
        throw loi;
    }

    const matKhauBamMoi = await maHoaMatKhau.bamMatKhau(matKhauMoi);
    taiKhoanModel.capNhatMatKhau(taiKhoanId, matKhauBamMoi);
    return true;
}

async function capNhatHoSo(taiKhoanId, duLieu) {
    if (!duLieu.hoTen || duLieu.hoTen.trim() === '') {
        const loi = new Error('Họ và tên không được để trống');
        loi.status = 400;
        throw loi;
    }

    taiKhoanModel.capNhatHoSo(taiKhoanId, {
        hoTen: duLieu.hoTen.trim(),
        soDienThoai: duLieu.soDienThoai ? duLieu.soDienThoai.trim() : null,
        email: duLieu.email ? duLieu.email.trim() : null
    });

    return await layThongTinCaNhan(taiKhoanId);
}

module.exports = {
    dangNhap,
    layThongTinCaNhan,
    doiMatKhau,
    capNhatHoSo
};
