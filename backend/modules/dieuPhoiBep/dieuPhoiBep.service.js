// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// SERVICE ĐIỀU PHỐI BẾP KDS (FIGMA K01, K02, K03, K05)
// ============================================================================

const dieuPhoiBepModel = require('./dieuPhoiBep.model');
const { socketPhat } = require('../../cauHinh/cauHinhSocket');
const { ghiAuditLog } = require('../../tienIch/ghiNhatKy');

const dieuPhoiBepService = {
    /**
     * Lấy hàng đợi bếp theo chế độ (theo_ban hoặc gom_mon)
     */
    async layHangDoi(cheDo = 'theo_ban') {
        if (cheDo === 'gom_mon') {
            return dieuPhoiBepModel.layHangDoiGomMon();
        }

        const danhSachMon = dieuPhoiBepModel.layHangDoiTheoBan();
        // Bổ sung phân loại màu sắc cảnh báo thời gian chờ theo Figma K01
        return danhSachMon.map(mon => {
            let mucDoCanhBao = 'binh_thuong'; // < 10 phút: Xanh
            if (mon.so_phut_cho >= 20 || mon.la_uu_tien === 1) {
                mucDoCanhBao = 'tre_han'; // > 20 phút hoặc ưu tiên: Đỏ
            } else if (mon.so_phut_cho >= 10) {
                mucDoCanhBao = 'canh_bao'; // 10-20 phút: Vàng
            }

            return {
                ...mon,
                muc_do_canh_bao: mucDoCanhBao
            };
        });
    },

    /**
     * Lấy các món đã nấu xong trong 60 phút
     */
    async layMonDaHoanThanh(choBung = false) {
        return dieuPhoiBepModel.layMonDaHoanThanh(choBung);
    },

    /**
     * Bếp chuyển trạng thái món: dang_nau, hoan_thanh, da_phuc_vu
     */
    async chuyenTrangThai(chiTietId, trangThaiMoi, dauBepId = null, taiKhoanHienTai = null) {
        const chiTiet = dieuPhoiBepModel.timChiTietTheoId(chiTietId);
        if (!chiTiet) {
            throw new Error('Không tìm thấy chi tiết món ăn trong hàng đợi bếp');
        }

        const dangLamMangVe = chiTiet.lua_chon === 'goi_mang_ve' && chiTiet.buoc === 'bep';
        if (chiTiet.trang_thai_don !== 'da_duyet' || chiTiet.lua_chon === 'khong_lay' ||
            (chiTiet.lua_chon === 'goi_mang_ve' && trangThaiMoi === 'da_phuc_vu') ||
            (chiTiet.trang_thai_phien !== 'dang_hoat_dong' && !dangLamMangVe)) {
            throw new Error('Món chưa được duyệt hoặc phiên bàn đã đóng');
        }
        const trangThaiKeTiep = { cho_duyet: 'dang_nau', dang_nau: 'hoan_thanh', hoan_thanh: 'da_phuc_vu' };
        if (chiTiet.trang_thai_mon === trangThaiMoi) {
            return { chiTietId, trangThaiMoi, tenMon: chiTiet.ten_mon, tenBan: chiTiet.ten_ban };
        }
        if (trangThaiKeTiep[chiTiet.trang_thai_mon] !== trangThaiMoi) {
            throw new Error('Không thể cập nhật món sang trạng thái đã chọn');
        }
        if (!dieuPhoiBepModel.capNhatTienDo(chiTietId, trangThaiMoi, dauBepId, chiTiet.trang_thai_mon).changes) {
            throw new Error('Trạng thái món đã thay đổi. Hãy tải lại danh sách.');
        }

        // Bắn Socket.io tới Phục vụ, Thu ngân và màn hình QR bàn khách
        socketPhat.tienDoMonAn({
            chiTietId,
            banId: chiTiet.ban_an_id,
            tenBan: chiTiet.ten_ban,
            maBan: chiTiet.ma_ban,
            tenMon: chiTiet.ten_mon,
            soLuong: chiTiet.so_luong,
            thoiGian: new Date().toISOString(),
            trangThaiMoi
        });

        // Ghi nhật ký kiểm toán
        if (taiKhoanHienTai) {
            ghiAuditLog({
                taiKhoanId: taiKhoanHienTai.id,
                hanhDong: trangThaiMoi === 'da_phuc_vu' ? 'XAC_NHAN_BUNG_MON' : 'BEP_CAP_NHAT_TRANG_THAI',
                doiTuong: 'chi_tiet_don_mon',
                doiTuongId: chiTietId,
                duLieuMoi: { trangThaiMoi, tenMon: chiTiet.ten_mon, ban: chiTiet.ten_ban }
            });
        }

        return {
            chiTietId,
            trangThaiMoi,
            tenMon: chiTiet.ten_mon,
            tenBan: chiTiet.ten_ban
        };
    },

    /**
     * Bật / tắt cờ ưu tiên khẩn cấp cho món ăn (Figma K01)
     */
    async datLenhUuTien(chiTietId, laUuTien, taiKhoanHienTai = null) {
        const chiTiet = dieuPhoiBepModel.timChiTietTheoId(chiTietId);
        if (!chiTiet) {
            throw new Error('Không tìm thấy chi tiết món ăn');
        }

        dieuPhoiBepModel.datUuTienKhancap(chiTietId, laUuTien);

        // Bắn Socket.io cập nhật hàng đợi KDS
        socketPhat.tienDoMonAn({
            chiTietId,
            banId: chiTiet.ban_an_id,
            tenMon: chiTiet.ten_mon,
            laUuTien: laUuTien ? 1 : 0,
            trangThaiMoi: chiTiet.trang_thai_mon
        });

        if (taiKhoanHienTai) {
            ghiAuditLog({
                taiKhoanId: taiKhoanHienTai.id,
                hanhDong: 'BEP_DAT_UU_TIEN',
                doiTuong: 'chi_tiet_don_mon',
                doiTuongId: chiTietId,
                duLieuMoi: { laUuTien }
            });
        }

        return { chiTietId, laUuTien };
    },

    /**
     * Quản lý phát lệnh điều phối toàn diện (Bếp, Phục vụ, Thu ngân, Tất cả)
     */
    async phatLenhDieuPhoi(duLieu, nguoiDungHienTai = null) {
        if (!duLieu.noiDung || !duLieu.noiDung.trim()) {
            throw new Error('Nội dung chỉ đạo không được để trống');
        }

        const boPhanHopLe = ['bep', 'phuc_vu', 'thu_ngan', 'tat_ca'];
        const boPhan = boPhanHopLe.includes(duLieu.boPhan) ? duLieu.boPhan : 'bep';

        const tenNguoiGui = nguoiDungHienTai?.ho_ten || nguoiDungHienTai?.ten_dang_nhap || 'Quản lý';
        const nguoiGuiId = nguoiDungHienTai?.nhan_vien_id || nguoiDungHienTai?.id || 1;

        const lenhMoi = dieuPhoiBepModel.taoLenhDieuPhoi({
            boPhan,
            banId: duLieu.banId || null,
            maBan: duLieu.maBan || null,
            tenBan: duLieu.tenBan || null,
            monAnId: duLieu.monAnId || null,
            tenMon: duLieu.tenMon || null,
            soLuongMon: duLieu.soLuongMon ? Number(duLieu.soLuongMon) : null,
            mucDo: duLieu.mucDo || 'khan_cap',
            tieuDe: duLieu.tieuDe || `Chỉ đạo từ Quản lý gửi ${boPhan.toUpperCase()}`,
            noiDung: duLieu.noiDung.trim(),
            nguoiGuiId,
            tenNguoiGui
        });

        // Phát Socket.io realtime ngay lập tức tới Bếp, Phục vụ, Thu ngân
        socketPhat.dieuPhoiQuanLy({
            id: lenhMoi.id,
            boPhan: lenhMoi.bo_phan,
            banId: lenhMoi.ban_id,
            maBan: lenhMoi.ma_ban,
            tenBan: lenhMoi.ten_ban,
            monAnId: lenhMoi.mon_an_id,
            tenMon: lenhMoi.ten_mon,
            soLuongMon: lenhMoi.so_luong_mon,
            mucDo: lenhMoi.muc_do,
            tieuDe: lenhMoi.tieu_de,
            noiDung: lenhMoi.noi_dung,
            tenNguoiGui: lenhMoi.ten_nguoi_gui,
            thoiGian: new Date().toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })
        });

        if (nguoiDungHienTai) {
            ghiAuditLog({
                taiKhoanId: nguoiDungHienTai.id,
                hanhDong: 'QUAN_LY_PHAT_LENH_DIEU_PHOI',
                doiTuong: 'lenh_dieu_phoi',
                doiTuongId: lenhMoi.id,
                duLieuMoi: lenhMoi
            });
        }

        return lenhMoi;
    },

    /**
     * Lấy danh sách lịch sử lệnh điều phối gần đây
     */
    async layLichSuLenh(boPhan = null) {
        return dieuPhoiBepModel.layDanhSachLenhDieuPhoi(boPhan);
    },

    /**
     * Nhân sự (Bếp, Phục vụ, Thu ngân) xác nhận đã tiếp nhận lệnh điều phối
     */
    async xacNhanTiepNhan(lenhId, nguoiDungHienTai = null) {
        const lenh = dieuPhoiBepModel.timLenhTheoId(lenhId);
        if (!lenh) {
            throw new Error(`Không tìm thấy lệnh điều phối #${lenhId}`);
        }
        if (lenh.bo_phan !== 'tat_ca' && ![lenh.bo_phan, 'quan_ly'].includes(nguoiDungHienTai?.vaiTro)) {
            throw new Error('Chỉ đạo không thuộc bộ phận của bạn');
        }

        const tenNguoiNhan = nguoiDungHienTai?.ho_ten || nguoiDungHienTai?.ten_dang_nhap || 'Nhân viên';
        const nguoiNhanId = nguoiDungHienTai?.nhan_vien_id || nguoiDungHienTai?.id || null;

        const ketQua = dieuPhoiBepModel.xacNhanTiepNhanLenh(lenhId, {
            nguoiTiepNhanId: nguoiNhanId,
            boPhan: nguoiDungHienTai?.vaiTro,
            tenNguoiTiepNhan: tenNguoiNhan
        });

        // Bắn Socket.io báo cho Quản lý biết đã tiếp nhận
        socketPhat.xacNhanDieuPhoi({
            id: lenhId,
            tenNguoiTiepNhan: tenNguoiNhan,
            boPhan: lenh.bo_phan,
            tenBan: lenh.ten_ban,
            tenMon: lenh.ten_mon,
            thoiGianTiepNhan: new Date().toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })
        });

        return ketQua;
    }
};

module.exports = dieuPhoiBepService;
