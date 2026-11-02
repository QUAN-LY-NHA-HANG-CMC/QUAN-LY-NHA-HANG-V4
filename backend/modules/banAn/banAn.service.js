const crypto = require('node:crypto');
const banAnModel = require('./banAn.model.js');
const khuVucModel = require('../khuVuc/khuVuc.model.js');
const taoMaQr = require('../../tienIch/taoMaQr.js');
const cauHinhChung = require('../../cauHinh/cauHinhChung.js');

function sinhTokenQr(maBan) {
    const maNgauNhien = crypto.randomBytes(6).toString('hex');
    return `token_${maBan.toLowerCase()}_${maNgauNhien}`;
}

function taoUrlQr(maBan, token) {
    return `${cauHinhChung.urlGiaoDien}/menu?ban=${encodeURIComponent(maBan)}&token=${encodeURIComponent(token)}`;
}

async function layDanhSach(boLoc) {
    return banAnModel.layDanhSach(boLoc);
}

async function layTheoId(id) {
    const ban = banAnModel.layTheoId(id);
    if (!ban) {
        const loi = new Error('Bàn ăn không tồn tại');
        loi.status = 404;
        throw loi;
    }
    return ban;
}

async function taoBanAn(duLieu) {
    if (!duLieu.maBan || !duLieu.tenBan || !duLieu.khuVucId) {
        const loi = new Error('Mã bàn, tên bàn và khu vực là bắt buộc');
        loi.status = 400;
        throw loi;
    }

    const maBanChuanHoa = duLieu.maBan.trim().toUpperCase();
    const tonTai = banAnModel.layTheoMaBan(maBanChuanHoa);
    if (tonTai) {
        const loi = new Error(`Mã bàn ${maBanChuanHoa} đã tồn tại`);
        loi.status = 409;
        throw loi;
    }

    const khuVuc = khuVucModel.timTheoId(duLieu.khuVucId);
    if (!khuVuc) {
        const loi = new Error('Khu vực được chọn không tồn tại');
        loi.status = 400;
        throw loi;
    }

    const maQrToken = sinhTokenQr(maBanChuanHoa);
    const urlMaQr = taoUrlQr(maBanChuanHoa, maQrToken);

    const ketQua = banAnModel.taoBanAn({
        maBan: maBanChuanHoa,
        tenBan: duLieu.tenBan.trim(),
        khuVucId: Number(duLieu.khuVucId),
        sucChua: duLieu.sucChua ? Number(duLieu.sucChua) : 4,
        maQrToken,
        urlMaQr
    });

    return banAnModel.layTheoId(ketQua.lastInsertRowid);
}

async function capNhatBanAn(id, duLieu) {
    const banHienTai = await layTheoId(id);

    banAnModel.capNhatBanAn(id, {
        tenBan: duLieu.tenBan ? duLieu.tenBan.trim() : banHienTai.ten_ban,
        khuVucId: duLieu.khuVucId ? Number(duLieu.khuVucId) : banHienTai.khu_vuc_id,
        sucChua: duLieu.sucChua ? Number(duLieu.sucChua) : banHienTai.suc_chua
    });

    return banAnModel.layTheoId(id);
}

async function lamMoiQrToken(id) {
    const ban = await layTheoId(id);
    const tokenMoi = sinhTokenQr(ban.ma_ban);
    const urlMoi = taoUrlQr(ban.ma_ban, tokenMoi);

    banAnModel.capNhatQrToken(id, tokenMoi, urlMoi);
    return banAnModel.layTheoId(id);
}

async function layAnhQrBan(id) {
    const ban = await layTheoId(id);
    const anhBase64 = await taoMaQr.taoAnhQrBase64(ban.url_ma_qr);
    return {
        id: ban.id,
        maBan: ban.ma_ban,
        tenBan: ban.ten_ban,
        url: ban.url_ma_qr,
        anhBase64
    };
}

async function doiTrangThai(id, trangThai) {
    const cacTrangThaiHopLe = ['trong', 'dang_dung', 'cho_thanh_toan', 'tam_khoa'];
    if (!cacTrangThaiHopLe.includes(trangThai)) {
        const loi = new Error('Trạng thái bàn ăn không hợp lệ');
        loi.status = 400;
        throw loi;
    }

    await layTheoId(id);
    banAnModel.doiTrangThai(id, trangThai);
    return true;
}

async function xoaBanAn(id) {
    const ban = await layTheoId(id);
    if (ban.trang_thai === 'dang_dung' || ban.trang_thai === 'cho_thanh_toan') {
        const loi = new Error('Không thể xóa bàn đang có khách hoặc chờ thanh toán');
        loi.status = 400;
        throw loi;
    }

    banAnModel.xoaBanAn(id);
    return true;
}

module.exports = {
    layDanhSach,
    layTheoId,
    taoBanAn,
    capNhatBanAn,
    lamMoiQrToken,
    layAnhQrBan,
    doiTrangThai,
    xoaBanAn
};
