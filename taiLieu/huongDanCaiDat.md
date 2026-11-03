# HƯỚNG DẪN CÀI ĐẶT, CẤU HÌNH VÀ TRIỂN KHAI HỆ THỐNG
**Hệ Thống:** Website Quản Lý Nhà Hàng & Gọi Món QR (Quán Mộc POS & E-Menu)  
**Nền tảng công nghệ:** Node.js (v18+) / Express / SQLite 3 (`better-sqlite3`) / Socket.io / Vanilla ES6 Modular  
**Phiên bản hoàn thiện:** 4.0 (Sprint 1 - Sprint 4)  

---

## 1. YÊU CẦU MÔI TRƯỜNG HỆ THỐNG

| Thành phần | Yêu cầu tối thiểu | Khuyến nghị (Production) |
|---|---|---|
| **Hệ điều hành** | Windows 10/11, macOS 12+, Ubuntu 20.04+ | Ubuntu 22.04 LTS / Debian 12 |
| **Node.js** | v18.0.0 trở lên | **Node.js v20.x hoặc v24.x LTS** |
| **Trình quản lý gói** | npm v9.0.0 trở lên | npm v10.x |
| **Bộ nhớ RAM** | Tối thiểu 1 GB | 2 GB - 4 GB |
| **Dung lượng ổ cứng** | 500 MB trống | 2 GB SSD trống (chứa ảnh món và log CSDL) |
| **Trình duyệt Web** | Chrome 90+, Edge 90+, Safari 14+, Firefox 88+ | Trình duyệt nhân Chromium cập nhật mới nhất |

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
QUAN LY NHA HANG V4/
├── backend/                        # Mã nguồn Backend (Express REST API & WebSockets)
│   ├── cauHinh/                    # Cấu hình máy chủ, CSDL SQLite, Socket.io
│   ├── middleware/                 # Middleware xác thực JWT, RBAC, Rate Limit, Error handling
│   ├── modules/                    # 20 Modules nghiệp vụ độc lập (MVC / Service-Repository)
│   │   ├── banAn/                  # Quản lý bàn ăn & sinh mã QR
│   │   ├── caLamViec/              # Ca làm việc, phiên thu ngân & phiếu thu chi
│   │   ├── cauHinhNhaHang/         # Thông tin quán, VAT & VietQR
│   │   ├── danhGia/                # Đánh giá sao, nhận xét & mẫu phản hồi nhanh
│   │   ├── danhMucMon/             # Danh mục thực đơn
│   │   ├── donGoiMon/              # Đơn món, chi tiết món & xác nhận bưng món
│   │   ├── gioHang/                # Giỏ hàng tạm thời theo phiên bàn
│   │   ├── hoaDon/                 # Hóa đơn & tính toán thuế VAT
│   │   ├── kds/                    # Điều phối Bếp KDS & hàng đợi FIFO
│   │   ├── khuVuc/                 # Khu vực / tầng phục vụ
│   │   ├── khuyenMai/              # Mã giảm giá Voucher
│   │   ├── nhanVien/               # Quản lý hồ sơ nhân sự
│   │   ├── phienBan/               # Phiên phục vụ tại bàn & đổi/ghép bàn
│   │   ├── taiKhoan/               # Xác thực đăng nhập & cấp JWT
│   │   ├── thanhToan/              # Thanh toán tiền mặt & Napas VietQR động
│   │   ├── thongKe/                # Dashboard analytics & báo cáo doanh thu
│   │   ├── thucDon/                # Quản lý thực đơn & tải ảnh món
│   │   ├── vaiTro/                 # Danh mục vai trò và ma trận quyền
│   │   ├── xuatBaoCao/             # Xuất dữ liệu CSV chuẩn UTF-8 BOM
│   │   └── yeuCauHoTro/            # Tiếp nhận yêu cầu gọi phục vụ tại bàn
│   ├── tienIch/                    # Tiện ích định dạng phản hồi, ghi nhật ký logger
│   ├── ungDung.js                  # Khởi tạo Express app & gắn định tuyến API
│   └── mayChu.js                   # Điểm khởi chạy HTTP Server & Socket.io (Port 3001)
├── frontend/                       # Giao diện người dùng Single Page Application (SPA)
│   ├── dungChung/                  # Tiện ích API Client, WebSocket Client, Toast Notifications, Formatters
│   ├── trang/                      # 11 Màn hình giao diện chuyên trách
│   │   ├── banAnQr/                # Sơ đồ bàn & POS phục vụ
│   │   ├── caLamViec/              # Mở ca, lập phiếu thu chi & kết ca đối soát quỹ
│   │   ├── dangNhap/               # Đăng nhập hệ thống nội bộ
│   │   ├── danhGia/                # Quản trị đánh giá khách hàng & phản hồi nhanh
│   │   ├── dieuPhoiBep/            # Màn hình KDS Bếp (Full screen & chuông Web Audio)
│   │   ├── gioHang/                # Giỏ hàng E-Menu khách hàng
│   │   ├── nhanVien/               # Quản lý tài khoản nhân viên
│   │   ├── quanTri/                # Cấu hình thương hiệu, VAT, VietQR & Nhật ký Audit Log
│   │   ├── thanhToan/              # POS Thanh toán hóa đơn, in bill K80 & VietQR
│   │   ├── theoDoiDonMon/          # Màn hình khách theo dõi món & quét QR tại bàn
│   │   ├── thongKe/                # Dashboard biểu đồ doanh thu & phân tích kinh doanh
│   │   └── thucDonQr/              # E-Menu gọi món trên mobile cho thực khách
│   ├── tepGiaoDien.css             # Hệ thống Design Tokens CSS, Mobile Drawer & Dark Mode KDS
│   ├── ungDung.js                  # Core Router, Route Guard & Navigation Controller
│   └── index.html                  # Khung HTML gốc ứng dụng
├── database/                       # Cơ sở dữ liệu SQLite
│   ├── quanLyNhaHang.sqlite        # Tệp CSDL SQLite chính (WAL mode)
│   ├── taoBang.sql                 # Script khởi tạo 12 bảng Sprint 1
│   ├── migrationSprint2.sql        # Migration Sprint 2 (Phiên bàn, giỏ hàng, đơn món)
│   ├── migrationSprint3.sql        # Migration Sprint 3 (Hóa đơn, khuyến mãi, chuyển ghép bàn)
│   ├── migrationSprint4.sql        # Migration Sprint 4 (Ca làm việc, đánh giá, thống kê)
│   └── duLieuMau.sql               # Dữ liệu mẫu ban đầu (Seed data)
├── tepTaiLen/                      # Thư mục lưu trữ hình ảnh tải lên & vector SVG
│   └── monAn/                      # Thư viện ảnh vector SVG các món ăn đặc sản
├── kiemThu/                        # Bộ kiểm thử tự động 58 test cases
│   └── api/                        # Test suites kiểm thử toàn diện từ Sprint 1 - 4
├── taiLieu/                        # Tài liệu dự án hoàn thiện
│   ├── dacTaYeuCau.md              # Đặc tả yêu cầu phần mềm (SRS)
│   ├── soDoCoSoDuLieu.md           # Sơ đồ CSDL & từ điển 29 bảng dữ liệu (ERD)
│   ├── dacTaApi.md                 # Đặc tả hợp đồng API đầy đủ các phân hệ
│   ├── baoCaoPhanQuyenVaLuongChucNang.md # Báo cáo phân quyền RBAC & chuyên biệt hóa
│   ├── huongDanCaiDat.md           # Hướng dẫn cài đặt & triển khai (Tài liệu này)
│   ├── huongDanSuDung.md           # Cẩm nang hướng dẫn sử dụng 5 vai trò
│   └── baoCaoSprint/               # Báo cáo nghiệm thu Sprint 1, 2, 3, 4 & Giao diện
└── package.json                    # Cấu hình dự án, scripts & dependencies
```

---

## 3. CẤU HÌNH BIẾN MÔI TRƯỜNG (`.env`)

Tạo tệp `.env` tại thư mục gốc của dự án nếu chưa có với các tham số mẫu chuẩn sau:

```ini
# Cổng chạy của máy chủ Backend
PORT=3001

# Môi trường chạy (development / production / test)
NODE_ENV=development

# Khóa bí mật ký mã JWT Token (Nên đổi chuỗi ngẫu nhiên dài khi lên production)
JWT_SECRET=quan_moc_bi_mat_jwt_khoa_bao_mat_2026_sieu_cap_an_toan_9999

# Thời gian sống của JWT Token (ví dụ: 8h, 24h, 7d)
JWT_EXPIRES_IN=24h

# Giới hạn kích thước tệp ảnh tải lên (Megabytes)
UPLOAD_LIMIT_MB=5

# Cấu hình bảo vệ Rate Limiting chống spam/DDoS
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=300
```

---

## 4. CÁC BƯỚC CÀI ĐẶT CHI TIẾT

### Bước 1: Mở Terminal tại thư mục dự án
* Trên Windows: Nhấp chuột phải tại thư mục `QUAN LY NHA HANG V4` ➔ Chọn **Open in Terminal** (PowerShell hoặc Command Prompt).
* Kiểm tra phiên bản Node.js đã cài:
  ```bash
  node -v
  npm -v
  ```

### Bước 2: Cài đặt các gói thư viện phụ thuộc (Dependencies)
Chạy lệnh sau để tải và cài đặt toàn bộ thư viện:
```bash
npm install
```
*Các gói phụ thuộc chính:*
- `express`: Web framework xử lý REST API.
- `better-sqlite3`: Driver SQLite tốc độ cao, hỗ trợ đồng bộ và transaction.
- `socket.io`: Thư viện truyền nhận sự kiện thời gian thực (Real-time WebSockets).
- `jsonwebtoken`: Sinh và xác thực JWT Bearer Token.
- `bcryptjs`: Băm và so khớp mật khẩu an toàn.
- `cors`: Cấu hình chia sẻ tài nguyên Cross-Origin Resource Sharing.
- `multer`: Xử lý tải tệp hình ảnh món ăn lên máy chủ.
- `qrcode`: Tiện ích tự động tạo mã QR Code chuẩn SVG / PNG Data URI.

### Bước 3: Khởi tạo Cơ sở Dữ liệu & Dữ liệu mẫu
Hệ thống được tích hợp cơ chế **tự động khởi tạo CSDL thông minh**:
* Khi bạn khởi động máy chủ lần đầu tiên qua `mayChu.js`, hàm `khoiTaoCoSoDuLieu()` sẽ tự động kiểm tra, khởi tạo toàn bộ 29 bảng và nạp sẵn dữ liệu thực đơn mẫu, tài khoản mẫu, ca làm việc và bàn ăn mẫu mà bạn **không cần thao tác gõ lệnh SQL thủ công**.

### Bước 4: Chạy bộ kiểm thử tự động (Verification Tests)
Trước khi đưa vào vận hành, bạn nên chạy toàn bộ 58 bài test tự động để đảm bảo 100% tính năng hoạt động hoàn hảo:
```bash
npm test
```
*Kết quả kỳ vọng:*
```text
ℹ tests 58
ℹ suites 0
ℹ pass 58
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

### Bước 5: Khởi động máy chủ ứng dụng
Chạy lệnh khởi động:
```bash
npm start
```
*Khi terminal hiển thị thông báo:*
```text
[INFO] Khởi tạo cơ sở dữ liệu thành công.
[INFO] Máy chủ Backend Quán Mộc đang chạy tại http://localhost:3001
[INFO] Môi trường: development
```
Hệ thống đã sẵn sàng phục vụ!

---

## 5. TRUY CẬP HỆ THỐNG & TÀI KHOẢN MẪU

Mở trình duyệt Web (Chrome / Edge / Safari) và truy cập:
👉 **`http://localhost:3001`**

Hệ thống cung cấp sẵn 4 tài khoản thử nghiệm tương ứng 4 vai trò nhân sự chuyên biệt:

| Tên đăng nhập | Mật khẩu | Vai trò | Màn hình làm việc chuyên trách |
|:---|:---:|:---:|:---|
| **`admin`** | `123456` | Quản lý | Toàn quyền quản trị, xem Dashboard báo cáo, cấu hình quán, quản lý nhân viên |
| **`thungan`** | `123456` | Thu ngân | Sơ đồ bàn POS, lập hóa đơn, áp voucher, in bill K80, thu tiền mặt/VietQR, Ca & Quỹ |
| **`daubep`** | `123456` | Đầu bếp | Màn hình Điều phối Bếp (KDS), chuông Web Audio, hàng đợi FIFO, gom món |
| **`phucvu`** | `123456` | Phục vụ | Sơ đồ bàn phục vụ, mở bàn, đổi/ghép bàn, xác nhận bưng món lên bàn, báo tính tiền |

*Khách hàng quét QR:*
Truy cập thử giao diện khách hàng tại bàn 1:
👉 `http://localhost:3001/#/menu?token=token_b01_tang1_2026`

---

## 6. HƯỚNG DẪN XỬ LÝ LỖI THƯỜNG GẶP (TROUBLESHOOTING)

### 🛑 Sự cố 1: Lỗi `Error: listen EADDRINUSE: address already in use :::3001`
* **Nguyên nhân:** Cổng 3001 đang bị chiếm bởi một tiến trình Node.js khác đang chạy ngầm trước đó.
* **Cách xử lý triệt để:**
  * **Trên Windows PowerShell:**
    ```powershell
    Stop-Process -Name node -Force
    npm start
    ```
  * **Trên Windows CMD:**
    ```cmd
    taskkill /F /IM node.exe
    npm start
    ```
  * **Trên Linux / macOS:**
    ```bash
    fuser -k 3001/tcp
    npm start
    ```

### 🛑 Sự cố 2: Khách hàng dùng điện thoại quét mã QR không kết nối được
* **Nguyên nhân:** Điện thoại đang truy cập vào địa chỉ `localhost:3001` (chỉ có hiệu lực trên chính chiếc máy tính chạy server).
* **Cách xử lý:**
  1. Đảm bảo máy tính và điện thoại cùng kết nối vào một mạng Wi-Fi của quán.
  2. Mở terminal trên máy tính gõ `ipconfig` (Windows) hoặc `ifconfig` (macOS/Linux) để xem địa chỉ IPv4 nội bộ (ví dụ: `192.168.1.15`).
  3. Mở trình duyệt trên điện thoại truy cập: `http://192.168.1.15:3001/#/menu?token=token_b01_tang1_2026`.
  4. Quản lý có thể vào mục `Mã QR` trên sơ đồ bàn để in lại mã chứa đúng IP mạng nội bộ.

### 🛑 Sự cố 3: Không nghe thấy chuông báo KDS trên màn hình bếp
* **Nguyên nhân:** Trình duyệt hiện đại (Chrome/Edge) chặn tính năng tự động phát âm thanh (Autoplay Audio) nếu người dùng chưa tương tác với trang.
* **Cách xử lý:** Đầu bếp chỉ cần nhấp chuột vào bất kỳ đâu trên màn hình KDS hoặc bấm nút "Bật âm thanh" một lần đầu tiên khi mở trang.

---

## 7. HƯỚNG DẪN TRIỂN KHAI PRODUCTION (VẬN HÀNH THỰC TẾ)

### 7.1. Chạy tiến trình nền liên tục với PM2
Để máy chủ tự động khởi động lại khi gặp sự cố hoặc khi máy tính khởi động lại:
```bash
# Cài đặt PM2 toàn cục
npm install -g pm2

# Khởi chạy ứng dụng với PM2
pm2 start backend/mayChu.js --name "quan-moc-pos"

# Cấu hình tự khởi động cùng hệ điều hành
pm2 startup
pm2 save
```

### 7.2. Cấu hình Nginx Reverse Proxy (Khuyến nghị cho tên miền & SSL HTTPS)
Mẫu cấu hình Nginx chuyển hướng cổng 80/443 về cổng 3001:
```nginx
server {
    listen 80;
    server_name pos.quanmoc.vn;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location /tepTaiLen {
        alias /var/www/quan-ly-nha-hang/tepTaiLen;
        expires 30d;
        access_log off;
    }
}
```

---
*Tài liệu Hướng dẫn Cài đặt & Triển khai được phê chuẩn và áp dụng cho toàn bộ dự án Quán Mộc POS.*
