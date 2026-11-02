# TÀI LIỆU ĐẶC TẢ API HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR (QUÁN MỘC)

**Phân hệ phụ trách:** Bảo mật nền tảng (US-001 -> US-006), Tài khoản cá nhân (US-007 -> US-010), Vai trò & Quyền hạn (US-015 -> US-022) và Quản trị nền tảng (US-041 -> US-044).  
**Người phụ trách:** Nhật (Trưởng nhóm / PM, Kiến trúc Backend & API).  
**Môi trường thử nghiệm:** `http://localhost:3001`  
**Swagger UI:** `http://localhost:3001/api-docs`  
**Đặc tả OpenAPI:** `http://localhost:3001/api-docs.json`  

---

## 1. Chuẩn giao thức & Phản hồi chung (API Response Format)

Mọi phản hồi từ hệ thống tuân thủ cấu trúc thống nhất theo Mục 9 Quy chuẩn dự án (`QUY_TAC_LAM_DU_AN.txt`):

### 1.1 Phản hồi thành công
```json
{
  "ok": true,
  "data": { ... },
  "msg": "Thành công"
}
```

### 1.2 Phản hồi thất bại
```json
{
  "ok": false,
  "data": null,
  "msg": "Thông điệp lỗi chi tiết"
}
```

### 1.3 Mã trạng thái HTTP (HTTP Status Codes)
- `200 OK`: Yêu cầu xử lý thành công.
- `201 Created`: Tạo mới bản ghi thành công.
- `400 Bad Request`: Dữ liệu đầu vào không hợp lệ hoặc thiếu trường bắt buộc.
- `401 Unauthorized`: Chưa đăng nhập, token không hợp lệ hoặc đã hết hạn.
- `403 Forbidden`: Tài khoản bị khóa hoặc không đủ quyền truy cập tài nguyên.
- `404 Not Found`: Không tìm thấy bản ghi hoặc đường dẫn API.
- `409 Conflict`: Xung đột dữ liệu (ví dụ mã vai trò đã tồn tại).
- `429 Too Many Requests`: Vượt quá giới hạn tần suất yêu cầu (Rate Limit).
- `500 Internal Server Error`: Lỗi máy chủ nội bộ.

---

## 2. Danh mục tài khoản mẫu kiểm thử (Seed Accounts)

Mật khẩu mặc định cho toàn bộ các tài khoản thử nghiệm: `MatKhau@123` (được băm bằng Bcrypt 10 rounds).

| Tên đăng nhập | Vai trò | Tên nhân viên | Quyền hạn chính |
|---|---|---|---|
| `quanly` | QUAN_LY | Nguyễn Văn Quản Lý | Toàn quyền quản trị, cấu hình, phân quyền, xem doanh thu |
| `thungan` | THU_NGAN | Trần Thị Thu Ngân | Xem sơ đồ bàn, lập hóa đơn, thu tiền, in bill |
| `daubep` | BEP | Lê Văn Bếp Trưởng | Xem màn hình bếp KDS, cập nhật trạng thái nấu, báo hết món |
| `phucvu` | PHUC_VU | Phạm Văn Phục Vụ | Xem sơ đồ bàn, hỗ trợ khách gọi món |

---

## 3. Chi tiết các Endpoint API

### PHẦN I: TÀI KHOẢN CÁ NHÂN & XÁC THỰC (US-001 -> US-010)

#### 1. Đăng nhập hệ thống (US-007)
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/tai-khoan/dang-nhap`
- **Quyền truy cập:** Công khai (Có áp dụng Rate Limiting tối đa 5 lần / 15 phút)
- **Body yêu cầu:**
```json
{
  "tenDangNhap": "quanly",
  "matKhau": "MatKhau@123"
}
```
- **Phản hồi thành công (200):**
```json
{
  "ok": true,
  "data": {
    "taiKhoan": {
      "id": 1,
      "tenDangNhap": "quanly",
      "hoTen": "Nguyễn Văn Quản Lý",
      "soDienThoai": "0901234567",
      "email": "quanly@quanmoc.com",
      "anhDaiDien": null,
      "vaiTro": ["QUAN_LY"],
      "danhSachQuyen": ["QUAN_LY_TAI_KHOAN", "QUAN_LY_VAI_TRO", "CAU_HINH_HE_THONG", ...]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "hetHanTrong": "1h"
    }
  },
  "msg": "Đăng nhập thành công."
}
```

#### 2. Làm mới Access Token (US-003)
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/tai-khoan/lam-moi-token`
- **Quyền truy cập:** Công khai (Gửi qua Header / Cookie hoặc Body)
- **Body yêu cầu:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Phản hồi thành công (200):**
```json
{
  "ok": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "hetHanTrong": "1h"
  },
  "msg": "Làm mới token thành công."
}
```

#### 3. Đăng xuất (US-008)
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/tai-khoan/dang-xuat`
- **Quyền truy cập:** Đã xác thực hoặc gửi kèm `refreshToken`
- **Body yêu cầu:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Phản hồi thành công (200):**
```json
{
  "ok": true,
  "data": null,
  "msg": "Đăng xuất thành công."
}
```

#### 4. Đổi mật khẩu cá nhân (US-009)
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/tai-khoan/doi-mat-khau`
- **Quyền truy cập:** Đã xác thực (`Authorization: Bearer <token>`)
- **Body yêu cầu:**
```json
{
  "matKhauCu": "MatKhau@123",
  "matKhauMoi": "MatKhauMoi@456",
  "xacNhanMatKhauMoi": "MatKhauMoi@456"
}
```
- **Phản hồi thành công (200):**
```json
{
  "ok": true,
  "data": null,
  "msg": "Đổi mật khẩu thành công. Vui lòng đăng nhập lại với mật khẩu mới."
}
```

#### 5. Xem hồ sơ cá nhân (US-010)
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/tai-khoan/ho-so`
- **Quyền truy cập:** Đã xác thực (`Authorization: Bearer <token>`)
- **Phản hồi thành công (200):**
```json
{
  "ok": true,
  "data": {
    "id": 1,
    "tenDangNhap": "quanly",
    "hoTen": "Nguyễn Văn Quản Lý",
    "soDienThoai": "0901234567",
    "email": "quanly@quanmoc.com",
    "anhDaiDien": null,
    "trangThai": 1,
    "dangNhapCuoi": "2026-10-19 01:15:00",
    "ngayTao": "2026-10-19 00:00:00",
    "vaiTro": [{ "id": 1, "ma_vai_tro": "QUAN_LY", "ten_vai_tro": "Quản lý" }],
    "danhSachQuyen": ["QUAN_LY_TAI_KHOAN", "QUAN_LY_VAI_TRO", "CAU_HINH_HE_THONG", ...]
  },
  "msg": "Lấy thông tin hồ sơ thành công."
}
```

#### 6. Cập nhật hồ sơ cá nhân (US-010)
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/tai-khoan/ho-so`
- **Quyền truy cập:** Đã xác thực (`Authorization: Bearer <token>`)
- **Body yêu cầu:**
```json
{
  "hoTen": "Nguyễn Văn Quản Lý",
  "soDienThoai": "0901234567",
  "email": "quanly@quanmoc.com"
}
```

---

### PHẦN II: VAI TRÒ & PHÂN QUYỀN RBAC (US-015 -> US-022)

#### 1. Xem danh sách các vai trò (US-015)
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/vai-tro`
- **Quyền truy cập:** Quản lý (`QUAN_LY`)
- **Phản hồi thành công (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "ma_vai_tro": "QUAN_LY",
      "ten_vai_tro": "Quản lý",
      "mo_ta": "Toàn quyền điều hành hệ thống nhà hàng",
      "la_he_thong": 1,
      "trang_thai": 1,
      "so_luong_nhan_vien": 1,
      "quyenHan": [ ... ]
    },
    {
      "id": 2,
      "ma_vai_tro": "THU_NGAN",
      "ten_vai_tro": "Thu ngân",
      "mo_ta": "Quản lý sơ đồ bàn, lập hóa đơn và xử lý thanh toán",
      "la_he_thong": 1,
      "trang_thai": 1,
      "so_luong_nhan_vien": 1,
      "quyenHan": [ ... ]
    }
  ],
  "msg": "Lấy danh sách vai trò thành công."
}
```

#### 2. Lấy danh mục tất cả quyền có trong hệ thống
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/vai-tro/danh-muc-quyen`
- **Quyền truy cập:** Quản lý (`QUAN_LY`)

#### 3. Tạo mới vai trò (US-016)
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/vai-tro`
- **Quyền truy cập:** Quản lý (`QUAN_LY`)
- **Body yêu cầu:**
```json
{
  "maVaiTro": "TO_TRUONG",
  "tenVaiTro": "Tổ trưởng phục vụ",
  "moTa": "Giám sát khu vực bàn và điều phối nhân sự"
}
```

#### 4. Chỉnh sửa thông tin vai trò (US-016)
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/vai-tro/:id`
- **Quyền truy cập:** Quản lý (`QUAN_LY`)
- **Body yêu cầu:**
```json
{
  "tenVaiTro": "Tổ trưởng phục vụ ca",
  "moTa": "Cập nhật mô tả vai trò",
  "trangThai": 1
}
```

#### 5. Cấu hình quyền truy cập chi tiết cho vai trò (US-018)
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/vai-tro/:id/quyen`
- **Quyền truy cập:** Quản lý (`QUAN_LY`)
- **Body yêu cầu:**
```json
{
  "danhSachQuyenId": [3, 4, 9]
}
```
*(Ghi nhận tự động vào bảng Lịch sử thay đổi quyền nhân sự - US-022)*

#### 6. Gán vai trò cho nhân viên (US-017)
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/vai-tro/gan-vai-tro`
- **Quyền truy cập:** Quản lý (`QUAN_LY`)
- **Body yêu cầu:**
```json
{
  "taiKhoanId": 4,
  "danhSachVaiTroId": [4]
}
```
*(Ghi nhận tự động vào bảng Lịch sử thay đổi quyền nhân sự - US-022)*

#### 7. Xem lịch sử thay đổi quyền hạn nhân sự (US-022)
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/vai-tro/lich-su-thay-doi?trang=1&soLuong=20`
- **Quyền truy cập:** Quản lý (`QUAN_LY`)
- **Phản hồi thành công (200):**
```json
{
  "ok": true,
  "data": {
    "danhSach": [
      {
        "id": 1,
        "hanh_dong": "GAN_VAI_TRO",
        "noi_dung_chi_tiet": "Gán vai trò [Nhân viên Phục vụ] cho nhân viên: Phạm Văn Phục Vụ (phucvu)",
        "ten_nguoi_thuc_hien": "Nguyễn Văn Quản Lý",
        "ten_tai_khoan_duoc_gan": "Phạm Văn Phục Vụ",
        "ngay_tao": "2026-10-19 01:18:00"
      }
    ],
    "tongSo": 1,
    "trang": 1,
    "tongSoTrang": 1
  },
  "msg": "Lấy lịch sử phân quyền thành công."
}
```

#### 8. Xóa vai trò tùy chỉnh (US-016)
- **Phương thức:** `DELETE`
- **Đường dẫn:** `/api/vai-tro/:id`
- **Quyền truy cập:** Quản lý (`QUAN_LY`)
- **Lưu ý:** Không thể xóa các vai trò hệ thống mặc định (`QUAN_LY`, `THU_NGAN`, `BEP`, `PHUC_VU`).

---

### PHẦN III: QUẢN TRỊ NỀN TẢNG (US-041 -> US-044)

#### 1. Xem thông tin nhà hàng công khai (Dành cho E-Menu QR)
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/cau-hinh-nha-hang/cong-khai`
- **Quyền truy cập:** Công khai (Không cần token)
- **Phản hồi thành công (200):**
```json
{
  "ok": true,
  "data": {
    "tenNhaHang": "Nhà Hàng Quán Mộc",
    "diaChi": "123 Đường Ẩm Thực, Quận 1, TP. Hồ Chí Minh",
    "soDienThoai": "028 1234 5678",
    "wifiTen": "QuanMoc_KhachHang",
    "wifiMatKhau": "quanmoc2026",
    "khauHieu": "Hương vị truyền thống, đậm đà tình thân",
    "gioMoCua": "09:00",
    "gioDongCua": "22:30"
  },
  "msg": "Lấy thông tin nhà hàng thành công."
}
```

#### 2. Xem cấu hình thông tin nhà hàng đầy đủ (US-041)
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/cau-hinh-nha-hang/thong-tin`
- **Quyền truy cập:** Đã xác thực

#### 3. Cập nhật cấu hình thông tin nhà hàng (US-041)
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/cau-hinh-nha-hang/thong-tin`
- **Quyền truy cập:** Quản lý (`QUAN_LY`)
- **Body yêu cầu:**
```json
{
  "tenNhaHang": "Nhà Hàng Quán Mộc",
  "diaChi": "123 Đường Ẩm Thực, Quận 1, TP. Hồ Chí Minh",
  "soDienThoai": "028 1234 5678",
  "email": "lienhe@quanmoc.com",
  "wifiTen": "QuanMoc_KhachHang",
  "wifiMatKhau": "quanmoc2026",
  "khauHieu": "Hương vị truyền thống, đậm đà tình thân",
  "gioMoCua": "09:00",
  "gioDongCua": "22:30"
}
```

#### 4. Xem cấu hình thuế VAT & Phí phục vụ (US-042)
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/cau-hinh-nha-hang/thue-phi`
- **Quyền truy cập:** Đã xác thực
- **Phản hồi thành công (200):**
```json
{
  "ok": true,
  "data": {
    "vatPhanTram": 8.0,
    "phiPhucVuPhanTram": 0.0,
    "apDungVat": true,
    "apDungPhiPhucVu": false
  },
  "msg": "Lấy cấu hình thuế và phí dịch vụ thành công."
}
```

#### 5. Cập nhật thuế VAT & Phí phục vụ (US-042)
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/cau-hinh-nha-hang/thue-phi`
- **Quyền truy cập:** Quản lý (`QUAN_LY`)
- **Body yêu cầu:**
```json
{
  "vatPhanTram": 8.0,
  "phiPhucVuPhanTram": 0.0,
  "apDungVat": 1,
  "apDungPhiPhucVu": 0
}
```

#### 6. Xem cấu hình tài khoản VietQR (US-043)
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/cau-hinh-nha-hang/viet-qr`
- **Quyền truy cập:** Đã xác thực
- **Phản hồi thành công (200):**
```json
{
  "ok": true,
  "data": {
    "nganHangMa": "MB",
    "nganHangTen": "Ngân hàng Quân Đội (MBBank)",
    "soTaiKhoan": "0888999888",
    "chuTaiKhoan": "NHA HANG QUAN MOC",
    "cuPhapChuyenKhoan": "QUANMOC {maHoaDon}"
  },
  "msg": "Lấy cấu hình tài khoản VietQR thành công."
}
```

#### 7. Cập nhật cấu hình tài khoản VietQR (US-043)
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/cau-hinh-nha-hang/viet-qr`
- **Quyền truy cập:** Quản lý (`QUAN_LY`)
- **Body yêu cầu:**
```json
{
  "nganHangMa": "MB",
  "nganHangTen": "Ngân hàng Quân Đội (MBBank)",
  "soTaiKhoan": "0888999888",
  "chuTaiKhoan": "NHA HANG QUAN MOC",
  "cuPhapChuyenKhoan": "QUANMOC {maHoaDon}"
}
```

#### 8. Tạo mã VietQR thanh toán tự động (US-043)
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/cau-hinh-nha-hang/viet-qr/tao-ma`
- **Quyền truy cập:** Quản lý (`QUAN_LY`) hoặc Thu ngân (`THU_NGAN`)
- **Body yêu cầu:**
```json
{
  "soTien": 250000,
  "maHoaDon": "HD-20261019-001"
}
```
- **Phản hồi thành công (200):**
```json
{
  "ok": true,
  "data": {
    "nganHangMa": "MB",
    "nganHangTen": "Ngân hàng Quân Đội",
    "soTaiKhoan": "0888999888",
    "chuTaiKhoan": "NHA HANG QUAN MOC",
    "soTien": 250000,
    "noiDungChuyenKhoan": "QUANMOC HD-20261019-001",
    "qrImageUrl": "https://img.vietqr.io/image/MB-0888999888-compact.png?amount=250000&addInfo=QUANMOC%20HD-20261019-001&accountName=NHA%20HANG%20QUAN%20MOC"
  },
  "msg": "Tạo mã VietQR thanh toán thành công."
}
```

#### 9. Truy xuất nhật ký hệ thống - System Logs (US-044)
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/cau-hinh-nha-hang/nhat-ky-he-thong`
- **Quyền truy cập:** Quản lý (`QUAN_LY`)
- **Tham số truy vấn (Query params):**
  - `trang` (mặc định: 1)
  - `soLuong` (mặc định: 20, tối đa: 100)
  - `loaiHanhDong` (tùy chọn: `DANG_NHAP`, `DOI_MAT_KHAU`, `PHAN_QUYEN`, ...)
  - `module` (tùy chọn: `TAI_KHOAN`, `VAI_TRO`, `CAU_HINH`, ...)
  - `tuNgay` (tùy chọn: `YYYY-MM-DD`)
  - `denNgay` (tùy chọn: `YYYY-MM-DD`)
  - `taiKhoanId` (tùy chọn: ID người dùng)
- **Phản hồi thành công (200):**
```json
{
  "ok": true,
  "data": {
    "danhSach": [
      {
        "id": 12,
        "tai_khoan_id": 1,
        "ten_dang_nhap": "quanly",
        "ho_ten": "Nguyễn Văn Quản Lý",
        "loai_hanh_dong": "DANG_NHAP_THANH_CONG",
        "module": "TAI_KHOAN",
        "moTa": "Đăng nhập thành công với vai trò: QUAN_LY",
        "dia_chi_ip": "127.0.0.1",
        "thong_tin_thiet_bi": "PostmanRuntime/7.39.0",
        "du_lieu_yeu_cau": null,
        "ngay_tao": "2026-10-19 01:15:30"
      }
    ],
    "tongSo": 12,
    "trang": 1,
    "tongSoTrang": 1
  },
  "msg": "Lấy danh sách nhật ký hệ thống thành công."
}
```
*(Bảo đảm nguyên tắc Rule 10.9: Tuyệt đối không ghi nhận mật khẩu, access token hoặc refresh token vào nhật ký hệ thống).*
