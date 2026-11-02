const cauHinhService = require('./cauHinhNhaHang.service.js');
const dinhDangPhanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function layCauHinh(req, res, next) {
    try {
        const cauHinh = await cauHinhService.layToanBoCauHinh();
        return dinhDangPhanHoi.thanhCong(res, cauHinh, 'Lấy cấu hình nhà hàng thành công');
    } catch (loi) {
        next(loi);
    }
}

async function capNhatCauHinh(req, res, next) {
    try {
        const cauHinhMoi = await cauHinhService.capNhatCauHinh(req.body);
        if (req.nguoiDung) {
            await cauHinhService.ghiNhatKy(
                req.nguoiDung.taiKhoanId,
                'CAP_NHAT_CAU_HINH',
                'Thay đổi thông tin nhà hàng hoặc tỷ lệ thuế VAT/phí',
                req.ip
            );
        }
        return dinhDangPhanHoi.thanhCong(res, cauHinhMoi, 'Cập nhật cấu hình nhà hàng thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layNhatKy(req, res, next) {
    try {
        const { gioiHan } = req.query;
        const nhatKy = await cauHinhService.layNhatKyHeThong(gioiHan ? Number(gioiHan) : 100);
        return dinhDangPhanHoi.thanhCong(res, nhatKy, 'Lấy nhật ký hệ thống thành công');
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    layCauHinh,
    capNhatCauHinh,
    layNhatKy
};
