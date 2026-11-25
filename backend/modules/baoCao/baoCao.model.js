// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MODEL TRUY VẤN DỮ LIỆU BÁO CÁO DOANH THU & TÀI CHÍNH ĐA CHIỀU (SQLITE3)
// ============================================================================

const { truyVanNhieu, truyVanMot } = require('../../cauHinh/ketNoiCoSoDuLieu');

/**
 * Trả về điều kiện lọc WHERE theo kỳ thời gian
 * @param {string} ky 'hom_nay' | '7_ngay' | 'thang_nay' | 'tat_ca'
 * @param {string} cotThoiGian Tên cột ngày/giờ (mặc định 'COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao)')
 */
function taoDieuKienThoiGian(ky = 'hom_nay', cotThoiGian = 'COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao)') {
    switch (ky) {
        case 'hom_nay':
            return `DATE(${cotThoiGian}, '+7 hours') = DATE('now', '+7 hours')`;
        case '7_ngay':
            return `DATE(${cotThoiGian}, '+7 hours') BETWEEN DATE('now', '+7 hours', '-6 days') AND DATE('now', '+7 hours')`;
        case 'thang_nay':
            return `strftime('%Y-%m', ${cotThoiGian}, '+7 hours') = strftime('%Y-%m', 'now', '+7 hours')`;
        case 'tat_ca':
        default:
            return `1=1`;
    }
}

const baoCaoModel = {
    /**
     * 1. BÁO CÁO TỔNG QUAN & TÀI CHÍNH
     */
    layBaoCaoTongQuan(ky = 'hom_nay') {
        const dieuKien = taoDieuKienThoiGian(ky, 'COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao)');

        // Tổng hợp chỉ số tài chính cơ bản
        const tongHop = truyVanMot(`
            SELECT 
                COUNT(DISTINCT hd.id) as tong_so_hoa_don,
                COALESCE(SUM(hd.tong_tien_thanh_toan), 0) as tong_doanh_thu,
                COALESCE(SUM(hd.tong_tien_mon), 0) as tong_tien_mon,
                COALESCE(SUM(hd.tien_chiet_khau), 0) as tong_chiet_khau,
                COALESCE(SUM(hd.tien_vat), 0) as tong_vat,
                COALESCE(SUM(pb.so_luong_khach), 0) as tong_khach_hang
            FROM hoa_don hd
            LEFT JOIN phien_ban pb ON hd.phien_ban_id = pb.id
            WHERE hd.trang_thai = 'da_thanh_toan' AND ${dieuKien};
        `) || { tong_so_hoa_don: 0, tong_doanh_thu: 0, tong_tien_mon: 0, tong_chiet_khau: 0, tong_vat: 0, tong_khach_hang: 0 };

        // Doanh thu kỳ trước để tính tăng trưởng
        let dieuKienKyTruoc = `DATE(COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao), '+7 hours') = DATE('now', '+7 hours', '-1 day')`;
        if (ky === '7_ngay') {
            dieuKienKyTruoc = `DATE(COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao), '+7 hours') >= DATE('now', '+7 hours', '-13 days') AND DATE(COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao), '+7 hours') < DATE('now', '+7 hours', '-6 days')`;
        } else if (ky === 'thang_nay') {
            dieuKienKyTruoc = `strftime('%Y-%m', COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao), '+7 hours') = strftime('%Y-%m', DATE('now', '+7 hours', 'start of month', '-1 month'))`;
        }

        const tongHopKyTruoc = truyVanMot(`
            SELECT COALESCE(SUM(hd.tong_tien_thanh_toan), 0) as tong_doanh_thu_cu
            FROM hoa_don hd
            WHERE hd.trang_thai = 'da_thanh_toan' AND ${dieuKienKyTruoc};
        `);

        // Cơ cấu phương thức thanh toán
        const kenhThanhToan = truyVanNhieu(`
            SELECT 
                CASE 
                    WHEN hd.phuong_thuc_thanh_toan = 'vietqr' THEN 'VietQR / Ngân hàng'
                    WHEN hd.phuong_thuc_thanh_toan = 'tien_mat' THEN 'Tiền mặt'
                    ELSE 'Thẻ POS / Khác'
                END as ten_kenh,
                hd.phuong_thuc_thanh_toan as ma_kenh,
                COUNT(hd.id) as so_luong_giao_dich,
                COALESCE(SUM(hd.tong_tien_thanh_toan), 0) as so_tien
            FROM hoa_don hd
            WHERE hd.trang_thai = 'da_thanh_toan' AND ${dieuKien}
            GROUP BY hd.phuong_thuc_thanh_toan
            ORDER BY so_tien DESC;
        `);

        // Phân bổ doanh thu theo danh mục thực đơn
        const coCauDanhMuc = truyVanNhieu(`
            SELECT 
                COALESCE(dm.ten_danh_muc, 'Khác') as ten_danh_muc,
                SUM(cthd.so_luong) as tong_so_luong,
                SUM(cthd.thanh_tien) as tong_doanh_thu
            FROM chi_tiet_hoa_don cthd
            JOIN hoa_don hd ON cthd.hoa_don_id = hd.id
            JOIN mon_an m ON cthd.mon_an_id = m.id
            LEFT JOIN danh_muc_mon dm ON m.danh_muc_id = dm.id
            WHERE hd.trang_thai = 'da_thanh_toan' AND ${dieuKien}
            GROUP BY dm.id, dm.ten_danh_muc
            ORDER BY tong_doanh_thu DESC;
        `);

        return {
            tongHop,
            doanhThuKyTruoc: tongHopKyTruoc ? tongHopKyTruoc.tong_doanh_thu_cu : 0,
            kenhThanhToan,
            coCauDanhMuc
        };
    },

    /**
     * 2. BÁO CÁO XU HƯỚNG THEO THỜI GIAN & CA LÀM VIỆC
     */
    layBaoCaoTheoThoiGian(ky = '7_ngay') {
        const dieuKien = taoDieuKienThoiGian(ky, 'COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao)');

        // Doanh thu theo từng ngày
        const theoNgay = truyVanNhieu(`
            SELECT 
                DATE(COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao), '+7 hours') as ngay,
                COUNT(hd.id) as so_hoa_don,
                COALESCE(SUM(hd.tong_tien_thanh_toan), 0) as tong_doanh_thu,
                COALESCE(SUM(pb.so_luong_khach), 0) as so_khach
            FROM hoa_don hd
            LEFT JOIN phien_ban pb ON hd.phien_ban_id = pb.id
            WHERE hd.trang_thai = 'da_thanh_toan' AND ${dieuKien}
            GROUP BY DATE(COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao), '+7 hours')
            ORDER BY DATE(COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao), '+7 hours') ASC;
        `);

        // Doanh thu phân bổ theo Ca làm việc (Dựa vào giờ phát sinh hóa đơn)
        const theoCa = truyVanNhieu(`
            SELECT 
                CASE 
                    WHEN CAST(strftime('%H', COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao), '+7 hours') AS INTEGER) BETWEEN 6 AND 14 THEN 'Ca Sáng (06h - 14h)'
                    WHEN CAST(strftime('%H', COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao), '+7 hours') AS INTEGER) BETWEEN 15 AND 22 THEN 'Ca Tối (15h - 22h)'
                    ELSE 'Ca Đêm / Ngoài giờ'
                END as ten_ca,
                COUNT(hd.id) as so_hoa_don,
                COALESCE(SUM(hd.tong_tien_thanh_toan), 0) as tong_doanh_thu
            FROM hoa_don hd
            WHERE hd.trang_thai = 'da_thanh_toan' AND ${dieuKien}
            GROUP BY ten_ca
            ORDER BY tong_doanh_thu DESC;
        `);

        // Biến động theo khung giờ trong ngày (Peak hours)
        const theoKhungGio = truyVanNhieu(`
            SELECT 
                strftime('%H:00', COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao), '+7 hours') as khung_gio,
                COUNT(hd.id) as so_hoa_don,
                COALESCE(SUM(hd.tong_tien_thanh_toan), 0) as tong_doanh_thu
            FROM hoa_don hd
            WHERE hd.trang_thai = 'da_thanh_toan' AND ${dieuKien}
            GROUP BY strftime('%H:00', COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao), '+7 hours')
            ORDER BY khung_gio ASC;
        `);

        return {
            theoNgay,
            theoCa,
            theoKhungGio
        };
    },

    /**
     * 3. BÁO CÁO MÓN ĂN & MẶT HÀNG BÁN CHẠY (BEST SELLERS)
     */
    layBaoCaoMonAn(ky = 'hom_nay') {
        const dieuKien = taoDieuKienThoiGian(ky, 'COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao)');

        // Xếp hạng món bán chạy nhất theo doanh thu
        const topMonDoanhThu = truyVanNhieu(`
            SELECT 
                cthd.mon_an_id,
                cthd.ten_mon,
                dm.ten_danh_muc,
                m.anh_mon_an,
                m.don_gia,
                m.so_suat_con_lai,
                SUM(cthd.so_luong) as tong_so_luong,
                SUM(cthd.thanh_tien) as tong_doanh_thu
            FROM chi_tiet_hoa_don cthd
            JOIN hoa_don hd ON cthd.hoa_don_id = hd.id
            JOIN mon_an m ON cthd.mon_an_id = m.id
            LEFT JOIN danh_muc_mon dm ON m.danh_muc_id = dm.id
            WHERE hd.trang_thai = 'da_thanh_toan' AND ${dieuKien}
            GROUP BY cthd.mon_an_id, cthd.ten_mon, dm.ten_danh_muc, m.anh_mon_an, m.don_gia, m.so_suat_con_lai
            ORDER BY tong_doanh_thu DESC
            LIMIT 10;
        `);

        // Xếp hạng món theo số lượng đĩa/phần bán ra
        const topMonSoLuong = truyVanNhieu(`
            SELECT 
                cthd.mon_an_id,
                cthd.ten_mon,
                dm.ten_danh_muc,
                SUM(cthd.so_luong) as tong_so_luong,
                SUM(cthd.thanh_tien) as tong_doanh_thu
            FROM chi_tiet_hoa_don cthd
            JOIN hoa_don hd ON cthd.hoa_don_id = hd.id
            JOIN mon_an m ON cthd.mon_an_id = m.id
            LEFT JOIN danh_muc_mon dm ON m.danh_muc_id = dm.id
            WHERE hd.trang_thai = 'da_thanh_toan' AND ${dieuKien}
            GROUP BY cthd.mon_an_id, cthd.ten_mon, dm.ten_danh_muc
            ORDER BY tong_so_luong DESC
            LIMIT 10;
        `);

        // Báo cáo món bị hủy / hao hụt (Thất thoát)
        const monHuyThatThoat = truyVanNhieu(`
            SELECT 
                y.id,
                m.ten_mon,
                ctd.so_luong,
                ctd.don_gia,
                (ctd.so_luong * ctd.don_gia) as tien_that_thoat,
                y.ly_do_huy,
                nv.ho_ten as nguoi_yeu_cau,
                y.thoi_gian_yeu_cau
            FROM yeu_cau_huy_mon y
            JOIN chi_tiet_don_mon ctd ON y.chi_tiet_don_mon_id = ctd.id
            JOIN mon_an m ON ctd.mon_an_id = m.id
            LEFT JOIN nhan_vien nv ON y.nhan_vien_yeu_cau_id = nv.id
            WHERE y.trang_thai_yeu_cau = 'da_chap_thuan'
            ORDER BY y.thoi_gian_yeu_cau DESC
            LIMIT 10;
        `);

        // Danh sách kiểm soát số suất tồn hôm nay
        const kiemSoatSuat = truyVanNhieu(`
            SELECT 
                m.id,
                m.ten_mon,
                m.don_gia,
                m.so_suat_con_lai,
                m.con_mon,
                dm.ten_danh_muc
            FROM mon_an m
            LEFT JOIN danh_muc_mon dm ON m.danh_muc_id = dm.id
            WHERE m.kich_hoat = 1
            ORDER BY 
                CASE 
                    WHEN m.so_suat_con_lai = 0 THEN 1
                    WHEN m.so_suat_con_lai > 0 THEN 2
                    ELSE 3
                END, m.so_suat_con_lai ASC;
        `);

        return {
            topMonDoanhThu,
            topMonSoLuong,
            monHuyThatThoat,
            kiemSoatSuat
        };
    },

    /**
     * 4. BÁO CÁO DOANH THU THEO KHU VỰC & PHÒNG BÀN
     */
    layBaoCaoKhuVucBan(ky = 'hom_nay') {
        const dieuKien = taoDieuKienThoiGian(ky, 'COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao)');

        // Doanh thu theo từng Khu vực (Tầng 1, Tầng 2, VIP)
        const theoKhuVuc = truyVanNhieu(`
            SELECT 
                kv.id as khu_vuc_id,
                kv.ten_khu_vuc,
                COUNT(DISTINCT hd.id) as so_hoa_don,
                COALESCE(SUM(hd.tong_tien_thanh_toan), 0) as tong_doanh_thu,
                COALESCE(SUM(pb.so_luong_khach), 0) as tong_khach
            FROM khu_vuc kv
            JOIN ban_an b ON kv.id = b.khu_vuc_id
            JOIN phien_ban pb ON b.id = pb.ban_an_id
            JOIN hoa_don hd ON pb.id = hd.phien_ban_id
            WHERE hd.trang_thai = 'da_thanh_toan' AND ${dieuKien}
            GROUP BY kv.id, kv.ten_khu_vuc
            ORDER BY tong_doanh_thu DESC;
        `);

        // Hiệu suất & doanh thu từng bàn cụ thể
        const theoBan = truyVanNhieu(`
            SELECT 
                b.id as ban_id,
                b.ma_ban,
                b.ten_ban,
                kv.ten_khu_vuc,
                COUNT(DISTINCT hd.id) as so_luot_phuc_vu,
                COALESCE(SUM(hd.tong_tien_thanh_toan), 0) as tong_doanh_thu,
                COALESCE(SUM(pb.so_luong_khach), 0) as tong_khach
            FROM ban_an b
            JOIN khu_vuc kv ON b.khu_vuc_id = kv.id
            LEFT JOIN phien_ban pb ON b.id = pb.ban_an_id
            LEFT JOIN hoa_don hd ON pb.id = hd.phien_ban_id AND hd.trang_thai = 'da_thanh_toan' AND ${dieuKien}
            WHERE b.kich_hoat = 1
            GROUP BY b.id, b.ma_ban, b.ten_ban, kv.ten_khu_vuc
            ORDER BY tong_doanh_thu DESC;
        `);

        return {
            theoKhuVuc,
            theoBan
        };
    },

    /**
     * 5. BÁO CÁO SỔ QUỸ & CHỐT CA THU - CHI NỘI BỘ (Z-REPORT)
     */
    layBaoCaoSoQuy(ky = 'hom_nay') {
        const dieuKienThu = taoDieuKienThoiGian(ky, 'thoi_gian_thu');
        const dieuKienPtc = taoDieuKienThoiGian(ky, 'ptc.thoi_gian_tao');

        const { tienMatHd, vietQrHd } = truyVanMot(`
            WITH cac_dot_thu AS (
                SELECT so_tien, phuong_thuc, thoi_gian_tao AS thoi_gian_thu
                FROM giao_dich_thanh_toan WHERE trang_thai='thanh_cong'
                UNION ALL
                SELECT hd.tong_tien_thanh_toan, UPPER(hd.phuong_thuc_thanh_toan),
                    COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao)
                FROM hoa_don hd WHERE hd.trang_thai='da_thanh_toan'
                AND NOT EXISTS (
                    SELECT 1 FROM giao_dich_thanh_toan g JOIN hoa_don h ON h.id=g.hoa_don_id
                    WHERE g.hoa_don_id=hd.id OR (h.phien_ban_id=hd.phien_ban_id
                        AND EXISTS (SELECT 1 FROM phieu_thu_mot_phan p WHERE p.giao_dich_id=g.id))
                )
            )
            SELECT COALESCE(SUM(CASE WHEN phuong_thuc='TIEN_MAT' THEN so_tien END),0) AS tienMatHd,
                COALESCE(SUM(CASE WHEN phuong_thuc='VIETQR' THEN so_tien END),0) AS vietQrHd
            FROM cac_dot_thu WHERE ${dieuKienThu}
        `);

        // Tổng chi nội bộ từ phiếu thu chi
        const tongChiNoiBo = truyVanMot(`
            SELECT COALESCE(SUM(ptc.so_tien), 0) as tong_chi
            FROM phieu_thu_chi_noi_bo ptc
            WHERE ptc.loai = 'CHI' AND ${dieuKienPtc};
        `)?.tong_chi || 0;

        // Tổng thu nội bộ khác (nếu có)
        const tongThuKhac = truyVanMot(`
            SELECT COALESCE(SUM(ptc.so_tien), 0) as tong_thu
            FROM phieu_thu_chi_noi_bo ptc
            WHERE ptc.loai = 'THU' AND ${dieuKienPtc};
        `)?.tong_thu || 0;

        // Danh sách phiếu thu chi nội bộ chi tiết
        const danhSachPhieu = truyVanNhieu(`
            SELECT 
                ptc.id,
                ptc.loai,
                ptc.so_tien,
                ptc.ly_do,
                ptc.thoi_gian_tao,
                nv.ho_ten as nguoi_tao
            FROM phieu_thu_chi_noi_bo ptc
            LEFT JOIN nhan_vien nv ON ptc.nguoi_tao_id = nv.id
            WHERE ${dieuKienPtc}
            ORDER BY ptc.thoi_gian_tao DESC;
        `);

        // Tồn quỹ tiền mặt tính toán
        const tonQuyTienMat = tienMatHd + tongThuKhac - tongChiNoiBo;

        return {
            tienMatHd,
            vietQrHd,
            tongChiNoiBo,
            tongThuKhac,
            tonQuyTienMat,
            tongDongTien: tienMatHd + vietQrHd,
            danhSachPhieu
        };
    },

    /**
     * 6. BÁO CÁO KÊNH GỌI MÓN & ĐÁNH GIÁ KHÁCH HÀNG
     */
    layBaoCaoKenhVaDanhGia(ky = 'hom_nay') {
        const dieuKienDgm = taoDieuKienThoiGian(ky, 'dgm.thoi_gian_gui');

        // Cơ cấu nguồn đặt món (Khách quét QR vs Nhân viên đặt hộ)
        const coCauKenh = truyVanNhieu(`
            SELECT 
                CASE 
                    WHEN dgm.nguon_tao = 'khach_qr' THEN 'Khách tự quét mã QR'
                    ELSE 'Nhân viên phục vụ gọi hộ'
                END as ten_kenh,
                dgm.nguon_tao,
                COUNT(dgm.id) as so_don
            FROM don_goi_mon dgm
            WHERE ${dieuKienDgm}
            GROUP BY dgm.nguon_tao;
        `);

        // Thống kê đánh giá sao từ khách
        const thongKeSao = truyVanMot(`
            SELECT 
                COUNT(*) as tong_danh_gia,
                COALESCE(ROUND(AVG(so_sao), 1), 5.0) as diem_trung_binh,
                SUM(CASE WHEN so_sao = 5 THEN 1 ELSE 0 END) as sao_5,
                SUM(CASE WHEN so_sao = 4 THEN 1 ELSE 0 END) as sao_4,
                SUM(CASE WHEN so_sao = 3 THEN 1 ELSE 0 END) as sao_3,
                SUM(CASE WHEN so_sao = 2 THEN 1 ELSE 0 END) as sao_2,
                SUM(CASE WHEN so_sao = 1 THEN 1 ELSE 0 END) as sao_1
            FROM danh_gia;
        `) || { tong_danh_gia: 0, diem_trung_binh: 5.0, sao_5: 0, sao_4: 0, sao_3: 0, sao_2: 0, sao_1: 0 };

        // Danh sách nhận xét gần nhất từ khách hàng
        const danhSachNhanXet = truyVanNhieu(`
            SELECT 
                dg.id,
                dg.so_sao,
                dg.nhan_xet,
                dg.ten_khach_hang,
                dg.so_dien_thoai,
                dg.ngay_tao
            FROM danh_gia dg
            ORDER BY dg.ngay_tao DESC
            LIMIT 10;
        `);

        // Hiệu suất doanh số theo nhân sự thu ngân / phục vụ
        const dieuKienHd = taoDieuKienThoiGian(ky, 'COALESCE(hd.thoi_gian_thanh_toan, hd.ngay_tao)');
        const hieuSuatNhanSu = truyVanNhieu(`
            SELECT 
                nv.id as nhan_vien_id,
                nv.ho_ten,
                vt.ten_vai_tro,
                COUNT(hd.id) as so_hoa_don,
                COALESCE(SUM(hd.tong_tien_thanh_toan), 0) as tong_doanh_thu
            FROM nhan_vien nv
            JOIN tai_khoan tk ON nv.tai_khoan_id = tk.id
            JOIN vai_tro vt ON tk.vai_tro_id = vt.id
            LEFT JOIN hoa_don hd ON hd.thu_ngan_id = nv.id AND hd.trang_thai = 'da_thanh_toan' AND ${dieuKienHd}
            GROUP BY nv.id, nv.ho_ten, vt.ten_vai_tro
            ORDER BY tong_doanh_thu DESC;
        `);

        return {
            coCauKenh,
            thongKeSao,
            danhSachNhanXet,
            hieuSuatNhanSu
        };
    }
};

module.exports = baoCaoModel;
