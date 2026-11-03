const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Task 1: Kiểm tra cấu trúc HTML và CSS cho Responsive Drawer và Design Tokens', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../../frontend/index.html'), 'utf8');
    assert.match(html, /nut-mo-menu-mobile/, 'Phải có nút hamburger mở drawer');
    assert.match(html, /lop-phu-drawer/, 'Phải có lớp phủ backdrop drawer');
    assert.match(html, /chi-bao-mang/, 'Phải có chỉ báo kết nối mạng');

    const css = fs.readFileSync(path.resolve(__dirname, '../../frontend/tepGiaoDien.css'), 'utf8');
    assert.match(css, /lop-phu-drawer/, 'CSS phải định nghĩa lớp phủ drawer');
    assert.match(css, /@media\s*\(max-width:\s*768px\)/, 'CSS phải có breakpoint responsive 768px');
    assert.match(css, /kich-hoat-drawer/, 'CSS phải có trạng thái trượt mở drawer');
});
