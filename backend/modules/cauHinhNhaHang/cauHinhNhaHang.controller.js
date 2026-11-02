/**
 * Controller tiếp nhận yêu cầu HTTP phân hệ Cấu hình nhà hàng & Nhật ký hệ thống
 * Phục vụ US-041 -> US-044
 */
const cauHinhService = require('./cauHinhNhaHang.service');
const { phanHoiThanhCong } = require('../../tienIch/dinhDangPhanHoi');

/**
 * [GET] /api/cau-hinh-nha-hang/cong-khai - Xem thông tin nhà hàng công khai (không cần login)
 */
async function layThongTinCongKhai(req, res, next) {
    try {
        const ketQua = await cauHinhService.layThongTinCongKhai();
        return phanHoiThanhCong(res, ketQua, 'Lấy thông tin nhà hàng thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [GET] /api/cau-hinh-nha-hang/thong-tin - Lấy toàn bộ thông tin nhà hàng (US-041)
 */
async function layThongTinNhaHang(req, res, next) {
    try {
        const ketQua = await cauHinhService.layThongTinNhaHang();
        return phanHoiThanhCong(res, ketQua, 'Lấy thông tin cấu hình nhà hàng thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [PUT] /api/cau-hinh-nha-hang/thong-tin - Cập nhật thông tin nhà hàng (US-041)
 */
async function capNhatThongTinNhaHang(req, res, next) {
    try {
        const nguoiCapNhatId = req.taiKhoan.id;
        const diaChiIp = req.ip || req.connection.remoteAddress;
        const thongTinThietBi = req.headers['user-agent'] || 'Không rõ';

        const ketQua = await cauHinhService.capNhatThongTinNhaHang(
            req.body,
            nguoiCapNhatId,
            diaChiIp,
            thongTinThietBi
        );

        return phanHoiThanhCong(res, ketQua, 'Cập nhật thông tin nhà hàng thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [GET] /api/cau-hinh-nha-hang/thue-phi - Lấy cấu hình thuế VAT và phí phục vụ (US-042)
 */
async function layThuePhi(req, res, next) {
    try {
        const ketQua = await cauHinhService.layThuePhi();
        return phanHoiThanhCong(res, ketQua, 'Lấy cấu hình thuế và phí dịch vụ thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [PUT] /api/cau-hinh-nha-hang/thue-phi - Cập nhật thuế VAT và phí phục vụ (US-042)
 */
async function capNhatThuePhi(req, res, next) {
    try {
        const nguoiCapNhatId = req.taiKhoan.id;
        const diaChiIp = req.ip || req.connection.remoteAddress;
        const thongTinThietBi = req.headers['user-agent'] || 'Không rõ';

        const ketQua = await cauHinhService.capNhatThuePhi(
            req.body,
            nguoiCapNhatId,
            diaChiIp,
            thongTinThietBi
        );

        return phanHoiThanhCong(res, ketQua, 'Cập nhật cấu hình thuế VAT và phí thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [GET] /api/cau-hinh-nha-hang/viet-qr - Lấy cấu hình tài khoản VietQR (US-043)
 */
async function layCauHinhVietQr(req, res, next) {
    try {
        const ketQua = await cauHinhService.layCauHinhVietQr();
        return phanHoiThanhCong(res, ketQua, 'Lấy cấu hình tài khoản VietQR thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [PUT] /api/cau-hinh-nha-hang/viet-qr - Cập nhật cấu hình tài khoản VietQR (US-043)
 */
async function capNhatCauHinhVietQr(req, res, next) {
    try {
        const nguoiCapNhatId = req.taiKhoan.id;
        const diaChiIp = req.ip || req.connection.remoteAddress;
        const thongTinThietBi = req.headers['user-agent'] || 'Không rõ';

        const ketQua = await cauHinhService.capNhatCauHinhVietQr(
            req.body,
            nguoiCapNhatId,
            diaChiIp,
            thongTinThietBi
        );

        return phanHoiThanhCong(res, ketQua, 'Cập nhật cấu hình tài khoản VietQR thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [POST] /api/cau-hinh-nha-hang/viet-qr/tao-ma - Tạo mã QR thanh toán động VietQR (US-043)
 */
async function taoMaVietQrThanhToan(req, res, next) {
    try {
        const { soTien, maHoaDon } = req.body;
        const ketQua = await cauHinhService.taoMaVietQrThanhToan({ soTien, maHoaDon });
        return phanHoiThanhCong(res, ketQua, 'Tạo mã VietQR thanh toán thành công.');
    } catch (loi) {
        next(loi);
    }
}

/**
 * [GET] /api/cau-hinh-nha-hang/nhat-ky-he-thong - Xem nhật ký hoạt động hệ thống (US-044)
 */
async function layDanhSachNhatKy(req, res, next) {
    try {
        const trang = Math.max(1, parseInt(req.query.trang) || 1);
        const soLuong = Math.min(100, Math.max(1, parseInt(req.query.soLuong) || 20));
        const { loaiHanhDong, module: tenModule, tuNgay, denNgay, taiKhoanId } = req.query;

        const ketQua = await cauHinhService.layDanhSachNhatKy({
            trang,
            soLuong,
            loaiHanhDong,
            module: tenModule,
            tuNgay,
            denNgay,
            taiKhoanId: taiKhoanId ? Number(taiKhoanId) : null
        });

        return phanHoiThanhCong(res, ketQua, 'Lấy danh sách nhật ký hệ thống thành công.');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    layThongTinCongKhai,
    layThongTinNhaHang,
    capNhatThongTinNhaHang,
    layThuePhi,
    capNhatThuePhi,
    layCauHinhVietQr,
    capNhatCauHinhVietQr,
    taoMaVietQrThanhToan,
    layDanhSachNhatKy
};
