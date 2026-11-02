const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Kiểm tra sự tồn tại và cú pháp các tệp frontend', () => {
    const duongDanIndex = path.resolve(__dirname, '../../frontend/index.html');
    const duongDanCss = path.resolve(__dirname, '../../frontend/tepGiaoDien.css');
    const duongDanUngDung = path.resolve(__dirname, '../../frontend/ungDung.js');

    assert.ok(fs.existsSync(duongDanIndex), 'index.html phải tồn tại');
    assert.ok(fs.existsSync(duongDanCss), 'tepGiaoDien.css phải tồn tại');
    assert.ok(fs.existsSync(duongDanUngDung), 'ungDung.js phải tồn tại');

    const noiDungIndex = fs.readFileSync(duongDanIndex, 'utf8');
    assert.ok(noiDungIndex.includes('QUÁN MỘC POS'));
    assert.ok(noiDungIndex.includes('/ungDung.js'));
});
