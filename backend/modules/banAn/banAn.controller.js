// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// CONTROLLER ĐIỀU HƯỚNG PHÒNG BÀN, SƠ ĐỒ BÀN & QUÉT QR
// ============================================================================

const { thucThi, truyVanNhieu, chayGiaoDich } = require('../../cauHinh/ketNoiCoSoDuLieu');
const { socketPhat } = require('../../cauHinh/cauHinhSocket');
const { phanHoiLoi } = require('../../tienIch/dinhDangPhanHoi');
const banAnModel = require('./banAn.model');
const banAnService = require('./banAn.service');
const { phanHoiThanhCong } = require('../../tienIch/dinhDangPhanHoi');

const banAnController = {
    guiHoTro(req, res) {
        const { loaiYeuCau, noiDung } = req.body;
        const ban = req.ban;
        if (!['goi_phuc_vu', 'yeu_cau_thanh_toan', 'nuoc_cham', 'khac'].includes(loaiYeuCau) ||
            (noiDung != null && (typeof noiDung !== 'string' || noiDung.length > 300))) {
            return phanHoiLoi(res, 'Yêu cầu hỗ trợ không hợp lệ', 400);
        }
        const phien = banAnModel.layPhienBanHienTai(ban.id);
        if (!phien) return phanHoiLoi(res, 'Bàn chưa có phiên hoạt động', 409);
        const ketQua = chayGiaoDich(db => {
            const daGui = db.prepare(`SELECT id FROM yeu_cau_ho_tro
                WHERE phien_ban_id = ? AND loai_yeu_cau = ? AND COALESCE(noi_dung, '') = ?
                AND (trang_thai <> 'da_xong' OR thoi_gian_gui >= DATETIME('now', '-30 seconds'))`).get(phien.id, loaiYeuCau, noiDung ?? '');
            if (daGui) return { id: daGui.id, moi: false };
            const { lastInsertRowid } = db.prepare(`INSERT INTO yeu_cau_ho_tro
                (phien_ban_id, loai_yeu_cau, noi_dung, trang_thai) VALUES (?, ?, ?, 'cho_tiep_nhan')`)
                .run(phien.id, loaiYeuCau, noiDung ?? '');
            if (loaiYeuCau === 'yeu_cau_thanh_toan') banAnModel.capNhatTrangThai(ban.id, loaiYeuCau);
            return { id: Number(lastInsertRowid), moi: true };
        });
        if (ketQua.moi) {
            socketPhat.khachGoiHoTro({ ...ketQua, banId: ban.id, tenBan: ban.ten_ban, loaiYeuCau, noiDung });
            if (loaiYeuCau === 'yeu_cau_thanh_toan') {
                socketPhat.trangThaiBan({ banId: ban.id, trangThai: loaiYeuCau });
            }
        }
        return phanHoiThanhCong(res, ketQua, 'Đã gửi yêu cầu');
    },

    layHoTro(req, res) {
        const danhSach = truyVanNhieu(`SELECT yc.*, b.ten_ban, b.id AS ban_id
            FROM yeu_cau_ho_tro yc JOIN phien_ban pb ON pb.id = yc.phien_ban_id
            JOIN ban_an b ON b.id = pb.ban_an_id
            WHERE yc.trang_thai <> 'da_xong' AND pb.trang_thai = 'dang_hoat_dong'
            ORDER BY yc.id DESC`);
        const vaiTro = req.nguoiDung.vaiTro;
        if (vaiTro === 'quan_ly') return phanHoiThanhCong(res, danhSach);
        if (vaiTro === 'thu_ngan') return phanHoiThanhCong(res, danhSach.filter(y => y.loai_yeu_cau === 'yeu_cau_thanh_toan'));
        const viec = require('./dieuPhoiBan').layDanhSach(req.nguoiDung);
        const ids = new Set(viec.filter(muc => muc.loai === 'ho_tro').map(muc => muc.doi_tuong_id));
        return phanHoiThanhCong(res, danhSach.filter(y => ids.has(y.id)));
    },

    xongHoTro(req, res) {
        const id = Number(req.params.id);
        const viec = truyVanNhieu(`SELECT y.loai_yeu_cau,p.ban_an_id FROM yeu_cau_ho_tro y
            JOIN phien_ban p ON p.id=y.phien_ban_id WHERE y.id=? AND y.trang_thai!='da_xong'
            AND p.trang_thai='dang_hoat_dong'`, [id])[0];
        if (!viec) return phanHoiLoi(res, 'Yêu cầu đã xử lý hoặc đã đóng phiên.', 409);
        const vaiTro = req.nguoiDung.vaiTro;
        const vaiTroXuLy = viec.loai_yeu_cau === 'yeu_cau_thanh_toan' ? 'thu_ngan' : 'phuc_vu';
        if (![vaiTroXuLy, 'quan_ly'].includes(vaiTro)) return phanHoiLoi(res, 'Yêu cầu thuộc bộ phận khác.', 403);
        if (vaiTro === 'phuc_vu') require('./dieuPhoiBan').tiepNhan(req.nguoiDung, viec.ban_an_id, 'ho_tro', id);
        thucThi(`UPDATE yeu_cau_ho_tro SET trang_thai = 'da_xong', thoi_gian_hoan_thanh = CURRENT_TIMESTAMP,
            nhan_vien_tiep_nhan_id = ? WHERE id = ? AND trang_thai <> 'da_xong'`,
            [req.nguoiDung.nhanVienId, id]);
        socketPhat.viecBanThayDoi();
        return phanHoiThanhCong(res, null, 'Đã xử lý yêu cầu');
    },

    layDanhSach(req, res, next) {
        try {
            const { khuVucId } = req.query;
            const ketQua = banAnService.layDanhSach(khuVucId ? Number(khuVucId) : null);
            return phanHoiThanhCong(res, ketQua, 'Lấy sơ đồ bàn thành công');
        } catch (loi) {
            next(loi);
        }
    },

    layChiTiet(req, res, next) {
        try {
            const ban = banAnService.layChiTiet(Number(req.params.id));
            return phanHoiThanhCong(res, ban, 'Lấy chi tiết bàn thành công');
        } catch (loi) {
            next(loi);
        }
    },

    layQuaQrToken(req, res, next) {
        try {
            const ban = banAnService.layQuaQrToken(req.params.token);
            return phanHoiThanhCong(res, ban, 'Xác thực mã QR bàn thành công');
        } catch (loi) {
            next(loi);
        }
    },

    moBan(req, res, next) {
        try {
            const banId = Number(req.params.id);
            const { soKhach, ghiChu } = req.body;
            const nguoiThaoTacId = req.nguoiDung ? req.nguoiDung.taiKhoanId : null;

            const ketQua = banAnService.moBan(banId, { soKhach, ghiChu, nguoiThaoTacId });
            return phanHoiThanhCong(res, ketQua, 'Mở bàn mới thành công', 201);
        } catch (loi) {
            next(loi);
        }
    },

    chuyenBan(req, res, next) {
        try {
            const { banNguonId, banDichId, lyDo } = req.body;
            const nguoiThaoTacId = req.nguoiDung ? req.nguoiDung.taiKhoanId : null;

            const ketQua = banAnService.chuyenBan({
                banNguonId: Number(banNguonId),
                banDichId: Number(banDichId),
                nguoiThaoTacId,
                lyDo
            });
            return phanHoiThanhCong(res, ketQua, 'Chuyển bàn thành công');
        } catch (loi) {
            next(loi);
        }
    },

    gopBan(req, res, next) {
        try {
            const { banNguonId, banDichId, lyDo } = req.body;
            const nguoiThaoTacId = req.nguoiDung ? req.nguoiDung.taiKhoanId : null;

            const ketQua = banAnService.gopBan({
                banNguonId: Number(banNguonId),
                banDichId: Number(banDichId),
                nguoiThaoTacId,
                lyDo
            });
            return phanHoiThanhCong(res, ketQua, 'Gộp bàn thành công');
        } catch (loi) {
            next(loi);
        }
    },

    doiTrangThai(req, res, next) {
        try {
            const banId = Number(req.params.id);
            const { trangThai } = req.body;
            const nguoiThaoTacId = req.nguoiDung ? req.nguoiDung.taiKhoanId : null;

            if (trangThai === 'trong' && banAnModel.timTheoId(banId)?.trang_thai === 'can_don_dep') {
                const phien = truyVanNhieu('SELECT id FROM phien_ban WHERE ban_an_id=? ORDER BY id DESC LIMIT 1', [banId])[0];
                if (phien) require('./dieuPhoiBan').kiemTraNguoiNhan(req.nguoiDung, 'don_ban', phien.id);
            }
            const ketQua = banAnService.doiTrangThai(banId, trangThai, nguoiThaoTacId);
            return phanHoiThanhCong(res, ketQua, 'Cập nhật trạng thái bàn thành công');
        } catch (loi) {
            next(loi);
        }
    },

    layDanhSachKhuVuc(req, res, next) {
        try {
            const danhSach = banAnService.layDanhSachKhuVuc();
            return phanHoiThanhCong(res, danhSach, 'Lấy danh sách khu vực thành công');
        } catch (loi) {
            next(loi);
        }
    },

    taoKhuVuc(req, res, next) {
        try {
            return phanHoiThanhCong(res, banAnService.taoKhuVuc(req.body ?? {}), 'Đã tạo khu vực', 201);
        } catch (loi) {
            next(loi);
        }
    },

    capNhatThongTin(req, res, next) {
        try {
            const banId = Number(req.params.id);
            const nguoiThaoTacId = req.nguoiDung ? req.nguoiDung.taiKhoanId : null;
            const ketQua = banAnService.capNhatThongTin(banId, req.body, nguoiThaoTacId);
            return phanHoiThanhCong(res, ketQua, 'Cập nhật thông tin bàn ăn thành công');
        } catch (loi) {
            next(loi);
        }
    },

    taoBan(req, res, next) {
        try {
            const nguoiThaoTacId = req.nguoiDung ? req.nguoiDung.taiKhoanId : null;
            const ketQua = banAnService.taoBan(req.body, nguoiThaoTacId);
            return phanHoiThanhCong(res, ketQua, 'Thêm bàn ăn mới thành công', 201);
        } catch (loi) {
            next(loi);
        }
    },

    xoaBan(req, res, next) {
        try {
            const banId = Number(req.params.id);
            const nguoiThaoTacId = req.nguoiDung ? req.nguoiDung.taiKhoanId : null;
            const ketQua = banAnService.xoaBan(banId, nguoiThaoTacId);
            return phanHoiThanhCong(res, ketQua, 'Xóa bàn ăn thành công');
        } catch (loi) {
            next(loi);
        }
    }
};

module.exports = banAnController;
