-- ============================================================================
-- DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
-- TẬP TIN SEEDER NẠP DỮ LIỆU MẪU CHUẨN HÓA (ĐỒNG BỘ 100% THIẾT KẾ FIGMA)
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- 1. VAI TRÒ HỆ THỐNG (RBAC)
-- ----------------------------------------------------------------------------
INSERT INTO vai_tro (id, ma_vai_tro, ten_vai_tro, mo_ta) VALUES
(1, 'quan_ly', 'Quản trị viên / Quản lý', 'Toàn quyền cấu hình nhà hàng, quản lý nhân sự, thực đơn và báo cáo'),
(2, 'thu_ngan', 'Nhân viên Thu ngân', 'Vận hành POS, lập hóa đơn, thu tiền VietQR/tiền mặt, chốt ca Z-Report'),
(3, 'bep', 'Đầu bếp / Pha chế', 'Tiếp nhận đơn KDS, điều phối nấu nướng, báo hết món và nhận lệnh ưu tiên'),
(4, 'phuc_vu', 'Nhân viên Phục vụ', 'Quản lý sơ đồ bàn, duyệt đơn QR, đặt món hộ, chuyển/gộp bàn, nộp đơn đổi/nghỉ ca');

-- ----------------------------------------------------------------------------
-- 2. TÀI KHOẢN NGƯỜI DÙNG (Mật khẩu mặc định: 123456 - bcrypt hash)
-- ----------------------------------------------------------------------------
INSERT INTO tai_khoan (id, ten_dang_nhap, mat_khau_hash, vai_tro_id, trang_thai) VALUES
(1, 'admin', '$2b$10$pNVdsO1HySOWnO2woL6g6OU6BpzgginAZz.J2ilJM5VtQZrF4jW1.', 1, 'hoat_dong'),
(2, 'thungan01', '$2b$10$pNVdsO1HySOWnO2woL6g6OU6BpzgginAZz.J2ilJM5VtQZrF4jW1.', 2, 'hoat_dong'),
(3, 'bep01', '$2b$10$pNVdsO1HySOWnO2woL6g6OU6BpzgginAZz.J2ilJM5VtQZrF4jW1.', 3, 'hoat_dong'),
(4, 'phucvu01', '$2b$10$pNVdsO1HySOWnO2woL6g6OU6BpzgginAZz.J2ilJM5VtQZrF4jW1.', 4, 'hoat_dong'),
(5, 'phucvu02', '$2b$10$pNVdsO1HySOWnO2woL6g6OU6BpzgginAZz.J2ilJM5VtQZrF4jW1.', 4, 'hoat_dong'),
(6, 'phucvu03', '$2b$10$pNVdsO1HySOWnO2woL6g6OU6BpzgginAZz.J2ilJM5VtQZrF4jW1.', 4, 'hoat_dong'),
(7, 'thungan', '$2b$10$pNVdsO1HySOWnO2woL6g6OU6BpzgginAZz.J2ilJM5VtQZrF4jW1.', 2, 'hoat_dong'),
(8, 'bep', '$2b$10$pNVdsO1HySOWnO2woL6g6OU6BpzgginAZz.J2ilJM5VtQZrF4jW1.', 3, 'hoat_dong'),
(9, 'phucvu', '$2b$10$pNVdsO1HySOWnO2woL6g6OU6BpzgginAZz.J2ilJM5VtQZrF4jW1.', 4, 'hoat_dong');

-- ----------------------------------------------------------------------------
-- 3. HỒ SƠ NHÂN SỰ
-- ----------------------------------------------------------------------------
INSERT INTO nhan_vien (id, tai_khoan_id, ho_ten, so_dien_thoai, email, cccd, hinh_thuc_lam_viec, muc_luong, ngay_vao_lam, trang_thai) VALUES
(1, 1, 'Nguyễn Quản Trị', '0901111222', 'admin@mocdining.vn', '079090001111', 'toan_thoi_gian', 22000000, '2025-01-01', 'dang_lam'),
(2, 2, 'Trần Thị Thu Ngân', '0902222333', 'thungan@mocdining.vn', '079090002222', 'toan_thoi_gian', 11000000, '2025-02-01', 'dang_lam'),
(3, 3, 'Bùi Văn Bếp Trưởng', '0903333444', 'bep@mocdining.vn', '079090003333', 'toan_thoi_gian', 16000000, '2025-01-15', 'dang_lam'),
(4, 4, 'Lê Văn Minh', '0904444555', 'minh.le@mocdining.vn', '079090004444', 'ban_thoi_gian', 6500000, '2025-03-01', 'dang_lam'),
(5, 5, 'Phạm Thị Lan', '0905555666', 'lan.pham@mocdining.vn', '079090005555', 'ban_thoi_gian', 6500000, '2025-03-01', 'dang_lam'),
(6, 6, 'Hoàng Tuấn Kiệt', '0906666777', 'kiet.hoang@mocdining.vn', '079090006666', 'ban_thoi_gian', 6000000, '2025-04-01', 'dang_lam'),
(7, 7, 'Trần Thị Thu Ngân', '0902222334', 'thungan2@mocdining.vn', '079090002223', 'toan_thoi_gian', 11000000, '2025-02-01', 'dang_lam'),
(8, 8, 'Bùi Văn Bếp Trưởng', '0903333445', 'bep2@mocdining.vn', '079090003334', 'toan_thoi_gian', 16000000, '2025-01-15', 'dang_lam'),
(9, 9, 'Nguyễn Thị Lan', '0907777888', 'lan.nguyen@mocdining.vn', '079090007777', 'ban_thoi_gian', 6500000, '2025-03-01', 'dang_lam');

-- ----------------------------------------------------------------------------
-- 4. CẤU HÌNH NHÀ HÀNG (Đồng bộ Figma C09)
-- ----------------------------------------------------------------------------
INSERT INTO cau_hinh_nha_hang (id, ten_nha_hang, dia_chi, so_dien_thoai, email, anh_logo, phan_tram_vat, ngan_hang_vietqr, so_tai_khoan_vietqr, ten_chu_tai_khoan_vietqr) VALUES
(1, 'CONG TY MOC DINING', 'Chi nhánh Thảo Điền - Bếp nóng · Trạm 01, TP. Thủ Đức, TP. HCM', '028 3822 9999', 'contact@mocdining.vn', '/assets/logo-moc.svg', 8, 'Vietcombank', '0123 456 789', 'CONG TY MOC DINING');

-- ----------------------------------------------------------------------------
-- 5. SƠ ĐỒ KHU VỰC
-- ----------------------------------------------------------------------------
INSERT INTO khu_vuc (id, ma_khu_vuc, ten_khu_vuc, mo_ta, thu_tu_hien_thi, kich_hoat) VALUES
(1, 'KV_T1', 'Tầng 1 (Khu Máy Lạnh)', 'Không gian máy lạnh sang trọng, view bếp mở', 1, 1),
(2, 'KV_T2', 'Tầng 2 (Sân Thượng)', 'Không gian mở thoáng đãng ngắm cảnh đêm', 2, 1),
(3, 'KV_VIP', 'Khu Phòng VIP', 'Phòng tiệc riêng tư cho nhóm từ 8-12 khách', 3, 1);

-- ----------------------------------------------------------------------------
-- 6. SƠ ĐỒ BÀN ĂN (Gồm Bàn 08 trọng điểm trong Figma)
-- ----------------------------------------------------------------------------
INSERT INTO ban_an (id, khu_vuc_id, ma_ban, ten_ban, suc_chua, trang_thai, ma_qr_token, tu_dong_duyet_mon, kich_hoat) VALUES
-- Tầng 1 (Bàn 01 -> Bàn 12)
(1, 1, 'B01', 'Bàn 01', 4, 'trong', 'qr_token_b01_t1_moc', 0, 1),
(2, 1, 'B02', 'Bàn 02', 4, 'trong', 'qr_token_b02_t1_moc', 0, 1),
(3, 1, 'B03', 'Bàn 03', 2, 'trong', 'qr_token_b03_t1_moc', 0, 1),
(4, 1, 'B04', 'Bàn 04', 6, 'trong', 'qr_token_b04_t1_moc', 0, 1),
(5, 1, 'B05', 'Bàn 05', 4, 'cho_mon', 'qr_token_b05_t1_moc', 0, 1),
(6, 1, 'B06', 'Bàn 06', 4, 'trong', 'qr_token_b06_t1_moc', 0, 1),
(7, 1, 'B07', 'Bàn 07', 2, 'trong', 'qr_token_b07_t1_moc', 0, 1),
(8, 1, 'B08', 'Bàn 08', 4, 'co_khach', 'qr_token_b08_t1_moc', 0, 1), -- BÀN 08 FIGMA
(9, 1, 'B09', 'Bàn 09', 6, 'yeu_cau_thanh_toan', 'qr_token_b09_t1_moc', 0, 1),
(10, 1, 'B10', 'Bàn 10', 4, 'can_don_dep', 'qr_token_b10_t1_moc', 0, 1),
(11, 1, 'B11', 'Bàn 11', 4, 'trong', 'qr_token_b11_t1_moc', 0, 1),
(12, 1, 'B12', 'Bàn 12', 8, 'trong', 'qr_token_b12_t1_moc', 0, 1),
-- Tầng 2 (Bàn 13 -> Bàn 20)
(13, 2, 'B13', 'Bàn 13', 4, 'trong', 'qr_token_b13_t2_moc', 0, 1),
(14, 2, 'B14', 'Bàn 14', 4, 'trong', 'qr_token_b14_t2_moc', 0, 1),
(15, 2, 'B15', 'Bàn 15', 6, 'trong', 'qr_token_b15_t2_moc', 0, 1),
(16, 2, 'B16', 'Bàn 16', 4, 'trong', 'qr_token_b16_t2_moc', 0, 1),
-- Phòng VIP
(17, 3, 'VIP01', 'Phòng VIP 01', 10, 'trong', 'qr_token_vip01_moc', 1, 1),
(18, 3, 'VIP02', 'Phòng VIP 02', 12, 'trong', 'qr_token_vip02_moc', 1, 1);

-- ----------------------------------------------------------------------------
-- 7. LỊCH PHÂN CA LÀM VIỆC & PHÂN CÔNG BÀN (Khớp Figma W11)
-- ----------------------------------------------------------------------------
INSERT INTO ca_lam_viec (id, nhan_vien_id, ngay_lam, ten_ca, gio_bat_dau, gio_ket_thuc, trang_thai, ghi_chu) VALUES
(1, 4, CURRENT_DATE, 'ca_toi', '17:00', '22:00', 'da_checkin', 'Phụ trách Tầng 1 · Bàn 01–12 (Lê Văn Minh)'),
(2, 5, CURRENT_DATE, 'ca_sang', '10:00', '15:00', 'da_hoan_thanh', 'Phụ trách Tầng 1 (Phạm Thị Lan)'),
(3, 4, DATE('now', '+1 day'), 'ca_toi', '17:00', '22:00', 'ke_hoach', 'Lịch Thứ Sáu'),
(4, 4, DATE('now', '+2 day'), 'ca_sang', '10:00', '15:00', 'ke_hoach', 'Lịch Thứ Bảy (đang xin đổi sang ca tối)'),
(5, 5, DATE('now', '+2 day'), 'ca_toi', '17:00', '22:00', 'ke_hoach', 'Lịch Thứ Bảy của Lan');

INSERT INTO phan_cong_ban (id, nhan_vien_id, ban_an_id, ngay_phan_cong, ten_ca) VALUES
(1, 4, 8, CURRENT_DATE, 'ca_toi'),
(2, 4, 1, CURRENT_DATE, 'ca_toi'),
(3, 4, 2, CURRENT_DATE, 'ca_toi'),
(4, 4, 3, CURRENT_DATE, 'ca_toi'),
(5, 4, 4, CURRENT_DATE, 'ca_toi'),
(6, 4, 5, CURRENT_DATE, 'ca_toi');

-- Phiếu xin đổi ca mẫu (Figma W11)
INSERT INTO yeu_cau_doi_ca (id, nhan_vien_yeu_cau_id, ca_lam_viec_id, loai_yeu_cau, nhan_vien_nhan_ca_id, ly_do, trang_thai) VALUES
(1, 4, 4, 'doi_ca', 5, 'Có lịch học bù vào buổi sáng thứ Bảy.', 'cho_duyet');

-- ----------------------------------------------------------------------------
-- 8. DANH MỤC THỰC ĐƠN (Khớp Figma C02)
-- ----------------------------------------------------------------------------
INSERT INTO danh_muc_mon (id, ma_danh_muc, ten_danh_muc, thu_tu_hien_thi, kich_hoat) VALUES
(1, 'DM_KHAI_VI', 'Khai vị', 1, 1),
(2, 'DM_MON_CHINH', 'Món chính', 2, 1),
(3, 'DM_DO_UONG', 'Đồ uống', 3, 1),
(4, 'DM_LAU', 'Lẩu & Nồi', 4, 1),
(5, 'DM_COMBO', 'Combo đặc biệt', 5, 1);

-- ----------------------------------------------------------------------------
-- 9. MÓN ĂN & THỨC UỐNG (Khớp Figma C02, C03)
-- ----------------------------------------------------------------------------
INSERT INTO mon_an (id, danh_muc_id, ma_mon, ten_mon, don_gia, don_vi_tinh, anh_mon_an, mo_ta, con_mon, la_combo, la_ban_chay, la_goi_y, kich_hoat) VALUES
-- Món chính
(1, 2, 'MC_BO_LUC_LAC', 'Bò lúc lắc', 189000, 'dia', '/assets/dishes/bo-luc-lac.jpg', 'Bò Úc áp chảo mềm mọng, xào ớt chuông và sốt tiêu đen gia truyền', 1, 0, 1, 1, 1),
(2, 1, 'KV_GOI_NGO_SEN', 'Gỏi ngó sen tôm', 125000, 'dia', '/assets/dishes/goi-ngo-sen.jpg', 'Gợi ý từ bếp · Ngó sen giòn ngọt, tôm sú tươi và nước mắm chua ngọt đặc trưng', 1, 0, 0, 1, 1),
(3, 1, 'KV_CHA_GIO_MOC', 'Chả giò Mộc hải sản', 95000, 'dia', '/assets/dishes/cha-gio.jpg', 'Chả giò rế chiên giòn rụm, nhân cua thịt và sốt chấm chua ngọt', 1, 0, 1, 0, 1),
(4, 2, 'MC_SUON_NUONG', 'Sườn heo nướng thảo mộc', 165000, 'dia', '/assets/dishes/suon-nuong.jpg', 'Sườn cây ướp thảo mộc Tây Bắc, nướng than hoa thơm lừng', 1, 0, 1, 0, 1),
(5, 2, 'MC_CA_CHEM_CHANH_LEO', 'Cá chẽm sốt chanh leo', 215000, 'dia', '/assets/dishes/ca-chem.jpg', 'Phi lê cá chẽm tươi áp chảo giòn da, sốt chanh leo chua thanh', 1, 0, 0, 1, 1),
(6, 4, 'LN_LAU_NAM_GA', 'Lẩu nấm gà ta thảo mộc', 359000, 'noi', '/assets/dishes/lau-ga.jpg', 'Gà ta thả vườn ninh cùng 6 loại nấm tươi thanh mát bổ dưỡng', 1, 0, 1, 0, 1),
-- Đồ uống
(7, 3, 'DU_TRA_DAO_CAM_SA', 'Trà đào cam sả', 45000, 'ly', '/assets/dishes/tra-dao.jpg', 'Trà đen ủ lạnh kết hợp đào miếng giòn, cam vàng và hương sả tự nhiên', 1, 0, 1, 1, 1),
(8, 3, 'DU_EP_DUA_HAU', 'Nước ép dưa hấu bạc hà', 42000, 'ly', '/assets/dishes/dua-hau.jpg', 'Nước ép dưa hấu nguyên chất thanh nhiệt', 1, 0, 0, 0, 1),
(9, 3, 'DU_BIA_MOC_CRAFT', 'Bia thủ công Mộc Craft', 65000, 'chai', '/assets/dishes/bia-craft.jpg', 'Bia thủ công vị hoa bia thơm nồng', 1, 0, 0, 0, 1),
-- Combo
(10, 5, 'CB_SUM_VAY', 'Combo sum vầy · 4 người', 599000, 'set', '/assets/dishes/combo-sum-vay.jpg', 'Cùng nhau thưởng thức: 1 Gỏi ngó sen, 1 Bò lúc lắc, 1 Sườn nướng, 4 Trà đào. Tiết kiệm 80.000đ', 1, 1, 1, 1, 1);

-- Chi tiết định mức combo
INSERT INTO combo_chi_tiet (id, combo_id, mon_an_le_id, so_luong) VALUES
(1, 10, 2, 1), -- 1x Gỏi ngó sen tôm
(2, 10, 1, 1), -- 1x Bò lúc lắc
(3, 10, 4, 1), -- 1x Sườn heo nướng
(4, 10, 7, 4); -- 4x Trà đào cam sả

-- ----------------------------------------------------------------------------
-- 10. PHIÊN BÀN HIỆN DIỆN TẠI BÀN 08 (Khớp Figma C01 & C09)
-- ----------------------------------------------------------------------------
INSERT INTO phien_ban (id, ban_an_id, ma_phien, thoi_gian_bat_dau, trang_thai, so_luong_khach, ghi_chu) VALUES
(1, 8, 'PB_B08_20261120', DATETIME('now', '-45 minutes'), 'dang_hoat_dong', 4, 'Bàn 08 · Tầng 1 · 4 khách');

-- Đợt gọi món của Bàn 08
INSERT INTO don_goi_mon (id, phien_ban_id, ma_don, nguon_tao, nhan_vien_duyet_id, trang_thai, thoi_gian_gui, thoi_gian_duyet) VALUES
(1, 1, 'DGM_B08_001', 'khach_qr', 4, 'da_duyet', DATETIME('now', '-40 minutes'), DATETIME('now', '-38 minutes'));

-- Các món ăn đang được chế biến tại KDS
INSERT INTO chi_tiet_don_mon (id, don_goi_mon_id, mon_an_id, so_luong, don_gia, ghi_chu, trang_thai_mon, la_uu_tien, thoi_gian_bat_dau_nau, thoi_gian_hoan_thanh_nau, dau_bep_id) VALUES
(1, 1, 1, 1, 189000, 'Bò chín vừa, ít tiêu', 'dang_nau', 0, DATETIME('now', '-15 minutes'), NULL, 3),
(2, 1, 2, 1, 125000, 'Không cay', 'hoan_thanh', 0, DATETIME('now', '-35 minutes'), DATETIME('now', '-20 minutes'), 3),
(3, 1, 7, 4, 45000, 'Ít đường, nhiều đá', 'da_phuc_vu', 0, DATETIME('now', '-35 minutes'), DATETIME('now', '-30 minutes'), 3);

-- Hóa đơn tạm tính khớp mã hiển thị Figma C09: "MOC B08 HD0819"
INSERT INTO hoa_don (id, phien_ban_id, ma_hoa_don, thu_ngan_id, tong_tien_mon, phan_tram_chiet_khau, tien_chiet_khau, phan_tram_vat, tien_vat, tong_tien_thanh_toan, phuong_thuc_thanh_toan, trang_thai, ghi_chu) VALUES
(1, 1, 'MOC B08 HD0819', 2, 494000, 0, 0, 8, 39520, 533520, 'vietqr', 'chua_thanh_toan', 'Hóa đơn tạm tính bàn 08');

INSERT INTO chi_tiet_hoa_don (id, hoa_don_id, chi_tiet_don_mon_id, mon_an_id, ten_mon, don_gia, so_luong, thanh_tien) VALUES
(1, 1, 1, 1, 'Bò lúc lắc', 189000, 1, 189000),
(2, 1, 2, 2, 'Gỏi ngó sen tôm', 125000, 1, 125000),
(3, 1, 3, 7, 'Trà đào cam sả', 45000, 4, 180000);

-- ----------------------------------------------------------------------------
-- 11. NHẬT KÝ KIỂM TOÁN BAN ĐẦU
-- ----------------------------------------------------------------------------
INSERT INTO nhat_ky_kiem_toan (id, tai_khoan_id, hanh_dong, bang_anh_huong, ban_ghi_id, du_lieu_cu, du_lieu_moi, dia_chi_ip, thiet_bi, ly_do) VALUES
(1, 1, 'KHOI_TAO_HE_THONG', 'cau_hinh_nha_hang', 1, NULL, '{"ten_nha_hang":"CONG TY MOC DINING"}', '127.0.0.1', 'Local Server', 'Khởi tạo hệ thống CSDL thành công');
