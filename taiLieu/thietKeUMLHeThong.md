# TÀI LIỆU PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG THÔNG TIN SỬ DỤNG BIỂU ĐỒ UML
## ĐỀ TÀI: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN TẠI BÀN QUA MÃ QR (QUÁN MỘC POS & E-MENU)
**Trường:** Đại học CMC - Khoa Công nghệ Thông tin & Truyền thông  
**Học phần:** Phát triển ứng dụng Web (Lớp N06 - Nhóm 1)  
**Tiêu chuẩn áp dụng:** Phương pháp luận UML 2.5 chuẩn hóa theo tài liệu học thuật Bách Khoa / CMC (Viblo Standard).

---

## 1. TỔNG QUAN PHƯƠNG PHÁP LUẬN UML TRONG HỆ THỐNG
Dựa trên phân tích yêu cầu nghiệp vụ và mô hình kiến trúc MVC hướng dịch vụ thời gian thực (Real-time Event-Driven Architecture), hệ thống biểu đồ UML của dự án Quán Mộc được phân định thành 2 nhóm chính:

1. **Nhóm biểu đồ cấu trúc (Structural Diagrams):**
   * **Biểu đồ Ca sử dụng (Use Case Diagram):** Khoanh vùng ranh giới hệ thống, xác định 5 tác nhân (Actor) và 24 ca sử dụng cốt lõi (phân rã thành 49 User Stories chuẩn mực kèm tiêu chí chấp nhận).
   * **Biểu đồ Lớp kiến trúc (Class Diagram):** Phác thảo các Lớp theo mô hình Express MVC (Controller - Service - Model - Socket Gateway), tích hợp trọn vẹn tầng quản lý Phiên bàn (`phien_ban`).
   * **Biểu đồ Cơ sở dữ liệu (ERD / Database Diagram):** 22 thực thể dữ liệu chuẩn hóa 3NF.
2. **Nhóm biểu đồ hành vi & tương tác (Behavioral & Interaction Diagrams):**
   * **Biểu đồ Hoạt động / Quy trình (Activity Diagram / BPMN):** Phân chia 5 làn bơi trách nhiệm (Swimlanes).
   * **Biểu đồ Tuần tự (Sequence Diagrams):** Trục thời gian tương tác giữa User, Client, API Controller, Business Service, SQLite3 và Socket.io Gateway cho 3 kịch bản cốt lõi.
   * **Biểu đồ Trạng thái (State Machine Diagrams):** Vòng đời biến đổi trạng thái nội tại của Bàn ăn, Phiên bàn, Món ăn và Hóa đơn thanh toán.

---

## 2. BIỂU ĐỒ TUẦN TỰ (SEQUENCE DIAGRAMS)

### 2.1. Kịch bản 1: Khách hàng quét mã QR & Đặt món Real-time
* **Mục đích:** Mô tả chi tiết dòng sự kiện khi khách quét mã QR (`ma_qr_token`), kiểm tra/tạo phiên bàn (`phien_ban`), chọn món, kiểm tra trạng thái còn món (`con_mon`), tạo đơn đặt món và phát socket realtime tới Bếp KDS và Phục vụ.
* **Tài nguyên:** [soDoTuanTuGoiMon.svg](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuGoiMon.svg) | [soDoTuanTuGoiMon.png](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuGoiMon.png) | [soDoTuanTuGoiMon.mmd](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuGoiMon.mmd)

```mermaid
sequenceDiagram
    autonumber
    actor C as 👤 Khách hàng
    participant UI as 📱 Mobile Web (E-Menu)
    participant Ctrl as ⚙️ donGoiMon.controller
    participant SvcP as 🚪 phienBan.service
    participant SvcD as 🧠 donGoiMon.service
    participant DB as 🗄️ SQLite3 Database
    participant Sock as ⚡ Socket.io Gateway
    participant KDS as 👨‍🍳 Màn hình Bếp (KDS)
    participant W as 🤵 Phục vụ (Waiter App)

    Note over C,UI: Khách quét mã QR tại bàn (VD: Bàn B04, ma_qr_token)
    C->>UI: Chọn món ăn, số lượng & ghi chú
    C->>UI: Nhấn nút "Gửi đơn gọi món"
    activate UI
    UI->>Ctrl: POST /api/don-goi-mon (ma_qr_token, ds_mon_an)
    activate Ctrl

    %% Bước 1: Quản lý Phiên bàn
    Ctrl->>SvcP: layHoacTaoPhienBan(ma_qr_token)
    activate SvcP
    SvcP->>DB: SELECT id, trang_thai FROM ban_an WHERE ma_qr_token = ? AND kich_hoat = 1
    activate DB
    DB-->>SvcP: { id: 4, trang_thai: 'trong' }
    deactivate DB

    alt Bàn đang 'trong' (Lượt khách mới)
        SvcP->>DB: INSERT INTO phien_ban (ban_an_id, ma_phien, trang_thai='dang_hoat_dong')
        activate DB
        SvcP->>DB: UPDATE ban_an SET trang_thai = 'co_khach' WHERE id = 4
        DB-->>SvcP: phien_ban_id = 12
        deactivate DB
    else Bàn đã có khách đang ngồi (Gọi thêm món)
        SvcP->>DB: SELECT id FROM phien_ban WHERE ban_an_id = 4 AND trang_thai = 'dang_hoat_dong'
        activate DB
        DB-->>SvcP: phien_ban_id = 12
        deactivate DB
    end
    SvcP-->>Ctrl: phien_ban_id = 12
    deactivate SvcP

    %% Bước 2: Kiểm tra trạng thái phục vụ món
    Ctrl->>SvcD: taoDonGoiMon(phien_ban_id=12, ds_mon_an)
    activate SvcD
    SvcD->>DB: SELECT id, ten_mon, don_gia, con_mon FROM mon_an WHERE id IN (...)
    activate DB
    DB-->>SvcD: Danh sách món ăn kèm trạng thái còn món (con_mon)
    deactivate DB

    alt Có món đã hết hàng (con_mon = 0)
        SvcD-->>Ctrl: Lỗi: "Món ăn tạm hết hàng"
        Ctrl-->>UI: HTTP 400 Bad Request { ok: false, msg: "Món ăn tạm hết" }
        UI-->>C: Thông báo cảnh báo món hết trên giao diện
    else Tất cả món hợp lệ (con_mon = 1)
        SvcD->>DB: BEGIN IMMEDIATE TRANSACTION
        activate DB
        SvcD->>DB: INSERT INTO don_goi_mon (phien_ban_id, ma_don, nguon_tao='khach_qr', trang_thai='cho_duyet')
        SvcD->>DB: INSERT INTO chi_tiet_don_mon (don_goi_mon_id, mon_an_id, so_luong, don_gia, ghi_chu, trang_thai_mon='cho_duyet')
        SvcD->>DB: UPDATE ban_an SET trang_thai = 'cho_mon' WHERE id = 4
        SvcD->>DB: COMMIT TRANSACTION
        DB-->>SvcD: Giao dịch thành công (don_goi_mon_id=25)
        deactivate DB

        SvcD-->>Ctrl: Dữ liệu đơn đặt món mới
        deactivate SvcD

        %% Bước 3: Phát tín hiệu Real-time
        Ctrl->>Sock: broadcastEvent('DON_HANG_MOI', { don_id: 25, ban_id: 4, phien_id: 12 })
        activate Sock
        Sock-)KDS: Emit: 'bep:co_don_moi' (Phát chuông báo KDS & hiển thị thẻ)
        Sock-)W: Emit: 'phuc_vu:don_dat_ban' (Rung chuông điện thoại phục vụ)
        deactivate Sock

        Ctrl-->>UI: HTTP 201 Created { ok: true, data: { don_id: 25, phien_ban_id: 12 }, msg: "Đặt món thành công" }
        deactivate Ctrl
        UI-->>C: Hiển thị: "Đã gửi đơn vào bếp - Đang chờ duyệt/chế biến"
    end
    deactivate UI
```

---

### 2.2. Kịch bản 2: Bếp KDS Tiếp nhận & Điều phối chế biến Real-time
* **Mục đích:** Mô tả dòng điều khiển khi đầu bếp chuyển đổi trạng thái món ăn (`dang_nau` $\rightarrow$ `hoan_thanh`), ghi nhận mốc thời gian `thoi_gian_bat_dau_nau`, `thoi_gian_hoan_thanh_nau`, kích hoạt chuông báo phục vụ bưng món và cập nhật thanh tiến độ cho khách.
* **Tài nguyên:** [soDoTuanTuDieuPhoiBep.svg](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuDieuPhoiBep.svg) | [soDoTuanTuDieuPhoiBep.png](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuDieuPhoiBep.png) | [soDoTuanTuDieuPhoiBep.mmd](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuDieuPhoiBep.mmd)

```mermaid
sequenceDiagram
    autonumber
    actor K as 👨‍🍳 Đầu bếp / Bar
    participant KDS as 🖥️ Màn hình KDS Bếp
    participant Ctrl as ⚙️ bepKDS.controller
    participant Svc as 🧠 bepKDS.service
    participant DB as 🗄️ SQLite3 Database
    participant Sock as ⚡ Socket.io Gateway
    participant W as 🤵 Phục vụ (Mobile App)
    participant C as 📱 Khách (E-Menu Bàn)

    Note over K,KDS: Màn hình KDS hiển thị thẻ đơn ở cột "Chờ chế biến" (trang_thai_mon = 'cho_duyet')
    K->>KDS: Nhấn "Bắt đầu nấu" trên món ăn
    activate KDS
    KDS->>Ctrl: PATCH /api/kds/mon-an/:id_chi_tiet/trang-thai { trang_thai_mon: 'dang_nau', dau_bep_id: 3 }
    activate Ctrl

    Ctrl->>Svc: batDauCheBienMon(id_chi_tiet, dau_bep_id=3)
    activate Svc
    Svc->>DB: UPDATE chi_tiet_don_mon SET trang_thai_mon = 'dang_nau', dau_bep_id = 3, thoi_gian_bat_dau_nau = datetime('now','localtime') WHERE id = id_chi_tiet
    activate DB
    DB-->>Svc: 1 row affected
    deactivate DB
    Svc-->>Ctrl: Cập nhật thành công
    deactivate Svc

    Ctrl->>Sock: broadcastEvent('MON_AN_DANG_NAU', { id_chi_tiet, ban_id: 4, trang_thai_mon: 'dang_nau' })
    activate Sock
    Sock-)C: Emit: 'ban:mon_dang_nau' (Thanh tiến độ chuyển sang màu vàng)
    deactivate Sock
    Ctrl-->>KDS: HTTP 200 OK { ok: true, msg: "Đã chuyển sang Đang nấu" }
    deactivate Ctrl
    KDS-->>K: Thẻ món chuyển sang cột "Đang chế biến"
    deactivate KDS

    Note over K,KDS: Sau khi chế biến xong món ăn...
    K->>KDS: Nhấn "Hoàn thành món" (Món sẵn sàng bưng ra bàn)
    activate KDS
    KDS->>Ctrl: PATCH /api/kds/mon-an/:id_chi_tiet/trang-thai { trang_thai_mon: 'hoan_thanh' }
    activate Ctrl

    Ctrl->>Svc: hoanThanhCheBienMon(id_chi_tiet)
    activate Svc
    Svc->>DB: UPDATE chi_tiet_don_mon SET trang_thai_mon = 'hoan_thanh', thoi_gian_hoan_thanh_nau = datetime('now','localtime') WHERE id = id_chi_tiet
    activate DB
    DB-->>Svc: 1 row affected
    deactivate DB
    Svc-->>Ctrl: Dữ liệu món hoàn thành
    deactivate Svc

    Ctrl->>Sock: broadcastEvent('MON_AN_HOAN_THANH', { id_chi_tiet, ten_mon: "Bò sốt tiêu đen", ban_id: 4, so_luong: 2 })
    activate Sock
    Sock-)W: Emit: 'phuc_vu:lay_mon' (Phát chuông thông báo & rung điện thoại: "Bàn 4 có món!")
    Sock-)C: Emit: 'ban:mon_hoan_thanh' (Thông báo: "Món ăn đã xong, nhân viên đang mang tới")
    deactivate Sock

    Ctrl-->>KDS: HTTP 200 OK { ok: true, msg: "Món đã nấu xong" }
    deactivate Ctrl
    KDS-->>K: Thẻ món đổi màu xanh lá và chuyển sang cột "Hoàn thành"
    deactivate KDS

    Note over W: Nhân viên phục vụ đến quầy ra đồ bưng món tới Bàn 4
    W->>Ctrl: POST /api/phuc-vu/xac-nhan-len-mon { id_chi_tiet, trang_thai_mon: 'da_phuc_vu' }
    activate Ctrl
    Ctrl->>DB: UPDATE chi_tiet_don_mon SET trang_thai_mon = 'da_phuc_vu' WHERE id = id_chi_tiet
    activate DB
    DB-->>Ctrl: OK
    deactivate DB
    Ctrl->>Sock: broadcastEvent('MON_DA_PHUC_VU', { id_chi_tiet, ban_id: 4 })
    Ctrl-->>W: HTTP 200 OK { ok: true, msg: "Đã xác nhận lên món" }
    deactivate Ctrl
```

---

### 2.3. Kịch bản 3: Lập hóa đơn & Thanh toán VietQR NAPAS 247 Khép kín
* **Mục đích:** Mô tả chu trình lập bill dựa trên phiên bàn (`phien_ban_id`), tính VAT 8%, sinh mã VietQR chuẩn EMVCo, xác thực giao dịch chuyển khoản qua IPN/Webhook, cập nhật đồng thời hóa đơn, phiên bàn và trạng thái bàn ăn, in hóa đơn K80.
* **Tài nguyên:** [soDoTuanTuThanhToanVietQR.svg](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuThanhToanVietQR.svg) | [soDoTuanTuThanhToanVietQR.png](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuThanhToanVietQR.png) | [soDoTuanTuThanhToanVietQR.mmd](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuThanhToanVietQR.mmd)

```mermaid
sequenceDiagram
    autonumber
    actor C as 👤 Khách hàng
    actor TN as 💳 Thu ngân
    participant POS as 🖥️ POS Thu ngân
    participant Ctrl as ⚙️ hoaDon.controller
    participant SvcP as 🚪 phienBan.service
    participant SvcH as 🧠 hoaDon.service
    participant Bank as 🏦 VietQR / Cổng Ngân hàng
    participant DB as 🗄️ SQLite3 Database
    participant Sock as ⚡ Socket.io Gateway
    participant Printer as 🖨️ Máy in Bill K80

    Note over C,TN: Khách yêu cầu thanh toán tại Bàn B04
    C->>POS: Bấm "Yêu cầu tính tiền" trên E-Menu (hoặc báo nhân viên)
    activate POS
    POS->>Ctrl: POST /api/ban-an/4/yeu-cau-thanh-toan
    activate Ctrl
    Ctrl->>DB: UPDATE ban_an SET trang_thai = 'yeu_cau_thanh_toan' WHERE id = 4
    activate DB
    DB-->>Ctrl: OK
    deactivate DB
    Ctrl-->>POS: Đổi màu bàn B04 sang đỏ (Yêu cầu thanh toán)
    deactivate Ctrl

    TN->>POS: Chọn Bàn B04, nhấn "Lập hóa đơn thanh toán"
    POS->>Ctrl: POST /api/hoa-don/lap-hoa-don { ban_id: 4, ma_voucher: null, phuong_thuc: 'vietqr' }
    activate Ctrl

    Ctrl->>SvcP: layPhienDangHoatDong(ban_id=4)
    activate SvcP
    SvcP->>DB: SELECT id FROM phien_ban WHERE ban_an_id = 4 AND trang_thai = 'dang_hoat_dong'
    activate DB
    DB-->>SvcP: phien_ban_id = 12
    deactivate DB
    SvcP-->>Ctrl: phien_ban_id = 12
    deactivate SvcP

    Ctrl->>SvcH: taoHoaDonTamTinh(phien_ban_id=12, thu_ngan_id=2)
    activate SvcH
    SvcH->>DB: SELECT c.so_luong, c.don_gia FROM chi_tiet_don_mon c JOIN don_goi_mon d ON c.don_goi_mon_id = d.id WHERE d.phien_ban_id = 12 AND c.trang_thai_mon NOT IN ('huy_mon', 'da_huy')
    activate DB
    DB-->>SvcH: Danh sách món ăn hợp lệ
    deactivate DB

    SvcH->>SvcH: Tính: tong_tien_mon=781,000đ; VAT 8%=62,480đ; tong_tien_thanh_toan=843,480đ
    SvcH->>DB: INSERT INTO hoa_don (phien_ban_id, ma_hoa_don, thu_ngan_id, tong_tien_mon, phan_tram_vat, tien_vat, tong_tien_thanh_toan, phuong_thuc_thanh_toan, trang_thai='chua_thanh_toan')
    activate DB
    DB-->>SvcH: hoa_don_id = 105
    deactivate DB
    SvcH-->>Ctrl: Dữ liệu hóa đơn #105
    deactivate SvcH
    Ctrl-->>POS: Trả về thông tin hóa đơn #105
    deactivate Ctrl
    POS-->>TN: Hiển thị giao diện thanh toán số tiền: 843,480 VNĐ

    Note over TN,Bank: Khách lựa chọn thanh toán chuyển khoản VietQR NAPAS 247
    TN->>POS: Bấm "Tạo mã VietQR"
    POS->>Ctrl: POST /api/hoa-don/105/tao-ma-vietqr
    activate Ctrl
    Ctrl->>Bank: API VietQR (STK, BankCode, SoTien=843480, NoiDung="QM BAN04 HD105")
    activate Bank
    Bank-->>Ctrl: Trả về Chuỗi EMVCo & URL ảnh QR động
    deactivate Bank
    Ctrl-->>POS: Hiển thị mã QR động lên màn hình phụ hướng về khách
    deactivate Ctrl

    Note over C,Bank: Khách dùng App Ngân hàng quét QR và xác nhận chuyển 843,480 VNĐ
    C->>Bank: Chuyển khoản thành công qua hệ thống NAPAS 247
    activate Bank
    Bank->>Ctrl: Webhook / SePAY IPN: Báo có 843,480đ với nội dung "QM BAN04 HD105"
    deactivate Bank
    activate Ctrl

    Ctrl->>SvcH: xuLyThanhToanThanhCong(hoa_don_id=105, ma_giao_dich_vietqr)
    activate SvcH
    SvcH->>DB: BEGIN IMMEDIATE TRANSACTION
    activate DB
    SvcH->>DB: UPDATE hoa_don SET trang_thai = 'da_thanh_toan', thoi_gian_thanh_toan = datetime('now','localtime'), ma_giao_dich_vietqr = ? WHERE id = 105
    SvcH->>DB: UPDATE phien_ban SET trang_thai = 'da_thanh_toan', thoi_gian_ket_thuc = datetime('now','localtime') WHERE id = 12
    SvcH->>DB: UPDATE ban_an SET trang_thai = 'can_don_dep' WHERE id = 4
    SvcH->>DB: COMMIT TRANSACTION
    DB-->>SvcH: Cập nhật CSDL hoàn tất
    deactivate DB
    SvcH-->>Ctrl: Giao dịch thành công
    deactivate SvcH

    Ctrl->>Sock: broadcastEvent('THANH_TOAN_THANH_CONG', { hoa_don_id: 105, ban_id: 4, phien_id: 12 })
    activate Sock
    Sock-)POS: Đổi màu bàn B04 sang xám ('can_don_dep'), phát âm thanh chốt bill
    Sock-)C: Thông báo: "Thanh toán thành công. Cảm ơn Quý khách!"
    deactivate Sock

    Ctrl->>Printer: Lệnh in hóa đơn nhiệt K80
    activate Printer
    Printer-->>TN: Xuất phiếu thanh toán K80 giao khách
    deactivate Printer
    Ctrl-->>Bank: HTTP 200 OK (Xác nhận Webhook)
    deactivate Ctrl
    deactivate POS
```

---

### 2.4. Kịch bản 4: Xử lý Ngoại lệ Thanh toán VietQR & Sổ cái Lũy kế (Ledger Model, Idempotency, Refund Flow) *(Vá lỗ hổng 2)*
* **Mục đích:** Mô tả dòng điều khiển đối soát đa kênh khi khách chia bill quét nhiều mã QR, xử lý các tình huống ngoại lệ: Khách chuyển thiếu tiền, chuyển thừa tiền (tạo phiếu chi hoàn tiền), gõ sai cú pháp chuyển khoản, và Webhook ngân hàng bắn lặp nhiều lần (bảo vệ bằng khóa Idempotency).

```mermaid
sequenceDiagram
    autonumber
    actor C as 👤 Khách hàng
    participant Bank as 🏦 Cổng Ngân hàng / SePAY
    participant Ctrl as ⚙️ thanhToan.controller
    participant Svc as 🧠 ledger.service
    participant DB as 🗄️ SQLite3 Database
    participant Sock as ⚡ Socket.io Gateway
    participant POS as 💳 Màn hình Thu Ngân (POS)

    Note over C,Bank: Khách chuyển khoản 200,000đ trên phần bill 250,000đ (Chuyển thiếu 50,000đ)
    C->>Bank: Chuyển 200,000đ nội dung "QM BAN04 HD105"
    Bank->>Ctrl: POST /api/webhook/vietqr { ma_gd: "BANK_TX_987", so_tien: 200000, noi_dung: "QM BAN04 HD105" }
    activate Ctrl

    %% Bước 1: Kiểm tra tính Idempotent chống xử lý lặp
    Ctrl->>Svc: ghiNhanGiaoDich(data)
    activate Svc
    Svc->>DB: SELECT id FROM giao_dich_thanh_toan WHERE ma_giao_dich_ngan_hang = 'BANK_TX_987'
    activate DB
    DB-->>Svc: null (Giao dịch mới chưa từng xử lý)
    deactivate DB

    alt Webhook trùng lặp (Đã tồn tại)
        Svc-->>Ctrl: Bỏ qua (HTTP 200 OK Idempotent)
    else Giao dịch hợp lệ
        Svc->>DB: BEGIN IMMEDIATE TRANSACTION
        activate DB
        Svc->>DB: INSERT INTO giao_dich_thanh_toan (hoa_don_id, so_tien, ma_giao_dich_ngan_hang, phuong_thuc='VIETQR', trang_thai='thanh_cong')
        Svc->>DB: UPDATE hoa_don SET da_thanh_toan_luy_ke = da_thanh_toan_luy_ke + 200000, con_lai = tong_cong - da_thanh_toan_luy_ke WHERE id = 105
        Svc->>DB: SELECT con_lai FROM hoa_don WHERE id = 105
        DB-->>Svc: { con_lai: 50000 } (Vẫn còn thiếu 50,000 VNĐ)
        Svc->>DB: COMMIT TRANSACTION
        deactivate DB

        alt con_lai > 0 (Khách chuyển thiếu tiền)
            Svc-->>Ctrl: Kết quả: 'thanh_toan_mot_phan' (Còn thiếu 50,000đ)
            Ctrl->>Sock: broadcastEvent('THANH_TOAN_MOT_PHAN', { hoa_don_id: 105, ban_id: 4, da_tra: 200000, con_thieu: 50000 })
            activate Sock
            Sock-)POS: Hiển thị badge vàng chớp nháy: "BÀN 04: Đã nhận 200k / Còn thiếu 50k"
            Sock-)C: Cập nhật mã VietQR động mới với số tiền còn lại: 50,000đ
            deactivate Sock
        else con_lai < 0 (Khách chuyển thừa tiền)
            Svc->>DB: INSERT INTO phieu_thu_chi_noi_bo (loai='CHI', so_tien=ABS(con_lai), ly_do='Hoàn tiền thừa VietQR Bàn 04')
            Svc-->>Ctrl: Kết quả: 'chuyen_thua_tien'
            Ctrl->>Sock: broadcastEvent('HOAN_TIEN_THUA', { ban_id: 4, so_tien_thua: ABS(con_lai) })
            Sock-)POS: Rung chuông cảnh báo: "BÀN 04 chuyển thừa - Thu ngân thối tiền mặt"
        else con_lai == 0 (Thanh toán đủ 100%)
            Svc->>DB: UPDATE hoa_don SET trang_thai = 'da_thanh_toan' WHERE id = 105
            Svc->>DB: UPDATE ban_an SET trang_thai = 'can_don_dep' WHERE id = 4
            Ctrl->>Sock: broadcastEvent('THANH_TOAN_HOAN_TAT', { ban_id: 4 })
            Sock-)POS: Bàn 04 đổi sang xám hoàn tất
        end
    end
    deactivate Svc
    Ctrl-->>Bank: HTTP 200 OK (Xác nhận Webhook thành công)
    deactivate Ctrl
```

---

### 2.5. Kịch bản 5: Cơ chế Timeout 90s & Tự động Leo thang khi Hủy món Bếp đang nấu *(Vá lỗ hổng 5)*
* **Mục đích:** Mô tả dòng sự kiện khi khách yêu cầu hủy món đang nấu trên KDS. Hệ thống kích hoạt bộ đếm ngược Timeout 90 giây; nếu Bếp không xác nhận kịp thời, hệ thống tự động rung chuông cảnh báo lần 2 và leo thang (Escalate) thông báo đẩy về Admin Dashboard của Quản lý để can thiệp.

```mermaid
sequenceDiagram
    autonumber
    actor W as 🤵 Phục vụ bàn
    participant Ctrl as ⚙️ donGoiMon.controller
    participant SvcH as 🧠 huyMon.service
    participant DB as 🗄️ SQLite3 Database
    participant Sock as ⚡ Socket.io Gateway
    participant KDS as 👨‍🍳 Màn hình Bếp (KDS)
    participant Timer as ⏱️ Background Timeout Job
    participant Admin as 👔 Admin Dashboard (Quản lý ca)

    W->>Ctrl: POST /api/don-hang/yeu-cau-huy-mon { chi_tiet_id: 88, ly_do: "Khách đổi ý, vội đi" }
    activate Ctrl
    Ctrl->>SvcH: taoYeuCauHuy(chi_tiet_id=88, ly_do)
    activate SvcH
    SvcH->>DB: SELECT trang_thai_mon FROM chi_tiet_don_mon WHERE id = 88
    activate DB
    DB-->>SvcH: { trang_thai_mon: 'dang_nau' }
    deactivate DB

    SvcH->>DB: UPDATE chi_tiet_don_mon SET trang_thai_mon = 'cho_xac_nhan_huy' WHERE id = 88
    SvcH->>DB: INSERT INTO yeu_cau_huy_mon (chi_tiet_don_mon_id, ly_do, trang_thai='cho_bep_phan_hoi', han_chot=datetime('now','+90 seconds'))
    SvcH-->>Ctrl: Đã tạo yêu cầu hủy chờ Bếp (yeu_cau_id=14)
    deactivate SvcH

    Ctrl->>Sock: broadcastEvent('BEP_YEU_CAU_HUY_MON', { yeu_cau_id: 14, chi_tiet_id: 88, ban_so: "B04", ten_mon: "Bò sốt tiêu", timeout: 90 })
    activate Sock
    Sock-)KDS: Hiển thị popup viền đỏ nhấp nháy + Chuông ting + Đếm ngược 90s
    deactivate Sock
    Ctrl-->>W: HTTP 202 Accepted { msg: "Đã gửi yêu cầu hủy xuống bếp, vui lòng đợi tối đa 90s" }
    deactivate Ctrl

    Note over KDS,Timer: Bộ đếm thời gian 90 giây bắt đầu chạy nền...
    activate Timer
    alt Bếp bấm "Đồng ý hủy" trong 90s (Bỏ món)
        KDS->>Ctrl: POST /api/bep/xac-nhan-huy { yeu_cau_id: 14, chap_nhan: true, loai_hao_hut: 'nha_hang_chiu' }
        Ctrl->>DB: UPDATE chi_tiet_don_mon SET trang_thai_mon = 'da_huy' WHERE id = 88
        Ctrl->>DB: INSERT INTO nhat_ky_kiem_toan (hanh_dong='HUY_MON_DANG_NAU', ly_do='Bếp xác nhận hủy')
        Ctrl->>Sock: broadcastEvent('HUY_MON_THANH_CONG', { chi_tiet_id: 88, ban_id: 4 })
        Sock-)W: Thông báo: "Bếp đã hủy món thành công"
        Sock-)KDS: Xóa thẻ món khỏi màn hình bếp
    else Hết 90 giây mà Bếp bận tay không bấm (Timeout Escalation)
        Timer->>Ctrl: Trigger Timeout Callback (yeu_cau_id=14)
        Ctrl->>Sock: broadcastEvent('CANH_BAO_LEO_THANG_ADMIN', { yeu_cau_id: 14, ban_so: "B04", ten_mon: "Bò sốt tiêu", ly_do: "Bếp không phản hồi sau 90s" })
        activate Sock
        Sock-)KDS: Rung chuông cảnh báo KDS lần 2 với âm lượng lớn
        Sock-)Admin: Bật popup đỏ toàn màn hình Admin Dashboard: "YÊU CẦU CAN THIỆP KHẨN CẤP"
        deactivate Sock
        Note over Admin: Quản lý ca trực tiếp bấm duyệt "Cưỡng chế hủy" hoặc gọi điện xuống bếp
    end
    deactivate Timer
```

---

### 2.6. Kịch bản 6: Quy trình Đóng ca, Chốt két mù (Blind Cash Drop) & In Báo cáo Z-Report *(Vá lỗ hổng 4)*
* **Mục đích:** Mô tả dòng sự kiện khi Thu ngân kết thúc ca làm việc (ví dụ 14:00 đổi ca sáng sang chiều). Thu ngân đếm tiền mặt thực tế và nhập vào hệ thống mà không được xem trước số liệu sổ sách. Hệ thống tự động so khớp, tính chênh lệch, in báo cáo Z-Report và bàn giao các bàn ăn dở dang.

```mermaid
sequenceDiagram
    autonumber
    actor TN as 💳 Thu ngân ca sáng
    participant POS as 🖥️ Màn hình Thu Ngân (POS)
    participant Ctrl as ⚙️ caLamViec.controller
    participant SvcC as 🧠 chotCa.service
    participant DB as 🗄️ SQLite3 Database
    participant Printer as 🖨️ Máy in nhiệt K80
    actor TN2 as 🤵 Thu ngân ca chiều

    Note over TN: Đến giờ kết thúc ca (14:00). Thu ngân kiểm đếm tiền mặt trong két
    TN->>POS: Bấm "Đóng ca & Chốt két làm việc"
    activate POS
    POS-->>TN: Hiển thị form "Chốt két mù" (Ẩn toàn bộ doanh thu lý thuyết)
    TN->>POS: Nhập các mệnh giá thực đếm (VD: 500k x 12 tờ, 200k x 25 tờ... = 11,000,000 VNĐ)
    TN->>POS: Bấm "Xác nhận chốt ca"

    POS->>Ctrl: POST /api/ca-lam-viec/chot-ca { ca_id: 1, tien_thuc_dem: 11000000, ghi_chu: "Đã bàn giao két" }
    activate Ctrl
    Ctrl->>SvcC: thucHienChotKetMu(ca_id=1, tien_thuc_dem=11000000)
    activate SvcC

    %% Bước 1: Tính toán số liệu lý thuyết từ CSDL
    SvcC->>DB: SELECT tien_dau_ca FROM ca_lam_viec WHERE id = 1
    activate DB
    DB-->>SvcC: { tien_dau_ca: 2000000 }
    SvcC->>DB: SELECT COALESCE(SUM(so_tien), 0) as thu_tien_mat FROM giao_dich_thanh_toan WHERE ca_id = 1 AND phuong_thuc = 'TIEN_MAT'
    DB-->>SvcC: { thu_tien_mat: 9050000 }
    SvcC->>DB: SELECT COALESCE(SUM(so_tien), 0) as tong_chi FROM phieu_thu_chi_noi_bo WHERE ca_id = 1 AND loai = 'CHI'
    DB-->>SvcC: { tong_chi: 50000 } (Mua đá ngoài)
    deactivate DB

    Note over SvcC: Tiền sổ sách = 2,000,000 + 9,050,000 - 50,000 = 11,000,000 VNĐ
    Note over SvcC: Chênh lệch = Tiền thực đếm (11,000,000) - Tiền sổ sách (11,000,000) = 0 VNĐ

    %% Bước 2: Lưu kết quả chốt ca & Bàn giao bàn ăn dở dang
    SvcC->>DB: BEGIN IMMEDIATE TRANSACTION
    activate DB
    SvcC->>DB: UPDATE ca_lam_viec SET tien_mat_he_thong = 11000000, tien_mat_thuc_dem = 11000000, chenh_lech = 0, trang_thai = 'da_chot', thoi_gian_ket_thuc = datetime('now','localtime') WHERE id = 1
    SvcC->>DB: UPDATE phien_ban SET ca_lam_viec_id = 2 WHERE trang_thai = 'dang_hoat_dong'
    SvcC->>DB: INSERT INTO nhat_ky_kiem_toan (hanh_dong='CHOT_CA_LAM_VIEC', ly_do='Chốt két ca 1 khớp 100%')
    SvcC->>DB: COMMIT TRANSACTION
    DB-->>SvcC: Đã lưu bảng chốt ca
    deactivate DB

    SvcC-->>Ctrl: Dữ liệu Báo cáo Z-Report (Doanh thu tổng, Tiền mặt, VietQR, Chênh lệch = 0)
    deactivate SvcC

    %% Bước 3: In hóa đơn Z-Report và bàn giao
    Ctrl->>Printer: Lệnh in báo cáo Z-Report chuẩn K80
    activate Printer
    Printer-->>TN: Xuất phiếu Báo cáo Z-Report có chữ ký bàn giao
    deactivate Printer

    Ctrl-->>POS: HTTP 200 OK (Chốt ca thành công, tự động đăng xuất)
    deactivate Ctrl
    POS-->>TN: Thông báo thành công và quay về màn hình đăng nhập
    deactivate POS

    Note over TN,TN2: TN ký biên bản bàn giao két tiền và Z-Report cho TN2 ca chiều tiếp quản
```

### 2.7. Kịch bản 7: Quy trình Nhân viên nộp phiếu Đổi ca / Xin nghỉ & Quản lý phê duyệt Real-time *(Đồng bộ Figma W11 & A07)*
* **Mục đích:** Mô tả dòng tương tác 2 chiều giữa Nhân viên phục vụ (`W11 · Ca làm và yêu cầu nghỉ`) và Quản trị viên (`A07 · Duyệt nghỉ và đổi ca`). Nhân viên tra cứu lịch tuần, gửi đơn xin đổi ca/nghỉ ca kèm lý do; Server kích hoạt Socket.io rung chuông trên Admin Dashboard. Khi Quản lý bấm duyệt, hệ thống mở Transaction hoán đổi `nhan_vien_id` trong `ca_lam_viec`, ghi Audit Log và bắn Socket.io cập nhật lịch trực tuần tức thời về thiết bị nhân viên.
* **Tài nguyên:** [soDoTuanTuDoiCa.svg](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuDoiCa.svg) | [soDoTuanTuDoiCa.png](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuDoiCa.png) | [soDoTuanTuDoiCa.mmd](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuDoiCa.mmd)

```mermaid
sequenceDiagram
    autonumber
    actor W as 🤵 Nhân viên (Waiter)
    participant UI as 📱 Waiter Mobile (W11)
    participant Ctrl as ⚙️ caLamViec.controller
    participant Svc as 🧠 caLamViec.service
    participant DB as 🗄️ SQLite3 Database
    participant Sock as ⚡ Socket.io Gateway
    participant A_UI as 💻 Admin Dashboard (A07)
    actor A as 👔 Quản lý (Admin)

    %% GIAI ĐOẠN 1: XEM LỊCH CA & TẠO PHIẾU YÊU CẦU
    Note over W,UI: Nhân viên truy cập Tab "Ca của tôi" (Figma W11)
    W->>UI: Mở màn hình "Ca làm và yêu cầu nghỉ"
    activate UI
    UI->>Ctrl: GET /api/ca-lam-viec/lich-tuan (nhan_vien_id=3)
    activate Ctrl
    Ctrl->>Svc: layLichTuanTheoNhanVien(nhanVienId=3)
    activate Svc
    Svc->>DB: SELECT * FROM ca_lam_viec WHERE nhan_vien_id = 3 AND ngay_lam >= DATE('now')
    activate DB
    DB-->>Svc: Dữ liệu ca hôm nay & lịch trực 7 ngày tới
    deactivate DB
    Svc-->>Ctrl: Danh sách ca trực & đồng nghiệp trong ca
    deactivate Svc
    Ctrl-->>UI: HTTP 200 OK (lich_truc, ds_dong_nghiep)
    deactivate Ctrl
    UI-->>W: Hiển thị ca hiện tại & form gửi yêu cầu

    %% GIAI ĐOẠN 2: ĐIỀN FORM VÀ GỬI YÊU CẦU ĐỔI CA / NGHỈ CA
    W->>UI: Chọn "Đổi ca", chọn ca cần đổi, chọn đồng nghiệp & nhập lý do
    W->>UI: Bấm nút "Gửi yêu cầu đổi ca"
    UI->>Ctrl: POST /api/ca-lam-viec/yeu-cau-doi-ca (payload)
    activate Ctrl
    Ctrl->>Svc: taoYeuCauDoiCa(nhanVienYeuCauId=3, caId=8, nguoiDoiId=5, lyDo)
    activate Svc

    Svc->>DB: BEGIN IMMEDIATE TRANSACTION
    activate DB
    Svc->>DB: INSERT INTO yeu_cau_doi_ca (nhan_vien_yeu_cau_id, ca_lam_viec_id, loai_yeu_cau, nhan_vien_nhan_ca_id, ly_do, trang_thai) VALUES (3, 8, 'doi_ca', 5, '...', 'cho_duyet')
    Svc->>DB: INSERT INTO nhat_ky_kiem_toan (hanh_dong, nguoi_thuc_hien_id, chi_tiet) VALUES ('TAO_YEU_CAU_DOI_CA', 3, '...')
    Svc->>DB: COMMIT TRANSACTION
    DB-->>Svc: yeu_cau_doi_ca_id = 15
    deactivate DB

    Svc-->>Ctrl: Bản ghi yêu cầu mới (trang_thai='cho_duyet')
    deactivate Svc
    Ctrl->>Sock: broadcastEvent('ADMIN_NEW_SHIFT_REQUEST', { yeu_cau_id: 15, nhan_vien: 'Minh' })
    activate Sock
    Sock-)A_UI: Emit: 'nhan_su:co_yeu_cau_moi' (Rung chuông & badge đỏ A07)
    deactivate Sock
    Ctrl-->>UI: HTTP 201 Created { ok: true, msg: "Đã gửi yêu cầu, chờ quản lý duyệt" }
    deactivate Ctrl
    UI-->>W: Hiển thị banner: "Chờ quản lý duyệt · Lịch cũ vẫn có hiệu lực"

    %% GIAI ĐOẠN 3: QUẢN LÝ PHÊ DUYỆT TRÊN ADMIN DASHBOARD
    Note over A,A_UI: Quản lý tiếp nhận đơn trên màn hình A07 (Figma A07)
    A->>A_UI: Xem chi tiết lý do & bấm "Chấp thuận"
    activate A_UI
    A_UI->>Ctrl: PUT /api/ca-lam-viec/yeu-cau-doi-ca/15/duyet { quyet_dinh: 'chap_thuan', quan_ly_id: 1 }
    activate Ctrl
    Ctrl->>Svc: pheDuyetYeuCauDoiCa(yeuCauId=15, quanLyId=1, 'da_duyet')
    activate Svc

    Svc->>DB: BEGIN IMMEDIATE TRANSACTION
    activate DB
    Svc->>DB: UPDATE yeu_cau_doi_ca SET trang_thai = 'da_duyet', quan_ly_duyet_id = 1, ngay_duyet = CURRENT_TIMESTAMP WHERE id = 15
    Svc->>DB: UPDATE ca_lam_viec SET nhan_vien_id = 5 WHERE id = 8
    Svc->>DB: INSERT INTO nhat_ky_kiem_toan (hanh_dong, nguoi_thuc_hien_id, chi_tiet) VALUES ('DUYET_DOI_CA', 1, 'Duyệt đổi ca #8 sang nhân viên #5')
    Svc->>DB: COMMIT TRANSACTION
    DB-->>Svc: Hoán đổi ca thành công
    deactivate DB

    Svc-->>Ctrl: Kết quả phê duyệt & lịch làm cập nhật
    deactivate Svc
    Ctrl->>Sock: broadcastEvent('SHIFT_UPDATED', { yeu_cau_id: 15, trang_thai: 'da_duyet', nhan_vien_ids: [3, 5] })
    activate Sock
    Sock-)UI: Emit: 'nhan_su:ket_qua_duyet' (Cập nhật lịch mới cho nhân viên)
    Sock-)A_UI: Emit: 'nhan_su:danh_sach_cap_nhat' (Xóa thẻ khỏi hàng đợi chờ duyệt)
    deactivate Sock
    Ctrl-->>A_UI: HTTP 200 OK { ok: true, msg: "Phê duyệt thành công" }
    deactivate Ctrl
    A_UI-->>A: Thông báo cập nhật lịch trực tuần thành công
    deactivate A_UI

    UI-->>W: Cập nhật giao diện: Badge "Đã duyệt" & Lịch trực tuần đổi sang ca mới
    deactivate UI
```

---

## 3. BIỂU ĐỒ TRẠNG THÁI (STATE MACHINE DIAGRAMS)

### 3.1. Vòng đời Bàn ăn (Table Lifecycle)
* **Trạng thái chuẩn SQLite3:** `'trong'`, `'co_khach'`, `'cho_mon'`, `'yeu_cau_thanh_toan'`, `'can_don_dep'`.
* **Tài nguyên:** [soDoTrangThaiBanAn.svg](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiBanAn.svg) | [soDoTrangThaiBanAn.png](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiBanAn.png) | [soDoTrangThaiBanAn.mmd](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiBanAn.mmd)

```mermaid
stateDiagram-v2
    title BIỂU ĐỒ TRẠNG THÁI VÒNG ĐỜI BÀN ĂN (TABLE LIFECYCLE)

    [*] --> Trong : Bàn sạch sẵn sàng đón khách

    state Trong {
        [*] --> SanSang
        SanSang : Bàn trống, mã QR hoạt động
    }

    Trong --> CoKhach : Khách quét mã QR / Phục vụ mở bàn
    
    state CoKhach {
        [*] --> KhachVaoBan
        KhachVaoBan : Khởi tạo phiên bàn (phien_ban)
    }

    CoKhach --> ChoMon : Khách gửi đơn đặt món vào Bếp KDS
    
    state ChoMon {
        [*] --> ChoCheBien
        ChoCheBien : Bếp đang tiếp nhận và nấu món
    }

    ChoMon --> CoKhach : Toàn bộ món đã được bưng lên bàn (da_phuc_vu)
    CoKhach --> ChoMon : Khách tiếp tục gọi thêm món

    CoKhach --> YeuCauThanhToan : Khách bấm "Yêu cầu tính tiền" trên E-Menu
    ChoMon --> YeuCauThanhToan : Khách muốn thanh toán sớm
    
    state YeuCauThanhToan {
        [*] --> KhoaOrder
        KhoaOrder : Thu ngân lập hóa đơn & xuất mã VietQR
    }

    YeuCauThanhToan --> CanDonDep : Xác nhận thanh toán (Tiền mặt / VietQR)
    
    state CanDonDep {
        [*] --> ChoNhanVienDon
        ChoNhanVienDon : Khách rời bàn, bàn chuyển màu xám
    }

    CanDonDep --> Trong : Phục vụ bấm "Đã dọn sạch" trên điện thoại
```

---

### 3.2. Vòng đời Phiên bàn (Table Session Lifecycle)
* **Trạng thái chuẩn SQLite3:** `'dang_hoat_dong'`, `'da_thanh_toan'`, `'da_dong'`.
* **Tài nguyên:** [soDoTrangThaiPhienBan.svg](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiPhienBan.svg) | [soDoTrangThaiPhienBan.png](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiPhienBan.png) | [soDoTrangThaiPhienBan.mmd](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiPhienBan.mmd)

```mermaid
stateDiagram-v2
    title BIỂU ĐỒ TRẠNG THÁI VÒNG ĐỜI PHIÊN BÀN (TABLE SESSION LIFECYCLE)

    [*] --> DangHoatDong : Khách quét QR mở bàn / Phục vụ tạo phiên mới

    state DangHoatDong {
        [*] --> ChiaSePhien
        ChiaSePhien : Cho phép nhiều điện thoại cùng tham gia đặt món (Shared Session)
    }

    DangHoatDong --> DaThanhToan : Thu ngân hoàn tất thanh toán (Hóa đơn khớp số tiền)
    
    state DaThanhToan {
        [*] --> KhoaThemMon
        KhoaThemMon : Khóa quyền gọi thêm món, chuẩn bị đóng phiên
    }

    DaThanhToan --> DaDong : Khách rời quán & Phục vụ xác nhận giải phóng bàn
    DangHoatDong --> DaDong : Hủy phiên do khách đổi bàn / hủy bàn trắng

    state DaDong {
        [*] --> LuuLichSu
        LuuLichSu : Lưu vết lịch sử phục vụ, vô hiệu hóa token phiên cũ
    }

    DaDong --> [*]
```

---

### 3.3. Vòng đời Món ăn trong đơn (Order Item Lifecycle)
* **Trạng thái chuẩn SQLite3:** `'cho_duyet'`, `'dang_nau'`, `'hoan_thanh'`, `'da_phuc_vu'`, `'yeu_cau_huy'`, `'huy_mon'`, `'da_huy'`.
* **Tài nguyên:** [soDoTrangThaiMonAn.svg](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiMonAn.svg) | [soDoTrangThaiMonAn.png](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiMonAn.png) | [soDoTrangThaiMonAn.mmd](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiMonAn.mmd)

```mermaid
stateDiagram-v2
    title BIỂU ĐỒ TRẠNG THÁI VÒNG ĐỜI MÓN ĂN TRONG ĐƠN (ORDER ITEM LIFECYCLE)

    [*] --> ChoDuyet : Khách xác nhận gửi giỏ hàng E-Menu

    state ChoDuyet {
        [*] --> HangDoiKDS
        HangDoiKDS : Hiển thị trên KDS (hoặc chờ Phục vụ duyệt nếu tắt auto)
    }

    ChoDuyet --> DangNau : Đầu bếp nhấn "Bắt đầu nấu" trên KDS
    
    state DangNau {
        [*] --> CheBienMon
        CheBienMon : Đếm ngược thời gian nấu theo mục tiêu (VD: 15 phút)
    }

    DangNau --> HoanThanh : Đầu bếp nhấn "Hoàn thành món"
    
    state HoanThanh {
        [*] --> ChoBungMon
        ChoBungMon : KDS đổi màu xanh lá, chuông rung báo Phục vụ lấy món
    }

    HoanThanh --> DaPhucVu : Nhân viên phục vụ bưng lên bàn & bấm xác nhận
    
    state DaPhucVu {
        [*] --> HoanTatMonAn
        HoanTatMonAn : Món ăn được tính vào hóa đơn thanh toán
    }

    DaPhucVu --> [*]

    %% Nhánh yêu cầu hủy món có kiểm soát
    ChoDuyet --> DaHuy : Phục vụ từ chối duyệt đơn / Khách hủy trước duyệt
    DangNau --> YeuCauHuy : Khách xin hủy khi đang nấu / Đợi quá lâu
    
    state YeuCauHuy {
        [*] --> ChoAdminPheDuyet
        ChoAdminPheDuyet : Gửi thông báo khẩn cấp lên Quản trị viên (Admin)
    }

    YeuCauHuy --> HuyMon : Admin phê duyệt chấp thuận hủy món
    YeuCauHuy --> DangNau : Admin từ chối (Tiếp tục nấu phục vụ)
    
    state HuyMon {
        [*] --> GhiNhanAuditLog
        GhiNhanAuditLog : Ghi nhật ký kiểm toán (Lý do, Người duyệt, Giảm bill)
    }

    HuyMon --> [*]
    DaHuy --> [*]
```

---

### 3.4. Vòng đời Hóa đơn thanh toán (Invoice Lifecycle)
* **Trạng thái chuẩn SQLite3:** `'chua_thanh_toan'`, `'da_thanh_toan'`, `'da_huy'`.
* **Tài nguyên:** [soDoTrangThaiHoaDon.svg](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiHoaDon.svg) | [soDoTrangThaiHoaDon.png](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiHoaDon.png) | [soDoTrangThaiHoaDon.mmd](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiHoaDon.mmd)

```mermaid
stateDiagram-v2
    title BIỂU ĐỒ TRẠNG THÁI VÒNG ĐỜI HÓA ĐƠN (INVOICE LIFECYCLE)

    [*] --> ChuaThanhToan : Thu ngân bấm "Lập hóa đơn" cho phiên bàn

    state ChuaThanhToan {
        [*] --> LapBillTamTinh
        LapBillTamTinh : Tổng hợp món đã dùng, tính VAT 8% và trừ chiết khấu
        LapBillTamTinh --> ChoTienMat : Chọn hình thức Tiền mặt (tính tiền thối)
        LapBillTamTinh --> ChoQuetVietQR : Xuất mã VietQR NAPAS 247 động
    }

    ChuaThanhToan --> DaThanhToan : Nhận đủ tiền mặt / Webhook ngân hàng báo có tiền
    
    state DaThanhToan {
        [*] --> InHoaDonNhiet
        InHoaDonNhiet : In hóa đơn K80, cập nhật doanh thu và giải phóng bàn
    }

    DaThanhToan --> [*]

    %% Nhánh hủy hóa đơn (Split Bill / Đổi bàn)
    ChuaThanhToan --> DaHuy : Tách hóa đơn (Split Bill) / Lập nhầm bàn (Admin duyệt)
    
    state DaHuy {
        [*] --> GhiNhanAuditHuy
        GhiNhanAuditHuy : Lưu lịch sử hủy bill trong nhat_ky_kiem_toan
    }

    DaHuy --> [*]
```

---

## 4. BIỂU ĐỒ LỚP KIẾN TRÚC HỆ THỐNG MVC (CLASS DIAGRAM)
* **Mục đích:** Đặc tả rõ mối quan hệ phân tầng kiến trúc theo quy chuẩn Express MVC: Các tầng Controller điều hướng và validate, tầng Service xử lý logic nghiệp vụ, tầng Model tương tác CSDL SQLite3, và SocketGateway phát tán sự kiện thời gian thực. Bổ sung đầy đủ module `PhienBan` làm trung gian phiên bàn.
* **Tài nguyên:** [soDoLopHeThong.svg](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoLopHeThong.svg) | [soDoLopHeThong.png](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoLopHeThong.png) | [soDoLopHeThong.mmd](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoLopHeThong.mmd)

```mermaid
classDiagram
    %% --- CONTROLLERS ---
    class BanAnController {
        +laySoDoBan(req, res)
        +moBanMoi(req, res)
        +chuyenGopBan(req, res)
        +xacNhanDonBan(req, res)
    }

    class PhienBanController {
        +layHoacTaoPhien(req, res)
        +dongPhienBan(req, res)
        +layThongTinPhien(req, res)
    }

    class DonGoiMonController {
        +taoDonGoiMon(req, res)
        +layDonTheoPhien(req, res)
        +huyMonAn(req, res)
    }

    class BepKDSController {
        +layHangDoiCheBien(req, res)
        +capNhatTrangThaiMon(req, res)
        +baoHetMon(req, res)
    }

    class HoaDonController {
        +lapHoaDonTamTinh(req, res)
        +taoMaVietQR(req, res)
        +xacNhanThanhToan(req, res)
        +tachHoaDon(req, res)
    }

    class CaLamViecController {
        +layLichTuan(req, res)
        +taoYeuCauDoiCa(req, res)
        +duyetYeuCauDoiCa(req, res)
    }

    %% --- SERVICES ---
    class BanAnService {
        +kiemTraTrangThaiBan(banId)
        +doiTrangThaiBan(banId, status)
        +taiSinhMaQrToken(banId)
    }

    class PhienBanService {
        +layPhienDangHoatDong(banId)
        +khoiTaoPhienMoi(banId, soKhach)
        +chotPhienThanhToan(phienId)
    }

    class DonGoiMonService {
        +kiemTraConMon(dsMonId)
        +luuDonVaChiTiet(phienId, dsMon)
        +tinhTongTienTam(phienId)
    }

    class BepKDSService {
        +dieuPhoiHangDoi()
        +batDauNau(chiTietId, dauBepId)
        +hoanThanhNau(chiTietId)
    }

    class HoaDonService {
        +tinhTienHoaDon(phienId, voucher)
        +taoPayloadVietQR(hoaDonId, tongTien)
        +hoanTatThanhToan(hoaDonId, phuongThuc)
    }

    class CaLamViecService {
        +layLichTuanTheoNhanVien(nhanVienId)
        +taoYeuCauDoiCa(data)
        +pheDuyetYeuCauDoiCa(id, quanLyId, status)
    }

    %% --- MODELS / REPOSITORIES ---
    class BanAnModel {
        +int id
        +int khu_vuc_id
        +string ma_ban
        +string ten_ban
        +int suc_chua
        +string trang_thai
        +string ma_qr_token
        +timTheoId(id)
        +capNhatTrangThai(id, status)
    }

    class PhienBanModel {
        +int id
        +int ban_an_id
        +string ma_phien
        +string trang_thai
        +datetime thoi_gian_bat_dau
        +datetime thoi_gian_ket_thuc
        +taoPhien(data)
        +timPhienHienTai(banId)
    }

    class MonAnModel {
        +int id
        +int danh_muc_id
        +string ma_mon
        +string ten_mon
        +int don_gia
        +int con_mon
        +timTheoId(id)
        +kiemTraConMon(ids)
    }

    class DonGoiMonModel {
        +int id
        +int phien_ban_id
        +string ma_don
        +string nguon_tao
        +string trang_thai
        +datetime thoi_gian_gui
        +taoDonMoi(data)
        +layDsTheoPhien(phienId)
    }

    class ChiTietDonMonModel {
        +int id
        +int don_goi_mon_id
        +int mon_an_id
        +int so_luong
        +int don_gia
        +string trang_thai_mon
        +datetime thoi_gian_bat_dau_nau
        +datetime thoi_gian_hoan_thanh_nau
        +themChiTiet(items)
        +doiTrangThai(id, status)
    }

    class HoaDonModel {
        +int id
        +int phien_ban_id
        +string ma_hoa_don
        +int tong_tien_mon
        +int tien_vat
        +int tien_chiet_khau
        +int tong_tien_thanh_toan
        +string phuong_thuc_thanh_toan
        +string trang_thai
        +taoHoaDon(data)
        +capNhatThanhToan(id, data)
    }

    class NhanVienModel {
        +int id
        +int tai_khoan_id
        +string ho_ten
        +string so_dien_thoai
        +timTheoId(id)
    }

    class CaLamViecModel {
        +int id
        +int nhan_vien_id
        +date ngay_lam
        +string ten_ca
        +string trang_thai
        +layLichTheoNhanVien(nhanVienId)
        +hoanDoiNhanVien(caId, nhanVienMoiId)
    }

    class YeuCauDoiCaModel {
        +int id
        +int nhan_vien_yeu_cau_id
        +int ca_lam_viec_id
        +string loai_yeu_cau
        +int nhan_vien_nhan_ca_id
        +string ly_do
        +string trang_thai
        +int quan_ly_duyet_id
        +taoYeuCau(data)
        +capNhatTrangThaiDuyet(id, status, quanLyId)
    }

    %% --- REALTIME GATEWAY ---
    class SocketGateway {
        +broadcastOrderNew(data)
        +broadcastCookingStatus(data)
        +broadcastDishReady(data)
        +broadcastPaymentSuccess(data)
        +broadcastShiftRequest(data)
        +broadcastShiftApproval(data)
    }

    %% --- RELATIONSHIPS ARCHITECTURE ---
    BanAnController --> BanAnService
    PhienBanController --> PhienBanService
    DonGoiMonController --> DonGoiMonService
    BepKDSController --> BepKDSService
    HoaDonController --> HoaDonService
    CaLamViecController --> CaLamViecService

    BanAnService --> BanAnModel
    BanAnService --> SocketGateway

    PhienBanService --> PhienBanModel
    PhienBanService --> BanAnModel

    DonGoiMonService --> DonGoiMonModel
    DonGoiMonService --> ChiTietDonMonModel
    DonGoiMonService --> MonAnModel
    DonGoiMonService --> SocketGateway

    BepKDSService --> ChiTietDonMonModel
    BepKDSService --> SocketGateway

    HoaDonService --> HoaDonModel
    HoaDonService --> ChiTietDonMonModel
    HoaDonService --> PhienBanModel
    HoaDonService --> BanAnModel
    HoaDonService --> SocketGateway

    CaLamViecService --> CaLamViecModel
    CaLamViecService --> YeuCauDoiCaModel
    CaLamViecService --> SocketGateway

    %% --- DATA ENTITY CARDINALITY ---
    BanAnModel "1" --> "0..*" PhienBanModel : sở hữu các phiên
    PhienBanModel "1" --> "0..*" DonGoiMonModel : chứa các đợt gọi
    DonGoiMonModel "1" --> "1..*" ChiTietDonMonModel : gồm các món
    MonAnModel "1" --> "0..*" ChiTietDonMonModel : được đặt
    PhienBanModel "1" --> "0..*" HoaDonModel : thanh toán
    NhanVienModel "1" --> "0..*" CaLamViecModel : được xếp ca
    CaLamViecModel "1" --> "0..*" YeuCauDoiCaModel : đổi ca
    NhanVienModel "1" --> "0..*" YeuCauDoiCaModel : đề xuất
```

---

## 5. BIỂU ĐỒ TRIỂN KHAI (DEPLOYMENT DIAGRAM) — KIẾN TRÚC HYBRID LOCAL-FIRST *(Vá lỗ hổng 3)*
* **Mục đích:** Mô tả kiến trúc vật lý và các nút phần cứng tại nhà hàng. Đảm bảo khi mất kết nối cáp quang Internet ra ngoài, hệ thống mạng nội bộ LAN/Wi-Fi của quán vẫn duy trì 100% hoạt động gọi món, nấu nướng và in hóa đơn K80 không bị tê liệt. Đồng thời định tuyến traffic khách 4G thông qua Cloudflare Tunnel bảo mật.

```mermaid
flowchart TB
    subgraph InternetCloud["🌐 MÔI TRƯỜNG INTERNET & DỊCH VỤ NGOÀI"]
        Cust4G["📱 Điện thoại Khách hàng (4G/5G Viettel/Vina)"]
        BankAPI["🏦 Cổng Thanh toán VietQR / SePAY Webhook"]
        CFTunnel["🛡️ Cloudflare Secure Tunnel (order.quanmoc.vn)"]
    end

    subgraph RestaurantPremise["🏠 HẠ TẦNG VẬT LÝ TẠI NHÀ HÀNG (MẠNG LAN NỘI BỘ 192.168.1.0/24)"]
        subgraph GatewaySwitch["🔌 Trung tâm Mạng Cục bộ"]
            Router["📡 Router Wi-Fi & Switch Gigabit Nhà hàng"]
        end

        subgraph LocalServerNode["🖥️ MÁY CHỦ CỤC BỘ (LOCAL SERVER - MINI PC QUẦY POS)"]
            NodeRuntime["⚙️ Node.js Express Runtime (Port 3000)"]
            SQLiteDB[("🗄️ SQLite3 Database (WAL Mode Enabled)")]
            SocketServer["⚡ Socket.io WebSocket Gateway"]
            LocalStatic["📁 Static Web Assets (HTML5, CSS, JS)"]
            NodeRuntime --- SQLiteDB
            NodeRuntime --- SocketServer
            NodeRuntime --- LocalStatic
        end

        subgraph CashierCounter["💳 QUẦY THU NGÂN"]
            POSScreen["🖥️ Màn hình POS Cảm ứng (Widescreen 70/30)"]
            CashDrawer["💵 Két Tiền Mặt (Tự bật khi chốt bill)"]
            ThermalPrinter["🖨️ Máy in nhiệt K80 (Cổng LAN / USB ESC/POS)"]
        end

        subgraph KitchenFloor["🍳 KHU VỰC BẾP & BAR"]
            KDSScreen1["🖥️ Màn hình KDS Bếp Nóng (Treo tường, Dark Mode)"]
            KDSScreen2["🖥️ Màn hình KDS Bar Đồ Uống (Treo tường)"]
        end

        subgraph DiningTables["🤵 KHU VỰC BÀN ĂN & PHỤC VỤ"]
            CustWiFi["📱 Khách dùng Wi-Fi Quán Mộc (E-Menu)"]
            WaiterMobile["📱 Điện thoại Phục vụ bàn (App Web di động + Service Worker)"]
        end
    end

    %% Mạng ngoài vào Router
    Cust4G --> CFTunnel
    BankAPI --> CFTunnel
    CFTunnel --> Router

    %% Router kết nối Local Server
    Router <== "Dây cáp mạng CAT6 Gigabit" ==> NodeRuntime

    %% Thiết bị trong nhà hàng nối vào Router
    POSScreen <== "Dây LAN" ==> Router
    POSScreen --- CashDrawer
    POSScreen --- ThermalPrinter

    KDSScreen1 <== "Dây LAN / Wi-Fi 5GHz Nội bộ" ==> Router
    KDSScreen2 <== "Dây LAN / Wi-Fi 5GHz Nội bộ" ==> Router

    CustWiFi -. "Wi-Fi Khách (Guest SSID)" .-> Router
    WaiterMobile -. "Wi-Fi Nội bộ (Staff SSID)" .-> Router

    classDef server fill:#EFF6FF,stroke:#2563EB,stroke-width:2px;
    classDef hardware fill:#FEF3C7,stroke:#D97706,stroke-width:1px;
    classDef cloud fill:#F3E8FF,stroke:#7E22CE,stroke-width:1px;
    class NodeRuntime,SQLiteDB,SocketServer server;
    class POSScreen,CashDrawer,ThermalPrinter,KDSScreen1,KDSScreen2 hardware;
    class CFTunnel,BankAPI,Cust4G cloud;
```

---

## 6. TỔNG KẾT BỘ TÀI NGUYÊN THIẾT KẾ ĐÃ ĐỒNG BỘ 100% CSDL

| Nhóm sơ đồ | Tên file biểu đồ | Định dạng Vector (.svg) | Định dạng Ảnh (.png) | Mã nguồn (.mmd / .puml) |
| :--- | :--- | :---: | :---: | :---: |
| **Ca sử dụng** | Sơ đồ Use Case Tổng quan | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoCaSuDung.svg) | [PNG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoCaSuDung.png) | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoCaSuDung.mmd) / [PUML](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoCaSuDung.puml) |
| **Ca sử dụng** | Phân rã Khách hàng | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/usecaseKhachHang.svg) | — | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/usecaseKhachHang.mmd) |
| **Ca sử dụng** | Phân rã Phục vụ | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/usecasePhucVu.svg) | — | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/usecasePhucVu.mmd) |
| **Ca sử dụng** | Phân rã Bếp KDS | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/usecaseBepKDS.svg) | — | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/usecaseBepKDS.mmd) |
| **Ca sử dụng** | Phân rã Thu ngân & Admin | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/usecaseThuNganAdmin.svg) | — | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/usecaseThuNganAdmin.mmd) |
| **Hoạt động** | Quy trình nghiệp vụ 5 làn | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoQuyTrinhNghiepVu.svg) | [PNG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoQuyTrinhNghiepVu.png) | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoQuyTrinhNghiepVu.mmd) / [DRAWIO](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/quyTrinhNhaHang.drawio) |
| **Tuần tự** | Khách gọi món QR Realtime | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuGoiMon.svg) | [PNG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuGoiMon.png) | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuGoiMon.mmd) |
| **Tuần tự** | Bếp điều phối & chế biến | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuDieuPhoiBep.svg) | [PNG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuDieuPhoiBep.png) | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuDieuPhoiBep.mmd) |
| **Tuần tự** | Thanh toán VietQR NAPAS | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuThanhToanVietQR.svg) | [PNG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuThanhToanVietQR.png) | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuThanhToanVietQR.mmd) |
| **Tuần tự** | Nhân viên đổi ca & xin nghỉ | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuDoiCa.svg) | [PNG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuDoiCa.png) | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTuanTuDoiCa.mmd) |
| **Trạng thái** | Vòng đời Bàn ăn | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiBanAn.svg) | [PNG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiBanAn.png) | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiBanAn.mmd) |
| **Trạng thái** | Vòng đời Phiên bàn | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiPhienBan.svg) | [PNG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiPhienBan.png) | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiPhienBan.mmd) |
| **Trạng thái** | Vòng đời Món trong đơn | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiMonAn.svg) | [PNG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiMonAn.png) | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiMonAn.mmd) |
| **Trạng thái** | Vòng đời Hóa đơn thanh toán | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiHoaDon.svg) | [PNG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiHoaDon.png) | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoTrangThaiHoaDon.mmd) |
| **Lớp (Class)**| Kiến trúc Express MVC | [SVG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoLopHeThong.svg) | [PNG](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoLopHeThong.png) | [MMD](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoLopHeThong.mmd) |
