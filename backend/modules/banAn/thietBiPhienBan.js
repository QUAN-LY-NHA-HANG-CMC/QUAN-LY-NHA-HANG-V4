const { createHash, randomBytes, randomInt, timingSafeEqual } = require('node:crypto');
const { truyVanMot, truyVanNhieu, thucThi, chayGiaoDich } = require('../../cauHinh/ketNoiCoSoDuLieu');
const banAnModel = require('./banAn.model');

const HAN_MA = 40_000;
const HAN_CHO = 300_000;
const SO_LAN_SAI_TOI_DA = 5;
const loi = (msg, status = 403) => Object.assign(new Error(msg), { status });

function bamKhoa(khoa) {
    if (typeof khoa !== 'string' || !/^[a-f0-9]{64}$/.test(khoa)) return null;
    return createHash('sha256').update(khoa).digest('hex');
}

function timThietBi(phienId, khoa) {
    const khoaBam = bamKhoa(khoa);
    return khoaBam && phienId ? truyVanMot(
        'SELECT * FROM thiet_bi_phien_ban WHERE phien_ban_id = ? AND khoa_bam = ?', [phienId, khoaBam]
    ) : null;
}

function xacThucThietBi(banId, khoa) {
    const phien = banAnModel.layPhienBanHienTai(banId);
    const thietBi = timThietBi(phien?.id, khoa);
    return thietBi?.trang_thai === 'da_vao' ? thietBi : null;
}

function yeuCauQuyen(banId, khoa) {
    const thietBi = xacThucThietBi(banId, khoa);
    if (!thietBi) throw loi('Thiết bị chưa được xác nhận trong phiên bàn.');
    return thietBi;
}

function layYeuCau(phienId) {
    return truyVanNhieu(`SELECT id, trang_thai, ma_moi AS maMoi,
        CASE WHEN trang_thai = 'cho_duyet' THEN doi_den ELSE ma_het_han END AS hetHan
        FROM thiet_bi_phien_ban WHERE phien_ban_id = ? AND (
            (trang_thai = 'cho_duyet' AND doi_den > ?) OR
            (trang_thai = 'cho_ma' AND ma_het_han > ?)
        ) ORDER BY doi_den, id`, [phienId, Date.now(), Date.now()]);
}

function layYeuCauChu(phienId) {
    const chu = truyVanMot('SELECT id FROM thiet_bi_phien_ban WHERE phien_ban_id=? AND la_chu=1', [phienId]);
    return chu ? [] : layYeuCau(phienId).filter(dong => dong.trang_thai === 'cho_duyet').map(({ id }) => ({ id }));
}

function trangThai(banId, khoa) {
    if (!bamKhoa(khoa)) throw loi('Thiếu mã thiết bị hợp lệ.', 400);
    const gioMayChu = Date.now();
    const phien = banAnModel.layPhienBanHienTai(banId);
    if (!phien) return { trangThai: 'chua_mo', gioMayChu };
    const dong = timThietBi(phien.id, khoa);
    if (!dong) return { trangThai: 'chua_gui', phienId: phien.id, gioMayChu };
    const hetHan = dong.trang_thai === 'cho_duyet' ? dong.doi_den : dong.ma_het_han;
    const daHetHan = ['cho_duyet', 'cho_ma'].includes(dong.trang_thai) && hetHan <= gioMayChu;
    return {
        id: dong.id, phienId: phien.id, laChu: Boolean(dong.la_chu), hetHan, gioMayChu,
        trangThai: daHetHan ? 'het_han' : dong.trang_thai,
        yeuCau: dong.la_chu ? layYeuCau(phien.id) : []
    };
}

function guiYeuCau(banId, khoa, phienTruoc) {
    const khoaBam = bamKhoa(khoa);
    if (!khoaBam) throw loi('Thiếu mã thiết bị hợp lệ.', 400);
    return chayGiaoDich(() => {
        const phien = banAnModel.layPhienBanHienTai(banId);
        if (!phien || (phienTruoc != null && phien.id !== phienTruoc)) throw loi('Phiên bàn đã thay đổi hoặc chưa được mở.', 409);
        const cu = timThietBi(phien.id, khoa);
        if (cu?.so_lan_sai >= SO_LAN_SAI_TOI_DA) throw loi('Đã hết lượt nhập mã trong phiên bàn.', 429);
        if (cu) {
            const hienTai = trangThai(banId, khoa);
            if (!['het_han', 'tu_choi'].includes(hienTai.trangThai)) return hienTai;
            thucThi(`UPDATE thiet_bi_phien_ban SET id=?, trang_thai='cho_duyet', doi_den=?, ma_het_han=NULL
                WHERE id=?`, [randomBytes(6).toString('hex'), Date.now() + HAN_CHO, cu.id]);
        } else {
            thucThi(`INSERT INTO thiet_bi_phien_ban (id,phien_ban_id,khoa_bam,trang_thai,doi_den)
                VALUES (?, ?, ?, 'cho_duyet', ?)`, [randomBytes(6).toString('hex'), phien.id, khoaBam, Date.now() + HAN_CHO]);
        }
        return trangThai(banId, khoa);
    });
}

function xacNhanChu(banId, id) {
    return chayGiaoDich(() => {
        const phien = banAnModel.layPhienBanHienTai(banId);
        const yeuCau = phien && truyVanMot(`SELECT trang_thai, doi_den FROM thiet_bi_phien_ban
            WHERE id=? AND phien_ban_id=?`, [id, phien.id]);
        if (!yeuCau || yeuCau.trang_thai !== 'cho_duyet' || yeuCau.doi_den <= Date.now())
            throw loi('Yêu cầu tham gia không còn hiệu lực.', 409);
        const chu = truyVanMot('SELECT id FROM thiet_bi_phien_ban WHERE phien_ban_id=? AND la_chu=1', [phien.id]);
        if (chu) throw loi('Phiên bàn đã có thiết bị quản lý.', 409);
        thucThi("UPDATE thiet_bi_phien_ban SET trang_thai='da_vao', la_chu=1 WHERE id=?", [id]);
        return { id };
    });
}

function xuLyYeuCau(banId, khoa, id, chapNhan) {
    if (typeof chapNhan !== 'boolean') throw loi('Quyết định không hợp lệ.', 400);
    return chayGiaoDich(() => {
        const chu = yeuCauQuyen(banId, khoa);
        if (!chu.la_chu) throw loi('Chỉ thiết bị đầu tiên được xử lý yêu cầu.');
        const dong = truyVanMot('SELECT * FROM thiet_bi_phien_ban WHERE id=? AND phien_ban_id=?', [id, chu.phien_ban_id]);
        const bayGio = Date.now();
        if (chapNhan && dong?.trang_thai === 'cho_ma' && dong.ma_het_han > bayGio) return trangThai(banId, khoa);
        if (dong?.trang_thai !== 'cho_duyet' || dong.doi_den <= bayGio)
            throw loi('Yêu cầu tham gia không còn hiệu lực.', 409);
        let ma = null;
        if (chapNhan) {
            const maDangCo = new Set(truyVanNhieu('SELECT ma_moi FROM thiet_bi_phien_ban WHERE phien_ban_id=? AND ma_moi IS NOT NULL',
                [chu.phien_ban_id]).map(muc => muc.ma_moi));
            do {
                ma = String(randomInt(1_000_000)).padStart(6, '0');
            } while (maDangCo.has(ma));
        }
        thucThi('UPDATE thiet_bi_phien_ban SET trang_thai=?, ma_moi=?, ma_het_han=? WHERE id=?',
            [chapNhan ? 'cho_ma' : 'tu_choi', ma, chapNhan ? bayGio + HAN_MA : null, id]);
        return trangThai(banId, khoa);
    });
}

function nhapMa(banId, khoa, id, ma) {
    const ketQua = chayGiaoDich(() => {
        const phien = banAnModel.layPhienBanHienTai(banId);
        const dong = timThietBi(phien?.id, khoa);
        if (!dong || dong.id !== id) return loi('Yêu cầu không thuộc thiết bị này.');
        if (dong.so_lan_sai >= SO_LAN_SAI_TOI_DA) return loi('Đã hết lượt nhập mã trong phiên bàn.', 429);
        if (dong.trang_thai !== 'cho_ma' || dong.ma_het_han <= Date.now())
            return loi('Mã tham gia đã dùng hoặc hết hạn.', 409);
        if (typeof ma !== 'string' || !/^\d{6}$/.test(ma) ||
            !timingSafeEqual(Buffer.from(ma), Buffer.from(dong.ma_moi))) {
            thucThi('UPDATE thiet_bi_phien_ban SET so_lan_sai=so_lan_sai+1 WHERE id=?', [dong.id]);
            return dong.so_lan_sai + 1 >= SO_LAN_SAI_TOI_DA
                ? loi('Đã hết lượt nhập mã trong phiên bàn.', 429) : loi('Mã tham gia không đúng.', 400);
        }
        thucThi("UPDATE thiet_bi_phien_ban SET trang_thai='da_vao', ma_moi=NULL, ma_het_han=NULL WHERE id=?", [dong.id]);
        return trangThai(banId, khoa);
    });
    if (ketQua instanceof Error) throw ketQua;
    return ketQua;
}

module.exports = { trangThai, guiYeuCau, xacNhanChu, xuLyYeuCau, nhapMa, xacThucThietBi, yeuCauQuyen, layYeuCauChu, timThietBi };

