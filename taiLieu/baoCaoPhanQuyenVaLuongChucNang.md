# BÁO CÁO CHUYÊN BIỆT HÓA PHÂN QUYỀN VÀ LUỒNG THAO TÁC CÁC BỘ PHẬN
**Dự án:** Website Quản Lý Nhà Hàng & Gọi Món QR (Quán Mộc POS & E-Menu)  
**Phiên bản hoàn thiện:** Đã nâng cấp Chuyên Biệt Hóa Toàn Diện Nghiệp Vụ (Strict Role-Based Specialization)  
**Tác giả:** Đội ngũ Kỹ sư Phát triển Hệ thống Quán Mộc  

---

## 1. MỤC TIÊU & NGUYÊN TẮC CHUYÊN BIỆT HÓA ("VIỆC AI NGƯỜI NẤY LÀM")

Để tối ưu hóa hiệu suất vận hành, tránh chồng chéo trách nhiệm và loại trừ hoàn toàn nguy cơ gian lận hoặc sai sót:
* **👨‍🍳 Đầu bếp:** Chỉ tập trung 100% vào việc chế biến món ăn trên màn hình KDS. Không can thiệp vào sơ đồ bàn, không xem doanh thu, không đụng vào tiền bạc.
* **💁 Phục vụ:** Chỉ tập trung vào việc đón tiếp khách tại bàn, mở bàn, đổi/ghép bàn, và quan trọng nhất là **theo dõi món đã nấu xong từ bếp để bưng ra bàn cho khách**. Phục vụ **tuyệt đối không thu tiền, không in hóa đơn, không sửa menu**.
* **💼 Thu ngân:** Chịu trách nhiệm hoàn toàn về **dòng tiền**, mở/đóng ca đối soát két tiền mặt, in hóa đơn tạm tính K80, áp dụng khuyến mãi, thu tiền mặt / VietQR và chốt thanh toán.
* **👑 Quản lý:** Toàn quyền điều hành, phân tích số liệu báo cáo, quản lý thực đơn, nhân sự và cấu hình.

```mermaid
flowchart TD
    subgraph WaiterWork["💁 BỘ PHẬN PHỤC VỤ (phucvu / 123456)"]
        PV1["🪑 Sơ đồ Bàn phục vụ"] --> PV2["👤 Mở bàn trực tiếp"]
        PV1 --> PV3["🔀 Đổi bàn / 🔗 Ghép bàn"]
        PV1 --> PV4["🍽️ Bấm 'Bưng món'"]
        PV4 --> PV5["👉 Xác nhận 'Đã bưng lên bàn'"]
        PV1 --> PV6["🔔 Báo Thu ngân tính tiền"]
    end

    subgraph KitchenWork["🧑‍🍳 BỘ PHẬN BẾP (daubep / 123456)"]
        B1["🍳 Điều phối Bếp (KDS)"] --> B2["⏱️ Hàng đợi món FIFO"]
        B1 --> B3["🍲 Gom nhóm món cùng loại"]
        B1 --> B4["🔥 Bấm 'Bắt đầu nấu'"]
        B4 --> B5["✅ Bấm 'Nấu xong' -> Báo Phục vụ bưng món"]
        B1 --> B6["⚠️ 1-Click báo 'Tạm hết món'"]
    end

    subgraph CashierWork["💼 BỘ PHẬN THU NGÂN (thungan / 123456)"]
        TN1["💼 Quản lý Ca & Quỹ (Mở ca / Kết ca)"]
        TN2["🪑 Sơ đồ Bàn POS"] --> TN3["💰 Bấm 'Thanh toán'"]
        TN3 --> TN4["🏷️ Áp mã Voucher"]
        TN3 --> TN5["🖨️ In hóa đơn K80"]
        TN3 --> TN6["💵 Thu tiền mặt (tính tiền thừa) / VietQR"]
        TN6 --> TN7["🎉 Chốt hóa đơn & Giải phóng bàn"]
    end
```

---

## 2. CHI TIẾT CẢI TIẾN GIAO DIỆN & ROUTE GUARD THEO TỪNG VAI TRÒ

### 2.1. Nhân viên Phục vụ (Tài khoản: `phucvu` | Mật khẩu: `123456`)
* **Thanh điều hướng Sidebar:** Chỉ hiển thị **duy nhất** mục `🪑 Sơ đồ Bàn & Phục vụ`. Toàn bộ các mục Điều phối bếp KDS, Ca làm việc, Thống kê, Thực đơn, Nhân sự, Cấu hình đều bị ẩn hoàn toàn.
* **Tiêu đề trang:** Tự động điều chỉnh thành: *"🪑 Sơ Đồ Bàn & Phục Vụ Bàn Ăn - Mở bàn đón tiếp, chuyển/ghép bàn và bưng món ăn phục vụ"*.
* **Ẩn toàn bộ nút cấu hình bàn:** Phục vụ không thấy nút `+ Thêm Khu Vực`, `+ Thêm Bàn Ăn`, `🗑️ Xóa bàn`, `🔄 Làm mới mã QR`.
* **Ẩn nút `💰 Thanh toán`:** Phục vụ không thực hiện thanh toán tiền.
* **Nút chính trên thẻ bàn:** Hiển thị nút **"🍽️ Bưng món"** kèm huy hiệu màu đỏ báo số món đã xong (ví dụ: `2 xong`).
* **Modal Xem món & Bưng món chuyên dụng:**
  - Hiển thị danh sách món ăn của bàn kèm trạng thái: *Chờ nấu*, *Đang nấu*, *Bếp đã nấu xong*, *Đã phục vụ*.
  - Với các món bếp báo xong, có nút **"👉 Đã bưng ra bàn"** để phục vụ bấm xác nhận ngay khi mang món lên bàn ăn.
  - Có nút **"➕ Đặt món hộ"** nếu khách nhờ phục vụ gọi thêm món.
  - Có nút **"🔔 Báo tính tiền"** để chuyển bàn sang trạng thái Chờ thanh toán khi khách muốn thanh toán.

---

### 2.2. Đầu bếp (Tài khoản: `daubep` | Mật khẩu: `123456`)
* **Tự động điều hướng sau khi đăng nhập:** Chuyển thẳng vào `#/bep` (Màn hình Điều phối Bếp KDS).
* **Thanh điều hướng Sidebar:** Chỉ hiển thị **duy nhất** mục `🍳 Điều phối Bếp (KDS)`. Hoàn toàn không hiển thị Sơ đồ bàn, POS, Ca quỹ, Thực đơn, Báo cáo hay Nhân sự.
* **Header định danh chuyên trách:** Hiển thị thẻ chức danh `🧑‍🍳 Trực ban Đầu bếp`.
* **Route Guard bảo vệ:** Nếu đầu bếp gõ URL khác (như `#/so-do-ban` hay `#/thanh-toan`), hệ thống lập tức hiển thị cảnh báo `⚠️ Vai trò [Đầu bếp] chỉ thao tác tại màn hình chuyên trách của mình` và tự động đưa về `#/bep`.

---

### 2.3. Thu ngân (Tài khoản: `thungan` | Mật khẩu: `123456`)
* **Thanh điều hướng Sidebar:** Chỉ hiển thị 2 mục nghiệp vụ:
  1. `🪑 Sơ đồ Bàn & POS`
  2. `💼 Quản lý Ca & Quỹ`
  *(Ẩn hoàn toàn Điều phối bếp KDS, Thực đơn, Thống kê, Nhân sự).*
* **Sơ đồ bàn:** Nút chính trên từng bàn là **"💰 Thanh toán"** để mở màn hình thanh toán POS, tính tiền thối, xuất VietQR và in hóa đơn tạm tính K80.
* **Quản lý Ca & Quỹ:** Khai báo số tiền mặt đầu ca, lập phiếu thu chi lẻ và đếm tiền đối soát két cuối ca.

---

### 2.4. Quản lý / Admin (Tài khoản: `admin` | Mật khẩu: `123456`)
* Toàn quyền truy cập tất cả các tính năng, quản trị nhân sự, điều chỉnh giá và xem Dashboard báo cáo doanh thu.

---

## 3. DANH SÁCH TÀI KHOẢN ĐĂNG NHẬP KIỂM THỬ

| Tài khoản | Mật khẩu | Vai trò CSDL | Màn hình mặc định | Quyền hạn giao diện |
|:---|:---:|:---:|:---:|:---|
| **`phucvu`** | `123456` | `phuc_vu` | `#/so-do-ban` | Sơ đồ bàn phục vụ, mở bàn, đổi/ghép bàn, xem món và bưng món đã nấu xong ra bàn, báo thu ngân tính tiền. |
| **`daubep`** | `123456` | `bep` | `#/bep` | Hàng đợi KDS FIFO, gom món nấu đồng thời, cập nhật tiến độ nấu và gạt tắt món tạm hết. |
| **`thungan`** | `123456` | `thu_ngan` | `#/so-do-ban` | Sơ đồ bàn POS, thu tiền mặt/VietQR, in bill K80, mở/kết ca đối soát quỹ. |
| **`admin`** | `123456` | `quan_ly` | `#/so-do-ban` | Toàn quyền quản trị toàn bộ hệ thống. |

---

## 4. MA TRẬN PHÂN QUYỀN HỆ THỐNG CHI TIẾT (RBAC MATRIX)

| STT | Phân hệ / Chức năng | Khách hàng (QR) | Phục vụ (`phuc_vu`) | Đầu bếp (`bep`) | Thu ngân (`thu_ngan`) | Quản lý (`quan_ly`) |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| **1** | **E-Menu & Gọi món tại bàn** |
| 1.1 | Quét QR xem thực đơn, ảnh SVG, lọc danh mục |  Toàn quyền |  Xem |  Xem |  Xem |  Toàn quyền |
| 1.2 | Thêm giỏ hàng & Gửi đơn gọi món thời gian thực |  Toàn quyền |  Đặt hộ | ❌ Không |  Đặt hộ |  Toàn quyền |
| 1.3 | Theo dõi tiến độ chế biến món của bàn |  Bàn mình |  Các bàn |  Các bàn |  Các bàn |  Toàn quyền |
| 1.4 | Gửi yêu cầu phục vụ (nước, đá, hỗ trợ) |  Toàn quyền |  Nhận xử lý | ❌ Không |  Nhận xử lý |  Toàn quyền |
| 1.5 | Gửi đánh giá sao & nhận xét dịch vụ |  Toàn quyền | ❌ Không | ❌ Không | ❌ Không |  Xem & Phản hồi |
| **2** | **Sơ đồ Bàn & Vận hành Bàn** |
| 2.1 | Xem sơ đồ bàn trực quan theo khu vực & màu trạng thái | ❌ Không |  Toàn quyền | ❌ Không |  Toàn quyền |  Toàn quyền |
| 2.2 | Mở bàn mới cho khách vãng lai | ❌ Không |  Toàn quyền | ❌ Không |  Toàn quyền |  Toàn quyền |
| 2.3 | Chuyển bàn hoặc Ghép nhiều bàn (Transaction) | ❌ Không |  Toàn quyền | ❌ Không |  Toàn quyền |  Toàn quyền |
| 2.4 | Đánh dấu món đã bưng lên bàn (`da_phuc_vu`) | ❌ Không |  Toàn quyền | ❌ Không | ❌ Không |  Toàn quyền |
| **3** | **Bếp KDS (Kitchen Display System)** |
| 3.1 | Xem danh sách món chờ nấu theo thứ tự FIFO | ❌ Không | ❌ Không |  Toàn quyền | ❌ Không |  Toàn quyền |
| 3.2 | Gom món nấu hàng loạt (Batch cooking) | ❌ Không | ❌ Không |  Toàn quyền | ❌ Không |  Toàn quyền |
| 3.3 | Chuyển trạng thái món: *Nấu* (`dang_che_bien`), *Xong* (`hoan_thanh`) | ❌ Không | ❌ Không |  Toàn quyền | ❌ Không |  Toàn quyền |
| 3.4 | Bật/tắt nhanh trạng thái món: "Đang bán" / "Tạm hết" | ❌ Không | ❌ Không |  Toàn quyền | ❌ Không |  Toàn quyền |
| 3.5 | Chuông báo âm thanh KDS Web Audio khi có món mới | ❌ Không | ❌ Không |  Có chuông | ❌ Không |  Có chuông |
| **4** | **Thu ngân & POS Thanh toán** |
| 4.1 | Xem bảng kê tạm tính hóa đơn (Món, VAT, Giảm giá) |  Xem của bàn |  Xem của bàn | ❌ Không |  Toàn quyền |  Toàn quyền |
| 4.2 | Áp dụng mã khuyến mãi / Voucher giảm giá | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |  Toàn quyền |
| 4.3 | In phiếu tạm tính chuẩn in nhiệt K80 | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |  Toàn quyền |
| 4.4 | Tạo và hiển thị mã thanh toán VietQR Napas động |  Xem tại bàn | ❌ Không | ❌ Không |  Toàn quyền |  Toàn quyền |
| 4.5 | Thu tiền mặt, tính tiền thừa & Hoàn tất hóa đơn | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |  Toàn quyền |
| **5** | **Quản lý Ca làm việc & Quỹ** |
| 5.1 | Mở ca làm việc & Khai báo tiền quỹ đầu ca | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |  Toàn quyền |
| 5.2 | Lập phiếu thu tiền mặt / phiếu chi tiền mặt trong ca | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |  Toàn quyền |
| 5.3 | Kết ca làm việc, kiểm đếm tiền thực tế & đối soát quỹ | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |  Toàn quyền |
| **6** | **Báo cáo Thống kê & Doanh thu** |
| 6.1 | Xem Dashboard tổng quan doanh thu ngày & hóa đơn | ❌ Không | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |
| 6.2 | Lọc doanh thu theo ngày / tuần / tháng / khoảng ngày | ❌ Không | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |
| 6.3 | Phân tích tỷ trọng phương thức trả tiền (Tiền mặt vs VietQR) | ❌ Không | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |
| 6.4 | Xem Top 5 món bán chạy & Tỷ trọng doanh mục | ❌ Không | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |
| 6.5 | Xem biểu đồ khung giờ cao điểm & Tỷ lệ hủy món | ❌ Không | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |
| 6.6 | Xuất báo cáo Doanh thu & Hóa đơn ra file Excel / CSV | ❌ Không | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |
| **7** | **Đánh giá Khách hàng** |
| 7.1 | Xem điểm đánh giá trung bình & danh sách nhận xét | ❌ Không | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |
| 7.2 | Lọc đánh giá tiêu cực (< 4 sao) để xử lý khiếu nại | ❌ Không | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |
| 7.3 | Phản hồi đánh giá (Sử dụng mẫu trả lời 1-click hoặc soạn riêng) | ❌ Không | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |
| **8** | **Quản trị Menu, Bàn & Nhân sự** |
| 8.1 | Quản lý Thực đơn (Thêm, sửa, tải ảnh SVG, xóa mềm) | ❌ Không | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |
| 8.2 | Quản lý Danh mục món & Khu vực bàn ăn | ❌ Không | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |
| 8.3 | Quản lý Nhân sự (Tạo tài khoản, đổi vai trò, reset mật khẩu) | ❌ Không | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |
| 8.4 | Cấu hình nhà hàng (Tên, địa chỉ, hotline, VAT, VietQR) | ❌ Không | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |
| 8.5 | Tra cứu Nhật ký hoạt động hệ thống (Audit Logs) | ❌ Không | ❌ Không | ❌ Không | ❌ Không |  Toàn quyền |

---

## 5. SƠ ĐỒ LUỒNG TƯƠNG TÁC ĐA TÁC TỬ (END-TO-END WORKFLOW)

```mermaid
sequenceDiagram
    autonumber
    actor KH as Thực khách (QR)
    actor PV as Phục vụ
    actor BEP as Đầu bếp (KDS)
    actor TN as Thu ngân (POS)
    actor QL as Quản lý (Admin)

    %% Giai đoạn vào quán
    Note over KH,PV: Giai đoạn 1: Tiếp đón & Gọi món
    KH->>KH: Quét mã QR trên bàn ăn
    KH->>PV: Mở E-Menu, chọn món & thêm giỏ hàng
    KH->>BEP: Nhấn Đặt món (Database Transaction & WebSocket)
    BEP-->>BEP: Web Audio Chime vang lên, món vào hàng đợi FIFO

    %% Giai đoạn chế biến
    Note over BEP,KH: Giai đoạn 2: Chế biến & Bưng món
    BEP->>BEP: Bấm "Nấu" (Trạng thái: dang_che_bien)
    BEP-->>KH: Đồng bộ thời gian thực: Món đang được nấu
    BEP->>BEP: Bấm "Xong" (Trạng thái: hoan_thanh)
    BEP-->>PV: Báo chuông: Món đã xong
    PV->>KH: Mang món ra bàn ăn & Bấm "Đã phục vụ"
    PV-->>KH: Đồng bộ: Món đã phục vụ

    %% Giai đoạn thanh toán
    Note over KH,TN: Giai đoạn 3: Thanh toán & Kết thúc phiên
    KH->>TN: Bấm "Yêu cầu thanh toán" trên điện thoại
    TN->>TN: Áp dụng mã Voucher & In hóa đơn tạm tính K80
    KH->>TN: Quét mã Napas VietQR động hoặc trả tiền mặt
    TN->>TN: Xác nhận thanh toán & Đóng phiên bàn ăn
    TN-->>PV: Bàn chuyển sang trạng thái "Trống"

    %% Giai đoạn hậu mãi & quản trị
    Note over KH,QL: Giai đoạn 4: Đánh giá & Báo cáo
    KH->>QL: Gửi đánh giá sao & nhận xét dịch vụ
    QL->>KH: Quản lý chọn mẫu 1-click phản hồi cảm ơn khách
    QL->>QL: Xem Dashboard doanh thu cập nhật tức thời & Xuất file CSV
```
