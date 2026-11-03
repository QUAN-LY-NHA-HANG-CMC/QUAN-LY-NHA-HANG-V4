/**
 * Service quản lý & tính toán khuyến mãi
 * Phụ trách: Minh (Backend Developer)
 */
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

async function layDanhSachKhuyenMai() {
    const sql = `
        SELECT * FROM khuyen_mai 
        WHERE trang_thai = 1 
          AND (ngay_ket_thuc IS NULL OR ngay_ket_thuc >= CURRENT_TIMESTAMP)
          AND so_luot_dung < gioi_han_luot_dung
        ORDER BY id DESC
    `;
    return ketNoiCoSoDuLieu.layNhieu(sql);
}

async function kiemTraMa(maKhuyenMai, tongTien = 0) {
    if (!maKhuyenMai) {
        return { hopLe: false, tienGiam: 0, lyDo: 'Chưa nhập mã khuyến mãi' };
    }

    const km = ketNoiCoSoDuLieu.layMot(`
        SELECT * FROM khuyen_mai 
        WHERE UPPER(ma_khuyen_mai) = UPPER(?) AND trang_thai = 1
    `, [maKhuyenMai.trim()]);

    if (!km) {
        return { hopLe: false, tienGiam: 0, lyDo: 'Mã khuyến mãi không tồn tại hoặc đã bị khóa' };
    }

    if (km.so_luot_dung >= km.gioi_han_luot_dung) {
        return { hopLe: false, tienGiam: 0, lyDo: 'Mã khuyến mãi đã hết lượt sử dụng' };
    }

    if (km.ngay_ket_thuc && new Date(km.ngay_ket_thuc) < new Date()) {
        return { hopLe: false, tienGiam: 0, lyDo: 'Mã khuyến mãi đã hết hạn sử dụng' };
    }

    if (tongTien < (km.don_toi_thieu || 0)) {
        return { 
            hopLe: false, 
            tienGiam: 0, 
            lyDo: `Đơn hàng tối thiểu phải từ ${km.don_toi_thieu.toLocaleString('vi-VN')}đ để áp dụng mã này` 
        };
    }

    let tienGiam = 0;
    if (km.loai_giam === 'phan_tram') {
        tienGiam = Math.round((tongTien * km.gia_tri_giam) / 100);
        if (km.giam_toi_da > 0 && tienGiam > km.giam_toi_da) {
            tienGiam = km.giam_toi_da;
        }
    } else {
        tienGiam = km.gia_tri_giam;
    }

    if (tienGiam > tongTien) {
        tienGiam = tongTien;
    }

    return {
        hopLe: true,
        khuyenMaiId: km.id,
        maKhuyenMai: km.ma_khuyen_mai,
        tenChuongTrinh: km.ten_chuong_trinh,
        loaiGiam: km.loai_giam,
        giaTriGiam: km.gia_tri_giam,
        tienGiam
    };
}

module.exports = {
    layDanhSachKhuyenMai,
    kiemTraMa
};
