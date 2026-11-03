/**
 * Model truy vấn thống kê dữ liệu báo cáo
 * Phụ trách: Nhật (PM / Backend Core Architect)
 */
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

function layTongQuanNgay(ngay = null) {
    const thamSoNgay = ngay || null;

    // 1. Doanh thu hôm nay
    const rowDoanhThu = ketNoiCoSoDuLieu.layMot(`
        SELECT COALESCE(SUM(tong_thanh_toan), 0) AS tong_doanh_thu,
               COUNT(id) AS so_hoa_don
        FROM hoa_don 
        WHERE trang_thai = 'da_thanh_toan' 
          AND date(thoi_gian_tao) = date(COALESCE(?, 'now', 'localtime'))
    `, [thamSoNgay]);

    // 2. Số lượng khách phục vụ hôm nay
    const rowKhach = ketNoiCoSoDuLieu.layMot(`
        SELECT COALESCE(SUM(so_khach), 0) AS so_khach
        FROM phien_ban 
        WHERE date(thoi_gian_bat_dau) = date(COALESCE(?, 'now', 'localtime'))
    `, [thamSoNgay]);

    // 3. Doanh thu hôm qua để tính tỷ lệ tăng trưởng
    const rowHomQua = ketNoiCoSoDuLieu.layMot(`
        SELECT COALESCE(SUM(tong_thanh_toan), 0) AS doanh_thu_hom_qua
        FROM hoa_don 
        WHERE trang_thai = 'da_thanh_toan' 
          AND date(thoi_gian_tao) = date(COALESCE(?, 'now', 'localtime'), '-1 day')
    `, [thamSoNgay]);

    const tongDoanhThuNgay = rowDoanhThu ? rowDoanhThu.tong_doanh_thu : 0;
    const soHoaDonNgay = rowDoanhThu ? rowDoanhThu.so_hoa_don : 0;
    const soKhachPhucVu = rowKhach ? (rowKhach.so_khach || 0) : 0;
    const doanhThuHomQua = rowHomQua ? rowHomQua.doanh_thu_hom_qua : 0;

    const giaTriTrungBinhDon = soHoaDonNgay > 0 ? Math.round(tongDoanhThuNgay / soHoaDonNgay) : 0;
    let tyLeTangTruong = 0;
    if (doanhThuHomQua > 0) {
        tyLeTangTruong = Number((((tongDoanhThuNgay - doanhThuHomQua) / doanhThuHomQua) * 100).toFixed(1));
    }

    return {
        tongDoanhThuNgay,
        soHoaDonNgay,
        soKhachPhucVu,
        giaTriTrungBinhDon,
        doanhThuHomQua,
        tyLeTangTruong
    };
}

function layDoanhThuTheoChuKy(ky = 'ngay', tuNgay = null, denNgay = null) {
    if (tuNgay && denNgay) {
        const sql = `
            SELECT date(thoi_gian_tao) AS moc_thoi_gian,
                   COALESCE(SUM(tong_thanh_toan), 0) AS doanh_thu,
                   COUNT(id) AS so_don
            FROM hoa_don
            WHERE trang_thai = 'da_thanh_toan' 
              AND date(thoi_gian_tao) >= date(?)
              AND date(thoi_gian_tao) <= date(?)
            GROUP BY moc_thoi_gian
            ORDER BY moc_thoi_gian ASC
        `;
        return ketNoiCoSoDuLieu.layNhieu(sql, [tuNgay, denNgay]);
    }

    let sql = '';
    if (ky === 'tuan') {
        sql = `
            SELECT strftime('%Y-W%W', thoi_gian_tao) AS moc_thoi_gian,
                   COALESCE(SUM(tong_thanh_toan), 0) AS doanh_thu,
                   COUNT(id) AS so_don
            FROM hoa_don
            WHERE trang_thai = 'da_thanh_toan' 
              AND thoi_gian_tao >= date('now', 'localtime', '-8 weeks')
            GROUP BY moc_thoi_gian
            ORDER BY moc_thoi_gian ASC
        `;
    } else if (ky === 'thang') {
        sql = `
            SELECT strftime('%Y-%m', thoi_gian_tao) AS moc_thoi_gian,
                   COALESCE(SUM(tong_thanh_toan), 0) AS doanh_thu,
                   COUNT(id) AS so_don
            FROM hoa_don
            WHERE trang_thai = 'da_thanh_toan' 
              AND thoi_gian_tao >= date('now', 'localtime', '-12 months')
            GROUP BY moc_thoi_gian
            ORDER BY moc_thoi_gian ASC
        `;
    } else {
        // Mặc định: 7 ngày gần nhất
        sql = `
            SELECT date(thoi_gian_tao) AS moc_thoi_gian,
                   COALESCE(SUM(tong_thanh_toan), 0) AS doanh_thu,
                   COUNT(id) AS so_don
            FROM hoa_don
            WHERE trang_thai = 'da_thanh_toan' 
              AND thoi_gian_tao >= date('now', 'localtime', '-6 days')
            GROUP BY moc_thoi_gian
            ORDER BY moc_thoi_gian ASC
        `;
    }

    const ketQua = ketNoiCoSoDuLieu.layNhieu(sql);
    return ketQua;
}

function layTyTrongPhuongThuc() {
    const sql = `
        SELECT phuong_thuc_thanh_toan,
               COALESCE(SUM(tong_thanh_toan), 0) AS tong_tien,
               COUNT(id) AS so_don
        FROM hoa_don
        WHERE trang_thai = 'da_thanh_toan'
        GROUP BY phuong_thuc_thanh_toan
    `;
    const rows = ketNoiCoSoDuLieu.layNhieu(sql);

    let tienMat = 0;
    let chuyenKhoan = 0;
    let soDonTienMat = 0;
    let soDonChuyenKhoan = 0;

    for (const r of rows) {
        if (r.phuong_thuc_thanh_toan === 'tien_mat') {
            tienMat = r.tong_tien;
            soDonTienMat = r.so_don;
        } else if (r.phuong_thuc_thanh_toan === 'chuyen_khoan') {
            chuyenKhoan = r.tong_tien;
            soDonChuyenKhoan = r.so_don;
        }
    }

    const tongCong = tienMat + chuyenKhoan;
    const phanTramTienMat = tongCong > 0 ? Number(((tienMat / tongCong) * 100).toFixed(1)) : 0;
    const phanTramChuyenKhoan = tongCong > 0 ? Number(((chuyenKhoan / tongCong) * 100).toFixed(1)) : 0;

    return {
        tienMat,
        chuyenKhoan,
        soDonTienMat,
        soDonChuyenKhoan,
        tongCong,
        phanTramTienMat,
        phanTramChuyenKhoan
    };
}

function layDoanhThuTheoDanhMuc() {
    const sql = `
        SELECT dm.id AS danh_muc_id,
               dm.ten_danh_muc,
               COALESCE(SUM(ct.thanh_tien), 0) AS tong_doanh_thu,
               COALESCE(SUM(ct.so_luong), 0) AS tong_so_luong
        FROM danh_muc_mon dm
        LEFT JOIN mon_an m ON m.danh_muc_id = dm.id
        LEFT JOIN chi_tiet_hoa_don ct ON ct.mon_an_id = m.id
        LEFT JOIN hoa_don hd ON ct.hoa_don_id = hd.id AND hd.trang_thai = 'da_thanh_toan'
        GROUP BY dm.id, dm.ten_danh_muc
        ORDER BY tong_doanh_thu DESC
    `;
    return ketNoiCoSoDuLieu.layNhieu(sql);
}

function layTopMon(gioiHan = 10) {
    // 1. Top món bán chạy nhất
    const sqlBanChay = `
        SELECT m.id, m.ma_mon, m.ten_mon, m.gia_ban, dm.ten_danh_muc,
               COALESCE(SUM(ct.so_luong), 0) AS da_ban,
               COALESCE(SUM(ct.thanh_tien), 0) AS doanh_thu
        FROM mon_an m
        JOIN danh_muc_mon dm ON m.danh_muc_id = dm.id
        JOIN chi_tiet_hoa_don ct ON ct.mon_an_id = m.id
        JOIN hoa_don hd ON ct.hoa_don_id = hd.id AND hd.trang_thai = 'da_thanh_toan'
        GROUP BY m.id, m.ma_mon, m.ten_mon, m.gia_ban, dm.ten_danh_muc
        ORDER BY da_ban DESC
        LIMIT ?
    `;
    const topBanChay = ketNoiCoSoDuLieu.layNhieu(sqlBanChay, [gioiHan]);

    // 2. Top món bán chậm / ít người gọi nhất
    const sqlBanCham = `
        SELECT m.id, m.ma_mon, m.ten_mon, m.gia_ban, dm.ten_danh_muc,
               COALESCE(SUM(ct.so_luong), 0) AS da_ban,
               COALESCE(SUM(ct.thanh_tien), 0) AS doanh_thu
        FROM mon_an m
        JOIN danh_muc_mon dm ON m.danh_muc_id = dm.id
        LEFT JOIN chi_tiet_hoa_don ct ON ct.mon_an_id = m.id
        LEFT JOIN hoa_don hd ON ct.hoa_don_id = hd.id AND hd.trang_thai = 'da_thanh_toan'
        WHERE m.da_xoa = 0
        GROUP BY m.id, m.ma_mon, m.ten_mon, m.gia_ban, dm.ten_danh_muc
        ORDER BY da_ban ASC
        LIMIT 5
    `;
    const topBanCham = ketNoiCoSoDuLieu.layNhieu(sqlBanCham);

    return {
        topBanChay,
        topBanCham
    };
}

function layKhungGioCaoDiem() {
    const sql = `
        SELECT CAST(strftime('%H', thoi_gian_tao) AS INTEGER) AS gio,
               COUNT(id) AS so_don,
               COALESCE(SUM(tong_thanh_toan), 0) AS doanh_thu
        FROM hoa_don
        WHERE trang_thai = 'da_thanh_toan'
        GROUP BY gio
    `;
    const rows = ketNoiCoSoDuLieu.layNhieu(sql);
    const mapGio = new Map();
    for (const r of rows) {
        mapGio.set(r.gio, r);
    }

    const danhSach24Gio = [];
    for (let h = 0; h < 24; h++) {
        const tim = mapGio.get(h);
        danhSach24Gio.push({
            gio: h,
            nhan: `${h.toString().padStart(2, '0')}:00`,
            soDon: tim ? tim.so_don : 0,
            doanhThu: tim ? tim.doanh_thu : 0
        });
    }

    return danhSach24Gio;
}

function layThongKeHuyMon() {
    const rowHuy = ketNoiCoSoDuLieu.layMot(`
        SELECT COUNT(id) AS tong_so_mon_huy
        FROM yeu_cau_huy_tra_mon
    `) || { tong_so_mon_huy: 0 };

    const sqlLyDo = `
        SELECT ly_do, COUNT(id) AS so_luong
        FROM yeu_cau_huy_tra_mon
        GROUP BY ly_do
        ORDER BY so_luong DESC
    `;
    const danhSachLyDo = ketNoiCoSoDuLieu.layNhieu(sqlLyDo);

    return {
        tongSoMonHuy: rowHuy.tong_so_mon_huy,
        danhSachLyDo
    };
}

module.exports = {
    layTongQuanNgay,
    layDoanhThuTheoChuKy,
    layTyTrongPhuongThuc,
    layDoanhThuTheoDanhMuc,
    layTopMon,
    layKhungGioCaoDiem,
    layThongKeHuyMon
};
