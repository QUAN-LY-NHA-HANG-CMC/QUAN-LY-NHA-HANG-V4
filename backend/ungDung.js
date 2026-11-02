/**
 * Khởi tạo ứng dụng Express (ungDung.js)
 * Cấu hình bảo mật toàn diện: Helmet, CORS, Rate Limit, Cookie Parser, Swagger UI
 * Tuân thủ Quy chuẩn phát triển toàn dự án (QUY_TAC_LAM_DU_AN.txt)
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');

const cauHinhChung = require('./cauHinh/cauHinhChung');
const { gioiHanChung } = require('./middleware/gioiHanYeuCau');
const { xuLyKhongTimThay, xuLyLoiToanCuc } = require('./middleware/xuLyLoi');

// Nạp các Routes của các Module Sprint 1
const { taiKhoanRoutes } = require('./modules/taiKhoan');
const { vaiTroRoutes } = require('./modules/vaiTro');
const { cauHinhNhaHangRoutes } = require('./modules/cauHinhNhaHang');
const { nhanVienRoutes } = require('./modules/nhanVien');
const { khuVucRoutes } = require('./modules/khuVuc');
const { banAnRoutes } = require('./modules/banAn');
const { danhMucMonRoutes } = require('./modules/danhMucMon');
const { thucDonRoutes } = require('./modules/thucDon');

// Nạp tài liệu Swagger
const taiLieuSwagger = require('../taiLieu/swagger.json');

const app = express();

// 1. Cấu hình tiêu đề bảo mật HTTP (Rule 10.2)
app.use(helmet({
    contentSecurityPolicy: false, // Để Swagger UI tải assets mượt mà
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. Cấu hình kiểm soát nguồn gốc CORS (Rule 10.1)
app.use(cors({
    origin: (origin, callback) => {
        // Cho phép các yêu cầu cùng nguồn gốc, tools kiểm thử (Postman/cURL không có origin)
        if (!origin || cauHinhChung.nguonGocChoPhep.includes(origin) || cauHinhChung.laMoiTruongPhatTrien) {
            return callback(null, true);
        }
        return callback(new Error('Nguồn gốc yêu cầu không được cấp phép bởi CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 3. Phân tích cú pháp Request Body & Cookie
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. Giới hạn tần suất yêu cầu toàn hệ thống chống spam (US-005 & Rule 10.7)
app.use(gioiHanChung);

// 5. Tài liệu API Swagger UI (Giao diện trực quan tại /api-docs)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(taiLieuSwagger, {
    customSiteTitle: 'Tài liệu API Nhà Hàng Quán Mộc',
    customCss: '.swagger-ui .topbar { display: none }'
}));

// Cung cấp file JSON thô cho Swagger / OpenAPI
app.get('/api-docs.json', (req, res) => {
    res.json(taiLieuSwagger);
});

// 6. Tuyến kiểm tra sức khỏe hệ thống (Health Check)
app.get('/api/kiem-tra-suc-khoe', (req, res) => {
    res.status(200).json({
        ok: true,
        data: {
            tenDichVu: 'Backend Quản Lý Nhà Hàng & Gọi Món QR',
            phienBan: '1.0.0',
            trangThai: 'Hoạt động tốt',
            thoiGian: new Date().toISOString()
        },
        msg: 'Hệ thống hoạt động bình thường'
    });
});

// 7. Gắn các Router API nghiệp vụ Sprint 1
app.use('/api/tai-khoan', taiKhoanRoutes);
app.use('/api/vai-tro', vaiTroRoutes);
app.use('/api/cau-hinh-nha-hang', cauHinhNhaHangRoutes);
app.use('/api/nhan-vien', nhanVienRoutes);
app.use('/api/khu-vuc', khuVucRoutes);
app.use('/api/ban-an', banAnRoutes);
app.use('/api/danh-muc-mon', danhMucMonRoutes);
app.use('/api/thuc-don', thucDonRoutes);

// 8. Xử lý đường dẫn không tồn tại (404)
app.use(xuLyKhongTimThay);

// 9. Xử lý lỗi toàn cục
app.use(xuLyLoiToanCuc);

module.exports = app;
