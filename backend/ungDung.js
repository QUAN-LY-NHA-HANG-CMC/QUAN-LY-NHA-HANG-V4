const path = require('node:path');
const express = require('express');
const cors = require('cors');

const gioiHanYeuCau = require('./middleware/gioiHanYeuCau.js');
const xuLyLoi = require('./middleware/xuLyLoi.js');

// Các Router nghiệp vụ
const taiKhoanRoutes = require('./modules/taiKhoan/taiKhoan.routes.js');
const nhanVienRoutes = require('./modules/nhanVien/nhanVien.routes.js');
const vaiTroRoutes = require('./modules/vaiTro/vaiTro.routes.js');
const khuVucRoutes = require('./modules/khuVuc/khuVuc.routes.js');
const banAnRoutes = require('./modules/banAn/banAn.routes.js');
const danhMucMonRoutes = require('./modules/danhMucMon/danhMucMon.routes.js');
const thucDonRoutes = require('./modules/thucDon/thucDon.routes.js');
const cauHinhNhaHangRoutes = require('./modules/cauHinhNhaHang/cauHinhNhaHang.routes.js');

const app = express();

// Middlewares bảo mật và phân tích dữ liệu
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(gioiHanYeuCau(300, 60000));

// Phục vụ tệp tĩnh (hình ảnh tải lên và giao diện frontend)
app.use('/tepTaiLen', express.static(path.resolve(__dirname, '../tepTaiLen')));
app.use(express.static(path.resolve(__dirname, '../frontend')));

// Gắn các API Routes
app.use('/api/tai-khoan', taiKhoanRoutes);
app.use('/api/nhan-vien', nhanVienRoutes);
app.use('/api/vai-tro', vaiTroRoutes);
app.use('/api/khu-vuc', khuVucRoutes);
app.use('/api/ban-an', banAnRoutes);
app.use('/api/danh-muc-mon', danhMucMonRoutes);
app.use('/api/thuc-don', thucDonRoutes);
app.use('/api/cau-hinh-nha-hang', cauHinhNhaHangRoutes);

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
