-- ========================================================
-- MIGRATION SPRINT 4: B├üO C├üO DOANH THU, ─É├üNH GI├ü KH├üCH H├ÇNG & CA L├ÇM VIß╗åC
-- Phß╗Ñ tr├ích: Ph├ít (Database Specialist)
-- ========================================================

-- 1. Bß║úng ─É├ính gi├í & Nhß║¡n x├⌐t cß╗ºa kh├ích h├áng (Feedback / Reviews)
CREATE TABLE IF NOT EXISTS danh_gia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phien_ban_id INTEGER,
    mon_an_id INTEGER,
    ten_khach_hang TEXT DEFAULT 'Kh├ích h├áng',
    so_sao INTEGER NOT NULL CHECK (so_sao >= 1 AND so_sao <= 5),
    nhan_xet TEXT,
    phan_hoi_quan_ly TEXT,
    thoi_gian_phan_hoi DATETIME,
    an_danh INTEGER DEFAULT 0,
    trang_thai TEXT CHECK(trang_thai IN ('cho_duyet', 'da_duyet', 'an')) DEFAULT 'da_duyet',
    thoi_gian_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phien_ban_id) REFERENCES phien_ban(id),
    FOREIGN KEY (mon_an_id) REFERENCES mon_an(id)
);

-- 2. Bß║úng Ca l├ám viß╗çc chuß║⌐n (Shift Definitions)
CREATE TABLE IF NOT EXISTS ca_lam_viec (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_ca TEXT UNIQUE NOT NULL,
    ten_ca TEXT NOT NULL,
    gio_bat_dau TEXT NOT NULL,
    gio_ket_thuc TEXT NOT NULL,
    trang_thai TEXT DEFAULT 'hoat_dong'
);

-- 3. Bß║úng Phi├¬n ca thu ng├ón & ─Éß╗æi so├ít quß╗╣ (Cashier Shift Sessions)
CREATE TABLE IF NOT EXISTS phien_ca_thu_ngan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_phien_ca TEXT UNIQUE NOT NULL,
    nhan_vien_id INTEGER NOT NULL,
    ca_lam_viec_id INTEGER,
    thoi_gian_mo DATETIME DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_dong DATETIME,
    tien_dau_ca REAL DEFAULT 0,
    tien_mat_he_thong REAL DEFAULT 0,
    tien_ck_he_thong REAL DEFAULT 0,
    tong_thu_phat_sinh REAL DEFAULT 0,
    tong_chi_phat_sinh REAL DEFAULT 0,
    tien_mat_thuc_te REAL DEFAULT 0,
    chenh_lech REAL DEFAULT 0,
    ghi_chu TEXT,
    trang_thai TEXT CHECK(trang_thai IN ('dang_mo', 'da_dong')) DEFAULT 'dang_mo',
    FOREIGN KEY (nhan_vien_id) REFERENCES tai_khoan(id),
    FOREIGN KEY (ca_lam_viec_id) REFERENCES ca_lam_viec(id)
);

-- 4. Bß║úng Phiß║┐u thu / chi ph├ít sinh trong ca (Cash In / Out Vouchers)
CREATE TABLE IF NOT EXISTS phieu_thu_chi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_phieu TEXT UNIQUE NOT NULL,
    phien_ca_id INTEGER NOT NULL,
    loai_phieu TEXT CHECK(loai_phieu IN ('thu', 'chi')) NOT NULL,
    so_tien REAL NOT NULL CHECK(so_tien > 0),
    ly_do TEXT NOT NULL,
    nguoi_thuc_hien_id INTEGER,
    thoi_gian_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phien_ca_id) REFERENCES phien_ca_thu_ngan(id),
    FOREIGN KEY (nguoi_thuc_hien_id) REFERENCES tai_khoan(id)
);

-- 5. ─É├ính chß╗ë mß╗Ñc Indexing tß╗æi ╞░u h├│a tß╗æc ─æß╗Ö Aggregation cho B├ío c├ío & Thß╗æng k├¬
CREATE INDEX IF NOT EXISTS idx_hoa_don_thoi_gian_tao ON hoa_don(thoi_gian_tao);
CREATE INDEX IF NOT EXISTS idx_hoa_don_trang_thai ON hoa_don(trang_thai);
CREATE INDEX IF NOT EXISTS idx_hoa_don_phuong_thuc ON hoa_don(phuong_thuc_thanh_toan);
CREATE INDEX IF NOT EXISTS idx_danh_gia_so_sao ON danh_gia(so_sao);
CREATE INDEX IF NOT EXISTS idx_danh_gia_mon ON danh_gia(mon_an_id);
CREATE INDEX IF NOT EXISTS idx_phien_ca_nhan_vien ON phien_ca_thu_ngan(nhan_vien_id, trang_thai);
CREATE INDEX IF NOT EXISTS idx_phieu_thu_chi_phien ON phieu_thu_chi(phien_ca_id);

-- 6. Dß╗» liß╗çu mß║½u (Seed Data) cho Sprint 4
INSERT OR IGNORE INTO ca_lam_viec (id, ma_ca, ten_ca, gio_bat_dau, gio_ket_thuc, trang_thai) VALUES
(1, 'CA_SANG', 'Ca S├íng (06:00 - 14:00)', '06:00', '14:00', 'hoat_dong'),
(2, 'CA_CHIEU', 'Ca Chiß╗üu (14:00 - 22:00)', '14:00', '22:00', 'hoat_dong'),
(3, 'CA_TOI', 'Ca Tß╗æi (18:00 - 23:30)', '18:00', '23:30', 'hoat_dong');

INSERT OR IGNORE INTO danh_gia (id, phien_ban_id, mon_an_id, ten_khach_hang, so_sao, nhan_xet, phan_hoi_quan_ly, an_danh, trang_thai, thoi_gian_tao) VALUES
(1, 1, 1, 'Nguyß╗àn V─ân H├╣ng', 5, 'Nem n╞░ß╗¢ng cß╗▒c kß╗│ th╞ím ngon, rau t╞░╞íi sß║ích sß║╜!', 'Qu├ín Mß╗Öc xin ch├ón th├ánh cß║úm ╞ín qu├╜ kh├ích!', 0, 'da_duyet', datetime('now', '-2 days')),
(2, 1, 2, 'Trß║ºn Thu Thß║úo', 4, 'B├▓ t╞í cuß╗æn b├ính tr├íng ngon, phß╗Ñc vß╗Ñ nhanh nhß║╣n.', 'Cß║úm ╞ín bß║ín ─æ├ú ß╗ºng hß╗Ö qu├ín nh├⌐!', 0, 'da_duyet', datetime('now', '-1 day')),
(3, 2, 3, 'Kh├ích giß║Ñu t├¬n', 2, 'H╞íi ß╗ôn v├á m├│n l├¬n h╞íi chß║¡m v├áo giß╗¥ cao ─æiß╗âm.', 'Qu├ín Mß╗Öc rß║Ñt xin lß╗ùi v├á sß║╜ khß║»c phß╗Ñc ngay v├áo ca tß╗æi.', 1, 'cho_duyet', datetime('now', '-3 hours'));