// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// ROUTE HÓA ĐƠN & THANH TOÁN (FIGMA P01, P02, P03, P04, P05, C09, C10)
// ============================================================================

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cauHinh = require('../../cauHinh/cauHinhChung');
const { chayGiaoDich, truyVanNhieu } = require('../../cauHinh/ketNoiCoSoDuLieu');
const xacThucBan = require('../../middleware/xacThucBan');
const thietBiPhien = require('../banAn/thietBiPhienBan');
const hoaDonModel = require('./hoaDon.model');
const hoaDonService = require('./hoaDon.service');
const { phanHoiThanhCong, phanHoiLoi } = require('../../tienIch/dinhDangPhanHoi');
const hoaDonController = require('./hoaDon.controller');
const { xacThucNguoiDung, xacThucTuyChon } = require('../../middleware/xacThuc');
const { phanQuyen } = require('../../middleware/phanQuyen');
const yeuCauVaoCa = require('../../middleware/yeuCauVaoCa');
const xuLyMonPos = require('./xuLyMonPos');

router.post('/:id/qr-mot-phan', xacThucNguoiDung, phanQuyen('thu_ngan', 'quan_ly'), yeuCauVaoCa,
    (req, res) => phanHoiThanhCong(res, hoaDonService.taoQrMotPhan(Number(req.params.id), req.body)));
router.post('/:id/thu-mot-phan', xacThucNguoiDung, phanQuyen('thu_ngan', 'quan_ly'), yeuCauVaoCa,
    (req, res) => phanHoiThanhCong(res, hoaDonService.thuMotPhan(Number(req.params.id), req.body, req.nguoiDung)));
router.get('/chi-dao-mon', xacThucNguoiDung, phanQuyen('thu_ngan', 'bep', 'phuc_vu', 'quan_ly'), yeuCauVaoCa,
    (req, res) => phanHoiThanhCong(res, xuLyMonPos.danhSach(req.nguoiDung)));
router.put('/chi-dao-mon/:id', xacThucNguoiDung, phanQuyen('thu_ngan', 'bep', 'phuc_vu', 'quan_ly'), yeuCauVaoCa,
    async (req, res) => {
        await xuLyMonPos.xacNhan(Number(req.params.id), req.body, req.nguoiDung);
        return phanHoiThanhCong(res, null);
    });
router.post('/ban/:banId/mon/:id/xu-ly', xacThucNguoiDung, phanQuyen('thu_ngan', 'quan_ly'), yeuCauVaoCa,
    (req, res) => {
        const { luaChon, trangThai, ghiChu, soLuong, soLuongHienTai } = req.body;
        const banId = Number(req.params.banId);
        const id = Number(req.params.id);
        if (luaChon === 'huy') {
            const ketQua = xuLyMonPos.chonHuy(banId, id, trangThai, soLuong, soLuongHienTai, ghiChu, req.nguoiDung);
            return phanHoiThanhCong(res, ketQua);
        }
        xuLyMonPos.chon(banId, id, req.body, req.nguoiDung);
        return phanHoiThanhCong(res, null);
    });

// 1. Danh sách hóa đơn (Thu ngân, Quản lý)
router.get(
    '/',
    xacThucNguoiDung,
    phanQuyen('thu_ngan', 'quan_ly'),
    hoaDonController.layDanhSach
);

// 2. Tạm tính hóa đơn cho bàn (Cả khách hàng và nhân viên đều xem được)
router.get(
    '/tam-tinh/:banId',
    xacThucTuyChon,
    (req, res, next) => req.nguoiDung ? next() : xacThucBan(req, res, () => xacThucBan.yeuCauThietBi(req, res, next)),
    hoaDonController.layTamTinhTheoBan
);

function timHoaDonKhach(req) {
    try {
        const payload = jwt.verify(req.get('X-Bill-Token') || '', cauHinh.jwtSecret);
        if (payload.purpose !== 'bill' || payload.ban !== req.ban.id) return null;
        const hd = hoaDonModel.timTheoId(payload.hoaDon);
        if (hd?.ban_an_id !== req.ban.id) return null;
        const thietBi = thietBiPhien.timThietBi(hd.phien_ban_id, req.get('X-Device-Key'));
        return thietBi?.trang_thai === 'da_vao' && thietBi.id === payload.thietBi ? { hd, thietBi } : null;
    } catch {
        return null;
    }
}

router.get('/ban/:banId/hoa-don', xacThucBan, async (req, res) => {
    const phienId = req.ban.phien_ban_id;
    const billCu = req.get('X-Bill-Token') && timHoaDonKhach(req);
    const thietBi = billCu?.thietBi || thietBiPhien.yeuCauQuyen(req.ban.id, req.get('X-Device-Key'));
    const hd = billCu?.hd || (phienId && hoaDonModel.timTheoPhienBan(phienId));
    if (!hd) return phanHoiThanhCong(res, null);
    const bill = await hoaDonService.layChiTietHoaDon(hd.id);
    const billToken = jwt.sign({ purpose: 'bill', ban: req.ban.id, hoaDon: hd.id, thietBi: thietBi.id }, cauHinh.jwtSecret, { expiresIn: '4h' });
    return phanHoiThanhCong(res, {
        id: bill.id,
        phien_ban_id: bill.phien_ban_id,
        ma_hoa_don: bill.ma_hoa_don,
        trang_thai: bill.trang_thai,
        tong_tien_thanh_toan: bill.tong_tien_thanh_toan,
        daThu: bill.daThu,
        conPhaiThu: bill.conPhaiThu,
        thoi_gian_thanh_toan: bill.thoi_gian_thanh_toan,
        phuong_thuc_thanh_toan: bill.phuong_thuc_thanh_toan,
        vietQr: bill.trang_thai === 'chua_thanh_toan' ? bill.vietQr : null, billToken
    });
});

router.post('/ban/:banId/danh-gia', xacThucBan, (req, res) => {
    const hoaDon = timHoaDonKhach(req)?.hd;
    if (hoaDon?.trang_thai !== 'da_thanh_toan') return phanHoiLoi(res, 'Cần hóa đơn đã thanh toán', 403);
    const { soSao, gopY, nhan } = req.body;
    if (!Number.isInteger(soSao) || soSao < 1 || soSao > 5 || typeof gopY !== 'string' ||
        gopY.length > 1200 || !Array.isArray(nhan) || nhan.length > 12 ||
        nhan.some(muc => typeof muc !== 'string' || muc.length > 60)) {
        return phanHoiLoi(res, 'Đánh giá không hợp lệ', 400);
    }
    const nhanXet = [...nhan, gopY.trim()].filter(Boolean).join(' · ');
    const ketQua = chayGiaoDich(db => {
        const daGui = db.prepare('SELECT id FROM danh_gia WHERE phien_ban_id = ?').get(hoaDon.phien_ban_id);
        if (daGui) return daGui.id;
        return Number(db.prepare('INSERT INTO danh_gia (phien_ban_id, so_sao, nhan_xet) VALUES (?, ?, ?)')
            .run(hoaDon.phien_ban_id, soSao, nhanXet).lastInsertRowid);
    });
    return phanHoiThanhCong(res, { id: ketQua });
});

router.get('/danh-gia', xacThucNguoiDung, phanQuyen('quan_ly'), (req, res) => {
    return phanHoiThanhCong(res, truyVanNhieu(`SELECT dg.id, dg.so_sao, dg.nhan_xet, dg.ngay_tao, b.ten_ban
        FROM danh_gia dg JOIN phien_ban pb ON pb.id = dg.phien_ban_id JOIN ban_an b ON b.id = pb.ban_an_id
        ORDER BY dg.id DESC LIMIT 100`));
});

// 3. Chi tiết hóa đơn
router.get(
    '/:id',
    xacThucNguoiDung,
    phanQuyen('thu_ngan', 'quan_ly'),
    hoaDonController.layChiTiet
);

// 4. Tạo hóa đơn thanh toán cho bàn (Thu ngân, Quản lý)
router.post(
    '/tao-hoa-don',
    xacThucNguoiDung,
    phanQuyen('thu_ngan', 'quan_ly'),
    hoaDonController.taoHoaDon
);

// 5. Xác nhận hoàn tất thanh toán hóa đơn
router.post(
    '/:id/thanh-toan',
    xacThucNguoiDung,
    phanQuyen('thu_ngan', 'quan_ly'),
    hoaDonController.xacNhanThanhToan
);

// 6. Chia tiền nhóm (Figma C10, P06)
router.post(
    '/:id/chia-tien',
    xacThucNguoiDung,
    phanQuyen('thu_ngan', 'quan_ly'),
    hoaDonController.chiaTienNhom
);

module.exports = router;
