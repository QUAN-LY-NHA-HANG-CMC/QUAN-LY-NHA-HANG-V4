# TÀI LIỆU BIỂU ĐỒ ERD & DATABASE DIAGRAM
## ĐỀ TÀI: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR (QUÁN MỘC POS & E-MENU)

---

## 1. TỔNG QUAN HỆ CƠ SỞ DỮ LIỆU

Hệ thống cơ sở dữ liệu của dự án được xây dựng trên nền tảng **SQLite3**, tuân thủ nghiêm ngặt **Quy chuẩn phát triển phần mềm toàn dự án**:
- **Quy tắc đặt tên:** Tên bảng và tên cột dùng chuẩn `snake_case` tiếng Việt không dấu.
- **Chuẩn hóa dữ liệu:** Đạt dạng chuẩn 3 (**3NF - Third Normal Form**), loại bỏ hoàn toàn dư thừa dữ liệu và dị thường cập nhật.
- **Quy mô:** Bao gồm **22 bảng thực thể** và **31 chỉ mục (Index) chiến lược** tối ưu hóa truy vấn thời gian thực cho 5 phân hệ người dùng.

---

## 2. BIỂU ĐỒ QUAN HỆ THỰC THỂ (ENTITY-RELATIONSHIP DIAGRAM - ERD)

Biểu đồ ERD dưới đây mô tả đầy đủ 22 thực thể, các thuộc tính khóa chính (`PK`), khóa ngoại (`FK`), kiểu dữ liệu và bản số quan hệ (Crow's Foot Notation):

* **File ảnh Vector SVG:** [taiLieu/soDoCoSoDuLieu.svg](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoCoSoDuLieu.svg)
* **File ảnh độ phân giải cao PNG:** [taiLieu/soDoCoSoDuLieu.png](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoCoSoDuLieu.png)
* **Mã nguồn Mermaid:** [taiLieu/soDoCoSoDuLieu.mmd](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/soDoCoSoDuLieu.mmd)

```mermaid
erDiagram
    vai_tro ||--o{ tai_khoan : "phan_quyen"
    tai_khoan ||--o| nhan_vien : "so_huu_ho_so"
    nhan_vien ||--o{ ca_lam_viec : "dang_ky_truc"
    nhan_vien ||--o{ yeu_cau_doi_ca : "gui_yeu_cau"
    nhan_vien ||--o{ yeu_cau_doi_ca : "nhan_ca_doi"
    nhan_vien ||--o{ yeu_cau_doi_ca : "quan_ly_duyet"
    ca_lam_viec ||--o{ yeu_cau_doi_ca : "thuoc_ve_ca"
    tai_khoan ||--o{ nhat_ky_kiem_toan : "thuc_hien_hanh_dong"

    khu_vuc ||--o{ ban_an : "dinh_vi_khu_vuc"
    nhan_vien ||--o{ phan_cong_ban : "nhan_vien_phu_trach"
    ban_an ||--o{ phan_cong_ban : "ban_duoc_giao"

    danh_muc_mon ||--o{ mon_an : "phan_loai_danh_muc"
    mon_an ||--o{ combo_chi_tiet : "mon_combo_chua"
    mon_an ||--o{ combo_chi_tiet : "mon_le_thanh_phan"

    ban_an ||--o{ phien_ban : "mo_phien_phuc_vu"
    phien_ban ||--o{ don_goi_mon : "tao_dot_order"
    nhan_vien ||--o{ don_goi_mon : "phuc_vu_tao_ho"
    nhan_vien ||--o{ don_goi_mon : "phuc_vu_xac_nhan"
    don_goi_mon ||--|{ chi_tiet_don_mon : "bao_gom_mon"
    mon_an ||--o{ chi_tiet_don_mon : "duoc_dat_mon"
    chi_tiet_don_mon ||--o| yeu_cau_huy_mon : "gui_yeu_cau_huy"
    nhan_vien ||--o{ yeu_cau_huy_mon : "phuc_vu_yeu_cau"
    nhan_vien ||--o{ yeu_cau_huy_mon : "quan_ly_phe_duyet"
    phien_ban ||--o{ yeu_cau_ho_tro : "khach_goi_chuong"

    phien_ban ||--o{ hoa_don : "lap_hoa_don"
    nhan_vien ||--o{ hoa_don : "thu_ngan_thu_tien"
    hoa_don ||--o{ hoa_don : "tach_hoa_don_con"
    hoa_don ||--|{ chi_tiet_hoa_don : "chua_dong_tien"
    mon_an ||--o{ chi_tiet_hoa_don : "xuat_dong_mon"
    hoa_don ||--o| chia_tien_nhom : "cua_tien_nhom"
    phien_ban ||--o| danh_gia : "khach_danh_gia"

    vai_tro {
        int id PK
        string ma_vai_tro "UNIQUE"
        string ten_vai_tro
        string mo_ta
        datetime ngay_tao
    }
    tai_khoan {
        int id PK
        string ten_dang_nhap "UNIQUE"
        string mat_khau_hash
        int vai_tro_id FK
        string trang_thai "hoat_dong | tam_khoa | da_xoa"
        datetime lan_dang_nhap_cuoi
    }
    nhan_vien {
        int id PK
        int tai_khoan_id FK "UNIQUE"
        string ho_ten
        string so_dien_thoai "UNIQUE"
        string email "UNIQUE"
        int muc_luong
        string trang_thai "dang_lam | tam_nghi | da_nghi"
    }
    ban_an {
        int id PK
        int khu_vuc_id FK
        string ma_ban "UNIQUE"
        string ten_ban
        int suc_chua
        string ma_qr_token "UNIQUE"
        string che_do_duyet_mon "tu_dong | can_duyet"
        string trang_thai "trong | co_khach | cho_thanh_toan | can_don"
    }
    mon_an {
        int id PK
        int danh_muc_id FK
        string ma_mon "UNIQUE"
        string ten_mon
        int don_gia "CHECK > 0"
        boolean la_combo
        boolean la_mon_goi_y
        string trang_thai "con_mon | het_mon | ngung_ban"
    }
    phien_ban {
        int id PK
        int ban_an_id FK
        string ma_phien "UNIQUE"
        int so_khach
        datetime thoi_gian_bat_dau
        datetime thoi_gian_ket_thuc
        string trang_thai "dang_phuc_vu | cho_thanh_toan | da_dong"
    }
    chi_tiet_don_mon {
        int id PK
        int don_goi_mon_id FK
        int mon_an_id FK
        int so_luong "CHECK > 0"
        int don_gia "CHECK > 0"
        string trang_thai_mon "cho_duyet | dang_nau | hoan_thanh | da_phuc_vu | huy_mon"
        boolean la_uu_tien
    }
    hoa_don {
        int id PK
        int phien_ban_id FK
        string ma_hoa_don "UNIQUE"
        int hoa_don_cha_id FK "Split Bill"
        int tong_tien_thanh_toan
        string phuong_thuc_thanh_toan "tien_mat | vietqr"
        string trang_thai "cho_thanh_toan | da_thanh_toan"
    }
    chia_tien_nhom {
        int id PK
        int hoa_don_id FK "UNIQUE"
        int so_nguoi_chia "CHECK >= 2"
        int so_tien_moi_nguoi "CHECK > 0"
        string ma_vietqr_dong
        string trang_thai "dang_thu | hoan_tat"
    }
    nhat_ky_kiem_toan {
        int id PK
        int tai_khoan_id FK
        string hanh_dong
        string bang_tac_dong
        string ly_do
        datetime ngay_tao
    }
```

---

## 3. SƠ ĐỒ PHÂN VÙNG KIẾN TRÚC CSDL VẬT LÝ (DATABASE DIAGRAM)

Sơ đồ Database Diagram phân rã 22 bảng thành **5 cụm phân hệ chức năng độc lập**, thể hiện rõ luồng dữ liệu nghiệp vụ và các liên kết khóa ngoại:

* **File ảnh Vector SVG:** [taiLieu/databaseDiagram.svg](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/databaseDiagram.svg)
* **File ảnh độ phân giải cao PNG:** [taiLieu/databaseDiagram.png](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/databaseDiagram.png)
* **Mã nguồn Mermaid:** [taiLieu/databaseDiagram.mmd](file:///d:/PHAT%20TRIEN%20WEB/quan%20ly%20nha%20hang/taiLieu/databaseDiagram.mmd)

```mermaid
graph TB
    subgraph CLUSTER1["🔐 1. QUẢN TRỊ, NHÂN SỰ & CA KÍP"]
        vai_tro["<b>vai_tro</b><br/>id (PK)<br/>ma_vai_tro, ten_vai_tro"]
        tai_khoan["<b>tai_khoan</b><br/>id (PK)<br/>ten_dang_nhap, mat_khau_hash<br/>vai_tro_id (FK), trang_thai"]
        nhan_vien["<b>nhan_vien</b><br/>id (PK)<br/>tai_khoan_id (FK), ho_ten<br/>so_dien_thoai, muc_luong"]
        ca_lam_viec["<b>ca_lam_viec</b><br/>id (PK)<br/>nhan_vien_id (FK), ngay_lam, ten_ca"]
        yeu_cau_doi_ca["<b>yeu_cau_doi_ca</b><br/>id (PK)<br/>nhan_vien_yeu_cau_id (FK), ca_lam_viec_id (FK)"]
        cau_hinh_nha_hang["<b>cau_hinh_nha_hang</b><br/>id=1 (PK)<br/>ten_nha_hang, phan_tram_vat, STK VietQR"]
        nhat_ky_kiem_toan["<b>nhat_ky_kiem_toan</b><br/>id (PK)<br/>tai_khoan_id (FK), hanh_dong, bang_tac_dong"]
    end

    subgraph CLUSTER2["🪑 2. BÀN ĂN & PHÂN CÔNG"]
        khu_vuc["<b>khu_vuc</b><br/>id (PK)<br/>ma_khu_vuc, ten_khu_vuc"]
        ban_an["<b>ban_an</b><br/>id (PK)<br/>khu_vuc_id (FK), ma_ban, ma_qr_token"]
        phan_cong_ban["<b>phan_cong_ban</b><br/>id (PK)<br/>nhan_vien_id (FK), ban_an_id (FK)"]
    end

    subgraph CLUSTER3["🍲 3. THỰC ĐƠN & COMBO"]
        danh_muc_mon["<b>danh_muc_mon</b><br/>id (PK)<br/>ma_danh_muc, ten_danh_muc"]
        mon_an["<b>mon_an</b><br/>id (PK)<br/>danh_muc_id (FK), ma_mon, don_gia (>0)"]
        combo_chi_tiet["<b>combo_chi_tiet</b><br/>id (PK)<br/>combo_id (FK), mon_an_le_id (FK)"]
    end

    subgraph CLUSTER4["📱 4. PHIÊN BÀN & GỌI MÓN (KDS)"]
        phien_ban["<b>phien_ban</b><br/>id (PK)<br/>ban_an_id (FK), ma_phien, trang_thai"]
        don_goi_mon["<b>don_goi_mon</b><br/>id (PK)<br/>phien_ban_id (FK), ma_don, dot_goi"]
        chi_tiet_don_mon["<b>chi_tiet_don_mon</b><br/>id (PK)<br/>don_goi_mon_id (FK), mon_an_id (FK), trang_thai_mon"]
        yeu_cau_huy_mon["<b>yeu_cau_huy_mon</b><br/>id (PK)<br/>chi_tiet_don_mon_id (FK), ly_do_huy"]
        yeu_cau_ho_tro["<b>yeu_cau_ho_tro</b><br/>id (PK)<br/>phien_ban_id (FK), loai_yeu_cau"]
        danh_gia["<b>danh_gia</b><br/>id (PK)<br/>phien_ban_id (FK), so_sao_mon_an"]
    end

    subgraph CLUSTER5["💳 5. THU NGÂN & CHIA TIỀN"]
        hoa_don["<b>hoa_don</b><br/>id (PK)<br/>phien_ban_id (FK), hoa_don_cha_id (FK), tong_tien"]
        chi_tiet_hoa_don["<b>chi_tiet_hoa_don</b><br/>id (PK)<br/>hoa_don_id (FK), mon_an_id (FK), thanh_tien"]
        chia_tien_nhom["<b>chia_tien_nhom</b><br/>id (PK)<br/>hoa_don_id (FK), so_tien_moi_nguoi, ma_vietqr"]
    end

    %% LIÊN KẾT GIỮA CÁC CỤM PHÂN HỆ
    vai_tro -->|1:N| tai_khoan
    tai_khoan -->|1:1| nhan_vien
    nhan_vien -->|1:N| ca_lam_viec
    nhan_vien -->|1:N| yeu_cau_doi_ca
    ca_lam_viec -->|1:N| yeu_cau_doi_ca
    tai_khoan -->|1:N| nhat_ky_kiem_toan

    nhan_vien -->|1:N| phan_cong_ban
    khu_vuc -->|1:N| ban_an
    ban_an -->|1:N| phan_cong_ban

    ban_an -->|1:N| phien_ban
    phien_ban -->|1:N| don_goi_mon
    phien_ban -->|1:N| yeu_cau_ho_tro
    phien_ban -->|1:1| danh_gia

    danh_muc_mon -->|1:N| mon_an
    mon_an -->|1:N| combo_chi_tiet

    don_goi_mon -->|1:N| chi_tiet_don_mon
    mon_an -->|1:N| chi_tiet_don_mon
    chi_tiet_don_mon -->|1:1| yeu_cau_huy_mon

    phien_ban -->|1:N| hoa_don
    hoa_don -->|Tách bill 1:N| hoa_don
    hoa_don -->|1:N| chi_tiet_hoa_don
    mon_an -->|1:N| chi_tiet_hoa_don
    hoa_don -->|1:1| chia_tien_nhom

    nhan_vien -.->|Duyệt order| don_goi_mon
    nhan_vien -.->|Duyệt hủy| yeu_cau_huy_mon
    nhan_vien -.->|Thu tiền| hoa_don
```
