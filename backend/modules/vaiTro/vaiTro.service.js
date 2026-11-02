/**
 * Service xử lý nghiệp vụ Vai trò, Quyền hạn và Lịch sử phân quyền
 * Phục vụ US-015 -> US-022
 */
const vaiTroModel = require('./vaiTro.model');
const taiKhoanModel = require('../taiKhoan/taiKhoan.model');
const { ghiNhatKyHeThong } = require('../../tienIch/ghiNhatKy');

/**
 * Lấy danh sách tất cả các vai trò kèm quyền hạn (US-015)
 */
async function layDanhSachVaiTro() {
    const danhSach = await vaiTroModel.layDanhSachVaiTro();
    for (const vaiTro of danhSach) {
        vaiTro.quyenHan = await vaiTroModel.layQuyenCuaVaiTro(vaiTro.id);
    }
    return danhSach;
}

/**
 * Lấy chi tiết một vai trò theo ID
 */
async function layChiTietVaiTro(vaiTroId) {
    const vaiTro = await vaiTroModel.layVaiTroTheoId(vaiTroId);
    if (!vaiTro) {
        const loi = new Error('Không tìm thấy vai trò yêu cầu.');
        loi.status = 404;
        throw loi;
    }
    vaiTro.quyenHan = await vaiTroModel.layQuyenCuaVaiTro(vaiTroId);
    return vaiTro;
}

/**
 * Tạo mới vai trò (US-016)
 */
async function taoVaiTro({ maVaiTro, tenVaiTro, moTa, nguoiThucHienId, diaChiIp, thongTinThietBi }) {
    const daTonTai = await vaiTroModel.layVaiTroTheoMa(maVaiTro);
    if (daTonTai) {
        const loi = new Error(`Mã vai trò '${maVaiTro}' đã tồn tại trên hệ thống.`);
        loi.status = 409;
        throw loi;
    }

    const moiId = await vaiTroModel.taoVaiTro({ maVaiTro, tenVaiTro, moTa });

    // Ghi nhận lịch sử phân quyền (US-022)
    await vaiTroModel.ghiLichSuPhanQuyen({
        nguoiThucHienId,
        vaiTroId: moiId,
        hanhDong: 'TAO_VAI_TRO',
        noiDungChiTiet: `Tạo mới vai trò: ${tenVaiTro} (${maVaiTro})`
    });

    // Ghi nhật ký hệ thống
    await ghiNhatKyHeThong({
        taiKhoanId: nguoiThucHienId,
        loaiHanhDong: 'TAO_VAI_TRO',
        module: 'VAI_TRO',
        moTa: `Tạo mới vai trò '${tenVaiTro}' (${maVaiTro})`,
        diaChiIp,
        thongTinThietBi
    });

    return await layChiTietVaiTro(moiId);
}

/**
 * Chỉnh sửa thông tin vai trò (US-016)
 */
async function capNhatVaiTro(vaiTroId, { tenVaiTro, moTa, trangThai, nguoiThucHienId, diaChiIp, thongTinThietBi }) {
    const vaiTroHienTai = await vaiTroModel.layVaiTroTheoId(vaiTroId);
    if (!vaiTroHienTai) {
        const loi = new Error('Không tìm thấy vai trò cần cập nhật.');
        loi.status = 404;
        throw loi;
    }

    const trangThaiMoi = trangThai !== undefined ? Number(trangThai) : vaiTroHienTai.trang_thai;
    const moTaMoi = moTa !== undefined ? moTa : vaiTroHienTai.mo_ta;

    await vaiTroModel.capNhatVaiTro(vaiTroId, {
        tenVaiTro,
        moTa: moTaMoi,
        trangThai: trangThaiMoi
    });

    // Ghi lịch sử phân quyền (US-022)
    await vaiTroModel.ghiLichSuPhanQuyen({
        nguoiThucHienId,
        vaiTroId,
        hanhDong: 'SUA_VAI_TRO',
        noiDungChiTiet: `Cập nhật thông tin vai trò ${vaiTroHienTai.ma_vai_tro}: Tên mới '${tenVaiTro}'`
    });

    // Ghi nhật ký hệ thống
    await ghiNhatKyHeThong({
        taiKhoanId: nguoiThucHienId,
        loaiHanhDong: 'SUA_VAI_TRO',
        module: 'VAI_TRO',
        moTa: `Chỉnh sửa thông tin vai trò '${vaiTroHienTai.ma_vai_tro}'`,
        diaChiIp,
        thongTinThietBi
    });

    return await layChiTietVaiTro(vaiTroId);
}

/**
 * Xóa vai trò (US-016)
 */
async function xoaVaiTro(vaiTroId, { nguoiThucHienId, diaChiIp, thongTinThietBi }) {
    const vaiTro = await vaiTroModel.layVaiTroTheoId(vaiTroId);
    if (!vaiTro) {
        const loi = new Error('Không tìm thấy vai trò cần xóa.');
        loi.status = 404;
        throw loi;
    }

    if (vaiTro.la_he_thong === 1) {
        const loi = new Error('Không thể xóa vai trò mặc định của hệ thống.');
        loi.status = 403;
        throw loi;
    }

    // Ghi lịch sử phân quyền (US-022) trước khi xóa
    await vaiTroModel.ghiLichSuPhanQuyen({
        nguoiThucHienId,
        vaiTroId,
        hanhDong: 'XOA_VAI_TRO',
        noiDungChiTiet: `Xóa vai trò: ${vaiTro.ten_vai_tro} (${vaiTro.ma_vai_tro})`
    });

    await vaiTroModel.xoaVaiTro(vaiTroId);

    // Ghi nhật ký
    await ghiNhatKyHeThong({
        taiKhoanId: nguoiThucHienId,
        loaiHanhDong: 'XOA_VAI_TRO',
        module: 'VAI_TRO',
        moTa: `Xóa vai trò '${vaiTro.ten_vai_tro}' (${vaiTro.ma_vai_tro})`,
        diaChiIp,
        thongTinThietBi
    });

    return true;
}

/**
 * Lấy toàn bộ danh mục quyền hệ thống
 */
async function layTatCaDanhMucQuyen() {
    return await vaiTroModel.layTatCaDanhMucQuyen();
}

/**
 * Cấu hình quyền truy cập chi tiết cho vai trò (US-018, US-019 -> US-021)
 */
async function capNhatQuyenCuaVaiTro(vaiTroId, danhSachQuyenId, { nguoiThucHienId, diaChiIp, thongTinThietBi }) {
    const vaiTro = await vaiTroModel.layVaiTroTheoId(vaiTroId);
    if (!vaiTro) {
        const loi = new Error('Không tìm thấy vai trò để cấu hình quyền.');
        loi.status = 404;
        throw loi;
    }

    await vaiTroModel.capNhatQuyenCuaVaiTro(vaiTroId, danhSachQuyenId);

    // Ghi nhận lịch sử thay đổi quyền hạn nhân sự (US-022)
    await vaiTroModel.ghiLichSuPhanQuyen({
        nguoiThucHienId,
        vaiTroId,
        hanhDong: 'CAP_NHAT_QUYEN_VAI_TRO',
        noiDungChiTiet: `Cập nhật lại quyền cho vai trò ${vaiTro.ten_vai_tro} (${vaiTro.ma_vai_tro}) với ${danhSachQuyenId.length} quyền`
    });

    // Ghi nhật ký hệ thống
    await ghiNhatKyHeThong({
        taiKhoanId: nguoiThucHienId,
        loaiHanhDong: 'PHAN_QUYEN_VAI_TRO',
        module: 'VAI_TRO',
        moTa: `Cập nhật ${danhSachQuyenId.length} quyền cho vai trò '${vaiTro.ma_vai_tro}'`,
        diaChiIp,
        thongTinThietBi,
        duLieuYeuCau: { vaiTroId, danhSachQuyenId }
    });

    return await layChiTietVaiTro(vaiTroId);
}

/**
 * Gán vai trò cho tài khoản nhân viên (US-017)
 */
async function ganVaiTroChoTaiKhoan({ taiKhoanId, danhSachVaiTroId, nguoiThucHienId, diaChiIp, thongTinThietBi }) {
    const taiKhoan = await taiKhoanModel.timTheoId(taiKhoanId);
    if (!taiKhoan) {
        const loi = new Error('Không tìm thấy tài khoản nhân viên.');
        loi.status = 404;
        throw loi;
    }

    // Không cho phép người dùng tự gán hoặc thay đổi vai trò của chính mình nếu không phải là Quản lý cấp cao
    if (taiKhoanId === nguoiThucHienId && !taiKhoan.trang_thai) {
        const loi = new Error('Không được tự thay đổi quyền hạn của chính mình.');
        loi.status = 403;
        throw loi;
    }

    await vaiTroModel.ganVaiTroChoTaiKhoan(taiKhoanId, danhSachVaiTroId);

    // Lấy lại danh sách vai trò vừa gán
    const danhSachVaiTroMoi = await vaiTroModel.layDanhSachVaiTro();
    const tenCacVaiTro = danhSachVaiTroMoi
        .filter(v => danhSachVaiTroId.includes(v.id))
        .map(v => v.ten_vai_tro)
        .join(', ');

    // Ghi nhận lịch sử thay đổi quyền hạn nhân sự (US-022)
    await vaiTroModel.ghiLichSuPhanQuyen({
        nguoiThucHienId,
        taiKhoanId,
        hanhDong: 'GAN_VAI_TRO',
        noiDungChiTiet: `Gán vai trò [${tenCacVaiTro}] cho nhân viên: ${taiKhoan.ho_ten} (${taiKhoan.ten_dang_nhap})`
    });

    // Ghi nhật ký hệ thống
    await ghiNhatKyHeThong({
        taiKhoanId: nguoiThucHienId,
        loaiHanhDong: 'GAN_VAI_TRO_NHAN_VIEN',
        module: 'VAI_TRO',
        moTa: `Gán vai trò [${tenCacVaiTro}] cho tài khoản '${taiKhoan.ten_dang_nhap}'`,
        diaChiIp,
        thongTinThietBi,
        duLieuYeuCau: { taiKhoanId, danhSachVaiTroId }
    });

    return {
        taiKhoanId,
        tenDangNhap: taiKhoan.ten_dang_nhap,
        hoTen: taiKhoan.ho_ten,
        danhSachVaiTroId
    };
}

/**
 * Lấy danh sách lịch sử thay đổi quyền hạn nhân sự (US-022)
 */
async function layLichSuPhanQuyen({ trang = 1, soLuong = 20 }) {
    return await vaiTroModel.layLichSuPhanQuyen({ trang, soLuong });
}

module.exports = {
    layDanhSachVaiTro,
    layChiTietVaiTro,
    taoVaiTro,
    capNhatVaiTro,
    xoaVaiTro,
    layTatCaDanhMucQuyen,
    capNhatQuyenCuaVaiTro,
    ganVaiTroChoTaiKhoan,
    layLichSuPhanQuyen
};
