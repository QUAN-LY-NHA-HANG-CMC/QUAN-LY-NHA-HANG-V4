// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// SERVICE CA LÀM VIỆC & ĐỔI CA / NGHỈ PHÉP (FIGMA W11, A07)
// ============================================================================

const caLamViecModel = require('./caLamViec.model');
const { socketPhat } = require('../../cauHinh/cauHinhSocket');
const { ghiAuditLog } = require('../../tienIch/ghiNhatKy');
const { truyVanMot, truyVanNhieu, chayGiaoDich } = require('../../cauHinh/ketNoiCoSoDuLieu');

const DINH_DANG_NGAY = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
const homNay = () => DINH_DANG_NGAY.format(new Date());
const GHI_CHU_CA_TU_DONG = 'Ca toàn thời gian tự động';
// Cùng loại ca và khung giờ mặc định với form phân ca thủ công.
const CA_MAC_DINH = { tenCa: 'ca_toi', gioBatDau: '17:00', gioKetThuc: '22:30' };

function boSungLichToanThoiGian(tuNgay, denNgay, nhanVienId = null) {
    if (tuNgay > denNgay) return;
    chayGiaoDich(() => caLamViecModel.taoLichToanThoiGian(tuNgay, denNgay, CA_MAC_DINH, GHI_CHU_CA_TU_DONG, nhanVienId));
}

function khungCa(ca) {
    const moc = gio => Date.parse(ca.ngay_lam + 'T' + (gio.length === 5 ? gio + ':00' : gio) + '+07:00');
    const batDau = moc(ca.gio_bat_dau);
    const ketThuc = moc(ca.gio_ket_thuc);
    return [batDau, ketThuc < batDau ? ketThuc + 86400000 : ketThuc];
}
function coTheVaoCa(ca, bayGio = Date.now()) {
    const [batDau, ketThuc] = khungCa(ca);
    return bayGio >= batDau && bayGio < ketThuc;
}
function xacNhanVaoCa(ca) {
    if (!coTheVaoCa(ca)) throw new Error('Chỉ được xác nhận vào ca trong khung giờ đã phân.');
    if (!caLamViecModel.capNhatTrangThaiCa(ca.id, 'da_checkin', 'ke_hoach').changes)
        throw new Error('Ca làm việc không còn ở trạng thái kế hoạch.');
    return caLamViecModel.timCaTheoId(ca.id);
}

const caLamViecService = {
    layDongNghiep(nhanVienId) {
        if (!nhanVienId) return [];
        return truyVanNhieu(`SELECT n.id,n.ho_ten FROM nhan_vien n
            JOIN tai_khoan t ON t.id=n.tai_khoan_id JOIN tai_khoan t0 ON t0.id=(
                SELECT tai_khoan_id FROM nhan_vien WHERE id=?)
            WHERE n.id!=? AND n.trang_thai='dang_lam' AND t.trang_thai='hoat_dong'
            AND t.vai_tro_id=t0.vai_tro_id ORDER BY n.ho_ten`, [nhanVienId, nhanVienId]);
    },
    trangThaiCa(nhanVienId) {
        const thoiGianMayChu = Date.now();
        if (!nhanVienId) return { caDangLam: null, thoiGianMayChu };
        const nv = truyVanMot("SELECT id FROM nhan_vien WHERE id=? AND trang_thai='dang_lam'", [nhanVienId]);
        if (!nv) return { caDangLam: null, thoiGianMayChu };
        const ngay = homNay();
        const homQua = DINH_DANG_NGAY.format(new Date(thoiGianMayChu - 86400000));
        const ca = caLamViecModel.layLichTheoNhanVien(nhanVienId, homQua, ngay);
        const caDangLam = ca.find(muc => muc.trang_thai === 'da_checkin' && coTheVaoCa(muc, thoiGianMayChu)) || null;
        return { caDangLam, thoiGianMayChu };
    },

    async vaoCaTuDong(nhanVienId) {
        if (!nhanVienId) throw new Error('Tài khoản không gắn với hồ sơ nhân viên.');
        const { caDangLam, thoiGianMayChu } = this.trangThaiCa(nhanVienId);
        if (caDangLam) return caDangLam;
        const ngay = homNay();
        boSungLichToanThoiGian(ngay, ngay, nhanVienId);
        const ca = caLamViecModel.layLichTheoNhanVien(nhanVienId, ngay, ngay)
            .find(muc => muc.ghi_chu === GHI_CHU_CA_TU_DONG &&
                muc.trang_thai === 'ke_hoach' && coTheVaoCa(muc, thoiGianMayChu));
        if (!ca) throw new Error('Chưa đến giờ hoặc không có ca tự động để xác nhận.');
        return this.checkinCa(ca.id, nhanVienId);
    },
    /**
     * Lấy lịch làm việc của nhân viên (W11)
     */
    async layLichNhanVien(nhanVienId, tuNgay, denNgay) {
        if (!nhanVienId) {
            throw new Error('Vui lòng chỉ định nhân viên');
        }
        const ngay = homNay();
        const cuoiTuan = new Date(ngay + 'T00:00:00Z');
        cuoiTuan.setUTCDate(cuoiTuan.getUTCDate() + (7 - cuoiTuan.getUTCDay()) % 7);
        boSungLichToanThoiGian(ngay, cuoiTuan.toISOString().slice(0, 10), nhanVienId);
        return caLamViecModel.layLichTheoNhanVien(nhanVienId, tuNgay, denNgay);
    },

    /**
     * Quản lý xem toàn bộ lịch làm việc
     */
    async layToanBoLich(tuNgay, denNgay) {
        const mauNgay = /^\d{4}-\d{2}-\d{2}$/;
        if (typeof tuNgay === 'string' && typeof denNgay === 'string' &&
            mauNgay.test(tuNgay) && mauNgay.test(denNgay)) {
            const ngayDau = tuNgay < homNay() ? homNay() : tuNgay;
            boSungLichToanThoiGian(ngayDau, denNgay);
        }
        return caLamViecModel.layToanBoLich(tuNgay, denNgay);
    },

    /**
     * Tạo mới ca làm việc (Xếp lịch)
     */
    async taoCaLamViec({ nhanVienId, ngayLam, tenCa, gioBatDau, gioKetThuc, ghiChu }, taiKhoanHienTai = null) {
        if (!nhanVienId || !ngayLam || !tenCa || !gioBatDau || !gioKetThuc) {
            throw new Error('Thiếu thông tin ca làm việc bắt buộc');
        }

        const caId = caLamViecModel.taoCa({
            nhanVienId,
            ngayLam,
            tenCa,
            gioBatDau,
            gioKetThuc,
            ghiChu
        });

        if (taiKhoanHienTai) {
            ghiAuditLog({
                taiKhoanId: taiKhoanHienTai.id,
                hanhDong: 'TAO_CA_LAM_VIEC',
                doiTuong: 'ca_lam_viec',
                doiTuongId: caId,
                duLieuMoi: { nhanVienId, ngayLam, tenCa }
            });
        }

        return caLamViecModel.timCaTheoId(caId);
    },

    /**
     * Cập nhật thông tin ca làm việc (Quản lý)
     */
    async capNhatCaLamViec(id, duLieu, taiKhoanHienTai = null) {
        const ca = caLamViecModel.timCaTheoId(id);
        if (!ca) {
            throw new Error('Không tìm thấy ca làm việc');
        }
        caLamViecModel.capNhatCa(id, duLieu);

        if (taiKhoanHienTai) {
            ghiAuditLog({
                taiKhoanId: taiKhoanHienTai.id,
                hanhDong: 'CAP_NHAT_CA_LAM_VIEC',
                doiTuong: 'ca_lam_viec',
                doiTuongId: id,
                duLieuMoi: duLieu
            });
        }
        return caLamViecModel.timCaTheoId(id);
    },

    /**
     * Xóa ca làm việc (Quản lý)
     */
    async xoaCaLamViec(id, taiKhoanHienTai = null) {
        const ca = caLamViecModel.timCaTheoId(id);
        if (!ca) {
            throw new Error('Không tìm thấy ca làm việc cần xóa');
        }
        if (ca.ghi_chu === GHI_CHU_CA_TU_DONG && ca.ngay_lam >= homNay()) {
            caLamViecModel.huyCaTuDong(id);
        } else {
            caLamViecModel.xoaCa(id);
        }

        if (taiKhoanHienTai) {
            ghiAuditLog({
                taiKhoanId: taiKhoanHienTai.id,
                hanhDong: 'XOA_CA_LAM_VIEC',
                doiTuong: 'ca_lam_viec',
                doiTuongId: id,
                lyDo: `Xóa ca ${ca.ten_ca} ngày ${ca.ngay_lam} của nhân viên ${ca.ten_nhan_vien}`
            });
        }
        return true;
    },

    /**
     * Nhân viên điểm danh vào ca (Check-in)
     */
    async checkinCa(caId, nhanVienId) {
        const ca = caLamViecModel.timCaTheoId(caId);
        if (!ca) {
            throw new Error('Không tìm thấy ca làm việc');
        }
        if (ca.nhan_vien_id !== nhanVienId) {
            throw new Error('Ca làm việc này không được phân công cho bạn');
        }
        if (ca.trang_thai !== 'ke_hoach') {
            throw new Error(`Không thể điểm danh ca đang ở trạng thái "${ca.trang_thai}"`);
        }

        return chayGiaoDich(() => {
            const hienTai = caLamViecModel.timCaTheoId(caId);
            if (hienTai?.nhan_vien_id !== nhanVienId) throw new Error('Ca làm việc không còn thuộc về bạn.');
            if (this.trangThaiCa(nhanVienId).caDangLam) throw new Error('Bạn đã xác nhận một ca đang diễn ra.');
            return xacNhanVaoCa(hienTai);
        });
    },

    /**
     * Nhân viên kết thúc ca (Check-out)
     */
    async checkoutCa(caId, nhanVienId) {
        const ca = caLamViecModel.timCaTheoId(caId);
        if (!ca) {
            throw new Error('Không tìm thấy ca làm việc');
        }
        if (ca.nhan_vien_id !== nhanVienId) {
            throw new Error('Ca làm việc này không được phân công cho bạn');
        }
        if (ca.trang_thai !== 'da_checkin') {
            throw new Error('Ca làm việc chưa được check-in');
        }

        caLamViecModel.capNhatTrangThaiCa(caId, 'da_hoan_thanh', 'da_checkin');
        return caLamViecModel.timCaTheoId(caId);
    },

    /**
     * Lấy danh sách yêu cầu đổi ca / xin nghỉ
     */
    async layDanhSachYeuCauDoiCa({ trangThai, nhanVienId } = {}) {
        return caLamViecModel.layDanhSachYeuCau({ trangThai, nhanVienId });
    },

    /**
     * Nhân viên gửi yêu cầu xin nghỉ / đổi ca (Figma W11 & US-W09)
     */
    async taoYeuCauDoiCa({ nhanVienYeuCauId, caLamViecId, loaiYeuCau, nhanVienNhanCaId = null, lyDo }) {
        if (!nhanVienYeuCauId || !caLamViecId || !loaiYeuCau || !lyDo) {
            throw new Error('Vui lòng điền đầy đủ thông tin: ca làm, loại yêu cầu và lý do');
        }

        const ca = caLamViecModel.timCaTheoId(caLamViecId);
        if (!ca) {
            throw new Error('Không tìm thấy ca làm việc chỉ định');
        }

        if (ca.nhan_vien_id !== nhanVienYeuCauId) {
            throw new Error('Bạn không thể tạo yêu cầu cho ca làm việc của người khác');
        }

        if (loaiYeuCau === 'doi_ca' && !nhanVienNhanCaId) {
            throw new Error('Đổi ca bắt buộc phải chọn nhân viên nhận ca');
        }

        if (loaiYeuCau === 'doi_ca' && nhanVienNhanCaId === nhanVienYeuCauId) {
            throw new Error('Không thể đổi ca cho chính mình');
        }
        if (loaiYeuCau === 'doi_ca' && !this.layDongNghiep(nhanVienYeuCauId).some(nv => nv.id === nhanVienNhanCaId)) {
            throw new Error('Người nhận ca phải đang hoạt động và cùng bộ phận.');
        }

        const yeuCauId = caLamViecModel.taoYeuCauDoiCa({
            nhanVienYeuCauId,
            caLamViecId,
            loaiYeuCau,
            nhanVienNhanCaId,
            lyDo
        });

        const chiTietYc = caLamViecModel.timYeuCauTheoId(yeuCauId);

        // Bắn Socket thông báo Quản lý có yêu cầu đổi ca mới (US-W09)
        socketPhat.yeuCauDoiCaMoi({
            yeuCauId,
            loaiYeuCau,
            nhanVienYeuCau: chiTietYc.ten_nhan_vien_yeu_cau,
            nhanVienNhanCa: chiTietYc.ten_nhan_vien_nhan_ca,
            ngayLam: chiTietYc.ngay_lam,
            tenCa: chiTietYc.ten_ca,
            lyDo
        });

        return chiTietYc;
    },

    /**
     * Quản lý phê duyệt hoặc từ chối yêu cầu đổi ca (Figma A07)
     */
    async pheDuyetYeuCau(id, { trangThai, quanLyId, ghiChuDuyet }, taiKhoanHienTai = null) {
        if (!['da_duyet', 'tu_choi'].includes(trangThai)) {
            throw new Error('Trạng thái phê duyệt không hợp lệ (chỉ chấp nhận da_duyet hoặc tu_choi)');
        }

        const yeuCau = caLamViecModel.timYeuCauTheoId(id);
        if (!yeuCau) {
            throw new Error('Không tìm thấy yêu cầu đổi ca');
        }

        if (yeuCau.trang_thai !== 'cho_duyet') {
            throw new Error(`Yêu cầu này đã được xử lý trước đó với trạng thái: ${yeuCau.trang_thai}`);
        }

        caLamViecModel.pheDuyetYeuCau(id, {
            trangThai,
            quanLyDuyetId: quanLyId,
            ghiChuDuyet
        });

        // Bắn Socket thông báo cho Nhân viên biết kết quả duyệt
        socketPhat.ketQuaDuyetCa({
            yeuCauId: id,
            trangThai,
            loaiYeuCau: yeuCau.loai_yeu_cau,
            nhanVienYeuCauId: yeuCau.nhan_vien_yeu_cau_id,
            nhanVienNhanCaId: yeuCau.nhan_vien_nhan_ca_id,
            ghiChuDuyet
        });

        if (taiKhoanHienTai) {
            ghiAuditLog({
                taiKhoanId: taiKhoanHienTai.id,
                hanhDong: 'PHE_DUYET_DOI_CA',
                doiTuong: 'yeu_cau_doi_ca',
                doiTuongId: id,
                duLieuMoi: { trangThai, ghiChuDuyet }
            });
        }

        return caLamViecModel.timYeuCauTheoId(id);
    }
};

module.exports = caLamViecService;
