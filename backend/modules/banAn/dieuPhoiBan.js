const { truyVanNhieu, truyVanMot, thucThi, chayGiaoDich } = require('../../cauHinh/ketNoiCoSoDuLieu');
const caLamViec = require('../caLamViec/caLamViec.service');

function layNhanVienTrongCa() {
    const nv = truyVanNhieu(`SELECT n.id,n.ho_ten FROM nhan_vien n JOIN tai_khoan t ON t.id=n.tai_khoan_id
        JOIN vai_tro v ON v.id=t.vai_tro_id WHERE v.ma_vai_tro='phuc_vu'
        AND n.trang_thai='dang_lam' AND t.trang_thai='hoat_dong'`);
    return new Map(nv.filter(muc => caLamViec.trangThaiCa(muc.id).caDangLam).map(muc => [muc.id, muc.ho_ten]));
}

function layNguoiPhuTrach(ca) {
    const phuTrach = new Map();
    const cacPhanCong = truyVanNhieu(`SELECT ban_an_id,nhan_vien_id FROM phan_cong_ban
        WHERE ngay_phan_cong <= DATE('now','+7 hours') ORDER BY ngay_phan_cong DESC,id DESC`);
    for (const muc of cacPhanCong) {
        if (ca.has(muc.nhan_vien_id) && !phuTrach.has(muc.ban_an_id))
            phuTrach.set(muc.ban_an_id, muc.nhan_vien_id);
    }
    return phuTrach;
}

function layViecBan(banId = null) {
    return truyVanNhieu(`WITH viec AS (
        SELECT 'ho_tro' loai,y.id doi_tuong_id,p.ban_an_id ban_id,
            COALESCE(NULLIF(y.noi_dung,''),'Khách gọi hỗ trợ') noi_dung,y.thoi_gian_gui ngay_tao
        FROM yeu_cau_ho_tro y JOIN phien_ban p ON p.id=y.phien_ban_id
        WHERE y.loai_yeu_cau!='yeu_cau_thanh_toan' AND y.trang_thai!='da_xong' AND p.trang_thai='dang_hoat_dong'
        UNION ALL
        SELECT 'duyet_qr',d.id,p.ban_an_id,d.ma_don,d.thoi_gian_gui
        FROM don_goi_mon d JOIN phien_ban p ON p.id=d.phien_ban_id
        WHERE p.trang_thai='dang_hoat_dong' AND d.nguon_tao='khach_qr' AND d.trang_thai='cho_duyet'
        UNION ALL
        SELECT 'bung_mon',c.id,p.ban_an_id,m.ten_mon || ' × ' || c.so_luong,c.thoi_gian_hoan_thanh_nau
        FROM chi_tiet_don_mon c JOIN don_goi_mon d ON d.id=c.don_goi_mon_id
        JOIN phien_ban p ON p.id=d.phien_ban_id JOIN mon_an m ON m.id=c.mon_an_id
        WHERE p.trang_thai='dang_hoat_dong' AND d.trang_thai='da_duyet' AND c.trang_thai_mon='hoan_thanh'
          AND NOT EXISTS (SELECT 1 FROM xu_ly_mon_pos x WHERE x.chi_tiet_id=c.id AND x.lua_chon IN ('goi_mang_ve','khong_lay'))
        UNION ALL
        SELECT 'don_ban',p.id,p.ban_an_id,'Dọn bàn sau thanh toán',p.thoi_gian_ket_thuc
        FROM phien_ban p JOIN ban_an b ON b.id=p.ban_an_id
        WHERE b.trang_thai='can_don_dep' AND p.id=(SELECT MAX(id) FROM phien_ban WHERE ban_an_id=b.id)
    )
    SELECT v.*, b.ten_ban, t.nhan_vien_id AS nguoi_nhan_id,t.thoi_gian AS thoi_gian_nhan,n.ho_ten AS nguoi_nhan
    FROM viec v JOIN ban_an b ON b.id=v.ban_id
    LEFT JOIN tiep_nhan_viec_ban t ON t.loai=v.loai AND t.doi_tuong_id=v.doi_tuong_id
    LEFT JOIN nhan_vien n ON n.id=t.nhan_vien_id
    WHERE (? IS NULL OR v.ban_id=?) ORDER BY v.ngay_tao DESC, v.doi_tuong_id DESC`, [banId, banId]);
}

function layDanhSach(nguoiDung, banId = null) {
    const ca = layNhanVienTrongCa();
    const phuTrach = layNguoiPhuTrach(ca);
    return layViecBan(banId).map(viec => {
        const idPhuTrach = phuTrach.get(viec.ban_id) ?? null;
        const dangXuLy = ca.has(viec.nguoi_nhan_id);
        return { ...viec, idPhuTrach, tenPhuTrach: ca.get(idPhuTrach) ?? null, dangXuLy };
    }).filter(viec => banId !== null || nguoiDung.vaiTro === 'quan_ly' ||
        (viec.dangXuLy ? viec.nguoi_nhan_id === nguoiDung.nhanVienId :
            !viec.idPhuTrach || viec.idPhuTrach === nguoiDung.nhanVienId));
}

function tiepNhan(nguoiDung, banId, loai, id) {
    return chayGiaoDich(() => {
        const nv = nguoiDung.nhanVienId;
        if (!nv || !Number.isSafeInteger(banId) || banId <= 0 || !Number.isSafeInteger(id) || id <= 0)
            throw Object.assign(new Error('Công việc hoặc nhân viên không hợp lệ.'), { status: 400 });
        const viec = layDanhSach(nguoiDung, banId).find(muc => muc.loai === loai && muc.doi_tuong_id === id);
        if (!viec) throw Object.assign(new Error('Công việc đã được xử lý hoặc không còn hiệu lực.'), { status: 409 });
        if (viec.nguoi_nhan_id === nv) return viec;
        if (viec.dangXuLy)
            throw Object.assign(new Error(viec.nguoi_nhan + ' đã tiếp nhận công việc này.'), { status: 409 });
        thucThi(`INSERT INTO tiep_nhan_viec_ban(loai,doi_tuong_id,nhan_vien_id) VALUES (?,?,?)
            ON CONFLICT(loai,doi_tuong_id) DO UPDATE SET nhan_vien_id=excluded.nhan_vien_id,thoi_gian=CURRENT_TIMESTAMP`, [loai, id, nv]);
        return layDanhSach(nguoiDung, banId).find(muc => muc.loai === loai && muc.doi_tuong_id === id);
    });
}

function layPhongNhan(banId) {
    const ca = layNhanVienTrongCa();
    const phuTrach = layNguoiPhuTrach(ca).get(Number(banId));
    return (phuTrach ? [phuTrach] : [...ca.keys()]).map(id => 'nhan_vien_' + id);
}

function kiemTraNguoiNhan(nguoiDung, loai, id) {
    if (nguoiDung?.vaiTro !== 'phuc_vu') return;
    const nguoiNhan = truyVanMot(`SELECT t.nhan_vien_id,n.ho_ten FROM tiep_nhan_viec_ban t
        JOIN nhan_vien n ON n.id=t.nhan_vien_id WHERE t.loai=? AND t.doi_tuong_id=?`, [loai, id]);
    if (nguoiNhan && nguoiNhan.nhan_vien_id !== nguoiDung.nhanVienId && layNhanVienTrongCa().has(nguoiNhan.nhan_vien_id))
        throw Object.assign(new Error(nguoiNhan.ho_ten + ' đang xử lý công việc này.'), { status: 409 });
}

module.exports = { layDanhSach, tiepNhan, layPhongNhan, kiemTraNguoiNhan };
