-- Các chỉ mục tối ưu tìm kiếm và liên kết
CREATE INDEX IF NOT EXISTS idx_tai_khoan_vai_tro ON tai_khoan(vai_tro_id);
CREATE INDEX IF NOT EXISTS idx_ban_an_khu_vuc ON ban_an(khu_vuc_id);
CREATE INDEX IF NOT EXISTS idx_ban_an_trang_thai ON ban_an(trang_thai);
CREATE INDEX IF NOT EXISTS idx_mon_an_danh_muc ON mon_an(danh_muc_id);
CREATE INDEX IF NOT EXISTS idx_mon_an_trang_thai ON mon_an(trang_thai);
CREATE INDEX IF NOT EXISTS idx_mon_an_da_xoa ON mon_an(da_xoa);
CREATE INDEX IF NOT EXISTS idx_nhat_ky_tai_khoan ON nhat_ky_he_thong(tai_khoan_id);
