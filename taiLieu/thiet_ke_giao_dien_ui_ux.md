# HƯỚNG DẪN & ĐỀ XUẤT THIẾT KẾ GIAO DIỆN (UI/UX DESIGN SYSTEM)
## ĐỀ TÀI: HỆ THỐNG QUẢN LÝ NHÀ HÀNG PHỤC VỤ TẠI BÀN (RMS)

---

## 1. NGUYÊN TẮC THIẾT KẾ TỔNG THỂ (CORE DESIGN PRINCIPLES)

Để đồ án đạt tính thẩm mỹ cao, hiện đại và tạo ấn tượng mạnh mẽ với hội đồng chấm thi, giao diện cần tuân thủ 4 nguyên tắc:
1. **Thiết kế theo ngữ cảnh sử dụng (Context-Driven Design):**
   - *Khách hàng & Phục vụ:* Ưu tiên **Mobile-First**, giao diện mượt như App di động thuần (App-like Web).
   - *Bếp / Bar (KDS):* Ưu tiên **Dark Mode tương phản cao**, kích thước chữ lớn để đọc từ khoảng cách 1.5 - 2m.
   - *Thu ngân (POS) & Admin:* Ưu tiên **Desktop widescreen (chia cột khoa học)**, thao tác chuột/phím cực nhanh.
2. **Hệ thống phân cấp thị giác rõ ràng (Visual Hierarchy):** Phân biệt rõ giá tiền, trạng thái bàn và các nút hành động chính (Primary Call-To-Action) bằng độ tương phản màu sắc.
3. **Phản hồi xúc giác & thị giác (Micro-Interactions):** Hiệu ứng hover mềm mại, loading skeleton khi tải dữ liệu, badge rung chuông khi có sự kiện thời gian thực.
4. **Không rối mắt (Clean & Minimalist):** Giảm thiểu viền đậm thừa thãi, sử dụng khoảng trắng (Whitespace), đổ bóng mềm (`soft shadows`) và bo góc hiện đại (`rounded corners`).

---

## 2. HỆ THỐNG MÀU SẮC & TYPOGRAPHY (DESIGN SYSTEM)

### 2.1. Bảng màu Nhận diện Thương hiệu (Color Palette)

| Vai trò màu | Mã màu HEX | Tên màu | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **Primary (Màu chủ đạo)** | `#E11D48` | **Rose/Crimson Red** | Màu F&B kích thích vị giác; dùng cho nút chính, logo, điểm nhấn giá tiền |
| **Secondary (Màu phụ)** | `#F97316` | **Vibrant Orange** | Nhãn "Bán chạy" (Best Seller), nút Gọi món, khuyến mãi |
| **Background (Sáng)** | `#F8FAFC` | **Slate 50** | Nền trang tổng thể cho Khách, Thu ngân, Admin (dịu mắt, không chói) |
| **Surface/Card** | `#FFFFFF` | **Pure White** | Nền các thẻ món, thẻ bàn, modal popup |
| **Text Primary** | `#0F172A` | **Slate 900** | Tiêu đề, tên món, số tiền chính |
| **Text Muted** | `#64748B` | **Slate 500** | Mô tả món, đơn vị tính, thời gian |

### 2.2. Bảng màu Trạng thái Bàn & Bếp (Status Color Coding)

Màu sắc trạng thái được chuẩn hóa đồng bộ trên cả sơ đồ bàn và màn hình KDS:
- 🟢 **Sẵn sàng / Trống / Mới vào:** Emerald Green (`#10B981`)
- 🔵 **Đang phục vụ / Đang dùng bữa:** Sky/Indigo Blue (`#0EA5E9`)
- 🟡 **Chờ món / Chờ duyệt (10-20 phút):** Amber Yellow (`#F59E0B`)
- 🔴 **Yêu cầu thanh toán / Quá 20 phút / Khẩn cấp:** Crimson Red (`#EF4444`)
- ⚫ **Bàn cần dọn dẹp / Đã thanh toán:** Neutral Slate (`#64748B`)

### 2.3. Typography & Font chữ
- **Font chính đề xuất:** **Inter** hoặc **Plus Jakarta Sans** (Google Fonts miễn phí, hiển thị tiếng Việt hoàn hảo, số tiền rõ ràng, không bị lỗi dấu tiếng Việt).
- **Bộ Icon đề xuất:** **Bootstrap Icons** kết hợp **FontAwesome 6** (hoặc Lucide Icons) – icon nét mảnh, hiện đại.

---

## 3. THIẾT KẾ CHI TIẾT TỪNG PHÂN HỆ NGƯỜI DÙNG

### 3.1. Phân hệ 1: Khách hàng (Customer QR Mobile Web)
*Phong cách: Ứng dụng ẩm thực cao cấp (tương tự Starbucks / GrabFood UI).*
- **Header:** Logo quán bo tròn nhỏ, tên bàn nổi bật (`Bàn 08 - Tầng 2`), nút chuông "Gọi phục vụ" màu cam nổi bật góc phải.
- **Thực đơn:** 
  - Thanh cuộn danh mục ngang cố định (Horizontal Pills: *Tất cả, Khai vị, Lẩu nướng, Đồ uống...*).
  - Thẻ món ăn (Dish Card): Ảnh tỉ lệ 4:3 sắc nét bo góc 16px, badge "Best Seller" màu cam góc trái, giá tiền in đậm đỏ `95.000 đ`. Nút dấu cộng `+` tròn màu rose to bản dễ bấm.
- **Floating Cart Bar (Thanh giỏ hàng nổi):** Thanh nổi dán đáy màn hình hiển thị: *3 món - 245.000 đ* cùng nút "Xem giỏ & Gọi món" chuyển sắc màu Gradient nổi bật.
- **Màn hình theo dõi món (Live Tracker):** Hiển thị thanh tiến trình 3 bước (Đã gửi -> Bếp đang nấu -> Sẵn sàng phục vụ) kèm icon hoạt họa sống động.

### 3.2. Phân hệ 2: Nhân viên Phục vụ (Waiter Mobile Web)
*Phong cách: Dashboard cảm ứng nhanh gọn (Touch-optimized).*
- **Sơ đồ bàn dạng lưới thông minh (Floor Grid):**
  - Mỗi bàn là một thẻ kích thước tối thiểu `80x80px` trên mobile để ngón tay cái bấm chính xác.
  - Thẻ bàn thể hiện: Số bàn to, số lượng khách, số món đang chờ và viền phát sáng nhẹ theo màu trạng thái.
- **Thanh thông báo trượt (Floating Notification Bar):** Khi khách bấm "Gọi phục vụ" hoặc Bếp bấm "Xong món", thanh thông báo màu vàng/xanh trượt từ đỉnh màn hình xuống kèm tiếng chuông ngắn (`ping.mp3`).
- **Nút thao tác nhanh dưới đáy:** *[+] Mở bàn mới*, *Chuyển/Gộp bàn*, *Duyệt đơn QR (Badge đỏ số lượng)*.
- **Quản lý ca làm & Yêu cầu nghỉ/Đổi ca (`W11`):**
  - Tab điều hướng chân trang "Ca của tôi" (biểu tượng đồng hồ) mở nhanh màn hình quản lý ca trực cá nhân.
  - Khối thông tin ca hôm nay (`Ca tối 17:00–22:00 · Tầng 1 · Bàn 01–12`) và danh sách lịch trực 7 ngày tới trong tuần.
  - Form tạo phiếu linh hoạt: Cho phép chuyển đổi giữa *Xin nghỉ ca* và *Đổi ca*. Nếu đổi ca: Chọn ngày, ca trực và chọn đồng nghiệp nhận ca trực thay thế (`Minh`, `Lan`...).
  - Trường lý do bắt buộc và nút gửi yêu cầu nổi bật; hiển thị trạng thái chờ Quản lý duyệt và ghi chú nhắc nhở *"Lịch cũ vẫn có hiệu lực cho đến khi Quản lý phê duyệt"*.

### 3.3. Phân hệ 3: Bếp / Bar (Kitchen Display System - KDS)
*Phong cách: Dark Mode công nghiệp hiện đại (Industrial KDS).*
- **Tông màu chủ đạo:** Nền đen than (`#0F172A`), khung viền xám đậm (`#1E293B`).
- **Thẻ phiếu món ăn (Order Ticket):**
  - Header vé: `BÀN 05` (chữ to cao 28px), số phút chờ (ví dụ: `⏱️ 12m` - đổi màu vàng/đỏ).
  - Thân vé: Danh sách món kèm số lượng to bản (ví dụ: `2x Bò né (Không hành)`).
  - Nút bấm hành động: Nút "BẮT ĐẦU NẤU" (xanh dương) và "HOÀN THÀNH" (xanh lá) to bằng cả lòng bàn tay để đầu bếp chạm dễ dàng bằng ngón tay.
- **Nút Báo hết món nhanh:** Nằm ở góc phải trên cùng màn hình, bấm vào hiện modal chọn nhanh món cần tạm khóa.

### 3.4. Phân hệ 4: Thu ngân (Cashier / POS Desktop)
*Phong cách: Widescreen POS 2 cột chuẩn doanh nghiệp.*
- **Bố cục 70 / 30:**
  - **Cột bên trái (70%):** Sơ đồ toàn bộ các tầng bàn. Bàn nào đang dùng bữa hiển thị thời gian ngồi và số tiền tạm tính hiện tại.
  - **Cột bên phải (30% - Sidebar hóa đơn):** Khi click vào Bàn 03, cột này lập tức tải danh sách món, số lượng, thành tiền, ô nhập Voucher/Chiết khấu, ô tính tiền thối.
- **Nút Thanh toán khổng lồ:** Màu xanh lá (`btn-success`) chiếm trọn chiều rộng sidebar.
- **Modal VietQR thanh toán:** Popup trung tâm màn hình, mã QR to rõ ràng ở giữa, tự động hiển thị logo ngân hàng thụ hưởng và số tiền cực to để khách đứng từ xa cũng quét được.

### 3.5. Phân hệ 5: Quản trị viên (Admin Dashboard)
*Phong cách: Clean SaaS Dashboard (tương tự phong cách Tailwind UI / Stripe).*
- **Sidebar cố định bên trái:** Màu xám đậm (`#1E293B`) với các icon trắng tinh tế: *Tổng quan, Sơ đồ bàn, Thực đơn, Nhân sự, Ca kíp, Báo cáo, Nhật ký Audit Logs*.
- **Thẻ chỉ số nhanh (Metric Cards):** 4 thẻ đầu trang (Doanh thu hôm nay, Lượt khách, Bàn đang mở, Đánh giá trung bình) với biểu tượng tròn có nền pastel nhẹ.
- **Biểu đồ Chart.js thẩm mỹ:** Biểu đồ đường cong uốn lượn có dải màu Gradient chuyển sắc dưới chân đường vẽ thể hiện xu hướng doanh thu trong 30 ngày.

---

## 4. BỘ CÔNG CỤ & THƯ VIỆN ĐỀ XUẤT CHO FRONTEND

Để hiện thực hóa giao diện đẹp mắt mà không làm nặng mã nguồn, dự án nên tích hợp:
1. **CSS Framework:** **Bootstrap 5.3** (Dựng layout lưới Flex/Grid, Modal, Form chuẩn xác) kết hợp file `custom.css` để tinh chỉnh bo góc, màu sắc Rose/Amber hiện đại.
2. **Icons:** **Bootstrap Icons** (hơn 1.800 icon bản quyền mở, nhúng dạng SVG/Font cực nhẹ).
3. **Thông báo đẹp:** **SweetAlert2** (Thay thế các hộp thoại `alert()` mặc định xấu xí của trình duyệt bằng popup thông báo bo góc bóng bẩy, có icon hoạt họa).
4. **Biểu đồ:** **Chart.js** (Thư viện vẽ biểu đồ doanh thu mượt mà, hỗ trợ tooltip tương tác).
5. **Âm thanh thông báo:** Sử dụng Web Audio API hoặc thẻ `<audio>` phát file chuông nhẹ nhàng (`bell.mp3`) khi có order mới hoặc chuông gọi phục vụ.

---

## 5. MẪU THIẾT KẾ THỊ GIÁC (MOCKUP DEMO)

```
+-------------------------------------------------------------------------------+
|  QUẢN LÝ NHÀ HÀNG - POS THU NGÂN                                              |
+------------------------------------------------------+------------------------+
|  [Tầng 1]  [Tầng 2]  [Sân vườn]       [Lọc: Tất cả]  | CHI TIẾT BÀN 05        |
+------------------------------------------------------+------------------------+
|  +--------------+  +--------------+  +--------------+| 1. Bò bít tết     x2   |
|  |   BÀN 01     |  |   BÀN 02     |  |   BÀN 03     ||    - Sốt tiêu đen      |
|  | [ Trống ]    |  | [ Có khách ] |  | [ Chờ món ]  || 2. Nước ngọt      x2   |
|  |              |  | ⏱️ 45m        |  | ⏱️ 12m        || 3. Khoai tây      x1   |
|  |              |  | 420.000 đ    |  | 150.000 đ    |+------------------------+
|  +--------------+  +--------------+  +--------------+| Tạm tính:    380.000 đ |
|  +--------------+  +--------------+  +--------------+| Giảm giá:          0 đ |
|  |   BÀN 04     |  |   BÀN 05     |  |   BÀN 06     || VAT (8%):     30.400 đ |
|  | [ Trống ]    |  | [ Tính tiền ]|  | [ Cần dọn ]  || TỔNG CỘNG:   410.400 đ |
|  |              |  | ⏱️ 60m        |  |              |+------------------------+
|  |              |  | 410.400 đ    |  |              || [ IN TẠM TÍNH (K80) ]  |
|  +--------------+  +--------------+  +--------------+| [ THANH TOÁN VIETQR ]  |
|                                                      | [ TIỀN MẶT ]           |
+------------------------------------------------------+------------------------+
```
