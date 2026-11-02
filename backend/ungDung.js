const path = require('node:path');
const express = require('express');
const cors = require('cors');

const gioiHanYeuCau = require('./middleware/gioiHanYeuCau.js');
const xuLyLoi = require('./middleware/xuLyLoi.js');

// Các Router nghiệp vụ Sprint 1
const taiKhoanRoutes = require('./modules/taiKhoan/taiKhoan.routes.js');
const nhanVienRoutes = require('./modules/nhanVien/nhanVien.routes.js');
const vaiTroRoutes = require('./modules/vaiTro/vaiTro.routes.js');
const khuVucRoutes = require('./modules/khuVuc/khuVuc.routes.js');
const banAnRoutes = require('./modules/banAn/banAn.routes.js');
const danhMucMonRoutes = require('./modules/danhMucMon/danhMucMon.routes.js');
const thucDonRoutes = require('./modules/thucDon/thucDon.routes.js');
const cauHinhNhaHangRoutes = require('./modules/cauHinhNhaHang/cauHinhNhaHang.routes.js');

// Các Router nghiệp vụ Sprint 2
const phienBanRoutes = require('./modules/phienBan/phienBan.routes.js');
const donGoiMonRoutes = require('./modules/donGoiMon/donGoiMon.routes.js');
const gioHangRoutes = require('./modules/gioHang/gioHang.routes.js');
const yeuCauHoTroRoutes = require('./modules/yeuCauHoTro/yeuCauHoTro.routes.js');

// Các Router nghiệp vụ Sprint 3
const kdsRoutes = require('./modules/kds/kds.routes.js');
const khuyenMaiRoutes = require('./modules/khuyenMai/khuyenMai.routes.js');
const hoaDonRoutes = require('./modules/hoaDon/hoaDon.routes.js');
const thanhToanRoutes = require('./modules/thanhToan/thanhToan.routes.js');

const app = express();

// Middlewares bảo mật và phân tích dữ liệu
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(gioiHanYeuCau(300, 60000));

// Phục vụ tệp tĩnh (hình ảnh tải lên và giao diện frontend)
app.use('/tepTaiLen', express.static(path.resolve(__dirname, '../tepTaiLen')));
app.use(express.static(path.resolve(__dirname, '../frontend')));

// Gắn các API Routes Sprint 1
app.use('/api/tai-khoan', taiKhoanRoutes);
app.use('/api/nhan-vien', nhanVienRoutes);
app.use('/api/vai-tro', vaiTroRoutes);
app.use('/api/khu-vuc', khuVucRoutes);
app.use('/api/ban-an', banAnRoutes);
app.use('/api/danh-muc-mon', danhMucMonRoutes);
app.use('/api/thuc-don', thucDonRoutes);
app.use('/api/cau-hinh-nha-hang', cauHinhNhaHangRoutes);

// Gắn các API Routes Sprint 2
app.use('/api/phien-ban', phienBanRoutes);
app.use('/api/don-goi-mon', donGoiMonRoutes);
app.use('/api/gio-hang', gioHangRoutes);
app.use('/api/yeu-cau-ho-tro', yeuCauHoTroRoutes);

// Gắn các API Routes Sprint 3
app.use('/api/kds', kdsRoutes);
app.use('/api/khuyen-mai', khuyenMaiRoutes);
app.use('/api/hoa-don', hoaDonRoutes);
app.use('/api/thanh-toan', thanhToanRoutes);

// Phục vụ giao diện Single Page Application (SPA fallback)
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return next();
    }
    const duongDanIndex = path.resolve(__dirname, '../frontend/index.html');
    res.sendFile(duongDanIndex, (loi) => {
        if (loi) {
            res.status(200).send('<h1>Hệ thống Quản lý Nhà hàng Quán Mộc</h1><p>API đang hoạt động tại /api</p>');
        }
    });
});

// Middleware xử lý lỗi tập trung
app.use(xuLyLoi);

module.exports = app;
