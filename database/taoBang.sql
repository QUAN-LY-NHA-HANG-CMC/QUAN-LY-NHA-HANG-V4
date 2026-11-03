-- Sprint 1 & Sprint 2 - Schema co so du lieu SQLite
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS vai_tro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_vai_tro TEXT NOT NULL UNIQUE,
    ten_vai_tro TEXT NOT NULL UNIQUE,
    mo_ta TEXT,
    la_he_thong INTEGER NOT NULL DEFAULT 0,
    trang_thai INTEGER NOT NULL DEFAULT 1,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quyen_han (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_quyen TEXT NOT NULL UNIQUE,
    ten_quyen TEXT NOT NULL,
    nhom_quyen TEXT NOT NULL,
    mo_ta TEXT,
    trang_thai INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS vai_tro_quyen_han (
    vai_tro_id INTEGER NOT NULL,
    quyen_han_id INTEGER NOT NULL,
    ngay_gan TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (vai_tro_id, quyen_han_id),
    FOREIGN KEY (vai_tro_id) REFERENCES vai_tro(id) ON DELETE CASCADE,
    FOREIGN KEY (quyen_han_id) REFERENCES quyen_han(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tai_khoan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten_dang_nhap TEXT NOT NULL UNIQUE,
    mat_khau TEXT NOT NULL,
    mat_khau_bam TEXT,
    ho_ten TEXT NOT NULL DEFAULT '',
    so_dien_thoai TEXT DEFAULT '',
    email TEXT UNIQUE,
    anh_dai_dien TEXT,
    vai_tro_id INTEGER,
    trang_thai INTEGER NOT NULL DEFAULT 1,
    dang_nhap_cuoi TEXT,
    lan_dang_nhap_cuoi TEXT,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vai_tro_id) REFERENCES vai_tro(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tai_khoan_vai_tro (
    tai_khoan_id INTEGER NOT NULL,
    vai_tro_id INTEGER NOT NULL,
    PRIMARY KEY (tai_khoan_id, vai_tro_id),
    FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE CASCADE,
    FOREIGN KEY (vai_tro_id) REFERENCES vai_tro(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS phien_dang_nhap (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tai_khoan_id INTEGER NOT NULL,
    ma_phien TEXT,
    refresh_token TEXT,
    refresh_token_hash TEXT,
    dia_chi_ip TEXT,
    thong_tin_thiet_bi TEXT,
    user_agent TEXT,
    het_han_luc TEXT,
    thoi_gian_het_han TEXT,
    thoi_gian_dang_xuat TEXT,
    da_thu_hoi INTEGER NOT NULL DEFAULT 0,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lich_su_phan_quyen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nguoi_thuc_hien_id INTEGER,
    tai_khoan_id INTEGER,
    vai_tro_id INTEGER,
    hanh_dong TEXT NOT NULL,
    noi_dung_chi_tiet TEXT,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_thuc_hien_id) REFERENCES tai_khoan(id) ON DELETE SET NULL,
    FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE SET NULL,
    FOREIGN KEY (vai_tro_id) REFERENCES vai_tro(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS khu_vuc (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten_khu_vuc TEXT NOT NULL UNIQUE,
    tang INTEGER NOT NULL DEFAULT 1,
    mo_ta TEXT,
    ghi_chu TEXT,
    thu_tu_hien_thi INTEGER NOT NULL DEFAULT 0,
    trang_thai TEXT NOT NULL DEFAULT 'hoat_dong',
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ban_an (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    khu_vuc_id INTEGER NOT NULL,
    ma_ban TEXT NOT NULL UNIQUE,
    ten_ban TEXT NOT NULL,
    suc_chua INTEGER NOT NULL DEFAULT 4,
    trang_thai TEXT NOT NULL DEFAULT 'trong',
    ma_qr_token TEXT,
    url_ma_qr TEXT,
    da_phat_sinh_giao_dich INTEGER NOT NULL DEFAULT 0,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (khu_vuc_id) REFERENCES khu_vuc(id)
);

CREATE TABLE IF NOT EXISTS ma_qr_ban (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ban_an_id INTEGER NOT NULL UNIQUE,
    token_bao_mat TEXT NOT NULL UNIQUE,
    duong_dan_qr TEXT NOT NULL,
    trang_thai TEXT NOT NULL DEFAULT 'HoatDong',
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ban_an_id) REFERENCES ban_an(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS danh_muc_mon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten_danh_muc TEXT NOT NULL UNIQUE,
    mo_ta TEXT,
    thu_tu_hien_thi INTEGER NOT NULL DEFAULT 0,
    trang_thai TEXT NOT NULL DEFAULT 'hien_thi',
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mon_an (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    danh_muc_id INTEGER NOT NULL,
    ma_mon TEXT NOT NULL UNIQUE,
    ten_mon TEXT NOT NULL,
    mo_ta TEXT,
    gia_ban NUMERIC NOT NULL,
    don_vi_tinh TEXT NOT NULL DEFAULT 'Phần',
    hinh_anh TEXT,
    la_mon_noi_bat INTEGER NOT NULL DEFAULT 0,
    trang_thai TEXT NOT NULL DEFAULT 'dang_ban',
    da_xoa INTEGER NOT NULL DEFAULT 0,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (danh_muc_id) REFERENCES danh_muc_mon(id)
);

CREATE TABLE IF NOT EXISTS hinh_anh_mon_an (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mon_an_id INTEGER NOT NULL,
    duong_dan TEXT NOT NULL,
    la_anh_dai_dien INTEGER NOT NULL DEFAULT 0,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mon_an_id) REFERENCES mon_an(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tuy_chon_mon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mon_an_id INTEGER,
    nhom_tuy_chon_id INTEGER,
    loai_tuy_chon TEXT NOT NULL DEFAULT 'topping',
    ten_tuy_chon TEXT NOT NULL,
    gia_them NUMERIC NOT NULL DEFAULT 0,
    bat_buoc INTEGER NOT NULL DEFAULT 0,
    trang_thai TEXT NOT NULL DEFAULT 'HoatDong',
    FOREIGN KEY (mon_an_id) REFERENCES mon_an(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cau_hinh_nha_hang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    khoa TEXT,
    ma_cau_hinh TEXT,
    gia_tri TEXT,
    nhom_cau_hinh TEXT NOT NULL DEFAULT 'chung',
    kieu_du_lieu TEXT NOT NULL DEFAULT 'text',
    mo_ta TEXT,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nguoi_cap_nhat_id INTEGER
);

CREATE TABLE IF NOT EXISTS nhat_ky_he_thong (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tai_khoan_id INTEGER,
    loai_hanh_dong TEXT NOT NULL DEFAULT '',
    hanh_dong TEXT DEFAULT '',
    module TEXT DEFAULT '',
    mo_ta TEXT,
    doi_tuong TEXT,
    doi_tuong_id INTEGER,
    du_lieu_cu TEXT,
    du_lieu_moi TEXT,
    dia_chi_ip TEXT,
    thong_tin_thiet_bi TEXT,
    du_lieu_yeu_cau TEXT,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE SET NULL
);

-- Bảng Sprint 2
CREATE TABLE IF NOT EXISTS phien_ban (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ban_an_id INTEGER NOT NULL,
    ma_phien TEXT NOT NULL UNIQUE,
    ma_dinh_danh_qr TEXT,
    token_phien_hash TEXT,
    thoi_gian_bat_dau TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_ket_thuc TEXT,
    trang_thai TEXT NOT NULL DEFAULT 'dang_su_dung',
    tong_tien_tam_tinh NUMERIC DEFAULT 0,
    ghi_chu TEXT,
    FOREIGN KEY (ban_an_id) REFERENCES ban_an(id)
);

CREATE TABLE IF NOT EXISTS phien_phuc_vu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ban_an_id INTEGER NOT NULL,
    ma_phien TEXT NOT NULL UNIQUE,
    token_phien_hash TEXT,
    trang_thai TEXT NOT NULL DEFAULT 'DangMo',
    bat_dau_luc TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ket_thuc_luc TEXT,
    ghi_chu TEXT,
    FOREIGN KEY (ban_an_id) REFERENCES ban_an(id)
);

CREATE TABLE IF NOT EXISTS gio_hang_tam (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phien_ban_id INTEGER NOT NULL UNIQUE,
    du_lieu_gio_hang TEXT NOT NULL,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gio_hang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phien_phuc_vu_id INTEGER,
    phien_ban_id INTEGER,
    ma_khach TEXT,
    trang_thai TEXT NOT NULL DEFAULT 'DangSua',
    ghi_chu_chung TEXT,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gio_hang_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gio_hang_id INTEGER NOT NULL,
    mon_an_id INTEGER NOT NULL,
    ten_mon_snapshot TEXT NOT NULL,
    don_gia_snapshot NUMERIC NOT NULL,
    so_luong INTEGER NOT NULL DEFAULT 1,
    ghi_chu TEXT,
    thanh_tien NUMERIC NOT NULL,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gio_hang_id) REFERENCES gio_hang(id) ON DELETE CASCADE,
    FOREIGN KEY (mon_an_id) REFERENCES mon_an(id)
);

CREATE TABLE IF NOT EXISTS gio_hang_item_tuy_chon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gio_hang_item_id INTEGER NOT NULL,
    ten_nhom_snapshot TEXT,
    ten_tuy_chon_snapshot TEXT NOT NULL,
    gia_them_snapshot NUMERIC NOT NULL DEFAULT 0,
    FOREIGN KEY (gio_hang_item_id) REFERENCES gio_hang_item(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS don_hang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phien_phuc_vu_id INTEGER,
    phien_ban_id INTEGER,
    ma_don TEXT NOT NULL UNIQUE,
    ma_yeu_cau_idempotency TEXT UNIQUE,
    loai_don TEXT NOT NULL DEFAULT 'Moi',
    trang_thai TEXT NOT NULL DEFAULT 'ChoXacNhan',
    ghi_chu_chung TEXT,
    tong_tien NUMERIC NOT NULL DEFAULT 0,
    tao_boi_ma_khach TEXT,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chi_tiet_don_hang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    don_hang_id INTEGER NOT NULL,
    mon_an_id INTEGER NOT NULL,
    ten_mon_snapshot TEXT NOT NULL,
    don_gia_snapshot NUMERIC NOT NULL,
    so_luong INTEGER NOT NULL,
    ghi_chu TEXT,
    thanh_tien NUMERIC NOT NULL,
    trang_thai_mon TEXT NOT NULL DEFAULT 'ChoXacNhan',
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE,
    FOREIGN KEY (mon_an_id) REFERENCES mon_an(id)
);

CREATE TABLE IF NOT EXISTS chi_tiet_don_hang_tuy_chon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chi_tiet_don_hang_id INTEGER NOT NULL,
    ten_nhom_snapshot TEXT,
    ten_tuy_chon_snapshot TEXT NOT NULL,
    gia_them_snapshot NUMERIC NOT NULL DEFAULT 0,
    FOREIGN KEY (chi_tiet_don_hang_id) REFERENCES chi_tiet_don_hang(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lich_su_trang_thai_don_hang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    don_hang_id INTEGER NOT NULL,
    trang_thai_cu TEXT,
    trang_thai_moi TEXT NOT NULL,
    nguoi_cap_nhat_id INTEGER,
    ly_do TEXT,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE,
    FOREIGN KEY (nguoi_cap_nhat_id) REFERENCES tai_khoan(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS yeu_cau_ho_tro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phien_ban_id INTEGER,
    ban_an_id INTEGER NOT NULL,
    loai_yeu_cau TEXT NOT NULL,
    ly_do TEXT,
    trang_thai TEXT NOT NULL DEFAULT 'cho_tiep_nhan',
    thoi_gian_xu_ly TEXT,
    nguoi_tiep_nhan_id INTEGER,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ban_an_id) REFERENCES ban_an(id),
    FOREIGN KEY (nguoi_tiep_nhan_id) REFERENCES tai_khoan(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS yeu_cau_ho_tro_ban (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phien_phuc_vu_id INTEGER,
    ban_an_id INTEGER NOT NULL,
    loai_yeu_cau TEXT NOT NULL,
    ly_do TEXT,
    phuong_thuc_thanh_toan TEXT,
    ghi_chu TEXT,
    trang_thai TEXT NOT NULL DEFAULT 'ChoXuLy',
    nguoi_tiep_nhan_id INTEGER,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ban_an_id) REFERENCES ban_an(id),
    FOREIGN KEY (nguoi_tiep_nhan_id) REFERENCES tai_khoan(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS thong_bao_thoi_gian_thuc (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phien_phuc_vu_id INTEGER,
    loai_su_kien TEXT NOT NULL,
    doi_tuong TEXT,
    doi_tuong_id INTEGER,
    du_lieu_json TEXT NOT NULL,
    da_gui INTEGER NOT NULL DEFAULT 0,
    ngay_tao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
