/**
 * Service xử lý nghiệp vụ Tài khoản và Xác thực
 * Phục vụ US-001, US-002, US-003, US-007 -> US-010
 */
const jwt = require('jsonwebtoken');
const taiKhoanModel = require('./taiKhoan.model');
const { kiemTraMatKhau, bamMatKhau } = require('../../tienIch/maHoaMatKhau');
const cauHinhBaoMat = require('../../cauHinh/cauHinhBaoMat');
const { ghiNhatKyHeThong } = require('../../tienIch/ghiNhatKy');

/**
 * Sinh cặp Access Token và Refresh Token cho tài khoản
 * @param {Object} taiKhoan
 * @param {Array<string>} danhSachVaiTro
 * @param {Array<string>} danhSachQuyen
 */
const crypto = require('crypto');
function taoCapToken(taiKhoan, danhSachVaiTro, danhSachQuyen) {
    const payloadAccess = {
        taiKhoanId: taiKhoan.id,
        tenDangNhap: taiKhoan.ten_dang_nhap,
        vaiTro: danhSachVaiTro,
        danhSachQuyen: danhSachQuyen
    };

    const accessToken = jwt.sign(
        payloadAccess,
        cauHinhBaoMat.jwt.biMatAccessToken,
        { expiresIn: cauHinhBaoMat.jwt.thoiGianHetHanAccess }
    );

    const payloadRefresh = {
        taiKhoanId: taiKhoan.id,
        loai: 'REFRESH',
        jti: crypto.randomUUID()
    };

    const refreshToken = jwt.sign(
        payloadRefresh,
        cauHinhBaoMat.jwt.biMatRefreshToken,
        { expiresIn: cauHinhBaoMat.jwt.thoiGianHetHanRefresh }
    );

    return {
        accessToken,
        refreshToken,
        hetHanTrong: cauHinhBaoMat.jwt.thoiGianHetHanAccess
    };
}

/**
 * Đăng nhập hệ thống (US-007)
 */
async function dangNhap({ tenDangNhap, matKhau, thongTinThietBi, diaChiIp }) {
    const taiKhoan = await taiKhoanModel.timTheoTenDangNhap(tenDangNhap.trim());

    if (!taiKhoan) {
        await ghiNhatKyHeThong({
            loaiHanhDong: 'DANG_NHAP_THAT_BAI',
            module: 'TAI_KHOAN',
            moTa: `Thử đăng nhập thất bại với tên đăng nhập không tồn tại: ${tenDangNhap}`,
            diaChiIp,
            thongTinThietBi
        });

        const loi = new Error('Tên đăng nhập hoặc mật khẩu không chính xác.');
        loi.status = 401;
        throw loi;
    }

    if (taiKhoan.trang_thai !== 1 && taiKhoan.trang_thai !== '1' && taiKhoan.trang_thai !== 'hoat_dong') {
        await ghiNhatKyHeThong({
            taiKhoanId: taiKhoan.id,
            loaiHanhDong: 'DANG_NHAP_BI_KHOA',
            module: 'TAI_KHOAN',
            moTa: `Tài khoản đã bị khóa cố gắng đăng nhập: ${tenDangNhap}`,
            diaChiIp,
            thongTinThietBi
        });

        const loi = new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản lý nhà hàng.');
        loi.status = 403;
        throw loi;
    }

    const hopLe = await kiemTraMatKhau(matKhau, taiKhoan.mat_khau);
    if (!hopLe) {
        await ghiNhatKyHeThong({
            taiKhoanId: taiKhoan.id,
            loaiHanhDong: 'DANG_NHAP_SAI_MAT_KHAU',
            module: 'TAI_KHOAN',
            moTa: `Nhập sai mật khẩu cho tài khoản: ${tenDangNhap}`,
            diaChiIp,
            thongTinThietBi
        });

        const loi = new Error('Tên đăng nhập hoặc mật khẩu không chính xác.');
        loi.status = 401;
        throw loi;
    }

    // Lấy thông tin vai trò và quyền hạn
    const vaiTroRows = await taiKhoanModel.layDanhSachVaiTro(taiKhoan.id);
    const quyenRows = await taiKhoanModel.layDanhSachQuyen(taiKhoan.id);

    const mangVaiTro = vaiTroRows.map(v => v.ma_vai_tro);
    const mangQuyen = quyenRows.map(q => q.ma_quyen);

    // Sinh cặp token
    const tokenData = taoCapToken(taiKhoan, mangVaiTro, mangQuyen);

    // Lưu refresh token vào CSDL
    const ngayHetHan = new Date(Date.now() + cauHinhBaoMat.jwt.thoiGianHetHanRefreshNgay * 24 * 60 * 60 * 1000)
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19);

    await taiKhoanModel.luuRefreshToken(
        taiKhoan.id,
        tokenData.refreshToken,
        thongTinThietBi,
        diaChiIp,
        ngayHetHan
    );

    // Cập nhật đăng nhập cuối
    await taiKhoanModel.capNhatDangNhapCuoi(taiKhoan.id);

    // Ghi nhật ký
    await ghiNhatKyHeThong({
        taiKhoanId: taiKhoan.id,
        loaiHanhDong: 'DANG_NHAP_THANH_CONG',
        module: 'TAI_KHOAN',
        moTa: `Đăng nhập thành công với vai trò: ${mangVaiTro.join(', ') || 'Chưa gán vai trò'}`,
        diaChiIp,
        thongTinThietBi
    });

    return {
        taiKhoan: {
            id: taiKhoan.id,
            tenDangNhap: taiKhoan.ten_dang_nhap,
            hoTen: taiKhoan.ho_ten,
            soDienThoai: taiKhoan.so_dien_thoai,
            email: taiKhoan.email,
            anhDaiDien: taiKhoan.anh_dai_dien,
            vaiTro: mangVaiTro,
            danhSachQuyen: mangQuyen
        },
        tokens: tokenData
    };
}

/**
 * Đăng xuất khỏi hệ thống (US-008)
 */
async function dangXuat({ refreshToken, taiKhoanId, diaChiIp, thongTinThietBi }) {
    if (refreshToken) {
        await taiKhoanModel.thuHoiRefreshToken(refreshToken);
    } else if (taiKhoanId) {
        await taiKhoanModel.thuHoiTatCaRefreshToken(taiKhoanId);
    }

    if (taiKhoanId) {
        await ghiNhatKyHeThong({
            taiKhoanId,
            loaiHanhDong: 'DANG_XUAT',
            module: 'TAI_KHOAN',
            moTa: 'Người dùng đăng xuất khỏi thiết bị',
            diaChiIp,
            thongTinThietBi
        });
    }

    return true;
}

/**
 * Cơ chế Refresh Token (US-003)
 */
async function lamMoiToken({ refreshToken, diaChiIp, thongTinThietBi }) {
    let payload;
    try {
        payload = jwt.verify(refreshToken, cauHinhBaoMat.jwt.biMatRefreshToken);
    } catch {
        const loi = new Error('Refresh token không hợp lệ hoặc đã hết hạn.');
        loi.status = 401;
        throw loi;
    }

    // Kiểm tra trong CSDL
    const phien = await taiKhoanModel.timPhienRefreshToken(refreshToken);
    if (!phien || phien.da_thu_hoi === 1) {
        const loi = new Error('Refresh token đã bị thu hồi hoặc không tồn tại.');
        loi.status = 401;
        throw loi;
    }

    const taiKhoan = await taiKhoanModel.timTheoId(payload.taiKhoanId);
    if (!taiKhoan || (Number(taiKhoan.trang_thai) !== 1 && taiKhoan.trang_thai !== 'hoat_dong')) {
        const loi = new Error('Tài khoản không tồn tại hoặc đã bị khóa.');
        loi.status = 403;
        throw loi;
    }

    const vaiTroRows = await taiKhoanModel.layDanhSachVaiTro(taiKhoan.id);
    const quyenRows = await taiKhoanModel.layDanhSachQuyen(taiKhoan.id);
    const mangVaiTro = vaiTroRows.map(v => v.ma_vai_tro);
    const mangQuyen = quyenRows.map(q => q.ma_quyen);

    // Sinh access token mới
    const tokenMoi = taoCapToken(taiKhoan, mangVaiTro, mangQuyen);

    return {
        accessToken: tokenMoi.accessToken,
        hetHanTrong: tokenMoi.hetHanTrong
    };
}

/**
 * Đổi mật khẩu cá nhân (US-009)
 */
async function doiMatKhau({ taiKhoanId, matKhauCu, matKhauMoi, diaChiIp, thongTinThietBi }) {
    const matKhauDaBam = await taiKhoanModel.layMatKhauDaBam(taiKhoanId);
    if (!matKhauDaBam) {
        const loi = new Error('Không tìm thấy thông tin tài khoản.');
        loi.status = 404;
        throw loi;
    }

    const dungMatKhauCu = await kiemTraMatKhau(matKhauCu, matKhauDaBam);
    if (!dungMatKhauCu) {
        await ghiNhatKyHeThong({
            taiKhoanId,
            loaiHanhDong: 'DOI_MAT_KHAU_SAI',
            module: 'TAI_KHOAN',
            moTa: 'Đổi mật khẩu thất bại do nhập sai mật khẩu hiện tại',
            diaChiIp,
            thongTinThietBi
        });

        const loi = new Error('Mật khẩu hiện tại không chính xác.');
        loi.status = 400;
        throw loi;
    }

    // Băm mật khẩu mới
    const matKhauMoiHash = await bamMatKhau(matKhauMoi);

    // Cập nhật CSDL
    await taiKhoanModel.capNhatMatKhau(taiKhoanId, matKhauMoiHash);

    // Thu hồi các refresh token cũ để buộc đăng nhập lại an toàn
    await taiKhoanModel.thuHoiTatCaRefreshToken(taiKhoanId);

    // Ghi nhật ký
    await ghiNhatKyHeThong({
        taiKhoanId,
        loaiHanhDong: 'DOI_MAT_KHAU_THANH_CONG',
        module: 'TAI_KHOAN',
        moTa: 'Người dùng đổi mật khẩu cá nhân thành công',
        diaChiIp,
        thongTinThietBi
    });

    return true;
}

/**
 * Lấy thông tin hồ sơ cá nhân (US-010)
 */
async function layHoSo(taiKhoanId) {
    const taiKhoan = await taiKhoanModel.timTheoId(taiKhoanId);
    if (!taiKhoan) {
        const loi = new Error('Không tìm thấy tài khoản.');
        loi.status = 404;
        throw loi;
    }

    const vaiTroRows = await taiKhoanModel.layDanhSachVaiTro(taiKhoanId);
    const quyenRows = await taiKhoanModel.layDanhSachQuyen(taiKhoanId);

    return {
        id: taiKhoan.id,
        tenDangNhap: taiKhoan.ten_dang_nhap,
        hoTen: taiKhoan.ho_ten,
        soDienThoai: taiKhoan.so_dien_thoai,
        email: taiKhoan.email,
        anhDaiDien: taiKhoan.anh_dai_dien,
        trangThai: taiKhoan.trang_thai,
        dangNhapCuoi: taiKhoan.dang_nhap_cuoi,
        ngayTao: taiKhoan.ngay_tao,
        vaiTro: vaiTroRows,
        danhSachQuyen: quyenRows.map(q => q.ma_quyen)
    };
}

/**
 * Cập nhật thông tin hồ sơ cá nhân (US-010)
 */
async function capNhatHoSo(taiKhoanId, duLieu, diaChiIp, thongTinThietBi) {
    const taiKhoanHienTai = await taiKhoanModel.timTheoId(taiKhoanId);
    if (!taiKhoanHienTai) {
        const loi = new Error('Không tìm thấy tài khoản.');
        loi.status = 404;
        throw loi;
    }

    await taiKhoanModel.capNhatHoSo(taiKhoanId, {
        hoTen: duLieu.hoTen ? duLieu.hoTen.trim() : taiKhoanHienTai.ho_ten,
        soDienThoai: duLieu.soDienThoai !== undefined ? duLieu.soDienThoai.trim() : taiKhoanHienTai.so_dien_thoai,
        email: duLieu.email !== undefined ? duLieu.email.trim() : taiKhoanHienTai.email,
        anhDaiDien: duLieu.anhDaiDien !== undefined ? duLieu.anhDaiDien : taiKhoanHienTai.anh_dai_dien
    });

    await ghiNhatKyHeThong({
        taiKhoanId,
        loaiHanhDong: 'CAP_NHAT_HO_SO',
        module: 'TAI_KHOAN',
        moTa: 'Cập nhật thông tin hồ sơ cá nhân',
        diaChiIp,
        thongTinThietBi,
        duLieuYeuCau: duLieu
    });

    return await layHoSo(taiKhoanId);
}

module.exports = {
    dangNhap,
    dangXuat,
    lamMoiToken,
    doiMatKhau,
    layHoSo,
    capNhatHoSo
};
