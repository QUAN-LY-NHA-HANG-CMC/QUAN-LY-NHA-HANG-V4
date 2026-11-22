# Kịch bản kiểm thử thiết bị tham gia phiên bàn

Tài liệu xác định kết quả mong đợi cho giao diện, API và dữ liệu. **Đã hoàn thành 20/20 ca trong phạm vi tham gia bàn ngày 22/11/2026.** TC-21 thuộc chức năng tách bill P1.4.

## Điều kiện và dữ liệu thử

- Dùng DB thử. Tạo bàn B08 và B09 với QR riêng. B08 chạy lần lượt ở chế độ duyệt thủ công và tự động. Dùng tài khoản phục vụ đã vào ca, bếp và thu ngân để kiểm tra luồng nghiệp vụ.
- Dùng ba hồ sơ trình duyệt độc lập. **A** là thiết bị đầu tiên đã có quyền quản lý khách tham gia B08, **B** là thiết bị thứ hai và **C** là thiết bị thứ ba. Hai tab trong cùng hồ sơ mô phỏng một thiết bị tải lại hoặc mở thêm tab.
- Dùng một món có đủ số suất và một món có số suất giới hạn. Đặt tên hoặc ghi chú khác nhau để nhận ra phần món của từng thiết bị khi hai người chọn cùng một món.
- Dùng đồng hồ điều khiển được trong kiểm thử API. Mã có hiệu lực trong khoảng từ lúc A bấm **Thêm vào** đến ngay trước mốc 40 giây. Kiểm tra 39,999 giây và đúng 40 giây trên hai yêu cầu riêng.
- Nhân viên mở bàn và đối chiếu mã thiết bị trên máy của khách đang ngồi trước khi xác nhận **thiết bị đầu tiên**. Mã mời có sáu chữ số, dùng một lần. Sau năm lần nhập sai, thiết bị hết lượt nhập mã trong phiên.

## 1. Quét QR và duyệt thiết bị

| Mã | Thao tác | Kết quả mong đợi |
|---|---|---|
| TC-01 | Dùng ảnh QR đã lưu của B08 để quét trước khách đang ngồi, ở phiên chưa có thiết bị quản lý. | QR cố định chỉ cho phép gửi yêu cầu sau khi nhân viên đã mở bàn. Nhân viên chọn yêu cầu có mã khớp với thiết bị của khách đang ngồi tại bàn. |
| TC-02 | A đang xem thực đơn. B quét QR B08 một lần. | B tự gửi một yêu cầu và thấy **Đang chờ xác nhận**. A nhận thông báo nổi có **Thêm vào** và **Từ chối**. A vẫn giữ trang đang mở. |
| TC-03 | B tải lại trang hoặc mở thêm tab cùng hồ sơ trong lúc chờ. A tải lại trang hoặc mất kết nối rồi kết nối lại. | B vẫn theo dõi cùng một yêu cầu. A nhìn lại được yêu cầu còn chờ. Mỗi thiết bị chỉ tạo một yêu cầu đang hoạt động cho đúng phiên. |
| TC-04 | A bấm **Từ chối** yêu cầu của B. | B thấy yêu cầu bị từ chối. Không sinh mã, không cấp quyền. B có thể chủ động gửi yêu cầu lại theo luồng được cung cấp. |
| TC-05 | A bấm **Thêm vào** yêu cầu của B. | A thấy mã dùng một lần và thời gian còn lại. B tự thấy ô nhập mã. Phản hồi gửi tới B và C không chứa giá trị mã. Thời hạn tính từ lúc chấp thuận, kể cả khi B nhận thông báo trễ. |
| TC-06 | B nhập đúng mã ở 39,999 giây. Dùng yêu cầu mới để thử mã ở đúng 40 giây. | Lần thứ nhất cấp quyền cho B. Lần thứ hai bị từ chối vì hết hạn, B chưa có quyền. Thử lại cần một lần chấp thuận mới. |
| TC-07 | B nhập sai, sau đó gửi liên tiếp nhiều mã sai. | Không cấp quyền. Hệ thống giới hạn thử sai theo ngưỡng đã cấu hình. Gửi lại yêu cầu hoặc tải lại trang không được đặt lại giới hạn theo cách cho phép thử mã liên tục. |
| TC-08 | C dùng mã dành cho B. Sau đó B nhập đúng, rồi gửi lại chính mã đó từ một lần xác thực khác. | C không dùng được mã của B. Mã chỉ cấp quyền một lần. Thử lại không tạo thêm quyền hoặc chuyển quyền sang thiết bị khác. |
| TC-09 | B và C quét gần như đồng thời. A bấm **Thêm vào** cho B hai lần nhanh rồi chấp thuận C. | A phân biệt được hai yêu cầu. Mỗi yêu cầu chỉ có một mã còn hiệu lực. Chấp thuận lại cùng yêu cầu không kéo dài thời hạn hoặc tạo thêm mã. Mã của B và C không thay thế lẫn nhau. |

## 2. Giỏ chung, gửi đơn và quyền hạn

| Mã | Thao tác | Kết quả mong đợi |
|---|---|---|
| TC-10 | Khi B còn chờ hoặc bị từ chối, gọi trực tiếp API giỏ, gửi đơn, theo dõi món, hỗ trợ và tạm tính bằng QR bàn. | Backend từ chối các thao tác cần quyền phiên. Không tạo hoặc sửa giỏ, đơn, yêu cầu hỗ trợ hay số suất. |
| TC-11 | Sau khi B được cấp quyền, A thêm hai phần một món. B thêm cùng món với ghi chú khác, sửa số lượng và xóa phần của B. | Hai thiết bị nhìn thấy giỏ chung. Phần món của mỗi thiết bị vẫn tách được theo người thêm. B sửa và xóa được phần của mình. Phần của A giữ nguyên số lượng và ghi chú. |
| TC-12 | B cố sửa, xóa hoặc gửi phần của A bằng cách gọi API trực tiếp hoặc thay dữ liệu yêu cầu. | Backend kiểm tra chủ sở hữu phần món và từ chối. Dữ liệu giỏ của A và tồn món không đổi. |
| TC-13 | A và B đồng thời thêm hoặc sửa món có số suất giới hạn. | Tổng số lượng được chấp nhận không vượt số suất còn phục vụ. Xung đột cập nhật không làm mất phần món của thiết bị kia. Thiết bị bị từ chối có thể tải lại giỏ và thử lại. |
| TC-14 | A và B đều có món trong giỏ. B gửi đơn hợp lệ. | Chỉ phần của B được đưa vào đơn và bỏ khỏi giỏ. Phần của A vẫn còn. Cả hai thấy tiến độ đơn bàn. Với bàn duyệt thủ công, bếp chưa nhận đơn cho tới khi nhân viên duyệt. Ở chế độ tự động, đơn đi theo cấu hình hiện hành. |
| TC-15 | B gửi lại cùng yêu cầu sau khi mạng chập chờn hoặc nhấn gửi hai lần. | Chỉ có một đơn và số suất chỉ thay đổi một lần. Phần giỏ của A vẫn giữ nguyên. |
| TC-16 | B gọi phục vụ, yêu cầu tính tiền và xem tạm tính. Sau đó B thử duyệt C, sửa hóa đơn, xác nhận đã thu tiền hoặc đóng phiên. | Các thao tác hỗ trợ và đọc tạm tính hợp lệ hoạt động. Backend từ chối thao tác quản lý thiết bị và thao tác tài chính dành cho nhân viên. |
| TC-17 | B tải lại sau khi đã tham gia. Mở hồ sơ mới hoặc dùng quyền của B08 khi gọi API B09. | Quyền của B còn hiệu lực khi tải lại trong cùng hồ sơ và phiên. Hồ sơ mới phải tham gia riêng. Quyền của B08 không áp dụng cho B09. |

## 3. Đóng phiên và hồi quy

| Mã | Thao tác | Kết quả mong đợi |
|---|---|---|
| TC-18 | Thu ngân chốt B08 trong khi A và B đang thao tác, C đang chờ hoặc có mã còn hạn. | Quyền thao tác của A và B hết hiệu lực khi phiên đóng. Yêu cầu và mã của C không cấp được quyền sau khi đóng. API chặn sửa giỏ, gửi đơn và gửi hỗ trợ vào phiên cũ. |
| TC-19 | Sau khi dọn bàn, mở phiên mới tại B08 và thử dùng lại quyền, yêu cầu hoặc mã của phiên trước. | Phiên mới độc lập. Giỏ và yêu cầu cũ không xuất hiện. Thiết bị xác thực lại theo chính sách của phiên mới. |
| TC-20 | Chạy luồng phục vụ đặt hộ, duyệt đơn, bếp chế biến, thu ngân chốt, khách xem kết quả thanh toán. | Luồng nhân viên dùng quyền hiện hành. Giao diện khách đã nhận hóa đơn vẫn xem được kết quả đúng hóa đơn theo cơ chế bill token hiện hành. Thiết bị chưa được cấp quyền không được truy cập dữ liệu của phiên. |
| TC-21 | Khi tính năng tách bill được triển khai, B chọn món và số lượng muốn trả rồi gửi yêu cầu. | B tạo được yêu cầu tách bill của mình. Chỉ thu ngân xác nhận nghiệp vụ thu tiền. Ca này phụ thuộc P1.4 và nằm ngoài phạm vi nghiệm thu luồng tham gia bàn. |

## Cách chạy và ghi nhận

1. Chạy các ca API với DB tạm để kiểm tra thời hạn 40 giây, mã dùng một lần, giới hạn thử sai và phân quyền, kể cả khi bỏ qua giao diện.
2. Chạy ba hồ sơ trình duyệt để kiểm tra thông báo tự xuất hiện trên A, B chuyển màn hình sau khi được duyệt, khả năng tải lại và cập nhật giỏ chung.
3. Chạy hồi quy từ quét bàn đến khi thu ngân đóng phiên. Đối chiếu ID phiên, chủ sở hữu phần giỏ, số đơn, số suất và số giao dịch trước và sau mỗi bước.
4. Ghi mã ca, ngày chạy, kết quả, bước lỗi và bằng chứng.

## Kết quả nghiệm thu

- [x] **TC-01–TC-05** · API và Chrome. Nhân viên xác nhận thiết bị đầu tiên, thiết bị tiếp theo tự gửi yêu cầu, tải lại giữ yêu cầu, thông báo và kết quả duyệt/từ chối hiện đúng thiết bị.
- [x] **TC-06–TC-10** · API và SQLite. Kiểm tra mốc hết hạn 40 giây, năm lần nhập sai, mã gắn với yêu cầu, chấp thuận lặp và chặn thao tác khi chưa vào bàn.
- [x] **TC-11–TC-15** · API, SQLite và thao tác giỏ trên Chrome. Phân quyền theo dòng món, kiểm tra tồn suất đồng thời, gửi đúng phần và chống gửi trùng.
- [x] **TC-16–TC-20** · API, SQLite và luồng thanh toán trên Chrome. Kiểm tra hỗ trợ, quyền giữa các bàn và các phiên, thu hồi quyền khi đóng phiên, giữ quyền đọc biên nhận cho thiết bị đã nhận hóa đơn và hồi quy luồng nhân viên.
- [ ] **TC-21** · Chờ chức năng tách bill P1.4.

Chạy lại bằng `npm test`. Nhóm 14 nằm trong [bộ kiểm thử backend](../../backend/kiemThuBackend.js) và dùng [kịch bản API tham gia bàn](../../backend/kiemThuThamGiaBan.js). Lần nghiệm thu trình duyệt dùng ba hồ sơ khách cùng các phiên phục vụ, bếp và POS trên DB tạm. Nút in được kiểm tra ở mức gọi trình duyệt.
