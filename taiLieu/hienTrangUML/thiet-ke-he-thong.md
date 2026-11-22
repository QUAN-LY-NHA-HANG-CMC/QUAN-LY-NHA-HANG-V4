# Thiết kế hệ thống Quán Mộc POS & E-Menu theo hiện trạng

**Ngày rà soát** 22/11/2026 · **Đối tượng** nhóm phát triển và người chấm báo cáo

Hệ thống dùng React cho giao diện khách và nhân viên, Express cho API, Socket.IO cho cập nhật và SQLite cho dữ liệu. Luồng gọi món QR, duyệt đơn, chế biến, xác nhận thu tiền và đánh giá đã có đường nối giao diện–API trong mã. Thu ngân xác nhận giao dịch VietQR sau khi kiểm tra tiền thực nhận. POS đóng phiên khi hóa đơn hiện hành của phiên được xác nhận thành công.

## 1. Phạm vi và kiến trúc

| Thành phần | Trách nhiệm và căn cứ |
|---|---|
| React / Vite | E-Menu, sảnh, KDS, POS và quản lý. Điều phối màn hình và tải dữ liệu theo vai trò. [Điều hướng](../../frontend/src/dinhTuyen/DinhTuyenUngDung.jsx) |
| Express / Node.js | Gắn router cho tài khoản, bàn, thực đơn, đơn món, điều phối bếp, hóa đơn, ca làm việc, hệ thống và báo cáo. [Khởi tạo Express](../../backend/ungDung.js) |
| Xác thực và quyền | Nhân viên dùng JWT và middleware vai trò. Các đường dành cho khách kiểm tra ngữ cảnh bàn. Middleware vào ca áp dụng cho phục vụ và thu ngân tại những route có gắn middleware. [Middleware](../../backend/middleware) |
| Socket.IO | Phát cập nhật đơn, món, bàn, thanh toán và điều phối. Mỗi giao diện đăng ký sự kiện theo chức năng của nó. [Cấu hình Socket](../../backend/cauHinh/cauHinhSocket.js) |
| SQLite | API truy vấn qua `node:sqlite`. Backend bật khóa ngoại, dùng journal mode `DELETE`, thực thi DDL và bổ sung các cột còn thiếu lúc mở DB. [Kết nối DB](../../backend/cauHinh/ketNoiCoSoDuLieu.js) |
| Docker Compose | Một container Node.js phục vụ API và SPA đã build. Cấu hình phát cổng `127.0.0.1:3001` trên host và gắn dữ liệu vào `/app/data`. Đây là cấu hình trong repo. [Dockerfile](../../Dockerfile) · [Compose](../../docker-compose.yml) |

## 2. Tác nhân và truy vết ca sử dụng

Mã UC dưới đây định danh các nhóm mục tiêu trong bộ sơ đồ mới. Mỗi hàng chỉ ra điểm vào chính để kiểm lại chức năng. Kịch bản chi tiết dùng các mã này trong phần đặc tả.

| Mã | Mục tiêu và tác nhân chính | Điểm vào, nguồn xác minh |
|---|---|---|
| UC01 | Khách xem thực đơn, sửa giỏ dùng chung và gửi đơn QR | `/api/thuc-don`, `/api/ban-an/:id/gio-mon`, `POST /api/don-goi-mon`. [Điều hướng](../../frontend/src/dinhTuyen/DinhTuyenUngDung.jsx) · [Service đơn](../../backend/modules/donGoiMon/donGoiMon.service.js) |
| UC02 | Khách xem tiến độ, gửi yêu cầu phục vụ hoặc tính tiền | API đơn theo bàn và API hỗ trợ theo bàn. [Theo dõi món](../../frontend/src/trang/theoDoiDonMon/TrangTheoDoiMon.jsx) · [Route bàn](../../backend/modules/banAn/banAn.routes.js) |
| UC03 | Phục vụ hoặc thu ngân duyệt/từ chối đơn QR | `PUT /api/don-goi-mon/:id/duyet` và `/:id/tu-choi`. Giao diện sơ đồ bàn có thao tác. [Sơ đồ bàn](../../frontend/src/trang/soDoBan/TrangSoDoBan.jsx) · [Route đơn](../../backend/modules/donGoiMon/donGoiMon.routes.js) |
| UC04 | Nhân viên mở/chuyển/gộp bàn và đặt hộ | Route bàn và tạo đơn với nguồn `phuc_vu_dat_ho`. Quyền theo từng thao tác. [Chi tiết bàn](../../frontend/src/trang/soDoBan/TrangChiTietBan.jsx) · [Service bàn](../../backend/modules/banAn/banAn.service.js) |
| UC05 | Bếp chế biến, phục vụ xác nhận bưng món | Hàng đợi KDS và `PUT /api/dieu-phoi-bep/chi-tiet/:id/trang-thai`. [KDS](../../frontend/src/trang/dieuPhoiBep/TrangKdsBep.jsx) · [Service KDS](../../backend/modules/dieuPhoiBep/dieuPhoiBep.service.js) |
| UC06 | Phục vụ/thu ngân đề nghị hủy món. Quản lý quyết định khi cần | `POST /api/don-goi-mon/huy-mon` và `PUT /api/don-goi-mon/yeu-cau-huy-mon/:id/phe-duyet`. [Route đơn](../../backend/modules/donGoiMon/donGoiMon.routes.js) · [Quản lý duyệt hủy](../../frontend/src/trang/quanTri/TrangDuyetHuyMonAdmin.jsx) |
| UC07 | Thu ngân hoặc quản lý lập bill và xác nhận thu tiền | Xem tạm tính, lập hóa đơn, xác nhận thu tiền mặt hoặc VietQR. [POS](../../frontend/src/trang/thanhToan/TrangPosKiemBill.jsx) · [Route hóa đơn](../../backend/modules/hoaDon/hoaDon.routes.js) |
| UC08 | Thu ngân chọn chia đều số tiền của một bill | `POST /api/hoa-don/:id/chia-tien` từ POS. [Service hóa đơn](../../backend/modules/hoaDon/hoaDon.service.js) |
| UC09 | Khách xem hóa đơn/VietQR và gửi đánh giá sau thanh toán | API hóa đơn theo bàn và API đánh giá, sử dụng token bàn và bill token theo từng thao tác. [Route hóa đơn](../../backend/modules/hoaDon/hoaDon.routes.js) · [Điều hướng khách](../../frontend/src/dinhTuyen/DinhTuyenUngDung.jsx) |
| UC10 | Nhân viên gửi, quản lý xử lý yêu cầu đổi/nghỉ ca | API `yeu-cau-doi-ca` và `/:id/phe-duyet`. [Route ca](../../backend/modules/caLamViec/caLamViec.routes.js) · [Model ca](../../backend/modules/caLamViec/caLamViec.model.js) |
| UC11 | Quản lý dữ liệu và báo cáo | Nhân sự, thực đơn, phòng bàn, ca, cấu hình, nhật ký, báo cáo và CSV. Route báo cáo cho phép cả thu ngân. [Các module](../../backend/modules) |

## 3. Đặc tả các luồng nghiệp vụ chính

### UC01 Gửi đơn QR

- **Tiền điều kiện**. Khách có ngữ cảnh bàn hợp lệ và danh sách món có thể gửi.
- **Luồng chính**. Khách chọn món. Giao diện đồng bộ giỏ qua API bàn và gửi đơn kèm khóa gửi. Service kiểm tra ngữ cảnh, món và số suất. Giao dịch tạo hoặc dùng lại phiên, ghi đơn và chi tiết, cập nhật số suất. Đơn QR có thể chờ duyệt hoặc tự duyệt theo cấu hình bàn.
- **Luồng thay thế**. Khóa gửi đã được ghi có thể trả về đơn cũ. Bàn cần dọn, món không hợp lệ hoặc hết suất làm lần gửi bị từ chối. Phục vụ hoặc thu ngân từ chối đơn chờ duyệt thì cập nhật đơn, hủy chi tiết và hoàn suất.
- **Hậu điều kiện**. Đơn và chi tiết có trạng thái tương ứng. Bếp chỉ nhận món thuộc đơn đã duyệt.

### UC05 và UC06 Chế biến, phục vụ và hủy món

- **Tiền điều kiện**. Phiên còn hoạt động. Ca sử dụng chế biến yêu cầu đơn đã duyệt và món ở bước phù hợp.
- **Luồng chính**. Bếp nhận hàng đợi và chuyển món lần lượt từ `cho_duyet` sang `dang_nau` rồi `hoan_thanh`. Phục vụ xác nhận bưng để chuyển sang `da_phuc_vu`. Service kiểm tra bước kế tiếp.
- **Luồng thay thế**. Món còn chờ có thể hủy ngay và hoàn suất. Món đang nấu, đã hoàn thành hoặc đã phục vụ chuyển sang `yeu_cau_huy`. Quản lý đồng ý thì món chuyển `da_huy`. Quản lý từ chối thì hệ thống khôi phục trạng thái món đã lưu trên phiếu.
- **Hậu điều kiện**. Tiến độ món và kết quả xử lý hủy được ghi dữ liệu. Trạng thái `cho_duyet` của **chi tiết món** còn có nghĩa là chờ nấu khi **đơn** đã duyệt.

### UC07 và UC08 Thu tiền và chia đều

- **Tiền điều kiện**. Nhân viên có quyền lập/xác nhận hóa đơn. Phiên đang hoạt động và có món hợp lệ để lập hóa đơn.
- **Luồng chính**. POS đọc tạm tính từ backend. Backend áp chiết khấu, VAT theo cấu hình và lập hoặc dùng lại bill hiện hành. Thu ngân nhận tiền mặt hoặc kiểm tra khoản VietQR thực nhận, sau đó xác nhận trên POS. Backend kiểm tra hóa đơn, phiên, danh sách món và các yêu cầu chờ. Một giao dịch DB cập nhật hóa đơn thành `da_thanh_toan`, phiên thành `da_dong`, bàn thành `can_don_dep` và ghi giao dịch tài chính nếu tổng thu dương.
- **Luồng thay thế**. Tiền mặt thiếu, hóa đơn đã xử lý, phiên hoặc danh sách món thay đổi, đơn chờ duyệt hoặc món chờ xử lý hủy làm lần xác nhận thất bại. Thu ngân có thể chọn chia đều một bill trước khi thu. Việc này tạo thông tin chia tiền. Lần xác nhận thu vẫn chốt toàn bill.
- **Hậu điều kiện**. Giao diện khách có thể đọc kết quả thanh toán. In qua hộp thoại trình duyệt và dọn bàn là thao tác tác nghiệp riêng.

### UC09 Xem hóa đơn và đánh giá

Khách tải hóa đơn theo bàn. API cấp bill token gắn với hóa đơn và bàn. Giao diện đọc lại theo chu kỳ. Khi đã có xác nhận thanh toán, khách gửi đánh giá bằng token phù hợp. API kiểm tra dữ liệu đánh giá và trả lại bản ghi đã có nếu phiên đã được đánh giá. URL ảnh VietQR đến từ service hóa đơn. Trạng thái đã thu lấy từ hóa đơn của hệ thống.

### UC10 Đổi hoặc nghỉ ca

Nhân viên chọn ca và gửi phiếu. Quản lý xem danh sách và chọn duyệt hoặc từ chối. Khi duyệt, backend kiểm tra phiếu còn chờ và ca liên quan vẫn theo kế hoạch của người gửi. Model xử lý thay đổi phiếu và ca trong giao dịch. Service thông báo kết quả qua Socket.IO.

## 4. Mô hình dữ liệu

ERD bao phủ **28 bảng, 43 khóa ngoại**. Cột bắt buộc có dấu `*`, khóa chính ghi `PK`, khóa ngoại ghi `FK`, và cột unique đơn ghi `UQ`. Bội số lấy từ khả năng null và ràng buộc unique của khóa ngoại. Một đơn có thể có `0..*` chi tiết xét theo riêng ràng buộc FK SQL, còn API tạo đơn yêu cầu có món. Hóa đơn gốc có thể có `0..1` hóa đơn cha. Sự tồn tại của FK này phản ánh khả năng lưu dữ liệu của schema.

ERD dùng schema chuẩn trong DDL. Khi mở một DB đã tồn tại, backend bổ sung các cột còn thiếu trước khi tạo chỉ mục. Chỉ mục unique có điều kiện trên `don_goi_mon.khoa_gui` áp dụng khi khóa gửi khác NULL. Các liên kết nghiệp vụ qua cột ID chưa khai báo FK được mô tả trong đặc tả luồng. [DDL](../../database/taoBang.sql) · [Migration](../../backend/cauHinh/ketNoiCoSoDuLieu.js)

## 5. Sơ đồ và mã PlantText

Dán toàn bộ nội dung của một file `.puml` vào PlantText, từ `@startuml` đến `@enduml`. Mỗi file là một sơ đồ độc lập. Có thể mở SVG để xem ngay hoặc chạy renderer cục bộ bằng `java -jar plantuml.jar -charset UTF-8 -tsvg -o ../svg plantuml/*.puml` từ thư mục này.

| Sơ đồ | Mã PlantUML | Hình SVG |
|---|---|---|
| Ca sử dụng | [PUML](plantuml/01-ca-su-dung.puml) | [SVG](svg/01-ca-su-dung.svg) |
| Hoạt động phục vụ | [PUML](plantuml/02-hoat-dong-phuc-vu.puml) | [SVG](svg/02-hoat-dong-phuc-vu.svg) |
| Tuần tự gửi đơn QR | [PUML](plantuml/03-tuan-tu-goi-mon.puml) | [SVG](svg/03-tuan-tu-goi-mon.svg) |
| Tuần tự duyệt đơn và bếp | [PUML](plantuml/04-tuan-tu-duyet-va-bep.puml) | [SVG](svg/04-tuan-tu-duyet-va-bep.svg) |
| Tuần tự xác nhận thanh toán | [PUML](plantuml/05-tuan-tu-thanh-toan.puml) | [SVG](svg/05-tuan-tu-thanh-toan.svg) |
| Tuần tự đổi/nghỉ ca | [PUML](plantuml/06-tuan-tu-doi-ca.puml) | [SVG](svg/06-tuan-tu-doi-ca.svg) |
| Trạng thái món | [PUML](plantuml/07-trang-thai-mon.puml) | [SVG](svg/07-trang-thai-mon.svg) |
| Trạng thái phiên và hóa đơn | [PUML](plantuml/08-trang-thai-phien-va-hoa-don.puml) | [SVG](svg/08-trang-thai-phien-va-hoa-don.svg) |
| Thành phần hệ thống | [PUML](plantuml/09-thanh-phan.puml) | [SVG](svg/09-thanh-phan.svg) |
| Triển khai Docker | [PUML](plantuml/10-trien-khai-docker.puml) | [SVG](svg/10-trien-khai-docker.svg) |
| Trạng thái bàn | [PUML](plantuml/11-trang-thai-ban-an.puml) | [SVG](svg/11-trang-thai-ban-an.svg) |
| ERD vật lý | [PUML](plantuml/12-erd-vat-ly.puml) | [SVG](svg/12-erd-vat-ly.svg) |
| Cấu trúc module nghiệp vụ | [PUML](plantuml/13-cau-truc-module-nghiep-vu.puml) | [SVG](svg/13-cau-truc-module-nghiep-vu.svg) |
| Tuần tự hủy món | [PUML](plantuml/14-tuan-tu-huy-mon.puml) | [SVG](svg/14-tuan-tu-huy-mon.svg) |
| Tuần tự xem hóa đơn và đánh giá | [PUML](plantuml/15-tuan-tu-hoa-don-khach.puml) | [SVG](svg/15-tuan-tu-hoa-don-khach.svg) |

Sơ đồ cấu trúc dùng stereotype `«module»` để biểu diễn các module JavaScript xuất object và phương thức. ERD dùng ký pháp chân quạ. Sơ đồ hoạt động dùng phân làn UML. Mô hình trạng thái dùng sự kiện và điều kiện gác trên các cung nghiệp vụ. Cung khởi tạo đi thẳng vào trạng thái đầu.

## 6. Căn cứ và kiểm tra

- Howard Podeswa, *UML for the IT Business Analyst*, các phần mô hình ca sử dụng hệ thống, đặc tả luồng, quan hệ `include`/`extend`, máy trạng thái và tuần tự. [PDF](../21.%20UML-for-the-it-business-analyst.pdf)
- Bhuvan Unhelkar, *Software Engineering with UML*, chương 5–7, 9, 12, 14, 17–18. [PDF](../Software%20Engineering%20with%20UML%20by%20Bhuvan%20Unhelkar%20%28z-lib.org%29.pdf)
- `npm test` đã chạy xong kiểm tra DB, migration, 13 nhóm kiểm thử tích hợp backend và build frontend. Các bước và giới hạn nghiệm thu nằm trong [báo cáo khắc phục](bao-cao-khac-phuc.md).

