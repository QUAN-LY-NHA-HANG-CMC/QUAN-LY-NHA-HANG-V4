-- ========================================================
-- MIGRATION SPRINT 3: HÓA ĐƠN, THANH TOÁN, KHUYẾN MÃI & CHUYỂN GHÉP BÀN
-- Phụ trách: Phát (Database Specialist)
-- ========================================================

-- 1. Bảng Chương trình Khuyến mãi & Mã giảm giá
CREATE TABLE IF NOT EXISTS khuyen_mai (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_khuyen_mai TEXT UNIQUE NOT NULL,
    ten_chuong_trinh TEXT NOT NULL,
    loai_giam TEXT CHECK(loai_giam IN ('phan_tram', 'so_tien')) NOT NULL DEFAULT 'phan_tram',
    gia_tri_giam REAL NOT NULL CHECK(gia_tri_giam > 0),
    giam_toi_da REAL DEFAULT 0,
    don_toi_thieu REAL DEFAULT 0,
    ngay_bat_dau DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_ket_thuc DATETIME,
    so_luot_dung INTEGER DEFAULT 0,
    gioi_han_luot_dung INTEGER DEFAULT 1000,
    trang_thai INTEGER DEFAULT 1
);

-- 2. Bảng Hóa đơn thanh toán (Invoices)
CREATE TABLE IF NOT EXISTS hoa_don (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_hoa_don TEXT UNIQUE NOT NULL,
    phien_ban_id INTEGER NOT NULL,
    ban_an_id INTEGER NOT NULL,
    tong_tien_mon REAL NOT NULL DEFAULT 0,
    khuyen_mai_id INTEGER,
    tien_giam_gia REAL DEFAULT 0,
    ty_le_vat REAL DEFAULT 10,
    tien_vat REAL DEFAULT 0,
    phu_phi REAL DEFAULT 0,
    tong_thanh_toan REAL NOT NULL DEFAULT 0,
    phuong_thuc_thanh_toan TEXT CHECK(phuong_thuc_thanh_toan IN ('tien_mat', 'chuyen_khoan', 'the', 'chua_thanh_toan')) DEFAULT 'chua_thanh_toan',
    trang_thai TEXT CHECK(trang_thai IN ('tam_tinh', 'da_thanh_toan', 'da_huy')) DEFAULT 'tam_tinh',
    thoi_gian_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_thanh_toan DATETIME,
    ghi_chu TEXT,
    FOREIGN KEY (phien_ban_id) REFERENCES phien_ban(id),
    FOREIGN KEY (ban_an_id) REFERENCES ban_an(id),
    FOREIGN KEY (khuyen_mai_id) REFERENCES khuyen_mai(id)
);

-- 3. Bảng Chi tiết dòng hóa đơn (Invoice Items)
CREATE TABLE IF NOT EXISTS chi_tiet_hoa_don (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hoa_don_id INTEGER NOT NULL,
    mon_an_id INTEGER NOT NULL,
    ten_mon TEXT NOT NULL,
    so_luong INTEGER NOT NULL CHECK(so_luong > 0),
    don_gia REAL NOT NULL CHECK(don_gia >= 0),
    thanh_tien REAL NOT NULL CHECK(thanh_tien >= 0),
    tuy_chon_chon TEXT,
    FOREIGN KEY (hoa_don_id) REFERENCES hoa_don(id) ON DELETE CASCADE
);

-- 4. Bảng Giao dịch thanh toán (Payments)
CREATE TABLE IF NOT EXISTS giao_dich_thanh_toan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hoa_don_id INTEGER NOT NULL,
    ma_giao_dich TEXT UNIQUE NOT NULL,
    phuong_thuc TEXT NOT NULL CHECK(phuong_thuc IN ('tien_mat', 'chuyen_khoan_vietqr', 'the')),
    so_tien_phai_tra REAL NOT NULL,
    so_tien_khach_dua REAL NOT NULL,
    tien_thoi_lai REAL DEFAULT 0,
    ma_chuyen_khoan TEXT,
    trang_thai TEXT CHECK(trang_thai IN ('thanh_cong', 'that_bai', 'dang_cho')) DEFAULT 'thanh_cong',
    thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hoa_don_id) REFERENCES hoa_don(id)
);

-- 5. Bảng Lịch sử chuyển bàn và ghép bàn
CREATE TABLE IF NOT EXISTS lich_su_chuyen_ghep_ban (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loai_thao_tac TEXT NOT NULL CHECK(loai_thao_tac IN ('chuyen_ban', 'ghep_ban', 'tach_ban')),
    ban_nguon_id INTEGER NOT NULL,
    ban_dich_id INTEGER NOT NULL,
    phien_ban_nguon_id INTEGER NOT NULL,
    phien_ban_dich_id INTEGER,
    nguoi_thuc_hien TEXT DEFAULT 'Nhân viên',
    ly_do TEXT,
    thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ban_nguon_id) REFERENCES ban_an(id),
    FOREIGN KEY (ban_dich_id) REFERENCES ban_an(id)
);

-- 6. Bảng Phiếu yêu cầu hủy/trả món
CREATE TABLE IF NOT EXISTS yeu_cau_huy_tra_mon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    don_goi_mon_id INTEGER NOT NULL,
    chi_tiet_don_mon_id INTEGER NOT NULL,
    loai_yeu_cau TEXT CHECK(loai_yeu_cau IN ('huy_mon', 'doi_mon', 'tra_mon')) NOT NULL,
    ly_do TEXT NOT NULL,
    co_that_thoat_nguyen_lieu INTEGER DEFAULT 0,
    nguoi_duyet TEXT,
    trang_thai TEXT CHECK(trang_thai IN ('cho_duyet', 'da_duyet', 'tu_choi')) DEFAULT 'cho_duyet',
    thoi_gian_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_xu_ly DATETIME
);

-- Chỉ mục tối ưu hóa truy vấn Sprint 3
CREATE INDEX IF NOT EXISTS idx_hoa_don_phien ON hoa_don(phien_ban_id);
CREATE INDEX IF NOT EXISTS idx_hoa_don_ban ON hoa_don(ban_an_id, trang_thai);
CREATE INDEX IF NOT EXISTS idx_chi_tiet_hoa_don ON chi_tiet_hoa_don(hoa_don_id);
CREATE INDEX IF NOT EXISTS idx_khuyen_mai_ma ON khuyen_mai(ma_khuyen_mai);
CREATE INDEX IF NOT EXISTS idx_giao_dich_hoa_don ON giao_dich_thanh_toan(hoa_don_id);

-- Dữ liệu mẫu Khuyến mãi
INSERT OR IGNORE INTO khuyen_mai (id, ma_khuyen_mai, ten_chuong_trinh, loai_giam, gia_tri_giam, giam_toi_da, don_toi_thieu, trang_thai)
VALUES 
(1, 'KM10', 'Giảm 10% hóa đơn từ 200k', 'phan_tram', 10, 50000, 200000, 1),
(2, 'QUANMOC50K', 'Giảm 50k cho hóa đơn từ 300k', 'so_tien', 50000, 50000, 300000, 1),
(3, 'KHAITRUONG', 'Ưu đãi khai trương giảm 15%', 'phan_tram', 15, 100000, 150000, 1);
