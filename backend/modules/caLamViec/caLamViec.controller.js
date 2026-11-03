/**
 * Controller Ca làm việc & Phiên thu ngân
 * Phụ trách: Minh (Backend Developer)
 */
const caLamViecService = require('./caLamViec.service.js');
const dinhDangPhanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function layDanhSachCa(req, res, next) {
    try {
        const ketQua = await caLamViecService.layDanhSachCa();
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy danh sách ca làm việc thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layPhienHienTai(req, res, next) {
    try {
        const nhanVienId = req.nguoiDung.taiKhoanId || req.nguoiDung.id;
        const ketQua = await caLamViecService.layPhienCaHienTai(nhanVienId);
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy phiên ca hiện tại thành công');
    } catch (loi) {
        next(loi);
    }
}

async function moCa(req, res, next) {
    try {
        const nhanVienId = req.nguoiDung.taiKhoanId || req.nguoiDung.id;
        const { caLamViecId, tienDauCa, ghiChu } = req.body;
        const ketQua = await caLamViecService.moCa({ nhanVienId, caLamViecId, tienDauCa, ghiChu });
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Mở ca làm việc thành công', 201);
    } catch (loi) {
        next(loi);
    }
}

async function taoPhieuThuChi(req, res, next) {
    try {
        const nguoiThucHienId = req.nguoiDung.taiKhoanId || req.nguoiDung.id;
        const { phienCaId, loaiPhieu, soTien, lyDo } = req.body;
        const ketQua = await caLamViecService.taoPhieuThuChi({
            phienCaId,
            loaiPhieu,
            soTien,
            lyDo,
            nguoiThucHienId
        });
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lập phiếu thu/chi thành công', 201);
    } catch (loi) {
        next(loi);
    }
}

async function layDanhSachPhieu(req, res, next) {
    try {
        const ketQua = await caLamViecService.layDanhSachPhieuThuChi(req.params.phienCaId);
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy danh sách phiếu thu/chi thành công');
    } catch (loi) {
        next(loi);
    }
}

async function ketCa(req, res, next) {
    try {
        const { phienCaId, tienMatThucTe, ghiChu } = req.body;
        const ketQua = await caLamViecService.ketCa({ phienCaId, tienMatThucTe, ghiChu });
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Kết ca và đối soát quỹ thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layLichSu(req, res, next) {
    try {
        const gioiHan = Number(req.query.gioiHan) || 30;
        const ketQua = await caLamViecService.layLichSuPhienCa(gioiHan);
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy lịch sử phiên ca thành công');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    layDanhSachCa,
    layPhienHienTai,
    moCa,
    taoPhieuThuChi,
    layDanhSachPhieu,
    ketCa,
    layLichSu
};
