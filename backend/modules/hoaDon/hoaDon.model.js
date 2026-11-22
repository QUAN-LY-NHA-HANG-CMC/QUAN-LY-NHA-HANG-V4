// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MODEL DỮ LIỆU HÓA ĐƠN & THANH TOÁN (FIGMA P01, P02, P03, P04, P05, C09, C10)
// ============================================================================

const { truyVanNhieu, truyVanMot, thucThi, chayGiaoDich } = require('../../cauHinh/ketNoiCoSoDuLieu');

const hoaDonModel = {
    /**
     * Lấy danh sách hóa đơn theo bộ lọc ngày và trạng thái
     */
    layDanhSach({ tuNgay, denNgay, trangThai, limit = 50, offset = 0 } = {}) {
        let sql = `
            SELECT hd.*, pb.ban_an_id, b.ten_ban, b.ma_ban, k.ten_khu_vuc,
                   nv.ho_ten as ten_thu_ngan
            FROM hoa_don hd
            JOIN phien_ban pb ON hd.phien_ban_id = pb.id
            JOIN ban_an b ON pb.ban_an_id = b.id
            JOIN khu_vuc k ON b.khu_vuc_id = k.id
            LEFT JOIN nhan_vien nv ON hd.thu_ngan_id = nv.id
            WHERE 1=1
        `;
        const params = [];

        if (trangThai) {
            sql += ` AND hd.trang_thai = ?`;
            params.push(trangThai);
        }
        if (tuNgay) {
            sql += ` AND DATE(hd.ngay_tao) >= DATE(?)`;
            params.push(tuNgay);
        }
        if (denNgay) {
            sql += ` AND DATE(hd.ngay_tao) <= DATE(?)`;
            params.push(denNgay);
        }

        sql += ` ORDER BY hd.ngay_tao DESC LIMIT ? OFFSET ?;`;
        params.push(Number(limit), Number(offset));

        return truyVanNhieu(sql, params);
    },

    /**
     * Tìm hóa đơn theo ID kèm thông tin bàn, khu vực và thu ngân
     */
    timTheoId(id) {
        const sql = `
            SELECT hd.*, pb.ban_an_id, b.ten_ban, b.ma_ban, k.ten_khu_vuc,
                   nv.ho_ten as ten_thu_ngan
            FROM hoa_don hd
            JOIN phien_ban pb ON hd.phien_ban_id = pb.id
            JOIN ban_an b ON pb.ban_an_id = b.id
            JOIN khu_vuc k ON b.khu_vuc_id = k.id
            LEFT JOIN nhan_vien nv ON hd.thu_ngan_id = nv.id
            WHERE hd.id = ?;
        `;
        return truyVanMot(sql, [id]);
    },

    /**
     * Tìm hóa đơn theo mã hóa đơn
     */
    timTheoMa(maHoaDon) {
        const sql = `
            SELECT hd.*, pb.ban_an_id, b.ten_ban, b.ma_ban, k.ten_khu_vuc
            FROM hoa_don hd
            JOIN phien_ban pb ON hd.phien_ban_id = pb.id
            JOIN ban_an b ON pb.ban_an_id = b.id
            JOIN khu_vuc k ON b.khu_vuc_id = k.id
            WHERE hd.ma_hoa_don = ?;
        `;
        return truyVanMot(sql, [maHoaDon]);
    },

    /**
     * Tìm hóa đơn chưa thanh toán của phiên bàn
     */
    timTheoPhienBan(phienBanId) {
        const sql = `
            SELECT * FROM hoa_don 
            WHERE phien_ban_id = ? AND trang_thai = 'chua_thanh_toan'
            ORDER BY ngay_tao DESC LIMIT 1;
        `;
        return truyVanMot(sql, [phienBanId]);
    },

    /**
     * Lấy các món trong chi tiết hóa đơn
     */
    layChiTietHoaDon(hoaDonId) {
        const sql = `
            SELECT cthd.*, m.ma_mon, m.don_vi_tinh, m.anh_mon_an
            FROM chi_tiet_hoa_don cthd
            JOIN mon_an m ON cthd.mon_an_id = m.id
            WHERE cthd.hoa_don_id = ?
            ORDER BY cthd.id ASC;
        `;
        return truyVanNhieu(sql, [hoaDonId]);
    },

    /**
     * Lấy danh sách món thực tế đã duyệt/đang nấu/đã phục vụ của phiên bàn để tính tạm tính
     */
    layMonThucTeCuaPhien(phienBanId) {
        const sql = `
            SELECT ct.mon_an_id, m.ten_mon, m.ma_mon, m.don_vi_tinh, ct.don_gia,
                   SUM(ct.so_luong) as tong_so_luong,
                   SUM(ct.so_luong * ct.don_gia) as tong_thanh_tien
            FROM chi_tiet_don_mon ct
            JOIN don_goi_mon dgm ON ct.don_goi_mon_id = dgm.id
            JOIN mon_an m ON ct.mon_an_id = m.id
            WHERE dgm.phien_ban_id = ?
              AND dgm.trang_thai = 'da_duyet'
              AND ct.trang_thai_mon NOT IN ('da_huy', 'huy_mon')
            GROUP BY ct.mon_an_id, m.ten_mon, m.ma_mon, m.don_vi_tinh, ct.don_gia;
        `;
        return truyVanNhieu(sql, [phienBanId]);
    },

    lyDoChanThu(phienBanId) {
        const { donCho, huyCho } = truyVanMot(`SELECT
            EXISTS (SELECT 1 FROM don_goi_mon WHERE phien_ban_id = ? AND trang_thai = 'cho_duyet') AS donCho,
            EXISTS (SELECT 1 FROM chi_tiet_don_mon ct JOIN don_goi_mon d ON d.id = ct.don_goi_mon_id
                WHERE d.phien_ban_id = ? AND (ct.trang_thai_mon = 'yeu_cau_huy' OR EXISTS (
                    SELECT 1 FROM yeu_cau_huy_mon_khach h WHERE h.chi_tiet_don_mon_id = ct.id AND h.trang_thai = 'cho_phuc_vu'
                ))) AS huyCho`, [phienBanId, phienBanId]);
        if (donCho) return 'Bàn còn đơn chờ duyệt. Hãy duyệt hoặc từ chối đơn trước khi thanh toán.';
        if (huyCho) return 'Bàn còn món chờ xử lý hủy. Hãy xử lý yêu cầu trước khi thanh toán.';
        return null;
    },

    /**
     * Tạo mới hóa đơn và chèn chi tiết hóa đơn trong transaction
     */
    taoHoaDon({
        phienBanId,
        hoaDonChaId = null,
        thayTheHoaDonId = null,
        maHoaDon,
        thuNganId = null,
        tongTienMon,
        phanTramChietKhau = 0,
        tienChietKhau = 0,
        phanTramVat = 8,
        tienVat = 0,
        tongTienThanhToan,
        phuongThucThanhToan = 'tien_mat',
        ghiChu = null,
        danhSachMon = []
    }) {
        return chayGiaoDich((db) => {
            const lyDo = this.lyDoChanThu(phienBanId);
            if (lyDo) throw Object.assign(new Error(lyDo), { status: 409 });
            if (!db.prepare("SELECT 1 FROM phien_ban WHERE id = ? AND trang_thai = 'dang_hoat_dong'").get(phienBanId))
                throw Object.assign(new Error('Phiên bàn đã thay đổi. Hãy kiểm tra lại hóa đơn.'), { status: 409 });
            if (thayTheHoaDonId) {
                const capNhat = db.prepare(`UPDATE hoa_don SET trang_thai = 'da_huy'
                    WHERE id = ? AND phien_ban_id = ? AND trang_thai = 'chua_thanh_toan'`)
                    .run(thayTheHoaDonId, phienBanId);
                if (!capNhat.changes) throw new Error('Hóa đơn đã được xử lý, vui lòng tải lại');
            }
            const chenHd = db.prepare(`
                INSERT INTO hoa_don (
                    phien_ban_id, hoa_don_cha_id, ma_hoa_don, thu_ngan_id,
                    tong_tien_mon, phan_tram_chiet_khau, tien_chiet_khau,
                    phan_tram_vat, tien_vat, tong_tien_thanh_toan,
                    phuong_thuc_thanh_toan, trang_thai, ghi_chu
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'chua_thanh_toan', ?)
            `);

            const ketQuaHd = chenHd.run(
                phienBanId,
                hoaDonChaId,
                maHoaDon,
                thuNganId,
                tongTienMon,
                phanTramChietKhau,
                tienChietKhau,
                phanTramVat,
                tienVat,
                tongTienThanhToan,
                phuongThucThanhToan,
                ghiChu
            );

            const hoaDonId = ketQuaHd.lastInsertRowid;

            const chenCt = db.prepare(`
                INSERT INTO chi_tiet_hoa_don (
                    hoa_don_id, chi_tiet_don_mon_id, mon_an_id,
                    ten_mon, don_gia, so_luong, thanh_tien
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            for (const mon of danhSachMon) {
                chenCt.run(
                    hoaDonId,
                    mon.chi_tiet_don_mon_id || null,
                    mon.mon_an_id,
                    mon.ten_mon,
                    mon.don_gia,
                    mon.so_luong,
                    mon.don_gia * mon.so_luong
                );
            }

            return hoaDonId;
        });
    },

    /**
     * Cập nhật thông tin chiết khấu của hóa đơn
     */
    capNhatChietKhau(hoaDonId, { phanTramChietKhau, tienChietKhau, tienVat, tongTienThanhToan }) {
        const sql = `
            UPDATE hoa_don 
            SET phan_tram_chiet_khau = ?,
                tien_chiet_khau = ?,
                tien_vat = ?,
                tong_tien_thanh_toan = ?
            WHERE id = ?;
        `;
        return thucThi(sql, [phanTramChietKhau, tienChietKhau, tienVat, tongTienThanhToan, hoaDonId]);
    },

    /**
     * Tạo bản ghi chia tiền nhóm (Figma C10 & P06)
     */
    taoChiaTienNhom({ hoaDonId, soNguoiChia, soTienMoiNguoi, maThamChieuQr }) {
        const sql = `
            INSERT INTO chia_tien_nhom (hoa_don_id, so_nguoi_chia, so_tien_moi_nguoi, ma_tham_chieu_qr, trang_thai)
            VALUES (?, ?, ?, ?, 'dang_thu');
        `;
        return thucThi(sql, [hoaDonId, soNguoiChia, soTienMoiNguoi, maThamChieuQr]);
    },

    /**
     * Lấy thông tin chia tiền nhóm của hóa đơn
     */
    layChiaTienNhom(hoaDonId) {
        const sql = `
            SELECT * FROM chia_tien_nhom 
            WHERE hoa_don_id = ? 
            ORDER BY ngay_tao DESC LIMIT 1;
        `;
        return truyVanMot(sql, [hoaDonId]);
    }
};

module.exports = hoaDonModel;
