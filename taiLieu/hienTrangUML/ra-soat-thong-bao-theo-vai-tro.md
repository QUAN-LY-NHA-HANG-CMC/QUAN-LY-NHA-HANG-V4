# Rà soát thông báo theo màn hình và vai trò

**Quán Mộc POS & E-Menu · 22/11/2026**

Rà soát theo mã nguồn giao diện, API và sự kiện Socket.IO của bản hiện tại. Danh mục dưới đây phân biệt khả năng đã có với phần cần xây dựng và các nghiệp vụ phụ thuộc tính năng khác. Âm thanh trên thiết bị vật lý cần được nghiệm thu riêng.

## 1. Hiện trạng

| Vai trò và thiết bị | Màn hình riêng | Chuông và cảnh báo nổi bật hiện có | Phần còn thiếu |
|---|---|---|---|
| Khách · điện thoại, trình duyệt QR | Có màn hình tham gia, theo dõi món và kết quả thanh toán. Biểu tượng chuông ở header chưa mở một trung tâm thống nhất. Trên trang Theo dõi món, nút này đang mở hỗ trợ. | Thiết bị đầu tiên thấy thẻ nổi yêu cầu tham gia. Thiết bị mới thấy trạng thái chờ và nhập mã. Kết quả hủy, thanh toán hiển thị theo màn hình. | Lịch sử thông báo theo phiên và theo thiết bị, chuông âm thanh, cảnh báo đơn bị từ chối hoặc món liên quan bị hết. |
| Phục vụ · điện thoại hoặc máy tính bảng | Có modal Trung tâm thông báo trên sơ đồ bàn, danh sách công việc tại Chi tiết bàn và mục thông báo ca trong Ca làm việc. | Có toast đơn mới, hỗ trợ, món chờ bưng và bàn cần dọn. Chỉ đạo quản lý có hộp nổi yêu cầu xác nhận. Yêu cầu hủy của khách có nhãn trên bàn và nội dung trong Chi tiết bàn. Lý do quản lý từ chối nằm dưới món. | Màn hình riêng mở từ mọi trang, chuông âm thanh, lịch sử và thông báo trực tiếp cho thiết bị của người phụ trách khi khách cần hủy hoặc quản lý quyết định. |
| Bếp nóng / Bar · màn hình cảm ứng KDS | Có Phiếu theo bàn, Gom món, Đã làm xong và Trạng thái món. Chưa có tab thông báo riêng. | Có chuông cho đơn đã duyệt khi bật âm thanh. Mặc định chuông tắt. Phiếu có màu cảnh báo thời gian chờ. Đề nghị giục món và chỉ đạo khẩn có hộp nổi. | Hàng chờ thông báo theo trạm, chuông riêng cho việc cần xử lý, lọc chuông theo đúng trạm và lịch sử tiếp nhận. |
| Thu ngân · máy POS | Có mục Bàn chờ thanh toán trên sidebar và trang Lịch sử hóa đơn. Mục Bàn chờ thanh toán hiện vẫn dùng vùng sơ đồ/kiểm bill. | Có toast khi khách yêu cầu tính tiền, chỉ đạo nổi cần xác nhận và cảnh báo khóa thu tiền trên bill. | Xây danh sách Bàn chờ thanh toán theo dữ liệu thật. Sidebar hiện có số mặc định là 2. Bổ sung chuông, xác nhận tiếp nhận và theo dõi lý do chặn thu. |
| Quản lý · máy tính hoặc máy tính bảng | Có Duyệt hủy món, Duyệt nghỉ/đổi ca, Điều phối khẩn, Phản hồi khách, Báo cáo và Nhật ký. | Có huy hiệu số yêu cầu hủy chờ duyệt, trạng thái duyệt và tiếp nhận chỉ đạo theo bộ phận. | Trung tâm gom các việc cần quyết định, chuông và banner ưu tiên, chuyển thẳng tới phiếu hoặc lệnh. |

**Điểm cần lưu ý khi đối chiếu mã nguồn**

- Chuông hình ảnh và chuông âm thanh là hai khả năng riêng. Âm thanh được xác nhận có mã thực thi ở KDS cho đơn đã duyệt. Toast chung chỉ hiển thị bằng giao diện. [Toast](../../frontend/src/thanhPhan/ThongBaoToast.jsx) · [KDS](../../frontend/src/trang/dieuPhoiBep/TrangKdsBep.jsx)
- Luồng khách thứ hai tự gửi yêu cầu và hiển thị thẻ nổi trên máy đầu tiên lấy trạng thái định kỳ. Mã mời chỉ xuất hiện trên máy đầu tiên và hết hạn sau 40 giây. [Xử lý tham gia bàn](../../frontend/src/trang/thucDonQr/thamGiaBan.js) · [Màn hình tham gia](../../frontend/src/trang/thucDonQr/TrangThamGiaBan.jsx)
- Báo cáo đang nghe `hoa_don:da_thanh_toan`, `don_goi_mon:da_thanh_toan` và `danh_gia:moi`. Luồng thanh toán phát `thanh_toan_thanh_cong`. Chưa thấy luồng gửi đánh giá phát `danh_gia:moi` trong backend hiện tại. Cần đối chiếu lại nếu dùng các sự kiện này cho thông báo và làm mới báo cáo. [Báo cáo](../../frontend/src/trang/baoCaoDoanhThu/TrangBaoCaoDoanhThu.jsx) · [Socket](../../backend/cauHinh/cauHinhSocket.js) · [API hóa đơn và đánh giá](../../backend/modules/hoaDon/hoaDon.routes.js)

## 2. Quy cách hiển thị áp dụng cho cả năm vai trò

Mỗi vai trò có một màn hình **Thông báo** riêng. Icon chuông và số chưa đọc mở được màn hình này từ mọi trang sau khi vào đúng vai trò hoặc xác thực phiên QR. Màn hình có nhóm **Cần xử lý**, **Chưa đọc** và **Lịch sử**. Một thông báo dẫn đến đúng bàn, dòng món, hóa đơn, ca hoặc lệnh có liên quan. Trạng thái **đã đọc** tách với **đã xử lý**.

| Mức | Trình bày và âm thanh |
|---|---|
| **Khẩn** | Banner hoặc hộp nổi có tiêu đề, chi tiết và nút xử lý. Chuông khẩn phát một lần khi nhận. Với lệnh bắt buộc, banner giữ đến khi tiếp nhận. |
| **Cần xử lý** | Banner, huy hiệu chưa đọc và một chuông ngắn khi nhận. Mục còn trong hàng chờ khi banner đã đóng. |
| **Cập nhật** | Hiện trong trung tâm, ở dòng dữ liệu liên quan hoặc toast nhẹ. Có thể bật chuông ngắn theo thiết bị. |
| **Tại chỗ** | Kết quả thao tác do chính người dùng vừa bấm, lỗi form, chọn bộ lọc, in hoặc tải file. Hiện ngay tại màn hình. Hạn chế tạo thêm mục trung tâm để tránh báo trùng. |

Trên thiết bị dùng trình duyệt, nút **Bật âm thanh** mở quyền phát âm thanh sau thao tác của người dùng. Khi tắt âm thanh hoặc trình duyệt chưa cho phép phát, banner và huy hiệu vẫn hoạt động. Khi tải lại hoặc nối lại mạng, cập nhật các việc còn mở và bỏ trùng theo cùng sự kiện. Nghiệm thu khi ứng dụng đang mở. Báo hệ điều hành lúc đã đóng ứng dụng là hạng mục riêng.

## 3. Danh mục và màn hình theo vai trò

**Hiện trạng** mô tả tính năng hiện có trong mã nguồn. **Mức** là mức đề xuất cho bản thông báo cần xây dựng.

### Khách hàng · điện thoại và trình duyệt bàn

| Thông báo | Mức | Màn hình đích | Hiện trạng |
|---|---|---|---|
| Thiết bị khác xin vào bàn | Cần xử lý | Thông báo → Tham gia bàn | Có thẻ nổi trên thiết bị đầu tiên. Cần chuông và mục đang chờ chỉ dành cho máy có quyền duyệt. |
| Được duyệt nhập mã, bị từ chối hoặc hết hạn | Cần xử lý | Tham gia bàn | Có màn hình trạng thái. Cần nhắc khi người dùng đang ở trang liên quan. Giá trị mã chỉ hiện trên thiết bị đầu tiên, không lưu trong nội dung thông báo. |
| Gửi đơn thành công hoặc giỏ đã đổi, món thiếu suất khi gửi | Tại chỗ | Giỏ chung → Theo dõi món | Có chuyển trang và phản hồi lỗi. Cần làm rõ món và thao tác thử lại. |
| Đơn đã duyệt / đơn bị từ chối kèm lý do | Cập nhật / Cần xử lý | Theo dõi món → Chi tiết đơn | Có cập nhật đơn. Cần thẻ nêu rõ đơn, lý do và cách chọn lại món nếu có. |
| Món trong giỏ hoặc đơn của bàn hết suất / hết món | Cần xử lý | Thực đơn, Giỏ chung hoặc Theo dõi món | Có trạng thái menu. Cần cảnh báo nổi nhắm đúng phiên bị ảnh hưởng, thay vì báo mọi thay đổi tồn suất. |
| Món chuyển bếp, đang nấu, chờ bưng, đã phục vụ | Cập nhật | Theo dõi món | Có trạng thái. Chuông chỉ nên bật khi khách chọn nhận cập nhật tiến độ. |
| Đã nhờ phục vụ, phục vụ xác nhận đã xử lý | Tại chỗ / Cập nhật | Hỗ trợ → Yêu cầu tại bàn | Có phản hồi gửi. Kết quả xử lý cần hiển thị lại cho đúng phiên và yêu cầu. |
| Yêu cầu hủy đang chờ phục vụ / quản lý, đã hủy hoặc bị từ chối | Cập nhật / Cần xử lý | Theo dõi món → Dòng món | Có trạng thái trực tiếp. Cần lưu thông báo kết quả cho thiết bị đã đặt. Lý do nội bộ của quản lý dành cho nhân viên. |
| Hóa đơn đã sẵn sàng, hóa đơn thay đổi, bill đang bị chặn | Cần xử lý | Yêu cầu tính tiền → Hóa đơn / VietQR | Có cập nhật theo API và banner tại màn hình. Cần thông báo nổi cho đúng thiết bị có quyền đọc bill. |
| Đã thu tiền, xem biên nhận và đánh giá | Cập nhật | Thanh toán thành công → Đánh giá | Có trang kết quả. Cần mục lịch sử biên nhận cho thiết bị được cấp quyền và xác nhận gửi đánh giá tại chỗ. |
| Phiên bàn đóng, phiên thay đổi hoặc thiết bị mất quyền | Cần xử lý | Tham gia bàn / Kết quả thanh toán | Có thay đổi trạng thái quyền. Cần hướng dẫn rõ khi tiếp tục thao tác trên QR hoặc phiên cũ. |

### Phục vụ · điện thoại và máy tính bảng

| Thông báo | Mức | Màn hình đích | Hiện trạng |
|---|---|---|---|
| Đơn QR mới cần duyệt, khách gọi thêm | Cần xử lý | Sơ đồ bàn → Trung tâm thông báo → Duyệt đơn | Có hàng chờ và toast. Cần chuông, mức ưu tiên và chỉ định đúng người phụ trách. |
| Khách gọi hỗ trợ, gọi thêm đồ hoặc nhờ xác minh hủy | Cần xử lý | Trung tâm thông báo → Chi tiết bàn | Có toast và việc bàn. Cần chuông, tiếp nhận và đóng việc. |
| Thiết bị đầu tiên đang chờ nhân viên xác nhận | Cần xử lý | Chi tiết bàn → Xác nhận thiết bị | Có đọc danh sách tại chi tiết bàn. Cần thông báo cho phục vụ phụ trách. |
| Món đã nấu xong cần bưng | Cần xử lý | Trung tâm thông báo → Chi tiết bàn → Xác nhận bưng | Có toast và hàng chờ. Cần chuông và gom món cùng bàn. |
| Bếp báo hết món đang ảnh hưởng bàn, đề nghị phương án thay thế | Cần xử lý | Chi tiết bàn → Dòng món | Có trạng thái tồn. Cần việc xử lý cho bàn có món liên quan. |
| Khách gửi yêu cầu hủy từng món | Cần xử lý | Chi tiết bàn → Khách yêu cầu hủy món | Có huy hiệu và danh sách tại bàn. Cần chuông và mục tương ứng trong trung tâm. |
| Quản lý chấp thuận/từ chối hủy kèm lý do | Cần xử lý | Chi tiết bàn → Dòng món | Có cập nhật tại dòng món. Cần đưa tới thiết bị của nhân viên xử lý; lý do từ chối phải hiện rõ. |
| Bếp phản hồi đề nghị giục món | Cập nhật | Chi tiết bàn → Phản hồi bếp | Có sự kiện và banner tại bàn. Cần lưu kết quả trong trung tâm. |
| Chỉ đạo khẩn từ quản lý | Khẩn | Thông báo → Chỉ đạo / Chi tiết bàn | Có hộp nổi và xác nhận tiếp nhận. Cần chuông khẩn và lịch sử nhận. |
| Khách yêu cầu tính tiền cần phối hợp tại bàn | Cần xử lý | Sơ đồ bàn → Chi tiết bàn | Đã có trạng thái bàn. Thu ngân là người nhận chính; phục vụ phụ trách nhận khi cần thực hiện việc tại bàn. |
| Đã thu tiền, bàn cần dọn hoặc bàn được chuyển/gộp và đổi người phụ trách | Cần xử lý | Sơ đồ bàn → Công việc bàn | Có trạng thái bàn và việc dọn. Cần cảnh báo đích danh khi phát sinh công việc hoặc đổi người nhận. |
| Ca được phân, đổi giờ, duyệt/từ chối nghỉ hoặc đổi ca | Cập nhật / Cần xử lý | Ca làm việc → Lịch và kết quả yêu cầu | Có thông báo kết quả nghỉ/đổi ca và đồng bộ trạng thái ca. Cần thông báo thay đổi lịch và người nhận ca. |
| Vào ca/hết ca, lưu đơn đặt hộ, chuyển/gộp bàn và lỗi thao tác | Tại chỗ | Ca làm việc hoặc Chi tiết bàn | Hiện phản hồi tại thao tác; cảnh báo riêng nếu thao tác bị từ chối hoặc không lưu được. |

### Bếp nóng / Bar · màn hình KDS và máy tính bảng

| Thông báo | Mức | Màn hình đích | Hiện trạng |
|---|---|---|---|
| Phiếu mới hoặc món gọi thêm đã duyệt | Cần xử lý | KDS → Phiếu theo bàn / Gom món theo trạm | Có cập nhật và chuông khi bật. Cần một mục thông báo cho đúng trạm có món. |
| Món sắp trễ hoặc quá ngưỡng phục vụ | Cần xử lý / Khẩn | KDS → Phiếu trễ | Có đổi màu theo ngưỡng 10 và 15 phút trong giao diện hiện hành. Cần chốt ngưỡng cảnh báo âm thanh và chỉ báo khi vượt ngưỡng. |
| Phục vụ đề nghị giục món | Cần xử lý | KDS → Đề nghị ưu tiên | Có hộp nổi và phản hồi. Cần chuông và lịch sử đang chờ / đã trả lời. |
| Quản lý gửi lệnh ưu tiên bắt buộc | Khẩn | KDS → Chỉ đạo khẩn → Phiếu món | Có thông báo nổi và xác nhận tiếp nhận. Cần chuông riêng cho lệnh khẩn. |
| Món đang làm chuyển sang chờ hủy, đã hủy hoặc tiếp tục làm | Cần xử lý | KDS → Dòng món / Phiếu liên quan | Có cập nhật dữ liệu. Cần banner đủ rõ nếu bếp phải dừng hoặc tiếp tục chế biến. |
| Số suất thấp, hết món hoặc món được bán lại | Cập nhật / Cần xử lý | KDS → Trạng thái món | Có danh sách tồn và nút đổi trạng thái. Cần nhắc tại ngưỡng có ý nghĩa và gửi cảnh báo đến đúng trạm. |
| Mất kết nối hoặc cập nhật tiến độ thất bại | Khẩn / Tại chỗ | Toàn bộ KDS | Cần banner cố định về kết nối, giữ phiếu đã tải và báo rõ khi thao tác chưa được ghi. |

### Thu ngân · máy POS

| Thông báo | Mức | Màn hình đích | Hiện trạng |
|---|---|---|---|
| Bàn yêu cầu tính tiền và bàn được chuyển sang thu ngân | Cần xử lý | Bàn chờ thanh toán → Kiểm bill | Có sự kiện và toast. Cần chuông, hàng chờ thật, nút nhận và kết thúc việc. |
| Có đơn mới hoặc yêu cầu hủy đang chờ khiến bill chưa thể thu | Cần xử lý | Kiểm bill và cửa sổ Tiền mặt/VietQR | Có khóa thu, lý do và tải lại dữ liệu. Cần mục thông báo khi trạng thái đổi trong lúc đang thu, và khi đủ điều kiện lại. |
| Hóa đơn thay đổi hoặc bị thay thế | Cần xử lý | Kiểm bill → Hóa đơn hiện hành | Có kiểm tra tại backend. Cần banner hướng dẫn tải bill mới và dừng dùng QR cũ. |
| Chỉ đạo khẩn về bàn, thu tiền hoặc phối hợp phục vụ | Khẩn | Thông báo POS → Chỉ đạo / Kiểm bill | Có hộp nổi cần xác nhận. Cần chuông và lịch sử. |
| Thu tiền thành công, thất bại hoặc bị từ chối | Tại chỗ | Tiền mặt/VietQR → Biên nhận hoặc lỗi | Có phản hồi và bản in sau khi thu thành công. Cảnh báo thất bại phải nằm ngay cạnh nút xác nhận. |
| Bàn đã thu cần dọn hoặc báo dọn xong | Cập nhật | Sơ đồ bàn | Có cập nhật trạng thái. Phục vụ là người nhận việc dọn chính. |
| In K80, in lại và đổi trạng thái ca | Tại chỗ / Cập nhật | Xem trước bản in, Lịch sử hóa đơn, Ca làm việc | Có gọi hộp thoại in trình duyệt. Chỉ hiển thị trạng thái gửi tới trình duyệt nếu chưa có dữ liệu máy in. |
| Giao dịch VietQR khớp, thiếu/thừa, trùng, sai tham chiếu; tách bill cần xác nhận | Cần xử lý / Khẩn | Đối soát hoặc Kiểm bill → Giao dịch/Hóa đơn | Phụ thuộc đợt VietQR giả lập và tách bill P1.4–P1.5. Hiện POS xác nhận VietQR thủ công. |

### Quản lý · máy tính và máy tính bảng

| Thông báo | Mức | Màn hình đích | Hiện trạng |
|---|---|---|---|
| Yêu cầu hủy món đã bắt đầu chế biến mới | Cần xử lý | Duyệt hủy món → Phiếu hủy | Có dữ liệu, sự kiện và số chờ duyệt. Cần chuông và banner mở thẳng phiếu. |
| Yêu cầu hủy quá hạn hoặc cần leo thang | Khẩn | Duyệt hủy món → Phiếu quá hạn | Cần chốt thời hạn và người nhận. Bộ hẹn giờ 90 giây thuộc phần nghiệp vụ chưa triển khai trong báo cáo khắc phục. |
| Nhân viên gửi yêu cầu nghỉ/đổi ca | Cần xử lý | Phân ca → Duyệt nghỉ/đổi ca | Có sự kiện phía backend và màn hình nghiệp vụ. Cần nghe sự kiện ở trung tâm, kèm chuông và liên kết phiếu. |
| Lệnh điều phối đã được tiếp nhận, còn bộ phận chưa phản hồi | Cập nhật / Khẩn | Điều phối khẩn → Lịch sử lệnh | Có lịch sử và sự kiện xác nhận. Cần nhắc khi quá hạn đã chốt và hiển thị mỗi bộ phận. |
| Phản hồi khách mới hoặc phản hồi cần xử lý | Cập nhật / Cần xử lý | Phản hồi khách → Chi tiết đánh giá | Có danh sách. Cần phát sự kiện đánh giá mới. Dùng tiêu chí đã chốt để gắn mức cần xử lý. |
| Cảnh báo món sắp hết, nhiều bàn treo xử lý hoặc phiếu bếp quá hạn | Cập nhật / Cần xử lý | Tổng quan → Thực đơn, KDS hoặc Sơ đồ bàn | Có dữ liệu nguồn từng module. Cần tạo cảnh báo theo ngưỡng và gom sự kiện lặp. |
| Chênh lệch thu, hoàn tiền cần duyệt, chốt két lệch | Khẩn | Báo cáo / Sổ quỹ → Giao dịch hoặc Ca | Phụ thuộc nghiệp vụ đối soát, hoàn tiền hoặc chốt két có dữ liệu xác minh. |
| Hạ tầng mất kết nối kéo dài, sao lưu/phục hồi gặp lỗi | Khẩn / Tại chỗ | Tổng quan vận hành / Tiện ích dữ liệu | Có phản hồi thao tác tại chỗ. Cảnh báo tự động cần nguồn đo hoặc sự kiện xác nhận sự cố. |
| Tạo/sửa nhân sự, phân bàn, lịch ca, phòng bàn, QR, menu, cấu hình VietQR | Tại chỗ | Trang quản trị tương ứng / Nhật ký kiểm toán | Hiện kết quả trên trang đã thao tác. Các thay đổi cần nhân viên hành động được chuyển tới trung tâm của đúng người nhận. |
| Doanh thu thay đổi và xuất báo cáo | Cập nhật / Tại chỗ | Báo cáo | Làm mới số liệu từ sự kiện thanh toán thực tế. Xuất file chỉ cần phản hồi kết quả tại màn hình. |

## 4. Các màn hình cần phủ khi nghiệm thu

| Vai trò | Màn hình cần mở được trung tâm và nhận banner |
|---|---|
| Khách | Tham gia bàn, Chào mừng, Thực đơn và Chi tiết món, Giỏ chung, Theo dõi món, Hỗ trợ, Yêu cầu tính tiền, VietQR, Kết quả thanh toán, Đánh giá. Thiết bị chưa được duyệt chỉ đọc trạng thái tham gia của mình. |
| Phục vụ | Sơ đồ bàn, Chi tiết bàn, duyệt/từ chối đơn, đặt hộ, chuyển/gộp bàn, yêu cầu hủy, giục món, Ca làm việc. |
| Bếp / Bar | Phiếu theo bàn, Gom món, Đã làm xong, Trạng thái món, đề nghị ưu tiên, chỉ đạo khẩn. |
| Thu ngân | Sơ đồ và kiểm bill, Bàn chờ thanh toán, Lịch sử hóa đơn, Ca làm việc, Tiền mặt, VietQR, Chiết khấu, Chia đều và In K80. |
| Quản lý | Tổng quan, Nhân sự, Phân ca, Phòng và bàn, Thực đơn, Báo cáo, Phản hồi, Điều phối khẩn, Duyệt hủy món, Nhật ký và Cài đặt/VietQR. |

Màn hình đăng nhập hiển thị lỗi xác thực hoặc phiên hết hạn tại chỗ. Sau khi đăng xuất hoặc đóng phiên QR, trung tâm không hiện nội dung của phiên trước trên thiết bị hiện tại. Quyền đọc biên nhận riêng tiếp tục dựa trên token hóa đơn hiện hành.

## 5. Thứ tự triển khai và kiểm thử

1. Xây màn hình **Thông báo**, icon chuông và bộ đếm cho năm vai trò. Có nút bật/tắt âm thanh và lưu việc cần xử lý sau tải lại.
2. Triển khai các cảnh báo có hành động ngay gồm đơn QR chờ duyệt, món mới xuống bếp, món chờ bưng, khách gọi hỗ trợ hoặc tính tiền, ca hủy món, bàn cần dọn, chỉ đạo khẩn và yêu cầu vào bàn.
3. Bổ sung thông báo ca làm, phản hồi khách, cảnh báo tồn và tiến độ. Sau khi có nguồn dữ liệu nghiệp vụ, thêm các cảnh báo đối soát, tách bill và chốt két.
4. Dùng ít nhất hai thiết bị khách cùng bàn, một điện thoại phục vụ, hai trạm KDS nếu có, máy POS và máy quản lý. Kiểm tra mỗi sự kiện chỉ đến đúng vai trò, bàn hoặc trạm. Xác nhận chuông phát đúng một lần, banner dẫn đúng hồ sơ, tải lại giữ việc chưa xử lý, nút xử lý hết hiệu lực sau khi người khác hoàn tất và lý do nội bộ không xuất hiện trên màn hình khách.

Nguồn chính gồm [định tuyến ứng dụng](../../frontend/src/dinhTuyen/DinhTuyenUngDung.jsx), [toast chung](../../frontend/src/App.jsx), [trung tâm công việc phục vụ](../../frontend/src/trang/soDoBan/TrangSoDoBan.jsx), [POS](../../frontend/src/trang/thanhToan/TrangPosKiemBill.jsx), [quản trị](../../frontend/src/trang/quanTri/TrangQuanTri.jsx), [gateway Socket.IO](../../backend/cauHinh/cauHinhSocket.js) và [báo cáo khắc phục](bao-cao-khac-phuc.md).
