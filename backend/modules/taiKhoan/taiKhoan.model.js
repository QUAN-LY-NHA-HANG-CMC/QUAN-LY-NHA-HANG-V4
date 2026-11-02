const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

function timTheoTenDangNhap(tenDangNhap) {
    const sql = `
        SELECT tk.*, vt.ma_vai_tro, vt.ten_vai_tro 
        FROM tai_khoan tk
        JOIN vai_tro vt ON tk.vai_tro_id = vt.id
        WHERE tk.ten_dang_nhap = ?
    `;
    return ketNoiCoSoDuLieu.layMot(sql, [tenDangNhap]);
}

function timTheoId(id) {
    const sql = `
        SELECT tk.id, tk.ten_dang_nhap, tk.ho_ten, tk.so_dien_thoai, tk.email, 
               tk.vai_tro_id, tk.trang_thai, tk.ngay_tao, tk.ngay_cap_nhat,
               vt.ma_vai_tro, vt.ten_vai_tro 
        FROM tai_khoan tk
        JOIN vai_tro vt ON tk.vai_tro_id = vt.id
        WHERE tk.id = ?
    `;
    return ketNoiCoSoDuLieu.layMot(sql, [id]);
}

function layDanhSachQuyenTheoVaiTroId(vaiTroId) {
    const sql = `
        SELECT qh.ma_quyen
        FROM vai_tro_quyen_han vtqh
        JOIN quyen_han qh ON vtqh.quyen_han_id = qh.id
        WHERE vtqh.vai_tro_id = ?
    `;
    const ketQua = ketNoiCoSoDuLieu.layNhieu(sql, [vaiTroId]);
    return ketQua.map(item => item.ma_quyen);
}

function capNhatMatKhau(id, matKhauBam) {
    const sql = `
        UPDATE tai_khoan 
        SET mat_khau_bam = ?, ngay_cap_nhat = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [matKhauBam, id]);
}

function capNhatHoSo(id, { hoTen, soDienThoai, email }) {
    const sql = `
        UPDATE tai_khoan 
        SET ho_ten = ?, so_dien_thoai = ?, email = ?, ngay_cap_nhat = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    return ketNoiCoSoDuLieu.thucThi(sql, [hoTen, soDienThoai, email, id]);
}

module.exports = {
    timTheoTenDangNhap,
    timTheoId,
    layDanhSachQuyenTheoVaiTroId,
    capNhatMatKhau,
    capNhatHoSo
};
