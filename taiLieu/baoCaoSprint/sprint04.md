# BÁO CÁO NGHIỆM THU SPRINT 4
## DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR (QUANMOC.COM)

**Giai đoạn:** Sprint 4 - Báo cáo Doanh thu, Đánh giá Khách hàng, Ca làm việc và Hoàn thiện hệ thống  
**Thời gian thực hiện:** Tuần 4  
**Phạm vi User Story:** US-111 đến US-140 (Hoàn tất 140/140 User Story toàn dự án)  
**Tỷ lệ kiểm thử tự động:** **51 / 51 tests passed (100%)**

---

### I. PHÂN CÔNG & KẾT QUẢ ĐÓNG GÓP CỦA CÁC THÀNH VIÊN

#### 1. Nhật (PM / Backend Core Architect - `longnhatdinhviet8-byte`) - Issue #19
- **Trách nhiệm:**
  - Xây dựng phân hệ API Thống kê & Analytics Dashboard:
    - `/api/thong-ke/tong-quan`: Chỉ số doanh thu hôm nay, số hóa đơn, số khách ngồi, giá trị trung bình/đơn và tỷ lệ tăng trưởng.
    - `/api/thong-ke/doanh-thu`: Biểu đồ doanh thu linh hoạt theo chu kỳ ngày (7 ngày), tuần (8 tuần), tháng (12 tháng).
    - `/api/thong-ke/phuong-thuc`: Thống kê tỷ trọng thanh toán Tiền mặt vs Chuyển khoản VietQR.
    - `/api/thong-ke/top-mon`: Top 5 món bán chạy nhất và top món bán chậm cần thúc đẩy bán.
    - `/api/thong-ke/khung-gio`: Phân bố lượng khách theo 24 khung giờ cao điểm (giờ vàng trưa 11h-13h, tối 18h-21h).
    - `/api/thong-ke/huy-mon`: Thống kê sản lượng và nguyên nhân hủy món.
  - Tích hợp cơ chế tự động kết nối lại (`Auto-reconnect`) cho WebSockets phía Client.
  - Thiết lập phân quyền truy cập nghiêm ngặt: Chỉ Quản lý mới được phép xem báo cáo kinh doanh.

#### 2. Minh (Backend Developer - `nguyensyminhmedia`) - Issue #20
- **Trách nhiệm:**
  - Xây dựng API Đánh giá & Phản hồi Khách hàng (`/api/danh-gia`): Cho phép khách chấm điểm sao 1-5 sao, viết nhận xét; Quản lý duyệt và gửi phản hồi giải trình.
  - Xây dựng API Quản lý Ca làm việc & Phiên thu ngân (`/api/ca-lam-viec`):
    - Mở ca ghi nhận tiền mặt đầu ca (`/mo-ca`).
    - Lập phiếu thu và phiếu chi tiền mặt phát sinh trong ca (`/phieu-thu-chi`).
    - Kết ca đối soát quỹ (`/ket-ca`): Hệ thống tự tính doanh thu tiền mặt, chênh lệch thực tế kiểm đếm và lưu biên bản giao ca.
  - Xây dựng API Xuất báo cáo CSV chuẩn quốc tế UTF-8 BOM (`\uFEFF`) để Excel hiển thị tiếng Việt có dấu chuẩn xác (`/api/xuat-bao-cao/doanh-thu-csv`, `/hoa-don-csv`).

#### 3. Phát (Database Specialist - `ledangphat`) - Issue #18
- **Trách nhiệm:**
  - Thiết kế và triển khai CSDL Sprint 4 (`database/migrationSprint4.sql`):
    - Bảng `danh_gia`: Lưu trữ đánh giá của khách kèm ràng buộc `so_sao >= 1 AND so_sao <= 5`.
    - Bảng `ca_lam_viec`: Định nghĩa ca làm việc chuẩn (Ca sáng, Ca chiều, Ca tối).
    - Bảng `phien_ca_thu_ngan`: Lưu phiên làm việc của từng thu ngân, tiền đầu ca, tiền hệ thống tính và tiền thực tế.
    - Bảng `phieu_thu_chi`: Quản lý dòng tiền mặt ra vào đột xuất trong ca.
  - Thiết lập các chỉ mục Aggregation (`idx_hoa_don_thoi_gian_tao`, `idx_danh_gia_so_sao`, `idx_phien_ca_nhan_vien`) giúp các truy vấn báo cáo xử lý siêu tốc.

#### 4. Phong (Frontend Developer - `phong31-lag`) - Issue #21
- **Trách nhiệm:**
  - Xây dựng giao diện Quản lý Ca làm việc & Đối soát quỹ (`frontend/trang/caLamViec/caLamViec.js`):
    - Thẻ trạng thái ca trực quan, hiển thị tiền đầu ca, thu phát sinh, chi phát sinh.
    - Modal mở ca, modal lập phiếu thu chi và modal kết ca đối soát tiền mặt.
    - Bảng lịch sử bàn giao ca giúp chủ quán tra cứu minh bạch.
  - Xây dựng Dashboard Analytics Doanh thu (`frontend/trang/thongKe/thongKe.js`):
    - 4 thẻ KPI chỉ số quan trọng trong ngày.
    - Biểu đồ cột Doanh thu (Canvas trực quan, responsive mượt mà).
    - Biểu đồ tròn Doughnut tỷ trọng tiền mặt vs VietQR.
    - Bảng xếp hạng Top món bán chạy và biểu đồ khung giờ cao điểm.
    - Tích hợp 2 nút tải file báo cáo CSV 1 chạm.

#### 5. Quân (Frontend Developer - `nguyensyminhmedia` / `nguyenchiquan417-ui`) - Issue #22
- **Trách nhiệm:**
  - Xây dựng giao diện Đánh giá bữa ăn trên E-Menu khách hàng (`frontend/trang/theoDoiDonMon/theoDoiDonMon.js`): Modal chấm sao tương tác, lời nhắn nhận xét.
  - Xây dựng trang Quản trị Đánh giá & Feedback phía Admin (`frontend/trang/danhGia/danhGia.js`): Hiển thị điểm sao trung bình, bộ lọc đánh giá 1-2 sao cần xử lý gấp, form gửi phản hồi khách hàng.
  - Tối ưu hóa UI/UX Responsive trên điện thoại, khắc phục triệt để tình trạng treo màn hình khi thiếu kết nối trong `thucDonQr.js`.

---

### II. BẢNG TỔNG HỢP KIỂM THỬ TOÀN DIỆN (51/51 PASSED)

| STT | Tên tệp kiểm thử | Hạng mục kiểm tra | Số test cases | Kết quả |
|:---:|:---|:---|:---:|:---:|
| 1 | `coSoDuLieuSprint4.test.js` | Bảng CSDL Sprint 4, Ràng buộc số sao & Chỉ mục aggregation | 4 | **Passed** |
| 2 | `thongKeDoanhThu.test.js` | API Thống kê tổng quan, chu kỳ, tỷ trọng, top món, khung giờ, phân quyền | 7 | **Passed** |
| 3 | `caLamViecDanhGia.test.js` | API Đánh giá, Mở ca, Thu chi, Kết ca đối soát lệch quỹ, Xuất CSV UTF-8 | 7 | **Passed** |
| 4 | `coSoDuLieuSprint3.test.js` | Bảng CSDL Sprint 3, Transaction chuyển/ghép bàn & thanh toán | 3 | **Passed** |
| 5 | `kdsBep.test.js` | Hàng đợi KDS FIFO, gom món, chuyển trạng thái & kiểm soát hết món | 2 | **Passed** |
| 6 | `chuyenGhepBan.test.js` | Vận hành sơ đồ bàn, mở bàn, chuyển bàn & ghép bàn nguyên tử | 3 | **Passed** |
| 7 | `hoaDonThanhToan.test.js` | Khuyến mãi mã giảm giá, tính VAT 10%, Napas VietQR & thanh toán | 3 | **Passed** |
| 8 | `coSoDuLieuSprint2.test.js` | Bảng CSDL Sprint 2 & Transaction đặt món | 2 | **Passed** |
| 9 | `datMonRealtime.test.js` | Xác thực QR bàn ăn, khởi tạo phiên & đặt món thời gian thực | 2 | **Passed** |
| 10 | `gioHangHoTro.test.js` | Chống gian lận giá, giỏ hàng phiên bàn & gửi yêu cầu hỗ trợ | 3 | **Passed** |
| 11 | `socketRealtime.test.js` | Room Socket khách - bếp - thu ngân & phân quyền sự kiện | 4 | **Passed** |
| 12 | `frontend.test.js` | Cấu trúc tệp frontend, SPA routes & template toàn dự án | 1 | **Passed** |
| 13 | `coSoDuLieu.test.js` | Khởi tạo CSDL gốc và truy vấn dữ liệu mẫu | 1 | **Passed** |
| 14 | `xacThuc.test.js` | Xác thực JWT, Bcrypt hash, đổi mật khẩu & middleware RBAC | 3 | **Passed** |
| 15 | `banAnKhuVuc.test.js` | Tiện ích QR Code, CRUD Khu vực và Bàn ăn | 2 | **Passed** |
| 16 | `thucDonDanhMuc.test.js` | CRUD Danh mục & Món ăn (phân trang, upload, toggle) | 2 | **Passed** |
| 17 | `cauHinhNhatKy.test.js` | Cấu hình nhà hàng, VAT, System Logs & Express Server | 2 | **Passed** |
| **Tổng** | **17 tệp kiểm thử** | **Bao phủ 140/140 User Story từ Sprint 1 đến Sprint 4** | **51** | **100% Passed** |

---

### III. KẾT LUẬN & NGHIỆM THU
Hệ thống Quản lý Nhà hàng & Gọi món QR (Quán Mộc POS) đã hoàn thành toàn diện 4 Sprint phát triển:
1. Nền tảng phân quyền, sơ đồ bàn và thực đơn (Sprint 1)
2. E-Menu QR di động, giỏ hàng & đồng bộ Socket.io thời gian thực (Sprint 2)
3. Điều phối Bếp (KDS), vận hành bàn & thanh toán VietQR động (Sprint 3)
4. Báo cáo doanh thu, đánh giá khách hàng, ca làm việc & xuất CSV (Sprint 4)

Dự án đạt chất lượng kỹ thuật cao, dữ liệu nhất quán tuyệt đối nhờ SQLite Transactions và sẵn sàng 100% cho buổi bảo vệ đồ án!
