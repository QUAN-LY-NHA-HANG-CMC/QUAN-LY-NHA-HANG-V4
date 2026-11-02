# BÁO CÁO NGHIỆM THU SPRINT 1
**Dự án:** Hệ thống Quản lý Nhà hàng & Gọi món QR (Quán Mộc)
**Thời gian thực hiện:** Sprint 1
**Trạng thái:** HOÀN THÀNH (13/13 Test Cases passed)

---

## 1. Mục tiêu Sprint 1
- Thiết lập khung dự án chuẩn theo `QUY_TAC_LAM_DU_AN.txt`.
- Khởi tạo cơ sở dữ liệu SQLite nền tảng với đầy đủ schema, chỉ mục, ràng buộc và dữ liệu mẫu.
- Xây dựng hệ thống bảo mật, xác thực tài khoản JWT và phân quyền RBAC đa vai trò (Quản lý, Thu ngân, Bếp, Phục vụ).
- Xây dựng phân hệ quản lý khu vực, bàn ăn và tự động sinh mã QR định danh cho từng bàn.
- Xây dựng phân hệ quản lý danh mục và thực đơn món ăn (CRUD, upload ảnh, tùy chọn size/topping, toggle hết hàng, xóa mềm).
- Xây dựng giao diện Frontend Quản trị SPA hiện đại, trực quan, hỗ trợ xem và in mã QR.
- Hoàn thành đầy đủ 44 User Story (US-001 đến US-044).

---

## 2. Kết quả thực hiện chi tiết theo User Story

### Nhóm 1: Bảo mật nền tảng (US-001 -> US-006)
- **US-001:** Băm mật khẩu người dùng an toàn bằng bcryptjs (`vongBămMatKhau = 10`).
- **US-002 & US-003:** Xác thực phiên làm việc bằng JWT Token, kiểm tra thời hạn và cơ chế chặn token giả mạo.
- **US-004:** Middleware `xacThuc` và `phanQuyen` chặn truy cập trái phép vào các route nội bộ.
- **US-005:** Middleware `gioiHanYeuCau` giới hạn tần suất request (Rate Limiting) chống tấn công spam API.
- **US-006:** Kiểm tra và làm sạch dữ liệu đầu vào (Input validation) tại tầng Service & Database constraint.

### Nhóm 2: Tài khoản và hồ sơ nhân sự (US-007 -> US-014)
- **US-007 & US-008:** API & Giao diện Đăng nhập / Đăng xuất an toàn.
- **US-009 & US-010:** Xem thông tin cá nhân và chức năng đổi mật khẩu.
- **US-011 & US-012:** Quản lý tạo mới tài khoản cho nhân viên, xem danh sách có phân trang và bộ lọc tìm kiếm.
- **US-013 & US-014:** Cập nhật thông tin nhân viên, đặt lại mật khẩu về mặc định `123456`, khóa/mở khóa tài khoản nghỉ việc.

### Nhóm 3: Vai trò và quyền hạn (US-015 -> US-022)
- **US-015 & US-016:** Danh sách 4 vai trò cốt lõi (`quan_ly`, `thu_ngan`, `bep`, `phuc_vu`).
- **US-017 & US-018:** Cấu hình quyền truy cập chi tiết (8 quyền hạn chức năng).
- **US-019 -> US-021:** Kiểm soát phân quyền nghiêm ngặt: Bếp chỉ truy cập đơn bếp, Thu ngân truy cập sơ đồ bàn & thanh toán, Quản lý toàn quyền thực đơn, nhân sự và báo cáo.
- **US-022:** Ghi nhận lịch sử thay đổi quyền và hoạt động vào `nhat_ky_he_thong`.

### Nhóm 4: Khu vực và sơ đồ bàn (US-023 -> US-030)
- **US-023 & US-024:** Quản lý khu vực / tầng (Sảnh chính, Phòng VIP, Sân vườn...).
- **US-025 -> US-027:** CRUD bàn ăn với mã bàn, tên bàn, sức chứa và kiểm tra trạng thái trước khi xóa.
- **US-028 & US-029:** Tự động sinh URL định danh và mã QR riêng cho từng bàn; giao diện xem trước, tải ảnh QR PNG và in ấn trực tiếp.
- **US-030:** Cơ chế làm mới token mã QR bàn tức thời khi cần bảo mật.

### Nhóm 5: Danh mục và thực đơn (US-031 -> US-040)
- **US-031 & US-032:** CRUD danh mục món ăn kèm thứ tự hiển thị.
- **US-033 -> US-036:** Quản lý món ăn (tên món, giá, đơn vị tính, mô tả, danh mục, tải lên hình ảnh).
- **US-037:** Thiết lập tùy chọn kích cỡ (Size) và món thêm (Topping) cho từng món ăn.
- **US-038:** Nút gạt (Toggle Switch) bật/tắt nhanh trạng thái "Đang bán" / "Tạm hết" ngay trên màn hình.
- **US-039:** Gắn nhãn món ăn đặc sắc / bán chạy (`⭐ Bán chạy`).
- **US-040:** Xóa mềm (`da_xoa = 1`) để ẩn món khỏi thực đơn mà vẫn bảo toàn toàn vẹn lịch sử hóa đơn.

### Nhóm 6: Quản trị nền tảng (US-041 -> US-044)
- **US-041 & US-042:** Cấu hình thông tin nhà hàng (tên quán, địa chỉ, hotline, wifi, thuế VAT, phí phục vụ).
- **US-043:** Cấu hình thông tin ngân hàng nhận thanh toán VietQR Napas.
- **US-044:** Tra cứu nhật ký hệ thống (System logs) theo thời gian thực.

---

## 3. Kết quả kiểm thử tự động (Automated Test Suite)
- Tổng số test case: **13**
- Số test case đạt: **13/13 (100%)**
- Số test case thất bại: **0**

---

## 4. Hướng dẫn chạy thử nghiệm
1. Khởi động máy chủ:
   ```bash
   node backend/mayChu.js
   ```
2. Truy cập trình duyệt: `http://localhost:3001`
3. Đăng nhập bằng tài khoản quản trị:
   - Tên đăng nhập: `admin`
   - Mật khẩu: `123456`
