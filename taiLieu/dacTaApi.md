# ĐẶC TẢ HỢP ĐỒNG API - SPRINT 1
**Dự án:** Website Quản lý Nhà hàng và Gọi món QR (Quán Mộc)

## 1. Chuẩn phản hồi HTTP

### Phản hồi thành công (HTTP 200 / 201):
```json
{
  "ok": true,
  "data": {},
  "msg": "Thành công"
}
```

### Phản hồi thất bại (HTTP 400 / 401 / 403 / 404 / 409 / 500):
```json
{
  "ok": false,
  "data": null,
  "msg": "Mô tả lỗi tiếng Việt"
}
```

---

## 2. Danh mục API Xác thực & Tài khoản (`/api/tai-khoan`)

| Phương thức | Đường dẫn | Quyền hạn | Mô tả |
|---|---|---|---|
| POST | `/api/tai-khoan/dang-nhap` | Public | Đăng nhập tài khoản, nhận JWT token |
| GET | `/api/tai-khoan/ho-so` | Đăng nhập | Xem thông tin tài khoản hiện tại |
| PUT | `/api/tai-khoan/ho-so` | Đăng nhập | Cập nhật họ tên, SĐT, email |
| POST | `/api/tai-khoan/doi-mat-khau` | Đăng nhập | Đổi mật khẩu cá nhân |
| POST | `/api/tai-khoan/dang-xuat` | Đăng nhập | Đăng xuất khỏi hệ thống |

---

## 3. Danh mục API Quản lý Nhân sự & Phân quyền (`/api/nhan-vien`, `/api/vai-tro`)

| Phương thức | Đường dẫn | Quyền hạn | Mô tả |
|---|---|---|---|
| GET | `/api/vai-tro` | `quan_ly_nhan_vien` | Lấy danh sách các vai trò kèm quyền hạn |
| GET | `/api/vai-tro/quyen-han` | `quan_ly_nhan_vien` | Lấy danh mục toàn bộ quyền hạn trong hệ thống |
| GET | `/api/nhan-vien` | `quan_ly_nhan_vien` | Danh sách nhân viên (có lọc, phân trang, tìm kiếm) |
| POST | `/api/nhan-vien` | `quan_ly_nhan_vien` | Tạo tài khoản nhân viên mới |
| PUT | `/api/nhan-vien/:id` | `quan_ly_nhan_vien` | Cập nhật thông tin và vai trò nhân viên |
| PATCH | `/api/nhan-vien/:id/trang-thai` | `quan_ly_nhan_vien` | Khóa hoặc mở khóa tài khoản nhân viên |
| POST | `/api/nhan-vien/:id/dat-lai-mat-khau` | `quan_ly_nhan_vien` | Đặt lại mật khẩu về mặc định `123456` |

---

## 4. Danh mục API Sơ đồ bàn & Mã QR (`/api/khu-vuc`, `/api/ban-an`)

| Phương thức | Đường dẫn | Quyền hạn | Mô tả |
|---|---|---|---|
| GET | `/api/khu-vuc` | Nhân viên | Lấy danh sách các khu vực/tầng |
| POST | `/api/khu-vuc` | `quan_ly_ban_an` | Tạo khu vực phục vụ mới |
| PUT | `/api/khu-vuc/:id` | `quan_ly_ban_an` | Cập nhật thông tin khu vực |
| DELETE | `/api/khu-vuc/:id` | `quan_ly_ban_an` | Xóa khu vực (nếu không có bàn) |
| GET | `/api/ban-an` | Nhân viên | Lấy danh sách sơ đồ bàn ăn |
| GET | `/api/ban-an/:id/ma-qr` | Nhân viên | Lấy chuỗi Base64 Data URI của mã QR bàn |
| POST | `/api/ban-an` | `quan_ly_ban_an` | Tạo bàn mới (tự động sinh QR token & link) |
| PUT | `/api/ban-an/:id` | `quan_ly_ban_an` | Cập nhật thông tin bàn |
| POST | `/api/ban-an/:id/lam-moi-qr` | `quan_ly_ban_an` | Làm mới mã QR bàn ăn để bảo mật |
| PATCH | `/api/ban-an/:id/trang-thai` | Nhân viên | Đổi trạng thái bàn (trống, đang dùng, chờ...) |
| DELETE | `/api/ban-an/:id` | `quan_ly_ban_an` | Xóa bàn (khi chưa phát sinh đơn) |

---

## 5. Danh mục API Thực đơn & Danh mục món (`/api/danh-muc-mon`, `/api/thuc-don`)

| Phương thức | Đường dẫn | Quyền hạn | Mô tả |
|---|---|---|---|
| GET | `/api/danh-muc-mon` | Public | Lấy danh mục món ăn |
| POST | `/api/danh-muc-mon` | `quan_ly_thuc_don` | Tạo danh mục mới |
| PUT | `/api/danh-muc-mon/:id` | `quan_ly_thuc_don` | Cập nhật tên, thứ tự danh mục |
| DELETE | `/api/danh-muc-mon/:id` | `quan_ly_thuc_don` | Xóa danh mục |
| GET | `/api/thuc-don` | Public | Lấy danh sách món ăn (có tìm kiếm, lọc danh mục) |
| GET | `/api/thuc-don/:id` | Public | Xem chi tiết món ăn và các tùy chọn |
| POST | `/api/thuc-don` | `quan_ly_thuc_don` | Thêm món ăn mới (hỗ trợ upload ảnh, tùy chọn) |
| PUT | `/api/thuc-don/:id` | `quan_ly_thuc_don` | Chỉnh sửa thông tin món ăn |
| PATCH | `/api/thuc-don/:id/trang-thai` | Bếp / Quản lý | Bật/tắt nhanh trạng thái "Đang bán" / "Tạm hết" |
| DELETE | `/api/thuc-don/:id` | `quan_ly_thuc_don` | Xóa mềm món ăn để bảo toàn lịch sử hóa đơn |

---

## 6. Danh mục API Cấu hình Nhà hàng & Nhật ký (`/api/cau-hinh-nha-hang`)

| Phương thức | Đường dẫn | Quyền hạn | Mô tả |
|---|---|---|---|
| GET | `/api/cau-hinh-nha-hang` | Public | Lấy cấu hình thông tin nhà hàng, hotline, wifi, thuế VAT |
| PUT | `/api/cau-hinh-nha-hang` | `quan_ly_he_thong` | Cập nhật thông tin quán, thuế VAT, VietQR |
| GET | `/api/cau-hinh-nha-hang/nhat-ky` | `quan_ly_he_thong` | Xem danh sách nhật ký hoạt động hệ thống (System logs) |
