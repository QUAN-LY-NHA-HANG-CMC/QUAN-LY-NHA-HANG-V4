const http = require('node:http');
const app = require('./ungDung.js');
const cauHinhChung = require('./cauHinh/cauHinhChung.js');
const ketNoiCoSoDuLieu = require('./cauHinh/ketNoiCoSoDuLieu.js');
const ghiNhatKy = require('./tienIch/ghiNhatKy.js');

async function khoiDongMayChu() {
    try {
        // Tự động khởi tạo và đồng bộ CSDL
        await ketNoiCoSoDuLieu.khoiTaoCoSoDuLieu();

        const server = http.createServer(app);
        server.listen(cauHinhChung.congBackend, () => {
            ghiNhatKy.ghiThongTin(`Máy chủ Backend Quán Mộc đang chạy tại http://localhost:${cauHinhChung.congBackend}`);
            ghiNhatKy.ghiThongTin(`Môi trường: ${cauHinhChung.moiTruong}`);
        });
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
