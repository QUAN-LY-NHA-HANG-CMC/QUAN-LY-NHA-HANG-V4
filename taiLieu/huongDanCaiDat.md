# HƯỚNG DẪN CÀI ĐẶT & CHẠY HỆ THỐNG BACKEND QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR

Dự án phát triển nền tảng quản lý nhà hàng và đặt món tại bàn bằng mã QR (Quán Mộc).  
Tài liệu hướng dẫn cài đặt môi trường, khởi chạy máy chủ backend và chạy bộ kiểm thử tự động.

---

## 1. Yêu cầu môi trường hệ thống
- **Node.js**: Phiên bản 20 trở lên (khuyến nghị Node.js v22 hoặc v24).
- **Trình quản lý gói**: npm phiên bản 9+ hoặc pnpm/yarn.
- **Hệ điều hành**: Windows 10/11, macOS hoặc Linux.

---

## 2. Cài đặt các gói phụ thuộc (Dependencies)

Mở Terminal / PowerShell tại thư mục gốc của dự án (`d:\PHAT TRIEN WED\QUAN_LY_NHA_HANG`):

```bash
# Cài đặt toàn bộ thư viện cần thiết
npm install
```

---

## 3. Cấu hình biến môi trường (.env)

Tệp `.env.example` đã được chuẩn bị sẵn các giá trị an toàn. Sao chép thành `.env`:

```bash
# Trên Windows PowerShell:
Copy-Item .env.example .env

# Trên Linux / macOS:
cp .env.example .env
```

Các biến môi trường chính:
- `CONG_BACKEND`: Cổng máy chủ lắng nghe (mặc định: `3001`).
- `MOI_TRUONG`: `development` hoặc `production`.
- `JWT_ACCESS_SECRET`: Chuỗi khóa bí mật ký Access Token.
- `JWT_REFRESH_SECRET`: Chuỗi khóa bí mật ký Refresh Token.
- `DB_SQLITE_PATH`: Đường dẫn lưu tệp cơ sở dữ liệu SQLite (`./database/quan_ly_nha_hang.sqlite`).

---

## 4. Khởi chạy máy chủ Backend

```bash
# Chạy máy chủ ở chế độ tiêu chuẩn:
npm start

# Hoặc chạy chế độ phát triển tự động theo dõi thay đổi mã nguồn (Watch mode):
npm run dev
```

Khi khởi chạy thành công, máy chủ sẽ tự động nạp cấu trúc bảng và dữ liệu mẫu nếu chưa có:
- Địa chỉ máy chủ: `http://localhost:3001`
- Kiểm tra sức khỏe hệ thống: `http://localhost:3001/api/kiem-tra-suc-khoe`
- Tài liệu tương tác Swagger UI: `http://localhost:3001/api-docs`

---

## 5. Chạy bộ kiểm thử tự động (Automated Test Suite)

Hệ thống tích hợp bộ kiểm thử tự động kiểm tra toàn bộ 32 kịch bản của Sprint 1:

```bash
npm test
```

Bộ kiểm thử sẽ tự động chạy:
1. Kiểm tra mã hóa mật khẩu Bcrypt (US-001).
2. Kiểm tra xác thực JWT Access Token & Refresh Token (US-002, US-003).
3. Kiểm tra Middleware chặn truy cập trái phép 401 & 403 (US-004).
4. Kiểm tra giới hạn tần suất yêu cầu Rate Limiting (US-005).
5. Kiểm tra Input Validation và làm sạch chống XSS (US-006).
6. Kiểm tra các luồng Đăng nhập, Đăng xuất, Đổi mật khẩu, Cập nhật hồ sơ (US-007 -> US-010).
7. Kiểm tra Quản lý vai trò, gán quyền, phân quyền Bếp/Thu ngân/Quản lý và ghi lịch sử (US-015 -> US-022).
8. Kiểm tra Cấu hình thông tin nhà hàng, Thuế VAT, Tài khoản VietQR và tra cứu System Logs (US-041 -> US-044).

---

## 6. Sử dụng tài liệu API Swagger & Postman

### 6.1 Swagger UI
Truy cập trực tiếp trên trình duyệt tại: `http://localhost:3001/api-docs`.  
Tại đây bạn có thể xem đầy đủ schema đầu vào/đầu ra và thử nghiệm (Execute) trực tiếp từng API.

### 6.2 Nhập vào Postman (Import Postman Collection)
1. Mở ứng dụng Postman.
2. Bấm nút **Import** ở góc trên bên trái.
3. Chọn tệp: `taiLieu/Postman_Collection_QuanLyNhaHang_Auth_RBAC_Config.json`.
4. Toàn bộ các API được sắp xếp theo từng thư mục nghiệp vụ.  
   *Khi bạn bấm gửi yêu cầu `1.1 Đăng nhập (Quản lý)`, Postman Test Script sẽ tự động lưu Access Token vào biến môi trường `{{accessToken}}` để các API tiếp theo sử dụng mà không cần copy thủ công!*
