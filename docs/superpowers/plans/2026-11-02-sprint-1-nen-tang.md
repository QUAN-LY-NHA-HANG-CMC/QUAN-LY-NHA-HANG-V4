# Sprint 1: Nền tảng, Tài khoản, Phân quyền, Sơ đồ bàn và Thực đơn Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng nền tảng khung dự án, cơ sở dữ liệu nền tảng, hệ thống xác thực RBAC, quản lý khu vực bàn ăn kèm QR, quản lý danh mục thực đơn và giao diện quản trị theo đúng quy chuẩn dự án (US-001 đến US-044).

**Architecture:** Kiến trúc 3 tầng chuẩn theo quy định `QUY_TAC_LAM_DU_AN.txt`: Backend phân tách Controller -> Service -> Model -> Routes -> Validation, CSDL SQLite hiệu năng cao qua `node:sqlite` chuẩn giao thức SQL, Frontend SPA component-based hiện đại kết nối RESTful API và đồng bộ dữ liệu.

**Tech Stack:** Node.js (v24), Express, node:sqlite (hoặc PostgreSQL driver tương thích), jsonwebtoken, bcryptjs, cors, qrcode, Vanilla/Modern JS Frontend, Node test runner (`node:test`).

**Spec:** `c:\Users\Admin\Desktop\QUAN-LY-NHA-HANG\taiLieu\QUY_TAC_LAM_DU_AN.txt`, `c:\Users\Admin\Desktop\QUAN-LY-NHA-HANG\taiLieu\PHAN_CHIA _CONG_VIEC.txt`, `c:\Users\Admin\Desktop\QUAN-LY-NHA-HANG\taiLieu\product_backlog _ QUAN_LY_NHA_HANG.txt`

## Global Constraints

- Tên file, thư mục, hàm, biến viết bằng tiếng Việt không dấu theo chuẩn camelCase/PascalCase trong `QUY_TAC_LAM_DU_AN.txt`.
- Bảng và cột CSDL viết bằng tiếng Việt không dấu snake_case.
- Đường dẫn API dùng danh từ tiếng Việt không dấu ngăn cách bằng gạch nối: `/api/tai-khoan`, `/api/thuc-don`, `/api/ban-an`.
- Chuẩn định dạng phản hồi JSON: `{ ok: boolean, data: any, msg: string }`.
- Phân biệt rõ mã HTTP: 200, 201, 400, 401, 403, 404, 500.
- Không tự ý tạo file/thư mục dư thừa ngoài cấu trúc định hướng.

## Review Focus

1. Đăng nhập sai mật khẩu hoặc tài khoản bị khóa phải phản hồi mã 401/403 kèm thông điệp tiếng Việt thân thiện, không làm sập ứng dụng.
2. Mã QR sinh ra cho từng bàn phải chứa đường dẫn định danh duy nhất và token xác thực phiên bàn, không cho phép giả mạo bàn khác.
3. Thêm/sửa món ăn với giá <= 0 hoặc danh mục không tồn tại phải bị chặn ở tầng validation và database constraint CHECK.
4. Xóa món ăn đã từng phát sinh dữ liệu chỉ được phép xóa mềm (is_deleted = 1 / ẩn) để bảo toàn lịch sử dữ liệu.
5. Người dùng không có vai trò Quản lý (ví dụ: Phục vụ hoặc Bếp) khi gọi API quản trị phải bị Middleware chặn với mã 403 Forbidden.

---

### Task 1: Thiết lập cấu trúc dự án, cấu hình môi trường và package.json

**Files:**
- Create: `package.json`
- Create: `.env.example`
- Create: `.env`
- Create: `.gitignore`
- Create: `README.md`
- Create: `backend/cauHinh/cauHinhChung.js`
- Create: `backend/cauHinh/cauHinhBaoMat.js`
- Create: `backend/tienIch/dinhDangPhanHoi.js`
- Create: `backend/tienIch/ghiNhatKy.js`
- Test: `kiemThu/api/cauHinh.test.js`

**Interfaces:**
- Consumes: Environment variables (`CONG_BACKEND`, `JWT_SECRET`, etc.)
- Produces: `cauHinhChung`, `dinhDangPhanHoi.thanhCong(res, data, msg, status)`, `dinhDangPhanHoi.thatBai(res, msg, status, data)`, `ghiNhatKy.ghiThongTin(...)`

- [ ] **Step 1: Viết test kiểm tra cấu hình chung và tiện ích định dạng phản hồi**
- [ ] **Step 2: Chạy test xác nhận thất bại trước khi cài đặt**
- [ ] **Step 3: Cài đặt package.json, dependencies (express, jsonwebtoken, bcryptjs, cors, qrcode, dotenv, multer), các file cấu hình và tiện ích**
- [ ] **Step 4: Chạy test xác nhận passed**
- [ ] **Step 5: Commit Git Task 1**

---

### Task 2: Cơ sở dữ liệu nền tảng Sprint 1 (Schema, Seeds, Database Connection)

**Files:**
- Create: `database/taoBang.sql`
- Create: `database/chiMuc.sql`
- Create: `database/rangBuoc.sql`
- Create: `database/duLieuMau.sql`
- Create: `backend/cauHinh/ketNoiCoSoDuLieu.js`
- Test: `kiemThu/api/coSoDuLieu.test.js`

**Interfaces:**
- Consumes: `backend/cauHinh/cauHinhChung.js`
- Produces: `ketNoiCoSoDuLieu.chayTruyVan(sql, params)`, `ketNoiCoSoDuLieu.layMot(sql, params)`, `ketNoiCoSoDuLieu.layNhieu(sql, params)`, `ketNoiCoSoDuLieu.thucThi(sql, params)`, `ketNoiCoSoDuLieu.chayGiaoDich(callback)`

- [ ] **Step 1: Viết test kiểm tra kết nối DB, tạo bảng và truy vấn thử**
- [ ] **Step 2: Chạy test xác nhận thất bại**
- [ ] **Step 3: Viết mã SQL tạo các bảng Sprint 1 (tai_khoan, vai_tro, phan_quyen, nhan_vien, khu_vuc, ban_an, danh_muc_mon, mon_an, tuy_chon_mon, cau_hinh_nha_hang, nhat_ky_he_thong) và file kết nối DB hỗ trợ cả node:sqlite và SQL chuẩn**
- [ ] **Step 4: Chạy script nạp `duLieuMau.sql` (tài khoản Quản lý, Thu ngân, Bếp, Phục vụ mẫu, khu vực và món mẫu)**
- [ ] **Step 5: Chạy test xác nhận passed và commit Task 2**

---

### Task 3: Xác thực, Phân quyền RBAC & Quản lý Tài khoản (US-001 -> US-022)

**Files:**
- Create: `backend/tienIch/maHoaMatKhau.js`
- Create: `backend/middleware/xacThuc.js`
- Create: `backend/middleware/phanQuyen.js`
- Create: `backend/middleware/gioiHanYeuCau.js`
- Create: `backend/middleware/xuLyLoi.js`
- Create: `backend/modules/taiKhoan/taiKhoan.model.js`
- Create: `backend/modules/taiKhoan/taiKhoan.service.js`
- Create: `backend/modules/taiKhoan/taiKhoan.controller.js`
- Create: `backend/modules/taiKhoan/taiKhoan.routes.js`
- Create: `backend/modules/nhanVien/nhanVien.model.js`
- Create: `backend/modules/nhanVien/nhanVien.service.js`
- Create: `backend/modules/nhanVien/nhanVien.controller.js`
- Create: `backend/modules/nhanVien/nhanVien.routes.js`
- Create: `backend/modules/vaiTro/vaiTro.service.js`
- Create: `backend/modules/vaiTro/vaiTro.controller.js`
- Create: `backend/modules/vaiTro/vaiTro.routes.js`
- Test: `kiemThu/api/xacThuc.test.js`
- Test: `kiemThu/api/phanQuyen.test.js`

**Interfaces:**
- Consumes: `ketNoiCoSoDuLieu`, `dinhDangPhanHoi`
- Produces: API routes `/api/tai-khoan/*`, `/api/nhan-vien/*`, `/api/vai-tro/*`, middleware `xacThucNguoiDung`, `kiemTraQuyen(maQuyen)`

- [ ] **Step 1: Viết test cho luồng Đăng nhập, Đổi mật khẩu, Phân quyền và Chặn truy cập**
- [ ] **Step 2: Chạy test xác nhận thất bại**
- [ ] **Step 3: Triển khai Service, Controller, Model và Routes cho Tài khoản, Vai trò và Quản lý nhân viên**
- [ ] **Step 4: Chạy test xác nhận 100% passed**
- [ ] **Step 5: Commit Task 3**

---

### Task 4: Quản lý Khu vực, Bàn ăn và Tự động sinh mã QR (US-023 -> US-030)

**Files:**
- Create: `backend/tienIch/taoMaQr.js`
- Create: `backend/modules/khuVuc/khuVuc.model.js`
- Create: `backend/modules/khuVuc/khuVuc.service.js`
- Create: `backend/modules/khuVuc/khuVuc.controller.js`
- Create: `backend/modules/khuVuc/khuVuc.routes.js`
- Create: `backend/modules/banAn/banAn.model.js`
- Create: `backend/modules/banAn/banAn.service.js`
- Create: `backend/modules/banAn/banAn.controller.js`
- Create: `backend/modules/banAn/banAn.routes.js`
- Test: `kiemThu/api/banAnQr.test.js`

**Interfaces:**
- Consumes: `ketNoiCoSoDuLieu`, `xacThucNguoiDung`, `kiemTraQuyen`
- Produces: `/api/khu-vuc`, `/api/ban-an`, `/api/ban-an/:id/ma-qr`, `/api/ban-an/:id/lam-moi-qr`

- [ ] **Step 1: Viết test cho CRUD Khu vực, Bàn ăn, sinh mã QR base64/SVG và làm mới token bảo mật**
- [ ] **Step 2: Chạy test xác nhận thất bại**
- [ ] **Step 3: Triển khai Model, Service, Controller và tiện ích tạo QR Code theo đúng chuẩn URL định danh bàn**
- [ ] **Step 4: Chạy test xác nhận passed**
- [ ] **Step 5: Commit Task 4**

---

### Task 5: Quản lý Danh mục và Thực đơn món ăn (US-031 -> US-040)

**Files:**
- Create: `backend/modules/danhMucMon/danhMucMon.model.js`
- Create: `backend/modules/danhMucMon/danhMucMon.service.js`
- Create: `backend/modules/danhMucMon/danhMucMon.controller.js`
- Create: `backend/modules/danhMucMon/danhMucMon.routes.js`
- Create: `backend/modules/thucDon/thucDon.model.js`
- Create: `backend/modules/thucDon/thucDon.service.js`
- Create: `backend/modules/thucDon/thucDon.controller.js`
- Create: `backend/modules/thucDon/thucDon.routes.js`
- Test: `kiemThu/api/thucDon.test.js`

**Interfaces:**
- Consumes: `ketNoiCoSoDuLieu`, `dinhDangPhanHoi`, Multer (upload ảnh vào `tepTaiLen/`)
- Produces: `/api/danh-muc-mon`, `/api/thuc-don` (phân trang, lọc, toggle Đang bán/Tạm hết, xóa mềm)

- [ ] **Step 1: Viết test cho CRUD danh mục, CRUD món ăn, tùy chọn món, chuyển trạng thái và xóa mềm**
- [ ] **Step 2: Chạy test xác nhận thất bại**
- [ ] **Step 3: Triển khai logic nghiệp vụ danh mục, thực đơn và upload hình ảnh an toàn**
- [ ] **Step 4: Chạy test xác nhận passed**
- [ ] **Step 5: Commit Task 5**

---

### Task 6: Cấu hình Nhà hàng, Nhật ký hệ thống & Tích hợp Server Express (US-041 -> US-044)

**Files:**
- Create: `backend/modules/cauHinhNhaHang/cauHinhNhaHang.service.js`
- Create: `backend/modules/cauHinhNhaHang/cauHinhNhaHang.controller.js`
- Create: `backend/modules/cauHinhNhaHang/cauHinhNhaHang.routes.js`
- Create: `backend/ungDung.js`
- Create: `backend/mayChu.js`
- Test: `kiemThu/api/tongHopMayChu.test.js`

**Interfaces:**
- Consumes: Toàn bộ module backend
- Produces: Server Express lắng nghe tại `http://localhost:3001` và phục vụ cả static files frontend

- [ ] **Step 1: Viết test tích hợp toàn diện các endpoint backend trên server Express**
- [ ] **Step 2: Chạy test xác nhận thất bại**
- [ ] **Step 3: Hoàn thiện `ungDung.js` và `mayChu.js`, gắn các route `/api/*`, static middleware cho `tepTaiLen/` và `frontend/`**
- [ ] **Step 4: Chạy test xác nhận passed**
- [ ] **Step 5: Commit Task 6**

---

### Task 7: Xây dựng Giao diện Frontend Quản trị (Admin Core, Auth, Bàn/QR, Thực đơn)

**Files:**
- Create: `frontend/dungChung/api.js`
- Create: `frontend/dungChung/hangSo.js`
- Create: `frontend/dungChung/dinhDang.js`
- Create: `frontend/tepGiaoDien.css`
- Create: `frontend/index.html`
- Create: `frontend/ungDung.js`
- Create: `frontend/trang/dangNhap/dangNhap.js`
- Create: `frontend/trang/quanLyBanQr/quanLyBanQr.js`
- Create: `frontend/trang/quanLyThucDon/quanLyThucDon.js`
- Create: `frontend/trang/nhanVien/nhanVien.js`
- Create: `frontend/trang/quanTri/quanTri.js`

**Interfaces:**
- Consumes: RESTful API từ backend
- Produces: Giao diện quản trị Admin thân thiện, trực quan, hỗ trợ xem và in mã QR, quản lý thực đơn, nhân viên và cấu hình quán

- [ ] **Step 1: Tạo layout Admin responsive, sidebar phân quyền, theme nhà hàng chuẩn Quán Mộc**
- [ ] **Step 2: Xây dựng trang Đăng nhập và xác thực lưu trữ token**
- [ ] **Step 3: Xây dựng trang Quản lý Khu vực & Sơ đồ bàn ăn, modal in mã QR**
- [ ] **Step 4: Xây dựng trang Quản lý Danh mục & Thực đơn món ăn (tìm kiếm, lọc, form thêm/sửa, toggle còn/hết)**
- [ ] **Step 5: Xây dựng trang Quản lý Nhân sự & Cấu hình quán**
- [ ] **Step 6: Kiểm thử giao diện và tương tác API**
- [ ] **Step 7: Commit Task 7**

---

### Task 8: Kiểm thử hồi quy, tổng hợp tài liệu và hoàn tất Sprint 1

**Files:**
- Create: `taiLieu/baoCaoSprint/sprint01.md`
- Create: `taiLieu/dacTaApi.md`
- Test: `kiemThu/api/*.test.js`

- [ ] **Step 1: Chạy toàn bộ test suite của Backend**
- [ ] **Step 2: Kiểm tra đối chiếu với 44 User Story (US-001 đến US-044)**
- [ ] **Step 3: Viết tài liệu báo cáo nghiệm thu Sprint 1**
- [ ] **Step 4: Commit và hoàn tất Sprint 1**
