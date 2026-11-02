-- Du lieu mau he thong Quan Ly Nha Hang & Goi Mon QR
PRAGMA foreign_keys = ON;

-- 1. Vai tro
INSERT OR IGNORE INTO vai_tro (id, ma_vai_tro, ten_vai_tro, mo_ta, la_he_thong, trang_thai) VALUES
(1, 'QUAN_LY', 'Quản lý', 'Quản trị hệ thống toàn quyền', 1, 1),
(2, 'THU_NGAN', 'Thu ngân', 'Quản lý thu ngân và thanh toán', 1, 1),
(3, 'BEP', 'Bếp', 'Quản lý chế biến món ăn', 1, 1),
(4, 'PHUC_VU', 'Phục vụ', 'Phục vụ tại bàn', 1, 1);

-- 2. Quyen han (it nhat 16 quyen theo tieu chuan he thong)
INSERT OR IGNORE INTO quyen_han (id, ma_quyen, ten_quyen, nhom_quyen, mo_ta, trang_thai) VALUES
(1, 'TAI_KHOAN_XEM', 'Xem tài khoản', 'TaiKhoan', 'Quyền xem danh sách tài khoản', 1),
(2, 'TAI_KHOAN_THEM', 'Thêm tài khoản', 'TaiKhoan', 'Quyền tạo mới tài khoản', 1),
(3, 'TAI_KHOAN_SUA', 'Sửa tài khoản', 'TaiKhoan', 'Quyền cập nhật tài khoản', 1),
(4, 'TAI_KHOAN_KHOA', 'Khóa tài khoản', 'TaiKhoan', 'Quyền khóa hoặc mở khóa tài khoản', 1),
(5, 'VAI_TRO_XEM', 'Xem vai trò', 'VaiTro', 'Quyền xem danh sách vai trò', 1),
(6, 'VAI_TRO_QUAN_LY', 'Quản lý vai trò', 'VaiTro', 'Quyền thiết lập vai trò và phân quyền', 1),
(7, 'NHAN_VIEN_XEM', 'Xem nhân viên', 'NhanSu', 'Quyền xem danh sách nhân sự', 1),
(8, 'NHAN_VIEN_QUAN_LY', 'Quản lý nhân sự', 'NhanSu', 'Quyền thêm sửa nhân viên', 1),
(9, 'quan_ly_nhan_su', 'Quản lý hồ sơ nhân sự', 'NhanSu', 'Toàn quyền nghiệp vụ nhân sự', 1),
(10, 'BAN_AN_XEM', 'Xem sơ đồ bàn', 'BanAn', 'Quyền xem trạng thái bàn ăn', 1),
(11, 'BAN_AN_QUAN_LY', 'Quản lý sơ đồ bàn', 'BanAn', 'Quyền thêm sửa cấu hình bàn ăn', 1),
(12, 'quan_ly_ban_an', 'Quản trị bàn ăn và QR', 'BanAn', 'Quyền sinh và cấp lại QR bàn', 1),
(13, 'THUC_DON_XEM', 'Xem thực đơn', 'ThucDon', 'Quyền xem danh sách món ăn', 1),
(14, 'THUC_DON_QUAN_LY', 'Quản lý thực đơn', 'ThucDon', 'Quyền chỉnh sửa món ăn và danh mục', 1),
(15, 'quan_ly_thuc_don', 'Quản trị thực đơn toàn quyền', 'ThucDon', 'Quyền xóa mềm và toggle trạng thái món', 1),
(16, 'CAU_HINH_QUAN_LY', 'Quản lý cấu hình', 'HeThong', 'Quyền thiết lập thông số nhà hàng', 1),
(17, 'NHAT_KY_XEM', 'Xem nhật ký hệ thống', 'HeThong', 'Quyền tra cứu audit log', 1);

-- Gan toan bo quyen cho QUAN_LY
INSERT OR IGNORE INTO vai_tro_quyen_han (vai_tro_id, quyen_han_id)
SELECT 1, id FROM quyen_han;

-- Gan quyen cho THU_NGAN
INSERT OR IGNORE INTO vai_tro_quyen_han (vai_tro_id, quyen_han_id) VALUES 
(2, 1), (2, 10), (2, 11), (2, 12), (2, 13);

-- Gan quyen cho BEP
INSERT OR IGNORE INTO vai_tro_quyen_han (vai_tro_id, quyen_han_id) VALUES 
(3, 13), (3, 14);

-- Gan quyen cho PHUC_VU
INSERT OR IGNORE INTO vai_tro_quyen_han (vai_tro_id, quyen_han_id) VALUES 
(4, 10), (4, 13);

-- 3. Tai khoan
-- MatKhau@123 hash: $2b$10$t02k8PIMAbU.AW9vZh1EwutmfvMD811jnXPxS7crbX1fylhfa4zn.
INSERT OR IGNORE INTO tai_khoan (id, ten_dang_nhap, mat_khau, mat_khau_bam, ho_ten, so_dien_thoai, email, vai_tro_id, trang_thai) VALUES
(1, 'quanly', '$2b$10$t02k8PIMAbU.AW9vZh1EwutmfvMD811jnXPxS7crbX1fylhfa4zn.', '$2b$10$t02k8PIMAbU.AW9vZh1EwutmfvMD811jnXPxS7crbX1fylhfa4zn.', 'Nguyễn Văn Quản Lý', '0901111222', 'quanly@example.test', 1, 1),
(2, 'thungan', '$2b$10$t02k8PIMAbU.AW9vZh1EwutmfvMD811jnXPxS7crbX1fylhfa4zn.', '$2b$10$t02k8PIMAbU.AW9vZh1EwutmfvMD811jnXPxS7crbX1fylhfa4zn.', 'Trần Thị Thu Ngân', '0903333444', 'thungan@example.test', 2, 1),
(3, 'bep01', '$2b$10$t02k8PIMAbU.AW9vZh1EwutmfvMD811jnXPxS7crbX1fylhfa4zn.', '$2b$10$t02k8PIMAbU.AW9vZh1EwutmfvMD811jnXPxS7crbX1fylhfa4zn.', 'Lê Văn Bếp Trưởng', '0905555666', 'bep@example.test', 3, 1),
(4, 'phucvu', '$2b$10$t02k8PIMAbU.AW9vZh1EwutmfvMD811jnXPxS7crbX1fylhfa4zn.', '$2b$10$t02k8PIMAbU.AW9vZh1EwutmfvMD811jnXPxS7crbX1fylhfa4zn.', 'Hoàng Văn Phục Vụ', '0907777888', 'phucvu@example.test', 4, 1);

-- Gan vai tro tai khoan
INSERT OR IGNORE INTO tai_khoan_vai_tro (tai_khoan_id, vai_tro_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);

-- 4. Khu vuc
INSERT OR IGNORE INTO khu_vuc (id, ten_khu_vuc, tang, mo_ta, ghi_chu, thu_tu_hien_thi, trang_thai) VALUES
(1, 'Tầng 1 - Sảnh chính', 1, 'Khu vực trong nhà tầng 1', 'Khu vực trong nhà', 1, 'hoat_dong'),
(2, 'Tầng 2 - Ngoài trời', 2, 'Khu vực ban công ngoài trời thoáng mát', 'Khu vực ngoài trời', 2, 'hoat_dong'),
(3, 'Phòng VIP', 3, 'Khu vực phòng riêng sang trọng', 'Phòng VIP cao cấp', 3, 'hoat_dong');

-- 5. Ban an
INSERT OR IGNORE INTO ban_an (id, khu_vuc_id, ma_ban, ten_ban, suc_chua, trang_thai, ma_qr_token, url_ma_qr) VALUES
(1, 1, 'B101', 'Bàn 01', 4, 'trong', 'dev-token-b101', 'http://localhost:3001/e-menu?ban=B101&token=dev-token-b101'),
(2, 1, 'B102', 'Bàn 02', 4, 'trong', 'dev-token-b102', 'http://localhost:3001/e-menu?ban=B102&token=dev-token-b102'),
(3, 2, 'B201', 'Bàn 11', 4, 'trong', 'dev-token-b201', 'http://localhost:3001/e-menu?ban=B201&token=dev-token-b201'),
(4, 3, 'VIP1', 'Phòng VIP 1', 10, 'trong', 'dev-token-vip1', 'http://localhost:3001/e-menu?ban=VIP1&token=dev-token-vip1');

-- 6. Danh muc mon
INSERT OR IGNORE INTO danh_muc_mon (id, ten_danh_muc, mo_ta, thu_tu_hien_thi, trang_thai) VALUES
(1, 'Khai vị', 'Món khai vị kích thích vị giác', 1, 'hien_thi'),
(2, 'Món chính', 'Món chính ẩm thực Việt đặc sắc', 2, 'hien_thi'),
(3, 'Lẩu', 'Lẩu các loại nước dùng thanh ngọt', 3, 'hien_thi'),
(4, 'Đồ uống', 'Trà hoa quả và nước giải khát', 4, 'hien_thi'),
(5, 'Tráng miệng', 'Chè, kem và trái cây tươi', 5, 'hien_thi');

-- 7. Mon an
INSERT OR IGNORE INTO mon_an (id, danh_muc_id, ma_mon, ten_mon, mo_ta, gia_ban, don_vi_tinh, hinh_anh, la_mon_noi_bat, trang_thai, da_xoa) VALUES
(1, 1, 'KV001', 'Gỏi bò bóp thấu', 'Thịt bò tái bóp cùng khế, bắp chuối, hành tây thơm lừng', 95000, 'Đĩa', '/tepTaiLen/anhMonAn/goi-bo.jpg', 1, 'dang_ban', 0),
(2, 2, 'MC001', 'Bò tơ hấp cuốn bánh tráng', 'Bò tơ Củ Chi hấp gừng sả kèm rau rừng và mắm nêm', 185000, 'Phần', '/tepTaiLen/anhMonAn/bo-to-hap.jpg', 1, 'dang_ban', 0),
(3, 3, 'L001', 'Lẩu bò nhúng dấm', 'Thịt bò tươi nhúng dấm nước dừa chua thanh ngọt dịu', 295000, 'Nồi', '/tepTaiLen/anhMonAn/lau-bo.jpg', 0, 'dang_ban', 0),
(4, 4, 'DU001', 'Trà vải hoa nhài', 'Trà lài ủ lạnh kết hợp vải thiều mọng nước thanh mát', 35000, 'Ly', '/tepTaiLen/anhMonAn/tra-vai.jpg', 1, 'dang_ban', 0);

-- 8. Tuy chon mon
INSERT OR IGNORE INTO tuy_chon_mon (id, mon_an_id, loai_tuy_chon, ten_tuy_chon, gia_them, bat_buoc, trang_thai) VALUES
(1, 1, 'topping', 'Thêm Bò', 30000, 0, 'HoatDong'),
(2, 1, 'topping', 'Thêm Bánh Phồng Tôm', 10000, 0, 'HoatDong'),
(3, 4, 'topping', 'Thêm Trân Châu Trắng', 5000, 0, 'HoatDong');

-- 9. Cau hinh nha hang chuan theo module cauHinhNhaHang.service.js
INSERT OR IGNORE INTO cau_hinh_nha_hang (ma_cau_hinh, gia_tri, nhom_cau_hinh, kieu_du_lieu, mo_ta) VALUES
('TEN_NHA_HANG', 'Nhà hàng Quán Mộc', 'THONG_TIN_CHUNG', 'text', 'Tên thương hiệu nhà hàng hiển thị'),
('DIA_CHI', '123 Đường Ẩm Thực, Quận 1, TP. Hồ Chí Minh', 'THONG_TIN_CHUNG', 'text', 'Địa chỉ cơ sở chính'),
('SO_DIEN_THOAI', '028 3888 9999', 'THONG_TIN_CHUNG', 'text', 'Hotline hỗ trợ khách hàng'),
('EMAIL', 'lienhe@quanmoc.test', 'THONG_TIN_CHUNG', 'text', 'Email liên hệ'),
('WIFI_TEN', 'QuanMoc_KhachHang', 'THONG_TIN_CHUNG', 'text', 'Tên mạng wifi'),
('WIFI_MAT_KHAU', 'quanmoc999', 'THONG_TIN_CHUNG', 'text', 'Mật khẩu wifi'),
('KHAU_HIEU', 'Hương vị mộc mạc - Đậm đà tình quê', 'THONG_TIN_CHUNG', 'text', 'Khẩu hiệu nhà hàng'),
('GIO_MO_CUA', '09:00', 'THONG_TIN_CHUNG', 'text', 'Giờ mở cửa'),
('GIO_DONG_CUA', '22:30', 'THONG_TIN_CHUNG', 'text', 'Giờ đóng cửa'),

('VAT_PHAN_TRAM', '8.0', 'THUE_PHI', 'number', 'Phần trăm thuế VAT'),
('PHI_PHUC_VU_PHAN_TRAM', '0.0', 'THUE_PHI', 'number', 'Phần trăm phí dịch vụ'),
('AP_DUNG_VAT', '1', 'THUE_PHI', 'boolean', 'Áp dụng VAT'),
('AP_DUNG_PHI_PHUC_VU', '0', 'THUE_PHI', 'boolean', 'Áp dụng phí phục vụ'),

('VIETQR_NGAN_HANG_MA', 'MB', 'VIET_QR', 'text', 'Mã ngân hàng nhận tiền Napas'),
('VIETQR_NGAN_HANG_TEN', 'Ngân hàng Quân Đội', 'VIET_QR', 'text', 'Tên ngân hàng thụ hưởng'),
('VIETQR_SO_TAI_KHOAN', '090123456789', 'VIET_QR', 'text', 'Số tài khoản ngân hàng nhận tiền'),
('VIETQR_CHU_TAI_KHOAN', 'NHA HANG QUAN MOC', 'VIET_QR', 'text', 'Tên chủ tài khoản thụ hưởng'),
('VIETQR_CU_PHAP', 'QUANMOC {maHoaDon}', 'VIET_QR', 'text', 'Cú pháp chuyển khoản');

-- 10. Nhat ky he thong mau
INSERT OR IGNORE INTO nhat_ky_he_thong (id, tai_khoan_id, loai_hanh_dong, hanh_dong, module, mo_ta, dia_chi_ip, ngay_tao) VALUES
(1, 1, 'HE_THONG', 'KHOI_TAO', 'HE_THONG', 'Khởi tạo cơ sở dữ liệu hệ thống thành công', '127.0.0.1', CURRENT_TIMESTAMP);

-- 11. Phien ban Sprint 2
INSERT OR IGNORE INTO phien_ban (id, ban_an_id, ma_phien, ma_dinh_danh_qr, token_phien_hash, thoi_gian_bat_dau, trang_thai) VALUES
(1, 1, 'PB_B101', 'QR_BAN_1', 'hash-b101', CURRENT_TIMESTAMP, 'dang_su_dung'),
(2, 3, 'PB_B201', 'QR_BAN_3', 'hash-b201', CURRENT_TIMESTAMP, 'da_thanh_toan');
