-- Bảng vai trò người dùng trong nhà hàng
CREATE TABLE IF NOT EXISTS vai_tro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_vai_tro TEXT UNIQUE NOT NULL,
    ten_vai_tro TEXT NOT NULL,
    mo_ta TEXT,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng quyền hạn chi tiết
CREATE TABLE IF NOT EXISTS quyen_han (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_quyen TEXT UNIQUE NOT NULL,
    ten_quyen TEXT NOT NULL,
    nhom_quyen TEXT NOT NULL,
    mo_ta TEXT
);

-- Bảng liên kết vai trò và quyền hạn
CREATE TABLE IF NOT EXISTS vai_tro_quyen_han (
    vai_tro_id INTEGER NOT NULL,
    quyen_han_id INTEGER NOT NULL,
    PRIMARY KEY (vai_tro_id, quyen_han_id),
    FOREIGN KEY (vai_tro_id) REFERENCES vai_tro(id) ON DELETE CASCADE,
    FOREIGN KEY (quyen_han_id) REFERENCES quyen_han(id) ON DELETE CASCADE
);

-- Bảng tài khoản nhân viên / quản lý
CREATE TABLE IF NOT EXISTS tai_khoan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten_dang_nhap TEXT UNIQUE NOT NULL,
    mat_khau_bam TEXT NOT NULL,
    ho_ten TEXT NOT NULL,
    so_dien_thoai TEXT,
    email TEXT,
    vai_tro_id INTEGER NOT NULL,
    trang_thai TEXT CHECK(trang_thai IN ('hoat_dong', 'bi_khoa', 'nghi_viec')) DEFAULT 'hoat_dong',
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vai_tro_id) REFERENCES vai_tro(id)
);

-- Bảng phiên đăng nhập (Tokens)
CREATE TABLE IF NOT EXISTS phien_dang_nhap (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tai_khoan_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    da_thu_hoi INTEGER DEFAULT 0,
    het_han_luc DATETIME NOT NULL,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE CASCADE
);

-- Bảng khu vực / tầng phục vụ
CREATE TABLE IF NOT EXISTS khu_vuc (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten_khu_vuc TEXT NOT NULL,
    tang INTEGER DEFAULT 1,
    mo_ta TEXT,
    thu_tu_hien_thi INTEGER DEFAULT 0,
    trang_thai TEXT CHECK(trang_thai IN ('hoat_dong', 'tam_dung')) DEFAULT 'hoat_dong'
);

-- Bảng bàn ăn và mã QR định danh
CREATE TABLE IF NOT EXISTS ban_an (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_ban TEXT UNIQUE NOT NULL,
    ten_ban TEXT NOT NULL,
    khu_vuc_id INTEGER NOT NULL,
    suc_chua INTEGER DEFAULT 4 CHECK(suc_chua > 0),
    trang_thai TEXT CHECK(trang_thai IN ('trong', 'dang_dung', 'cho_thanh_toan', 'tam_khoa')) DEFAULT 'trong',
    ma_qr_token TEXT UNIQUE NOT NULL,
    url_ma_qr TEXT,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (khu_vuc_id) REFERENCES khu_vuc(id)
);

-- Bảng danh mục thực đơn
CREATE TABLE IF NOT EXISTS danh_muc_mon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten_danh_muc TEXT NOT NULL,
    mo_ta TEXT,
    thu_tu_hien_thi INTEGER DEFAULT 0,
    trang_thai TEXT CHECK(trang_thai IN ('hien_thi', 'tam_an')) DEFAULT 'hien_thi',
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng món ăn
CREATE TABLE IF NOT EXISTS mon_an (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    danh_muc_id INTEGER NOT NULL,
    ma_mon TEXT UNIQUE NOT NULL,
    ten_mon TEXT NOT NULL,
    mo_ta TEXT,
    gia_ban REAL NOT NULL CHECK(gia_ban >= 0),
    don_vi_tinh TEXT DEFAULT 'Phần',
    hinh_anh TEXT,
    trang_thai TEXT CHECK(trang_thai IN ('dang_ban', 'tam_het')) DEFAULT 'dang_ban',
    la_mon_noi_bat INTEGER DEFAULT 0,
    da_xoa INTEGER DEFAULT 0,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (danh_muc_id) REFERENCES danh_muc_mon(id)
);

-- Bảng tùy chọn món ăn (size, topping)
CREATE TABLE IF NOT EXISTS tuy_chon_mon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mon_an_id INTEGER NOT NULL,
    loai_tuy_chon TEXT NOT NULL CHECK(loai_tuy_chon IN ('kich_co', 'topping', 'khau_vi')),
    ten_tuy_chon TEXT NOT NULL,
    gia_them REAL DEFAULT 0 CHECK(gia_them >= 0),
    bat_buoc INTEGER DEFAULT 0,
    FOREIGN KEY (mon_an_id) REFERENCES mon_an(id) ON DELETE CASCADE
);

-- Bảng cấu hình nhà hàng
CREATE TABLE IF NOT EXISTS cau_hinh_nha_hang (
    khoa TEXT PRIMARY KEY,
    gia_tri TEXT NOT NULL,
    mo_ta TEXT,
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng nhật ký hệ thống
CREATE TABLE IF NOT EXISTS nhat_ky_he_thong (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tai_khoan_id INTEGER,
    hanh_dong TEXT NOT NULL,
    chi_tiet TEXT,
    ip TEXT,
    thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE SET NULL
);
