const { truyVanMot, thucThi, chayGiaoDich } = require('../../cauHinh/ketNoiCoSoDuLieu');
const thucDonModel = require('../thucDon/thucDon.model');
const banAnModel = require('./banAn.model');

function layGio(banId) {
    const phien = banAnModel.layPhienBanHienTai(banId);
    const duLieu = truyVanMot(`SELECT *, ngay_cap_nhat < DATETIME('now', '-2 hours') AS het_han
        FROM gio_mon_ban WHERE ban_an_id = ?`, [banId]);
    const hopLe = duLieu && !duLieu.het_han && duLieu.phien_ban_id === (phien?.id ?? null);
    return {
        banId,
        phienId: phien?.id ?? null,
        phienSua: duLieu?.phien_ban_sua ?? 0,
        mon: hopLe ? JSON.parse(duLieu.mon).filter(mon => mon.chu && mon.dongId) : []
    };
}

function capNhatGioTrongGiaoDich(banId, phienId, phienSua, mon) {
    thucThi(`INSERT INTO gio_mon_ban (ban_an_id, phien_ban_id, phien_ban_sua, mon)
        VALUES (?, ?, ?, ?) ON CONFLICT(ban_an_id) DO UPDATE SET phien_ban_id = excluded.phien_ban_id,
        phien_ban_sua = excluded.phien_ban_sua, mon = excluded.mon, ngay_cap_nhat = CURRENT_TIMESTAMP`,
        [banId, phienId, phienSua + 1, JSON.stringify(mon)]);
    return { banId, phienId, phienSua: phienSua + 1, mon };
}

function gioChoThietBi(gio, thietBiId) {
    return { ...gio, mon: gio.mon.map(({ chu, ...mon }) => ({ ...mon, cuaToi: chu === thietBiId })) };
}

function suaGio(banId, thietBi, { phienSua, phienId, dongId, monId, soLuong, ghiChu, congThem, thayDoi }) {
    const laBuoc = thayDoi !== undefined;
    if (!Number.isSafeInteger(phienSua) || (dongId == null && !Number.isSafeInteger(monId)) ||
        (laBuoc ? ![-1, 1].includes(thayDoi) : !Number.isSafeInteger(soLuong) || soLuong < 0 || soLuong > 100) ||
        (ghiChu != null && (typeof ghiChu !== 'string' || ghiChu.length > 300))) {
        throw Object.assign(new Error('Thông tin giỏ món không hợp lệ'), { status: 400 });
    }
    return chayGiaoDich(() => {
        const ban = banAnModel.timTheoId(banId);
        if (ban?.trang_thai === 'can_don_dep') {
            throw Object.assign(new Error('Bàn đang chờ dọn'), { status: 409 });
        }
        const gio = layGio(banId);
        if (gio.phienId !== thietBi.phien_ban_id || gio.phienId !== phienId || (!laBuoc && gio.phienSua !== phienSua)) {
            throw Object.assign(new Error('Giỏ vừa thay đổi trên một thiết bị khác. Vui lòng kiểm tra lại.'), { status: 409 });
        }
        const vitri = dongId == null
            ? gio.mon.findIndex(mon => mon.id === monId && mon.chu === thietBi.id)
            : gio.mon.findIndex(mon => mon.dongId === dongId);
        const cu = gio.mon[vitri];
        if (dongId != null && cu?.chu !== thietBi.id)
            throw Object.assign(new Error('Bạn chỉ được sửa phần món của thiết bị mình.'), { status: 403 });
        if (laBuoc && !cu) throw Object.assign(new Error('Món này đã được bỏ khỏi giỏ.'), { status: 409 });
        monId = cu?.id ?? monId;
        const tong = laBuoc ? cu.so_luong + thayDoi : congThem === true ? (cu?.so_luong ?? 0) + soLuong : soLuong;
        const danhSach = [...gio.mon];
        if (tong > 0) {
            const mon = thucDonModel.timTheoId(monId);
            const tongGio = gio.mon.reduce((sum, muc, i) => i !== vitri && muc.id === monId ? sum + muc.so_luong : sum, tong);
            if ((!cu || tong > cu.so_luong) && (!mon?.kich_hoat || !mon.con_mon || tong > 100 ||
                (mon.so_suat_con_lai != null && tongGio > mon.so_suat_con_lai) || (vitri < 0 && danhSach.length >= 30))) {
                throw Object.assign(new Error('Không thể thêm món hoặc số lượng đã vượt mức còn phục vụ'), { status: 409 });
            }
            const dong = {
                id: monId, dongId: thietBi.id + '-' + monId, chu: thietBi.id,
                ten_mon: mon?.ten_mon ?? cu.ten_mon, gia: mon?.don_gia ?? cu.gia, hinh_anh: mon ? mon.anh_mon_an : cu.hinh_anh,
                so_luong: tong, ghi_chu: ghiChu ?? cu?.ghi_chu ?? ''
            };
            if (vitri < 0) danhSach.push(dong);
            else danhSach[vitri] = dong;
        } else if (vitri >= 0) danhSach.splice(vitri, 1);
        return capNhatGioTrongGiaoDich(banId, gio.phienId, gio.phienSua, danhSach);
    });
}

module.exports = { layGio, suaGio, capNhatGioTrongGiaoDich, gioChoThietBi };
