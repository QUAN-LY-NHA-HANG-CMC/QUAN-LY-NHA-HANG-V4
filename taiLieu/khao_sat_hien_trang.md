# BÁO CÁO KHẢO SÁT HIỆN TRẠNG CÁC PHẦN MỀM QUẢN LÝ NHÀ HÀNG F&B
## ĐỀ TÀI: XÂY DỰNG HỆ THỐNG QUẢN LÝ NHÀ HÀNG PHỤC VỤ TẠI BÀN (RESTAURANT MANAGEMENT SYSTEM)

---

## 1. MỤC TIÊU KHẢO SÁT
Khảo sát, phân tích chi tiết quy trình nghiệp vụ, ưu điểm, nhược điểm và mô hình triển khai của hai giải pháp quản lý F&B phổ biến và hàng đầu tại thị trường Việt Nam:
1. **Phần mềm 1 (PM1): iPOS.vn** (Hệ sinh thái iPOS FABi)
2. **Phần mềm 2 (PM2): KiotViet F&B** (Phân hệ nhà hàng, cafe của KiotViet)

Từ kết quả khảo sát thực tế, rút ra các bài học kinh nghiệm để định hình kiến trúc, phân rã chức năng và thiết kế giao diện tối ưu cho đồ án môn học.

---

## 2. KHẢO SÁT CHI TIẾT PHẦN MỀM 1 (PM1): iPOS.vn

### 2.1. Giới thiệu tổng quan & Đối tượng phục vụ
- **Nhà phát triển:** Công ty Cổ phần iPOS.vn (thành lập từ năm 2010, hơn 15 năm kinh nghiệm chuyên biệt trong ngành F&B).
- **Quy mô phục vụ:** Hơn 100.000 thương hiệu F&B trên toàn quốc (tiêu biểu: The Coffee House, Cộng Cà Phê, TocoToco, Ding Tea, lẩu nướng Buk Buk, các chuỗi nhà hàng lớn).
- **Định vị & Đối tượng:** Giải pháp chuyên sâu, toàn diện dành cho Nhà hàng ăn uống, Quán cafe, Quán bar, Chuỗi nhà hàng nhượng quyền và các mô hình F&B quy mô từ vừa đến lớn.
- **Hệ sinh thái cốt lõi:**
  - **iPOS FABi / FABiBox:** Phần mềm bán hàng POS chuyên nghiệp tại quầy và thiết bị di động.
  - **iPOS O2O:** Menu điện tử tự phục vụ tại bàn qua mã QR.
  - **iPOS PDA:** Ứng dụng order tại bàn trên thiết bị cầm tay cho nhân viên.
  - **iPOS KDS (Kitchen Display System):** Màn hình hiển thị và điều phối chế biến thông minh cho bếp/bar.
  - **iPOS Inventory & Accounting:** Quản lý kho nguyên vật liệu và kế toán chuyên ngành.
  - **iPOS CRM & FoodHub:** Chăm sóc khách hàng và đồng bộ đơn hàng GrabFood, ShopeeFood.

### 2.2. Quy trình nghiệp vụ cốt lõi
- **Quản lý sơ đồ bàn:**
  - Phân chia trực quan theo tầng, khu vực (trong nhà, ngoài trời, phòng VIP).
  - Thể hiện trạng thái bàn real-time: Bàn trống (xám/xanh), Có khách (cam/đỏ), Đặt trước (Booking), Yêu cầu thanh toán.
  - Hỗ trợ chọn bàn mở đơn, chuyển bàn, gộp bàn của các nhóm khách đông, tách bàn / tách hóa đơn độc lập.
- **Quy trình gọi món (Order):**
  - *Order qua nhân viên (iPOS PDA):* Nhân viên phục vụ dùng tablet hoặc máy PDA cầm tay ghi món tại bàn; dữ liệu tức thì đồng bộ về thu ngân và bắn lệnh xuống bếp.
  - *Khách tự order (iPOS O2O QR Code):* Thực khách quét mã QR dán tại bàn bằng camera điện thoại (không cần cài app). Khách xem menu điện tử sinh động, chọn món, chọn thuộc tính (topping, độ ngọt, mức cay), đặt hàng và gọi thêm món nhiều đợt.
- **Điều phối bếp (iPOS KDS & In phiếu bếp):**
  - Màn hình KDS phân trạm bếp nóng, bếp lạnh, quầy pha chế bar.
  - Theo dõi tiến độ chế biến qua 4 trạng thái: **Chờ tiếp nhận -> Đang chế biến -> Hoàn thành -> Đã giao**.
  - Hiển thị màu cảnh báo theo thời gian chờ (xanh lá = mới vào, vàng = đang nấu, đỏ = chờ quá lâu), phát âm thanh cảnh báo.
  - Tính năng "Báo hết món" từ bếp: Ngay lập tức cập nhật lên app phục vụ và menu QR của khách.
- **Thu ngân & Thanh toán:**
  - Hỗ trợ thanh toán: Tiền mặt, thẻ ngân hàng, ví điện tử (MoMo, ZaloPay), VietQR động hiển thị trên màn hình phụ khách hàng.
  - Tích hợp hóa đơn điện tử khởi tạo từ máy tính tiền (iPOS Invoice).
  - Kiểm soát chống gian lận chặt chẽ: Mọi thao tác hủy món, giảm giá sau khi in phiếu tạm tính bắt buộc có mã xác thực của Quản lý.

---

## 3. KHẢO SÁT CHI TIẾT PHẦN MỀM 2 (PM2): KiotViet F&B

### 3.1. Giới thiệu tổng quan & Đối tượng phục vụ
- **Nhà phát triển:** Công ty Cổ phần Công nghệ KiotViet (trực thuộc Citigo, hơn 10 năm phát triển, hệ thống văn phòng tại 34 tỉnh thành).
- **Quy mô phục vụ:** Hơn 50.000 nhà hàng, quán ăn, quán cafe trên cả nước.
- **Định vị & Đối tượng:** Giải pháp quản lý bán hàng phổ thông, tinh gọn, chi phí tiết kiệm dành cho hộ kinh doanh cá thể, quán ăn bình dân, quán cafe nhỏ và vừa, mô hình ăn uống kết hợp bán lẻ.

### 3.2. Quy trình nghiệp vụ cốt lõi
- **Quản lý sơ đồ bàn:**
  - Thiết lập phòng/bàn linh hoạt theo khu vực, hiển thị trực quan trạng thái bàn có khách / bàn trống.
  - Cho phép chuyển bàn, ghép nhiều bàn thành một nhóm hóa đơn, tách một số món sang bàn khác.
  - Hỗ trợ tính tiền dịch vụ theo giờ (cho mô hình kết hợp karaoke, bida, board game).
- **Quy trình gọi món (Order):**
  - *Nhân viên phục vụ:* Dùng ứng dụng KiotViet Bán hàng trên điện thoại cá nhân (Android/iOS) hoặc tablet để chọn bàn, ghi nhận món ăn, thêm ghi chú món.
  - *Khách gọi món qua QR:* Tạo mã QR theo từng bàn để thực khách xem thực đơn điện tử và gửi yêu cầu gọi món.
  - Order tự động lưu vào hệ thống và chuyển lệnh in xuống bếp/bar.
- **Điều phối bếp & In hóa đơn:**
  - Tối ưu hóa việc in phiếu order qua mạng LAN/Wifi tới máy in bếp, máy in bar chuyên dụng.
  - Màn hình KDS cơ bản hỗ trợ chế độ "gom món" (ví dụ: gộp các bàn cùng gọi món "Mì xào bò" để đầu bếp nấu cùng một mẻ).
- **Thu ngân & Thanh toán:**
  - Thao tác nhanh trên máy tính/POS để in hóa đơn tạm tính và hóa đơn thanh toán.
  - Tích hợp VietQR động, thẻ tín dụng Visa/Mastercard, ví điện tử MoMo, ZaloPay.
  - Tích hợp màn hình QR hiển thị tại quầy (KV99) và Loa phát giọng nói khi nhận tiền chuyển khoản thành công (KV66).
  - Tặng kèm hóa đơn điện tử KiotViet và hỗ trợ kê khai thuế cho hộ kinh doanh.

---

## 4. PHÂN TÍCH ƯU - NHƯỢC ĐIỂM CỦA 2 PHẦN MỀM

### 4.1. Phần mềm iPOS.vn
* **Điểm mạnh (Ưu điểm):**
  - **Chuyên sâu tuyệt đối cho F&B:** Thiết kế may đo hoàn hảo cho quy trình phục vụ tại bàn, bếp nhiều phân khu và chuỗi nhà hàng lớn.
  - **Kiểm soát thất thoát hàng đầu:** Cơ chế bảo mật và phân quyền cực kỳ chặt chẽ, ghi vết lịch sử (audit log) mọi thao tác sửa/hủy đơn.
  - **Đồng bộ phần cứng công nghiệp:** Tương thích cao với các dòng máy POS chuyên dụng, hoạt động ổn định kể cả khi mất kết nối Internet (Local Offline mode).
  - **KDS thông minh:** Màn hình bếp trực quan, cảnh báo thời gian trễ và khóa món tức thì khi hết nguyên liệu.
* **Điểm hạn chế (Nhược điểm đối với quán nhỏ & sinh viên làm đồ án):**
  - **Chi phí đầu tư ban đầu cao:** Mua bản quyền theo năm (~3.300.000 đ/năm) và khuyến nghị mua kèm phần cứng chuyên dụng (tổng chi phí từ 10 - 20 triệu đồng).
  - **Cấu hình phức tạp:** Đòi hỏi thời gian thiết lập ban đầu tương đối lâu cho menu, định lượng và phân quyền.
  - **Khó tiếp cận để nghiên cứu/thử nghiệm:** Không có bản web demo miễn phí không ràng buộc thiết bị cho sinh viên học tập.

### 4.2. Phần mềm KiotViet F&B
* **Điểm mạnh (Ưu điểm):**
  - **Giao diện thân thiện, dễ sử dụng:** Giao diện phẳng, thiết kế tối giản, nhân viên chỉ mất 15-30 phút là có thể sử dụng thành thạo.
  - **Chi phí hợp lý:** Phí dịch vụ hàng tháng từ 270.000 đ - 330.000 đ/tháng, đóng linh hoạt.
  - **Tận dụng thiết bị sẵn có:** Chạy hoàn toàn trên nền tảng web và ứng dụng di động, tận dụng điện thoại/tablet/laptop của nhân viên mà không cần mua máy POS đắt tiền.
  - **Chế độ gom món cho bếp:** Tiện lợi cho các quán ăn bình dân chế biến theo mẻ.
* **Điểm hạn chế (Nhược điểm):**
  - **Độ sâu nghiệp vụ F&B chưa bằng iPOS:** Các bài toán phức tạp như điều phối bếp nhiều chặng, order buffet đếm lượt hoặc quản lý kho định lượng nhiều cấp chưa thực sự tối ưu.
  - **Phụ thuộc vào Internet:** Kiến trúc Cloud-first yêu cầu đường truyền mạng liên tục, nếu mạng yếu có thể gây trễ khi gửi order xuống bếp.

---

## 5. BẢNG SO SÁNH TỔNG HỢP TÍNH NĂNG

| Tiêu chí so sánh | iPOS.vn (FABi Ecosystem) | KiotViet F&B | Đề xuất cho Đồ án RMS |
| :--- | :--- | :--- | :--- |
| **Gốc rễ phát triển** | Chuyên biệt 100% cho ngành F&B | Mở rộng từ nền tảng bán lẻ đa ngành | Chuyên biệt cho nhà hàng phục vụ tại bàn |
| **Đối tượng phù hợp** | Nhà hàng vừa & lớn, chuỗi F&B | Quán nhỏ & vừa, quán ăn gia đình | Nhà hàng phục vụ tại bàn quy mô vừa |
| **Giao diện & Độ dễ dùng** | Chuyên nghiệp, nhiều tùy biến sâu | Đơn giản, trực quan, dễ làm quen | Trực quan (Bootstrap 5, EJS, Responsive) |
| **Hạ tầng thiết bị** | Máy POS cảm ứng, PDA, KDS chuyên dụng | Tận dụng laptop, điện thoại, tablet | Nền tảng Web chạy trên mọi thiết bị có trình duyệt |
| **Sơ đồ bàn** | Trực quan theo khu vực, chuyển/gộp bàn | Sơ đồ bàn cơ bản, hỗ trợ tính giờ | Sơ đồ lưới trực quan, đổi màu theo trạng thái |
| **Gọi món tại bàn** | PDA phục vụ & QR Menu điện tử | App di động & Web QR Order | Web QR cho khách + Giao diện Web cho phục vụ |
| **Màn hình Bếp (KDS)** | KDS thông minh, đổi màu, chuông báo, khóa món | In phiếu LAN/Wifi, KDS gom món | Màn hình KDS Socket.io real-time, đổi trạng thái món |
| **Thanh toán & Hóa đơn** | Tiền mặt, Thẻ, VietQR động màn hình phụ | Tiền mặt, Thẻ, VietQR động + Loa báo | Tiền mặt + Mã VietQR động (chuẩn NAPAS 247) |
| **Độ trễ đồng bộ** | Cực thấp (mạng nội bộ Local + Cloud) | Phụ thuộc tốc độ mạng Internet | Tức thì qua WebSockets (Socket.io) |
| **Chi phí triển khai** | Cao (yêu cầu đầu tư thiết bị) | Trung bình | **0 VNĐ (Mã nguồn mở Node.js + SQLite3)** |

---

## 6. KẾT LUẬN & BÀI HỌC ÁP DỤNG VÀO ĐỒ ÁN

Từ việc khảo sát hai sản phẩm dẫn đầu thị trường, đề tài đồ án **Hệ thống Quản lý Nhà hàng phục vụ tại bàn** rút ra các định hướng thiết kế quan trọng sau:

1. **Kế thừa luồng vận hành chuẩn của iPOS.vn:**
   - Xây dựng quy trình 4 chặng đồng bộ: **Khách (QR Menu) -> Phục vụ (Duyệt/Order) -> Bếp (KDS real-time) -> Thu ngân (VietQR & Hóa đơn)**.
   - Trạng thái món trên KDS cần thể hiện rõ ràng (*Chờ làm -> Đang nấu -> Hoàn thành*), kết hợp nút báo "Hết món" để khóa món tức thì trên thực đơn.
2. **Kế thừa triết lý tối giản của KiotViet:**
   - Thiết kế giao diện phẳng, tối giản, trực quan trên nền Bootstrap 5, giúp nhân viên không cần qua đào tạo phức tạp vẫn thao tác trơn tru.
   - Không đòi hỏi phần cứng chuyên dụng: Toàn bộ hệ thống chạy trên nền tảng Web tiêu chuẩn, tương thích hoàn hảo từ điện thoại thông minh, máy tính bảng đến máy tính để bàn.
3. **Ứng dụng công nghệ Socket.io & VietQR:**
   - Sử dụng Socket.io để giải quyết triệt để bài toán đồng bộ dữ liệu thời gian thực giữa Khách - Bếp - Phục vụ - Thu ngân mà không cần phụ thuộc vào dịch vụ đám mây trả phí.
   - Sinh mã VietQR động tự động điền sẵn số tiền và mã hóa đơn, giúp quy trình thanh toán nhanh chóng, hiện đại và chuẩn xác.
