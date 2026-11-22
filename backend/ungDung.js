// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// KHỞI TẠO ỨNG DỤNG EXPRESS VÀ GẮN KẾT CÁC PHÂN HỆ
// ============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cauHinh = require('./cauHinh/cauHinhChung');
const { phanHoiThanhCong } = require('./tienIch/dinhDangPhanHoi');
const { xuLyKhongTimThay, xuLyLoiChung } = require('./middleware/xuLyLoi');

// Import các route phân hệ
const { taiKhoanRoutes } = require('./modules/taiKhoan');
const { banAnRoutes } = require('./modules/banAn');
const { thucDonRoutes } = require('./modules/thucDon');
const { donGoiMonRoutes } = require('./modules/donGoiMon');
const { dieuPhoiBepRoutes } = require('./modules/dieuPhoiBep');
const { hoaDonRoutes } = require('./modules/hoaDon');
const { caLamViecRoutes } = require('./modules/caLamViec');
const { heThongRoutes } = require('./modules/heThong');
const { baoCaoRoutes } = require('./modules/baoCao');

const ungDung = express();
ungDung.disable('x-powered-by');
ungDung.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store');
    next();
});

// 1. Cấu hình CORS
ungDung.use(cors({
    origin: (origin, callback) => {
        // Cho phép các yêu cầu nội bộ hoặc không có origin (như Mobile App, Postman)
        if (!origin || cauHinh.nguonFrontendChoPhep.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, cauHinh.moiTruong !== 'production');
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// 2. Phân tích cú pháp request body
ungDung.use(express.json({ limit: '10mb' }));
ungDung.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Phục vụ static file (hình ảnh món ăn, uploads, tài liệu)
ungDung.use('/public', express.static(path.join(__dirname, '../public')));

// 4. Endpoint kiểm tra sức khỏe hệ thống (Health Check)
ungDung.get('/api/kiem-tra-suc-khoe', (req, res) => {
    return phanHoiThanhCong(res, {
        trangThai: 'hoat_dong_tot',
        phienBan: '1.0.0',
        thoiGianMayChu: new Date().toISOString(),
        moiTruong: cauHinh.moiTruong
    }, 'Hệ thống Quán Mộc POS sẵn sàng phục vụ');
});

// 5. Gắn kết các Router phân hệ
ungDung.use('/api/tai-khoan', taiKhoanRoutes);
ungDung.use('/api/ban-an', banAnRoutes);
ungDung.use('/api/thuc-don', thucDonRoutes);
ungDung.use('/api/don-goi-mon', donGoiMonRoutes);
ungDung.use('/api/dieu-phoi-bep', dieuPhoiBepRoutes);
ungDung.use('/api/dieu-phoi', dieuPhoiBepRoutes);
ungDung.use('/api/hoa-don', hoaDonRoutes);
ungDung.use('/api/ca-lam-viec', caLamViecRoutes);
ungDung.use('/api/he-thong', heThongRoutes);
ungDung.use('/api/bao-cao', baoCaoRoutes);

// 6. Phục vụ Frontend Single Page Application (SPA) khi đã build production
const thuMucFrontendBuild = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(thuMucFrontendBuild)) {
    ungDung.use(express.static(thuMucFrontendBuild));
    ungDung.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/public')) {
            return res.sendFile(path.join(thuMucFrontendBuild, 'index.html'));
        }
        next();
    });
} else {
    ungDung.get('/', (req, res) => {
        res.send(`
            <div style="font-family:sans-serif;text-align:center;padding:50px;">
                <h2 style="color:#b64d2d;">Quán Mộc POS & E-Menu</h2>
                <p>Thư mục giao diện <b>frontend/dist</b> chưa được tạo trên máy chủ.</p>
                <p>Vui lòng mở terminal và chạy lệnh: <code>cd frontend && npm install && npm run build</code></p>
            </div>
        `);
    });
}

// 7. Xử lý đường dẫn API không tồn tại (404)
ungDung.use(xuLyKhongTimThay);

// 8. Middleware xử lý lỗi toàn cục (500)
ungDung.use(xuLyLoiChung);

module.exports = ungDung;
