# ĐẶC TẢ HỢP ĐỒNG API TOÀN DIỆN (FULL API SPECIFICATION)
**Dự án:** Website Quản Lý Nhà Hàng & Gọi Món QR (Quán Mộc POS & E-Menu)  
**Phiên bản:** Hoàn thiện Sprint 1 - Sprint 4 (REST API & Real-time WebSockets)  
**Tác giả:** Đội ngũ Kỹ sư Phát triển Hệ thống Quán Mộc  

---

## 1. CHUẨN PHẢN HỒI HTTP & MÃ LỖI

### 1.1. Cấu trúc phản hồi thành công (HTTP 200 / 201)
```json
{
  "ok": true,
  "data": {},
  "msg": "Thông điệp phản hồi bằng tiếng Việt"
}
```

### 1.2. Cấu trúc phản hồi thất bại (HTTP 400 / 401 / 403 / 404 / 409 / 500)
```json
{
  "ok": false,
  "data": null,
  "msg": "Mô tả nguyên nhân lỗi bằng tiếng Việt"
}
```

### 1.3. Cơ chế xác thực API
* **API Nội bộ (Internal):** Yêu cầu truyền Header `Authorization: Bearer <jwt_token>`.
* **API Khách hàng (E-Menu QR):** Không cần JWT, xác thực qua `token` phiên bàn trên tham số truy vấn (`?token=...`) hoặc body.

---

## 2. PHÂN HỆ SPRINT 1: XÁC THỰC, NHÂN SỰ, BÀN ĂN & THỰC ĐƠN

### 2.1. API Xác thực & Tài khoản (`/api/tai-khoan`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| POST | `/api/tai-khoan/dang-nhap` | Public | Đăng nhập tài khoản, trả về JWT token và thông tin vai trò |
| GET | `/api/tai-khoan/ho-so` | Đăng nhập | Xem thông tin hồ sơ tài khoản hiện tại |
| PUT | `/api/tai-khoan/ho-so` | Đăng nhập | Cập nhật họ tên, số điện thoại, email |
| POST | `/api/tai-khoan/doi-mat-khau` | Đăng nhập | Đổi mật khẩu cá nhân |
| POST | `/api/tai-khoan/dang-xuat` | Đăng nhập | Đăng xuất và thu hồi phiên làm việc |

### 2.2. API Nhân sự & Phân quyền (`/api/nhan-vien`, `/api/vai-tro`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| GET | `/api/vai-tro` | `quan_ly` | Lấy danh sách vai trò (`quan_ly`, `thu_ngan`, `bep`, `phuc_vu`) |
| GET | `/api/vai-tro/quyen-han` | `quan_ly` | Lấy danh mục toàn bộ quyền hạn hệ thống |
| GET | `/api/nhan-vien` | `quan_ly` | Danh sách nhân sự (hỗ trợ tìm kiếm, lọc vai trò, phân trang) |
| POST | `/api/nhan-vien` | `quan_ly` | Tạo tài khoản nhân viên mới |
| PUT | `/api/nhan-vien/:id` | `quan_ly` | Sửa thông tin nhân viên và gán vai trò |
| PATCH | `/api/nhan-vien/:id/trang-thai` | `quan_ly` | Khóa hoặc kích hoạt lại tài khoản |
| POST | `/api/nhan-vien/:id/dat-lai-mat-khau`| `quan_ly` | Đặt lại mật khẩu về mặc định `123456` |

### 2.3. API Khu vực & Bàn ăn (`/api/khu-vuc`, `/api/ban-an`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| GET | `/api/khu-vuc` | Nội bộ | Lấy danh sách các khu vực / tầng phục vụ |
| POST | `/api/khu-vuc` | `quan_ly` | Tạo khu vực mới |
| PUT | `/api/khu-vuc/:id` | `quan_ly` | Chỉnh sửa tên, tầng, mô tả khu vực |
| DELETE | `/api/khu-vuc/:id` | `quan_ly` | Xóa khu vực (nếu không còn bàn ăn) |
| GET | `/api/ban-an` | Nội bộ | Lấy danh sách bàn ăn |
| GET | `/api/ban-an/so-do-chi-tiet` | Nội bộ | Lấy sơ đồ bàn kèm trạng thái món và thời gian ngồi |
| GET | `/api/ban-an/:id` | Nội bộ | Lấy chi tiết thông tin một bàn ăn |
| GET | `/api/ban-an/:id/ma-qr` | Nội bộ | Lấy chuỗi ảnh Base64 PNG của mã QR bàn ăn |
| POST | `/api/ban-an` | `quan_ly` | Tạo bàn ăn mới (tự động tạo `ma_qr_token`) |
| PUT | `/api/ban-an/:id` | `quan_ly` | Cập nhật thông tin bàn ăn (tên, mã, sức chứa) |
| POST | `/api/ban-an/:id/lam-moi-qr` | `quan_ly` | Tạo lại token QR mới để bảo mật |
| PATCH | `/api/ban-an/:id/trang-thai` | Nội bộ | Đổi trạng thái bàn (`trong`, `dang_dung`, `cho_thanh_toan`...) |
| DELETE | `/api/ban-an/:id` | `quan_ly` | Xóa mềm bàn ăn |

### 2.4. API Danh mục món & Thực đơn (`/api/danh-muc-mon`, `/api/thuc-don`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| GET | `/api/danh-muc-mon` | Public | Lấy danh mục món ăn (Khai vị, Món nướng, Lẩu...) |
| POST | `/api/danh-muc-mon` | `quan_ly` | Tạo danh mục mới |
| PUT | `/api/danh-muc-mon/:id` | `quan_ly` | Sửa danh mục |
| DELETE | `/api/danh-muc-mon/:id` | `quan_ly` | Xóa danh mục |
| GET | `/api/thuc-don` | Public | Lấy danh sách món ăn (có tìm kiếm, lọc danh mục) |
| GET | `/api/thuc-don/:id` | Public | Chi tiết món ăn và các tùy chọn (size, topping) |
| POST | `/api/thuc-don` | `quan_ly` | Thêm món ăn mới (upload ảnh qua multipart/form-data) |
| PUT | `/api/thuc-don/:id` | `quan_ly` | Cập nhật thông tin món ăn |
| PATCH | `/api/thuc-don/:id/trang-thai` | `bep`, `quan_ly` | Bật/tắt nhanh trạng thái "Đang bán" / "Tạm hết" |
| DELETE | `/api/thuc-don/:id` | `quan_ly` | Xóa mềm món ăn để bảo toàn lịch sử hóa đơn |

### 2.5. API Cấu hình nhà hàng & Nhật ký (`/api/cau-hinh-nha-hang`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| GET | `/api/cau-hinh-nha-hang` | Public | Lấy thông tin thương hiệu, hotline, wifi, thuế VAT |
| PUT | `/api/cau-hinh-nha-hang` | `quan_ly` | Cập nhật thông tin quán, thuế VAT, tài khoản VietQR |
| GET | `/api/cau-hinh-nha-hang/nhat-ky` | `quan_ly` | Xem lịch sử nhật ký hoạt động hệ thống (System logs) |

---

## 3. PHÂN HỆ SPRINT 2: PHIÊN BÀN, E-MENU QR, GIỎ HÀNG & ĐẶT MÓN

### 3.1. API Phiên bàn & Khách hàng E-Menu (`/api/phien-ban`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| POST | `/api/phien-ban/xac-thuc-qr` | Public | Xác thực token QR khi quét bàn, khởi tạo phiên nếu chưa có |
| POST | `/api/phien-ban/mo-ban` | Phục vụ/Quản lý | Mở bàn trực tiếp cho khách vãng lai |
| GET | `/api/phien-ban/:id` | Public | Xem thông tin trạng thái và tổng tiền tạm tính của phiên bàn |
| POST | `/api/phien-ban/dong-ban` | Thu ngân/Quản lý | Đóng phiên bàn sau khi hoàn tất thanh toán |

### 3.2. API Giỏ hàng tạm thời (`/api/gio-hang`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| GET | `/api/gio-hang/:phienBanId` | Public | Lấy dữ liệu giỏ hàng tạm thời đã lưu của phiên bàn |
| POST | `/api/gio-hang/:phienBanId` | Public | Lưu đồng bộ giỏ hàng tạm thời lên Server |
| DELETE| `/api/gio-hang/:phienBanId` | Public | Xóa sạch giỏ hàng tạm thời khi khách gửi đơn |

### 3.3. API Đơn gọi món & Bưng món (`/api/don-goi-mon`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| POST | `/api/don-goi-mon` | Public/Phục vụ | Gửi đơn gọi món thời gian thực với Database Transaction |
| GET | `/api/don-goi-mon/ban/:banId` | Nội bộ/Khách | Lấy toàn bộ danh sách các món ăn đã gọi theo bàn |
| PUT | `/api/don-goi-mon/da-phuc-vu/:chiTietId` | `phuc_vu`, `quan_ly` | Nhân viên phục vụ xác nhận đã bưng món lên bàn |
| DELETE| `/api/don-goi-mon/:chiTietId` | Nội bộ | Hủy món ăn trong đơn (nếu bếp chưa nấu) |
| GET | `/api/don-goi-mon/:id/lich-su` | Nội bộ | Xem lịch sử chuyển đổi trạng thái của đơn món |

### 3.4. API Yêu cầu hỗ trợ tại bàn (`/api/yeu-cau-ho-tro`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| POST | `/api/yeu-cau-ho-tro` | Public | Khách bấm "Gọi phục vụ" hoặc "Yêu cầu thanh toán" |
| GET | `/api/yeu-cau-ho-tro/danh-sach` | Nội bộ | Danh sách các yêu cầu đang chờ phục vụ xử lý |
| PUT | `/api/yeu-cau-ho-tro/:id/hoan-thanh`| `phuc_vu` | Nhân viên phục vụ xác nhận đã hỗ trợ xong |

---

## 4. PHÂN HỆ SPRINT 3: ĐIỀU PHỐI BẾP (KDS), HÓA ĐƠN, VOUCHER & VIETQR

### 4.1. API Điều phối Bếp KDS (`/api/kds`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| GET | `/api/kds/don-cho` | `bep`, `quan_ly` | Lấy hàng đợi món chờ nấu theo thứ tự FIFO kèm cảnh báo >15p |
| GET | `/api/kds/gom-mon` | `bep`, `quan_ly` | Gom nhóm món cùng loại giữa các bàn để nấu hàng loạt |
| PUT | `/api/kds/chuyen-trang-thai/:id` | `bep`, `quan_ly` | Chuyển trạng thái nấu món (`dang_che_bien`, `hoan_thanh`) |
| PUT | `/api/kds/toggle-het-mon/:id` | `bep`, `quan_ly` | Bật/tắt nhanh trạng thái tạm hết món ăn tức thì từ bếp |
| POST | `/api/kds/tu-choi/:id` | `bep`, `quan_ly` | Bếp từ chối món (hết nguyên liệu đột xuất) |
| GET | `/api/kds/lich-su` | `bep`, `quan_ly` | Xem lịch sử các món đã chế biến xong trong ca |

### 4.2. API Khuyến mãi & Voucher (`/api/khuyen-mai`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| GET | `/api/khuyen-mai` | Thu ngân/Quản lý | Lấy danh sách các chương trình khuyến mãi |
| POST | `/api/khuyen-mai/kiem-tra` | Thu ngân/Khách | Kiểm tra mã voucher hợp lệ và tính số tiền được giảm |
| POST | `/api/khuyen-mai` | `quan_ly` | Tạo mã voucher khuyến mãi mới |
| PUT | `/api/khuyen-mai/:id` | `quan_ly` | Cập nhật điều kiện voucher (đơn tối thiểu, giảm tối đa) |
| DELETE| `/api/khuyen-mai/:id` | `quan_ly` | Dừng chương trình khuyến mãi |

### 4.3. API Hóa đơn & Bảng kê tạm tính (`/api/hoa-don`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| GET | `/api/hoa-don/tam-tinh` | Thu ngân/Khách | Lấy bảng kê chi tiết tạm tính (Món, VAT, Giảm giá) |
| GET | `/api/hoa-don/:id` | Thu ngân/Quản lý | Lấy chi tiết hóa đơn thanh toán |
| GET | `/api/hoa-don/in-k80/:id` | Thu ngân/Quản lý | Xuất dữ liệu in hóa đơn chuẩn máy in nhiệt K80 |

### 4.4. API Thanh toán & Napas VietQR động (`/api/thanh-toan`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| POST | `/api/thanh-toan/vietqr` | Public/Thu ngân | Sinh mã QR VietQR Napas động chứa đúng số tiền và cú pháp |
| POST | `/api/thanh-toan/xac-nhan` | `thu_ngan`, `quan_ly`| Xác nhận thanh toán (tiền mặt / chuyển khoản), đóng bàn |

### 4.5. API Vận hành Chuyển bàn & Ghép bàn (`/api/phien-ban`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| POST | `/api/phien-ban/chuyen-ban` | Phục vụ/Quản lý | Chuyển toàn bộ món và hóa đơn sang bàn trống (Transaction) |
| POST | `/api/phien-ban/ghep-ban` | Phục vụ/Quản lý | Ghép 2 bàn đang phục vụ lại với nhau |
| GET | `/api/phien-ban/lich-su-chuyen-ghep`| Quản lý | Xem lịch sử các lần chuyển/ghép bàn trong ngày |

---

## 5. PHÂN HỆ SPRINT 4: CA LÀM VIỆC, ĐÁNH GIÁ, THỐNG KÊ & XUẤT CSV

### 5.1. API Đánh giá & Phản hồi thực khách (`/api/danh-gia`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| POST | `/api/danh-gia` | Public | Khách hàng gửi đánh giá sao (1-5 sao) và nhận xét dịch vụ |
| GET | `/api/danh-gia` | `quan_ly` | Danh sách phản hồi (hỗ trợ lọc đánh giá tiêu cực < 4 sao) |
| GET | `/api/danh-gia/diem-trung-binh`| Public | Lấy điểm đánh giá trung bình và tổng số lượt đánh giá |
| GET | `/api/danh-gia/mau-phan-hoi` | `quan_ly` | Lấy danh mục các mẫu trả lời chăm sóc khách hàng 1-click |
| PUT | `/api/danh-gia/:id/phan-hoi` | `quan_ly` | Quản lý gửi phản hồi / giải trình tới khách hàng |

### 5.2. API Quản lý Ca làm việc & Phiên thu ngân (`/api/ca-lam-viec`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| GET | `/api/ca-lam-viec` | Thu ngân/Quản lý | Lấy danh mục các ca làm việc chuẩn (Sáng, Chiều, Tối) |
| GET | `/api/ca-lam-viec/phien-hien-tai` | Thu ngân | Lấy thông tin phiên ca đang mở của thu ngân đăng nhập |
| POST | `/api/ca-lam-viec/mo-ca` | `thu_ngan`, `quan_ly`| Mở ca làm việc và khai báo số tiền mặt đầu ca |
| POST | `/api/ca-lam-viec/phieu-thu-chi` | `thu_ngan`, `quan_ly`| Lập phiếu thu tiền mặt hoặc chi tiền mặt phát sinh trong ca |
| GET | `/api/ca-lam-viec/phieu-thu-chi/:phienCaId` | Thu ngân/Quản lý| Lấy danh sách phiếu thu chi của phiên ca |
| POST | `/api/ca-lam-viec/ket-ca` | `thu_ngan`, `quan_ly`| Kết ca: kiểm đếm tiền thực tế, đối soát quỹ và tính chênh lệch |
| GET | `/api/ca-lam-viec/lich-su` | Thu ngân/Quản lý | Xem lịch sử các biên bản bàn giao ca làm việc |

### 5.3. API Thống kê & Dashboard Analytics (`/api/thong-ke`)
*Tất cả API thống kê yêu cầu quyền hạn `quan_ly`.*

| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| GET | `/api/thong-ke/tong-quan` | `quan_ly` | Thống kê doanh thu ngày, số hóa đơn, số khách và tăng trưởng |
| GET | `/api/thong-ke/doanh-thu` | `quan_ly` | Doanh thu theo chu kỳ (7 ngày, 8 tuần, 12 tháng, `tuNgay`-`denNgay`) |
| GET | `/api/thong-ke/phuong-thuc` | `quan_ly` | Tỷ trọng thanh toán Tiền mặt vs Chuyển khoản VietQR |
| GET | `/api/thong-ke/danh-muc` | `quan_ly` | Doanh thu đóng góp phân bổ theo danh mục món ăn |
| GET | `/api/thong-ke/top-mon` | `quan_ly` | Top 5 món ăn bán chạy nhất và doanh thu của từng món |
| GET | `/api/thong-ke/khung-gio` | `quan_ly` | Phân tích 24 khung giờ cao điểm đón khách trong ngày |
| GET | `/api/thong-ke/huy-mon` | `quan_ly` | Thống kê số lượng và tỷ lệ món ăn bị hủy |

### 5.4. API Xuất báo cáo dữ liệu ra CSV (`/api/xuat-bao-cao`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| GET | `/api/xuat-bao-cao/doanh-thu-csv` | `quan_ly` | Xuất bảng tổng hợp doanh thu ra file CSV UTF-8 BOM |
| GET | `/api/xuat-bao-cao/hoa-don-csv` | `quan_ly` | Xuất danh sách toàn bộ hóa đơn bán hàng ra file CSV UTF-8 BOM |

---

## 6. DANH MỤC SỰ KIỆN THỜI GIAN THỰC (WEBSOCKET EVENTS VIA SOCKET.IO)

Hệ thống phân chia theo các Room kết nối: `room:bep`, `room:thu_ngan`, `room:ban_{banId}`.

| Tên sự kiện (Event) | Nguồn phát | Kênh nhận | Dữ liệu mang theo | Mô tả nghiệp vụ |
|---|---|---|---|---|
| `don_mon_moi` | Client Khách/Phục vụ | `room:bep`, `room:thu_ngan` | `{ donMonId, banAnId, chiTiet }` | Báo chuông bếp có món mới |
| `cap_nhat_don_mon`| Bếp / Phục vụ | `room:ban_{banId}` | `{ chiTietId, trangThai }` | Cập nhật tiến độ món cho khách |
| `mon_san_sang` | Đầu bếp | `room:phuc_vu` | `{ chiTietId, banAnId, tenMon }` | Báo phục vụ ra bưng món lên bàn |
| `mon_da_phuc_vu` | Phục vụ | Toàn hệ thống | `{ chiTietId, banAnId }` | Cập nhật món đã lên bàn thành công |
| `yeu_cau_ho_tro` | Khách hàng | `room:phuc_vu`, `room:thu_ngan`| `{ banAnId, loaiYeuCau }` | Khách gọi phục vụ / thanh toán |
| `chuyen_ban` | Phục vụ / Quản lý | Toàn hệ thống | `{ banNguonId, banDichId }` | Tự động làm mới sơ đồ bàn POS |
| `thanh_toan_hoan_tat`| Thu ngân | `room:ban_{banId}` | `{ hoaDonId, banAnId }` | Thông báo thanh toán thành công, mở màn hình đánh giá |

---
*Tài liệu Đặc tả Hợp đồng API Toàn diện được cập nhật và kiểm thử tương thích 100% với toàn bộ hệ thống Quán Mộc POS.*
