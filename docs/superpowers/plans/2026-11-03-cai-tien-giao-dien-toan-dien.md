# Kế Hoạch Triển Khai: Cải Tiến Toàn Diện Giao Diện Người Dùng & Trải Nghiệm Gọi Món / Chờ Thanh Toán (Modern POS & E-Menu)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp toàn diện giao diện người dùng Quán Mộc POS cho cả 5 thành viên: tối ưu trải nghiệm gọi món tuyệt đẹp trên E-Menu điện thoại, giao diện chờ thanh toán minh bạch kèm VietQR tại bàn, bộ lọc sơ đồ bàn thông minh, chuông báo KDS Web Audio và menu trượt Responsive Drawer.

**Architecture:** Giữ nguyên kiến trúc Vanilla JS ES6 Modules siêu nhẹ (<100ms load time) và SQLite WAL. Thiết kế hệ thống Design Tokens CSS (`tepGiaoDien.css`), bổ sung Drawer hamburger trên header, lưu trữ ảnh ẩm thực cục bộ `/tepTaiLen/monAn/` (offline-first), tích hợp Web Audio API (chuông bếp) và mã Napas VietQR động ngay trên màn hình khách tại bàn.

**Tech Stack:** Node.js (v24 native fetch & sqlite), Express.js, Socket.io, Vanilla JS ES6 Modules, CSS3 (Flexbox/Grid/CSS Variables), Web Audio API, Canvas SVG Charts.

**Spec:** [`docs/superpowers/specs/2026-11-03-cai-tien-giao-dien-toan-dien-design.md`](file:///e:/QUAN%20LY%20NHA%20HANG%20V4/docs/superpowers/specs/2026-11-03-cai-tien-giao-dien-toan-dien-design.md)

## Global Constraints
- Bắt buộc bảo toàn 100% cho 51 automated tests (`node --test --test-concurrency=1 kiemThu/api/*.test.js`).
- Tuyệt đối không để phát sinh lỗi JavaScript làm trắng màn hình: Router và mọi module DOM binding đều phải null-safe.
- Không sử dụng file âm thanh mp3/wav ngoài cho KDS: dùng Web Audio API để độc lập tài nguyên.
- Ảnh món ăn lưu cục bộ tại `/tepTaiLen/monAn/` với cơ chế fallback icon nếu thiếu file.
- Chuông KDS chỉ reo khi có đơn món mới (`don_mon_moi`), không gây ô nhiễm tiếng ồn khi cập nhật trạng thái nấu.

## Review Focus
1. **Thiếu hình ảnh hoặc đường dẫn ảnh hỏng:** Thẻ món ăn E-Menu tự động fallback về icon món ăn mặc định, không bao giờ hiện biểu tượng ảnh vỡ.
2. **Khách tại bàn bấm Yêu cầu thanh toán:** Giao diện `theoDoiDonMon.js` lập tức đổi trạng thái sang "Chờ thanh toán" và hiển thị mã Napas VietQR để khách quét trả tiền tại chỗ.
3. **Màn hình bếp KDS khi chưa tương tác:** Trình duyệt chặn autoplay âm thanh -> có nút toggle chuông để người dùng kích hoạt AudioContext hợp lệ.
4. **Co giãn màn hình (Mobile Drawer):** Khi thu nhỏ < 768px, sidebar tự động ẩn, bấm nút Hamburger trên header mở drawer trượt mượt mà kèm backdrop làm mờ.
5. **Dữ liệu demo không làm hỏng test:** Các bàn B01-SV01 (id 1-5) được giữ nguyên trạng thái cho test suite; các bàn demo (id >= 6) chứa phiên đang ăn và chờ thanh toán.

---

### Task 1: Nhật (PM & UI Core Architect) - Mobile Drawer, Responsive Design Tokens, Topbar & Real-time Indicator

**Files:**
- Modify: `frontend/tepGiaoDien.css`
- Modify: `frontend/index.html`
- Modify: `frontend/ungDung.js`

**Interfaces:**
- Produces: CSS Design Tokens (`--mau-chinh: #854d0e`, `--mau-nen-card`, `--shadow-md`), lớp CSS `.thanh-ben.mo-drawer`, `.lop-phu-drawer`, nút `#nut-mo-menu-mobile` và hàm `dongMoDrawer()`.

- [ ] **Step 1: Viết test kiểm tra tệp tĩnh và cấu trúc CSS / HTML**
  - Viết test kiểm tra `index.html` có chứa nút hamburger `#nut-mo-menu-mobile` và lớp phủ `#lop-phu-drawer`.
- [ ] **Step 2: Nâng cấp CSS Design Tokens và Responsive Drawer trong `frontend/tepGiaoDien.css`**
  - Thêm media query `@media (max-width: 768px)` cho `.thanh-ben` (dạng drawer trượt từ trái sang: `transform: translateX(-100%)`).
  - Thêm class `.thanh-ben.kich-hoat-drawer` với `transform: translateX(0)` và `.lop-phu-drawer`.
  - Cải tiến nút bấm, card bo góc 12px, shadow mềm mịn, scrollbar thanh mảnh.
- [ ] **Step 3: Cập nhật `frontend/index.html`**
  - Thêm nút Hamburger `☰` trên `#dau-trang`.
  - Thêm `<div id="lop-phu-drawer" class="lop-phu-drawer"></div>`.
  - Thêm chỉ báo mạng `🟢 Đang kết nối` trên header.
- [ ] **Step 4: Gắn sự kiện đóng mở Drawer trong `frontend/ungDung.js`**
  - Bấm `#nut-mo-menu-mobile` -> toggle class `kich-hoat-drawer`.
  - Bấm `#lop-phu-drawer` hoặc bấm vào một link menu -> tự động đóng drawer.
- [ ] **Step 5: Kiểm tra giao diện và chạy test kiểm thử**
  - Chạy `node --test --test-concurrency=1 kiemThu/api/kiemTraHeThong.test.js` xác nhận không có lỗi cú pháp.
- [ ] **Step 6: Commit**
  - `git commit -m "feat(ui): nâng cấp responsive mobile drawer, design tokens và header quán mộc"`

---

### Task 2: Phát (Database Specialist) - Dữ Liệu Ảnh Món Ăn Nội Bộ & Bàn Mẫu Đa Dạng Trạng Thái

**Files:**
- Create/Seed: Thư mục `tepTaiLen/monAn/` (tạo bộ ảnh vector SVG/WebP chất lượng cao cho Phở, Bún chả, Bánh xèo, Gỏi cuốn, Cơm tấm, Trà đào, Cà phê...)
- Modify: `database/migrationSprint1.sql` hoặc script nạp dữ liệu mẫu `database/duLieuMau.sql`
- Modify: `backend/cauHinh/ketNoiCoSoDuLieu.js`

**Interfaces:**
- Produces: Trường `hinh_anh` trong bảng `mon_an` trỏ tới `/tepTaiLen/monAn/<ten_mon>.svg`, các bàn demo B04 (id 6 - Đang phục vụ), B05 (id 7 - Chờ thanh toán), VIP02 (id 8 - Tiệc) có phiên bàn hoạt động mẫu.

- [ ] **Step 1: Viết test kiểm tra tệp hình ảnh và dữ liệu mẫu**
  - Kiểm tra các tệp ảnh món ăn tồn tại trong `tepTaiLen/monAn/` và trường `hinh_anh` không bị null.
- [ ] **Step 2: Tạo bộ hình ảnh món ăn phong cách ẩm thực Việt Nam trong `tepTaiLen/monAn/`**
  - Tạo các file ảnh vector SVG sắc nét, màu sắc bắt mắt cho các món chủ đạo của Quán Mộc: `pho-bo.svg`, `bun-cha.svg`, `banh-xeo.svg`, `goi-cuon.svg`, `com-tam.svg`, `nem-ran.svg`, `tra-dao.svg`, `ca-phe-trung.svg`,...
- [ ] **Step 3: Cập nhật đường dẫn ảnh vào bảng `mon_an` trong CSDL**
  - Update `hinh_anh = '/tepTaiLen/monAn/...'` tương ứng từng món ăn.
- [ ] **Step 4: Bổ sung các bàn demo ID >= 6 với phiên bàn đang phục vụ & chờ thanh toán**
  - Bàn 6 (B04): Có phiên mở cách đây 35 phút, 3 món đang nấu.
  - Bàn 7 (B05): Có phiên mở cách đây 50 phút, yêu cầu thanh toán (`cho_thanh_toan`).
  - Đảm bảo Bàn 1-5 (B01-SV01) hoàn toàn sạch để giữ trọn vẹn 51 automated tests.
- [ ] **Step 5: Kiểm tra kết nối CSDL và chạy toàn bộ test**
  - Chạy `node --test --test-concurrency=1 kiemThu/api/*.test.js` xác nhận 51/51 tests PASS.
- [ ] **Step 6: Commit**
  - `git commit -m "feat(db): bổ sung bộ ảnh món ăn nội bộ và dữ liệu bàn demo sinh động"`

---

### Task 3: Minh (Backend Developer) - API Hỗ Trợ Lọc Trạng Thái Bàn, Gợi Ý Phản Hồi & Lọc Ngày Doanh Thu

**Files:**
- Modify: `backend/modules/banAn/banAn.controller.js`
- Modify: `backend/modules/banAn/banAn.service.js`
- Modify: `backend/modules/danhGia/danhGia.routes.js`
- Modify: `backend/modules/danhGia/danhGia.controller.js`
- Modify: `backend/modules/thongKe/thongKe.service.js`
- Modify: `backend/modules/thongKe/thongKe.controller.js`

**Interfaces:**
- Produces: 
  - `GET /api/ban-an/so-do-chi-tiet?trangThai=trong|dang_phuc_vu|cho_thanh_toan`: Trả về danh sách bàn kèm `so_phut_ngoi` và lọc theo trạng thái nếu có query.
  - `GET /api/danh-gia/mau-phan-hoi`: Trả về danh sách mẫu câu phản hồi nhanh (cảm ơn, xin lỗi, tiếp thu).
  - `GET /api/thong-ke/doanh-thu?tuNgay=YYYY-MM-DD&denNgay=YYYY-MM-DD`: Lọc doanh thu theo khoảng thời gian tùy chọn.

- [ ] **Step 1: Viết test kiểm tra các tham số query mới**
  - Test `/api/ban-an/so-do-chi-tiet?trangThai=trong` chỉ trả về bàn trống.
  - Test `/api/danh-gia/mau-phan-hoi` trả về mảng mẫu câu.
  - Test `/api/thong-ke/doanh-thu` với `tuNgay` & `denNgay`.
- [ ] **Step 2: Triển khai trong `banAn.service.js` và `banAn.controller.js`**
  - Tính `so_phut_ngoi = Math.round((Date.now() - new Date(thoi_gian_bat_dau)) / 60000)`.
  - Hỗ trợ lọc theo `req.query.trangThai` nếu được truyền vào.
- [ ] **Step 3: Triển khai endpoint `/api/danh-gia/mau-phan-hoi`**
  - Trả về danh sách các template phản hồi lịch sự, phân loại theo số sao (5 sao -> cảm ơn chân thành; 1-2 sao -> xin lỗi & hứa cải thiện).
- [ ] **Step 4: Cập nhật `thongKe.service.js` hỗ trợ khoảng ngày tùy ý**
  - Parse `tuNgay` và `denNgay` vào truy vấn SQL hóa đơn.
- [ ] **Step 5: Chạy test xác nhận tất cả endpoint hoạt động chuẩn xác**
  - Chạy `node --test --test-concurrency=1 kiemThu/api/*.test.js`.
- [ ] **Step 6: Commit**
  - `git commit -m "feat(api): hỗ trợ lọc trạng thái bàn, mẫu phản hồi đánh giá và lọc ngày doanh thu"`

---

### Task 4: Phong (Frontend Developer) - Sơ Đồ Bàn Trực Quan, POS Chạm Nhanh Tiền Mặt & KDS Fullscreen/Chuông Web Audio

**Files:**
- Modify: `frontend/trang/quanLyBanQr/quanLyBanQr.js`
- Modify: `frontend/trang/thanhToan/thanhToan.js`
- Modify: `frontend/trang/dieuPhoiBep/dieuPhoiBep.js`
- Modify: `frontend/trang/thongKe/thongKe.js`

**Interfaces:**
- Consumes: API `/api/ban-an/so-do-chi-tiet`, `/api/thong-ke/doanh-thu?tuNgay=&denNgay=`.
- Produces: Thanh tab lọc trạng thái bàn (`Tất cả`, `Trống`, `Đang phục vụ`, `Chờ thanh toán`), ô tìm kiếm bàn, badge số phút khách đã ngồi, bàn phím số POS tiền mặt (50k, 100k, 200k, 500k), chuông Web Audio KDS `phatAmBaoKds()`, nút `Fullscreen`, bộ chọn ngày `thongKe.js`.

- [ ] **Step 1: Nâng cấp Sơ đồ bàn `frontend/trang/quanLyBanQr/quanLyBanQr.js`**
  - Thêm thanh tab lọc trạng thái: `Tất cả`, `🟢 Bàn trống`, `🟡 Đang phục vụ`, `🔴 Chờ thanh toán`.
  - Thêm ô tìm kiếm bàn (lọc ngay khi gõ).
  - Hiển thị badge số phút ngồi (VD: `⏱️ 35 phút`) trên thẻ bàn có khách.
- [ ] **Step 2: Nâng cấp Màn hình Bếp KDS `frontend/trang/dieuPhoiBep/dieuPhoiBep.js`**
  - Xây dựng tiện ích Web Audio phát tiếng chuông ấm `phatAmBaoKds()`.
  - Thêm nút `🔔 Bật/Tắt chuông` và nút `⛶ Toàn màn hình` trên thanh công cụ KDS.
  - Lắng nghe sự kiện `don_mon_moi` từ Socket.io để kích hoạt chuông reo.
- [ ] **Step 3: Nâng cấp POS Thu ngân `frontend/trang/thanhToan/thanhToan.js`**
  - Bổ sung bàn phím số cảm ứng và các nút gợi ý tiền mặt nhanh: `50.000đ`, `100.000đ`, `200.000đ`, `500.000đ`, `Đủ tiền`.
  - Tính toán tiền thừa trả lại khách tức thì và hiển thị màu xanh lá to bản.
- [ ] **Step 4: Nâng cấp Dashboard Thống kê `frontend/trang/thongKe/thongKe.js`**
  - Thêm 2 ô chọn ngày `<input type="date" id="loc-tu-ngay">` và `<input type="date" id="loc-den-ngay">` kèm nút `Lọc`.
- [ ] **Step 5: Kiểm tra giao diện và đảm bảo không có lỗi render**
- [ ] **Step 6: Commit**
  - `git commit -m "feat(pos): nâng cấp sơ đồ bàn thông minh, pos chạm nhanh, kds chuông báo và lọc ngày"`

---

### Task 5: Quân (Frontend Developer) - E-Menu Gọi Món Tuyệt Đẹp, Giỏ Hàng Nổi & Màn Hình Chờ Thanh Toán VietQR Tại Bàn

**Files:**
- Modify: `frontend/trang/thucDonQr/thucDonQr.js`
- Modify: `frontend/trang/gioHang/gioHang.js`
- Modify: `frontend/trang/theoDoiDonMon/theoDoiDonMon.js`
- Modify: `frontend/trang/danhGia/danhGia.js`

**Interfaces:**
- Consumes: Trường `hinh_anh` của món ăn, API `/api/danh-gia/mau-phan-hoi`, API Napas VietQR.
- Produces: Thẻ món ăn có ảnh bo góc, tag đặc sản, nút tăng giảm micro-animation, Floating Cart Bar chân trang có badge, timeline tiến độ món ăn và modal quét VietQR tại bàn khi chờ thanh toán.

- [ ] **Step 1: Nâng cấp E-Menu Gọi Món `frontend/trang/thucDonQr/thucDonQr.js`**
  - Thiết kế thẻ món ăn cao cấp: Ảnh món ăn sắc nét (kèm `onerror` fallback về icon), tên món in đậm, giá tiền nổi bật phong cách ẩm thực, tag "⭐ Bán chạy".
  - Nút thêm món `+` và bộ điều khiển số lượng `- 1 +` hiện đại.
  - Thanh giỏ hàng nổi chân trang (Floating Cart Bar) trượt lên khi có ít nhất 1 món, hiển thị tổng tiền và badge số lượng.
  - Sticky Category Tabs cố định ở đầu trang khi cuộn.
- [ ] **Step 2: Nâng cấp Giỏ hàng `frontend/trang/gioHang/gioHang.js`**
  - Nút tăng giảm số lượng to bản, dễ chạm trên mobile.
  - Ô nhập ghi chú riêng cho từng món ("Ít đá", "Không hành",...).
  - Nút "Xác nhận gửi bếp gọi món" to rõ, hiển thị loading khi bấm.
- [ ] **Step 3: Nâng cấp Màn hình Chờ Thanh Toán & Theo Dõi Đơn `frontend/trang/theoDoiDonMon/theoDoiDonMon.js`**
  - Timeline trạng thái món trực quan: 📝 Đã nhận đơn -> 🍳 Bếp đang nấu -> 🍲 Đã lên bàn.
  - Khi khách bấm "Yêu cầu thanh toán":
    - Trạng thái bàn chuyển sang "🔴 Chờ thanh toán".
    - Hiển thị trực tiếp mã QR chuyển khoản Napas VietQR động (kèm số tiền và nội dung chuyển khoản) ngay trên điện thoại khách để khách có thể quét trả tiền ngay tại chỗ mà không cần chờ phục vụ mang hóa đơn giấy tới!
- [ ] **Step 4: Nâng cấp Trang Quản Trị Đánh Giá `frontend/trang/danhGia/danhGia.js`**
  - Gọi API `/api/danh-gia/mau-phan-hoi` hiển thị danh sách các nút mẫu phản hồi nhanh để quản lý phản hồi khách chỉ với 1 click.
- [ ] **Step 5: Kiểm tra toàn bộ luồng E-Menu trên kích thước mobile (375px - 430px)**
- [ ] **Step 6: Commit**
  - `git commit -m "feat(emenu): hoàn thiện e-menu gọi món tuyệt đẹp, giỏ hàng nổi và thanh toán vietqr tại bàn"`

---

### Task 6: Tích Hợp Toàn Trình, Kiểm Thử Tự Động & Đóng Gói Nhóm

**Files:**
- Test: `kiemThu/api/*.test.js`
- Documentation: `taiLieu/baoCaoSprint/caiTienGiaoDien.md`
- Packaging: `C:\Users\Admin\Desktop\BAN_GIAO_NHOM_UI_UPGRADE\`

- [ ] **Step 1: Chạy toàn bộ 51 automated tests**
  - Lệnh: `node --test --test-concurrency=1 kiemThu/api/*.test.js`
  - Đảm bảo 100% tests PASS (51 pass, 0 fail).
- [ ] **Step 2: Kiểm tra khả năng nạp của toàn bộ Frontend ES6 Modules**
  - Đảm bảo không có lỗi SyntaxError, Circular dependency hay missing export nào.
- [ ] **Step 3: Viết tài liệu báo cáo nghiệm thu cải tiến giao diện**
  - Tạo `taiLieu/baoCaoSprint/caiTienGiaoDien.md`.
- [ ] **Step 4: Đóng gói 4 file ZIP cho Phát, Minh, Phong, Quân**
  - Nén code tương ứng vào thư mục bàn giao trên Desktop.
- [ ] **Step 5: Push toàn bộ lên GitHub**
  - Push lên nhánh `sprint-4-tat-ca-thanh-vien` và tạo commit hoàn chỉnh.
