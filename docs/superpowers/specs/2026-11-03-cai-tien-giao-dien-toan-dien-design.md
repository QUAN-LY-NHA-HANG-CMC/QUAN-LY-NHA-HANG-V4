# TÀI LIỆU THIẾT KẾ: CẢI TIẾN TOÀN DIỆN GIAO DIỆN NGƯỜI DÙNG & TRẢI NGHIỆM F&B (MODERN POS & E-MENU)
**Dự án:** Quán Mộc POS - Hệ thống Quản lý Nhà hàng & Gọi món QR  
**Ngày:** 2026-11-03  
**Tác giả:** Antigravity & Nhật (PM / Backend Core)  
**Trạng thái:** Đã qua rà soát kỹ thuật (Technical Review Passed - Ready for Plan)

---

## 1. Mục Đích & Bối Cảnh (Intent & The Why)
Sau khi hoàn tất 4 Sprint và 140 User Story với 51/51 automated tests passing, hệ thống Quán Mộc POS đã có đầy đủ nền tảng nghiệp vụ vững chắc từ CSDL, API Backend đến giao diện Frontend cơ bản.
Để phục vụ người dùng thực tế (nhân viên thu ngân, nhân viên chạy bàn, đầu bếp và khách hàng dùng bữa), giao diện cần được tối ưu trải nghiệm (UI/UX) đạt tiêu chuẩn của các ứng dụng F&B hiện đại (như iPOS, CukCuk, GrabFood, ShopeeFood):
- Nhân viên thao tác nhanh, chạm cảm ứng chính xác, phản hồi tức thì.
- Đầu bếp trong môi trường bếp ồn ào nhận được thông báo trực quan và âm thanh rõ ràng mà không bị ô nhiễm tiếng ồn.
- Khách hàng gọi món trên điện thoại có trải nghiệm mượt mà, trực quan, thấy ảnh món ăn hấp dẫn và kiểm soát giỏ hàng thuận tiện kể cả khi mạng LAN nội bộ.

---

## 2. Mục Tiêu, Phi Mục Tiêu & Chống Mục Tiêu (Goals, Non-Goals, Anti-Goals)

### Mục Tiêu (Goals)
1. **Trải nghiệm Gọi Món Tuyệt Đẹp (E-Menu & POS):**
   - E-Menu khách hàng (`thucDonQr.js`, `gioHang.js`): Thẻ món ăn sang trọng phong cách nhà hàng ẩm thực ấm cúng, ảnh món to rõ sắc nét, tag "Món bán chạy / Đặc sản Quán Mộc", nút tăng giảm số lượng mượt mà, thanh giỏ hàng nổi chân trang (Floating Cart Bar) kèm badge số lượng và giá tiền.
   - POS Nhân viên gọi món tại bàn: Thao tác chọn món nhanh 1 chạm, tìm kiếm món tức thì.
2. **Trải nghiệm Chờ Thanh Toán Sang Trọng & Tiện Lợi:**
   - Màn hình khách tại bàn (`theoDoiDonMon.js`): Bảng kê chi tiết các món đã gọi rõ ràng, trạng thái món sinh động (Đã nhận đơn -> Bếp đang nấu -> Đã lên bàn), nút "Yêu cầu thanh toán" hiển thị thông báo trạng thái "Đang chờ thu ngân" và hiện ngay mã Napas VietQR động để khách có thể quét thanh toán tại bàn siêu tiện lợi.
   - Màn hình Thu ngân POS (`thanhToan.js`): Giao diện K80 hiện đại, bảng tính tiền minh bạch (tạm tính, VAT, giảm giá), bàn phím số cảm ứng, nút chạm nhanh tiền mặt (50k, 100k, 200k, 500k) và tính tiền thừa to rõ.
3. **Responsive & Mobile Drawer cho Quản trị/Nhân viên:** Hỗ trợ menu trượt ngang (drawer / hamburger) khi thao tác trên thiết bị bảng hoặc điện thoại thông minh, không bị vỡ layout 260px như hiện tại.
4. **Sơ đồ bàn & POS thông minh:** Thêm bộ lọc trạng thái bàn (`Tất cả`, `🟢 Trống`, `🟡 Đang phục vụ`, `🔴 Chờ thanh toán`), tìm kiếm bàn theo tên/số, hiển thị thời gian khách ngồi.
5. **Màn hình Bếp (KDS) chuyên nghiệp:** Chế độ Toàn màn hình (Fullscreen) cho màn hình treo tường, phát âm thanh chuông báo (Web Audio API) khi có món mới (`don_mon_moi`), kèm nút bật/tắt chuông trên header để tuân thủ chính sách Autoplay của trình duyệt.
6. **Báo cáo Thống kê:** Bổ sung bộ chọn khoảng ngày tùy chỉnh (`tuNgay` - `denNgay`) trên Dashboard.
7. **Bảo toàn 100% kiểm thử:** Toàn bộ 51 automated tests hiện có phải tiếp tục PASS mà không bị xung đột dữ liệu.

### Phi Mục Tiêu (Non-Goals)
- Thay đổi cấu trúc cơ sở dữ liệu cốt lõi (bảng, khóa ngoại, quan hệ nghiệp vụ đã hoàn thiện ở Sprint 1-4).
- Cài thêm framework nặng (như React/Vue/Angular) - tiếp tục trung thành với Vanilla JS ES6 Modules nhẹ, tốc độ tải tức thì (<100ms), không cần bước build phức tạp.

### Chống Mục Tiêu (Anti-Goals)
- Không làm gián đoạn luồng WebSocket real-time giữa Bàn - Bếp - Thu ngân.
- Không để phát sinh lỗi JavaScript làm trắng màn hình (mọi màn hình đều có Error Boundary và null-safe DOM binding).
- Không gây ô nhiễm tiếng ồn cho nhà bếp: Chuông chỉ phát khi có đơn món mới chuyển vào bếp, không kêu khi đổi trạng thái nội bộ.

---

## 3. Các Phương Án Đã Cân Nhắc (Approaches)

### Phương án 1: Toàn diện Modern F&B POS & E-Menu (Được chọn)
- **Mô tả:** Nâng cấp đồng bộ cả 2 luồng: Khách hàng (E-Menu mobile-first) và Nội bộ quán (Mobile Drawer, Sơ đồ bàn, POS thu ngân, KDS bếp), phân công cho cả 5 thành viên trong nhóm.
- **Ưu điểm:** Hệ thống đạt độ hoàn thiện cao nhất, sẵn sàng demo trực quan hoặc đưa vào vận hành thực tế tại quán ăn; cả 5 thành viên đều có đóng góp rõ ràng.
- **Nhược điểm:** Khối lượng công việc cần phối hợp chặt chẽ giữa 5 vai trò.

### Phương án 2: Chỉ nâng cấp giao diện Khách hàng E-Menu
- **Mô tả:** Chỉ làm đẹp các trang `thucDonQr.js`, `gioHang.js`, `theoDoiDonMon.js`, giữ nguyên giao diện nội bộ.
- **Ưu điểm:** Khối lượng việc ít hơn.
- **Nhược điểm:** Phía nhân viên và quản lý vẫn bị vỡ giao diện trên tablet/phone, chưa đáp ứng yêu cầu nâng cấp toàn diện của dự án.

=> **Lựa chọn:** Phương án 1 đã được chọn theo yêu cầu của Nhật (User).

---

## 4. Các Quyết Định Kỹ Thuật Sau Rà Soát (Decisions from Builder Review)

1. **Chuông âm thanh KDS & Autoplay:**
   - *Quyết định:* Chuông Web Audio API (tần số 880Hz -> 1320Hz mô phỏng chuông gõ nhà bếp) **chỉ kích hoạt khi có sự kiện `don_mon_moi`**.
   - *Giao diện:* Thêm nút bật/tắt chuông `🔔 Bật chuông / 🔕 Tắt chuông` ngay cạnh nút `⛶ Toàn màn hình` trên thanh công cụ KDS. Khi đầu bếp chạm vào nút này, AudioContext được unlock theo đúng chính sách của trình duyệt.

2. **Lọc doanh thu theo khoảng ngày:**
   - *Quyết định:* Nâng cấp đồng bộ cả Backend và Frontend:
     - Minh bổ sung xử lý query params `tuNgay` & `denNgay` trên `/api/thong-ke/doanh-thu`.
     - Phong tích hợp thanh chọn ngày gồm 2 ô `<input type="date">` và nút `Áp dụng` ngay cạnh 3 nút chu kỳ mặc định (Ngày/Tuần/Tháng).

3. **Chiến lược Seed Data & Bảo toàn 51 Automated Tests:**
   - *Quyết định:* Để bảo toàn 100% cho 51 test suites vốn thao tác trên Bàn 1-5 (B01-SV01), Phát sẽ bổ sung các bàn demo mới:
     - Bàn 6 (B04 - Khu Trong nhà): Đang dùng bữa, có món đang nấu.
     - Bàn 7 (B05 - Khu Trong nhà): Đang chờ thanh toán (đã gọi tính tiền).
     - Bàn 8 (VIP02 - Phòng VIP): Đang phục vụ tiệc.
     Các bàn 1-5 giữ nguyên trạng thái trống sạch sẽ để các automated tests chạy độc lập tuyệt đối.

4. **Lưu trữ ảnh món ăn cục bộ (Offline / LAN Resilience):**
   - *Quyết định:* Dùng giải pháp ảnh vector SVG nội bộ độ phân giải cao kết hợp nén nhẹ lưu tại `/tepTaiLen/monAn/` và thư viện ảnh có sẵn trong dự án. Có cơ chế fallback icon nếu đường dẫn ảnh bị lỗi, bảo đảm không bao giờ vỡ giao diện kể cả khi không có mạng Internet.

---

## 5. Phân Công Chi Tiết Cho 5 Thành Viên

### 1. Nhật (`longnhatdinhviet8-byte`) - PM & UI Core Architect
- Thiết kế hệ thống CSS tổng thể (`frontend/tepGiaoDien.css`): Biến màu sắc thương hiệu Quán Mộc (nâu gỗ ấm `#854d0e`, vàng rơm, xanh lá tươi mát), bóng đổ hiện đại, card bo tròn, nút bấm có hiệu ứng nhấn.
- Xây dựng Mobile Drawer (Hamburger button trên header + Drawer trượt + Backdrop làm mờ) trong `frontend/index.html` và `frontend/ungDung.js`.
- Bổ sung thanh trạng thái kết nối mạng / socket trên header (Online/Offline indicator).
- Đảm bảo kiểm thử và tích hợp toàn hệ thống (51/51 tests pass).

### 2. Minh (`nguyensyminhmedia`) - Backend Services & API Support
- Nâng cấp API Sơ đồ bàn (`/api/ban-an/so-do-chi-tiet`): Bổ sung trường `thoiGianNgoiPhut` (tính từ thời điểm mở phiên) và hỗ trợ query param `?trangThai=trong|dang_phuc_vu|cho_thanh_toan`.
- Bổ sung API gợi ý mẫu phản hồi đánh giá nhanh (`/api/danh-gia/mau-phan-hoi`): Các mẫu câu cảm ơn, xin lỗi lịch thiệp để quản lý chọn 1-chạm.
- Hỗ trợ lọc thống kê theo khoảng ngày tùy chỉnh `tuNgay` & `denNgay` trên `/api/thong-ke/doanh-thu`.

### 3. Phát (`ledangphat`) - Database Specialist & Seed Data
- Cập nhật dữ liệu mẫu món ăn với ảnh minh họa chất lượng cao (ảnh món Việt Nam phong phú: Phở bò tái lăn, Bún chả Hà Nội, Nem rán giòn, Bánh xèo miền Tây, Gỏi cuốn tôm thịt, Cà phê trứng, Trà đào cam sả,...).
- Tạo dữ liệu phiên bàn demo đa dạng trạng thái (Bàn 6 đang ăn, Bàn 7 chờ thanh toán, Bàn 8 VIP) độc lập để sơ đồ bàn hiển thị sinh động ngay lập tức mà không ảnh hưởng tới 51 automated tests.
- Tối ưu hóa truy vấn thời gian ngồi của bàn.

### 4. Phong (`phong31-lag`) - Frontend Developer (POS, Sơ đồ bàn, Bếp KDS)
- **Sơ đồ bàn (`quanLyBanQr.js`):**
  - Thanh bộ lọc trạng thái dạng pill: `Tất cả`, `🟢 Bàn trống`, `🟡 Đang phục vụ`, `🔴 Chờ thanh toán`.
  - Ô tìm kiếm bàn tức thì theo tên/số bàn.
  - Hiển thị badge số phút khách đã ngồi trên thẻ bàn.
- **Điều phối Bếp (`dieuPhoiBep.js`):**
  - Nút chuyển Toàn màn hình (Fullscreen toggle).
  - Chuông âm thanh Web Audio (tiếng chuông khi có món mới `don_mon_moi`) kèm nút toggle bật/tắt chuông.
- **POS Thu ngân (`thanhToan.js`):**
  - Bàn phím số chạm nhanh và các nút tiền chẵn (50k, 100k, 200k, 500k).
  - Tự động tính tiền thối trả khách hiển thị to rõ.
- **Dashboard Thống kê (`thongKe.js`):**
  - Tích hợp 2 ô chọn ngày `tuNgay` và `denNgay` kèm nút Áp dụng.

### 5. Quân (`nguyenchiquan417-ui`) - Frontend Developer (E-Menu & Đánh giá Khách hàng)
- **E-Menu QR (`thucDonQr.js`):**
  - Thẻ món ăn hiện đại: Ảnh thumbnail bo tròn, tên món, giá tiền to rõ, mô tả ngắn, nút `+` thêm món với micro-animation.
  - Thanh giỏ hàng nổi chân trang (Floating Sticky Cart Bar) với hiệu ứng trượt mượt mà.
  - Sticky Category Tabs cố định ở đầu màn hình khi cuộn trang.
- **Giỏ hàng (`gioHang.js`) & Theo dõi đơn (`theoDoiDonMon.js`):**
  - Nút tăng giảm số lượng to bản, dễ chạm trên điện thoại.
  - Ô nhập ghi chú riêng cho từng món ăn.
  - Timeline tiến độ món ăn trực quan (Gửi bếp ➔ Đang nấu ➔ Sẵn sàng phục vụ).
- **Đánh giá khách hàng (`danhGia.js`):**
  - Giao diện sao vàng rực rỡ, bộ lọc xem đánh giá 1-5 sao, chọn mẫu phản hồi nhanh.

---

## 6. Tiêu Chí Hoàn Thành (Definition of Done)
1. Giao diện người dùng trên cả Mobile và Desktop đều hiển thị chuẩn chỉnh, không bị tràn viền hay vỡ khung.
2. Menu Hamburger trên Mobile hoạt động đóng mở mượt mà kèm backdrop.
3. Bộ lọc bàn, thanh toán POS, chuông KDS, và giỏ hàng nổi E-Menu hoạt động trơn tru 100%.
4. Toàn bộ 51 automated tests chạy bằng `node --test` đều PASS 100%.
5. Mã nguồn được commit và push lên nhánh GitHub rõ ràng.
