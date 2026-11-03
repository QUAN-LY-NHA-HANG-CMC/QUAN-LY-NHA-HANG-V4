const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Task 4: Kiểm tra mã nguồn Frontend của Phong (Sơ đồ bàn, POS, KDS, Thống kê)', () => {
    // 1. Sơ đồ bàn: phải có lọc trạng thái, tìm kiếm và badge thời gian
    const fileBan = fs.readFileSync(path.resolve(__dirname, '../../frontend/trang/quanLyBanQr/quanLyBanQr.js'), 'utf8');
    assert.match(fileBan, /loc-trang-thai-ban|tab-trang-thai/, 'Sơ đồ bàn phải có bộ lọc trạng thái');
    assert.match(fileBan, /tim-kiem-ban/, 'Sơ đồ bàn phải có ô tìm kiếm bàn');
    assert.match(fileBan, /so_phut_ngoi|phut/, 'Sơ đồ bàn phải hiển thị thời gian khách ngồi');

    // 2. POS Thu ngân: phải có nút gợi ý tiền chẵn và tính tiền thối
    const fileThanhToan = fs.readFileSync(path.resolve(__dirname, '../../frontend/trang/thanhToan/thanhToan.js'), 'utf8');
    assert.match(fileThanhToan, /500000|500\.000/, 'POS phải có nút gợi ý tiền mặt 500k');
    assert.match(fileThanhToan, /tien-thoi|tienThoi/, 'POS phải có hiển thị tiền thừa trả khách');

    // 3. KDS Bếp: phải có chuông Web Audio và nút Fullscreen
    const fileKds = fs.readFileSync(path.resolve(__dirname, '../../frontend/trang/dieuPhoiBep/dieuPhoiBep.js'), 'utf8');
    assert.match(fileKds, /AudioContext/, 'KDS phải sử dụng Web Audio API cho chuông báo');
    assert.match(fileKds, /fullscreen|requestFullscreen/, 'KDS phải hỗ trợ chế độ Toàn màn hình');

    // 4. Thống kê: phải có ô chọn khoảng ngày tuNgay, denNgay
    const fileThongKe = fs.readFileSync(path.resolve(__dirname, '../../frontend/trang/thongKe/thongKe.js'), 'utf8');
    assert.match(fileThongKe, /loc-tu-ngay/, 'Thống kê phải có ô chọn ngày bắt đầu');
    assert.match(fileThongKe, /loc-den-ngay/, 'Thống kê phải có ô chọn ngày kết thúc');
});
