const thucDonModel = require('./thucDon.model.js');
const danhMucModel = require('../danhMucMon/danhMucMon.model.js');

async function layDanhSach(boLoc) {
    const ketQua = thucDonModel.layDanhSach(boLoc);
    const danhSachCoTuyChon = ketQua.danhSach.map(mon => {
        return {
            ...mon,
            tuyChon: thucDonModel.layTuyChonTheoMonId(mon.id)
        };
    });

    return {
        ...ketQua,
        danhSach: danhSachCoTuyChon
    };
}

async function layTheoId(id, tuyChon = {}) {
    const mon = thucDonModel.layTheoId(id, tuyChon);
    if (!mon) {
        const loi = new Error('Món ăn không tồn tại hoặc đã bị xóa');
        loi.status = 404;
        throw loi;
    }
    return {
        ...mon,
        tuyChon: thucDonModel.layTuyChonTheoMonId(mon.id)
    };
}

async function taoMonAn(duLieu) {
    if (!duLieu.tenMon || !duLieu.maMon || duLieu.danhMucId === undefined) {
        const loi = new Error('Tên món, mã món và danh mục là bắt buộc');
        loi.status = 400;
        throw loi;
    }

    const giaBanSo = Number(duLieu.giaBan);
    if (isNaN(giaBanSo) || giaBanSo < 0) {
        const loi = new Error('Giá bán món ăn phải là số hợp lệ và lớn hơn hoặc bằng 0');
        loi.status = 400;
        throw loi;
    }

    const danhMuc = danhMucModel.timTheoId(duLieu.danhMucId);
    if (!danhMuc) {
        const loi = new Error('Danh mục món ăn không tồn tại');
        loi.status = 400;
        throw loi;
    }

    const maMonChuanHoa = duLieu.maMon.trim().toUpperCase();
    const tonTai = thucDonModel.layTheoMaMon(maMonChuanHoa);
    if (tonTai) {
        const loi = new Error(`Mã món ${maMonChuanHoa} đã tồn tại trong thực đơn`);
        loi.status = 409;
        throw loi;
    }

    const ketQua = thucDonModel.taoMonAn({
        danhMucId: Number(duLieu.danhMucId),
        maMon: maMonChuanHoa,
        tenMon: duLieu.tenMon.trim(),
        moTa: duLieu.moTa ? duLieu.moTa.trim() : '',
        giaBan: giaBanSo,
        donViTinh: duLieu.donViTinh ? duLieu.donViTinh.trim() : 'Phần',
        hinhAnh: duLieu.hinhAnh || null,
        laMonNoiBat: duLieu.laMonNoiBat ? 1 : 0
    });

    const monAnId = ketQua.lastInsertRowid;

    // Lưu tùy chọn nếu có
    if (Array.isArray(duLieu.tuyChon)) {
        for (const tc of duLieu.tuyChon) {
            if (tc.tenTuyChon && tc.loaiTuyChon) {
                thucDonModel.taoTuyChon(monAnId, {
                    loaiTuyChon: tc.loaiTuyChon,
                    tenTuyChon: tc.tenTuyChon.trim(),
                    giaThem: Number(tc.giaThem || 0),
                    batBuoc: tc.batBuoc ? 1 : 0
                });
            }
        }
    }

    return await layTheoId(monAnId);
}

async function capNhatMonAn(id, duLieu) {
    const monHienTai = await layTheoId(id);

    let giaBanSo = monHienTai.gia_ban;
    if (duLieu.giaBan !== undefined) {
        giaBanSo = Number(duLieu.giaBan);
        if (isNaN(giaBanSo) || giaBanSo < 0) {
            const loi = new Error('Giá bán món ăn phải lớn hơn hoặc bằng 0');
            loi.status = 400;
            throw loi;
        }
    }

    let danhMucId = monHienTai.danh_muc_id;
    if (duLieu.danhMucId) {
        const danhMuc = danhMucModel.timTheoId(duLieu.danhMucId);
        if (!danhMuc) {
            const loi = new Error('Danh mục món ăn không tồn tại');
            loi.status = 400;
            throw loi;
        }
        danhMucId = Number(duLieu.danhMucId);
    }

    thucDonModel.capNhatMonAn(id, {
        danhMucId,
        tenMon: duLieu.tenMon ? duLieu.tenMon.trim() : monHienTai.ten_mon,
        moTa: duLieu.moTa !== undefined ? duLieu.moTa.trim() : monHienTai.mo_ta,
        giaBan: giaBanSo,
        donViTinh: duLieu.donViTinh ? duLieu.donViTinh.trim() : monHienTai.don_vi_tinh,
        hinhAnh: duLieu.hinhAnh !== undefined ? duLieu.hinhAnh : null,
        laMonNoiBat: duLieu.laMonNoiBat !== undefined ? (duLieu.laMonNoiBat ? 1 : 0) : monHienTai.la_mon_noi_bat
    });

    if (Array.isArray(duLieu.tuyChon)) {
        thucDonModel.xoaTuyChon(id);
        for (const tc of duLieu.tuyChon) {
            if (tc.tenTuyChon && tc.loaiTuyChon) {
                thucDonModel.taoTuyChon(id, {
                    loaiTuyChon: tc.loaiTuyChon,
                    tenTuyChon: tc.tenTuyChon.trim(),
                    giaThem: Number(tc.giaThem || 0),
                    batBuoc: tc.batBuoc ? 1 : 0
                });
            }
        }
    }

    return await layTheoId(id);
}

async function doiTrangThai(id, trangThai) {
    if (!['dang_ban', 'tam_het'].includes(trangThai)) {
        const loi = new Error('Trạng thái món ăn không hợp lệ');
        loi.status = 400;
        throw loi;
    }

    await layTheoId(id);
    thucDonModel.doiTrangThai(id, trangThai);
    return true;
}

async function xoaMemMonAn(id) {
    await layTheoId(id);
    thucDonModel.xoaMem(id);
    return true;
}

module.exports = {
    layDanhSach,
    layTheoId,
    taoMonAn,
    capNhatMonAn,
    doiTrangThai,
    xoaMemMonAn
};
