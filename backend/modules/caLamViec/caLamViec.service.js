/**
 * Service xử lý nghiệp vụ Ca làm việc & Phiên thu ngân
 * Phụ trách: Minh (Backend Developer)
 */
const caLamViecModel = require('./caLamViec.model.js');

async function layDanhSachCa() {
    return caLamViecModel.layDanhSachCa();
}

async function layPhienCaHienTai(nhanVienId) {
    return caLamViecModel.layPhienCaHienTai(nhanVienId);
}

async function moCa({ nhanVienId, caLamViecId, tienDauCa, ghiChu }) {
    // Kiểm tra nhân viên có ca nào đang mở chưa
    const caDangMo = caLamViecModel.layPhienCaHienTai(nhanVienId);
    if (caDangMo) {
        const loi = new Error('Bạn đang có một ca làm việc chưa kết ca. Vui lòng kết ca trước khi mở ca mới.');
        loi.status = 400;
        throw loi;
    }

    const tienDau = Number(tienDauCa);
    if (isNaN(tienDau) || tienDau < 0) {
        const loi = new Error('Số tiền đầu ca không hợp lệ');
        loi.status = 400;
        throw loi;
    }

    return caLamViecModel.moCa({
        nhanVienId,
        caLamViecId,
        tienDauCa: tienDau,
        ghiChu
    });
}

async function taoPhieuThuChi({ phienCaId, loaiPhieu, soTien, lyDo, nguoiThucHienId }) {
    const phien = caLamViecModel.layPhienCaTheoId(phienCaId);
    if (!phien) {
        const loi = new Error('Phiên ca làm việc không tồn tại');
        loi.status = 404;
        throw loi;
    }
    if (phien.trang_thai === 'da_dong') {
        const loi = new Error('Phiên ca này đã kết thúc, không thể lập phiếu thu chi');
        loi.status = 400;
        throw loi;
    }

    const tien = Number(soTien);
    if (isNaN(tien) || tien <= 0) {
        const loi = new Error('Số tiền phiếu thu/chi phải lớn hơn 0');
        loi.status = 400;
        throw loi;
    }

    if (!['thu', 'chi'].includes(loaiPhieu)) {
        const loi = new Error('Loại phiếu phải là thu hoặc chi');
        loi.status = 400;
        throw loi;
    }

    return caLamViecModel.taoPhieuThuChi({
        phienCaId,
        loaiPhieu,
        soTien: tien,
        lyDo: lyDo || 'Thu chi tiền mặt',
        nguoiThucHienId
    });
}

async function layDanhSachPhieuThuChi(phienCaId) {
    return caLamViecModel.layDanhSachPhieuThuChi(phienCaId);
}

async function ketCa({ phienCaId, tienMatThucTe, ghiChu }) {
    const phien = caLamViecModel.layPhienCaTheoId(phienCaId);
    if (!phien) {
        const loi = new Error('Phiên ca làm việc không tồn tại');
        loi.status = 404;
        throw loi;
    }
    if (phien.trang_thai === 'da_dong') {
        const loi = new Error('Phiên ca này đã được đóng trước đó');
        loi.status = 400;
        throw loi;
    }

    const tienThucTe = Number(tienMatThucTe);
    if (isNaN(tienThucTe) || tienThucTe < 0) {
        const loi = new Error('Số tiền mặt thực tế kiểm đếm phải lớn hơn hoặc bằng 0');
        loi.status = 400;
        throw loi;
    }

    return caLamViecModel.ketCa({
        phienCaId,
        tienMatThucTe: tienThucTe,
        ghiChu
    });
}

async function layLichSuPhienCa(gioiHan) {
    return caLamViecModel.layLichSuPhienCa(gioiHan);
}

module.exports = {
    layDanhSachCa,
    layPhienCaHienTai,
    moCa,
    taoPhieuThuChi,
    layDanhSachPhieuThuChi,
    ketCa,
    layLichSuPhienCa
};
