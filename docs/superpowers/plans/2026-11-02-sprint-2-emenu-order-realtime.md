# Sprint 2: Trải nghiệm khách hàng E-Menu QR, Giỏ hàng và Đặt món thời gian thực Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng hoàn chỉnh trải nghiệm khách hàng quét QR gọi món tại bàn (E-Menu), giỏ hàng và tùy chỉnh khẩu vị, luồng đặt món (Order) có Transaction chống tranh chấp dữ liệu, hệ thống WebSockets thời gian thực (Socket.io) đồng bộ giữa Khách hàng - Bếp - Thu ngân, và theo dõi tiến độ món ăn (US-045 đến US-078).

**Architecture:** Kiến trúc Client-Server Real-time: Node.js (Express + Socket.io Server), cơ sở dữ liệu `node:sqlite` với Database Transaction nguyên tử khi tạo đơn và chi tiết đơn món, Client Mobile-first E-Menu (Web Khách) kết nối Socket.io đồng bộ trạng thái đơn hàng theo Room (`ban_{banId}`, `bep`, `thu_ngan`).

**Tech Stack:** Node.js (v24), Express, Socket.io, node:sqlite, Vanilla/Modern JS Mobile-First E-Menu, Node test runner (`node:test`).

**Spec:** `c:\Users\Admin\Desktop\QUAN-LY-NHA-HANG\taiLieu\PHAN_CHIA _CONG_VIEC.txt`, `c:\Users\Admin\Desktop\QUAN-LY-NHA-HANG\taiLieu\product_backlog _ QUAN_LY_NHA_HANG.txt`, `QUY_TAC_LAM_DU_AN.txt`.

## Global Constraints

- Tuân thủ quy chuẩn đặt tên tiếng Việt không dấu: camelCase cho code, snake_case cho DB, kebab-case cho API (`/api/phien-ban`, `/api/don-goi-mon`, `/api/yeu-cau-ho-tro`).
- Định dạng JSON phản hồi chuẩn: `{ ok: boolean, data: any, msg: string }`.
- Tất cả thao tác ghi nhận Order nhiều món phải nằm trong Transaction để chống lỗi race-condition khi nhiều khách cùng bàn đặt đồng thời.
- Phân tách code chuẩn xác để đóng gói ZIP cho 4 thành viên (Phát, Minh, Phong, Quân) và chỉ commit phần của Nhật (`feature/sprint2-table-session-order-sync`).

## Review Focus

1. Nhiều khách cùng bàn cùng quét QR và gửi đơn món cùng lúc: Transaction phải đảm bảo tính toàn vẹn, không sinh mã đơn trùng hoặc thiếu món.
2. Quét QR sai mã bàn hoặc mã token QR không khớp: API phải từ chối truy cập và hiển thị cảnh báo, không khởi tạo phiên bàn bừa bãi.
3. Hủy món ăn: Chỉ cho phép khách hủy món khi món ăn đang ở trạng thái "Chờ xác nhận" (`cho_xac_nhan`), nếu Bếp đã chuyển sang "Đang chế biến" (`dang_che_bien`) thì từ chối hủy.
4. Món ăn bị Bếp báo "Tạm hết": E-Menu của khách phải tự động bị khóa tức thời qua Socket.io mà không cần F5 tải lại trang.
5. Ngắt kết nối mạng chập chờn: Socket.io client phải có cơ chế tự động kết nối lại (Auto-reconnect) và giữ trạng thái giỏ hàng trong LocalStorage.

---

### Task 1: CSDL Sprint 2 - Phiên bàn, Đơn đặt món, Chi tiết món & Yêu cầu hỗ trợ (Phát - DB)

**Files:**
- Create: `database/migrationSprint2.sql`
- Modify: `backend/cauHinh/ketNoiCoSoDuLieu.js`
- Test: `kiemThu/api/coSoDuLieuSprint2.test.js`

**Interfaces:**
- Consumes: CSDL nền tảng Sprint 1
- Produces: Các bảng `phien_ban`, `gio_hang_tam`, `don_goi_mon`, `chi_tiet_don_mon`, `lich_su_don_mon`, `yeu_cau_ho_tro`, `thong_bao`

- [ ] **Step 1: Viết test cho schema Sprint 2 và kiểm tra Transaction tạo đơn hàng**
- [ ] **Step 2: Chạy test xác nhận thất bại trước khi tạo bảng**
- [ ] **Step 3: Triển khai file SQL `database/migrationSprint2.sql` và cập nhật hàm khởi tạo DB**
- [ ] **Step 4: Chạy test xác nhận passed**

---

### Task 2: Backend Core - Socket.io Server & Phân chia Room Real-time (Nhật - PM/BE)

**Files:**
- Create: `backend/cauHinh/cauHinhSocket.js`
- Modify: `backend/mayChu.js`
- Test: `kiemThu/api/socketRealtime.test.js`

**Interfaces:**
- Consumes: HTTP Server từ Express
- Produces: `io`, hàm `phatSuKienBan(banId, suKien, duLieu)`, `phatSuKienBep(suKien, duLieu)`, `phatSuKienThuNgan(suKien, duLieu)`

- [ ] **Step 1: Viết test cho Socket.io Server kết nối và phát/nhận sự kiện theo Room**
- [ ] **Step 2: Chạy test xác nhận thất bại**
- [ ] **Step 3: Cấu hình Socket.io Server trong `cauHinhSocket.js` và tích hợp vào `mayChu.js`**
- [ ] **Step 4: Chạy test xác nhận passed**

---

### Task 3: Backend - Quản lý Phiên bàn qua QR & Đặt món thời gian thực (Nhật - PM/BE)

**Files:**
- Create: `backend/modules/phienBan/phienBan.model.js`
- Create: `backend/modules/phienBan/phienBan.service.js`
- Create: `backend/modules/phienBan/phienBan.controller.js`
- Create: `backend/modules/phienBan/phienBan.routes.js`
- Create: `backend/modules/donGoiMon/donGoiMon.model.js`
- Create: `backend/modules/donGoiMon/donGoiMon.service.js`
- Create: `backend/modules/donGoiMon/donGoiMon.controller.js`
- Create: `backend/modules/donGoiMon/donGoiMon.routes.js`
- Test: `kiemThu/api/datMonRealtime.test.js`

**Interfaces:**
- Consumes: `ketNoiCoSoDuLieu`, `cauHinhSocket`
- Produces: `/api/phien-ban/xac-thuc-qr`, `/api/phien-ban/hien-tai`, `/api/don-goi-mon/tao-don`, `/api/don-goi-mon/:id/huy-mon`, bắn socket `don_moi` xuống Bếp

- [ ] **Step 1: Viết test cho xác thực QR bàn, tạo đơn đặt món qua Transaction, hủy món và tính tiền lũy kế**
- [ ] **Step 2: Chạy test xác nhận thất bại**
- [ ] **Step 3: Triển khai Model, Service, Controller cho Phiên bàn và Đơn gọi món**
- [ ] **Step 4: Chạy test xác nhận passed**

---

### Task 4: Backend Nghiệp vụ - E-Menu Public, Giỏ hàng & Yêu cầu hỗ trợ tại bàn (Minh - BE)

**Files:**
- Create: `backend/modules/gioHang/gioHang.service.js`
- Create: `backend/modules/gioHang/gioHang.controller.js`
- Create: `backend/modules/gioHang/gioHang.routes.js`
- Create: `backend/modules/yeuCauHoTro/yeuCauHoTro.model.js`
- Create: `backend/modules/yeuCauHoTro/yeuCauHoTro.service.js`
- Create: `backend/modules/yeuCauHoTro/yeuCauHoTro.controller.js`
- Create: `backend/modules/yeuCauHoTro/yeuCauHoTro.routes.js`
- Test: `kiemThu/api/emenuHoTro.test.js`

**Interfaces:**
- Consumes: `thucDonModel`, `phienBanModel`, `cauHinhSocket`
- Produces: `/api/gio-hang/tinh-tam-tinh`, `/api/yeu-cau-ho-tro/goi-nhan-vien`, `/api/yeu-cau-ho-tro/yeu-cau-thanh-toan`

- [ ] **Step 1: Viết test cho kiểm tra giỏ hàng, tính giá server-side và tạo yêu cầu hỗ trợ**
- [ ] **Step 2: Chạy test xác nhận thất bại**
- [ ] **Step 3: Triển khai Service, Controller cho Giỏ hàng và Yêu cầu hỗ trợ tại bàn**
- [ ] **Step 4: Chạy test xác nhận passed**

---

### Task 5: Frontend Mobile E-Menu QR & Giỏ hàng (Quân - FE)

**Files:**
- Create: `frontend/trang/thucDonQr/thucDonQr.js`
- Create: `frontend/trang/gioHang/gioHang.js`
- Modify: `frontend/index.html`
- Modify: `frontend/ungDung.js`

**Interfaces:**
- Consumes: REST API `/api/thuc-don`, `/api/phien-ban/xac-thuc-qr`
- Produces: Giao diện Web Khách hàng E-Menu Mobile-first, danh mục món ăn cuộn ngang, bottom sheet chi tiết món, giỏ hàng lưu LocalStorage

- [ ] **Step 1: Xây dựng màn hình nhận diện bàn khi quét QR (`#/menu?ban=...&token=...`)**
- [ ] **Step 2: Xây dựng danh sách thực đơn với tab danh mục, bộ lọc, món bán chạy**
- [ ] **Step 3: Xây dựng modal tùy chỉnh Size/Topping/Khẩu vị và màn hình Giỏ hàng**
- [ ] **Step 4: Kiểm thử hiển thị trên mobile viewport**

---

### Task 6: Frontend Theo dõi Đơn Real-time, Gọi nhân viên & WebSockets Client (Phong - FE)

**Files:**
- Create: `frontend/dungChung/ketNoiSocket.js`
- Create: `frontend/trang/theoDoiDonMon/theoDoiDonMon.js`
- Modify: `frontend/tepGiaoDien.css`
- Modify: `frontend/ungDung.js`

**Interfaces:**
- Consumes: Socket.io Client, REST API `/api/don-goi-mon`, `/api/yeu-cau-ho-tro`
- Produces: Trang "Món đã gọi" hiển thị các lượt đặt món, tự động nhảy trạng thái khi Bếp cập nhật, nút nổi gọi nhân viên & thanh toán

- [ ] **Step 1: Xây dựng module kết nối Socket.io Client `ketNoiSocket.js`**
- [ ] **Step 2: Xây dựng giao diện trang "Món đã gọi" (`#/theo-doi-don`)**
- [ ] **Step 3: Xây dựng nút nổi và menu "Gọi nhân viên / Yêu cầu thanh toán"**
- [ ] **Step 4: Tích hợp âm thanh chuông báo và cập nhật trạng thái món real-time**

---

### Task 7: Tích hợp toàn diện Sprint 2, Kiểm thử E2E & Báo cáo nghiệm thu

**Files:**
- Create: `taiLieu/baoCaoSprint/sprint02.md`
- Test: Chạy toàn bộ test suite

- [ ] **Step 1: Chạy toàn bộ test suite (Backend, Socket, Database)**
- [ ] **Step 2: Viết báo cáo nghiệm thu Sprint 2 (`sprint02.md`)**
- [ ] **Step 3: Xác nhận 100% test passed**

---

### Task 8: Tách phần việc của Nhật & Đóng gói 4 file ZIP cho Phát, Minh, Phong, Quân

**Files:**
- Commit & Push: Nhánh `feature/sprint2-table-session-order-sync` của Nhật
- Đóng gói ZIP: `c:\Users\Admin\Desktop\BAN_GIAO_NHOM_SPRINT2\`:
  1. `Phat_Database_Sprint2.zip` (kèm `HUONG_DAN_PHAT.md`)
  2. `Minh_Backend_NghiepVu_Sprint2.zip` (kèm `HUONG_DAN_MINH.md`)
  3. `Phong_Frontend_AdminCore_Sprint2.zip` (kèm `HUONG_DAN_PHONG.md`)
  4. `Quan_Frontend_BanMenu_Sprint2.zip` (kèm `HUONG_DAN_QUAN.md`)
