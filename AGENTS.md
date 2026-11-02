# QUY CHUẨN VÀ LUỒNG LÀM VIỆC DỰ ÁN QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR (QUÁN MỘC)

## 1. Danh tính & Phân vai thành viên (5 thành viên)

Người dùng hiện tại là **Nhật** (`DINH VIET LONG NHAT`, `longnhatdinhviet8@gmail.com`):
1. **Nhật (PM / Team Lead, Kiến trúc Backend & API):**
   - Phụ trách quản lý tiến độ dự án, dựng khung hệ thống (Boilerplate), bảo mật nền tảng (Auth JWT, RBAC), cấu hình quán, kiến trúc WebSockets Real-time, review PR và điều phối merge nhánh chính.
2. **Phát (Database Specialist):**
   - Phụ trách thiết kế ERD, DDL Schema (`database/`), Indexing, Transactions phức tạp và dữ liệu mẫu (Seed Data).
3. **Minh (Backend Developer):**
   - Phụ trách các API nghiệp vụ: Nhân sự, Bàn/QR, Thực đơn, Giỏ hàng, Hỗ trợ bàn, Hóa đơn, VietQR, Đánh giá, Kết ca.
4. **Phong (Frontend Developer):**
   - Phụ trách Admin Layout, Xác thực, Điều phối Bếp (KDS Real-time), Quản lý ca làm việc, Dashboard Thống kê Doanh thu.
5. **Quân (Frontend Developer):**
   - Phụ trách Web Khách hàng E-Menu QR (Mobile-first), Giỏ hàng & Đặt món, POS Thu ngân sơ đồ bàn & Thanh toán, Form Đánh giá.

---

## 2. Luồng làm việc cho các Sprint tiếp theo (Sprint 2, 3, 4)

Mỗi khi bước vào và hoàn thành một Sprint mới, **luôn tuân thủ quy trình sau**:

### Bước 1: Phát triển toàn diện
- Lập trình đầy đủ các chức năng của Sprint (Backend, Database, Frontend, Test) theo đúng tài liệu `QUY_TAC_LAM_DU_AN.txt`, `PHAN_CHIA _CONG_VIEC.txt` và `product_backlog _ QUAN_LY_NHA_HANG.txt`.
- Đảm bảo 100% test suite chạy pass.

### Bước 2: Tách phần việc của Nhật & Push GitHub
- Chỉ commit và push phần việc được phân công của **Nhật** lên nhánh riêng (ví dụ: `feature/sprint2-table-session-order-sync`).
- Hướng dẫn Nhật tạo Pull Request trên GitHub để merge vào `main`.

### Bước 3: Đóng gói File ZIP riêng cho 4 thành viên còn lại
- Tách code của từng bạn vào các thư mục riêng và nén thành 4 file ZIP đặt tại `c:\Users\Admin\Desktop\BAN_GIAO_NHOM_SPRINT<N>\`:
  1. `Phat_Database_Sprint<N>.zip`
  2. `Minh_Backend_NghiepVu_Sprint<N>.zip`
  3. `Phong_Frontend_AdminCore_Sprint<N>.zip`
  4. `Quan_Frontend_BanMenu_Sprint<N>.zip`
- Trong mỗi file ZIP, luôn đính kèm tệp `HUONG_DAN_<TEN>.md` ghi rõ:
  - Tên nhánh cần tạo (`git checkout -b feature/...`)
  - Vị trí dán các file vào dự án
  - Lệnh commit và push lên GitHub
  - Hướng dẫn mở Pull Request trên GitHub

### Bước 4: Thứ tự Merge chuẩn để tránh 100% xung đột (Conflict-Free)
Luôn hướng dẫn thành viên tuần tự merge theo thứ tự:
1. **Nhật** (Merge nhánh hệ thống / backend core)
2. **Phát** (Merge nhánh database schema)
3. **Minh** (Merge nhánh backend nghiệp vụ)
4. **Phong** (Merge nhánh frontend admin / core)
5. **Quân** (Merge nhánh frontend khách hàng / POS)

---

## 3. Quy chuẩn mã nguồn bắt buộc
- Tên tệp, thư mục, hàm, biến viết bằng tiếng Việt không dấu theo camelCase / PascalCase.
- Bảng và cột CSDL viết bằng tiếng Việt không dấu snake_case.
- Đường dẫn API dùng danh từ tiếng Việt không dấu kebab-case (`/api/don-goi-mon`, `/api/thuc-don`).
- Phản hồi JSON chuẩn: `{ ok: boolean, data: any, msg: string }`.
- Sử dụng `node:sqlite` tích hợp sẵn trong Node 24 để chạy ngay lập tức không cần cài đặt server DB rời.
