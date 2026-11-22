// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MODEL CẤU HÌNH HỆ THỐNG, THỐNG KÊ & AUDIT LOG (FIGMA A01, A20, S01)
// ============================================================================

const { truyVanNhieu, truyVanMot, thucThi } = require('../../cauHinh/ketNoiCoSoDuLieu');

const heThongModel = {
    /**
     * Lấy thông tin cấu hình nhà hàng
     */
    layCauHinhNhaHang() {
        const sql = `SELECT * FROM cau_hinh_nha_hang LIMIT 1;`;
        return truyVanMot(sql);
    },

    /**
     * Cập nhật thông tin cấu hình nhà hàng
     */
    capNhatCauHinhNhaHang({
        tenNhaHang,
        diaChi,
        soDienThoai,
        email,
        anhLogo,
        phanTramVat,
        nganHangVietQr,
        soTaiKhoanVietQr,
        tenChuTaiKhoanVietQr
    }) {
        const sql = `
            UPDATE cau_hinh_nha_hang 
            SET ten_nha_hang = COALESCE(?, ten_nha_hang),
                dia_chi = COALESCE(?, dia_chi),
                so_dien_thoai = COALESCE(?, so_dien_thoai),
                email = COALESCE(?, email),
                anh_logo = COALESCE(?, anh_logo),
                phan_tram_vat = COALESCE(?, phan_tram_vat),
                ngan_hang_vietqr = COALESCE(?, ngan_hang_vietqr),
                so_tai_khoan_vietqr = COALESCE(?, so_tai_khoan_vietqr),
                ten_chu_tai_khoan_vietqr = COALESCE(?, ten_chu_tai_khoan_vietqr),
                ngay_cap_nhat = CURRENT_TIMESTAMP
            WHERE id = (SELECT id FROM cau_hinh_nha_hang LIMIT 1);
        `;
        return thucThi(sql, [
            tenNhaHang ?? null,
            diaChi ?? null,
            soDienThoai ?? null,
            email ?? null,
            anhLogo ?? null,
            phanTramVat ?? null,
            nganHangVietQr ?? null,
            soTaiKhoanVietQr ?? null,
            tenChuTaiKhoanVietQr ?? null
        ]);
    },

    /**
     * Lấy nhật ký kiểm toán hệ thống (Audit Logs - Figma A20)
     */
    layNhatKyKiemToan({ limit = 50, offset = 0, hanhDong } = {}) {
        let sql = `
            SELECT nk.*, tk.ten_dang_nhap, nv.ho_ten as ten_nhan_vien
            FROM nhat_ky_kiem_toan nk
            LEFT JOIN tai_khoan tk ON nk.tai_khoan_id = tk.id
            LEFT JOIN nhan_vien nv ON tk.id = nv.tai_khoan_id
            WHERE 1=1
        `;
        const params = [];

        if (hanhDong) {
            sql += ` AND nk.hanh_dong = ?`;
            params.push(hanhDong);
        }

        sql += ` ORDER BY nk.thoi_gian_tao DESC, nk.id DESC LIMIT ? OFFSET ?;`;
        params.push(Number(limit), Number(offset));

        return truyVanNhieu(sql, params);
    },

    /**
     * Thống kê tổng quan báo cáo Dashboard Quản lý (Figma A01)
     */
    layThongKeDashboard() {
        // Doanh thu và hóa đơn hôm nay
        const thongKeHomNay = truyVanMot(`
            SELECT 
                COUNT(*) as tong_so_hoa_don,
                COALESCE(SUM(tong_tien_thanh_toan), 0) as tong_doanh_thu,
                COALESCE(SUM(tien_vat), 0) as tong_vat,
                COALESCE(SUM(tien_chiet_khau), 0) as tong_chiet_khau
            FROM hoa_don 
            WHERE DATE(thoi_gian_thanh_toan, '+7 hours') = DATE('now', '+7 hours') 
              AND trang_thai = 'da_thanh_toan';
        `);

        // Tình trạng bàn hiện tại
        const tinhTrangBan = truyVanNhieu(`
            SELECT trang_thai, COUNT(*) as so_luong 
            FROM ban_an 
            WHERE kich_hoat = 1 
            GROUP BY trang_thai;
        `);

        // Top 5 món bán chạy nhất trong ngày
        const topMonBanChay = truyVanNhieu(`
            SELECT cthd.mon_an_id, cthd.ten_mon, m.anh_mon_an,
                   SUM(cthd.so_luong) as tong_so_luong,
                   SUM(cthd.thanh_tien) as tong_tien
            FROM chi_tiet_hoa_don cthd
            JOIN hoa_don hd ON cthd.hoa_don_id = hd.id
            JOIN mon_an m ON cthd.mon_an_id = m.id
            WHERE hd.trang_thai = 'da_thanh_toan'
              AND DATE(hd.thoi_gian_thanh_toan, '+7 hours') = DATE('now', '+7 hours')
            GROUP BY cthd.mon_an_id, cthd.ten_mon, m.anh_mon_an
            ORDER BY tong_so_luong DESC
            LIMIT 5;
        `);

        return {
            thongKeHomNay,
            tinhTrangBan,
            topMonBanChay
        };
    }
};

module.exports = heThongModel;
