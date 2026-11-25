-- ============================================================================
-- DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
-- TẬP TIN DDL KHỞI TẠO CƠ SỞ DỮ LIỆU CHUẨN HÓA 3NF (SQLITE3)
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- PHÂN HỆ 1: QUẢN TRỊ, PHÂN QUYỀN & NHÂN SỰ
-- ----------------------------------------------------------------------------

-- 1. Bảng vai_tro
CREATE TABLE IF NOT EXISTS vai_tro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_vai_tro TEXT NOT NULL UNIQUE,
    ten_vai_tro TEXT NOT NULL,
    mo_ta TEXT,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng tai_khoan
CREATE TABLE IF NOT EXISTS tai_khoan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten_dang_nhap TEXT NOT NULL UNIQUE,
    mat_khau_hash TEXT NOT NULL,
    vai_tro_id INTEGER NOT NULL REFERENCES vai_tro(id),
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('hoat_dong', 'tam_khoa', 'da_xoa')),
    lan_dang_nhap_cuoi DATETIME,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng nhan_vien
CREATE TABLE IF NOT EXISTS nhan_vien (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tai_khoan_id INTEGER UNIQUE REFERENCES tai_khoan(id),
    ho_ten TEXT NOT NULL,
    so_dien_thoai TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    cccd TEXT UNIQUE,
    hinh_thuc_lam_viec TEXT NOT NULL CHECK (hinh_thuc_lam_viec IN ('toan_thoi_gian', 'ban_thoi_gian')),
    muc_luong INTEGER NOT NULL CHECK (muc_luong >= 0),
    ngay_vao_lam DATE NOT NULL DEFAULT CURRENT_DATE,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('dang_lam', 'tam_nghi', 'da_nghi')),
    ngay_luu_tru DATETIME,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng ca_lam_viec
CREATE TABLE IF NOT EXISTS ca_lam_viec (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nhan_vien_id INTEGER NOT NULL REFERENCES nhan_vien(id),
    ngay_lam DATE NOT NULL,
    ten_ca TEXT NOT NULL CHECK (ten_ca IN ('ca_sang', 'ca_chieu', 'ca_toi', 'ca_gay')),
    gio_bat_dau TIME NOT NULL,
    gio_ket_thuc TIME NOT NULL,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('ke_hoach', 'da_checkin', 'da_hoan_thanh', 'vang_mat', 'da_huy')),
    ghi_chu TEXT,
    thoi_gian_checkin TEXT,
    thoi_gian_checkout TEXT,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng yeu_cau_doi_ca (Figma W11 & A07)
CREATE TABLE IF NOT EXISTS yeu_cau_doi_ca (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nhan_vien_yeu_cau_id INTEGER NOT NULL REFERENCES nhan_vien(id),
    ca_lam_viec_id INTEGER NOT NULL REFERENCES ca_lam_viec(id),
    loai_yeu_cau TEXT NOT NULL CHECK (loai_yeu_cau IN ('nghi_ca', 'doi_ca')),
    nhan_vien_nhan_ca_id INTEGER REFERENCES nhan_vien(id),
    ly_do TEXT NOT NULL,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('cho_duyet', 'da_duyet', 'tu_choi')),
    quan_ly_duyet_id INTEGER REFERENCES nhan_vien(id),
    ghi_chu_duyet TEXT,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_duyet DATETIME
);

-- 6. Bảng cau_hinh_nha_hang
CREATE TABLE IF NOT EXISTS cau_hinh_nha_hang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten_nha_hang TEXT NOT NULL,
    dia_chi TEXT NOT NULL,
    so_dien_thoai TEXT NOT NULL,
    email TEXT,
    anh_logo TEXT,
    phan_tram_vat INTEGER NOT NULL DEFAULT 8 CHECK (phan_tram_vat BETWEEN 0 AND 100),
    ngan_hang_vietqr TEXT NOT NULL,
    so_tai_khoan_vietqr TEXT NOT NULL,
    ten_chu_tai_khoan_vietqr TEXT NOT NULL,
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- PHÂN HỆ 2: SƠ ĐỒ PHÒNG BÀN & PHÂN CÔNG
-- ----------------------------------------------------------------------------

-- 7. Bảng khu_vuc
CREATE TABLE IF NOT EXISTS khu_vuc (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_khu_vuc TEXT NOT NULL UNIQUE,
    ten_khu_vuc TEXT NOT NULL,
    mo_ta TEXT,
    thu_tu_hien_thi INTEGER NOT NULL DEFAULT 1,
    kich_hoat INTEGER NOT NULL DEFAULT 1 CHECK (kich_hoat IN (0, 1)),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bảng ban_an
CREATE TABLE IF NOT EXISTS ban_an (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    khu_vuc_id INTEGER NOT NULL REFERENCES khu_vuc(id),
    ma_ban TEXT NOT NULL UNIQUE,
    ten_ban TEXT NOT NULL,
    suc_chua INTEGER NOT NULL CHECK (suc_chua > 0),
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('trong', 'co_khach', 'cho_mon', 'yeu_cau_thanh_toan', 'can_don_dep')),
    ma_qr_token TEXT NOT NULL UNIQUE,
    tu_dong_duyet_mon INTEGER NOT NULL DEFAULT 0 CHECK (tu_dong_duyet_mon IN (0, 1)),
    kich_hoat INTEGER NOT NULL DEFAULT 1 CHECK (kich_hoat IN (0, 1)),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Bảng phan_cong_ban
CREATE TABLE IF NOT EXISTS phan_cong_ban (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nhan_vien_id INTEGER NOT NULL REFERENCES nhan_vien(id),
    ban_an_id INTEGER NOT NULL REFERENCES ban_an(id),
    ngay_phan_cong DATE NOT NULL,
    ten_ca TEXT NOT NULL CHECK (ten_ca IN ('ca_sang', 'ca_chieu', 'ca_toi', 'ca_gay')),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- PHÂN HỆ 3: THỰC ĐƠN, MÓN ĂN & GÓI COMBO
-- ----------------------------------------------------------------------------

-- 10. Bảng danh_muc_mon
CREATE TABLE IF NOT EXISTS danh_muc_mon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_danh_muc TEXT NOT NULL UNIQUE,
    ten_danh_muc TEXT NOT NULL,
    thu_tu_hien_thi INTEGER NOT NULL DEFAULT 1,
    kich_hoat INTEGER NOT NULL DEFAULT 1 CHECK (kich_hoat IN (0, 1)),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Bảng mon_an
CREATE TABLE IF NOT EXISTS mon_an (
    so_suat_con_lai INTEGER DEFAULT NULL,
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    danh_muc_id INTEGER NOT NULL REFERENCES danh_muc_mon(id),
    ma_mon TEXT NOT NULL UNIQUE,
    ten_mon TEXT NOT NULL,
    don_gia INTEGER NOT NULL CHECK (don_gia > 0),
    don_vi_tinh TEXT NOT NULL DEFAULT 'phan',
    anh_mon_an TEXT,
    mo_ta TEXT,
    con_mon INTEGER NOT NULL DEFAULT 1 CHECK (con_mon IN (0, 1)),
    la_combo INTEGER NOT NULL DEFAULT 0 CHECK (la_combo IN (0, 1)),
    la_ban_chay INTEGER NOT NULL DEFAULT 0 CHECK (la_ban_chay IN (0, 1)),
    la_goi_y INTEGER NOT NULL DEFAULT 0 CHECK (la_goi_y IN (0, 1)),
    kich_hoat INTEGER NOT NULL DEFAULT 1 CHECK (kich_hoat IN (0, 1)),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Bảng combo_chi_tiet
CREATE TABLE IF NOT EXISTS combo_chi_tiet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    combo_id INTEGER NOT NULL REFERENCES mon_an(id),
    mon_an_le_id INTEGER NOT NULL REFERENCES mon_an(id),
    so_luong INTEGER NOT NULL CHECK (so_luong > 0)
);

-- ----------------------------------------------------------------------------
-- PHÂN HỆ 4: VÒNG ĐỜI PHIÊN BÀN, ĐƠN GỌI MÓN & ĐIỀU PHỐI KDS BẾP
-- ----------------------------------------------------------------------------

-- 13. Bảng phien_ban
CREATE TABLE IF NOT EXISTS phien_ban (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ban_an_id INTEGER NOT NULL REFERENCES ban_an(id),
    ma_phien TEXT NOT NULL UNIQUE,
    thoi_gian_bat_dau DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_ket_thuc DATETIME,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('dang_hoat_dong', 'da_thanh_toan', 'da_dong')),
    so_luong_khach INTEGER NOT NULL CHECK (so_luong_khach > 0),
    ghi_chu TEXT,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. Bảng don_goi_mon
CREATE TABLE IF NOT EXISTS don_goi_mon (
    khoa_gui TEXT,
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phien_ban_id INTEGER NOT NULL REFERENCES phien_ban(id),
    ma_don TEXT NOT NULL UNIQUE,
    nguon_tao TEXT NOT NULL CHECK (nguon_tao IN ('khach_qr', 'phuc_vu_dat_ho')),
    nhan_vien_tao_id INTEGER REFERENCES nhan_vien(id),
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('cho_duyet', 'da_duyet', 'tu_choi', 'hoan_tat', 'da_huy')),
    ly_do_tu_choi TEXT,
    nhan_vien_duyet_id INTEGER REFERENCES nhan_vien(id),
    thoi_gian_gui DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_duyet DATETIME,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    thiet_bi_tao_id TEXT REFERENCES thiet_bi_phien_ban(id)
);

-- 15. Bảng chi_tiet_don_mon
CREATE TABLE IF NOT EXISTS chi_tiet_don_mon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    don_goi_mon_id INTEGER NOT NULL REFERENCES don_goi_mon(id),
    mon_an_id INTEGER NOT NULL REFERENCES mon_an(id),
    so_luong INTEGER NOT NULL CHECK (so_luong > 0),
    don_gia INTEGER NOT NULL CHECK (don_gia > 0),
    ghi_chu TEXT,
    trang_thai_mon TEXT NOT NULL CHECK (trang_thai_mon IN ('cho_duyet', 'dang_nau', 'hoan_thanh', 'da_phuc_vu', 'yeu_cau_huy', 'huy_mon', 'da_huy')),
    la_uu_tien INTEGER NOT NULL DEFAULT 0 CHECK (la_uu_tien IN (0, 1)),
    thoi_gian_bat_dau_nau DATETIME,
    thoi_gian_hoan_thanh_nau DATETIME,
    thoi_gian_phuc_vu TEXT,
    dau_bep_id INTEGER REFERENCES nhan_vien(id),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 16. Bảng yeu_cau_huy_mon (Chống thất thoát)
CREATE TABLE IF NOT EXISTS yeu_cau_huy_mon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chi_tiet_don_mon_id INTEGER NOT NULL REFERENCES chi_tiet_don_mon(id),
    nhan_vien_yeu_cau_id INTEGER NOT NULL REFERENCES nhan_vien(id),
    ly_do_huy TEXT NOT NULL,
    trang_thai_yeu_cau TEXT NOT NULL CHECK (trang_thai_yeu_cau IN ('cho_admin_duyet', 'da_chap_thuan', 'tu_choi')),
    admin_duyet_id INTEGER REFERENCES nhan_vien(id),
    phan_hoi_admin TEXT,
    trang_thai_mon_cu TEXT,
    thoi_gian_yeu_cau DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_duyet DATETIME
);

-- 17. Bảng yeu_cau_ho_tro
CREATE TABLE IF NOT EXISTS yeu_cau_ho_tro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phien_ban_id INTEGER NOT NULL REFERENCES phien_ban(id),
    loai_yeu_cau TEXT NOT NULL CHECK (loai_yeu_cau IN ('goi_phuc_vu', 'yeu_cau_thanh_toan', 'nuoc_cham', 'khac')),
    noi_dung TEXT,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('cho_tiep_nhan', 'dang_xu_ly', 'da_xong')),
    nhan_vien_tiep_nhan_id INTEGER REFERENCES nhan_vien(id),
    thoi_gian_gui DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_hoan_thanh DATETIME
);

-- ----------------------------------------------------------------------------
-- PHÂN HỆ 5: HÓA ĐƠN, KẾ TOÁN THU NGÂN & CHIA TIỀN NHÓM
-- ----------------------------------------------------------------------------

-- 18. Bảng hoa_don
CREATE TABLE IF NOT EXISTS hoa_don (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phien_ban_id INTEGER NOT NULL REFERENCES phien_ban(id),
    hoa_don_cha_id INTEGER REFERENCES hoa_don(id),
    ma_hoa_don TEXT NOT NULL UNIQUE,
    thu_ngan_id INTEGER REFERENCES nhan_vien(id),
    tong_tien_mon INTEGER NOT NULL CHECK (tong_tien_mon >= 0),
    phan_tram_chiet_khau INTEGER NOT NULL DEFAULT 0 CHECK (phan_tram_chiet_khau BETWEEN 0 AND 100),
    tien_chiet_khau INTEGER NOT NULL DEFAULT 0 CHECK (tien_chiet_khau >= 0),
    phan_tram_vat INTEGER NOT NULL DEFAULT 8 CHECK (phan_tram_vat BETWEEN 0 AND 100),
    tien_vat INTEGER NOT NULL DEFAULT 0 CHECK (tien_vat >= 0),
    tong_tien_thanh_toan INTEGER NOT NULL CHECK (tong_tien_thanh_toan >= 0),
    phuong_thuc_thanh_toan TEXT NOT NULL CHECK (phuong_thuc_thanh_toan IN ('tien_mat', 'vietqr', 'ket_hop')),
    tien_khach_dua INTEGER DEFAULT 0 CHECK (tien_khach_dua >= 0),
    tien_thoi_lai INTEGER DEFAULT 0 CHECK (tien_thoi_lai >= 0),
    ma_giao_dich_vietqr TEXT,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('chua_thanh_toan', 'da_thanh_toan', 'da_huy')),
    thoi_gian_thanh_toan DATETIME,
    ghi_chu TEXT,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 19. Bảng chi_tiet_hoa_don
CREATE TABLE IF NOT EXISTS chi_tiet_hoa_don (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hoa_don_id INTEGER NOT NULL REFERENCES hoa_don(id),
    chi_tiet_don_mon_id INTEGER REFERENCES chi_tiet_don_mon(id),
    mon_an_id INTEGER NOT NULL REFERENCES mon_an(id),
    ten_mon TEXT NOT NULL,
    don_gia INTEGER NOT NULL CHECK (don_gia > 0),
    so_luong INTEGER NOT NULL CHECK (so_luong > 0),
    thanh_tien INTEGER NOT NULL CHECK (thanh_tien = so_luong * don_gia)
);

-- 20. Bảng chia_tien_nhom (Figma C10 & P06)
CREATE TABLE IF NOT EXISTS chia_tien_nhom (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hoa_don_id INTEGER NOT NULL REFERENCES hoa_don(id),
    so_nguoi_chia INTEGER NOT NULL CHECK (so_nguoi_chia >= 2),
    so_tien_moi_nguoi INTEGER NOT NULL CHECK (so_tien_moi_nguoi > 0),
    ma_tham_chieu_qr TEXT,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('dang_thu', 'hoan_tat')),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- PHÂN HỆ 6: ĐÁNH GIÁ, KIỂM SOÁT & SỔ CÁI TÀI CHÍNH
-- ----------------------------------------------------------------------------

-- 21. Bảng danh_gia (Figma C12)
CREATE TABLE IF NOT EXISTS danh_gia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phien_ban_id INTEGER NOT NULL REFERENCES phien_ban(id),
    so_sao INTEGER NOT NULL CHECK (so_sao BETWEEN 1 AND 5),
    nhan_xet TEXT,
    ten_khach_hang TEXT,
    so_dien_thoai TEXT,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 22. Bảng nhat_ky_kiem_toan (Audit Logs - Figma A20)
CREATE TABLE IF NOT EXISTS nhat_ky_kiem_toan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tai_khoan_id INTEGER REFERENCES tai_khoan(id),
    hanh_dong TEXT NOT NULL,
    bang_anh_huong TEXT NOT NULL,
    ban_ghi_id INTEGER,
    du_lieu_cu TEXT,
    du_lieu_moi TEXT,
    dia_chi_ip TEXT,
    thiet_bi TEXT,
    ly_do TEXT,
    thoi_gian_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 23. Bảng giao_dich_thanh_toan (Ledger Model & Idempotency)
CREATE TABLE IF NOT EXISTS giao_dich_thanh_toan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hoa_don_id INTEGER NOT NULL REFERENCES hoa_don(id),
    ca_lam_viec_id INTEGER REFERENCES ca_lam_viec(id),
    so_tien INTEGER NOT NULL CHECK (so_tien > 0),
    phuong_thuc TEXT NOT NULL CHECK (phuong_thuc IN ('TIEN_MAT', 'VIETQR', 'THE_POS')),
    ma_giao_dich_ngan_hang TEXT UNIQUE,
    noi_dung_chuyen_khoan TEXT,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('thanh_cong', 'cho_doi_soat', 'da_hoan_tien')),
    thoi_gian_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS phieu_thu_mot_phan (
    giao_dich_id INTEGER PRIMARY KEY REFERENCES giao_dich_thanh_toan(id),
    tong_hoa_don INTEGER NOT NULL,
    da_thu_truoc INTEGER NOT NULL,
    ten_ban TEXT NOT NULL
);

-- 24. Bảng phieu_thu_chi_noi_bo (Két tiền & Chốt ca Z-Report)
CREATE TABLE IF NOT EXISTS phieu_thu_chi_noi_bo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ca_lam_viec_id INTEGER REFERENCES ca_lam_viec(id),
    loai TEXT NOT NULL CHECK (loai IN ('THU', 'CHI')),
    so_tien INTEGER NOT NULL CHECK (so_tien > 0),
    ly_do TEXT NOT NULL,
    nguoi_tao_id INTEGER NOT NULL REFERENCES nhan_vien(id),
    thoi_gian_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- HỆ THỐNG 31 CHỈ MỤC (INDEXES) CHIẾN LƯỢC TỐI ƯU HÓA TRUY VẤN REAL-TIME
-- ----------------------------------------------------------------------------

-- Nhóm 1: Xác thực & Nhân sự
CREATE INDEX IF NOT EXISTS idx_tai_khoan_ten_dang_nhap ON tai_khoan(ten_dang_nhap);
CREATE INDEX IF NOT EXISTS idx_tai_khoan_vai_tro ON tai_khoan(vai_tro_id);
CREATE INDEX IF NOT EXISTS idx_nhan_vien_so_dien_thoai ON nhan_vien(so_dien_thoai);
CREATE INDEX IF NOT EXISTS idx_nhan_vien_tai_khoan ON nhan_vien(tai_khoan_id);
CREATE INDEX IF NOT EXISTS idx_ca_lam_viec_ngay_nhan_vien ON ca_lam_viec(ngay_lam, nhan_vien_id);
CREATE INDEX IF NOT EXISTS idx_yeu_cau_doi_ca_trang_thai ON yeu_cau_doi_ca(trang_thai);

-- Nhóm 2: Sơ đồ phòng bàn & QR
CREATE INDEX IF NOT EXISTS idx_ban_an_qr_token ON ban_an(ma_qr_token);
CREATE INDEX IF NOT EXISTS idx_ban_an_trang_thai ON ban_an(trang_thai);
CREATE INDEX IF NOT EXISTS idx_ban_an_khu_vuc ON ban_an(khu_vuc_id);
CREATE INDEX IF NOT EXISTS idx_phan_cong_ban_nhan_vien ON phan_cong_ban(nhan_vien_id, ngay_phan_cong);
CREATE INDEX IF NOT EXISTS idx_phan_cong_ban_ban ON phan_cong_ban(ban_an_id, ngay_phan_cong);

-- Nhóm 3: Thực đơn
CREATE INDEX IF NOT EXISTS idx_mon_an_danh_muc ON mon_an(danh_muc_id);
CREATE INDEX IF NOT EXISTS idx_mon_an_ma ON mon_an(ma_mon);
CREATE INDEX IF NOT EXISTS idx_mon_an_trang_thai ON mon_an(con_mon, kich_hoat);

-- Nhóm 4: Vòng đời phiên bàn & KDS
CREATE INDEX IF NOT EXISTS idx_phien_ban_ban_an ON phien_ban(ban_an_id, trang_thai);
CREATE INDEX IF NOT EXISTS idx_phien_ban_ma_phien ON phien_ban(ma_phien);
CREATE INDEX IF NOT EXISTS idx_don_goi_mon_phien ON don_goi_mon(phien_ban_id, trang_thai);
CREATE INDEX IF NOT EXISTS idx_don_goi_mon_ma ON don_goi_mon(ma_don);
CREATE UNIQUE INDEX IF NOT EXISTS idx_don_goi_mon_khoa_gui ON don_goi_mon(khoa_gui) WHERE khoa_gui IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chi_tiet_don_mon_kds ON chi_tiet_don_mon(trang_thai_mon, la_uu_tien, ngay_tao);
CREATE INDEX IF NOT EXISTS idx_chi_tiet_don_mon_don ON chi_tiet_don_mon(don_goi_mon_id);
CREATE INDEX IF NOT EXISTS idx_chi_tiet_don_mon_mon ON chi_tiet_don_mon(mon_an_id);
CREATE INDEX IF NOT EXISTS idx_yeu_cau_huy_mon_trang_thai ON yeu_cau_huy_mon(trang_thai_yeu_cau);
CREATE INDEX IF NOT EXISTS idx_yeu_cau_ho_tro_phien ON yeu_cau_ho_tro(phien_ban_id, trang_thai);

-- Nhóm 5: Thu ngân POS & Kế toán
CREATE INDEX IF NOT EXISTS idx_hoa_don_phien_ban ON hoa_don(phien_ban_id, trang_thai);
CREATE INDEX IF NOT EXISTS idx_hoa_don_ma ON hoa_don(ma_hoa_don);
CREATE INDEX IF NOT EXISTS idx_hoa_don_hoa_don_cha ON hoa_don(hoa_don_cha_id);
CREATE INDEX IF NOT EXISTS idx_hoa_don_trang_thai_thoi_gian ON hoa_don(trang_thai, thoi_gian_thanh_toan);
CREATE INDEX IF NOT EXISTS idx_chi_tiet_hoa_don_hoa_don ON chi_tiet_hoa_don(hoa_don_id);
CREATE INDEX IF NOT EXISTS idx_chi_tiet_hoa_don_mon ON chi_tiet_hoa_don(mon_an_id);
CREATE INDEX IF NOT EXISTS idx_chia_tien_nhom_hoa_don ON chia_tien_nhom(hoa_don_id);
CREATE INDEX IF NOT EXISTS idx_giao_dich_thanh_toan_hoa_don ON giao_dich_thanh_toan(hoa_don_id);

-- Nhóm 6: Kiểm toán & Đánh giá
CREATE INDEX IF NOT EXISTS idx_nhat_ky_kiem_toan_hanh_dong ON nhat_ky_kiem_toan(hanh_dong);
CREATE INDEX IF NOT EXISTS idx_nhat_ky_kiem_toan_bang_ban_ghi ON nhat_ky_kiem_toan(bang_anh_huong, ban_ghi_id);
CREATE INDEX IF NOT EXISTS idx_danh_gia_phien_so_sao ON danh_gia(phien_ban_id, so_sao);

CREATE TABLE IF NOT EXISTS lenh_dieu_phoi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bo_phan TEXT NOT NULL CHECK (bo_phan IN ('bep', 'phuc_vu', 'thu_ngan', 'tat_ca')),
    ban_id INTEGER,
    ma_ban TEXT,
    ten_ban TEXT,
    mon_an_id INTEGER,
    ten_mon TEXT,
    so_luong_mon INTEGER,
    muc_do TEXT NOT NULL DEFAULT 'khan_cap',
    tieu_de TEXT,
    noi_dung TEXT NOT NULL,
    nguoi_gui_id INTEGER,
    ten_nguoi_gui TEXT,
    trang_thai TEXT NOT NULL DEFAULT 'cho_tiep_nhan',
    nguoi_tiep_nhan_id INTEGER,
    ten_nguoi_tiep_nhan TEXT,
    thoi_gian_tiep_nhan DATETIME,
    thoi_gian_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lenh_dieu_phoi_thoi_gian ON lenh_dieu_phoi(thoi_gian_tao);
CREATE INDEX IF NOT EXISTS idx_lenh_dieu_phoi_trang_thai ON lenh_dieu_phoi(trang_thai);
CREATE INDEX IF NOT EXISTS idx_lenh_dieu_phoi_bo_phan ON lenh_dieu_phoi(bo_phan);

CREATE TABLE IF NOT EXISTS tiep_nhan_viec_ban (
    loai TEXT NOT NULL CHECK (loai IN ('ho_tro','duyet_qr','bung_mon','don_ban')),
    doi_tuong_id INTEGER NOT NULL,
    nhan_vien_id INTEGER NOT NULL REFERENCES nhan_vien(id) ON DELETE CASCADE,
    thoi_gian TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (loai, doi_tuong_id)
);

CREATE TABLE IF NOT EXISTS tiep_nhan_dieu_phoi (
    lenh_id INTEGER NOT NULL REFERENCES lenh_dieu_phoi(id) ON DELETE CASCADE,
    bo_phan TEXT NOT NULL CHECK (bo_phan IN ('bep','phuc_vu','thu_ngan')),
    nhan_vien_id INTEGER REFERENCES nhan_vien(id) ON DELETE SET NULL,
    thoi_gian_tiep_nhan TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lenh_id, bo_phan)
);

CREATE TABLE IF NOT EXISTS gio_mon_ban (
    ban_an_id INTEGER PRIMARY KEY REFERENCES ban_an(id) ON DELETE CASCADE,
    phien_ban_id INTEGER REFERENCES phien_ban(id),
    phien_ban_sua INTEGER NOT NULL DEFAULT 0,
    mon TEXT NOT NULL DEFAULT '[]',
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS thiet_bi_phien_ban (
    id TEXT PRIMARY KEY NOT NULL,
    phien_ban_id INTEGER NOT NULL REFERENCES phien_ban(id),
    khoa_bam TEXT NOT NULL,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('cho_duyet','cho_ma','da_vao','tu_choi')),
    la_chu INTEGER NOT NULL DEFAULT 0 CHECK (la_chu IN (0, 1)),
    doi_den INTEGER NOT NULL,
    ma_moi TEXT,
    ma_het_han INTEGER,
    so_lan_sai INTEGER NOT NULL DEFAULT 0,
    UNIQUE (phien_ban_id, khoa_bam)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_thiet_bi_chu_phien
    ON thiet_bi_phien_ban(phien_ban_id) WHERE la_chu = 1;

CREATE TABLE IF NOT EXISTS yeu_cau_huy_mon_khach (
    id INTEGER PRIMARY KEY,
    chi_tiet_don_mon_id INTEGER NOT NULL REFERENCES chi_tiet_don_mon(id),
    ly_do TEXT NOT NULL,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('cho_phuc_vu', 'da_xu_ly', 'tu_choi')),
    nhan_vien_xu_ly_id INTEGER REFERENCES nhan_vien(id),
    phieu_quan_ly_id INTEGER REFERENCES yeu_cau_huy_mon(id),
    gui_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    xu_ly_luc DATETIME
);

CREATE INDEX IF NOT EXISTS idx_huy_mon_khach_chi_tiet ON yeu_cau_huy_mon_khach(chi_tiet_don_mon_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_huy_mon_khach_cho_xu_ly
    ON yeu_cau_huy_mon_khach(chi_tiet_don_mon_id) WHERE trang_thai = 'cho_phuc_vu';
CREATE TABLE IF NOT EXISTS xu_ly_mon_pos (
    chi_tiet_id INTEGER PRIMARY KEY REFERENCES chi_tiet_don_mon(id),
    lua_chon TEXT NOT NULL CHECK (lua_chon IN ('goi_mang_ve','dung_tai_ban','xac_nhan_bung','khong_lay')),
    buoc TEXT NOT NULL CHECK (buoc IN ('bep','phuc_vu','thu_ngan','xong')),
    nguoi_gui_id INTEGER REFERENCES tai_khoan(id),
    ghi_chu TEXT NOT NULL DEFAULT '',
    uu_tien INTEGER NOT NULL DEFAULT 0,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);
