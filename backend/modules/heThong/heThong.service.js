// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// SERVICE CẤU HÌNH HỆ THỐNG, THỐNG KÊ & AUDIT LOG (FIGMA A01, A20, S01)
// ============================================================================

const heThongModel = require('./heThong.model');
const { ghiAuditLog } = require('../../tienIch/ghiNhatKy');

const heThongService = {
    async layCauHinh() {
        return heThongModel.layCauHinhNhaHang();
    },

    async capNhatCauHinh(duLieu, taiKhoanHienTai = null) {
        heThongModel.capNhatCauHinhNhaHang(duLieu);

        if (taiKhoanHienTai) {
            ghiAuditLog({
                taiKhoanId: taiKhoanHienTai.id,
                hanhDong: 'CAP_NHAT_CAU_HINH_NHA_HANG',
                doiTuong: 'cau_hinh_nha_hang',
                doiTuongId: 1,
                duLieuMoi: duLieu
            });
        }

        return heThongModel.layCauHinhNhaHang();
    },

    async layNhatKy(boLoc = {}) {
        return heThongModel.layNhatKyKiemToan(boLoc);
    },

    async layThongKeDashboard() {
        return heThongModel.layThongKeDashboard();
    }
};

module.exports = heThongService;
