const test = require('node:test');
const assert = require('node:assert/strict');

test('Kiểm tra cấu hình chung của hệ thống', () => {
    const cauHinhChung = require('../../backend/cauHinh/cauHinhChung.js');
    assert.strictEqual(typeof cauHinhChung.congBackend, 'number');
    assert.strictEqual(cauHinhChung.congBackend, 3001);
    assert.strictEqual(typeof cauHinhChung.thoiGianPhienBanPhut, 'number');
    assert.strictEqual(cauHinhChung.soMonToiDaMoiLanGoi, 20);
});

test('Kiểm tra tiện ích định dạng phản hồi chuẩn', () => {
    const dinhDangPhanHoi = require('../../backend/tienIch/dinhDangPhanHoi.js');
    
    // Giả lập đối tượng response của Express
    let maTrangThai = 200;
    let duLieuTraVe = null;
    const resGiaLap = {
        status(code) {
            maTrangThai = code;
            return this;
        },
        json(data) {
            duLieuTraVe = data;
            return data;
        }
    };

    dinhDangPhanHoi.thanhCong(resGiaLap, { id: 1 }, 'Thành công', 200);
    assert.strictEqual(maTrangThai, 200);
    assert.strictEqual(duLieuTraVe.ok, true);
    assert.strictEqual(duLieuTraVe.msg, 'Thành công');
    assert.strictEqual(duLieuTraVe.data.id, 1);

    dinhDangPhanHoi.thatBai(resGiaLap, 'Lỗi kiểm tra', 400);
    assert.strictEqual(maTrangThai, 400);
    assert.strictEqual(duLieuTraVe.ok, false);
    assert.strictEqual(duLieuTraVe.msg, 'Lỗi kiểm tra');
    assert.strictEqual(duLieuTraVe.data, null);
});
