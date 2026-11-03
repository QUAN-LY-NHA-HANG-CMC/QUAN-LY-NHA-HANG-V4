/**
 * Controller Đánh giá khách hàng
 * Phụ trách: Minh (Backend Developer)
 */
const danhGiaService = require('./danhGia.service.js');
const dinhDangPhanHoi = require('../../tienIch/dinhDangPhanHoi.js');

async function taoDanhGia(req, res, next) {
    try {
        const ketQua = await danhGiaService.taoDanhGia(req.body);
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Gửi đánh giá thành công', 201);
    } catch (loi) {
        next(loi);
    }
}

async function layDanhSach(req, res, next) {
    try {
        const { chiTieuCuc, soSao, trangThai, gioiHan } = req.query;
        const ketQua = await danhGiaService.layDanhSach({ chiTieuCuc, soSao, trangThai, gioiHan });
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy danh sách đánh giá thành công');
    } catch (loi) {
        next(loi);
    }
}

async function layDiemTrungBinh(req, res, next) {
    try {
        const ketQua = await danhGiaService.layDiemTrungBinh();
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Lấy điểm đánh giá trung bình thành công');
    } catch (loi) {
        next(loi);
    }
}

async function phanHoiDanhGia(req, res, next) {
    try {
        const { phanHoi } = req.body;
        const ketQua = await danhGiaService.phanHoiDanhGia(req.params.id, phanHoi);
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Phản hồi đánh giá thành công');
    } catch (loi) {
        next(loi);
    }
}

async function doiTrangThai(req, res, next) {
    try {
        const { trangThai } = req.body;
        const ketQua = await danhGiaService.doiTrangThai(req.params.id, trangThai);
        return dinhDangPhanHoi.thanhCong(res, ketQua, 'Cập nhật trạng thái đánh giá thành công');
    } catch (loi) {
        next(loi);
    }
}

function layMauPhanHoi(req, res) {
    const mauPhanHoi = [
        { id: 1, loai: 'tich_cuc', tieuDe: 'Cảm ơn khen ngợi', noiDung: 'Quán Mộc xin chân thành cảm ơn quý khách đã ghé thăm và dành lời khen ngợi quý báu. Rất mong được đón tiếp quý khách trong những bữa ăn tiếp theo!' },
        { id: 2, loai: 'tiep_thu', tieuDe: 'Tiếp thu góp ý', noiDung: 'Quán Mộc xin trân trọng cảm ơn góp ý chân thành của quý khách. Đội ngũ quản lý và bếp đã ghi nhận để cải tiến chất lượng phục vụ ngay hôm nay!' },
        { id: 3, loai: 'xin_loi', tieuDe: 'Xin lỗi trải nghiệm chưa tốt', noiDung: 'Quán Mộc xin gửi lời xin lỗi sâu sắc vì trải nghiệm dùng bữa chưa trọn vẹn của quý khách. Chúng tôi sẽ liên hệ trực tiếp để lắng nghe và có ưu đãi tạ lỗi gửi đến quý khách ạ!' }
    ];
    return dinhDangPhanHoi.thanhCong(res, mauPhanHoi, 'Lấy danh sách mẫu phản hồi thành công');
}

module.exports = {
    taoDanhGia,
    layDanhSach,
    layDiemTrungBinh,
    phanHoiDanhGia,
    doiTrangThai,
    layMauPhanHoi
};
