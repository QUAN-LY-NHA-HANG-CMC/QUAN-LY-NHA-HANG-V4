-- Dữ liệu mẫu vai trò
INSERT OR IGNORE INTO vai_tro (id, ma_vai_tro, ten_vai_tro, mo_ta) VALUES
(1, 'quan_ly', 'Quản lý', 'Toàn quyền điều hành và quản trị hệ thống'),
(2, 'thu_ngan', 'Thu ngân', 'Quản lý sơ đồ bàn, kiểm tra hóa đơn và thu tiền'),
(3, 'bep', 'Đầu bếp', 'Xem và cập nhật trạng thái chế biến món ăn'),
(4, 'phuc_vu', 'Phục vụ', 'Hỗ trợ khách hàng tại bàn và bưng món');

-- Dữ liệu mẫu quyền hạn
INSERT OR IGNORE INTO quyen_han (id, ma_quyen, ten_quyen, nhom_quyen, mo_ta) VALUES
(1, 'quan_ly_he_thong', 'Quản trị hệ thống', 'HeThong', 'Cấu hình chung và xem nhật ký'),
(2, 'quan_ly_nhan_vien', 'Quản lý nhân sự', 'NhanSu', 'Thêm, sửa, khóa tài khoản nhân viên'),
(3, 'quan_ly_thuc_don', 'Quản lý thực đơn', 'ThucDon', 'Thêm, sửa, xóa món ăn và danh mục'),
(4, 'quan_ly_ban_an', 'Quản lý sơ đồ bàn', 'BanAn', 'Quản lý khu vực, bàn và xuất mã QR'),
(5, 'xem_bao_cao', 'Xem báo cáo doanh thu', 'BaoCao', 'Xem biểu đồ thống kê và lịch sử doanh thu'),
(6, 'dieu_phoi_bep', 'Điều phối bếp', 'Bep', 'Tiếp nhận đơn và đổi trạng thái món ăn'),
(7, 'thu_ngan_thanh_toan', 'Thu ngân & Thanh toán', 'ThuNgan', 'Tạm tính, áp mã giảm giá và thanh toán'),
(8, 'phuc_vu_ban', 'Phục vụ bàn', 'PhucVu', 'Đặt món hộ và xác nhận phục vụ');

-- Gán quyền cho vai trò Quản lý (toàn quyền)
INSERT OR IGNORE INTO vai_tro_quyen_han (vai_tro_id, quyen_han_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8);

-- Gán quyền cho Thu ngân
INSERT OR IGNORE INTO vai_tro_quyen_han (vai_tro_id, quyen_han_id) VALUES
(2, 4), (2, 7), (2, 8);

-- Gán quyền cho Bếp
INSERT OR IGNORE INTO vai_tro_quyen_han (vai_tro_id, quyen_han_id) VALUES
(3, 6);

-- Gán quyền cho Phục vụ
INSERT OR IGNORE INTO vai_tro_quyen_han (vai_tro_id, quyen_han_id) VALUES
(4, 4), (4, 8);

-- Tài khoản mẫu (Mật khẩu mặc định: 123456)
INSERT OR IGNORE INTO tai_khoan (id, ten_dang_nhap, mat_khau_bam, ho_ten, so_dien_thoai, email, vai_tro_id, trang_thai) VALUES
(1, 'admin', '$2b$10$nAQgVnjtxOufLmtvCPltZOGvgDRwiOa93aKU.hgrTT0JLw5wxO9QS', 'Quản Lý Quán Mộc', '0901234567', 'admin@quanmoc.com', 1, 'hoat_dong'),
(2, 'thungan', '$2b$10$nAQgVnjtxOufLmtvCPltZOGvgDRwiOa93aKU.hgrTT0JLw5wxO9QS', 'Nguyễn Thu Ngân', '0901234568', 'thungan@quanmoc.com', 2, 'hoat_dong'),
(3, 'daubep', '$2b$10$nAQgVnjtxOufLmtvCPltZOGvgDRwiOa93aKU.hgrTT0JLw5wxO9QS', 'Trần Bếp Trưởng', '0901234569', 'bep@quanmoc.com', 3, 'hoat_dong'),
(4, 'phucvu', '$2b$10$nAQgVnjtxOufLmtvCPltZOGvgDRwiOa93aKU.hgrTT0JLw5wxO9QS', 'Lê Phục Vụ', '0901234570', 'phucvu@quanmoc.com', 4, 'hoat_dong');

-- Khu vực mẫu
INSERT OR IGNORE INTO khu_vuc (id, ten_khu_vuc, tang, mo_ta, thu_tu_hien_thi) VALUES
(1, 'Tầng 1 - Sảnh Chính', 1, 'Khu vực máy lạnh thoáng mát', 1),
(2, 'Tầng 2 - Phòng VIP', 2, 'Phòng tiệc riêng tư, ấm cúng', 2),
(3, 'Sân Vườn Ngoài Trời', 1, 'Khu vực ngoài trời thoáng đãng', 3);

-- Bàn ăn mẫu
INSERT OR IGNORE INTO ban_an (id, ma_ban, ten_ban, khu_vuc_id, suc_chua, trang_thai, ma_qr_token, url_ma_qr) VALUES
(1, 'B01', 'Bàn 01', 1, 4, 'trong', 'token_ban_01_moc_8821', 'http://localhost:3001/menu?ban=B01&token=token_ban_01_moc_8821'),
(2, 'B02', 'Bàn 02', 1, 4, 'trong', 'token_ban_02_moc_8822', 'http://localhost:3001/menu?ban=B02&token=token_ban_02_moc_8822'),
(3, 'B03', 'Bàn 03', 1, 6, 'trong', 'token_ban_03_moc_8823', 'http://localhost:3001/menu?ban=B03&token=token_ban_03_moc_8823'),
(4, 'VIP01', 'Phòng VIP 1', 2, 10, 'trong', 'token_vip_01_moc_8831', 'http://localhost:3001/menu?ban=VIP01&token=token_vip_01_moc_8831'),
(5, 'SV01', 'Sân Vườn 1', 3, 4, 'trong', 'token_sv_01_moc_8841', 'http://localhost:3001/menu?ban=SV01&token=token_sv_01_moc_8841');

-- Danh mục thực đơn
INSERT OR IGNORE INTO danh_muc_mon (id, ten_danh_muc, mo_ta, thu_tu_hien_thi, trang_thai) VALUES
(1, 'Món Khai Vị', 'Các món nhẹ kích thích vị giác', 1, 'hien_thi'),
(2, 'Món Đặc Sắc', 'Đặc sản trứ danh của Quán Mộc', 2, 'hien_thi'),
(3, 'Lẩu & Nướng', 'Thịt bò, hải sản và lẩu tươi ngon', 3, 'hien_thi'),
(4, 'Đồ Uống & Tráng Miệng', 'Nước ép, trà và chè thanh mát', 4, 'hien_thi');

-- Món ăn mẫu
INSERT OR IGNORE INTO mon_an (id, danh_muc_id, ma_mon, ten_mon, mo_ta, gia_ban, don_vi_tinh, hinh_anh, trang_thai, la_mon_noi_bat) VALUES
(1, 1, 'KV01', 'Nem Nướng Truyền Thống', 'Nem nướng cuốn bánh tráng kèm rau rừng và nước chấm bí truyền', 65000, 'Đĩa', '/tepTaiLen/nem_nuong.jpg', 'dang_ban', 1),
(2, 1, 'KV02', 'Khoai Tây Chiên Bơ Tỏi', 'Khoai tây giòn rụm thơm lừng sốt bơ tỏi', 45000, 'Dĩa', '/tepTaiLen/khoai_tay.jpg', 'dang_ban', 0),
(3, 2, 'DS01', 'Bò Tơ Cuốn Rau Rừng', 'Bò tơ mềm ngọt cuốn rau rừng Tây Ninh chấm mắm nêm', 185000, 'Phần', '/tepTaiLen/bo_to_cuon.jpg', 'dang_ban', 1),
(4, 2, 'DS02', 'Gà Ta Nướng Lu Muối Ớt', 'Gà thả vườn da giòn thịt thơm đậm đà muối ớt đỏ', 240000, 'Con', '/tepTaiLen/ga_nuong_lu.jpg', 'dang_ban', 1),
(5, 3, 'LN01', 'Lẩu Riêu Cua Bắp Bò', 'Nước dùng chua thanh đậm vị cua đồng kèm bắp bò tươi', 280000, 'Nồi', '/tepTaiLen/lau_rieu_cua.jpg', 'dang_ban', 1),
(6, 4, 'DU01', 'Trà Đào Cam Sả', 'Trà đào thanh mát với miếng đào giòn ngọt', 35000, 'Ly', '/tepTaiLen/tra_dao.jpg', 'dang_ban', 0),
(7, 4, 'DU02', 'Nước Ép Dưa Hấu Tươi', 'Nước ép nguyên chất không đường ngọt dịu tự nhiên', 30000, 'Ly', '/tepTaiLen/nuoc_ep_dua_hau.jpg', 'dang_ban', 0);

-- Tùy chọn đi kèm món ăn
INSERT OR IGNORE INTO tuy_chon_mon (id, mon_an_id, loai_tuy_chon, ten_tuy_chon, gia_them, bat_buoc) VALUES
(1, 5, 'topping', 'Thêm Bắp Bò', 60000, 0),
(2, 5, 'topping', 'Thêm Đậu Hũ & Mọc', 30000, 0),
(3, 6, 'kich_co', 'Size L (Lớn)', 10000, 0),
(4, 6, 'topping', 'Thêm Thạch Đào', 8000, 0);

-- Cấu hình nhà hàng
INSERT OR IGNORE INTO cau_hinh_nha_hang (khoa, gia_tri, mo_ta) VALUES
('ten_nha_hang', 'Nhà Hàng Quán Mộc', 'Tên chính thức hiển thị trên hóa đơn và thực đơn'),
('dia_chi', 'Số 123 Đường Ẩm Thực, Quận 1, TP. Hồ Chí Minh', 'Địa chỉ quán'),
('so_dien_thoai', '0901234567', 'Hotline hỗ trợ khách hàng'),
('mat_khau_wifi', 'quanmoc2026', 'Mật khẩu Wifi phục vụ khách'),
('ty_le_thue_vat', '8', 'Thuế giá trị gia tăng mặc định (%)'),
('phi_phuc_vu', '0', 'Phí dịch vụ nếu có (%)'),
('ngan_hang_vietqr', 'MBBank', 'Tên ngân hàng nhận chuyển khoản VietQR'),
('so_tai_khoan_vietqr', '0901234567', 'Số tài khoản ngân hàng VietQR'),
('chu_tai_khoan_vietqr', 'NHA HANG QUAN MOC', 'Chủ tài khoản ngân hàng');
