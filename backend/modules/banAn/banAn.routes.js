// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// ĐỊNH TUYẾN ĐƯỜNG DẪN API SƠ ĐỒ BÀN & QUẢN LÝ BÀN ĂN
// ============================================================================

const express = require('express');
const router = express.Router();
const { layGio, suaGio, gioChoThietBi } = require('./gioMonBan');
const thietBiPhien = require('./thietBiPhienBan');
const banAnModel = require('./banAn.model');
const { socketPhat } = require('../../cauHinh/cauHinhSocket');
const { phanHoiThanhCong } = require('../../tienIch/dinhDangPhanHoi');
const xacThucBan = require('../../middleware/xacThucBan');
const banAnController = require('./banAn.controller');
const { xacThucNguoiDung, xacThucTuyChon } = require('../../middleware/xacThuc');
const { phanQuyen } = require('../../middleware/phanQuyen');
const yeuCauVaoCa = require('../../middleware/yeuCauVaoCa');
const dieuPhoiBan = require('./dieuPhoiBan');

// Danh sách khu vực (Dropdown)
router.get('/khu-vuc', banAnController.layDanhSachKhuVuc);
router.post('/khu-vuc', xacThucNguoiDung, phanQuyen('quan_ly'), banAnController.taoKhuVuc);

// Khách quét QR bàn (Public)
router.get('/qr/:token', banAnController.layQuaQrToken);

// Xem sơ đồ bàn (Phục vụ, Thu ngân, Bếp, Quản lý - có thể dùng xác thực tùy chọn để xem linh hoạt)
router.get('/', xacThucNguoiDung, yeuCauVaoCa, banAnController.layDanhSach);
router.get('/ho-tro', xacThucNguoiDung, phanQuyen('phuc_vu', 'thu_ngan'), yeuCauVaoCa, banAnController.layHoTro);
router.get('/viec-ban', xacThucNguoiDung, phanQuyen('phuc_vu'), yeuCauVaoCa, (req, res) => {
    const banId = req.query.banId === undefined ? null : Number(req.query.banId);
    if (banId !== null && (!Number.isSafeInteger(banId) || banId <= 0))
        throw Object.assign(new Error('Mã bàn không hợp lệ.'), { status: 400 });
    return phanHoiThanhCong(res, dieuPhoiBan.layDanhSach(req.nguoiDung, banId));
});
router.put('/viec-ban/:loai/:id/tiep-nhan', xacThucNguoiDung, phanQuyen('phuc_vu'), yeuCauVaoCa, (req, res) => {
    const viec = dieuPhoiBan.tiepNhan(req.nguoiDung, Number(req.body?.banId), req.params.loai, Number(req.params.id));
    socketPhat.viecBanThayDoi();
    return phanHoiThanhCong(res, viec, 'Đã tiếp nhận công việc');
});
router.put('/ho-tro/:id/xong', xacThucNguoiDung, phanQuyen('phuc_vu', 'thu_ngan'), yeuCauVaoCa, banAnController.xongHoTro);
router.get('/:id/tham-gia', xacThucBan, (req, res) =>
    phanHoiThanhCong(res, thietBiPhien.trangThai(req.ban.id, req.get('X-Device-Key'))));
router.post('/:id/tham-gia', xacThucBan, (req, res) =>
    phanHoiThanhCong(res, thietBiPhien.guiYeuCau(req.ban.id, req.get('X-Device-Key'), req.body.phienId)));
router.put('/:id/tham-gia/:yeuCauId', xacThucBan, (req, res) =>
    phanHoiThanhCong(res, thietBiPhien.xuLyYeuCau(req.ban.id, req.get('X-Device-Key'), req.params.yeuCauId, req.body.chapNhan)));
router.post('/:id/tham-gia/:yeuCauId/ma', xacThucBan, (req, res) =>
    phanHoiThanhCong(res, thietBiPhien.nhapMa(req.ban.id, req.get('X-Device-Key'), req.params.yeuCauId, req.body.ma)));

const nhanVienBan = [xacThucNguoiDung, phanQuyen('phuc_vu', 'thu_ngan', 'quan_ly'), yeuCauVaoCa];
router.get('/:id/thiet-bi-cho', nhanVienBan, (req, res) => {
    const phien = banAnModel.layPhienBanHienTai(Number(req.params.id));
    return phanHoiThanhCong(res, phien ? thietBiPhien.layYeuCauChu(phien.id) : []);
});
router.put('/:id/thiet-bi-cho/:yeuCauId/chu', nhanVienBan, (req, res) =>
    phanHoiThanhCong(res, thietBiPhien.xacNhanChu(Number(req.params.id), req.params.yeuCauId)));

router.post('/:id/ho-tro', xacThucBan, xacThucBan.yeuCauThietBi, banAnController.guiHoTro);
router.get('/:id/gio-mon', xacThucBan, xacThucBan.yeuCauThietBi, (req, res) =>
    phanHoiThanhCong(res, gioChoThietBi(layGio(req.ban.id), req.thietBi.id)));
router.put('/:id/gio-mon', xacThucBan, xacThucBan.yeuCauThietBi, (req, res) => {
    const gio = suaGio(req.ban.id, req.thietBi, req.body);
    socketPhat.gioMonThayDoi(req.ban.id);
    return phanHoiThanhCong(res, gioChoThietBi(gio, req.thietBi.id));
});
router.get('/:id', xacThucNguoiDung, yeuCauVaoCa, banAnController.layChiTiet);

// Quản lý bàn ăn (Thêm, Sửa, Xóa - Quản trị Admin A10)
router.post('/', xacThucNguoiDung, phanQuyen('quan_ly'), banAnController.taoBan);
router.put('/:id', xacThucNguoiDung, phanQuyen('quan_ly'), banAnController.capNhatThongTin);
router.delete('/:id', xacThucNguoiDung, phanQuyen('quan_ly'), banAnController.xoaBan);

// Nghiệp vụ vận hành bàn ăn (Phục vụ & Quản lý)
router.post('/:id/mo-ban', xacThucNguoiDung, phanQuyen('phuc_vu', 'thu_ngan', 'quan_ly'), yeuCauVaoCa, banAnController.moBan);
router.post('/chuyen-ban', xacThucNguoiDung, phanQuyen('phuc_vu', 'thu_ngan', 'quan_ly'), yeuCauVaoCa, banAnController.chuyenBan);
router.post('/gop-ban', xacThucNguoiDung, phanQuyen('phuc_vu', 'thu_ngan', 'quan_ly'), yeuCauVaoCa, banAnController.gopBan);
router.put('/:id/trang-thai', xacThucNguoiDung, phanQuyen('phuc_vu', 'thu_ngan', 'quan_ly'), yeuCauVaoCa, banAnController.doiTrangThai);

module.exports = router;
