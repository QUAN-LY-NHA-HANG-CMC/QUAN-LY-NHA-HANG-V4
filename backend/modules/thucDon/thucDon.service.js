// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// SERVICE NGHIỆP VỤ THỰC ĐƠN, COMBO, SUẤT MÓN & BÁO HẾT MÓN TỨC THÌ (FIGMA C02, K04, A12)
// ============================================================================

const thucDonModel = require('./thucDon.model');
const { layIo } = require('../../cauHinh/cauHinhSocket');
const { ghiAuditLog } = require('../../tienIch/ghiNhatKy');

function kiemTraDanhMuc(id) {
    const ma = Number(id);
    if (!Number.isSafeInteger(ma) || ma <= 0 || !thucDonModel.coDanhMucHoatDong(ma)) {
        throw Object.assign(new Error('Danh mục không còn khả dụng. Hãy chọn hoặc tạo một danh mục.'), { status: 400 });
    }
    return ma;
}

const thucDonService = {
    taoDanhMuc({ maDanhMuc, tenDanhMuc }) {
        const ma = typeof maDanhMuc === 'string' ? maDanhMuc.trim().toUpperCase() : '';
        const ten = typeof tenDanhMuc === 'string' ? tenDanhMuc.trim() : '';
        if (!/^[A-Z0-9_-]{1,20}$/.test(ma) || !ten || ten.length > 100) {
            throw Object.assign(new Error('Nhập mã 1–20 ký tự (chữ không dấu, số, gạch) và tên danh mục tối đa 100 ký tự.'), { status: 400 });
        }
        const danhMuc = thucDonModel.taoDanhMuc(ma, ten);
        if (!danhMuc) throw Object.assign(new Error('Mã danh mục đã tồn tại.'), { status: 409 });
        return danhMuc;
    },
    layThucDonTongThe({ danhMucId, tuKhoa, chiLayConMon }) {
        const danhMuc = thucDonModel.layDanhSachDanhMuc();
        const monAn = thucDonModel.layDanhSachMonAn({ danhMucId, tuKhoa, chiLayConMon });

        // Tách các món nổi bật phục vụ giao diện C02
        const monBanChay = monAn.filter((m) => m.la_ban_chay === 1);
        const monGoiY = monAn.filter((m) => m.la_goi_y === 1);
        const combo = monAn.filter((m) => m.la_combo === 1);

        return {
            danhMuc,
            tatCaMon: monAn,
            monBanChay,
            monGoiY,
            combo
        };
    },

    layChiTietMon(id) {
        const mon = thucDonModel.timTheoId(id);
        if (!mon) {
            const loi = new Error('Không tìm thấy món ăn');
            loi.status = 404;
            throw loi;
        }

        // Nếu là combo, lấy thêm danh sách món thành phần
        if (mon.la_combo === 1) {
            mon.danhSachMonCon = thucDonModel.layChiTietCombo(id);
        }

        return mon;
    },

    /**
     * Bếp báo Còn món / Hết món tức thì (US-K05 & Figma K04)
     */
    doiTrangThaiConMon(monId, conMon, nguoiThaoTacId = null) {
        const mon = thucDonModel.timTheoId(monId);
        if (!mon) {
            const loi = new Error('Không tìm thấy món ăn');
            loi.status = 404;
            throw loi;
        }

        const giaTriConMon = conMon ? 1 : 0;
        thucDonModel.capNhatConMon(monId, giaTriConMon);

        const monCapNhat = thucDonModel.timTheoId(monId);

        // Bắn Socket.io tức thời để khóa/mở nút thêm món trên thiết bị khách hàng & phục vụ
        try {
            const io = layIo();
            io.emit('thuc_don:cap_nhat_con_mon', {
                monId,
                tenMon: mon.ten_mon,
                conMon: giaTriConMon,
                soSuatConLai: monCapNhat ? monCapNhat.so_suat_con_lai : null
            });
        } catch (e) {
            // Không làm gián đoạn nếu socket chưa sẵn sàng
        }

        ghiAuditLog({
            taiKhoanId: nguoiThaoTacId,
            hanhDong: 'CAP_NHAT_CON_MON',
            bangAnhHuong: 'mon_an',
            banGhiId: monId,
            duLieuCu: { con_mon: mon.con_mon },
            duLieuMoi: { con_mon: giaTriConMon },
            lyDo: giaTriConMon === 0 ? `Bếp báo tạm hết món: ${mon.ten_mon}` : `Bếp mở lại món: ${mon.ten_mon}`
        });

        return {
            monId,
            tenMon: mon.ten_mon,
            conMon: giaTriConMon,
            soSuatConLai: monCapNhat ? monCapNhat.so_suat_con_lai : null
        };
    },

    /**
     * Cài đặt & cập nhật số suất còn lại của món ăn trong ngày
     */
    capNhatSoSuat(monId, soSuatConLai, nguoiThaoTacId = null) {
        const monCu = thucDonModel.timTheoId(monId);
        if (!monCu) {
            const loi = new Error('Không tìm thấy món ăn');
            loi.status = 404;
            throw loi;
        }

        const monMoi = thucDonModel.capNhatSoSuat(monId, soSuatConLai);

        // Bắn Socket.io tức thời tới toàn bộ hệ thống (POS, Bếp, E-Menu QR)
        try {
            const io = layIo();
            io.emit('thuc_don:cap_nhat_so_suat', {
                monId,
                tenMon: monMoi.ten_mon,
                soSuatConLai: monMoi.so_suat_con_lai,
                conMon: monMoi.con_mon
            });
        } catch (e) {}

        ghiAuditLog({
            taiKhoanId: nguoiThaoTacId,
            hanhDong: 'CAP_NHAT_SO_SUAT',
            bangAnhHuong: 'mon_an',
            banGhiId: monId,
            duLieuCu: { so_suat_con_lai: monCu.so_suat_con_lai, con_mon: monCu.con_mon },
            duLieuMoi: { so_suat_con_lai: monMoi.so_suat_con_lai, con_mon: monMoi.con_mon },
            lyDo: `Cập nhật số suất món: ${monMoi.ten_mon} thành ${monMoi.so_suat_con_lai !== null ? monMoi.so_suat_con_lai + ' suất' : 'Không giới hạn'}`
        });

        return monMoi;
    },

    /**
     * Quản lý tạo món ăn mới
     */
    taoMonAn(duLieu, nguoiThaoTacId = null) {
        if (!duLieu.tenMon || !duLieu.maMon || duLieu.donGia === undefined) {
            const loi = new Error('Tên món, mã món và đơn giá là bắt buộc');
            loi.status = 400;
            throw loi;
        }

        const monMoi = thucDonModel.taoMonAn({ ...duLieu, danhMucId: kiemTraDanhMuc(duLieu.danhMucId) });

        try {
            const io = layIo();
            io.emit('thuc_don:them_mon_moi', monMoi);
        } catch (e) {}

        ghiAuditLog({
            taiKhoanId: nguoiThaoTacId,
            hanhDong: 'TAO_MON_AN',
            bangAnhHuong: 'mon_an',
            banGhiId: monMoi.id,
            duLieuMoi: monMoi,
            lyDo: `Tạo món ăn mới: ${monMoi.ten_mon}`
        });

        return monMoi;
    },

    /**
     * Quản lý cập nhật thông tin món ăn
     */
    capNhatMonAn(id, duLieu, nguoiThaoTacId = null) {
        const monCu = thucDonModel.timTheoId(id);
        if (!monCu) {
            const loi = new Error('Không tìm thấy món ăn');
            loi.status = 404;
            throw loi;
        }

        const monMoi = thucDonModel.capNhatMonAn(id, duLieu.danhMucId === undefined ? duLieu :
            { ...duLieu, danhMucId: kiemTraDanhMuc(duLieu.danhMucId) });

        try {
            const io = layIo();
            io.emit('thuc_don:cap_nhat_mon', monMoi);
        } catch (e) {}

        ghiAuditLog({
            taiKhoanId: nguoiThaoTacId,
            hanhDong: 'CAP_NHAT_MON_AN',
            bangAnhHuong: 'mon_an',
            banGhiId: id,
            duLieuCu: monCu,
            duLieuMoi: monMoi,
            lyDo: `Cập nhật thông tin món ăn: ${monMoi.ten_mon}`
        });

        return monMoi;
    },

    /**
     * Xóa món ăn khỏi thực đơn (A12)
     */
    xoaMonAn(id, nguoiThaoTacId = null) {
        const monCu = thucDonModel.timTheoId(id);
        if (!monCu) {
            const loi = new Error('Không tìm thấy món ăn');
            loi.status = 404;
            throw loi;
        }

        thucDonModel.xoaMonAn(id);

        try {
            const io = layIo();
            io.emit('thuc_don:xoa_mon', { id, tenMon: monCu.ten_mon });
        } catch (e) {}

        ghiAuditLog({
            taiKhoanId: nguoiThaoTacId,
            hanhDong: 'XOA_MON_AN',
            bangAnhHuong: 'mon_an',
            banGhiId: id,
            duLieuCu: monCu,
            lyDo: `Xóa món ăn khỏi thực đơn: ${monCu.ten_mon}`
        });

        return { id, tenMon: monCu.ten_mon };
    }
};

module.exports = thucDonService;
