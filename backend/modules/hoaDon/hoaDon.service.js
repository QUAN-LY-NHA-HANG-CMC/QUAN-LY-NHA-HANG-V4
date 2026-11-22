// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// SERVICE XỬ LÝ HÓA ĐƠN & KẾ TOÁN THU NGÂN (FIGMA P01, P02, P03, P04, P05, C09, C10)
// ============================================================================

const { randomUUID } = require('node:crypto');
const hoaDonModel = require('./hoaDon.model');
const banAnModel = require('../banAn/banAn.model');
const { chayGiaoDich, thucThi } = require('../../cauHinh/ketNoiCoSoDuLieu');
const { socketPhat } = require('../../cauHinh/cauHinhSocket');
const { ghiAuditLog } = require('../../tienIch/ghiNhatKy');
const cauHinh = require('../../cauHinh/cauHinhChung');

const heThongModel = require('../heThong/heThong.model');

function taoVietQr(soTien, noiDung) {
    const config = heThongModel.layCauHinhNhaHang();
    const nganHang = config?.ngan_hang_vietqr?.trim();
    const soTaiKhoan = config?.so_tai_khoan_vietqr?.replace(/\s/g, '');
    const tenChuTaiKhoan = config?.ten_chu_tai_khoan_vietqr?.trim();
    if ((cauHinh.moiTruong === 'production' && ['0123456789', '0071000888999', '102872394829'].includes(soTaiKhoan)) ||
        !/^[a-z0-9]+$/i.test(nganHang || '') || !/^\d+$/.test(soTaiKhoan || '') || !tenChuTaiKhoan) {
        return null;
    }
    const query = new URLSearchParams({ amount: soTien, addInfo: noiDung, accountName: tenChuTaiKhoan });
    return {
        nganHang, soTaiKhoan, tenChuTaiKhoan, soTien, noiDung,
        qrUrl: `https://img.vietqr.io/image/${nganHang}-${soTaiKhoan}-compact2.png?${query}`
    };
}

function chuanHoaMon(cacMon) {
    return cacMon.map(mon => [mon.mon_an_id, mon.don_gia, mon.so_luong ?? mon.tong_so_luong].join(':'))
        .sort().join(',');
}

const hoaDonService = {
    /**
     * Lấy danh sách hóa đơn theo bộ lọc
     */
    async layDanhSachHoaDon(boLoc = {}) {
        return hoaDonModel.layDanhSach(boLoc);
    },

    /**
     * Lấy chi tiết hóa đơn theo ID kèm các món
     */
    async layChiTietHoaDon(hoaDonId) {
        const hoaDon = hoaDonModel.timTheoId(hoaDonId);
        if (!hoaDon) {
            throw new Error('Không tìm thấy hóa đơn');
        }
        const danhSachMon = hoaDonModel.layChiTietHoaDon(hoaDonId);
        const chiaTien = hoaDonModel.layChiaTienNhom(hoaDonId);

        return {
            ...hoaDon,
            danhSachMon,
            chiaTien,
            vietQr: hoaDon.trang_thai === 'chua_thanh_toan' && !hoaDonModel.lyDoChanThu(hoaDon.phien_ban_id)
                ? taoVietQr(hoaDon.tong_tien_thanh_toan, `MOC HD ${hoaDon.ma_hoa_don}`) : null
        };
    },

    /**
     * Tính tạm tính cho bàn ăn (Figma P02, C09)
     */
    async layTamTinhTheoBan(banId, chietKhau = 0) {
        const phienBan = banAnModel.layPhienBanHienTai(banId);
        if (!phienBan) {
            throw new Error('Bàn ăn hiện không có phiên hoạt động nào');
        }

        const ban = banAnModel.timTheoId(banId);
        const danhSachMon = hoaDonModel.layMonThucTeCuaPhien(phienBan.id);

        let tongTienMon = 0;
        danhSachMon.forEach(m => {
            tongTienMon += m.tong_thanh_tien;
        });

        const phanTramChietKhau = Math.round(Math.max(0, Math.min(100, Number(chietKhau) || 0)));
        const tienChietKhau = Math.round((tongTienMon * phanTramChietKhau) / 100);
        const phanTramVat = heThongModel.layCauHinhNhaHang()?.phan_tram_vat ?? cauHinh.vatMacDinh;
        const tienVat = Math.round(((tongTienMon - tienChietKhau) * phanTramVat) / 100);
        const tongTienThanhToan = tongTienMon - tienChietKhau + tienVat;
        const lyDoChanThu = hoaDonModel.lyDoChanThu(phienBan.id);

        return {
            banId,
            tenBan: ban.ten_ban,
            maBan: ban.ma_ban,
            phienBanId: phienBan.id,
            danhSachMon,
            tongTienMon,
            phanTramChietKhau,
            tienChietKhau,
            phanTramVat,
            tienVat,
            tongTienThanhToan,
            lyDoChanThu,
            vietQr: lyDoChanThu ? null : taoVietQr(tongTienThanhToan, `MOC BAN ${ban.ma_ban}`)
        };
    },

    /**
     * Tạo hóa đơn từ phiên bàn đang hoạt động
     */
    async taoHoaDonTuPhienBan(banId, thuNganId = null, { phanTramChietKhau = 0, ghiChu = '', phuongThuc = 'tien_mat' } = {}) {
        const phienBan = banAnModel.layPhienBanHienTai(banId);
        if (!phienBan) {
            throw new Error('Bàn không có phiên hoạt động');
        }
        const lyDo = hoaDonModel.lyDoChanThu(phienBan.id);
        if (lyDo) throw Object.assign(new Error(lyDo), { status: 409 });

        const ban = banAnModel.timTheoId(banId);
        const danhSachMon = hoaDonModel.layMonThucTeCuaPhien(phienBan.id);
        if (danhSachMon.length === 0) {
            throw new Error('Bàn chưa có món ăn nào được duyệt để xuất hóa đơn');
        }

        // Kiểm tra xem đã có hóa đơn chưa thanh toán chưa
        const hoaDonTonTai = hoaDonModel.timTheoPhienBan(phienBan.id);

        let tongTienMon = 0;
        danhSachMon.forEach(m => {
            tongTienMon += m.tong_thanh_tien;
        });

        const chietKhau = Math.round(Math.max(0, Math.min(100, Number(phanTramChietKhau) || 0)));
        const tienChietKhau = Math.round((tongTienMon * chietKhau) / 100);
        const phanTramVat = heThongModel.layCauHinhNhaHang()?.phan_tram_vat ?? cauHinh.vatMacDinh;
        const tienVat = Math.round(((tongTienMon - tienChietKhau) * phanTramVat) / 100);
        const tongTienThanhToan = tongTienMon - tienChietKhau + tienVat;

        if (hoaDonTonTai?.phan_tram_chiet_khau === chietKhau && hoaDonTonTai.phan_tram_vat === phanTramVat &&
            chuanHoaMon(hoaDonModel.layChiTietHoaDon(hoaDonTonTai.id)) === chuanHoaMon(danhSachMon)) {
            return this.layChiTietHoaDon(hoaDonTonTai.id);
        }
        const maHoaDon = `MOC_${ban.ma_ban}_${randomUUID().slice(0, 8).toUpperCase()}`;

        const hoaDonId = hoaDonModel.taoHoaDon({
            phienBanId: phienBan.id,
            thayTheHoaDonId: hoaDonTonTai?.id ?? null,
            maHoaDon,
            thuNganId,
            tongTienMon,
            phanTramChietKhau: chietKhau,
            tienChietKhau,
            phanTramVat,
            tienVat,
            tongTienThanhToan,
            phuongThucThanhToan: phuongThuc,
            ghiChu,
            danhSachMon: danhSachMon.map(m => ({
                mon_an_id: m.mon_an_id,
                ten_mon: m.ten_mon,
                don_gia: m.don_gia,
                so_luong: m.tong_so_luong
            }))
        });

        return this.layChiTietHoaDon(hoaDonId);
    },

    /**
     * Xác nhận thanh toán hóa đơn (Figma P04)
     * Đảm bảo tính toán toàn vẹn tài chính, cập nhật trạng thái bàn, đóng phiên, ghi sổ cái
     */
    async xacNhanThanhToan(hoaDonId, {
        phuongThucThanhToan = 'tien_mat',
        tienKhachDua = 0,
        maGiaoDichNganHang = null,
        thuNganId = null,
        caLamViecId = null,
        ghiChu = null
    } = {}, taiKhoanHienTai = null) {
        const hoaDon = hoaDonModel.timTheoId(hoaDonId);
        if (!hoaDon) {
            throw new Error('Không tìm thấy hóa đơn cần thanh toán');
        }

        if (hoaDon.trang_thai === 'da_thanh_toan') {
            throw new Error('Hóa đơn này đã được thanh toán trước đó');
        }

        if (!['tien_mat', 'vietqr'].includes(phuongThucThanhToan)) {
            throw new Error('Phương thức thanh toán không được hỗ trợ');
        }
        const tongPhaiTra = hoaDon.tong_tien_thanh_toan;
        let tienThucDua = Number(tienKhachDua);

        if (phuongThucThanhToan === 'tien_mat') {
            if (!Number.isSafeInteger(tienThucDua) || tienThucDua < tongPhaiTra) {
                throw new Error(`Tiền khách đưa (${tienThucDua.toLocaleString()}đ) không đủ thanh toán tổng hóa đơn (${tongPhaiTra.toLocaleString()}đ)`);
            }
        } else {
            tienThucDua = tongPhaiTra;
        }

        const tienThoiLai = tienThucDua - tongPhaiTra;

        // Thực thi giao dịch nguyên khối (ACID)
        chayGiaoDich((db) => {
            const phien = banAnModel.layPhienBanHienTai(hoaDon.ban_an_id);
            if (phien?.id !== hoaDon.phien_ban_id) {
                throw Object.assign(new Error('Phiên bàn đã thay đổi. Hãy kiểm tra lại hóa đơn.'), { status: 409 });
            }
            const lyDo = hoaDonModel.lyDoChanThu(phien.id);
            if (lyDo) throw Object.assign(new Error(lyDo), { status: 409 });
            const hienTai = hoaDonModel.layMonThucTeCuaPhien(phien.id);
            const chiTiet = hoaDonModel.layChiTietHoaDon(hoaDonId);
            if (chuanHoaMon(hienTai) !== chuanHoaMon(chiTiet)) {
                throw Object.assign(new Error('Danh sách món đã thay đổi. Hãy kiểm tra lại hóa đơn.'), { status: 409 });
            }
            // 1. Cập nhật hóa đơn
            const capNhatHd = db.prepare(`
                UPDATE hoa_don 
                SET trang_thai = 'da_thanh_toan',
                    phuong_thuc_thanh_toan = ?,
                    tien_khach_dua = ?,
                    tien_thoi_lai = ?,
                    ma_giao_dich_vietqr = ?,
                    thu_ngan_id = COALESCE(?, thu_ngan_id),
                    thoi_gian_thanh_toan = CURRENT_TIMESTAMP,
                    ghi_chu = COALESCE(?, ghi_chu)
                WHERE id = ? AND trang_thai = 'chua_thanh_toan'
            `);
            const capNhat = capNhatHd.run(
                phuongThucThanhToan,
                tienThucDua,
                tienThoiLai,
                maGiaoDichNganHang,
                thuNganId,
                ghiChu,
                hoaDonId
            );

            if (!capNhat.changes) throw new Error('Hóa đơn đã được xử lý');

            // 2. Đóng phiên bàn ăn
            const dongPhien = db.prepare(`
                UPDATE phien_ban 
                SET trang_thai = 'da_dong',
                    thoi_gian_ket_thuc = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
            dongPhien.run(hoaDon.phien_ban_id);

            // 3. Chuyển trạng thái bàn sang 'can_don_dep' (Figma B08 -> Chờ dọn dẹp)
            const capNhatBan = db.prepare(`
                UPDATE ban_an 
                SET trang_thai = 'can_don_dep',
                    ngay_cap_nhat = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
            capNhatBan.run(hoaDon.ban_an_id);

            // 4. Ghi nhận giao dịch tài chính vào bảng giao_dich_thanh_toan
            const chenGiaoDich = db.prepare(`
                INSERT INTO giao_dich_thanh_toan (
                    hoa_don_id, ca_lam_viec_id, so_tien, phuong_thuc,
                    ma_giao_dich_ngan_hang, noi_dung_chuyen_khoan, trang_thai
                ) VALUES (?, ?, ?, ?, ?, ?, 'thanh_cong')
            `);
            if (tongPhaiTra > 0) chenGiaoDich.run(
                hoaDonId,
                caLamViecId,
                tongPhaiTra,
                phuongThucThanhToan === 'tien_mat' ? 'TIEN_MAT' : 'VIETQR',
                maGiaoDichNganHang || `GD_${Date.now()}`,
                `THANH TOAN ${hoaDon.ma_hoa_don}`
            );
        });

        // Bắn Socket.io thông báo thanh toán thành công
        socketPhat.thanhToanThanhCong({
            hoaDonId,
            phienBanId: hoaDon.phien_ban_id,
            maHoaDon: hoaDon.ma_hoa_don,
            banId: hoaDon.ban_an_id,
            tenBan: hoaDon.ten_ban,
            tongTienThanhToan: tongPhaiTra,
            phuongThucThanhToan,
            tienThoiLai
        });

        // Báo trạng thái bàn mới
        socketPhat.trangThaiBan({
            banId: hoaDon.ban_an_id,
            tenBan: hoaDon.ten_ban,
            trangThai: 'can_don_dep'
        });

        // Ghi nhật ký kiểm toán
        if (taiKhoanHienTai) {
            ghiAuditLog({
                taiKhoanId: taiKhoanHienTai.id,
                hanhDong: 'XAC_NHAN_THANH_TOAN',
                doiTuong: 'hoa_don',
                doiTuongId: hoaDonId,
                duLieuMoi: {
                    maHoaDon: hoaDon.ma_hoa_don,
                    tongTien: tongPhaiTra,
                    phuongThuc: phuongThucThanhToan
                }
            });
        }

        return {
            hoaDonId,
            maHoaDon: hoaDon.ma_hoa_don,
            tongTienThanhToan: tongPhaiTra,
            tienKhachDua: tienThucDua,
            tienThoiLai,
            phuongThucThanhToan,
            trangThai: 'da_thanh_toan'
        };
    },

    /**
     * Chia tiền nhóm (Figma C10, P06)
     */
    async taoChiaTienNhom(hoaDonId, soNguoiChia) {
        const soNguoi = Number(soNguoiChia);
        if (!Number.isSafeInteger(soNguoi) || soNguoi < 2 || soNguoi > 100) {
            throw new Error('Số người chia hóa đơn phải từ 2 đến 100');
        }

        const hoaDon = hoaDonModel.timTheoId(hoaDonId);
        if (!hoaDon) {
            throw new Error('Không tìm thấy hóa đơn');
        }

        const soTienMoiNguoi = Math.floor(hoaDon.tong_tien_thanh_toan / soNguoi);
        const soPhanThemMotDong = hoaDon.tong_tien_thanh_toan % soNguoi;
        if (soTienMoiNguoi <= 0) throw new Error('Số tiền mỗi phần phải lớn hơn 0');
        const maThamChieu = `CHIA_${hoaDon.ma_hoa_don}_N${soNguoi}`;

        hoaDonModel.taoChiaTienNhom({
            hoaDonId,
            soNguoiChia: soNguoi,
            soTienMoiNguoi,
            maThamChieuQr: maThamChieu
        });

        const qrUrl = soPhanThemMotDong === 0 ? taoVietQr(soTienMoiNguoi, maThamChieu)?.qrUrl ?? null : null;

        return {
            hoaDonId,
            tongTien: hoaDon.tong_tien_thanh_toan,
            soNguoiChia: soNguoi,
            soTienMoiNguoi,
            soPhanThemMotDong,
            maThamChieu,
            qrUrl
        };
    }
};

module.exports = hoaDonService;
