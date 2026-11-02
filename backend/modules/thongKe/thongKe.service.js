/**
 * Service xử lý logic nghiệp vụ thống kê báo cáo
 * Phụ trách: Nhật (PM / Backend Core Architect)
 */
const thongKeModel = require('./thongKe.model.js');

async function layTongQuan(ngay) {
    return thongKeModel.layTongQuanNgay(ngay);
}

async function layDoanhThu(ky) {
    return thongKeModel.layDoanhThuTheoChuKy(ky);
}

async function layPhuongThuc() {
    return thongKeModel.layTyTrongPhuongThuc();
}

async function layDanhMuc() {
    return thongKeModel.layDoanhThuTheoDanhMuc();
}

async function layTopMon(gioiHan) {
    return thongKeModel.layTopMon(gioiHan);
}

async function layKhungGio() {
    return thongKeModel.layKhungGioCaoDiem();
}

async function layHuyMon() {
    return thongKeModel.layThongKeHuyMon();
}

module.exports = {
    layTongQuan,
    layDoanhThu,
    layPhuongThuc,
    layDanhMuc,
    layTopMon,
    layKhungGio,
    layHuyMon
};
