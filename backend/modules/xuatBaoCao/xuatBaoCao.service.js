/**
 * Service xuất báo cáo ra định dạng CSV (hỗ trợ Excel UTF-8 tiếng Việt)
 * Phụ trách: Minh (Backend Developer)
 */
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

function xuatDoanhThuCsv() {
    const sql = `
        SELECT date(thoi_gian_tao) AS ngay,
               COUNT(id) AS so_don,
               COALESCE(SUM(tong_thanh_toan), 0) AS tong_doanh_thu,
               COALESCE(SUM(tien_giam_gia), 0) AS tien_giam_gia,
               COALESCE(SUM(tien_vat), 0) AS tien_vat
        FROM hoa_don
        WHERE trang_thai = 'da_thanh_toan'
        GROUP BY ngay
        ORDER BY ngay DESC
    `;
    const rows = ketNoiCoSoDuLieu.layNhieu(sql);

    // Tiền tố UTF-8 BOM \uFEFF giúp Excel hiển thị tiếng Việt có dấu chuẩn xác 100%
    let csv = '\uFEFFNgày,Tổng Doanh Thu,Số Hóa Đơn,Tiền Giảm Giá,Tiền VAT\n';
    for (const r of rows) {
        csv += `"${r.ngay}",${r.tong_doanh_thu},${r.so_don},${r.tien_giam_gia},${r.tien_vat}\n`;
    }
    return csv;
}

function xuatHoaDonCsv() {
    const sql = `
        SELECT hd.ma_hoa_don,
               ba.ten_ban,
               hd.tong_tien_mon,
               hd.tien_giam_gia,
               hd.tien_vat,
               hd.tong_thanh_toan,
               hd.phuong_thuc_thanh_toan,
               hd.trang_thai,
               hd.thoi_gian_tao
        FROM hoa_don hd
        JOIN ban_an ba ON hd.ban_an_id = ba.id
        ORDER BY hd.id DESC
        LIMIT 500
    `;
    const rows = ketNoiCoSoDuLieu.layNhieu(sql);

    let csv = '\uFEFFMã Hóa Đơn,Bàn,Tổng Tiền Món,Giảm Giá,VAT,Tổng Thanh Toán,Phương Thức,Trạng Thái,Thời Gian Tạo\n';
    for (const r of rows) {
        const pt = r.phuong_thuc_thanh_toan === 'tien_mat' ? 'Tiền mặt' : (r.phuong_thuc_thanh_toan === 'chuyen_khoan' ? 'Chuyển khoản VietQR' : r.phuong_thuc_thanh_toan);
        const tt = r.trang_thai === 'da_thanh_toan' ? 'Đã thanh toán' : (r.trang_thai === 'da_huy' ? 'Đã hủy' : 'Tạm tính');
        csv += `"${r.ma_hoa_don}","${r.ten_ban}",${r.tong_tien_mon},${r.tien_giam_gia},${r.tien_vat},${r.tong_thanh_toan},"${pt}","${tt}","${r.thoi_gian_tao}"\n`;
    }
    return csv;
}

module.exports = {
    xuatDoanhThuCsv,
    xuatHoaDonCsv
};
