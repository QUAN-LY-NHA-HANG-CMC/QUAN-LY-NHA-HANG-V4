// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// ĐỊNH TUYẾN ĐƯỜNG DẪN API ĐƠN GỌI MÓN VÀ DUYỆT ĐƠN
// ============================================================================

const express = require('express');
const router = express.Router();
const { truyVanNhieu, chayGiaoDich } = require('../../cauHinh/ketNoiCoSoDuLieu');
const { phanHoiThanhCong, phanHoiLoi } = require('../../tienIch/dinhDangPhanHoi');
const { socketPhat } = require('../../cauHinh/cauHinhSocket');
const donGoiMonController = require('./donGoiMon.controller');
const donGoiMonService = require('./donGoiMon.service');
const xacThucBan = require('../../middleware/xacThucBan');
const { xacThucNguoiDung, xacThucTuyChon } = require('../../middleware/xacThuc');
const { phanQuyen } = require('../../middleware/phanQuyen');
const yeuCauVaoCa = require('../../middleware/yeuCauVaoCa');
const { kiemTraNguoiNhan } = require('../banAn/dieuPhoiBan');
const kiemTraNhanDon = (req, res, next) => {
    kiemTraNguoiNhan(req.nguoiDung, 'duyet_qr', Number(req.params.id));
    next();
};

// Khách quét QR gọi món (hoặc phục vụ đặt hộ)
router.post('/', xacThucTuyChon, yeuCauVaoCa, donGoiMonController.taoDon);

// Xem các món của bàn (Khách xem live tracker hoặc Phục vụ xem)
router.get('/ban/:banId', xacThucTuyChon, yeuCauVaoCa, donGoiMonController.layMonTheoBan);

// Phục vụ kiểm tra danh sách đơn QR chờ duyệt (Figma W04)
router.get('/cho-duyet', xacThucNguoiDung, phanQuyen('phuc_vu', 'thu_ngan'), yeuCauVaoCa, donGoiMonController.layDonChoDuyet);
router.put('/:id/duyet', xacThucNguoiDung, phanQuyen('phuc_vu', 'thu_ngan'), yeuCauVaoCa, kiemTraNhanDon, donGoiMonController.duyetDonQR);
router.put('/:id/tu-choi', xacThucNguoiDung, phanQuyen('phuc_vu', 'thu_ngan'), yeuCauVaoCa, kiemTraNhanDon, donGoiMonController.tuChoiDonQR);

// Yêu cầu hủy món có kiểm soát (Figma W10)
router.post('/huy-mon', xacThucNguoiDung, phanQuyen('phuc_vu', 'thu_ngan'), yeuCauVaoCa, donGoiMonController.yeuCauHuyMon);

router.post('/ban/:banId/chi-tiet/:chiTietId/yeu-cau-huy', xacThucBan, xacThucBan.yeuCauThietBi, (req, res) => {
    const ketQua = donGoiMonService.guiYeuCauHuyCuaKhach(req.thietBi, Number(req.params.chiTietId), req.body?.lyDo);
    return phanHoiThanhCong(res, ketQua, 'Đã gửi yêu cầu hủy cho phục vụ');
});

router.put('/ban/:banId/yeu-cau-huy-khach/:yeuCauId', xacThucNguoiDung,
    phanQuyen('phuc_vu', 'thu_ngan'), yeuCauVaoCa, (req, res) => {
        const ketQua = donGoiMonService.xuLyHuyCuaKhach({
            banId: Number(req.params.banId), yeuCauId: Number(req.params.yeuCauId),
            nhanVienId: req.nguoiDung.nhanVienId, chapNhan: req.body?.chapNhan
        });
        return phanHoiThanhCong(res, ketQua);
    });

router.get('/yeu-cau-huy-mon', xacThucNguoiDung, phanQuyen('quan_ly'), (req, res) => {
    const data = truyVanNhieu(`SELECT yc.*, b.ten_ban, m.ten_mon, ct.so_luong, ct.don_gia, nv.ho_ten
        FROM yeu_cau_huy_mon yc JOIN chi_tiet_don_mon ct ON ct.id = yc.chi_tiet_don_mon_id
        JOIN mon_an m ON m.id = ct.mon_an_id JOIN don_goi_mon d ON d.id = ct.don_goi_mon_id
        JOIN phien_ban pb ON pb.id = d.phien_ban_id JOIN ban_an b ON b.id = pb.ban_an_id
        JOIN nhan_vien nv ON nv.id = yc.nhan_vien_yeu_cau_id ORDER BY yc.id DESC LIMIT 100`);
    return phanHoiThanhCong(res, data);
});

router.get('/yeu-cau-huy-mon/so-cho-duyet', xacThucNguoiDung, phanQuyen('quan_ly'), (req, res) => {
    const [data] = truyVanNhieu(`SELECT COUNT(*) AS soLuong FROM yeu_cau_huy_mon y
      JOIN chi_tiet_don_mon c ON c.id=y.chi_tiet_don_mon_id JOIN don_goi_mon d ON d.id=c.don_goi_mon_id
      JOIN phien_ban p ON p.id=d.phien_ban_id WHERE y.trang_thai_yeu_cau='cho_admin_duyet'
      AND c.trang_thai_mon='yeu_cau_huy' AND p.trang_thai='dang_hoat_dong'`);
    return phanHoiThanhCong(res, data);
});

router.put('/yeu-cau-huy-mon/:id/phe-duyet', xacThucNguoiDung, phanQuyen('quan_ly'), (req, res) => {
    const { chapNhan, lyDoTuChoi } = req.body ?? {};
    if (typeof chapNhan !== 'boolean') return phanHoiLoi(res, 'Quyết định không hợp lệ', 400);
    const lyDo = typeof lyDoTuChoi === 'string' ? lyDoTuChoi.trim() : '';
    if (!chapNhan && (!lyDo || lyDo.length > 300)) {
        return phanHoiLoi(res, 'Nhập lý do từ chối từ 1 đến 300 ký tự.', 400);
    }
    const id = Number(req.params.id);
    const ketQua = chayGiaoDich(db => {
        const yeuCau = db.prepare(`SELECT yc.chi_tiet_don_mon_id, yc.trang_thai_mon_cu, pb.ban_an_id
            FROM yeu_cau_huy_mon yc JOIN chi_tiet_don_mon ct ON ct.id = yc.chi_tiet_don_mon_id
            JOIN don_goi_mon d ON d.id = ct.don_goi_mon_id JOIN phien_ban pb ON pb.id = d.phien_ban_id
            WHERE yc.id = ? AND yc.trang_thai_yeu_cau = 'cho_admin_duyet' AND ct.trang_thai_mon = 'yeu_cau_huy'
            AND pb.trang_thai = 'dang_hoat_dong'`).get(id);
        if (!yeuCau) return null;
        const trangThaiMoi = chapNhan ? 'da_huy' : yeuCau.trang_thai_mon_cu || 'dang_nau';
        db.prepare(`UPDATE yeu_cau_huy_mon SET trang_thai_yeu_cau = ?, admin_duyet_id = ?, phan_hoi_admin = ?,
            thoi_gian_duyet = CURRENT_TIMESTAMP WHERE id = ?`)
            .run(chapNhan ? 'da_chap_thuan' : 'tu_choi', req.nguoiDung.nhanVienId, chapNhan ? null : lyDo, id);
        db.prepare('UPDATE chi_tiet_don_mon SET trang_thai_mon = ? WHERE id = ?')
            .run(trangThaiMoi, yeuCau.chi_tiet_don_mon_id);
        return { banId: yeuCau.ban_an_id, chiTietId: yeuCau.chi_tiet_don_mon_id, trangThaiMoi };
    });
    if (!ketQua) return phanHoiLoi(res, 'Yêu cầu đã xử lý hoặc phiên bàn đã đóng', 409);
    socketPhat.tienDoMonAn(ketQua);
    socketPhat.yeuCauHuyMonThayDoi();
    return phanHoiThanhCong(res, ketQua);
});

module.exports = router;
