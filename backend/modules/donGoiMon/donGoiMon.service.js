// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// SERVICE NGHIỆP VỤ TẠO ĐƠN GỌI MÓN, DUYỆT ĐƠN QR VÀ YÊU CẦU HỦY MÓN
// ============================================================================

const { randomUUID, createHash } = require('node:crypto');
const { layGio, capNhatGioTrongGiaoDich } = require('../banAn/gioMonBan');
const cauHinh = require('../../cauHinh/cauHinhChung');
const donGoiMonModel = require('./donGoiMon.model');
const banAnModel = require('../banAn/banAn.model');
const thucDonModel = require('../thucDon/thucDon.model');
const { chayGiaoDich, truyVanMot, truyVanNhieu, thucThi } = require('../../cauHinh/ketNoiCoSoDuLieu');
const { layIo, socketPhat } = require('../../cauHinh/cauHinhSocket');
const { ghiAuditLog } = require('../../tienIch/ghiNhatKy');

function hoanSuatMon(monId, soLuong) {
    thucThi(`UPDATE mon_an SET so_suat_con_lai = so_suat_con_lai + ?
        WHERE id = ? AND so_suat_con_lai IS NOT NULL`, [soLuong, monId]);
}

const TRANG_THAI_CO_THE_HUY = ['cho_duyet', 'dang_nau', 'hoan_thanh', 'da_phuc_vu'];
const loiNghiepVu = (msg, status = 409) => Object.assign(new Error(msg), { status });

function timMonConPhien(chiTietId) {
    return truyVanMot(`SELECT ct.*, p.ban_an_id, p.id AS phien_id, d.thiet_bi_tao_id
        FROM chi_tiet_don_mon ct JOIN don_goi_mon d ON d.id = ct.don_goi_mon_id
        JOIN phien_ban p ON p.id = d.phien_ban_id
        WHERE ct.id = ? AND p.trang_thai = 'dang_hoat_dong'`, [chiTietId]);
}

function huyMonTrongGiaoDich(mon, nhanVienId, lyDo) {
    if (truyVanMot("SELECT 1 FROM xu_ly_mon_pos WHERE chi_tiet_id=? AND lua_chon IN ('goi_mang_ve','khong_lay')", [mon.id]))
        throw loiNghiepVu('Thu ngân đã ghi nhận cách xử lý món này.');
    const trangThai = mon.trang_thai_mon;
    if (!TRANG_THAI_CO_THE_HUY.includes(trangThai)) throw loiNghiepVu('Món đã hủy hoặc đang chờ duyệt hủy.');
    if (trangThai === 'cho_duyet') {
        thucThi("UPDATE chi_tiet_don_mon SET trang_thai_mon = 'da_huy' WHERE id = ?", [mon.id]);
        hoanSuatMon(mon.mon_an_id, mon.so_luong);
        thucThi(`UPDATE don_goi_mon SET trang_thai='da_huy' WHERE id=? AND trang_thai='cho_duyet'
            AND NOT EXISTS (SELECT 1 FROM chi_tiet_don_mon WHERE don_goi_mon_id=? AND trang_thai_mon NOT IN ('da_huy','huy_mon'))`,
        [mon.don_goi_mon_id, mon.don_goi_mon_id]);
        return null;
    }
    const phieu = thucThi(`INSERT INTO yeu_cau_huy_mon
        (chi_tiet_don_mon_id, nhan_vien_yeu_cau_id, ly_do_huy, trang_thai_yeu_cau, trang_thai_mon_cu)
        VALUES (?, ?, ?, 'cho_admin_duyet', ?)`, [mon.id, nhanVienId, lyDo, trangThai]);
    thucThi("UPDATE chi_tiet_don_mon SET trang_thai_mon='yeu_cau_huy' WHERE id=?", [mon.id]);
    return Number(phieu.lastInsertRowid);
}

function quyetDinhHuyCuaKhach(id, nhanVienId, chapNhan, phieuQuanLyId = null) {
    thucThi(`UPDATE yeu_cau_huy_mon_khach SET trang_thai=?, nhan_vien_xu_ly_id=?, phieu_quan_ly_id=?, xu_ly_luc=CURRENT_TIMESTAMP
        WHERE id=? AND trang_thai='cho_phuc_vu'`, [chapNhan ? 'da_xu_ly' : 'tu_choi', nhanVienId, phieuQuanLyId, id]);
}

function thongBaoHuyMon(mon, phieuQuanLyId, lyDo) {
    socketPhat.tienDoMonAn({ banId: mon.ban_an_id, chiTietId: mon.id, trangThaiMoi: phieuQuanLyId ? 'yeu_cau_huy' : 'da_huy' });
    if (phieuQuanLyId) {
        socketPhat.yeuCauHuyMonThayDoi();
        layIo().to('quan_ly').emit('co_yeu_cau_huy_mon', {
            yeuCauId: phieuQuanLyId, chiTietDonMonId: mon.id, lyDoHuy: lyDo, thoiGian: new Date()
        });
    }
    return { huyNgay: !phieuQuanLyId, yeuCauId: phieuQuanLyId };
}

const donGoiMonService = {
    /**
     * Khách quét QR hoặc Phục vụ đặt món
     */
    taoDonGoiMon({ maQrToken, banId, danhSachMon, nguonTao = 'khach_qr', nhanVienTaoId = null, khoaGui = null, phienSuaGio = null, thietBi = null }) {
        if (!thietBi && (!Array.isArray(danhSachMon) || danhSachMon.length === 0 || danhSachMon.length > cauHinh.soMonToiDaMoiLanGoi)) {
            const loi = new Error('Danh sách món phải có từ 1 đến 30 dòng');
            loi.status = 400;
            throw loi;
        }

        // 1. Xác định bàn ăn
        let ban = null;
        if (maQrToken) {
            ban = banAnModel.timTheoQrToken(maQrToken);
        }
        if (!ban && banId) {
            ban = banAnModel.timTheoId(banId);
        }

        if (!ban?.kich_hoat) {
            const loi = new Error('Không tìm thấy bàn ăn tương ứng');
            loi.status = 404;
            throw loi;
        }

        if (khoaGui != null && (typeof khoaGui !== 'string' || !/^[a-z0-9-]{16,80}$/i.test(khoaGui))) {
            throw Object.assign(new Error('Mã gửi đơn không hợp lệ'), { status: 400 });
        }
        if (thietBi && (!khoaGui || !Number.isSafeInteger(phienSuaGio))) {
            throw Object.assign(new Error('Thiếu mã gửi hoặc phiên bản giỏ món.'), { status: 400 });
        }
        if (thietBi && danhSachMon !== undefined) {
            throw Object.assign(new Error('Đơn QR chỉ gửi các món thuộc thiết bị trong giỏ chung.'), { status: 400 });
        }
        if (thietBi) khoaGui = createHash('sha256').update(thietBi.id + ':' + khoaGui).digest('hex');
        const ketQua = chayGiaoDich((db) => {
            if (thietBi && banAnModel.layPhienBanHienTai(ban.id)?.id !== thietBi.phien_ban_id) {
                throw Object.assign(new Error('Phiên bàn đã thay đổi.'), { status: 409 });
            }
            if (khoaGui) {
                const cu = db.prepare(`SELECT d.id AS donGoiMonId, d.ma_don AS maDon, d.trang_thai AS trangThai,
                    d.phien_ban_id AS phienBanId, pb.ban_an_id AS banId
                    FROM don_goi_mon d JOIN phien_ban pb ON pb.id = d.phien_ban_id WHERE d.khoa_gui = ?`).get(khoaGui);
                if (cu) {
                    if (cu.banId !== ban.id) throw Object.assign(new Error('Mã gửi đơn đã dùng'), { status: 409 });
                    return { ...cu, daGui: true };
                }
            }
            const gio = thietBi ? layGio(ban.id) : null;
            if (gio) {
                const monCuaToi = gio.mon.filter(mon => mon.chu === thietBi.id);
                if (gio.phienSua !== phienSuaGio || !monCuaToi.length) {
                    throw Object.assign(new Error('Giỏ món đã thay đổi. Vui lòng kiểm tra lại trước khi gửi.'), { status: 409 });
                }
                danhSachMon = monCuaToi.map(mon => ({ monAnId: mon.id, soLuong: mon.so_luong, ghiChu: mon.ghi_chu }));
            }
            const banMoi = banAnModel.timTheoId(ban.id);
            if (!banMoi?.kich_hoat) throw Object.assign(new Error('Bàn đã ngừng hoạt động'), { status: 409 });
            if (banMoi.trang_thai === 'can_don_dep') {
                throw Object.assign(new Error('Bàn đang chờ dọn. Vui lòng liên hệ nhân viên.'), { status: 409 });
            }

            // 2. Tìm hoặc tự động tạo phiên bàn (Shared Table Session)
            let phienBan = db.prepare(`
                SELECT id, ma_phien FROM phien_ban 
                WHERE ban_an_id = ? AND trang_thai = 'dang_hoat_dong';
            `).get(ban.id);

            if (!phienBan) {
                // Khách mới vào tự quét mã QR đặt món -> tự động mở phiên bàn
                const maPhien = `PB_${ban.ma_ban}_${Date.now()}`;
                const resPhien = db.prepare(`
                    INSERT INTO phien_ban (ban_an_id, ma_phien, so_luong_khach, trang_thai)
                    VALUES (?, ?, 2, 'dang_hoat_dong');
                `).run(ban.id, maPhien);

                phienBan = {
                    id: resPhien.lastInsertRowid,
                    ma_phien: maPhien
                };

                // Cập nhật trạng thái bàn sang "co_khach"
                db.prepare(`UPDATE ban_an SET trang_thai = 'co_khach', ngay_cap_nhat = CURRENT_TIMESTAMP WHERE id = ?`).run(ban.id);
            }

            // 3. Kiểm tra tính hợp lệ & tình trạng còn món (con_mon) của từng món
            const danhSachMonChuan = [];
            const tongSuatTheoMon = new Map();
            for (const item of danhSachMon) {
                const mon = thucDonModel.timTheoId(Number(item?.monAnId) || 0);
                if (!mon?.kich_hoat) {
                    throw Object.assign(new Error('Món ăn không tồn tại trong thực đơn'), { status: 400 });
                }
                if (mon.con_mon === 0) {
                    throw new Error(`Món [${mon.ten_mon}] hiện tại bếp đã báo hết. Vui lòng chọn món khác.`);
                }
                const soLuong = Number(item.soLuong);
                if (!Number.isSafeInteger(soLuong) || soLuong < 1 || soLuong > 100) {
                    throw Object.assign(new Error('Số lượng món phải là số nguyên từ 1 đến 100'), { status: 400 });
                }
                const tongSuat = (tongSuatTheoMon.get(mon.id) || 0) + soLuong;
                tongSuatTheoMon.set(mon.id, tongSuat);
                if (mon.so_suat_con_lai !== null && mon.so_suat_con_lai !== undefined) {
                    if (mon.so_suat_con_lai < tongSuat) {
                        throw new Error(`Món [${mon.ten_mon}] chỉ còn ${mon.so_suat_con_lai} suất, không đủ ${tongSuat} suất yêu cầu. Vui lòng giảm số lượng hoặc chọn món khác.`);
                    }
                }
                danhSachMonChuan.push({
                    monAnId: mon.id,
                    tenMon: mon.ten_mon,
                    donGia: mon.don_gia, // Snapshot giá niêm yết
                    soLuong,
                    soSuatConLai: mon.so_suat_con_lai,
                    ghiChu: item.ghiChu ? String(item.ghiChu).trim().slice(0, 300) : null
                });
            }

            // 4. Xác định chế độ duyệt đơn: Tự động duyệt (gửi thẳng bếp) hay chờ nhân viên phục vụ duyệt
            const tuDongDuyet = ban.tu_dong_duyet_mon === 1 || nguonTao === 'phuc_vu_dat_ho';
            const trangThaiDon = tuDongDuyet ? 'da_duyet' : 'cho_duyet';
            const trangThaiMonBanDau = 'cho_duyet';

            const maDon = `DGM_${ban.ma_ban}_${randomUUID().slice(0, 8)}`;
            const resDon = db.prepare(`
                INSERT INTO don_goi_mon (phien_ban_id, ma_don, nguon_tao, nhan_vien_tao_id, trang_thai, thoi_gian_duyet, khoa_gui, thiet_bi_tao_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            `).run(
                phienBan.id,
                maDon,
                nguonTao,
                nhanVienTaoId,
                trangThaiDon,
                tuDongDuyet ? new Date().toISOString() : null,
                khoaGui,
                thietBi?.id ?? null
            );

            const donGoiMonId = resDon.lastInsertRowid;

            // 5. Thêm chi tiết từng món vào CSDL
            const stmtCT = db.prepare(`
                INSERT INTO chi_tiet_don_mon (
                    don_goi_mon_id, mon_an_id, so_luong, don_gia, ghi_chu,
                    trang_thai_mon, thoi_gian_bat_dau_nau
                ) VALUES (?, ?, ?, ?, ?, ?, ?);
            `);

            for (const item of danhSachMonChuan) {
                stmtCT.run(
                    donGoiMonId,
                    item.monAnId,
                    item.soLuong,
                    item.donGia,
                    item.ghiChu,
                    trangThaiMonBanDau,
                    null
                );

                // Tự động trừ số suất còn lại của món ăn trong ngày (nếu có giới hạn suất)
                if (item.soSuatConLai !== null && item.soSuatConLai !== undefined) {
                    db.prepare(`
                        UPDATE mon_an 
                        SET so_suat_con_lai = MAX(0, so_suat_con_lai - ?),
                            con_mon = CASE WHEN (so_suat_con_lai - ?) <= 0 THEN 0 ELSE 1 END,
                            ngay_cap_nhat = CURRENT_TIMESTAMP
                        WHERE id = ?;
                    `).run(item.soLuong, item.soLuong, item.monAnId);
                }
            }

            // Cập nhật trạng thái bàn sang "cho_mon"
            db.prepare(`UPDATE ban_an SET trang_thai = 'cho_mon', ngay_cap_nhat = CURRENT_TIMESTAMP WHERE id = ?`).run(ban.id);

            if (gio) capNhatGioTrongGiaoDich(ban.id, Number(phienBan.id), gio.phienSua, gio.mon.filter(mon => mon.chu !== thietBi.id));
            return {
                donGoiMonId: Number(donGoiMonId),
                maDon,
                banId: ban.id,
                tenBan: ban.ten_ban,
                phienBanId: Number(phienBan.id),
                trangThai: trangThaiDon,
                soLuongMon: danhSachMonChuan.length,
                monDaCapNhat: [...tongSuatTheoMon.keys()]
            };
        });
        if (ketQua.daGui) return ketQua;
        if (phienSuaGio != null) socketPhat.gioMonThayDoi(ban.id);
        const { monDaCapNhat, ...don } = ketQua;
        socketPhat.donHangMoi({ ...don, nguonTao, trangThaiDon: don.trangThai, soMon: don.soLuongMon });
        socketPhat.trangThaiBan({ banId: ban.id, trangThai: 'cho_mon' });
        for (const monId of monDaCapNhat) {
            const mon = thucDonModel.timTheoId(monId);
            if (mon.so_suat_con_lai == null) continue;
            socketPhat.capNhatSoSuat({ monId, tenMon: mon.ten_mon, soSuatConLai: mon.so_suat_con_lai, conMon: mon.con_mon });
        }
        return don;
    },

    /**
     * Lấy danh sách món ăn đang phục vụ theo bàn
     */
    layMonTheoBan(banId, thietBiId = null) {
        const phien = truyVanMot(`SELECT id, ma_phien, so_luong_khach FROM phien_ban WHERE ban_an_id = ? AND trang_thai = 'dang_hoat_dong'`, [banId]);
        if (!phien) {
            return {
                coPhien: false,
                phienBan: null,
                danhSachMon: []
            };
        }

        const danhSachMon = donGoiMonModel.layChiTietMonTheoPhien(phien.id).map(
            ({ thiet_bi_tao_id, id_yeu_cau_huy_khach, ly_do_huy_khach, trang_thai_huy_khach, ly_do_quan_ly_tu_choi_huy, ...mon }) => {
                if (!thietBiId) return { ...mon, id_yeu_cau_huy_khach, ly_do_huy_khach, trang_thai_huy_khach, ly_do_quan_ly_tu_choi_huy };
                if (thiet_bi_tao_id !== thietBiId) return { ...mon, coQuyenYeuCauHuy: false };
                return {
                    ...mon, trang_thai_huy_khach,
                    coQuyenYeuCauHuy: !mon.xu_ly_pos && TRANG_THAI_CO_THE_HUY.includes(mon.trang_thai_mon) &&
                        trang_thai_huy_khach !== 'cho_phuc_vu'
                };
            });
        return {
            coPhien: true,
            phienBan: phien,
            danhSachMon
        };
    },

    /**
     * Lấy danh sách đơn QR đang chờ duyệt (Figma W04)
     */
    layDonChoDuyet() {
        return donGoiMonModel.layDonChoDuyet();
    },

    /**
     * Phục vụ bấm DUYỆT đơn QR (US-W04 & Figma W04)
     */
    duyetDonQR(donId, nhanVienDuyetId) {
        const don = donGoiMonModel.timTheoId(donId);
        if (!don) {
            const loi = new Error('Không tìm thấy đơn đặt món');
            loi.status = 404;
            throw loi;
        }

        if (don.trang_thai !== 'cho_duyet') {
            const loi = new Error(`Đơn đặt món hiện tại đang [${don.trang_thai}], không thể duyệt lại`);
            loi.status = 400;
            throw loi;
        }

        chayGiaoDich(() => {
            const capNhat = donGoiMonModel.capNhatTrangThaiDon(donId, 'da_duyet', nhanVienDuyetId);
            if (!capNhat.changes) throw new Error('Đơn đã được xử lý');
        });

        // Bắn Socket thông báo xuống Bếp KDS và thiết bị khách hàng
        socketPhat.tienDoMonAn({
            donGoiMonId: donId,
            banId: don.ban_an_id,
            trangThaiDon: 'da_duyet',
            trangThaiMon: 'cho_duyet'
        });

        ghiAuditLog({
            taiKhoanId: nhanVienDuyetId,
            hanhDong: 'DUYET_DON_QR',
            bangAnhHuong: 'don_goi_mon',
            banGhiId: donId,
            lyDo: `Phục vụ bấm duyệt đơn món ${don.ma_don} cho bàn ${don.ten_ban}`
        });

        return { donId, trangThai: 'da_duyet' };
    },

    /**
     * Phục vụ TỪ CHỐI đơn QR (US-W04 & Figma W05)
     */
    tuChoiDonQR(donId, nhanVienDuyetId, lyDoTuChoi) {
        const don = donGoiMonModel.timTheoId(donId);
        if (!don) {
            const loi = new Error('Không tìm thấy đơn đặt món');
            loi.status = 404;
            throw loi;
        }

        chayGiaoDich(() => {
            const capNhat = donGoiMonModel.capNhatTrangThaiDon(donId, 'tu_choi', nhanVienDuyetId, lyDoTuChoi);
            if (!capNhat.changes) throw Object.assign(new Error('Đơn đã được xử lý'), { status: 409 });
            const monCanTra = truyVanNhieu(`SELECT mon_an_id, SUM(so_luong) AS so_luong FROM chi_tiet_don_mon
                WHERE don_goi_mon_id = ? AND trang_thai_mon = 'cho_duyet' GROUP BY mon_an_id`, [donId]);
            for (const mon of monCanTra) hoanSuatMon(mon.mon_an_id, mon.so_luong);
            donGoiMonModel.capNhatTrangThaiMonTheoDon(donId, 'da_huy');
            thucThi(`UPDATE yeu_cau_huy_mon_khach SET trang_thai='da_xu_ly', nhan_vien_xu_ly_id=?, xu_ly_luc=CURRENT_TIMESTAMP
                WHERE trang_thai='cho_phuc_vu' AND chi_tiet_don_mon_id IN (SELECT id FROM chi_tiet_don_mon WHERE don_goi_mon_id=?)`,
            [nhanVienDuyetId, donId]);
        });

        socketPhat.donHangMoi({
            donGoiMonId: donId,
            banId: don.ban_an_id,
            trangThaiDon: 'tu_choi',
            lyDoTuChoi
        });

        return { donId, trangThai: 'tu_choi', lyDo: lyDoTuChoi };
    },

    guiYeuCauHuyCuaKhach(thietBi, chiTietId, lyDo) {
        if (typeof lyDo !== 'string' || !lyDo.trim() || lyDo.trim().length > 300)
            throw loiNghiepVu('Nhập lý do hủy từ 1 đến 300 ký tự.', 400);
        const ketQua = chayGiaoDich(() => {
            const mon = timMonConPhien(chiTietId);
            if (mon?.phien_id !== thietBi.phien_ban_id || mon?.thiet_bi_tao_id !== thietBi.id)
                throw loiNghiepVu('Chỉ thiết bị đã đặt món này mới được yêu cầu hủy.', 403);
            if (!TRANG_THAI_CO_THE_HUY.includes(mon.trang_thai_mon)) throw loiNghiepVu('Món đã hủy hoặc đang chờ duyệt hủy.');
            if (truyVanMot("SELECT 1 FROM xu_ly_mon_pos WHERE chi_tiet_id=? AND lua_chon IN ('goi_mang_ve','khong_lay')", [chiTietId]))
                throw loiNghiepVu('Thu ngân đã ghi nhận cách xử lý món này.');
            const cu = truyVanMot("SELECT id FROM yeu_cau_huy_mon_khach WHERE chi_tiet_don_mon_id=? AND trang_thai='cho_phuc_vu'", [chiTietId]);
            const id = cu?.id ?? Number(thucThi(`INSERT INTO yeu_cau_huy_mon_khach
                (chi_tiet_don_mon_id, ly_do, trang_thai) VALUES (?, ?, 'cho_phuc_vu')`, [chiTietId, lyDo.trim()]).lastInsertRowid);
            return { id, banId: mon.ban_an_id, trangThai: 'cho_phuc_vu' };
        });
        socketPhat.tienDoMonAn({ banId: ketQua.banId, chiTietId });
        return ketQua;
    },

    xuLyHuyCuaKhach({ banId, yeuCauId, nhanVienId, chapNhan }) {
        if (!nhanVienId || typeof chapNhan !== 'boolean') throw loiNghiepVu('Quyết định hủy không hợp lệ.', 400);
        const { mon, phieuQuanLyId, lyDo } = chayGiaoDich(() => {
            const phieu = truyVanMot("SELECT * FROM yeu_cau_huy_mon_khach WHERE id=? AND trang_thai='cho_phuc_vu'", [yeuCauId]);
            const mon = phieu && timMonConPhien(phieu.chi_tiet_don_mon_id);
            if (!mon || mon.ban_an_id !== banId) throw loiNghiepVu('Yêu cầu không thuộc bàn này hoặc đã được xử lý.');
            const phieuQuanLyId = chapNhan ? huyMonTrongGiaoDich(mon, nhanVienId, phieu.ly_do) : null;
            quyetDinhHuyCuaKhach(phieu.id, nhanVienId, chapNhan, phieuQuanLyId);
            return { mon, phieuQuanLyId, lyDo: phieu.ly_do };
        });
        if (chapNhan) return thongBaoHuyMon(mon, phieuQuanLyId, lyDo);
        socketPhat.tienDoMonAn({ banId, chiTietId: mon.id, trangThaiMoi: mon.trang_thai_mon });
        return { huyNgay: false, tuChoi: true };
    },

    yeuCauHuyMon({ chiTietDonMonId, nhanVienYeuCauId, lyDoHuy, chonChiTiet }) {
        if (!chiTietDonMonId || !nhanVienYeuCauId || typeof lyDoHuy !== 'string' || !lyDoHuy.trim())
            throw loiNghiepVu('Vui lòng chọn món cần hủy và nhập lý do giải trình.', 400);
        const { mon, phieuQuanLyId } = chayGiaoDich(() => {
            if (chonChiTiet) chiTietDonMonId = chonChiTiet().id;
            const mon = timMonConPhien(chiTietDonMonId);
            if (!mon) throw loiNghiepVu('Không tìm thấy dòng món ăn cần hủy.', 404);
            const phieuQuanLyId = huyMonTrongGiaoDich(mon, nhanVienYeuCauId, lyDoHuy.trim());
            const phieu = truyVanMot("SELECT id FROM yeu_cau_huy_mon_khach WHERE chi_tiet_don_mon_id=? AND trang_thai='cho_phuc_vu'", [mon.id]);
            if (phieu) quyetDinhHuyCuaKhach(phieu.id, nhanVienYeuCauId, true, phieuQuanLyId);
            return { mon, phieuQuanLyId };
        });
        return {
            ...thongBaoHuyMon(mon, phieuQuanLyId, lyDoHuy.trim()),
            msg: phieuQuanLyId ? 'Đã gửi yêu cầu hủy món lên Quản lý (Đang chờ duyệt)' : 'Đã hủy món chưa nấu'
        };
    }
};

module.exports = donGoiMonService;
