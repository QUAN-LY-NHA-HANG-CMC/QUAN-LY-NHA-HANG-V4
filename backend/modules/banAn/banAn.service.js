// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// SERVICE NGHIỆP VỤ QUẢN LÝ SƠ ĐỒ BÀN, MỞ BÀN, CHUYỂN BÀN & GỘP BÀN
// ============================================================================

const banAnModel = require('./banAn.model');
const { chayGiaoDich, truyVanMot } = require('../../cauHinh/ketNoiCoSoDuLieu');
const { socketPhat } = require('../../cauHinh/cauHinhSocket');
const { ghiAuditLog } = require('../../tienIch/ghiNhatKy');

function kiemTraKhuVuc(id) {
    const ma = Number(id);
    if (!Number.isSafeInteger(ma) || ma <= 0 ||
        !truyVanMot('SELECT id FROM khu_vuc WHERE id=? AND kich_hoat=1', [ma])) {
        throw Object.assign(new Error('Khu vực không còn khả dụng. Hãy chọn hoặc tạo một khu vực.'), { status: 400 });
    }
    return ma;
}

const banAnService = {
    layDanhSach(khuVucId) {
        const danhSachBan = banAnModel.layDanhSach(khuVucId);
        const danhSachKhuVuc = banAnModel.layDanhSachKhuVuc();
        return {
            khuVuc: danhSachKhuVuc,
            banAn: danhSachBan
        };
    },

    layChiTiet(id) {
        const ban = banAnModel.timTheoId(id);
        if (!ban) {
            const loi = new Error('Không tìm thấy bàn ăn');
            loi.status = 404;
            throw loi;
        }
        return ban;
    },

    layQuaQrToken(token) {
        if (!token) {
            const loi = new Error('Mã QR Token không được để trống');
            loi.status = 400;
            throw loi;
        }

        const ban = banAnModel.timTheoQrToken(token.trim());
        if (!ban) {
            const loi = new Error('Mã QR không hợp lệ hoặc bàn đã bị tạm ngừng phục vụ');
            loi.status = 404;
            throw loi;
        }
        return ban;
    },

    /**
     * Mở bàn mới và khởi tạo phiên bàn dùng chung (Shared Table Session)
     */
    moBan(banId, { soKhach = 2, ghiChu = null, nguoiThaoTacId = null }) {
        const ban = banAnModel.timTheoId(banId);
        if (!ban) {
            const loi = new Error('Không tìm thấy bàn ăn');
            loi.status = 404;
            throw loi;
        }

        if (ban.trang_thai !== 'trong') {
            const loi = new Error(`Bàn ${ban.ten_ban} hiện đang ${ban.trang_thai}, không thể mở mới.`);
            loi.status = 400;
            throw loi;
        }

        return chayGiaoDich((db) => {
            const maPhien = `PB_${ban.ma_ban}_${Date.now()}`;
            
            // 1. Tạo phiên bàn mới
            const resPhien = db.prepare(`
                INSERT INTO phien_ban (ban_an_id, ma_phien, so_luong_khach, ghi_chu, trang_thai)
                VALUES (?, ?, ?, ?, 'dang_hoat_dong');
            `).run(banId, maPhien, Math.max(1, Number(soKhach)), ghiChu);

            const phienBanId = resPhien.lastInsertRowid;

            // 2. Chuyển trạng thái bàn sang "co_khach"
            db.prepare(`
                UPDATE ban_an 
                SET trang_thai = 'co_khach', ngay_cap_nhat = CURRENT_TIMESTAMP 
                WHERE id = ?;
            `).run(banId);

            // 3. Ghi Audit Log
            ghiAuditLog({
                taiKhoanId: nguoiThaoTacId,
                hanhDong: 'MO_BAN_MOI',
                bangAnhHuong: 'phien_ban',
                banGhiId: phienBanId,
                duLieuMoi: { banId, maPhien, soKhach },
                lyDo: `Mở bàn ${ban.ten_ban} cho ${soKhach} khách`
            });

            // 4. Phát socket realtime
            socketPhat.trangThaiBan({
                banId,
                maBan: ban.ma_ban,
                trangThai: 'co_khach',
                phienBanId,
                soLuongKhach: soKhach
            });

            return {
                phienBanId,
                maPhien,
                banId,
                maBan: ban.ma_ban,
                trangThai: 'co_khach'
            };
        });
    },

    /**
     * Chuyển khách từ bàn nguồn sang bàn đích (Figma W08)
     */
    chuyenBan({ banNguonId, banDichId, nguoiThaoTacId = null, lyDo = null }) {
        if (banNguonId === banDichId) {
            const loi = new Error('Bàn nguồn và bàn đích không được trùng nhau');
            loi.status = 400;
            throw loi;
        }

        const banNguon = banAnModel.timTheoId(banNguonId);
        const banDich = banAnModel.timTheoId(banDichId);

        if (!banNguon || !banDich) {
            const loi = new Error('Bàn nguồn hoặc bàn đích không tồn tại');
            loi.status = 404;
            throw loi;
        }

        if (banNguon.trang_thai === 'trong') {
            const loi = new Error(`Bàn ${banNguon.ten_ban} đang trống, không có phiên để chuyển`);
            loi.status = 400;
            throw loi;
        }

        if (banDich.trang_thai !== 'trong') {
            const loi = new Error(`Bàn đích ${banDich.ten_ban} đang có khách (${banDich.trang_thai}). Vui lòng chọn bàn trống hoặc dùng tính năng Gộp bàn.`);
            loi.status = 400;
            throw loi;
        }

        return chayGiaoDich((db) => {
            // 1. Lấy phiên bàn nguồn đang hoạt động
            const phienBan = db.prepare(`
                SELECT id, ma_phien FROM phien_ban 
                WHERE ban_an_id = ? AND trang_thai = 'dang_hoat_dong';
            `).get(banNguonId);

            if (!phienBan) {
                throw new Error('Không tìm thấy phiên bàn đang hoạt động trên bàn nguồn');
            }

            // 2. Chuyển phiên sang bàn đích
            db.prepare(`
                UPDATE phien_ban 
                SET ban_an_id = ? 
                WHERE id = ?;
            `).run(banDichId, phienBan.id);

            // 3. Đổi trạng thái bàn đích sang trạng thái của bàn nguồn
            db.prepare(`
                UPDATE ban_an 
                SET trang_thai = ?, ngay_cap_nhat = CURRENT_TIMESTAMP 
                WHERE id = ?;
            `).run(banNguon.trang_thai, banDichId);

            // 4. Giải phóng bàn nguồn về "trong"
            db.prepare(`
                UPDATE ban_an 
                SET trang_thai = 'trong', ngay_cap_nhat = CURRENT_TIMESTAMP 
                WHERE id = ?;
            `).run(banNguonId);

            // 5. Ghi Audit Log
            ghiAuditLog({
                taiKhoanId: nguoiThaoTacId,
                hanhDong: 'CHUYEN_BAN',
                bangAnhHuong: 'phien_ban',
                banGhiId: phienBan.id,
                duLieuCu: { banNguonId },
                duLieuMoi: { banDichId },
                lyDo: lyDo || `Chuyển khách từ ${banNguon.ten_ban} sang ${banDich.ten_ban}`
            });

            // 6. Phát Socket Realtime
            socketPhat.trangThaiBan({ banId: banNguonId, trangThai: 'trong' });
            socketPhat.trangThaiBan({ banId: banDichId, trangThai: banNguon.trang_thai, phienBanId: phienBan.id });

            return {
                ok: true,
                msg: `Đã chuyển thành công từ ${banNguon.ten_ban} sang ${banDich.ten_ban}`
            };
        });
    },

    /**
     * Gộp 2 bàn ăn lại với nhau (Figma W09)
     */
    gopBan({ banNguonId, banDichId, nguoiThaoTacId = null, lyDo = null }) {
        if (banNguonId === banDichId) {
            const loi = new Error('Bàn nguồn và bàn đích không được trùng nhau');
            loi.status = 400;
            throw loi;
        }

        return chayGiaoDich((db) => {
            const phienNguon = db.prepare(`SELECT * FROM phien_ban WHERE ban_an_id = ? AND trang_thai = 'dang_hoat_dong'`).get(banNguonId);
            const phienDich = db.prepare(`SELECT * FROM phien_ban WHERE ban_an_id = ? AND trang_thai = 'dang_hoat_dong'`).get(banDichId);

            if (!phienNguon || !phienDich) {
                throw new Error('Cả hai bàn phải đều đang có phiên hoạt động thì mới gộp được');
            }

            db.prepare(`UPDATE hoa_don SET trang_thai = 'da_huy'
                WHERE phien_ban_id IN (?, ?) AND trang_thai = 'chua_thanh_toan'`).run(phienNguon.id, phienDich.id);
            // 1. Chuyển toàn bộ đơn đặt món từ phiên nguồn sang phiên đích
            db.prepare(`
                UPDATE don_goi_mon 
                SET phien_ban_id = ? 
                WHERE phien_ban_id = ?;
            `).run(phienDich.id, phienNguon.id);

            // 2. Chuyển yêu cầu hỗ trợ (nếu có)
            db.prepare(`
                UPDATE yeu_cau_ho_tro 
                SET phien_ban_id = ? 
                WHERE phien_ban_id = ?;
            `).run(phienDich.id, phienNguon.id);

            // 3. Đóng phiên nguồn và đánh dấu đã gộp
            db.prepare(`
                UPDATE phien_ban 
                SET trang_thai = 'da_dong', thoi_gian_ket_thuc = CURRENT_TIMESTAMP, ghi_chu = ? 
                WHERE id = ?;
            `).run(`Đã gộp vào phiên ${phienDich.ma_phien}`, phienNguon.id);

            // 4. Giải phóng bàn nguồn về "trong"
            db.prepare(`
                UPDATE ban_an 
                SET trang_thai = 'trong', ngay_cap_nhat = CURRENT_TIMESTAMP 
                WHERE id = ?;
            `).run(banNguonId);

            // 5. Cập nhật số khách phiên đích
            db.prepare(`
                UPDATE phien_ban 
                SET so_luong_khach = so_luong_khach + ? 
                WHERE id = ?;
            `).run(phienNguon.so_luong_khach, phienDich.id);

            // 6. Ghi Audit Log
            ghiAuditLog({
                taiKhoanId: nguoiThaoTacId,
                hanhDong: 'GOP_BAN',
                bangAnhHuong: 'phien_ban',
                banGhiId: phienDich.id,
                lyDo: lyDo || `Gộp bàn nguồn ${banNguonId} vào bàn đích ${banDichId}`
            });

            socketPhat.trangThaiBan({ banId: banNguonId, trangThai: 'trong' });
            socketPhat.trangThaiBan({ banId: banDichId, trangThai: 'co_khach', phienBanId: phienDich.id });

            return {
                ok: true,
                msg: 'Gộp bàn thành công, đơn món đã được chuyển vào bàn đích'
            };
        });
    },

    /**
     * Cập nhật trạng thái bàn thủ công (Dọn bàn xong -> Trống)
     */
    doiTrangThai(banId, trangThai, nguoiThaoTacId = null) {
        const trangThaiHopLe = ['trong', 'co_khach', 'cho_mon', 'yeu_cau_thanh_toan', 'can_don_dep'];
        if (!trangThaiHopLe.includes(trangThai)) {
            const loi = new Error(`Trạng thái [${trangThai}] không hợp lệ`);
            loi.status = 400;
            throw loi;
        }

        const ban = banAnModel.timTheoId(banId);
        if (!ban) throw Object.assign(new Error('Không tìm thấy bàn'), { status: 404 });
        const phien = banAnModel.layPhienBanHienTai(banId);
        if (phien && ['trong', 'can_don_dep'].includes(trangThai)) {
            throw Object.assign(new Error('Cần hoàn tất phiên bàn trước khi đổi trạng thái'), { status: 409 });
        }
        if (!phien && ['co_khach', 'cho_mon', 'yeu_cau_thanh_toan'].includes(trangThai)) {
            throw Object.assign(new Error('Bàn chưa có phiên hoạt động'), { status: 409 });
        }
        banAnModel.capNhatTrangThai(banId, trangThai);
        socketPhat.trangThaiBan({ banId, trangThai });

        ghiAuditLog({
            taiKhoanId: nguoiThaoTacId,
            hanhDong: 'DOI_TRANG_THAI_BAN',
            bangAnhHuong: 'ban_an',
            banGhiId: banId,
            lyDo: `Đổi trạng thái bàn thành ${trangThai}`
        });

        return { banId, trangThai };
    },

    layDanhSachKhuVuc() {
        return banAnModel.layDanhSachKhuVuc();
    },

    taoKhuVuc({ maKhuVuc, tenKhuVuc }) {
        const ma = typeof maKhuVuc === 'string' ? maKhuVuc.trim().toUpperCase() : '';
        const ten = typeof tenKhuVuc === 'string' ? tenKhuVuc.trim() : '';
        if (!/^[A-Z0-9_-]{1,20}$/.test(ma) || !ten || ten.length > 100) {
            throw Object.assign(new Error('Nhập mã khu vực 1–20 ký tự (chữ không dấu, số, gạch) và tên tối đa 100 ký tự.'), { status: 400 });
        }
        const khuVuc = banAnModel.taoKhuVuc(ma, ten);
        if (!khuVuc) throw Object.assign(new Error('Mã khu vực đã tồn tại.'), { status: 409 });
        return khuVuc;
    },

    capNhatThongTin(banId, { tenBan, maBan, khuVucId, sucChua, tuDongDuyetMon, kichHoat }, nguoiThaoTacId = null) {
        const banCu = banAnModel.timTheoId(banId);
        if (!banCu) {
            const loi = new Error('Không tìm thấy bàn ăn');
            loi.status = 404;
            throw loi;
        }

        banAnModel.capNhatThongTin(banId, {
            tenBan: tenBan ? String(tenBan).trim() : banCu.ten_ban,
            maBan: maBan ? String(maBan).trim() : banCu.ma_ban,
            khuVucId: khuVucId === undefined ? banCu.khu_vuc_id : kiemTraKhuVuc(khuVucId),
            sucChua: sucChua ? Number(sucChua) : banCu.suc_chua,
            tuDongDuyetMon: tuDongDuyetMon !== undefined ? (tuDongDuyetMon ? 1 : 0) : banCu.tu_dong_duyet_mon,
            kichHoat: kichHoat !== undefined ? (kichHoat ? 1 : 0) : banCu.kich_hoat
        });

        const banMoi = banAnModel.timTheoId(banId);

        ghiAuditLog({
            taiKhoanId: nguoiThaoTacId,
            hanhDong: 'CAP_NHAT_BAN_AN',
            bangAnhHuong: 'ban_an',
            banGhiId: banId,
            duLieuCu: banCu,
            duLieuMoi: banMoi,
            lyDo: `Cập nhật thông tin bàn ${banMoi.ten_ban}`
        });

        socketPhat.trangThaiBan({ banId, trangThai: banMoi.trang_thai });

        return banMoi;
    },

    taoBan({ maBan, tenBan, khuVucId, sucChua, tuDongDuyetMon }, nguoiThaoTacId = null) {
        if (!maBan || !tenBan || !khuVucId) {
            const loi = new Error('Mã bàn, tên bàn và khu vực không được để trống');
            loi.status = 400;
            throw loi;
        }

        const banMoi = banAnModel.taoBan({
            maBan: String(maBan).trim(),
            tenBan: String(tenBan).trim(),
            khuVucId: kiemTraKhuVuc(khuVucId),
            sucChua: Number(sucChua) || 4,
            tuDongDuyetMon: tuDongDuyetMon ? 1 : 0
        });

        ghiAuditLog({
            taiKhoanId: nguoiThaoTacId,
            hanhDong: 'THEM_BAN_AN',
            bangAnhHuong: 'ban_an',
            banGhiId: banMoi.id,
            duLieuMoi: banMoi,
            lyDo: `Thêm bàn mới ${banMoi.tenBan} (${banMoi.maBan})`
        });

        return banMoi;
    },

    xoaBan(banId, nguoiThaoTacId = null) {
        const ban = banAnModel.timTheoId(banId);
        if (!ban) {
            const loi = new Error('Không tìm thấy bàn ăn');
            loi.status = 404;
            throw loi;
        }

        if (ban.trang_thai !== 'trong') {
            const loi = new Error(`Bàn ${ban.ten_ban} đang có khách hoặc chờ món, không thể xóa.`);
            loi.status = 400;
            throw loi;
        }

        banAnModel.xoaBan(banId);

        ghiAuditLog({
            taiKhoanId: nguoiThaoTacId,
            hanhDong: 'XOA_BAN_AN',
            bangAnhHuong: 'ban_an',
            banGhiId: banId,
            lyDo: `Xóa/ngừng hoạt động bàn ${ban.ten_ban}`
        });

        return { banId, daXoa: true };
    }
};

module.exports = banAnService;
