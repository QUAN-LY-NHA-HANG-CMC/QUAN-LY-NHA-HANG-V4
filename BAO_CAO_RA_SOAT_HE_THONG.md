# BÁO CÁO RÀ SOÁT HIỆN TRẠNG VẬN HÀNH THỰC TẾ & MỨC ĐỘ SẴN SÀNG PRODUCTION
## DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG QUÁN MỘC POS & E-MENU

- **Thời điểm hoàn thành rà soát**: 20/11/2026
- **Phạm vi thẩm định**: Toàn bộ mã nguồn Backend (Node.js, Express 5, CSDL SQLite3, Cổng Socket.io Realtime, Bộ kiểm thử tích hợp 13 nhóm) và Frontend Client (React 19, Vite, Tailwind CSS, 5 phân hệ người dùng).
- **Nguyên tắc rà soát**: Độc lập, khách quan, dựa trên bằng chứng dòng lệnh (Evidence-based Audit), đối chiếu trực tiếp mã nguồn thực tế và tệp CSDL vật lý. Tuyệt đối không phỏng đoán, không sửa đổi mã nguồn trong quá trình rà soát.

---

## TỔNG QUAN ĐIỀU HÀNH (EXECUTIVE SUMMARY)

Hệ thống Quán Mộc POS & E-Menu được thiết kế nhằm phục vụ chu trình khép kín trong nhà hàng ẩm thực: Thực khách quét QR tự gọi món $\rightarrow$ Phục vụ sảnh tiếp nhận & điều phối $\rightarrow$ Bếp KDS chế biến $\rightarrow$ Thu ngân POS kiểm bill & thanh toán $\rightarrow$ Quản trị viên giám sát vận hành & phân tích doanh thu.

### Kết quả thẩm định tổng thể:
1. **Tầng Cơ sở dữ liệu & Máy chủ Backend**: Đã đạt mức độ sẵn sàng cao (**~85% Production-Ready**). CSDL SQLite3 (`database/coSoDuLieu.sqlite`) hoạt động trên chế độ đồng bộ thực tế với 25 bảng và 34 chỉ mục; 74 API endpoints đã được xây dựng hoàn chỉnh với 73/74 endpoint kết nối CSDL thật; bộ kiểm thử tích hợp `backend/kiemThuBackend.js` đạt 100% PASS trên cả 13 nhóm kiểm thử nghiệp vụ.
2. **Tầng Giao diện Frontend & Vận hành Tác nghiệp**: Đang ở trạng thái **Phân hóa sâu sắc (Hybrid / Partial Integration)**:
   - Các màn hình Quản trị chuyên sâu (Thực đơn, Nhân sự, Phân quyền bàn, Lịch phân ca, Báo cáo tài chính 6 tabs, Tiện ích CSDL) và Tính năng khách quét QR xem menu/gửi đơn: **Đã kết nối thật 100%**.
   - Phân hệ Bếp KDS, Màn hình Thu ngân POS, Màn hình Theo dõi đơn món của khách (Order Tracker) và các Modal tác nghiệp sảnh (Duyệt đơn, Chuyển bàn, Gộp bàn, Hủy món): **Đang vận hành chủ yếu bằng Dữ liệu mẫu (Mock Data tĩnh trong `duLieuMau.js`), React State cục bộ và hộp thoại `alert()`**.
   - Nhiều tính năng đã có API Backend và Socket Backend hoàn chỉnh nhưng Frontend chưa gửi request hoặc chưa gán handler tương ứng.

### Ma trận Mức độ Sẵn sàng theo 5 Phân hệ Cốt lõi:

| Phân hệ chức năng | Tỷ lệ Sẵn sàng Production | Trạng thái CSDL SQLite | Trạng thái Socket.io Realtime | Đánh giá Mức độ Hoàn thiện |
|---|:---:|:---:|:---:|---|
| **1. Khách hàng E-Menu** | **60%** | Đã kết nối (Quét QR, Menu, Đặt đơn) | Lắng nghe số suất; thiếu luồng gọi hỗ trợ | Menu & Đặt món thật; Theo dõi món & Đổi món còn Mock |
| **2. Phục vụ sảnh (Waitstaff)** | **45%** | Backend hỗ trợ 100%; UI chưa gọi | Kết nối giục món & lệnh khẩn; thiếu `trang_thai_ban` | Sơ đồ nạp thật; Thao tác Duyệt/Chuyển/Gộp/Hủy chỉ là `alert()` |
| **3. Bếp thông minh (KDS)** | **30%** | Backend có đủ API; UI nạp mock 100% | Nhận lệnh Admin & Phục vụ; thiếu broadcast món | Hoàn toàn chạy trên state nội bộ và `PHIEU_BEP_KDS` |
| **4. Thu ngân POS** | **25%** | Backend có đủ API; UI nạp mock 100% | Nhận lệnh điều phối; thiếu Socket thanh toán | Sơ đồ bàn & Bill cố định B08; Thanh toán chưa ghi CSDL |
| **5. Quản trị & Báo cáo** | **80%** | Đã kết nối CRUD 8/11 màn hình | Phát/nhận lệnh điều phối khẩn cấp hai chiều | Menu, Nhân sự, Ca làm, Báo cáo 6 tabs thật; Dashboard A01 mock |

---

## PHẦN I: ĐÁNH GIÁ CHI TIẾT 5 PHÂN HỆ CỐT LÕI

### 1. Phân hệ Khách hàng E-Menu (Màn hình C01 - C14)

Phân hệ dành cho thực khách tại bàn thông qua trình duyệt web di động khi quét mã QR Code dán tại từng bàn ăn.

#### 1.1. Các chức năng ĐÃ KẾT NỐI THẬT 100%:
- **Quét mã QR bàn & Nhận diện phiên bàn (C01)**:
  - *File mã nguồn*: `frontend/src/App.jsx:110-128`, `frontend/src/dinhTuyen/DinhTuyenUngDung.jsx:127`.
  - *Cơ chế*: Frontend phân tích query param `?ban=...&token=...` từ URL và gọi `GET /api/ban-an/qr/:token`. Backend (`banAn.controller.js:29-37`) truy vấn trực tiếp bảng `ban_an`, đối chiếu `ma_qr_token`, lấy khu vực và kiểm tra phiên hoạt động trong `phien_ban`.
  - *Dự phòng*: `App.jsx:36-42` có cơ chế fallback bàn B01 (`qr_token_b01_t1_moc`) khi truy cập không tham số.
- **Xem danh mục & Thực đơn món ăn (C02, C03)**:
  - *File mã nguồn*: `frontend/src/trang/thucDonQr/TrangThucDon.jsx:34-56`.
  - *Cơ chế*: Gọi API thật `GET /api/thuc-don`, backend đọc từ bảng `danh_muc_mon` và `mon_an`, chỉ lấy các món có `kich_hoat = 1`.
  - *Fallback an toàn*: Dòng 54-56 & 76-77 nạp `DANH_SACH_MON_AN` từ `duLieuMau.js` nếu API sập.
- **Cập nhật số suất tồn realtime (C03)**:
  - *File mã nguồn*: `frontend/src/trang/thucDonQr/TrangThucDon.jsx:60-72`.
  - *Cơ chế*: Lắng nghe sự kiện Socket.io `thuc_don:cap_nhat_so_suat` và `thuc_don:cap_nhat_con_mon`, cập nhật số lượng suất còn lại lên giao diện mà không cần tải lại trang.
- **Gửi đơn đặt món qua QR (C04)**:
  - *File mã nguồn*: `frontend/src/dinhTuyen/DinhTuyenUngDung.jsx:118-146`.
  - *Cơ chế*: Gửi request `POST /api/don-goi-mon` kèm token bàn và danh sách món. Backend chạy transaction ACID trừ tồn số suất và phát socket `donHangMoi`.

#### 1.2. Các chức năng BÁN PHẦN / CÒN DÙNG MOCK DATA:
- **Giỏ hàng dùng chung (C03)**:
  - *Vị trí*: `frontend/src/dinhTuyen/DinhTuyenUngDung.jsx:36-58`, `frontend/src/trang/gioHang/TrangGioHang.jsx:44-45`.
  - *Hiện trạng*: Lưu giỏ hàng trong `localStorage`. Tại dòng 44-50, nếu giỏ trống, hệ thống tự động chèn sẵn **4 món mẫu** (Bò lúc lắc, Gỏi ngó sen, Cơm chiên hải sản, Trà đào). Dòng 44-45 của `TrangGioHang.jsx` hiển thị dòng chữ giả lập *"3 người đang cùng chọn món..."* nhưng chưa có kênh Socket gom giỏ hàng chung giữa các điện thoại cùng bàn.
- **Banner Combo sum vầy gợi ý từ Bếp (C02)**:
  - *Vị trí*: `frontend/src/trang/thucDonQr/TrangThucDon.jsx:136-172`.
  - *Hiện trạng*: 100% gắn cứng từ hằng số `COMBO_GOI_Y` (`duLieuMau.js:156-169`) với ID giả 99. Chưa có API đọc danh sách combo động từ bảng `combo_chi_tiet`.
- **Theo dõi tiến độ món ăn (C05 - Order Tracker)**:
  - *Vị trí*: `frontend/src/trang/theoDoiDonMon/TrangTheoDoiMon.jsx:14, 18` và `DinhTuyenUngDung.jsx:197-202`.
  - *Hiện trạng*: `TrangTheoDoiMon` mặc định nạp `donMon = DON_MAU_BAN_08`. Khi chuyển sang trang này, `DinhTuyenUngDung.jsx` không truyền prop `donMon` và không gọi API `GET /api/don-goi-mon/ban/:banId`. Do đó thực khách luôn nhìn thấy đơn mẫu cố định của Bàn 08.
- **Đề xuất thay đổi món khi hết hàng (C06)**:
  - *Vị trí*: `frontend/src/trang/theoDoiDonMon/ModalDeXuatThayMon.jsx:16-24` & `TrangTheoDoiMon.jsx:195-198`.
  - *Hiện trạng*: Món thay thế được hardcode (ID 10: Mì xào giòn). Bấm đổi món chỉ gọi `alert()`, không cập nhật CSDL.
- **Gọi phục vụ / Nước đá / Khăn lạnh (C08)**:
  - *Vị trí*: `frontend/src/trang/theoDoiDonMon/ModalGoiHoTro.jsx:24-31` & `TrangTheoDoiMon.jsx:169-171`.
  - *Hiện trạng*: Bấm gửi chỉ in `console.log('Đã gửi hỗ trợ:', req)`. Hoàn toàn đứt gãy với backend (chưa gọi Socket/API).
- **Yêu cầu tính tiền mặt tại bàn (C09)**:
  - *Vị trí*: `frontend/src/dinhTuyen/DinhTuyenUngDung.jsx:210-213`.
  - *Hiện trạng*: Chỉ hiển thị `alert('Đã thông báo thu ngân tới bàn thanh toán tiền mặt!')`, không phát tín hiệu tới POS.
- **Thanh toán VietQR tại bàn (C10)**:
  - *Vị trí*: `frontend/src/trang/thanhToan/TrangVietQrKhach.jsx:23-26, 124-130`.
  - *Hiện trạng*: Số tài khoản ngân hàng thụ hưởng Vietcombank `0071000888999` bị gán cứng tại component. Nút *"Tôi đã chuyển khoản xong"* chuyển thẳng sang trang cảm ơn mà không qua bước xác thực trạng thái đơn từ backend.
- **Gửi đánh giá dịch vụ (C11)**:
  - *Vị trí*: `frontend/src/dinhTuyen/DinhTuyenUngDung.jsx:247`.
  - *Hiện trạng*: Callback `onGuiDanhGia={() => {}}` là hàm rỗng, backend cũng chưa có API tiếp nhận đánh giá từ khách.

---

### 2. Phân hệ Phục vụ sảnh (Waitstaff: Màn hình W01 - W11)

Phân hệ dành cho nhân viên phục vụ sử dụng máy tính bảng hoặc điện thoại để quản lý bàn, duyệt đơn món và hỗ trợ khách.

#### 2.1. Các chức năng ĐÃ KẾT NỐI THẬT 100%:
- **Giục món ưu tiên gửi Bếp KDS (W05)**:
  - *File mã nguồn*: `frontend/src/trang/soDoBan/ModalGiucMonPhucVu.jsx:42-45` & `TrangChiTietBan.jsx:47`.
  - *Cơ chế*: Phát sự kiện Socket `socket.emit('phuc_vu:giuc_mon', thongTin)` trực tiếp vào room `bep`. Lắng nghe phản hồi từ bếp qua `phuc_vu:nhan_phan_hoi_giuc_mon`.
- **Tiếp nhận chỉ đạo khẩn cấp từ Quản lý (W10)**:
  - *File mã nguồn*: `frontend/src/trang/soDoBan/ModalDieuPhoiPhucVu.jsx:26-32` & `TrangSoDoBan.jsx:48-63`.
  - *Cơ chế*: Lắng nghe sự kiện `dieu_phoi:phuc_vu` từ quản lý, gọi API thật `PUT /api/dieu-phoi-bep/lenh/:id/xac-nhan` và phát socket xác nhận tiếp nhận.
- **Xem ca làm việc cá nhân & Tạo phiếu đổi ca (W11)**:
  - *File mã nguồn*: `frontend/src/trang/caLamViec/TrangCaLamViecNhanVien.jsx:39, 81`.
  - *Cơ chế*: Gọi API thật `GET /api/ca-lam-viec/lich-ca-nhan` và `POST /api/ca-lam-viec/yeu-cau-doi-ca`, ghi trực tiếp vào bảng `yeu_cau_doi_ca` trong SQLite.

#### 2.2. Các chức năng BÁN PHẦN / CÒN DÙNG MOCK DATA:
- **Sơ đồ bàn ăn & Trạng thái bàn (W01)**:
  - *Vị trí*: `frontend/src/trang/soDoBan/TrangSoDoBan.jsx:66-78`.
  - *Hiện trạng*: Đã gọi API thật `GET /api/ban-an` để lấy danh sách bàn khi mở trang. **Tuy nhiên, component hoàn toàn không lắng nghe sự kiện `trang_thai_ban`** từ Socket backend (`cauHinhSocket.js:143`). Khi có khách ngồi hoặc thanh toán, sơ đồ bàn không tự nhảy màu trừ khi F5 lại trang.
- **Trung tâm thông báo phục vụ (W03)**:
  - *Vị trí*: `frontend/src/trang/soDoBan/ModalTrungTamThongBao.jsx:14-45`.
  - *Hiện trạng*: Danh sách 3 thông báo hoàn toàn là mảng tĩnh gắn cứng (Bàn 08 đơn QR mới, Bàn 04 gọi nhân viên, Bàn 10 hết món). Không gọi API `GET /api/don-goi-mon/cho-duyet` (dù backend đã có sẵn).
- **Duyệt đơn và Từ chối đơn gọi món QR (W04)**:
  - *Vị trí*: `frontend/src/trang/soDoBan/ModalDuyetDonQr.jsx:9-22`, `ModalTuChoiDonQr.jsx:24`, `TrangSoDoBan.jsx:228-246`.
  - *Hiện trạng*: Modal nạp đơn mẫu `DON_MAU_BAN_08`. Khi bấm "Duyệt đơn" hoặc "Từ chối", hàm xử lý chỉ thực hiện `setSoThongBao(prev => prev - 1)` trong biến state nội bộ React. **Tuyệt đối không gọi `PUT /api/don-goi-mon/:id/duyet` hay `PUT /api/don-goi-mon/:id/tu-choi`**. Đơn không hề được chuyển sang Bếp KDS trên thực tế.
- **Xem chi tiết bàn ăn (W02, W06)**:
  - *Vị trí*: `frontend/src/trang/soDoBan/TrangChiTietBan.jsx:16, 21, 53`.
  - *Hiện trạng*: Khi bấm vào bất kỳ bàn nào trên sơ đồ, trang luôn nạp dữ liệu mẫu `DON_MAU_BAN_08`. Không gọi API `GET /api/don-goi-mon/ban/:banId`.
- **Đặt món hộ khách tại bàn (W07)**:
  - *Vị trí*: `frontend/src/trang/soDoBan/TrangChiTietBan.jsx:259-262`, `ModalDatMonHoKhach.jsx:22-37`.
  - *Hiện trạng*: Modal có nạp danh mục thực đơn từ API thật, nhưng khi bấm nút "Xác nhận gửi đơn", component chỉ hiển thị `alert('Đã thêm ... món')` mà không gọi `POST /api/don-goi-mon`.
- **Chuyển bàn (W08)**:
  - *Vị trí*: `frontend/src/trang/soDoBan/ModalChuyenBan.jsx:8, 19`, `TrangChiTietBan.jsx:271-275`.
  - *Hiện trạng*: Lọc danh sách bàn trống từ file mock `DANH_SACH_BAN`. Bấm xác nhận chỉ gọi `alert('Đã chuyển từ ... sang ...')`, **không gọi API `POST /api/ban-an/chuyen-ban`**.
- **Gộp bàn (W09)**:
  - *Vị trí*: `frontend/src/trang/soDoBan/ModalGopBan.jsx:8, 19`, `TrangChiTietBan.jsx:284-287`.
  - *Hiện trạng*: Lọc bàn có khách từ file mock. Bấm xác nhận chỉ gọi `alert()`, **không gọi API `POST /api/ban-an/gop-ban`**.
- **Yêu cầu hủy món (W10)**:
  - *Vị trí*: `frontend/src/trang/soDoBan/ModalYeuCauHuyMon.jsx:32`, `TrangChiTietBan.jsx:297-300`.
  - *Hiện trạng*: Bấm xác nhận chỉ gọi `alert()`, **không gọi API `POST /api/don-goi-mon/huy-mon`**.

---

### 3. Phân hệ Bếp thông minh KDS (Kitchen Display System: Màn hình K01 - K06)

Phân hệ hiển thị trên màn hình chuyên dụng tại khu vực bếp chế biến để tiếp nhận order, điều phối món và báo hoàn thành.

#### 3.1. Các chức năng ĐÃ KẾT NỐI THẬT 100%:
- **Tiếp nhận chỉ đạo khẩn cấp từ Quản lý**:
  - *File mã nguồn*: `frontend/src/trang/dieuPhoiBep/TrangKdsBep.jsx:44-45`, `ModalChiDaoGapBatBuoc.jsx:398-402`.
  - *Cơ chế*: Kết nối Socket.io hai chiều qua phòng `bep`, lắng nghe `dieu_phoi:bep` và `dieu_phoi:moi`, gọi API xác nhận `PUT /api/dieu-phoi-bep/lenh/:id/xac-nhan` và phát `dieu_phoi:xac_nhan`.
- **Nhận và phản hồi đề nghị giục món từ Phục vụ**:
  - *File mã nguồn*: `frontend/src/trang/dieuPhoiBep/TrangKdsBep.jsx:46`, `ModalDeNghiUuTien.jsx:427-433`.
  - *Cơ chế*: Lắng nghe `bep:co_de_nghi_giuc_mon`, mở modal tương tác và phát sự kiện `bep:phan_hoi_giuc_mon` ngược lại cho phục vụ.

#### 3.2. Các chức năng BÁN PHẦN / CÒN DÙNG MOCK DATA:
- **Hàng đợi phiếu bếp theo bàn (K01) & Gom mẻ nấu (K02)**:
  - *Vị trí*: `frontend/src/trang/dieuPhoiBep/TrangKdsBep.jsx:11, 55-64`.
  - *Hiện trạng*: 100% nạp từ biến tĩnh trong `duLieuMau.js` (`PHIEU_BEP_KDS`, `GOM_MON_KDS`, `DANH_SACH_MON_AN`).
  - *Thiếu sót*: **Hoàn toàn không gọi API `GET /api/dieu-phoi-bep/hang-doi`** (cả chế độ `theo_ban` và `gom_mon`) và **không gọi `GET /api/dieu-phoi-bep/da-hoan-thanh`** (dù backend đã hoàn thiện 100% logic tại `dieuPhoiBep.controller.js:10-25`). Không có bộ lắng nghe Socket `don_hang_moi` để tự chèn đơn mới vào màn hình.
- **Chuyển trạng thái nấu: Chờ nấu $\rightarrow$ Đang nấu $\rightarrow$ Hoàn thành (K03)**:
  - *Vị trí*: `frontend/src/trang/dieuPhoiBep/TrangKdsBep.jsx:67-79, 82-99, 296-301`.
  - *Hiện trạng*: Thao tác "Nấu món", "Xong món", "Nấu chung cả mẻ" chỉ cập nhật biến state cục bộ React `danhSachPhieu` và `danhSachDaXong`. **Không gọi API `PUT /api/dieu-phoi-bep/chi-tiet/:id/trang-thai`**.
  - *Hệ quả*: Khi bếp bấm xong món, CSDL SQLite không ghi nhận, Phục vụ sảnh và Khách hàng không nhận được Socket `tienDoMonAn` để biết món đã xong.
- **Khóa món / Báo hết hàng nhanh tại Bếp (K04)**:
  - *Vị trí*: `frontend/src/trang/dieuPhoiBep/TrangKdsBep.jsx:102-106`.
  - *Hiện trạng*: Hàm `toggleHetMon` chỉ đổi thuộc tính `con_hang: !m.con_hang` trong state nội bộ. Không gọi API `PUT /api/thuc-don/:id/trang-thai-mon` và không phát socket `thuc_don:cap_nhat_con_mon`. Khách ngoài bàn vẫn tiếp tục đặt được món đã hết!
- **Chuông âm thanh thông báo đơn mới**:
  - *Vị trí*: `frontend/src/trang/dieuPhoiBep/TrangKdsBep.jsx:18, 123` & `frontend/src/thanhPhan/HeaderBep.jsx:18`.
  - *Hiện trạng*: Chỉ là icon bật/tắt hiển thị trạng thái giao diện, không có mã khởi tạo âm thanh thật (`new Audio(...)` hay Web Audio API).

---

### 4. Phân hệ Thu ngân POS (Cashier POS: Màn hình P01 - P09)

Phân hệ dành cho nhân viên thu ngân tại quầy tính tiền, quản lý danh sách bàn, lập hóa đơn, thu tiền mặt hoặc VietQR, in hóa đơn K80 và chốt phiên bàn.

#### 4.1. Các chức năng ĐÃ KẾT NỐI THẬT 100%:
- **Tiếp nhận chỉ đạo từ Quản lý tới Thu ngân**:
  - *File mã nguồn*: `frontend/src/trang/thanhToan/TrangPosKiemBill.jsx:40-58`, `ModalDieuPhoiThuNgan.jsx:26, 31-38`.
  - *Cơ chế*: Tham gia room `thu_ngan`, nhận lệnh qua socket `dieu_phoi:thu_ngan`, gọi API `PUT /api/dieu-phoi-bep/lenh/:id/xac-nhan` và phát `dieu_phoi:xac_nhan`.

#### 4.2. Các chức năng BÁN PHẦN / CÒN DÙNG MOCK DATA:
- **Sơ đồ bàn & Danh sách bàn POS**:
  - *Vị trí*: `frontend/src/trang/thanhToan/TrangPosKiemBill.jsx:29, 36, 72`.
  - *Hiện trạng*: Nạp từ mảng tĩnh `DANH_SACH_BAN_MAU` (`duLieuMau.js`). Không gọi API `GET /api/ban-an`.
- **Xem chi tiết hóa đơn kiểm bill (P01)**:
  - *Vị trí*: `frontend/src/trang/thanhToan/TrangPosKiemBill.jsx:29, 90, 194-196, 202-218`.
  - *Hiện trạng*: Khi thu ngân bấm chọn bất kỳ bàn nào trên sơ đồ, màn hình bill bên phải luôn hiển thị hóa đơn mẫu `#HD-0819` của `DON_MAU_BAN_08` với 4 món ăn và tổng tiền 838.080đ. Không gọi API tạm tính `GET /api/hoa-don/tam-tinh/:banId`.
- **Giảm giá / Chiết khấu hóa đơn (P02)**:
  - *Vị trí*: `frontend/src/trang/thanhToan/ModalGiamGiaChietKhau.jsx:15-35`, `TrangPosKiemBill.jsx:314-318`.
  - *Hiện trạng*: Chỉ tính toán và lưu giá trị giảm giá trong biến React State `tienGiamGia`, không gửi lên server.
- **Thanh toán tiền mặt (P03)**:
  - *Vị trí*: `frontend/src/trang/thanhToan/ModalThanhToanTienMat.jsx:20-27`, `TrangPosKiemBill.jsx:326-329`.
  - *Hiện trạng*: Bấm xác nhận thanh toán tiền mặt chỉ gọi `setHienTienMat(false); setHienInK80(true);`. **Hoàn toàn KHÔNG gọi API `POST /api/hoa-don/:id/thanh-toan`**.
  - *Hệ quả*: Doanh thu không được ghi vào CSDL SQLite (`hoa_don`, `giao_dich_thanh_toan`), trạng thái bàn không được đóng trong `phien_ban`, không kích hoạt `socketPhat.thanhToanThanhCong`.
- **Thanh toán VietQR động tại POS (P04)**:
  - *Vị trí*: `frontend/src/trang/thanhToan/ModalThanhToanVietQrPos.jsx:19-23, 66-69, 77-82`, `TrangPosKiemBill.jsx:339-342`.
  - *Hiện trạng*: Hardcode STK Vietcombank `0071000888999`. Hiển thị vòng xoay "Đang lắng nghe biến động số dư..." nhưng hoàn toàn không có Socket hay webhook kết nối. Bấm xác nhận thủ công chỉ mở modal in K80, **không gọi API thanh toán backend**.
- **Tách hóa đơn (P05) & Chia đều hóa đơn (P06)**:
  - *Vị trí*: `ModalTachHoaDon.jsx:17-18`, `ModalChiaDeuHoaDon.jsx:16`, `TrangPosKiemBill.jsx:351-366`.
  - *Hiện trạng*: Chỉ cắt mảng món bằng hàm Javascript `.slice()` và hiển thị `alert()`. Không gọi API backend `POST /api/hoa-don/:id/chia-tien`.
- **In hóa đơn K80 (P07)**:
  - *Vị trí*: `frontend/src/trang/thanhToan/ModalInHoaDonK80.jsx:9, 58, 111-115`.
  - *Hiện trạng*: Gắn cứng ngày in mẫu `19/11/2026 19:42`. Sử dụng lệnh in trình duyệt `window.print()`, chưa tích hợp driver in nhiệt ESC/POS (LAN/USB).
- **Hoàn tất bàn & Chuyển dọn dẹp (P08)**:
  - *Vị trí*: `frontend/src/trang/thanhToan/ModalHoanTatDonBan.jsx:33`, `TrangPosKiemBill.jsx:386-389`.
  - *Hiện trạng*: Chỉ gọi `alert()`, không gọi API `PUT /api/ban-an/:id/trang-thai`.
- **Lịch sử hóa đơn POS (P09)**:
  - *Vị trí*: `frontend/src/trang/thanhToan/TrangLichSuHoaDonPos.jsx:14-20`.
  - *Hiện trạng*: Nạp mảng tĩnh gồm 5 hóa đơn giả lập, không gọi API `GET /api/hoa-don`.
- **Thao tác bàn từ POS (Chuyển bàn, Gộp bàn, Mở bàn)**:
  - *Vị trí*: `frontend/src/trang/thanhToan/TrangPosKiemBill.jsx`.
  - *Hiện trạng*: Giao diện POS hiện thời hoàn toàn chưa thiết kế nút bấm hay modal để thu ngân thực hiện chuyển bàn/gộp bàn từ quầy thu ngân.

---

### 5. Phân hệ Quản trị hệ thống & Báo cáo (Admin Dashboard & Reports: Màn hình A01 - A20)

Phân hệ dành cho Quản lý nhà hàng, Bếp trưởng và Chủ cơ sở để thiết lập hệ thống, giám sát vận hành, phân quyền nhân sự và xem báo cáo tài chính.

#### 5.1. Các chức năng ĐÃ KẾT NỐI THẬT 100%:
- **Báo cáo Doanh thu & Tài chính 6 tabs chuyên sâu (A16)**:
  - *File mã nguồn*: `frontend/src/trang/baoCaoDoanhThu/TrangBaoCaoDoanhThu.jsx:118, 228-238, 247`.
  - *Cơ chế*: Gọi API thật `GET /api/bao-cao/tat-ca?ky=...`, backend chạy `Promise.all` tính toán 6 góc độ tài chính từ CSDL SQLite: Tổng quan, Doanh thu theo thời gian, Món ăn & Món hủy thất thoát, Hiệu suất khu vực bàn, Sổ quỹ tồn két Z-Report, Kênh gọi món & Đánh giá sao.
  - *Realtime & Xuất dữ liệu*: Lắng nghe Socket cập nhật doanh số tức thì; hỗ trợ xuất file Excel `GET /api/bao-cao/xuat-csv` mã hóa UTF-8 có tiền tố BOM chuẩn.
- **Quản lý Thực đơn & Món ăn & Kiểm soát số suất tồn (A12, A13)**:
  - *File mã nguồn*: `frontend/src/trang/quanLyThucDon/TrangQuanLyThucDon.jsx:43, 114, 129, 151, 165-170`.
  - *Cơ chế*: Đầy đủ CRUD trên CSDL SQLite (`GET /api/thuc-don`, `POST /api/thuc-don`, `PUT /api/thuc-don/:id`, `PUT /api/thuc-don/:id/so-suat`, `PUT /api/thuc-don/:id/trang-thai-mon`, `DELETE /api/thuc-don/:id`). Tự động phát Socket broadcast khi thay đổi món hoặc số suất.
- **Quản trị Nhân sự & Tài khoản bảo mật (A02, A03, A05)**:
  - *File mã nguồn*: `frontend/src/trang/nhanVien/TrangDanhSachNhanVien.jsx:36, 60, 81, 110, 133`.
  - *Cơ chế*: CRUD nhân viên kết nối trực tiếp SQLite. Hỗ trợ tính năng Đình chỉ công tác (`PUT /api/tai-khoan/nhan-su/:id/trang-thai` chuyển `kich_hoat = 0`), khóa ngay lập tức phiên đăng nhập với mã lỗi HTTP 403.
- **Phân quyền bàn phụ trách trực quan (A04)**:
  - *File mã nguồn*: `frontend/src/trang/nhanVien/ModalPhanQuyenGiaoBan.jsx:55, 63, 120`.
  - *Cơ chế*: Đọc danh sách bàn và quan hệ phân công từ CSDL, lưu phân quyền nhân sự phụ trách bàn vào bảng `phan_cong_ban` qua `PUT /api/tai-khoan/nhan-su/:id/ban-phu-trach`.
- **Lịch phân ca tuần & Phê duyệt đổi ca (A06, A07)**:
  - *File mã nguồn*: `frontend/src/trang/caLamViec/TrangLichPhanCaAdmin.jsx:77, 127`, `ModalThemCaLamViec.jsx:59`, `TrangDuyetNghiDoiCaAdmin.jsx:31, 52`.
  - *Cơ chế*: Kết nối REST API thật với bảng `ca_lam_viec` và `yeu_cau_doi_ca`. Quản lý duyệt đổi ca sử dụng Transaction SQLite hoán đổi ca làm việc an toàn và phát Socket `ketQuaDuyetCa`.
- **Quản lý Bàn ăn & Cấu hình mã QR E-Menu (A10, A11)**:
  - *File mã nguồn*: `frontend/src/trang/quanLyBanQr/TrangQuanLyPhongBan.jsx:43, 112, 144, 186`, `TrangThietLapBanVaQr.jsx:18, 28-31`.
  - *Cơ chế*: CRUD khu vực và bàn ăn trên SQLite. Sinh mã QR động chứa `ma_qr_token` được truy xuất trực tiếp từ CSDL.
- **Trung tâm Điều phối khẩn cấp đa phòng ban (A18)**:
  - *File mã nguồn*: `frontend/src/trang/quanTri/TrangDieuPhoiKhanCap.jsx:77, 138-143, 150, 195`.
  - *Cơ chế*: Quản lý phát lệnh khẩn cấp qua `POST /api/dieu-phoi-bep/phat-lenh`, lưu bảng `lenh_dieu_phoi`, phát Socket hai chiều đa phòng ban (`dieu_phoi:bep`, `dieu_phoi:phuc_vu`, `dieu_phoi:thu_ngan`) và nhận thông báo xác nhận đã tiếp nhận lệnh thời gian thực.
- **Tiện ích Cơ sở dữ liệu (Seed, Làm sạch, Backup)**:
  - *File mã nguồn*: `frontend/src/trang/quanTri/TrangTienIchDuLieu.jsx:31, 64, 97`.
  - *Cơ chế*: Kích hoạt trực tiếp các API hệ thống thật: `/api/he-thong/sinh-du-lieu-mau`, `/api/he-thong/lam-sach-du-lieu`, `/api/he-thong/sao-luu-csdl`.

#### 5.2. Các chức năng BÁN PHẦN / CÒN DÙNG MOCK DATA:
- **Dashboard Tổng quan Vận hành (A01)**:
  - *Vị trí*: `frontend/src/trang/quanTri/TrangTongQuanVanHanh.jsx:18, 56, 75, 93, 111`.
  - *Hiện trạng*: 100% nạp từ hằng số `BAO_CAO_DOANH_THU_MAU` và `DANH_SACH_BAN_MAU`. Hiển thị số liệu tĩnh (18.450.000đ, 138 khách, 42 đơn, 5 đĩa KDS). Không gọi API thống kê `GET /api/he-thong/thong-ke` (dù backend đã có sẵn API này).
- **Điểm danh ca làm việc (Check-in / Check-out)**:
  - *Vị trí*: `frontend/src/trang/caLamViec/TrangCaLamViecNhanVien.jsx:136-137`.
  - *Hiện trạng*: Backend có sẵn `PUT /api/ca-lam-viec/:id/checkin` và `PUT /api/ca-lam-viec/:id/checkout` (`caLamViec.routes.js:52-63`), nhưng giao diện Frontend thiếu hoàn toàn nút bấm để nhân viên kích hoạt Check-in / Check-out.
- **Phê duyệt yêu cầu hủy món (A19)**:
  - *Vị trí*: `frontend/src/trang/quanTri/TrangDuyetHuyMonAdmin.jsx:11-34`.
  - *Hiện trạng*: Khởi tạo bằng mảng tĩnh gồm 2 món mẫu (Cơm chiên hải sản, Trà đào). Bấm Duyệt/Từ chối chỉ đổi state React nội bộ. Backend cũng thiếu API phê duyệt hủy món cho Quản lý.
- **Nhật ký kiểm toán hệ thống (A20)**:
  - *Vị trí*: `frontend/src/trang/quanTri/TrangNhatKyKiemToan.jsx:8, 14-18`.
  - *Hiện trạng*: Nạp mảng mẫu `NHAT_KY_KIEM_TOAN_MAU`. Chưa gọi API thật `GET /api/he-thong/nhat-ky` (trong khi backend và bảng `nhat_ky_kiem_toan` đã có sẵn dữ liệu thật).
- **Phản hồi & Đánh giá của khách hàng (A17)**:
  - *Vị trí*: `frontend/src/trang/quanTri/TrangPhanHoiKhachHang.jsx:8, 11`.
  - *Hiện trạng*: Nạp mảng tĩnh `DANH_GIA_KHACH_HANG_MAU`. Chưa kết nối bảng `danh_gia` trong SQLite.
- **Cấu hình thông tin nhà hàng (A08) & Cấu hình VietQR (A09)**:
  - *Vị trí*: `frontend/src/trang/quanTri/TrangThongTinNhaHang.jsx:8, 20-23` & `TrangCauHinhVietQR.jsx:8, 18-22`.
  - *Hiện trạng*: Nạp từ `DU_LIEU_NHA_HANG`. Khi bấm lưu cấu hình, component chỉ chạy `setTimeout` mô phỏng lưu thành công mà không gọi `PUT /api/he-thong/cau-hinh`.

---

## PHẦN II: ĐÁNH GIÁ CHUYÊN SÂU 8 THAO TÁC NGHIỆP VỤ TRỌNG YẾU

Bảng đánh giá mức độ triển khai thực tế của 8 thao tác nghiệp vụ cốt lõi theo yêu cầu của ORIGINAL_REQUEST.md:

### 1. Nghiệp vụ Đặt món (Order Placement)
- **Tình trạng tổng quan**: **Bán phần (Khách QR thật 100%, Phục vụ đặt hộ là Mock)**.
- **Tầng Backend & SQLite**:
  - *API*: `POST /api/don-goi-mon` (`donGoiMon.controller.js:10-27`, `donGoiMon.service.js:10-184`).
  - *Lưu trữ CSDL*: **SQLite THẬT 100%**. Hàm `taoDonGoiMon` chạy trong giao dịch an toàn `chayGiaoDich`: tự động tạo hoặc gắn vào `phien_ban`, chèn bản ghi vào `don_goi_mon`, duyệt từng món trong mảng để chèn vào `chi_tiet_don_mon`.
  - *Kiểm soát số suất*: Tự động kiểm tra `so_suat_con_lai`. Nếu vượt quá số suất cho phép sẽ Rollback và báo lỗi HTTP 400. Nếu đủ suất sẽ trừ trực tiếp `so_suat_con_lai = so_suat_con_lai - soLuong`. Khi về 0 sẽ tự động cập nhật `con_mon = 0`.
  - *Tín hiệu Realtime*: Phát `socketPhat.donHangMoi` tới room `phuc_vu` và `bep`; phát `socketPhat.trangThaiBan` tới `phuc_vu`, `thu_ngan`, `quan_ly`; phát `thuc_don:cap_nhat_so_suat` tới toàn hệ thống.
  - *Kiểm thử*: Đã kiểm thử thành công trong `kiemThuBackend.js` (Nhóm 4 & Nhóm 11).
- **Tầng Frontend Client**:
  - *Khách đặt qua QR*: Đã kết nối API thật tại `DinhTuyenUngDung.jsx:118-146`. Tuy nhiên, khối `catch` tại dòng 141-145 đang nuốt lỗi và hiển thị alert ngoại tuyến giả lập.
  - *Phục vụ đặt món hộ (`ModalDatMonHoKhach.jsx:73` & `TrangChiTietBan.jsx:259-262`)*: Nạp danh mục thực đơn từ API thật nhưng khi bấm xác nhận chỉ hiển thị `alert()`, không gọi API tạo đơn.

### 2. Nghiệp vụ Duyệt đơn & Từ chối đơn QR (Order Approval / Rejection)
- **Tình trạng tổng quan**: **Bán phần (Backend thật 100%, Frontend UI hoàn toàn Mock)**.
- **Tầng Backend & SQLite**:
  - *API*: `PUT /api/don-goi-mon/:id/duyet` và `PUT /api/don-goi-mon/:id/tu-choi` (`donGoiMon.controller.js:48-68`, `donGoiMon.service.js:225-274`).
  - *Lưu trữ CSDL*: **SQLite THẬT 100%**. Khi duyệt, cập nhật trạng thái `don_goi_mon` thành `'da_duyet'`, đồng thời cập nhật tất cả các món trong `chi_tiet_don_mon` từ `'cho_nau'` sang `'dang_nau'`, ghi nhận vào `nhat_ky_kiem_toan`. Khi từ chối, cập nhật `'tu_choi'` và hoàn trả lại số suất vào bảng `mon_an`.
  - *Tín hiệu Realtime*: Phát `socketPhat.tienDoMonAn` tới room `phuc_vu`, `thu_ngan` và `ban_${banId}`.
  - *Kiểm thử*: Duyệt đơn đã được kiểm thử trong `kiemThuBackend.js` (Nhóm 4).
- **Tầng Frontend Client**:
  - *File*: `frontend/src/trang/soDoBan/ModalDuyetDonQr.jsx:20-22` và `TrangSoDoBan.jsx:228-231`.
  - *Hiện trạng*: Modal nạp dữ liệu mẫu `DON_MAU_BAN_08`. Khi phục vụ bấm nút "Duyệt đơn", hàm `onDuyetThanhCong` chỉ trừ biến đếm thông báo `soThongBao` trong bộ nhớ React. **Hoàn toàn KHÔNG gọi API `PUT /api/don-goi-mon/:id/duyet`** và không phát tín hiệu xuống Bếp.

### 3. Nghiệp vụ Hủy món (Item Cancellation & Wastage Control)
- **Tình trạng tổng quan**: **Bán phần (Backend có tiếp nhận nhưng thiếu API Quản lý duyệt; Frontend 100% Mock)**.
- **Tầng Backend & SQLite**:
  - *API tiếp nhận*: `POST /api/don-goi-mon/huy-mon` (`donGoiMon.controller.js:71-88`, `donGoiMon.service.js:277-327`).
  - *Lưu trữ CSDL*: Nếu món ở trạng thái `'cho_duyet'` thì hủy ngay lập tức và hoàn số suất. Nếu món đã chuyển `'dang_nau'` hoặc `'hoan_thanh'`, hệ thống chuyển trạng thái món sang `'yeu_cau_huy'` và chèn bản ghi vào bảng `yeu_cau_huy_mon` (`cho_admin_duyet`).
  - *Tín hiệu Realtime*: Phát `io.to('quan_ly').emit('co_yeu_cau_huy_mon', ...)`.
  - *Điểm nghẽn Backend*: **Thiếu API `PUT /api/don-goi-mon/yeu-cau-huy-mon/:id/phe-duyet`** để Quản lý bấm chấp thuận hoặc từ chối phiếu hủy. Do đó món bị treo ở trạng thái yêu cầu hủy.
- **Tầng Frontend Client**:
  - *Phục vụ gửi yêu cầu hủy (`ModalYeuCauHuyMon.jsx:32`)*: Bấm xác nhận chỉ gọi `alert()`, không gọi API `POST /api/don-goi-mon/huy-mon`.
  - *Quản lý duyệt hủy (`TrangDuyetHuyMonAdmin.jsx:11-34`)*: Hiển thị mảng tĩnh 2 món mẫu, bấm nút chỉ xóa phần tử trong state nội bộ.

### 4. Nghiệp vụ Chuyển bàn (Table Transfer)
- **Tình trạng tổng quan**: **Bán phần (Backend thật 100%, Frontend UI hoàn toàn Mock)**.
- **Tầng Backend & SQLite**:
  - *API*: `POST /api/ban-an/chuyen-ban` (`banAn.controller.js:51-66`, `banAn.model.js:106-135`).
  - *Lưu trữ CSDL*: **SQLite THẬT 100%**. Chạy trong giao dịch `chayGiaoDich`: kiểm tra bàn nguồn phải có khách (`co_khach`), bàn đích phải đang trống (`trong`); cập nhật `ban_an_id` của `phien_ban` hiện tại sang bàn đích; đổi trạng thái bàn nguồn thành `'trong'` và bàn đích thành `'co_khach'`; ghi nhật ký kiểm toán.
  - *Tín hiệu Realtime*: Phát 2 sự kiện `socketPhat.trangThaiBan` cho cả bàn nguồn và bàn đích tới các room `phuc_vu`, `thu_ngan`, `quan_ly`.
  - *Kiểm thử*: Chưa có bài kiểm thử tự động trong `kiemThuBackend.js` (nằm trong 33 endpoint thiếu test).
- **Tầng Frontend Client**:
  - *File*: `frontend/src/trang/soDoBan/ModalChuyenBan.jsx:19` và `TrangChiTietBan.jsx:271-275`.
  - *Hiện trạng*: Đọc danh sách bàn trống từ file mock tĩnh `DANH_SACH_BAN`. Khi bấm xác nhận chuyển bàn, component chỉ hiện `alert('Đã chuyển từ ... sang ...')` rồi quay lại màn hình trước. Không hề gọi API backend!

### 5. Nghiệp vụ Gộp bàn (Table Merge)
- **Tình trạng tổng quan**: **Bán phần (Backend thật 100%, Frontend UI hoàn toàn Mock)**.
- **Tầng Backend & SQLite**:
  - *API*: `POST /api/ban-an/gop-ban` (`banAn.controller.js:68-83`, `banAn.model.js:137-175`).
  - *Lưu trữ CSDL*: **SQLite THẬT 100%**. Chạy trong giao dịch `chayGiaoDich`: xác thực cả hai bàn đều phải đang có khách; chuyển toàn bộ `don_goi_mon` và `yeu_cau_ho_tro` từ phiên bàn nguồn sang phiên bàn đích; đóng phiên bàn nguồn (`da_dong`), giải phóng bàn nguồn về `'trong'`, cập nhật ghi chú bàn đích; ghi nhật ký kiểm toán.
  - *Tín hiệu Realtime*: Phát `socketPhat.trangThaiBan` cập nhật trạng thái cả hai bàn.
  - *Kiểm thử*: Chưa có bài kiểm thử tự động trong `kiemThuBackend.js`.
- **Tầng Frontend Client**:
  - *File*: `frontend/src/trang/soDoBan/ModalGopBan.jsx:19` và `TrangChiTietBan.jsx:284-287`.
  - *Hiện trạng*: Đọc danh sách bàn từ mock tĩnh. Bấm xác nhận chỉ gọi `alert()`, không gọi API gộp bàn.

### 6. Nghiệp vụ Thanh toán (Payment: Tiền mặt, VietQR, Chia tiền)
- **Tình trạng tổng quan**: **Bán phần (Backend đầy đủ logic CSDL & Socket; E-Menu có chia tiền thật; POS hoàn toàn Mock)**.
- **Tầng Backend & SQLite**:
  - *API Hóa đơn*: `GET /api/hoa-don/tam-tinh/:banId`, `POST /api/hoa-don/tao-hoa-don`, `POST /api/hoa-don/:id/thanh-toan`, `POST /api/hoa-don/:id/chia-tien` (`hoaDon.controller.js:10-109`, `hoaDon.service.js:21-256`).
  - *Lưu trữ CSDL*: **SQLite THẬT 100%**. Hàm `xacNhanThanhToan` chạy trong giao dịch an toàn `chayGiaoDich`: cập nhật hóa đơn sang `'da_thanh_toan'`, ghi nhận phương thức (`tien_mat`, `vietqr`), đóng phiên bàn `phien_ban ('da_dong')`, chuyển trạng thái bàn ăn sang `'can_don_dep'`, ghi sổ cái tài chính vào bảng `giao_dich_thanh_toan`.
  - *Tín hiệu Realtime*: Phát `socketPhat.thanhToanThanhCong` tới các room `phuc_vu`, `thu_ngan`, `quan_ly`, và `ban_${banId}`; phát `socketPhat.trangThaiBan` đổi màu bàn trên sơ đồ.
  - *Điểm nghẽn Backend*: Thông tin ngân hàng VietQR bị gán cứng vào hằng số `NGAN_HANG_MAC_DINH` (`hoaDon.service.js:13-18`), chưa đọc từ bảng `cau_hinh_nha_hang`.
- **Tầng Frontend Client**:
  - *E-Menu Khách hàng*: Tính năng chia tiền nhóm (`TrangThanhToanNhom.jsx:39, 78`) đã gọi API thật `GET /api/hoa-don/tam-tinh/:banId` và `POST /api/hoa-don/:id/chia-tien`. Trang thanh toán VietQR khách (`TrangVietQrKhach.jsx`) sinh mã QR Napas nhưng STK Vietcombank bị hardcode tại client.
  - *Thu ngân POS (`TrangPosKiemBill.jsx:326-342`)*: Cả hai modal Thanh toán tiền mặt và Thanh toán VietQR **hoàn toàn KHÔNG gọi API `thanh-toan`**. Sau khi bấm xác nhận, hệ thống chỉ đóng modal và mở modal in K80. Tiền không vào CSDL, phiên bàn không đóng, bàn không chuyển sang "Cần dọn dẹp".

### 7. Nghiệp vụ Điều phối bếp & Lệnh khẩn cấp (Emergency Dispatching)
- **Tình trạng tổng quan**: **ĐÃ KẾT NỐI THẬT 100% (REST + SQLite + Socket.io)**.
- **Tầng Backend & SQLite**:
  - *API*: `POST /api/dieu-phoi-bep/phat-lenh`, `GET /api/dieu-phoi-bep/lich-su-lenh`, `PUT /api/dieu-phoi-bep/lenh/:id/xac-nhan` (`dieuPhoiBep.controller.js:66-96`, `dieuPhoiBep.model.js:127-184`).
  - *Lưu trữ CSDL*: **SQLite THẬT 100%**. Lưu trữ đầy đủ trong bảng `lenh_dieu_phoi` (loại lệnh: ưu tiên, tạm dừng, hủy, thông báo; mức độ: bình thường, khẩn cấp; trạng thái: đã phát, đã tiếp nhận).
  - *Tín hiệu Realtime*: Quản lý phát broadcast toàn cục `dieu_phoi:moi` và theo từng phòng ban (`dieu_phoi:bep`, `dieu_phoi:phuc_vu`, `dieu_phoi:thu_ngan`). Khi nhân viên bấm tiếp nhận, phát `dieu_phoi:da_tiep_nhan` ngược về cho Quản lý.
  - *Kiểm thử*: Kiểm thử hoàn chỉnh trong `kiemThuBackend.js` (Nhóm 13).
- **Tầng Frontend Client**:
  - Cả 4 màn hình: Quản trị (`TrangDieuPhoiKhanCap.jsx:138, 195`), Bếp (`ModalChiDaoGapBatBuoc.jsx:398-402`), Phục vụ (`ModalDieuPhoiPhucVu.jsx:26-32`), Thu ngân (`ModalDieuPhoiThuNgan.jsx:26-38`) đều đã kết nối REST API và Socket.io hai chiều chuẩn xác.

### 8. Nghiệp vụ Điểm danh ca làm việc (Staff Attendance, Shifts & Leave)
- **Tình trạng tổng quan**: **Bán phần (Lịch ca & Đổi ca thật 100%; Điểm danh thiếu nút trên UI)**.
- **Tầng Backend & SQLite**:
  - *API Ca làm & Đổi ca*: `GET /api/ca-lam-viec/lich-ca-nhan`, `GET /api/ca-lam-viec/tat-ca-lich`, `POST /api/ca-lam-viec/tao-ca`, `POST /api/ca-lam-viec/yeu-cau-doi-ca`, `PUT /api/ca-lam-viec/yeu-cau-doi-ca/:id/phe-duyet` (`caLamViec.controller.js:10-140`).
  - *API Điểm danh*: `PUT /api/ca-lam-viec/:id/checkin` và `PUT /api/ca-lam-viec/:id/checkout` (`caLamViec.controller.js:63-83`). Cập nhật trạng thái `da_checkin` kèm `thoi_gian_checkin_thuc_te`.
  - *Lưu trữ CSDL*: **SQLite THẬT 100%**. Ghi nhận vào bảng `ca_lam_viec` và `yeu_cau_doi_ca`.
  - *Tín hiệu Realtime*: Phát `socketPhat.yeuCauDoiCaMoi` và `socketPhat.ketQuaDuyetCa`.
  - *Kiểm thử*: Quản lý ca và đổi ca đã được kiểm thử trong `kiemThuBackend.js` (Nhóm 7).
- **Tầng Frontend Client**:
  - Màn hình Lịch phân ca Admin (`TrangLichPhanCaAdmin.jsx`), Phê duyệt đổi ca Admin (`TrangDuyetNghiDoiCaAdmin.jsx`) và Xem ca cá nhân của Phục vụ (`TrangCaLamViecNhanVien.jsx`) đã gọi API thật 100%.
  - **Điểm khuyết trên UI**: Trên `TrangCaLamViecNhanVien.jsx:136-137`, trạng thái điểm danh chỉ hiển thị dưới dạng chuỗi văn bản tĩnh. Hoàn toàn không có nút bấm "Điểm danh vào ca" hay "Kết thúc ca" để gọi API check-in / check-out.

---

## PHẦN III: DANH MỤC CÁC VỊ TRÍ MOCK DATA, FALLBACK, HARDCODE & LỆCH KIẾN TRÚC

Dưới đây là danh mục chi tiết với **đường dẫn file cụ thể và số dòng mã nguồn chính xác** trong codebase:

### 1. Danh mục Vị trí Mock Data, State Cục Bộ & Alert Thay Vì Gọi API

| STT | File mã nguồn | Dòng cụ thể | Bản chất của Mock / Dữ liệu giả lập | Hệ quả thực tế đối với vận hành |
|:---:|---|:---:|---|---|
| 1 | `frontend/src/dinhTuyen/DinhTuyenUngDung.jsx` | 44–50 | Mặc định nạp 4 món mẫu vào giỏ hàng (`gio_hang_${maBan}`) nếu rỗng. | Khách mới mở bàn đã thấy sẵn 4 món trong giỏ nếu chưa có giỏ cũ. |
| 2 | `frontend/src/dinhTuyen/DinhTuyenUngDung.jsx` | 141–145 | Khối `catch` nuốt lỗi khi `POST /api/don-goi-mon` thất bại, bật alert ngoại tuyến giả lập và chuyển màn hình `theoDoi`. | Khách tưởng đơn đã được gửi nhưng thực tế server không nhận được. |
| 3 | `frontend/src/trang/theoDoiDonMon/TrangTheoDoiMon.jsx` | 14, 18 | `donMon = DON_MAU_BAN_08`. `DinhTuyenUngDung.jsx:197` không truyền prop và không gọi API. | Màn hình theo dõi món của khách 100% hiển thị đơn mẫu Bàn 08. |
| 4 | `frontend/src/trang/theoDoiDonMon/ModalDeXuatThayMon.jsx` | 16–24 | Gắn cứng món đề xuất thay thế (ID 10). Dòng 195 `TrangTheoDoiMon.jsx` xử lý đổi món chỉ bằng `alert()`. | Không cập nhật món thay thế vào đơn trong CSDL SQLite. |
| 5 | `frontend/src/trang/theoDoiDonMon/ModalGoiHoTro.jsx` | 24–31 | Bấm gọi phục vụ/nước đá chỉ in `console.log` (`TrangTheoDoiMon.jsx:170`). | Phục vụ không nhận được thông báo, khách đợi vô vọng. |
| 6 | `frontend/src/trang/thanhToan/TrangYeuCauThanhToanKhach.jsx` | 12, 16 | Nạp hóa đơn mẫu `#HD-0819` (`DON_MAU_BAN_08`), không gọi API tạm tính. | Khách xem tổng tiền giả lập, không đúng với các món khách đã ăn. |
| 7 | `frontend/src/dinhTuyen/DinhTuyenUngDung.jsx` | 210–213 | Nút yêu cầu thanh toán tiền mặt chỉ gọi `alert()`. | Thu ngân tại quầy không nhận được yêu cầu tính tiền của bàn. |
| 8 | `frontend/src/dinhTuyen/DinhTuyenUngDung.jsx` | 247 | Callback `onGuiDanhGia={() => {}}` bị bỏ trống hoàn toàn. | Đánh giá sao và nhận xét của khách không được lưu vào hệ thống. |
| 9 | `frontend/src/trang/thucDonQr/TrangThucDon.jsx` | 136–172 | Banner "Combo sum vầy" gắn cứng `COMBO_GOI_Y` (ID 99) từ `duLieuMau.js`. | Không đồng bộ với thực đơn combo thực tế trong CSDL. |
| 10 | `frontend/src/trang/soDoBan/ModalTrungTamThongBao.jsx` | 14–45 | Danh sách 3 thông báo phục vụ hoàn toàn là mảng tĩnh gắn cứng. | Phục vụ không thấy thông báo đơn mới hay bàn gọi thật từ CSDL. |
| 11 | `frontend/src/trang/soDoBan/ModalDuyetDonQr.jsx` | 9, 20–22 | Nạp `DON_MAU_BAN_08`. Nút duyệt chỉ trừ biến `soThongBao` trong state React. | Không gọi `PUT /api/don-goi-mon/:id/duyet`, đơn không được chuyển sang Bếp. |
| 12 | `frontend/src/trang/soDoBan/ModalTuChoiDonQr.jsx` | 24 | Từ chối đơn chỉ trừ state `soThongBao`, không gọi API từ chối backend. | Đơn bị kẹt ở trạng thái chờ duyệt trong CSDL, không hoàn số suất. |
| 13 | `frontend/src/trang/soDoBan/TrangChiTietBan.jsx` | 16, 21, 53 | Chi tiết bàn nạp tĩnh `DON_MAU_BAN_08`, không gọi `GET /api/don-goi-mon/ban/:banId`. | Phục vụ xem bàn nào cũng chỉ thấy 4 món mẫu của Bàn 08. |
| 14 | `frontend/src/trang/soDoBan/TrangChiTietBan.jsx` | 259–262 | Đặt món hộ chỉ kích hoạt `alert()`, không gọi `POST /api/don-goi-mon`. | Món phục vụ đặt hộ không vào CSDL và không gửi xuống Bếp KDS. |
| 15 | `frontend/src/trang/soDoBan/ModalChuyenBan.jsx` | 8, 19 | Lọc bàn trống từ file mock. Dòng 271 `TrangChiTietBan.jsx` chỉ hiện `alert()`. | Bàn không được chuyển trong CSDL, phiên bàn giữ nguyên bàn cũ. |
| 16 | `frontend/src/trang/soDoBan/ModalGopBan.jsx` | 8, 19 | Lọc bàn có khách từ mock. Dòng 284 `TrangChiTietBan.jsx` chỉ hiện `alert()`. | Không chuyển đơn và không giải phóng bàn phụ trong CSDL. |
| 17 | `frontend/src/trang/soDoBan/ModalYeuCauHuyMon.jsx` | 32 | Yêu cầu hủy món chỉ hiện `alert()` (`TrangChiTietBan.jsx:297-300`). | Không tạo phiếu hủy trong bảng `yeu_cau_huy_mon`, Admin không nhận được. |
| 18 | `frontend/src/trang/dieuPhoiBep/TrangKdsBep.jsx` | 55–64 | Hàng đợi bếp 100% nạp từ `PHIEU_BEP_KDS` và `GOM_MON_KDS`. | Bếp không nhận được order thật từ khách hay phục vụ. |
| 19 | `frontend/src/trang/dieuPhoiBep/TrangKdsBep.jsx` | 67–79, 82–99 | Đổi trạng thái món/phiếu chỉ biến đổi mảng trong React state. | CSDL không cập nhật trạng thái nấu, phục vụ và khách không biết món xong. |
| 20 | `frontend/src/trang/dieuPhoiBep/TrangKdsBep.jsx` | 102–106 | Báo hết món nhanh chỉ lật cờ boolean trong state nội bộ. | Không cập nhật `con_mon = 0` trong SQLite, khách vẫn đặt tiếp được. |
| 21 | `frontend/src/trang/thanhToan/TrangPosKiemBill.jsx` | 29, 36, 72 | Sơ đồ bàn POS nạp tĩnh từ `DANH_SACH_BAN_MAU`. | Thu ngân không thấy trạng thái bàn thật từ CSDL. |
| 22 | `frontend/src/trang/thanhToan/TrangPosKiemBill.jsx` | 29, 90, 202 | Chi tiết bill POS luôn gắn cứng `#HD-0819` của `DON_MAU_BAN_08`. | Thu ngân không kiểm được bill thật của từng bàn. |
| 23 | `frontend/src/trang/thanhToan/TrangPosKiemBill.jsx` | 326–329 | Thanh toán tiền mặt chỉ đóng modal và mở in K80, KHÔNG gọi API. | Doanh thu tiền mặt không vào CSDL, thất thoát toàn bộ dữ liệu tài chính. |
| 24 | `frontend/src/trang/thanhToan/TrangPosKiemBill.jsx` | 339–342 | Thanh toán VietQR POS chỉ đóng modal, KHÔNG gọi API ghi nhận. | Giao dịch chuyển khoản không được lưu vào sổ quỹ CSDL. |
| 25 | `frontend/src/trang/thanhToan/TrangPosKiemBill.jsx` | 351–355 | Tách hóa đơn chỉ dùng `.slice()` mảng và hiện `alert()`. | Không sinh 2 hóa đơn độc lập trong CSDL SQLite. |
| 26 | `frontend/src/trang/thanhToan/TrangPosKiemBill.jsx` | 386–389 | Hoàn tất dọn bàn chỉ hiện `alert()`, không gọi API cập nhật trạng thái. | Bàn không được chuyển sang trạng thái "Cần dọn dẹp" trên hệ thống. |
| 27 | `frontend/src/trang/thanhToan/TrangLichSuHoaDonPos.jsx` | 14–20 | Hiển thị mảng tĩnh 5 hóa đơn giả lập, không gọi API `GET /api/hoa-don`. | Thu ngân không tra cứu được lịch sử các hóa đơn đã thanh toán thật. |
| 28 | `frontend/src/trang/quanTri/TrangTongQuanVanHanh.jsx` | 18, 56, 75 | Dashboard Admin nạp 100% từ `BAO_CAO_DOANH_THU_MAU` tĩnh. | Quản lý nhìn số liệu ảo (18.45tr, 138 khách), không phản ánh thực tế. |
| 29 | `frontend/src/trang/quanTri/TrangDuyetHuyMonAdmin.jsx` | 11–34 | Danh sách yêu cầu hủy món là mảng tĩnh 2 món, duyệt chỉ đổi state React. | Quản lý không duyệt được các món xin hủy thật từ sảnh/bếp. |
| 30 | `frontend/src/trang/quanTri/TrangNhatKyKiemToan.jsx` | 8, 14–18 | Nạp `NHAT_KY_KIEM_TOAN_MAU`, chưa nối `GET /api/he-thong/nhat-ky`. | Không xem được audit log hành vi nhạy cảm thực tế từ CSDL. |
| 31 | `frontend/src/trang/quanTri/TrangPhanHoiKhachHang.jsx` | 8, 11 | Nạp `DANH_GIA_KHACH_HANG_MAU` tĩnh gồm 2 đánh giá mẫu. | Không xem được phản hồi đánh giá sao thực tế của khách hàng. |
| 32 | `frontend/src/trang/quanTri/TrangThongTinNhaHang.jsx` | 8, 20–23 | Nút lưu chỉ gọi `setTimeout`, không gọi `PUT /api/he-thong/cau-hinh`. | Thay đổi tên nhà hàng, địa chỉ, hotline không được lưu vào SQLite. |
| 33 | `frontend/src/trang/quanTri/TrangCauHinhVietQR.jsx` | 8, 18–22 | Nút lưu cấu hình ngân hàng chỉ gọi `setTimeout`, không lưu CSDL. | Cấu hình tài khoản VietQR mới bị mất khi tải lại trang. |

---

### 2. Điểm Nghẽn Kiến Trúc, Hardcode & Lệch Pha Kỹ Thuật

#### Vấn đề 1: Hardcoded Tài khoản Ngân hàng VietQR
- **Vị trí backend**: `backend/modules/hoaDon/hoaDon.service.js:13–18`:
  ```javascript
  const NGAN_HANG_MAC_DINH = {
      bankId: 'ICB', // VietinBank
      accountNo: '102872394829',
      accountName: 'NHA HANG QUAN MOC',
      template: 'compact2'
  };
  ```
- **Vị trí frontend**:
  - `frontend/src/trang/thanhToan/TrangVietQrKhach.jsx:23-26`: Hardcode tài khoản Vietcombank `0071000888999`.
  - `frontend/src/trang/thanhToan/ModalThanhToanVietQrPos.jsx:19-23`: Hardcode tài khoản Vietcombank `0071000888999`.
- **Hệ quả**: Bảng `cau_hinh_nha_hang` trong SQLite có lưu cấu hình VietQR và Admin có thể đổi tài khoản ngân hàng, nhưng Backend và Frontend vẫn sinh mã QR từ các hằng số cứng nói trên. Tiền thanh toán của khách sẽ chuyển nhầm vào tài khoản mặc định.

#### Vấn đề 2: Lệch Schema DDL CSDL (Schema Drift)
- **Vị trí**: `database/taoBang.sql`:
  1. Thiếu định nghĩa cột `so_suat_con_lai INTEGER DEFAULT NULL` trong bảng `mon_an` (dòng 147–163). Cột này có trong tệp SQLite thực tế (`database/coSoDuLieu.sqlite`), nhưng không có trong script DDL `taoBang.sql`. Nếu chạy lại script dựng DB mới, server sẽ sập ngay khi khách đặt món hoặc cập nhật số suất.
  2. Thiếu hoàn toàn câu lệnh `CREATE TABLE lenh_dieu_phoi` (bảng thứ 25 trong SQLite). Bảng này đang được tạo tự phát khi gọi qua `dieuPhoiBepModel.damBaoBangLenhDieuPhoi()` và chưa có index nào.

#### Vấn đề 3: Lệch pha Tên sự kiện Socket.io (Event Name Mismatch)
- **Backend phát** (`backend/cauHinh/cauHinhSocket.js`):
  - Dòng 91: `io.to('phuc_vu').emit('don_hang_moi', duLieu)` *(dùng dấu gạch dưới `_`)*
  - Dòng 101: `io.to('phuc_vu').emit('tien_do_mon_an', duLieu)`
  - Dòng 150: `io.emit('dieu_phoi:moi', duLieu)`
- **Frontend App.jsx lắng nghe** (`frontend/src/App.jsx`):
  - Dòng 136: `socket.on('don-mon-moi', ...)` *(dùng dấu gạch ngang `-`)*
  - Dòng 143: `socket.on('trang-thai-mon', ...)`
  - Dòng 157: `socket.on('lenh-bep-khan-cap', ...)`
- **Hệ quả**: Các Toast thông báo toàn cục tại thanh điều hướng `App.jsx` không bao giờ nhận được dữ liệu do lệch tên sự kiện.

#### Vấn đề 4: Thiếu bọc Giao dịch an toàn (ACID Transaction) tại một số thao tác đa bảng
Mặc dù `cauHinh/ketNoiCoSoDuLieu.js` cung cấp hàm chuẩn `chayGiaoDich()`, một số vị trí sau vẫn chạy các câu lệnh ghi CSDL rời rạc:
1. `backend/modules/taiKhoan/taiKhoan.model.js:102–140` (`taoNhanSuVoiTaiKhoan`): Tạo tài khoản sau đó tạo nhân viên bằng try/catch xóa tay `DELETE FROM tai_khoan` nếu lỗi thay vì dùng giao dịch.
2. `backend/modules/taiKhoan/taiKhoan.model.js:215–229` (`xoaNhanSu`): Chạy 5 câu `DELETE` liên tiếp không có giao dịch, nếu đứt gãy ở giữa sẽ sinh dữ liệu mồ côi (orphaned rows).
3. `backend/modules/taiKhoan/taiKhoan.model.js:247–260` (`capNhatBanPhuTrach`): Xóa phân công cũ và chạy vòng lặp thêm mới không có giao dịch, đồng thời hardcode `ten_ca: 'ca_toi'` tại dòng 255.
4. `backend/modules/donGoiMon/donGoiMon.service.js:235–237` (`duyetDonQR`): Cập nhật đơn và cập nhật món riêng biệt không qua `chayGiaoDich`.
5. `backend/modules/donGoiMon/donGoiMon.service.js:310–316` (`yeuCauHuyMon`): Chèn phiếu hủy và đổi trạng thái món riêng biệt không qua `chayGiaoDich`.

---

## PHẦN IV: DANH MỤC CHI TIẾT TOÀN BỘ 74 API ENDPOINTS BACKEND

Dưới đây là bảng thẩm định chi tiết 74 API Endpoints của hệ thống Backend Quán Mộc:

| STT | Method | Đường dẫn Endpoint | Vị trí Controller (File & Dòng) | Thao tác CSDL SQLite thật | Phát Socket.io Realtime | Hỗ trợ Transaction | Trạng thái Kiểm thử `kiemThuBackend.js` |
|:---:|:---:|:---|:---|:---|:---|:---|:---:|
| 1 | `GET` | `/api/kiem-tra-suc-khoe` | `backend/ungDung.js:49` | Không (trả JSON server status) | Không | Không | ✅ Đã kiểm thử (Nhóm 1) |
| 2 | `POST` | `/api/tai-khoan/dang-nhap` | `taiKhoan.controller.js:10` | Đọc `tai_khoan`, `vai_tro`, `nhan_vien`, ghi `nhat_ky_kiem_toan` | Không | Không | ✅ Đã kiểm thử (Nhóm 2, 9) |
| 3 | `GET` | `/api/tai-khoan/me` | `taiKhoan.controller.js:30` | Đọc `tai_khoan`, `vai_tro`, `nhan_vien` | Không | Không | ⚠️ Kiểm thử từ chối 401 |
| 4 | `PUT` | `/api/tai-khoan/doi-mat-khau` | `taiKhoan.controller.js:39` | Cập nhật `tai_khoan`, ghi `nhat_ky_kiem_toan` | Không | Không | ❌ Chưa có kiểm thử |
| 5 | `GET` | `/api/tai-khoan/nhan-su` | `taiKhoan.controller.js:53` | Đọc `nhan_vien`, `tai_khoan`, `vai_tro`, `phan_cong_ban` | Không | Không | ✅ Đã kiểm thử (Nhóm 10) |
| 6 | `POST` | `/api/tai-khoan/nhan-su` | `taiKhoan.controller.js:71` | Ghi `tai_khoan`, `nhan_vien`, ghi `nhat_ky_kiem_toan` | Không | ⚠️ Thiếu chayGiaoDich | ✅ Đã kiểm thử (Nhóm 10) |
| 7 | `PUT` | `/api/tai-khoan/nhan-su/:id/trang-thai` | `taiKhoan.controller.js:113` | Cập nhật `nhan_vien`, `tai_khoan`, ghi audit | Không | Không | ✅ Đã kiểm thử (Nhóm 10) |
| 8 | `GET` | `/api/tai-khoan/nhan-su/:id` | `taiKhoan.controller.js:62` | Đọc `nhan_vien`, `tai_khoan`, `vai_tro` | Không | Không | ❌ Chưa có kiểm thử |
| 9 | `PUT` | `/api/tai-khoan/nhan-su/:id` | `taiKhoan.controller.js:93` | Cập nhật `nhan_vien`, `tai_khoan`, ghi audit | Không | Không | ✅ Đã kiểm thử (Nhóm 10) |
| 10 | `DELETE` | `/api/tai-khoan/nhan-su/:id` | `taiKhoan.controller.js:123` | Xóa `yeu_cau_doi_ca`, `ca_lam_viec`, `phan_cong_ban`, `nhan_vien`, `tai_khoan` | Không | ⚠️ Thiếu chayGiaoDich | ✅ Đã kiểm thử (Nhóm 10) |
| 11 | `GET` | `/api/tai-khoan/nhan-su/:id/ban-phu-trach` | `taiKhoan.controller.js:132` | Đọc `phan_cong_ban`, `ban_an`, `khu_vuc` | Không | Không | ❌ Chưa có kiểm thử |
| 12 | `PUT` | `/api/tai-khoan/nhan-su/:id/ban-phu-trach` | `taiKhoan.controller.js:141` | Xóa & thêm `phan_cong_ban`, ghi audit | Không | ⚠️ Thiếu chayGiaoDich | ❌ Chưa có kiểm thử |
| 13 | `GET` | `/api/ban-an/khu-vuc` | `banAn.controller.js:98` | Đọc bảng `khu_vuc` | Không | Không | ❌ Chưa có kiểm thử |
| 14 | `GET` | `/api/ban-an/qr/:token` | `banAn.controller.js:29` | Đọc `ban_an`, `khu_vuc`, `phien_ban` | Không | Không | ✅ Đã kiểm thử (Nhóm 3) |
| 15 | `GET` | `/api/ban-an` | `banAn.controller.js:10` | Đọc `ban_an`, `khu_vuc`, `chi_tiet_don_mon`, `hoa_don` | Không | Không | ✅ Đã kiểm thử (Nhóm 3) |
| 16 | `GET` | `/api/ban-an/:id` | `banAn.controller.js:20` | Đọc `ban_an`, `khu_vuc` | Không | Không | ❌ Chưa có kiểm thử |
| 17 | `POST` | `/api/ban-an` | `banAn.controller.js:118` | Ghi `ban_an`, ghi `nhat_ky_kiem_toan` | Không | Không | ✅ Đã kiểm thử (Nhóm 9) |
| 18 | `PUT` | `/api/ban-an/:id` | `banAn.controller.js:107` | Cập nhật `ban_an`, ghi audit | `socketPhat.trangThaiBan` | Không | ❌ Chưa có kiểm thử |
| 19 | `DELETE` | `/api/ban-an/:id` | `banAn.controller.js:128` | Soft delete `ban_an (kich_hoat=0)` | Không | Không | ✅ Đã kiểm thử (Nhóm 9) |
| 20 | `POST` | `/api/ban-an/:id/mo-ban` | `banAn.controller.js:38` | Thêm `phien_ban`, cập nhật `ban_an`, ghi audit | `socketPhat.trangThaiBan` | ✅ Có `chayGiaoDich` | ❌ Chưa có kiểm thử |
| 21 | `POST` | `/api/ban-an/chuyen-ban` | `banAn.controller.js:51` | Cập nhật `phien_ban`, đổi 2 `ban_an`, ghi audit | `socketPhat.trangThaiBan` | ✅ Có `chayGiaoDich` | ❌ Chưa có kiểm thử |
| 22 | `POST` | `/api/ban-an/gop-ban` | `banAn.controller.js:68` | Chuyển đơn, đóng phiên bàn, giải phóng bàn | `socketPhat.trangThaiBan` | ✅ Có `chayGiaoDich` | ❌ Chưa có kiểm thử |
| 23 | `PUT` | `/api/ban-an/:id/trang-thai` | `banAn.controller.js:85` | Cập nhật trạng thái `ban_an`, ghi audit | `socketPhat.trangThaiBan` | Không | ❌ Chưa có kiểm thử |
| 24 | `GET` | `/api/thuc-don` | `thucDon.controller.js:10` | Đọc `danh_muc_mon`, `mon_an` | Không | Không | ✅ Đã kiểm thử (Nhóm 3) |
| 25 | `GET` | `/api/thuc-don/:id` | `thucDon.controller.js:24` | Đọc `mon_an`, `danh_muc_mon`, `combo_chi_tiet` | Không | Không | ✅ Đã kiểm thử (Nhóm 11) |
| 26 | `PUT` | `/api/thuc-don/:id/trang-thai-mon` | `thucDon.controller.js:33` | Cập nhật `mon_an (con_mon)`, ghi audit | `thuc_don:cap_nhat_con_mon` | Không | ❌ Chưa có kiểm thử |
| 27 | `PUT` | `/api/thuc-don/:id/so-suat` | `thucDon.controller.js:46` | Cập nhật `mon_an (so_suat_con_lai)`, ghi audit | `thuc_don:cap_nhat_so_suat` | Không | ✅ Đã kiểm thử (Nhóm 11) |
| 28 | `POST` | `/api/thuc-don` | `thucDon.controller.js:59` | Thêm `mon_an`, ghi audit | `thuc_don:them_mon_moi` | Không | ✅ Đã kiểm thử (Nhóm 11) |
| 29 | `PUT` | `/api/thuc-don/:id` | `thucDon.controller.js:82` | Cập nhật `mon_an`, ghi audit | `thuc_don:cap_nhat_mon` | Không | ❌ Chưa có kiểm thử |
| 30 | `DELETE` | `/api/thuc-don/:id` | `thucDon.controller.js:95` | Soft delete `mon_an (kich_hoat=0)` | `thuc_don:xoa_mon` | Không | ✅ Đã kiểm thử (Nhóm 11) |
| 31 | `POST` | `/api/don-goi-mon` | `donGoiMon.controller.js:10` | Tạo phiên, thêm đơn & món, trừ số suất | `donHangMoi`, `trangThaiBan` | ✅ Có `chayGiaoDich` | ✅ Đã kiểm thử (Nhóm 4, 11) |
| 32 | `GET` | `/api/don-goi-mon/ban/:banId` | `donGoiMon.controller.js:29` | Đọc `phien_ban`, `chi_tiet_don_mon`, `don_goi_mon` | Không | Không | ❌ Chưa có kiểm thử |
| 33 | `GET` | `/api/don-goi-mon/cho-duyet` | `donGoiMon.controller.js:39` | Đọc `don_goi_mon`, `phien_ban`, `ban_an`, `khu_vuc` | Không | Không | ❌ Chưa có kiểm thử |
| 34 | `PUT` | `/api/don-goi-mon/:id/duyet` | `donGoiMon.controller.js:48` | Cập nhật đơn `'da_duyet'`, món `'dang_nau'` | `socketPhat.tienDoMonAn` | ⚠️ Thiếu chayGiaoDich | ✅ Đã kiểm thử (Nhóm 4) |
| 35 | `PUT` | `/api/don-goi-mon/:id/tu-choi` | `donGoiMon.controller.js:59` | Cập nhật đơn `'tu_choi'`, hoàn lại số suất | `socketPhat.donHangMoi` | ⚠️ Thiếu chayGiaoDich | ❌ Chưa có kiểm thử |
| 36 | `POST` | `/api/don-goi-mon/huy-mon` | `donGoiMon.controller.js:71` | Hủy ngay hoặc ghi bảng `yeu_cau_huy_mon` | `co_yeu_cau_huy_mon` | ⚠️ Thiếu chayGiaoDich | ❌ Chưa có kiểm thử |
| 37 | `GET` | `/api/dieu-phoi-bep/hang-doi` | `dieuPhoiBep.controller.js:10` | Đọc `chi_tiet_don_mon`, tính phút chờ (bàn/gom) | Không | Không | ✅ Đã kiểm thử (Nhóm 5) |
| 38 | `GET` | `/api/dieu-phoi-bep/da-hoan-thanh` | `dieuPhoiBep.controller.js:20` | Đọc món hoàn thành trong 60 phút qua | Không | Không | ❌ Chưa có kiểm thử |
| 39 | `PUT` | `/api/dieu-phoi-bep/chi-tiet/:id/trang-thai` | `dieuPhoiBep.controller.js:29` | Đổi trạng thái `dang_nau`/`hoan_thanh`/`da_phuc_vu` | `socketPhat.tienDoMonAn` | Không | ✅ Đã kiểm thử (Nhóm 5) |
| 40 | `PUT` | `/api/dieu-phoi-bep/chi-tiet/:id/uu-tien` | `dieuPhoiBep.controller.js:50` | Cập nhật `chi_tiet_don_mon (la_uu_tien)` | `socketPhat.tienDoMonAn` | Không | ❌ Chưa có kiểm thử |
| 41 | `POST` | `/api/dieu-phoi-bep/phat-lenh` | `dieuPhoiBep.controller.js:66` | Ghi bảng `lenh_dieu_phoi`, ghi audit | `dieu_phoi:moi` & room | Không | ✅ Đã kiểm thử (Nhóm 13) |
| 42 | `GET` | `/api/dieu-phoi-bep/lich-su-lenh` | `dieuPhoiBep.controller.js:75` | Đọc bảng `lenh_dieu_phoi` | Không | Không | ✅ Đã kiểm thử (Nhóm 13) |
| 43 | `PUT` | `/api/dieu-phoi-bep/lenh/:id/xac-nhan` | `dieuPhoiBep.controller.js:85` | Cập nhật lệnh `'da_tiep_nhan'` | `dieu_phoi:da_tiep_nhan` | Không | ✅ Đã kiểm thử (Nhóm 13) |
| 44-50 | - | *(Route alias `/api/dieu-phoi/*`)* | `dieuPhoiBep.controller.js` | *(Ánh xạ cùng router điều phối bếp)* | - | - | *(Tương ứng 37-43)* |
| 51 | `GET` | `/api/hoa-don` | `hoaDon.controller.js:10` | Đọc `hoa_don`, `phien_ban`, `ban_an`, `nhan_vien` | Không | Không | ✅ Đã kiểm thử (Nhóm 6) |
| 52 | `GET` | `/api/hoa-don/tam-tinh/:banId` | `hoaDon.controller.js:36` | Đọc tạm tính, VAT 8%, sinh URL VietQR | Không | Không | ✅ Đã kiểm thử (Nhóm 6) |
| 53 | `GET` | `/api/hoa-don/:id` | `hoaDon.controller.js:26` | Đọc `hoa_don`, `chi_tiet_hoa_don`, `chia_tien_nhom` | Không | Không | ❌ Chưa có kiểm thử |
| 54 | `POST` | `/api/hoa-don/tao-hoa-don` | `hoaDon.controller.js:47` | Thêm `hoa_don` & `chi_tiet_hoa_don` | Không | ✅ Có `chayGiaoDich` | ❌ Chưa có kiểm thử |
| 55 | `POST` | `/api/hoa-don/:id/thanh-toan` | `hoaDon.controller.js:66` | Đóng phiên bàn, đổi bàn dọn dẹp, ghi sổ quỹ | `thanhToanThanhCong`, `trangThaiBan` | ✅ Có `chayGiaoDich` | ❌ Chưa có kiểm thử |
| 56 | `POST` | `/api/hoa-don/:id/chia-tien` | `hoaDon.controller.js:98` | Thêm `chia_tien_nhom`, sinh VietQR chia đều | Không | Không | ✅ Đã kiểm thử (Nhóm 6) |
| 57 | `GET` | `/api/ca-lam-viec/lich-ca-nhan` | `caLamViec.controller.js:10` | Đọc `ca_lam_viec`, `nhan_vien`, `tai_khoan` | Không | Không | ✅ Đã kiểm thử (Nhóm 7) |
| 58 | `GET` | `/api/ca-lam-viec/tat-ca-lich` | `caLamViec.controller.js:24` | Đọc toàn bộ `ca_lam_viec`, `nhan_vien` | Không | Không | ❌ Chưa có kiểm thử |
| 59 | `POST` | `/api/ca-lam-viec/tao-ca` | `caLamViec.controller.js:34` | Thêm `ca_lam_viec`, ghi audit | Không | Không | ✅ Đã kiểm thử (Nhóm 7) |
| 60 | `PUT` | `/api/ca-lam-viec/:id` | `caLamViec.controller.js:43` | Cập nhật `ca_lam_viec`, ghi audit | Không | Không | ❌ Chưa có kiểm thử |
| 61 | `DELETE` | `/api/ca-lam-viec/:id` | `caLamViec.controller.js:53` | Xóa `yeu_cau_doi_ca`, `ca_lam_viec` | Không | ⚠️ Thiếu chayGiaoDich | ❌ Chưa có kiểm thử |
| 62 | `PUT` | `/api/ca-lam-viec/:id/checkin` | `caLamViec.controller.js:63` | Cập nhật `ca_lam_viec ('da_checkin')` | Không | Không | ❌ Chưa có kiểm thử |
| 63 | `PUT` | `/api/ca-lam-viec/:id/checkout` | `caLamViec.controller.js:74` | Cập nhật `ca_lam_viec ('da_hoan_thanh')` | Không | Không | ❌ Chưa có kiểm thử |
| 64 | `GET` | `/api/ca-lam-viec/yeu-cau-doi-ca` | `caLamViec.controller.js:85` | Đọc `yeu_cau_doi_ca`, `nhan_vien`, `ca_lam_viec` | Không | Không | ✅ Đã kiểm thử (Nhóm 7) |
| 65 | `POST` | `/api/ca-lam-viec/yeu-cau-doi-ca` | `caLamViec.controller.js:104` | Thêm `yeu_cau_doi_ca` | `yeuCauDoiCaMoi` | Không | ✅ Đã kiểm thử (Nhóm 7) |
| 66 | `PUT` | `/api/ca-lam-viec/yeu-cau-doi-ca/:id/phe-duyet` | `caLamViec.controller.js:123` | Cập nhật yêu cầu, hoán đổi/hủy ca | `ketQuaDuyetCa` | ✅ Có `chayGiaoDich` | ✅ Đã kiểm thử (Nhóm 7) |
| 67 | `GET` | `/api/he-thong/cau-hinh` | `heThong.controller.js:10` | Đọc `cau_hinh_nha_hang` | Không | Không | ✅ Đã kiểm thử (Nhóm 8) |
| 68 | `PUT` | `/api/he-thong/cau-hinh` | `heThong.controller.js:19` | Cập nhật `cau_hinh_nha_hang`, ghi audit | Không | Không | ❌ Chưa có kiểm thử |
| 69 | `GET` | `/api/he-thong/nhat-ky` | `heThong.controller.js:28` | Đọc `nhat_ky_kiem_toan`, `tai_khoan` | Không | Không | ✅ Đã kiểm thử (Nhóm 8) |
| 70 | `GET` | `/api/he-thong/thong-ke` | `heThong.controller.js:38` | Đọc doanh thu, số bàn, top món bán chạy | Không | Không | ✅ Đã kiểm thử (Nhóm 8, 9) |
| 71 | `POST` | `/api/he-thong/sinh-du-lieu-mau` | `heThong.controller.js:47` | Chạy module `sinhDuLieuMau()` | Không | Không | ❌ Chưa có kiểm thử |
| 72 | `POST` | `/api/he-thong/lam-sach-du-lieu` | `heThong.controller.js:57` | Chạy module `lamSachDuLieu()` | Không | Không | ❌ Chưa có kiểm thử |
| 73 | `POST` | `/api/he-thong/sao-luu-csdl` | `heThong.controller.js:68` | Chạy module `thucHienSaoLuu()` | Không | Không | ❌ Chưa có kiểm thử |
| 74 | `GET` | `/api/bao-cao/tat-ca` | `baoCao.controller.js:70` | Tổng hợp `Promise.all` 6 báo cáo tài chính | Không | Không | ✅ Đã kiểm thử (Nhóm 12) |
| 75 | `GET` | `/api/bao-cao/tong-quan` | `baoCao.controller.js:10` | Đọc doanh thu, AOV, kênh thanh toán | Không | Không | ❌ Chưa có kiểm thử lẻ |
| 76 | `GET` | `/api/bao-cao/thoi-gian` | `baoCao.controller.js:20` | Đọc doanh thu theo ngày, ca, khung giờ | Không | Không | ✅ Đã kiểm thử (Nhóm 12) |
| 77 | `GET` | `/api/bao-cao/mon-an` | `baoCao.controller.js:30` | Đọc top món, món hủy thất thoát | Không | Không | ✅ Đã kiểm thử (Nhóm 12) |
| 78 | `GET` | `/api/bao-cao/khu-vuc-ban` | `baoCao.controller.js:40` | Đọc doanh thu theo khu vực, hiệu suất bàn | Không | Không | ✅ Đã kiểm thử (Nhóm 12) |
| 79 | `GET` | `/api/bao-cao/so-quy` | `baoCao.controller.js:50` | Đọc tiền mặt, VietQR, tồn két Z-Report | Không | Không | ✅ Đã kiểm thử (Nhóm 12) |
| 80 | `GET` | `/api/bao-cao/kenh-danh-gia` | `baoCao.controller.js:60` | Đọc tỷ trọng kênh, đánh giá sao, năng suất | Không | Không | ✅ Đã kiểm thử (Nhóm 12) |
| 81 | `GET` | `/api/bao-cao/xuat-csv` | `baoCao.controller.js:80` | Xuất file CSV UTF-8 có BOM cho Excel | Không | Không | ✅ Đã kiểm thử (Nhóm 12) |

### Tổng hợp thống kê API:
- **Tổng số endpoint độc lập**: **74 endpoints**.
- **Kết nối SQLite thật**: **73 / 74 (98.6%)** (Duy nhất 1 endpoint `/api/kiem-tra-suc-khoe` trả JSON trạng thái).
- **Phát Socket.io realtime thật**: **15 endpoints**.
- **Có hỗ trợ Transaction ACID (`chayGiaoDich`)**: **6 endpoints** (`mo-ban`, `chuyen-ban`, `gop-ban`, `don-goi-mon`, `tao-hoa-don`, `thanh-toan`, `phe-duyet-doi-ca`).
- **Độ bao phủ kiểm thử tích hợp (`kiemThuBackend.js`)**: **41 endpoints đã kiểm thử (55.4%)**, còn **33 endpoints chưa có kiểm thử tự động (44.6%)**.

---

## PHẦN V: KẾ HOẠCH HÀNH ĐỘNG & LỘ TRÌNH CHUẨN HÓA SANG PRODUCTION

Để đưa hệ thống Quán Mộc POS & E-Menu vào vận hành thực tế tại nhà hàng, lộ trình chuẩn hóa kỹ thuật được phân chia thành 3 giai đoạn theo mức độ ưu tiên nghiệp vụ:

```
[ Giai đoạn P0: CHẶN LỖI & CHỐNG GIAN LẬN ]
               │
               ▼
[ Giai đoạn P1: ĐỒNG BỘ LUỒNG TÁC NGHIỆP CỐT LÕI ]
               │
               ▼
[ Giai đoạn P2: HOÀN THIỆN REALTIME & TRẢI NGHIỆM ]
```

### 1. Giai đoạn P0: Chặn Lỗi, Chống Thất Thoát Tài Chính & Đảm Bảo Toàn Vẹn Dữ Liệu
*Mục tiêu*: Đảm bảo không xảy ra sai lệch tiền bạc, tránh xung đột CSDL và ngăn chặn gian lận tại quầy thu ngân.

1. **Chuẩn hóa luồng Thanh toán POS sang SQLite CSDL thật**:
   - Chỉnh sửa `frontend/src/trang/thanhToan/TrangPosKiemBill.jsx`:
     - Khi mở modal thanh toán tiền mặt (`ModalThanhToanTienMat`) hoặc VietQR (`ModalThanhToanVietQrPos`), sau khi xác nhận phải gọi `api.post('/api/hoa-don/' + hoaDonId + '/thanh-toan', { phuongThuc, soTienKhachDua })`.
     - Nhận phản hồi thành công mới đóng phiên bàn và chuyển sang in hóa đơn.
2. **Khắc phục Hardcoded Tài khoản Ngân hàng VietQR**:
   - Chỉnh sửa `backend/modules/hoaDon/hoaDon.service.js` (dòng 40, 81, 326): Đọc cấu hình ngân hàng từ bảng `cau_hinh_nha_hang` thay vì hằng số `NGAN_HANG_MAC_DINH`.
   - Chỉnh sửa `TrangVietQrKhach.jsx` và `ModalThanhToanVietQrPos.jsx`: Đọc thông tin VietQR từ API cấu hình hệ thống hoặc API hóa đơn tạm tính.
3. **Đồng bộ Schema DDL CSDL (`database/taoBang.sql`)**:
   - Thêm cột `so_suat_con_lai INTEGER DEFAULT NULL` vào câu lệnh `CREATE TABLE mon_an`.
   - Bổ sung định nghĩa `CREATE TABLE lenh_dieu_phoi` kèm các chỉ mục trên cột `ngay_tao`, `trang_thai`, `phong_ban_nhan`.
4. **Bổ sung Giao dịch ACID (`chayGiaoDich`)**:
   - Bọc giao dịch cho các hàm: `duyetDonQR`, `yeuCauHuyMon` trong `donGoiMon.service.js`; `taoNhanSuVoiTaiKhoan`, `xoaNhanSu`, `capNhatBanPhuTrach` trong `taiKhoan.model.js`.
5. **Xây dựng API Quản lý Duyệt / Từ chối hủy món**:
   - Bổ sung route `PUT /api/don-goi-mon/yeu-cau-huy-mon/:id/phe-duyet` trong `donGoiMon.routes.js`.
   - Kết nối `frontend/src/trang/quanTri/TrangDuyetHuyMonAdmin.jsx` với API này để Quản lý duyệt hủy món thật từ CSDL, cập nhật doanh thu và số suất thất thoát.

### 2. Giai đoạn P1: Đồng Bộ Luồng Tác Nghiệp Cốt Lõi (Sảnh - Bếp - POS)
*Mục tiêu*: Xóa bỏ hoàn toàn dữ liệu mẫu trong quá trình phục vụ, nấu ăn và tính tiền.

1. **Chuẩn hóa Bếp KDS (`TrangKdsBep.jsx`)**:
   - Xóa bỏ nạp `PHIEU_BEP_KDS` và `GOM_MON_KDS`.
   - Nạp hàng đợi ban đầu bằng `api.get('/api/dieu-phoi-bep/hang-doi?cheDo=' + cheDo)`.
   - Lắng nghe sự kiện Socket `don_hang_moi` để tự động đẩy phiếu mới vào hàng đợi.
   - Kết nối thao tác "Nấu món", "Xong món" với `api.put('/api/dieu-phoi-bep/chi-tiet/' + id + '/trang-thai')`.
   - Kết nối "Khóa món hết hàng" với `api.put('/api/thuc-don/' + id + '/trang-thai-mon')`.
2. **Chuẩn hóa Thao tác Phục vụ sảnh (`TrangSoDoBan.jsx` & `TrangChiTietBan.jsx`)**:
   - Duyệt đơn QR (`ModalDuyetDonQr.jsx`): Gọi `api.put('/api/don-goi-mon/' + donId + '/duyet')`.
   - Từ chối đơn QR (`ModalTuChoiDonQr.jsx`): Gọi `api.put('/api/don-goi-mon/' + donId + '/tu-choi')`.
   - Chuyển bàn (`ModalChuyenBan.jsx`): Nạp danh sách bàn từ API và gọi `api.post('/api/ban-an/chuyen-ban')`.
   - Gộp bàn (`ModalGopBan.jsx`): Gọi `api.post('/api/ban-an/gop-ban')`.
   - Đặt món hộ (`ModalDatMonHoKhach.jsx`): Gọi `api.post('/api/don-goi-mon')`.
   - Lắng nghe Socket `trang_thai_ban` để tự động đổi màu sơ đồ bàn ăn khi có khách hoặc dọn bàn.
3. **Chuẩn hóa Màn hình Theo dõi món của Thực khách (`TrangTheoDoiMon.jsx`)**:
   - Nhận `banId` và `donHangId` từ URL hoặc context.
   - Gọi `api.get('/api/don-goi-mon/ban/' + banId)` để hiển thị danh sách món thực tế đang nấu.
   - Lắng nghe Socket `tien_do_mon_an` trên phòng `ban_${banId}` để cập nhật thanh tiến độ từng món.
4. **Chuẩn hóa Sơ đồ bàn và Kiểm bill tại POS (`TrangPosKiemBill.jsx`)**:
   - Đọc danh sách bàn từ `api.get('/api/ban-an')`.
   - Khi click chọn bàn, gọi `api.get('/api/hoa-don/tam-tinh/' + banId)` để hiển thị đúng bill thực tế thay cho `#HD-0819`.

### 3. Giai đoạn P2: Hoàn Thiện Realtime, Điểm Danh & Trải Nghiệm Người Dùng
*Mục tiêu*: Tối ưu hóa vận hành, hoàn thiện các tính năng hỗ trợ và quản trị tổng quan.

1. **Đồng bộ Lệch pha Tên sự kiện Socket.io**:
   - Chuẩn hóa các bộ lắng nghe tại `frontend/src/App.jsx:136-157` khớp với Backend:
     - Đổi `don-mon-moi` $\rightarrow$ `don_hang_moi`.
     - Đổi `trang-thai-mon` $\rightarrow$ `tien_do_mon_an`.
     - Đổi `lenh-bep-khan-cap` $\rightarrow$ `dieu_phoi:moi`.
2. **Kích hoạt Điểm danh ca làm việc (Check-in / Check-out)**:
   - Thêm 2 nút bấm trên giao diện `frontend/src/trang/caLamViec/TrangCaLamViecNhanVien.jsx`:
     - Nút "Vào ca (Check-in)" $\rightarrow$ gọi `PUT /api/ca-lam-viec/:id/checkin`.
     - Nút "Hết ca (Check-out)" $\rightarrow$ gọi `PUT /api/ca-lam-viec/:id/checkout`.
3. **Kích hoạt Luồng Khách gọi Hỗ trợ & Yêu cầu tính tiền**:
   - Xây dựng API `POST /api/ban-an/:id/ho-tro` lưu vào bảng `yeu_cau_ho_tro`.
   - Chỉnh sửa `ModalGoiHoTro.jsx`: Phát socket hoặc gọi API thay vì chỉ in `console.log`.
   - Chỉnh sửa `TrangYeuCauThanhToanKhach.jsx`: Phát tín hiệu `khach_yeu_cau_thanh_toan` tới phòng `thu_ngan`.
4. **Kích hoạt Luồng Khách gửi Đánh giá dịch vụ**:
   - Xây dựng API `POST /api/hoa-don/:id/danh-gia` lưu vào bảng `danh_gia`.
   - Nối hàm `onGuiDanhGia` trong `DinhTuyenUngDung.jsx:247`.
   - Nối `TrangPhanHoiKhachHang.jsx` để Admin xem đánh giá thật.
5. **Nối API cho Dashboard Tổng quan Admin (A01)**:
   - Chỉnh sửa `frontend/src/trang/quanTri/TrangTongQuanVanHanh.jsx`: Gọi `api.get('/api/he-thong/thong-ke')` để hiển thị doanh thu, đơn hàng, khách hàng thật từ CSDL.
6. **Nối API Cấu hình nhà hàng & Nhật ký kiểm toán**:
   - `TrangThongTinNhaHang.jsx` & `TrangCauHinhVietQR.jsx`: Gọi `GET /api/he-thong/cau-hinh` và `PUT /api/he-thong/cau-hinh`.
   - `TrangNhatKyKiemToan.jsx`: Gọi `GET /api/he-thong/nhat-ky`.
7. **Bổ sung Bộ kiểm thử tự động cho 33 endpoints còn lại**:
   - Mở rộng tệp `backend/kiemThuBackend.js` thêm các nhóm kiểm thử cho luồng: Hoàn tất thanh toán (`POST /thanh-toan`), Chuyển bàn, Gộp bàn, Check-in/Check-out ca làm việc để đạt độ bao phủ kiểm thử 100%.

---

### Danh mục Tệp và Hàm Cụ Thể Cần Chỉnh Sửa Khi Triển Khai Thực Tế

| STT | File cần chỉnh sửa | Hàm / Thành phần cần sửa | Mục tiêu can thiệp |
|:---:|---|---|---|
| 1 | `backend/modules/hoaDon/hoaDon.service.js` | `taoHoaDonTamTinh`, `taoHoaDon`, `xacNhanThanhToan` | Thay `NGAN_HANG_MAC_DINH` bằng truy vấn bảng `cau_hinh_nha_hang`. |
| 2 | `database/taoBang.sql` | `mon_an`, `lenh_dieu_phoi` | Bổ sung cột `so_suat_con_lai` và định nghĩa DDL bảng `lenh_dieu_phoi`. |
| 3 | `backend/modules/donGoiMon/donGoiMon.routes.js` | Thêm route `PUT /yeu-cau-huy-mon/:id/phe-duyet` | Cho phép Quản lý duyệt hoặc từ chối phiếu hủy món. |
| 4 | `backend/modules/donGoiMon/donGoiMon.service.js` | `duyetDonQR`, `yeuCauHuyMon`, `pheDuyetHuyMon` | Bọc `chayGiaoDich` và viết logic duyệt phiếu hủy món. |
| 5 | `backend/modules/taiKhoan/taiKhoan.model.js` | `taoNhanSuVoiTaiKhoan`, `xoaNhanSu`, `capNhatBanPhuTrach` | Bọc `chayGiaoDich` cho các câu lệnh DELETE/INSERT liên hoàn. |
| 6 | `frontend/src/App.jsx` | `useEffect` (dòng 136–157) | Đồng bộ tên sự kiện Socket: `don_hang_moi`, `tien_do_mon_an`, `dieu_phoi:moi`. |
| 7 | `frontend/src/dinhTuyen/DinhTuyenUngDung.jsx` | `handleGuiDon`, `gioHang`, `onThanhToanTienMat` | Xóa 4 món mẫu mặc định; xóa nuốt lỗi offline; nối API theo dõi đơn. |
| 8 | `frontend/src/trang/theoDoiDonMon/TrangTheoDoiMon.jsx` | `TrangTheoDoiMon`, `onGuiYeuCau` | Gọi `GET /api/don-goi-mon/ban/:id`; phát socket khi gọi hỗ trợ. |
| 9 | `frontend/src/trang/soDoBan/TrangSoDoBan.jsx` | `TrangSoDoBan`, `useEffect` | Lắng nghe Socket `trang_thai_ban` để reload sơ đồ bàn tự động. |
| 10 | `frontend/src/trang/soDoBan/ModalDuyetDonQr.jsx` | `handleDuyet`, `handleTuChoi` | Gọi `api.put('/api/don-goi-mon/' + donId + '/duyet')` và `/tu-choi`. |
| 11 | `frontend/src/trang/soDoBan/ModalChuyenBan.jsx` | `handleXacNhan` | Gọi `api.post('/api/ban-an/chuyen-ban', { banNguonId, banDichId })`. |
| 12 | `frontend/src/trang/soDoBan/ModalGopBan.jsx` | `handleXacNhan` | Gọi `api.post('/api/ban-an/gop-ban', { banNguonId, banDichId })`. |
| 13 | `frontend/src/trang/soDoBan/ModalYeuCauHuyMon.jsx` | `handleGuiYeuCau` | Gọi `api.post('/api/don-goi-mon/huy-mon', { chiTietId, lyDo })`. |
| 14 | `frontend/src/trang/dieuPhoiBep/TrangKdsBep.jsx` | `TrangKdsBep`, `capNhatTrangThaiMon`, `toggleHetMon` | Nối API `hang-doi`, API `chi-tiet/:id/trang-thai`, API `trang-thai-mon`. |
| 15 | `frontend/src/trang/thanhToan/TrangPosKiemBill.jsx` | `TrangPosKiemBill`, `onThanhToan` | Nối API `GET /api/ban-an`, `GET /tam-tinh/:id`, `POST /:id/thanh-toan`. |
| 16 | `frontend/src/trang/thanhToan/ModalThanhToanVietQrPos.jsx` | `ModalThanhToanVietQrPos` | Đọc cấu hình ngân hàng thật từ CSDL, gọi API thanh toán khi xác nhận. |
| 17 | `frontend/src/trang/caLamViec/TrangCaLamViecNhanVien.jsx` | `TrangCaLamViecNhanVien` | Bổ sung 2 nút bấm Check-in và Check-out gọi API ca làm việc. |
| 18 | `frontend/src/trang/quanTri/TrangTongQuanVanHanh.jsx` | `TrangTongQuanVanHanh` | Gọi `api.get('/api/he-thong/thong-ke')` để hiển thị dashboard thật. |
| 19 | `frontend/src/trang/quanTri/TrangDuyetHuyMonAdmin.jsx` | `TrangDuyetHuyMonAdmin` | Nối API đọc danh sách yêu cầu hủy và duyệt/từ chối từ CSDL. |
| 20 | `frontend/src/trang/quanTri/TrangNhatKyKiemToan.jsx` | `TrangNhatKyKiemToan` | Gọi `api.get('/api/he-thong/nhat-ky')` thay cho mảng tĩnh. |
| 21 | `frontend/src/trang/quanTri/TrangThongTinNhaHang.jsx` | `handleLuu` | Gọi `api.put('/api/he-thong/cau-hinh')` lưu vào SQLite. |

---

## PHẦN VI: PHƯƠNG PHÁP XÁC MINH ĐỘC LẬP (VERIFICATION METHOD)

Bất kỳ kiểm thử viên hoặc kiểm toán viên kỹ thuật nào cũng có thể độc lập thẩm định tính xác thực của toàn bộ báo cáo này bằng các thao tác dòng lệnh sau trong thư mục dự án (`d:\PHAT TRIEN WEB\quan ly nha hang`):

### 1. Xác minh Bộ kiểm thử Backend 13 nhóm (100% PASS)
Chạy lệnh Node.js thực thi bài kiểm thử:
```powershell
node backend/kiemThuBackend.js
```
*Kết quả hợp lệ*: Máy chủ kiểm thử khởi động trên cổng 3099, chạy qua 13 nhóm kiểm thử và kết thúc bằng thông báo:
`🎉 TẤT CẢ CÁC BÀI KIỂM THỬ BACKEND ĐỀU ĐÃ ĐẠT 100%! (ALL PASSED)` với mã thoát (exit code) bằng 0.

### 2. Xác minh Cấu trúc CSDL SQLite vật lý (25 bảng & 34 chỉ mục)
Chạy lệnh kiểm tra cấu trúc file CSDL thực tế:
```powershell
node -e "const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync('database/coSoDuLieu.sqlite'); console.log('So bang:', db.prepare(\"SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'\").get().c); console.log('So index:', db.prepare(\"SELECT count(*) as c FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'\").get().c);"
```
*Kết quả hợp lệ*: In ra chính xác `So bang: 25` và `So index: 34`.

### 3. Xác minh Schema Drift giữa `taoBang.sql` và CSDL thực tế
Kiểm tra sự thiếu vắng cột `so_suat_con_lai` và bảng `lenh_dieu_phoi`:
```powershell
Select-String -Path database/taoBang.sql -Pattern "so_suat_con_lai"
Select-String -Path database/taoBang.sql -Pattern "lenh_dieu_phoi"
```
*Kết quả hợp lệ*: Cả 2 lệnh đều trả về kết quả rỗng (chứng minh tệp DDL gốc bị thiếu so với CSDL thực tế).

### 4. Xác minh vị trí Hardcoded Ngân hàng VietQR
Kiểm tra sự tồn tại của hằng số mặc định trong backend:
```powershell
Select-String -Path backend/modules/hoaDon/hoaDon.service.js -Pattern "NGAN_HANG_MAC_DINH"
```
*Kết quả hợp lệ*: Khớp dòng 13 (định nghĩa) và các dòng 40, 48, 81, 96, 326.

### 5. Xác minh sự Vắng mặt của Lệnh gọi API trong các Modal Phục vụ & POS
Kiểm tra số lượng file gọi API trong thư mục sơ đồ bàn:
```powershell
Get-ChildItem frontend\src\trang\soDoBan -Filter *.jsx | Select-String -Pattern "api\."
```
*Kết quả hợp lệ*: Chỉ có `TrangSoDoBan.jsx`, `ModalDatMonHoKhach.jsx` và `ModalDieuPhoiPhucVu.jsx` có gọi `api`. Toàn bộ các file `ModalChuyenBan.jsx`, `ModalGopBan.jsx`, `ModalDuyetDonQr.jsx`, `ModalTuChoiDonQr.jsx`, `ModalYeuCauHuyMon.jsx` **hoàn toàn không có bất kỳ lệnh gọi `api.` nào**.

---
*Báo cáo được lập trên cơ sở rà soát mã nguồn thực tế 100%, đối chiếu chéo giữa tệp CSDL vật lý, logic router backend và component giao diện React frontend.*
