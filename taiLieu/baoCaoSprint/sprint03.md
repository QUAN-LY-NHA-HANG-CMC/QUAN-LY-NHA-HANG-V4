# BÁO CÁO NGHIỆM THU SPRINT 3
**Dự án:** Hệ thống Quản lý Nhà hàng & Gọi món QR (Quán Mộc)
**Sprint:** Sprint 3 - Điều phối Bếp (KDS), Quản lý bàn phục vụ, Thu ngân và Thanh toán (US-079 đến US-110)
**Trạng thái:** HOÀN THÀNH (33/33 Test Cases passed, 100% đạt chuẩn)

---

## 1. Mục tiêu Sprint 3
- Xây dựng hệ thống cơ sở dữ liệu cho Khuyến mãi (`khuyen_mai`), Hóa đơn (`hoa_don`), Chi tiết dòng hóa đơn (`chi_tiet_hoa_don`), Giao dịch thanh toán (`giao_dich_thanh_toan`), Lịch sử chuyển ghép bàn (`lich_su_chuyen_ghep_ban`), và Phiếu hủy/trả món (`yeu_cau_huy_tra_mon`).
- Triển khai toàn diện hệ thống Màn hình Điều phối Bếp (Kitchen Display System - KDS) thời gian thực theo hàng đợi FIFO, cảnh báo đơn chờ lâu (>15 phút), chế độ gom nhóm món phục vụ nấu mẻ lớn (Batch Cooking), và cơ chế khóa hết món trực tiếp từ bếp.
- Xây dựng nghiệp vụ Sơ đồ bàn POS phục vụ nâng cao: Mở bàn trực tiếp tại quầy, Chuyển bàn (chuyển phiên sang bàn trống), Ghép bàn (gộp 2 phiên bàn có khách kèm tích lũy hóa đơn) sử dụng Database Transaction nguyên tử.
- Xây dựng phân hệ Khuyến mãi & Voucher giảm giá (theo tỷ lệ phần trăm hoặc số tiền cố định, kiểm soát điều kiện đơn tối thiểu và giới hạn lượt dùng).
- Triển khai nghiệp vụ Hóa đơn thanh toán & POS Thu ngân: Lập bảng kê tạm tính, tự động tính thuế VAT 10%, in phiếu tính tiền K80, thanh toán tiền mặt kèm tính tiền thối lại tự động, và tích hợp mã Napas VietQR động theo phiên bàn và số tiền chính xác.
- Tự động đóng phiên phục vụ và giải phóng bàn về trạng thái Trống (`trong`) sau khi thanh toán thành công, đồng bộ WebSockets tức thì tới toàn hệ thống.
- Hoàn thành đầy đủ 32 User Story (US-079 đến US-110).

---

## 2. Kết quả thực hiện chi tiết theo User Story

### Nhóm 1: Điều phối Bếp (KDS - Kitchen Display System) (US-079 -> US-088)
- **US-079 & US-080:** Màn hình KDS (`#/bep` hoặc `#/kds`) hiển thị danh sách đơn món theo thứ tự thời gian gọi vào bếp (FIFO).
- **US-081:** Thẻ món tự động tính số phút chờ (`so_phut_cho`); nếu chờ quá 15 phút, thẻ tự động kích hoạt viền cảnh báo nhấp nháy đỏ (`canh_bao_qua_gio = true`).
- **US-082 & US-083:** Bếp trưởng chuyển trạng thái món sang "Đang nấu" (`dang_che_bien`) và "Xong món" (`hoan_thanh`) chỉ với 1 chạm. Hệ thống tự động bắn socket `mon_san_sang` cho nhân viên phục vụ bưng món lên bàn.
- **US-084:** Tab "Gom nhóm món" (Batch Cooking) tự động gộp tất cả các đơn có cùng món ăn, hiển thị tổng số lượng đĩa cần ra và số bàn đang chờ để đầu bếp nấu 1 mẻ tối ưu thời gian.
- **US-085:** Nút "Báo hết món" từ bếp kích hoạt API `PUT /api/kds/toggle-het-mon/:id`, lập tức đồng bộ trạng thái `tam_het` lên toàn bộ menu QR của khách hàng qua Socket.IO.
- **US-086 & US-087:** Chức năng từ chối món ăn (`POST /api/kds/tu-choi/:id`) với lý do hết nguyên liệu, tự động trừ tiền trong đơn và phiên bàn của khách, ghi nhật ký kiểm toán.
- **US-088:** Tab "Món đã nấu xong" hiển thị lịch sử 50 món ra lò gần nhất kèm mốc thời gian hoàn thành.

### Nhóm 2: Sơ đồ bàn & Vận hành POS (Chuyển/Ghép bàn) (US-089 -> US-098)
- **US-089 & US-090:** Sơ đồ bàn POS (`#/so-do-ban`) hiển thị trực quan theo thời gian thực: màu sắc trạng thái bàn, số phút ngồi của khách, và tổng tiền tạm tính.
- **US-091:** Bộ đếm tiến độ chế biến chi tiết ngay trên từng thẻ bàn: số món đang chờ, số món đang nấu, số món sẵn sàng và số món đã dọn lên bàn.
- **US-092:** Nút "Mở bàn trực tiếp" (`POST /api/phien-ban/mo-ban-truc-tiep`) cho phép nhân viên tiếp nhận khách vãng lai không dùng mã QR, nhập số lượng khách và ghi chú phục vụ.
- **US-093 & US-094:** Tính năng "Chuyển bàn" (`POST /api/phien-ban/chuyen-ban`) thực hiện trong một Transaction nguyên tử: kiểm tra bàn đích phải đang Trống, chuyển toàn bộ đơn sang bàn đích, giải phóng bàn gốc về `trong`, chuyển bàn đích thành `dang_dung`, và ghi log vào `lich_su_chuyen_ghep_ban`.
- **US-095 & US-096:** Tính năng "Ghép bàn" (`POST /api/phien-ban/ghep-ban`): gộp toàn bộ đơn gọi món của 2 bàn đang mở, cộng dồn tổng tiền tạm tính và số khách, đóng phiên bàn nguồn, giải phóng bàn nguồn về `trong`, và ghi log ghép bàn đầy đủ.
- **US-097:** Nút xác nhận phục vụ (`PUT /api/don-goi-mon/da-phuc-vu/:chiTietId`) giúp nhân viên dọn bàn đánh dấu món đã mang ra bàn ăn.
- **US-098:** Kết nối WebSockets tự động làm mới sơ đồ bàn khi có bất kỳ sự kiện mở bàn, chuyển bàn, ghép bàn hoặc thanh toán nào.

### Nhóm 3: Khuyến mãi, Hóa đơn & Thanh toán VietQR (US-099 -> US-110)
- **US-099 & US-100:** CSDL và API quản lý khuyến mãi (`/api/khuyen-mai`), hỗ trợ giảm giá theo % hoặc tiền mặt, kiểm tra đơn tối thiểu, mức giảm tối đa và hạn dùng.
- **US-101:** Bảng kê hóa đơn tạm tính (`GET /api/hoa-don/tam-tinh/:phienBanId`) tổng hợp toàn bộ các đợt gọi món của bàn, tự động tính tổng tiền món, khấu trừ tiền món hủy, tính tiền giảm giá và thuế VAT 10%.
- **US-102:** Giao diện POS Thu ngân (`#/thanh-toan?phienBanId=...`) bố cục 2 cột chuyên nghiệp, cho phép nhập mã khuyến mãi xem trước số tiền được trừ.
- **US-103:** Tính năng in phiếu tính tiền K80 (`@media print`) tối ưu cho các dòng máy in nhiệt quầy thu ngân.
- **US-104 & US-105:** Chế độ thanh toán Tiền mặt với ô nhập số tiền khách đưa, gợi ý các mệnh giá nhanh (100k, 200k, 500k) và tính toán tiền thối lại ngay lập tức.
- **US-106 & US-107:** Chế độ thanh toán Chuyển khoản VietQR: API `POST /api/thanh-toan/vietqr` tạo mã Napas VietQR động theo chuẩn ngân hàng, nhúng sẵn số tiền chính xác và nội dung chuyển khoản theo mã phiên.
- **US-108 & US-109:** API `POST /api/thanh-toan/xac-nhan` hoàn tất thanh toán trong 1 Database Transaction nguyên tử: lưu `hoa_don`, `chi_tiet_hoa_don`, `giao_dich_thanh_toan`, tăng lượt dùng mã khuyến mãi, đóng phiên bàn (`da_thanh_toan`) và giải phóng bàn về `trong`.
- **US-110:** Bắn socket thông báo thanh toán thành công tới toàn hệ thống, tự động điều hướng thu ngân về lại màn hình sơ đồ bàn.

---

## 3. Thống kê Kiểm thử Tự động (Automated Test Suite)
- **Tổng số ca kiểm thử toàn hệ thống:** 33/33 ca kiểm thử PASS (100%).
- **Thời gian chạy toàn bộ test:** ~6.8 giây.
- **Phân loại kiểm thử Sprint 3:**
  - `kiemThu/api/coSoDuLieuSprint3.test.js`: 3 ca test (Bảng CSDL Sprint 3, Transaction chuyển bàn, Transaction thanh toán đóng phiên).
  - `kiemThu/api/kdsBep.test.js`: 2 ca test (Hàng đợi KDS FIFO, gom nhóm món, chuyển trạng thái nấu, kiểm soát hết món).
  - `kiemThu/api/chuyenGhepBan.test.js`: 3 ca test (Sơ đồ bàn chi tiết, mở bàn trực tiếp, chuyển bàn & ghép bàn atomic transaction, đánh dấu món đã phục vụ).
  - `kiemThu/api/hoaDonThanhToan.test.js`: 3 ca test (Kiểm tra mã khuyến mãi, bảng kê tạm tính & VAT, tạo VietQR & thanh toán tiền mặt).

---

## 4. Phân công đóng gói bàn giao nhóm
- **Nhật (PM / Backend Core):** Trực tiếp commit & push lên GitHub remote qua branch `feature/sprint3-kds-table-operations`.
- **Phát (Database Specialist):** Đóng gói `Phat_Database_Sprint3.zip` kèm `HUONG_DAN_PHAT.md`.
- **Minh (Backend Developer):** Đóng gói `Minh_Backend_NghiepVu_Sprint3.zip` kèm `HUONG_DAN_MINH.md`.
- **Phong (Frontend Admin & Real-time):** Đóng gói `Phong_Frontend_AdminCore_Sprint3.zip` kèm `HUONG_DAN_PHONG.md`.
- **Quân (Frontend POS & Table Ops):** Đóng gói `Quan_Frontend_BanMenu_Sprint3.zip` kèm `HUONG_DAN_QUAN.md`.
