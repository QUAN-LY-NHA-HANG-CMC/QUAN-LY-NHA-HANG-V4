# BÁO CÁO NGHIỆM THU SPRINT 2
**Dự án:** Hệ thống Quản lý Nhà hàng & Gọi món QR (Quán Mộc)
**Sprint:** Sprint 2 - Trải nghiệm khách hàng (E-Menu QR), Giỏ hàng và Đặt món thời gian thực (Real-time)
**Trạng thái:** HOÀN THÀNH (22/22 Test Cases passed, 100% đạt chuẩn)

---

## 1. Mục tiêu Sprint 2
- Xây dựng hệ thống cơ sở dữ liệu cho Phiên bàn (`phien_ban`), Đơn đặt món (`don_goi_mon`), Chi tiết món (`chi_tiet_don_mon`), Yêu cầu hỗ trợ (`yeu_cau_ho_tro`) và Giỏ hàng tạm (`gio_hang_tam`).
- Thiết lập hạ tầng truyền thông hai chiều WebSockets (Socket.io) với hệ thống Room phân quyền (`ban_{banId}`, `bep`, `thu_ngan`).
- Triển khai toàn diện nghiệp vụ quét mã QR định danh bàn, tự động tạo hoặc tiếp tục phiên phục vụ.
- Đặt món trực tiếp tại bàn bằng Database Transaction nguyên tử, tính toán và tích lũy doanh thu tạm tính chuẩn xác.
- Bảo vệ chống gian lận giá bằng cơ chế tính giá Server-side, hỗ trợ tùy chọn Size/Topping/Ghi chú món.
- Hỗ trợ hủy món an toàn (chỉ khi món chưa vào trạng thái chế biến) và tự động hoàn tiền tạm tính.
- Giao diện E-Menu Mobile-First, tìm kiếm món, lọc danh mục dạng thanh trượt ngang, giỏ hàng thông minh và trang theo dõi trạng thái đơn hàng real-time.
- Chức năng gọi nhân viên và yêu cầu thanh toán hóa đơn tại bàn.
- Hoàn thành đầy đủ 34 User Story (US-045 đến US-078).

---

## 2. Kết quả thực hiện chi tiết theo User Story

### Nhóm 1: E-Menu QR và Quản lý Phiên bàn (US-045 -> US-056)
- **US-045 & US-046:** Quét mã QR tại bàn tự động giải mã token và nhận diện số bàn chính xác (`#/menu?ban=...&token=...`).
- **US-047:** API `POST /api/phien-ban/xac-thuc-qr` tự động kích hoạt phiên phục vụ mới (`phien_ban`) hoặc tái sử dụng phiên đang mở của bàn.
- **US-048:** Bàn tự động chuyển trạng thái sang `dang_dung` ngay khi phiên mở.
- **US-049:** Giao diện E-Menu tải động danh mục và món ăn, hỗ trợ hiển thị hình ảnh, giá bán, nhãn "Bán chạy".
- **US-050 & US-051:** Thanh danh mục trượt ngang và ô tìm kiếm món ăn tức thì theo tên/mô tả.
- **US-052 -> US-054:** Modal chi tiết món ăn hỗ trợ tùy chọn số lượng, size, topping và ghi chú khẩu vị riêng (không hành, ít cay...).
- **US-055 & US-056:** Món hết hàng (`het_mon`) tự động hiển thị nhãn và khóa nút đặt hàng để bảo vệ trải nghiệm khách.

### Nhóm 2: Giỏ hàng và Kiểm tra giá Server-side (US-057 -> US-065)
- **US-057 & US-058:** Giỏ hàng LocalStorage linh hoạt, tự động cập nhật số lượng và tổng tiền tạm tính.
- **US-059:** API `POST /api/gio-hang/kiem-tra-gia` xác thực giá toàn bộ món ăn và topping từ CSDL, triệt tiêu nguy cơ sửa giá từ phía client.
- **US-060 & US-061:** Cho phép tăng/giảm số lượng, xóa từng món hoặc xóa toàn bộ giỏ hàng với thông báo xác nhận.
- **US-062:** Đồng bộ giỏ hàng tạm thời lên server qua API `PUT /api/gio-hang/tam-thoi/:phienBanId` giúp khách không bị mất giỏ khi tải lại trang.
- **US-063:** Nhập ghi chú chung cho toàn bộ đợt gọi món.
- **US-064 & US-065:** Thanh giỏ hàng nổi cố định phía dưới màn hình với huy hiệu số lượng món và nút truy cập giỏ hàng 1 chạm.

### Nhóm 3: Đặt món Transaction & Đồng bộ Real-time (US-066 -> US-074)
- **US-066 & US-067:** API `POST /api/don-goi-mon` sử dụng Transaction (`chayGiaoDich`) tạo đơn và lưu từng chi tiết món ăn nguyên tử.
- **US-068:** Tự động tăng số lần gọi món (`lan_goi = 1, 2, 3...`) cho mỗi đợt đặt thêm món của bàn.
- **US-069:** Tích lũy tự động tổng tiền đơn vào `phien_ban.tong_tien_tam_tinh`.
- **US-070:** Phát tín hiệu WebSockets `don_mon_moi` tới phòng `bep` và phòng `ban_{banId}` ngay khi tạo đơn thành công.
- **US-071 & US-072:** API `PUT /api/don-goi-mon/huy-mon/:chiTietId` cho phép khách hủy món khi ở trạng thái `cho_xac_nhan`, tự động khấu trừ tiền khỏi đơn và phiên bàn.
- **US-073:** Khóa chức năng hủy món và phản hồi từ chối nếu món đã được bếp chuyển sang `dang_che_bien` hoặc `hoan_thanh`.
- **US-074:** Ghi vết đầy đủ lịch sử trạng thái món ăn vào bảng `lich_su_don_mon`.

### Nhóm 4: Theo dõi đơn và Yêu cầu hỗ trợ tại bàn (US-075 -> US-078)
- **US-075:** Giao diện "Món đã gọi" (`#/theo-doi-don`) hiển thị toàn bộ các đợt đặt món và tiến độ chế biến từng món ăn.
- **US-076:** Kết nối Socket.io Client tự động cập nhật trạng thái món ăn thời gian thực mà không cần tải lại trang.
- **US-077:** Nút "Gọi phục vụ" gửi yêu cầu hỗ trợ (thêm đá, khăn lạnh, đổi chén đĩa) tới quầy nhân viên.
- **US-078:** Nút "Yêu cầu thanh toán" chuyển trạng thái bàn sang `cho_thanh_toan` và bắn thông báo tới POS thu ngân.

---

## 3. Thống kê Kiểm thử Tự động (Automated Test Suite)
- **Tổng số ca kiểm thử:** 22/22 ca kiểm thử PASS (100%).
- **Thời gian chạy test:** ~7 giây.
- **Phân loại kiểm thử:**
  - `kiemThu/api/coSoDuLieuSprint2.test.js`: Schema CSDL Sprint 2, Foreign Keys, Transaction nguyên tử (2/2 pass).
  - `kiemThu/api/socketRealtime.test.js`: Socket.io Server, phân chia Room, phát/nhận sự kiện theo quyền (2/2 pass).
  - `kiemThu/api/datMonRealtime.test.js`: Xác thực QR, tạo đơn hàng qua Transaction, hủy món, tính tiền lũy kế (2/2 pass).
  - `kiemThu/api/emenuHoTro.test.js`: Kiểm tra giá Server-side, giỏ hàng tạm, gọi nhân viên, yêu cầu thanh toán (3/3 pass).
  - `kiemThu/api/frontend.test.js`: Kiểm tra tính toàn vẹn và cú pháp các module giao diện (1/1 pass).
  - Toàn bộ test suite Sprint 1 (Auth, RBAC, Bàn ăn QR, Thực đơn, Cấu hình): Tiếp tục hoạt động ổn định (12/12 pass).

---

## 4. Đánh giá chất lượng và Cam kết quy chuẩn
1. **Quy chuẩn mã nguồn:**
   - Đặt tên tiếng Việt không dấu, camelCase cho biến/hàm, snake_case cho cột CSDL, kebab-case cho API endpoints.
   - Định dạng phản hồi chuẩn `{ ok: true, data: ..., msg: ... }`.
2. **Bảo mật và toàn vẹn dữ liệu:**
   - 100% Prepared Statements chống SQL Injection.
   - Giao dịch ACID trong xử lý đơn hàng và tính tiền lũy kế.
   - Ngăn chặn triệt để hành vi thao túng giá từ Client.
3. **Hiệu năng:**
   - SQLite WAL mode kết hợp `PRAGMA busy_timeout = 5000` xử lý đồng thời mượt mà.
   - WebSockets Room giúp giảm thiểu tải mạng, chỉ gửi thông điệp đúng nơi nhận.
