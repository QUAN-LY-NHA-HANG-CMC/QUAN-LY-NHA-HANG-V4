/**
 * Controller tiếp nhận HTTP requests cho module Thống kê
 * Phụ trách: Nhật (PM / Backend Core Architect)
 */
const thongKeService = require('./thongKe.service.js');
const dinhDangPhanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function layTongQuan(req, res, next) {
    try {
        const { ngay } = req.query;
        const ketQua = await thongKeService.layTongQuan(ngay);
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy dữ liệu tổng quan thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layDoanhThu(req, res, next) {
    try {
        const { ky, tuNgay, denNgay } = req.query;
        const ketQua = await thongKeService.layDoanhThu(ky, tuNgay, denNgay);
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy biểu đồ doanh thu thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layPhuongThuc(req, res, next) {
    try {
        const ketQua = await thongKeService.layPhuongThuc();
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy tỷ trọng phương thức thanh toán thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layDanhMuc(req, res, next) {
    try {
        const ketQua = await thongKeService.layDanhMuc();
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy doanh thu theo danh mục thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layTopMon(req, res, next) {
    try {
        const { gioiHan } = req.query;
        const ketQua = await thongKeService.layTopMon(gioiHan ? Number(gioiHan) : 5);
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy top món bán chạy/chậm thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layKhungGio(req, res, next) {
    try {
        const ketQua = await thongKeService.layKhungGio();
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy thống kê khung giờ cao điểm thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layHuyMon(req, res, next) {
    try {
        const ketQua = await thongKeService.layHuyMon();
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy thống kê hủy món thành công');
    } catch (loi) {
        next(loi);
    }
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
