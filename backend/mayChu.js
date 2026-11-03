const http = require('node:http');
const app = require('./ungDung.js');
const cauHinhChung = require('./cauHinh/cauHinhChung.js');
const ketNoiCoSoDuLieu = require('./cauHinh/ketNoiCoSoDuLieu.js');
const { khoiTaoSocket } = require('./cauHinh/cauHinhSocket.js');
const ghiNhatKy = require('./tienIch/ghiNhatKy.js');

async function khoiDongMayChu() {
    try {
        // Tự động khởi tạo và đồng bộ CSDL
        await ketNoiCoSoDuLieu.khoiTaoCoSoDuLieu();

        const server = http.createServer(app);
        khoiTaoSocket(server);

        server.on('error', (loi) => {
            if (loi.code === 'EADDRINUSE') {
                ghiNhatKy.ghiLoi(`[EADDRINUSE] Cổng ${cauHinhChung.congBackend} đang bị chiếm bởi một tiến trình Node khác.`);
                ghiNhatKy.ghiThongTin(`Gợi ý: Máy chủ có thể đã đang chạy sẵn. Bạn có thể mở ngay trình duyệt tại http://localhost:${cauHinhChung.congBackend} hoặc chạy 'Stop-Process -Name node -Force' trước khi chạy lại 'npm start'.`);
            } else {
                ghiNhatKy.ghiLoi('Lỗi máy chủ', loi);
            }
            process.exit(1);
        });

        server.listen(cauHinhChung.congBackend, () => {
            ghiNhatKy.ghiThongTin(`Máy chủ Backend Quán Mộc đang chạy tại http://localhost:${cauHinhChung.congBackend}`);
            ghiNhatKy.ghiThongTin(`Môi trường: ${cauHinhChung.moiTruong}`);
        });

        return server;
    } catch (loi) {
        ghiNhatKy.ghiLoi('Không thể khởi động máy chủ', loi);
        process.exit(1);
    }
}

// Khởi chạy khi tệp được thực thi trực tiếp
if (require.main === module) {
    khoiDongMayChu();
}

module.exports = {
    khoiDongMayChu
};
