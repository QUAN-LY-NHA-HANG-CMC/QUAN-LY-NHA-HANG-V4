// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MÁY CHỦ CHÍNH (ENTRY POINT) - KHỞI CHẠY HTTP VÀ SOCKET.IO GATEWAY
// ============================================================================

const http = require('http');
const ungDung = require('./ungDung');
const { khoiTaoSocket } = require('./cauHinh/cauHinhSocket');
const cauHinh = require('./cauHinh/cauHinhChung');

// Tạo HTTP Server từ ứng dụng Express
const mayChuHttp = http.createServer(ungDung);

// Gắn kết Socket.io Server thời gian thực
const io = khoiTaoSocket(mayChuHttp);

const PORT = cauHinh.congBackend;

if (require.main === module) {
    mayChuHttp.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error('\n❌ [LỖI KHỞI ĐỘNG]: Cổng 3001 (PORT 3001) đang bị một tiến trình khác chiếm dụng!');
            console.error('💡 CÁCH KHẮC PHỤC NHANH:');
            console.error('   1. Chạy lệnh: npm run kill-port');
            console.error('   2. Hoặc nhấp đúp chuột vào file: dong-localhost.bat ở thư mục gốc');
            console.error('   3. Hoặc trong PowerShell: Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force\n');
            process.exit(1);
        } else {
            console.error('❌ Lỗi máy chủ:', err.message);
            process.exit(1);
        }
    });

    mayChuHttp.listen(PORT, () => {
        console.log('================================================================');
        console.log('🚀 MÁY CHỦ QUÁN MỘC POS & E-MENU ĐÃ KHỞI CHẠY THÀNH CÔNG!');
        console.log(`📡 Địa chỉ HTTP API:    http://localhost:${PORT}`);
        console.log(`🔌 Cổng Socket.io:      ws://localhost:${PORT}`);
        console.log(`🏥 Kiểm tra sức khỏe:   http://localhost:${PORT}/api/kiem-tra-suc-khoe`);
        console.log(`🗄️ CSDL SQLite:        ${cauHinh.duongDanCsdl}`);
        console.log(`🕒 Thời gian khởi động: ${new Date().toLocaleString('vi-VN')}`);
        console.log('================================================================');
    });

    // Lắng nghe tín hiệu dừng chương trình an toàn
    const dongMayChuAnToan = () => {
        console.log('\n🛑 Đang đóng máy chủ Quán Mộc POS...');
        io.close(() => {
            console.log('✅ Đã đóng toàn bộ kết nối mạng.');
            process.exit(0);
        });
    };

    process.on('SIGINT', dongMayChuAnToan);
    process.on('SIGTERM', dongMayChuAnToan);
}

module.exports = {
    mayChuHttp,
    ungDung,
    io
};
