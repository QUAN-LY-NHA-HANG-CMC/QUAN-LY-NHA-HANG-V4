/**
 * Điểm khởi chạy máy chủ HTTP (mayChu.js)
 * Khởi tạo CSDL, nạp dữ liệu mẫu và lắng nghe kết nối
 */
require('dotenv').config();
const http = require('http');
const app = require('./ungDung');
const cauHinhChung = require('./cauHinh/cauHinhChung');
const { khoiTaoCoSoDuLieu } = require('./cauHinh/ketNoiCoSoDuLieu');

// 1. Tự động khởi tạo cấu trúc CSDL và dữ liệu mẫu nếu chưa có
try {
    khoiTaoCoSoDuLieu();
    console.log('[CSDL] Đã kiểm tra và nạp cấu trúc cơ sở dữ liệu & dữ liệu mẫu thành công.');
} catch (loi) {
    console.error('[CSDL] Lỗi khi khởi tạo cơ sở dữ liệu:', loi.message);
}

// 2. Tạo máy chủ HTTP
const server = http.createServer(app);
const PORT = cauHinhChung.congBackend;

server.listen(PORT, () => {
    console.log('================================================================');
    console.log(` MÁY CHỦ BACKEND NHÀ HÀNG QUÁN MỘC ĐÃ KHỞI CHẠY THÀNH CÔNG `);
    console.log(` Cổng lắng nghe    : http://localhost:${PORT}`);
    console.log(` Kiểm tra sức khỏe : http://localhost:${PORT}/api/kiem-tra-suc-khoe`);
    console.log(` Tài liệu Swagger  : http://localhost:${PORT}/api-docs`);
    console.log(` Swagger JSON      : http://localhost:${PORT}/api-docs.json`);
    console.log(` Môi trường        : ${cauHinhChung.moiTruong}`);
    console.log('================================================================');
});

// 3. Xử lý tắt máy chủ an toàn (Graceful Shutdown)
process.on('SIGINT', () => {
    console.log('\n[MÁY CHỦ] Đang đóng kết nối và tắt máy chủ an toàn...');
    server.close(() => {
        console.log('[MÁY CHỦ] Đã dừng toàn bộ tiến trình.');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n[MÁY CHỦ] Đang nhận tín hiệu SIGTERM để kết thúc...');
    server.close(() => {
        process.exit(0);
    });
});
