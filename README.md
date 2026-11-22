# HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)

[![Node.js Version](https://img.shields.io/badge/Node.js-22%20LTS-brightgreen.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20(WAL%20Mode)-blue.svg)](https://sqlite.org/)
[![UI Design](https://img.shields.io/badge/Design-100%25%20Figma%20Fidelity-orange.svg)](https://www.figma.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Test%20Suite-23%2F23%20Passing-success.svg)](./backend/kiemThuBackend.js)

Hệ thống quản lý nhà hàng F&B toàn diện chuẩn hóa theo thiết kế Figma 60 màn hình, hỗ trợ quy trình vận hành khép kín thời gian thực qua WebSockets (Socket.IO) và thanh toán VietQR động chuẩn Napas 247.

---

## 🌟 5 PHÂN HỆ NGHIỆP VỤ CHÍNH

1. **Khách hàng E-Menu (C01 - C14)**: Quét mã QR tại bàn, xem thực đơn phân loại, giỏ hàng chung, đặt món, theo dõi tiến độ bếp realtime, yêu cầu thanh toán & chia tiền nhóm, đánh giá dịch vụ.
2. **Nhân viên Phục vụ (W01 - W11)**: Bản đồ sơ đồ bàn trực quan theo trạng thái màu sắc, duyệt đơn gọi món QR của khách, đặt món hộ, chuyển/gộp bàn, nộp phiếu xin đổi ca.
3. **Bếp thông minh KDS (K01 - K06)**: Hàng đợi món thời gian thực, **chế độ gom mẻ món giống nhau (Batching)** tối ưu năng suất đầu bếp, cập nhật trạng thái nấu (`dang_nau`, `hoan_thanh`, `da_phuc_vu`).
4. **Thu ngân POS Desktop (P01 - P09)**: Kiểm bill bàn, áp dụng chiết khấu/khuyến mãi, thuế VAT 8%, in hóa đơn nhiệt khổ K80 (80mm), đối soát VietQR / tiền mặt.
5. **Quản trị Nhà hàng Admin (A01 - A20)**: Dashboard doanh thu, giờ cao điểm, quản trị nhân sự & phân ca, duyệt nghỉ/đổi ca, nhật ký kiểm toán (Audit Log) bảo mật.

---

## Chạy thử và vận hành

### Môi trường phát triển

Dùng Node.js 22.13 trở lên. Cài thư viện và chạy kiểm thử bằng các lệnh sau.

```bash
npm ci
npm ci --prefix frontend
npm test
```

Kiểm thử tích hợp tự tạo SQLite tạm với dữ liệu mẫu. Khi làm việc với giao diện, mở hai terminal để chạy `npm run dev:backend` và `npm run dev:frontend`. Lệnh `npm run seed-db` nạp lại dữ liệu mẫu và xóa dữ liệu cũ tại đường dẫn SQLite mẫu. Chỉ dùng lệnh đó với môi trường phát triển đã xác định rõ dữ liệu có thể xóa.

### Chuẩn bị triển khai

- Bản triển khai dùng một tiến trình backend và một tệp SQLite trên ổ cục bộ có lưu trữ lâu dài. Đặt `NODE_ENV=production`, `JWT_SECRET` ngẫu nhiên riêng từ 32 ký tự và `DB_PATH` trỏ đến tệp dữ liệu đã chọn.
- SQLite tự khởi tạo schema hoặc bổ sung cột thiếu khi khởi động. Khi chuyển một CSDL đang vận hành, sao lưu trước rồi thử nâng cấp trên bản sao. `npm run backup-db` dùng đường dẫn `DB_PATH` và tạo ảnh chụp nhất quán bằng SQLite.
- Với cơ sở dữ liệu mới, đặt ba biến bí mật `MOC_ADMIN_USERNAME`, `MOC_ADMIN_PASSWORD`, `MOC_ADMIN_PHONE` rồi chạy `npm run init-admin` một lần. Gỡ biến mật khẩu khỏi môi trường sau khi tạo thành công. Cấu hình nhân viên, bàn, thực đơn và tài khoản VietQR thực tế trong trang quản trị.
- Build bằng `npm run setup:prod` rồi chạy `npm start`. Đặt reverse proxy HTTPS trước backend, chuyển tiếp cả `/api/` và kết nối Socket.IO. In lại mã QR từ URL HTTPS thực tế.
- VietQR dùng đối soát thủ công. Thu ngân xác nhận sau khi thấy giao dịch thực tế và đúng nội dung chuyển khoản.

### Docker Compose

Đặt `JWT_SECRET` trong môi trường Compose. `MOC_DATA_DIR` mặc định là `./data-production`, chứa SQLite và thư mục sao lưu. Cổng backend được bind vào loopback để reverse proxy trên máy chủ phục vụ HTTPS.

```bash
docker compose build
docker compose run --rm -e MOC_ADMIN_USERNAME -e MOC_ADMIN_PASSWORD -e MOC_ADMIN_PHONE quan-moc-pos npm run init-admin
docker compose up -d
```

Kiểm tra `http://127.0.0.1:3001/api/kiem-tra-suc-khoe` trên máy chủ. Chạy `docker compose down` để dừng ứng dụng.

---

## Tài khoản dữ liệu mẫu cho môi trường phát triển (mật khẩu `123456`)

| Phân hệ | Tên đăng nhập | Vai trò | Chức năng chính |
|---|---|---|---|
| **Quản trị Admin** | `admin` | `quan_ly` | Toàn quyền cấu hình, nhân sự, doanh thu, audit log |
| **Thu ngân POS** | `thungan` (hoặc `thungan01`) | `thu_ngan` | Kiểm bill, thanh toán VietQR, in bill K80, chia tiền |
| **Bếp KDS** | `bep` (hoặc `bep01`) | `bep` | Nhận món, gom mẻ, đổi trạng thái nấu |
| **Phục vụ bàn** | `phucvu` (hoặc `phucvu01`) | `phuc_vu` | Xem sơ đồ bàn, duyệt đơn QR, đổi bàn, nộp đổi ca |

---

## 🧪 BỘ KIỂM THỬ TỰ ĐỘNG (CI/CD TEST SUITE)

Chạy truy vấn kiểm tra SQLite, 13 nhóm kiểm thử tích hợp backend và build frontend.
```bash
npm test
```
