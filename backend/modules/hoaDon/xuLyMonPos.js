const { truyVanNhieu, truyVanMot, thucThi, chayGiaoDich } = require('../../cauHinh/ketNoiCoSoDuLieu');
const { socketPhat } = require('../../cauHinh/cauHinhSocket');
const dieuPhoiBan = require('../banAn/dieuPhoiBan');

const CHUA_BUNG = ['cho_duyet', 'dang_nau', 'hoan_thanh'];
const GIAI_QUYET = ['goi_mang_ve', 'khong_lay'];
const sqlMon = `
    SELECT c.id, c.mon_an_id, c.so_luong, c.don_gia, c.trang_thai_mon, m.ten_mon, m.don_vi_tinh,
           d.trang_thai AS trang_thai_don, p.id AS phien_ban_id, p.trang_thai AS trang_thai_phien,
           p.ban_an_id, b.ten_ban, x.lua_chon, x.buoc, x.ghi_chu, x.uu_tien, x.nguoi_gui_id,
           EXISTS(SELECT 1 FROM yeu_cau_huy_mon_khach h
               WHERE h.chi_tiet_don_mon_id=c.id AND h.trang_thai='cho_phuc_vu') AS cho_phuc_vu_huy
    FROM chi_tiet_don_mon c JOIN don_goi_mon d ON d.id=c.don_goi_mon_id
    JOIN phien_ban p ON p.id=d.phien_ban_id JOIN ban_an b ON b.id=p.ban_an_id
    JOIN mon_an m ON m.id=c.mon_an_id LEFT JOIN xu_ly_mon_pos x ON x.chi_tiet_id=c.id
`;

function loi(msg, status = 409) {
    return Object.assign(new Error(msg), { status });
}

function ghi(muc, nguoi, hanhDong, duLieu = {}) {
    thucThi(`INSERT INTO nhat_ky_kiem_toan
        (tai_khoan_id, hanh_dong, bang_anh_huong, ban_ghi_id, du_lieu_moi, ly_do)
        VALUES (?, ?, 'chi_tiet_don_mon', ?, ?, ?)`, [
        nguoi.id, hanhDong, muc.id, JSON.stringify({
            banId: muc.ban_an_id, phienBanId: muc.phien_ban_id, tenMon: muc.ten_mon,
            soLuong: muc.so_luong, trangThaiMon: muc.trang_thai_mon, ...duLieu
        }), `${muc.ten_ban} · ${muc.ten_mon} × ${muc.so_luong}`
    ]);
}

function thongBao() {
    socketPhat.xuLyMonPosThayDoi();
    socketPhat.viecBanThayDoi();
    socketPhat.nhatKyThayDoi();
}

function chonHuy(banId, id, trangThai, soLuong, soLuongHienTai, ghiChu, nguoi) {
    if (typeof ghiChu !== 'string' || !ghiChu.trim() || ghiChu.length > 300)
        throw loi('Nhập lý do hủy từ 1 đến 300 ký tự.', 400);
    const ketQua = require('../donGoiMon/donGoiMon.service').yeuCauHuyMon({
        chiTietDonMonId: id, nhanVienYeuCauId: nguoi.nhanVienId, lyDoHuy: ghiChu,
        chonChiTiet: () => {
            const muc = chonSoLuong(banId, id, trangThai, soLuong, soLuongHienTai);
            ghi(muc, nguoi, 'POS_CHON_XU_LY_MON', { luaChon: 'huy', ghiChu: ghiChu.trim() });
            return muc;
        }
    });
    thongBao();
    return ketQua;
}

function layMon(phienId) {
    return truyVanNhieu(sqlMon + ' WHERE p.id=? ORDER BY c.id', [phienId]);
}

function lyDoChanDong(phienId) {
    const mon = layMon(phienId).find(muc => muc.trang_thai_don === 'da_duyet' &&
        CHUA_BUNG.includes(muc.trang_thai_mon) && !GIAI_QUYET.includes(muc.lua_chon));
    return mon ? `Cần xử lý món chưa bưng trước khi đóng bàn: ${mon.ten_mon} × ${mon.so_luong}.` : null;
}

function kiemTraMon(banId, id, trangThai) {
    const muc = truyVanMot(sqlMon + ' WHERE c.id=? AND p.ban_an_id=?', [id, banId]);
    if (!muc || muc.trang_thai_phien !== 'dang_hoat_dong' || muc.trang_thai_don !== 'da_duyet' ||
        !CHUA_BUNG.includes(muc.trang_thai_mon) || muc.trang_thai_mon !== trangThai ||
        muc.cho_phuc_vu_huy || GIAI_QUYET.includes(muc.lua_chon)) {
        throw loi('Món đã thay đổi hoặc đang được xử lý. Hãy tải lại hóa đơn.');
    }
    return muc;
}

function chonSoLuong(banId, id, trangThai, soLuong, soLuongHienTai) {
    const muc = kiemTraMon(banId, id, trangThai);
    if (soLuongHienTai !== undefined && muc.so_luong !== soLuongHienTai)
        throw loi('Số lượng đã thay đổi. Hãy tải lại hóa đơn.');
    const sl = soLuong ?? muc.so_luong;
    if (!Number.isSafeInteger(sl) || sl < 1 || sl > muc.so_luong)
        throw loi('Số lượng món không còn hợp lệ.');
    if (sl === muc.so_luong) return muc;
    if (muc.lua_chon === 'xac_nhan_bung')
        throw loi('Hãy chờ phục vụ kiểm tra xong trước khi chia số lượng.');
    const moi = thucThi(`INSERT INTO chi_tiet_don_mon
        (don_goi_mon_id,mon_an_id,so_luong,don_gia,ghi_chu,trang_thai_mon,la_uu_tien,
        thoi_gian_bat_dau_nau,thoi_gian_hoan_thanh_nau,thoi_gian_phuc_vu,dau_bep_id,ngay_tao,ngay_cap_nhat)
        SELECT don_goi_mon_id,mon_an_id,?,don_gia,ghi_chu,trang_thai_mon,la_uu_tien,
        thoi_gian_bat_dau_nau,thoi_gian_hoan_thanh_nau,thoi_gian_phuc_vu,dau_bep_id,ngay_tao,CURRENT_TIMESTAMP
        FROM chi_tiet_don_mon WHERE id=?`, [sl, id]);
    thucThi('UPDATE chi_tiet_don_mon SET so_luong=so_luong-?, ngay_cap_nhat=CURRENT_TIMESTAMP WHERE id=?', [sl, id]);
    return { ...muc, id: Number(moi.lastInsertRowid), so_luong: sl, lua_chon: null };
}

function chon(banId, id, { trangThai, luaChon, soLuong, soLuongHienTai, ghiChu = '', uuTien = false }, nguoi) {
    if (![...GIAI_QUYET, 'dung_tai_ban', 'xac_nhan_bung'].includes(luaChon) ||
        typeof ghiChu !== 'string' || ghiChu.length > 300) throw loi('Lựa chọn không hợp lệ.', 400);
    chayGiaoDich(() => {
        const muc = chonSoLuong(banId, id, trangThai, soLuong, soLuongHienTai);
        if (luaChon === 'xac_nhan_bung' && trangThai !== 'hoan_thanh')
            throw loi('Chỉ có thể nhờ xác nhận món đã nấu xong.');
        if (muc.lua_chon === luaChon) return;
        const buoc = { goi_mang_ve: 'bep', xac_nhan_bung: 'phuc_vu',
            khong_lay: trangThai === 'hoan_thanh' ? 'xong' : 'bep', dung_tai_ban: 'xong' }[luaChon];
        const coUuTien = luaChon === 'goi_mang_ve' && uuTien === true && trangThai !== 'hoan_thanh';
        thucThi(`INSERT INTO xu_ly_mon_pos (chi_tiet_id, lua_chon, buoc, nguoi_gui_id, ghi_chu, uu_tien)
            VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(chi_tiet_id) DO UPDATE SET
            lua_chon=excluded.lua_chon, buoc=excluded.buoc, nguoi_gui_id=excluded.nguoi_gui_id,
            ghi_chu=excluded.ghi_chu, uu_tien=excluded.uu_tien, ngay_tao=CURRENT_TIMESTAMP`,
        [muc.id, luaChon, buoc, nguoi.id, ghiChu.trim(), Number(coUuTien)]);
        if (coUuTien) thucThi('UPDATE chi_tiet_don_mon SET la_uu_tien=1 WHERE id=?', [muc.id]);
        ghi(muc, nguoi, 'POS_CHON_XU_LY_MON', { luaChon, buoc, ghiChu: ghiChu.trim(), uuTien: coUuTien });
    });
    thongBao();
}

function coQuyen(muc, nguoi) {
    if (nguoi.vaiTro === 'quan_ly') return muc.buoc === 'thu_ngan' && muc.nguoi_gui_id === nguoi.id;
    if (muc.buoc !== nguoi.vaiTro) return false;
    if (nguoi.vaiTro === 'thu_ngan') return muc.nguoi_gui_id === nguoi.id;
    if (nguoi.vaiTro !== 'phuc_vu') return true;
    return dieuPhoiBan.layPhongNhan(muc.ban_an_id).includes('nhan_vien_' + nguoi.nhanVienId);
}

function danhSach(nguoi) {
    return truyVanNhieu(sqlMon + ` WHERE x.buoc=? AND c.trang_thai_mon NOT IN ('da_huy','huy_mon','yeu_cau_huy')
        AND (x.lua_chon!='xac_nhan_bung' OR (c.trang_thai_mon='hoan_thanh' AND p.trang_thai='dang_hoat_dong'))
        ORDER BY x.uu_tien DESC,x.ngay_tao,c.id`, [nguoi.vaiTro === 'quan_ly' ? 'thu_ngan' : nguoi.vaiTro])
        .filter(muc => coQuyen(muc, nguoi));
}

async function xacNhan(id, { buoc, daBung }, nguoi) {
    const muc = danhSach(nguoi).find(mon => mon.id === id && mon.buoc === buoc);
    if (!muc) throw loi('Chỉ đạo đã thay đổi hoặc không còn được giao cho bạn.');
    if (muc.lua_chon === 'goi_mang_ve' && buoc === 'bep' && muc.trang_thai_mon !== 'hoan_thanh')
        throw loi('Hãy hoàn tất chế biến trước khi xác nhận đã gói.');
    if (muc.lua_chon === 'xac_nhan_bung' && typeof daBung !== 'boolean') throw loi('Cần xác nhận kết quả kiểm tra.', 400);
    if (muc.lua_chon === 'xac_nhan_bung' && daBung) {
        dieuPhoiBan.kiemTraNguoiNhan(nguoi, 'bung_mon', id);
        await require('../dieuPhoiBep/dieuPhoiBep.service').chuyenTrangThai(id, 'da_phuc_vu', null, nguoi);
    }
    chayGiaoDich(() => {
        const keTiep = muc.lua_chon === 'goi_mang_ve' ? { bep: 'phuc_vu', phuc_vu: 'thu_ngan', thu_ngan: 'xong' }[buoc] : 'xong';
        if (!thucThi('UPDATE xu_ly_mon_pos SET buoc=? WHERE chi_tiet_id=? AND buoc=? AND lua_chon=?',
            [keTiep, id, buoc, muc.lua_chon]).changes) throw loi('Chỉ đạo đã được xử lý.');
        ghi(muc, nguoi, 'POS_XAC_NHAN_CHI_DAO_MON', { luaChon: muc.lua_chon, buoc, keTiep, daBung });
        if (muc.lua_chon === 'xac_nhan_bung' && !daBung)
            thucThi('DELETE FROM xu_ly_mon_pos WHERE chi_tiet_id=?', [id]);
    });
    thongBao();
}

module.exports = { layMon, lyDoChanDong, chonHuy, chon, danhSach, xacNhan };
