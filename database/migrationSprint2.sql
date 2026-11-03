-- ========================================================
-- MIGRATION SPRINT 2: PHI├èN B├ÇN, ─Éß║╢T M├ôN & ─Éß╗ÆNG Bß╗ÿ THß╗£I GIAN THß╗░C
-- Phß╗Ñ tr├ích: Ph├ít (Database Specialist)
-- ========================================================

-- 1. Bß║úng Phi├¬n phß╗Ñc vß╗Ñ tß║íi b├án (Table Session)
CREATE TABLE IF NOT EXISTS phien_ban (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ban_an_id INTEGER NOT NULL,
    ma_phien TEXT UNIQUE NOT NULL,
    thoi_gian_bat_dau DATETIME DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_ket_thuc DATETIME,
    trang_thai TEXT CHECK(trang_thai IN ('dang_su_dung', 'cho_thanh_toan', 'da_thanh_toan', 'da_huy')) DEFAULT 'dang_su_dung',
    tong_tien_tam_tinh REAL DEFAULT 0,
    FOREIGN KEY (ban_an_id) REFERENCES ban_an(id)
);

-- 2. Bß║úng Giß╗Å h├áng tß║ím thß╗¥i tß║íi b├án
CREATE TABLE IF NOT EXISTS gio_hang_tam (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phien_ban_id INTEGER NOT NULL,
    du_lieu_gio_hang TEXT NOT NULL DEFAULT '[]',
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phien_ban_id) REFERENCES phien_ban(id) ON DELETE CASCADE
);

-- 3. Bß║úng ─É╞ín ─æß║╖t m├│n (Orders)
CREATE TABLE IF NOT EXISTS don_goi_mon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phien_ban_id INTEGER NOT NULL,
    ban_an_id INTEGER NOT NULL,
    ma_don TEXT UNIQUE NOT NULL,
    lan_goi INTEGER DEFAULT 1,
    tong_tien_don REAL DEFAULT 0,
    ghi_chu TEXT,
    trang_thai TEXT CHECK(trang_thai IN ('cho_xac_nhan', 'dang_che_bien', 'hoan_thanh', 'da_phuc_vu', 'tu_choi', 'da_huy')) DEFAULT 'cho_xac_nhan',
    thoi_gian_dat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phien_ban_id) REFERENCES phien_ban(id),
    FOREIGN KEY (ban_an_id) REFERENCES ban_an(id)
);

-- 4. Bß║úng Chi tiß║┐t m├│n ─ân trong ─æ╞ín (Order Items)
CREATE TABLE IF NOT EXISTS chi_tiet_don_mon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    don_goi_mon_id INTEGER NOT NULL,
    mon_an_id INTEGER NOT NULL,
    ten_mon TEXT NOT NULL,
    so_luong INTEGER NOT NULL CHECK(so_luong > 0),
    don_gia REAL NOT NULL CHECK(don_gia >= 0),
    thanh_tien REAL NOT NULL CHECK(thanh_tien >= 0),
    tuy_chon_chon TEXT,
    ghi_chu_mon TEXT,
    trang_thai TEXT CHECK(trang_thai IN ('cho_xac_nhan', 'dang_che_bien', 'hoan_thanh', 'da_phuc_vu', 'tu_choi', 'da_huy')) DEFAULT 'cho_xac_nhan',
    FOREIGN KEY (don_goi_mon_id) REFERENCES don_goi_mon(id) ON DELETE CASCADE,
    FOREIGN KEY (mon_an_id) REFERENCES mon_an(id)
);

-- 5. Bß║úng Lß╗ïch sß╗¡ cß║¡p nhß║¡t trß║íng th├íi ─æ╞ín m├│n
CREATE TABLE IF NOT EXISTS lich_su_don_mon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    don_goi_mon_id INTEGER NOT NULL,
    chi_tiet_don_mon_id INTEGER,
    trang_thai_cu TEXT,
    trang_thai_moi TEXT NOT NULL,
    nguoi_thuc_hien TEXT DEFAULT 'Kh├ích h├áng',
    ly_do TEXT,
    thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (don_goi_mon_id) REFERENCES don_goi_mon(id) ON DELETE CASCADE
);

-- 6. Bß║úng Y├¬u cß║ºu hß╗ù trß╗ú tß║íi b├án (Gß╗ìi nh├ón vi├¬n, Y├¬u cß║ºu thanh to├ín)
CREATE TABLE IF NOT EXISTS yeu_cau_ho_tro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phien_ban_id INTEGER NOT NULL,
    ban_an_id INTEGER NOT NULL,
    loai_yeu_cau TEXT NOT NULL CHECK(loai_yeu_cau IN ('goi_nhan_vien', 'yeu_cau_thanh_toan', 'yeu_cau_khac')),
    ly_do TEXT,
    trang_thai TEXT CHECK(trang_thai IN ('cho_tiep_nhan', 'da_tiep_nhan', 'hoan_thanh', 'da_huy')) DEFAULT 'cho_tiep_nhan',
    thoi_gian_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_xu_ly DATETIME,
    FOREIGN KEY (phien_ban_id) REFERENCES phien_ban(id),
    FOREIGN KEY (ban_an_id) REFERENCES ban_an(id)
);

-- 7. Bß║úng Th├┤ng b├ío thß╗¥i gian thß╗▒c
CREATE TABLE IF NOT EXISTS thong_bao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phong TEXT NOT NULL,
    tieu_de TEXT NOT NULL,
    noi_dung TEXT,
    da_xem INTEGER DEFAULT 0,
    thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chß╗ë mß╗Ñc tß╗æi ╞░u truy vß║Ñn Sprint 2
CREATE INDEX IF NOT EXISTS idx_phien_ban_ban ON phien_ban(ban_an_id, trang_thai);
CREATE INDEX IF NOT EXISTS idx_don_goi_mon_phien ON don_goi_mon(phien_ban_id);
CREATE INDEX IF NOT EXISTS idx_don_goi_mon_trang_thai ON don_goi_mon(trang_thai);
CREATE INDEX IF NOT EXISTS idx_chi_tiet_don ON chi_tiet_don_mon(don_goi_mon_id);
CREATE INDEX IF NOT EXISTS idx_chi_tiet_trang_thai ON chi_tiet_don_mon(trang_thai);
CREATE INDEX IF NOT EXISTS idx_yeu_cau_ban ON yeu_cau_ho_tro(ban_an_id, trang_thai);