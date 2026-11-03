const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const db = require('../../backend/cauHinh/ketNoiCoSoDuLieu.js');

test('Task 2: Kiểm tra thư viện ảnh món ăn nội bộ và đường dẫn ảnh trong CSDL', () => {
    const thuMucMonAn = path.resolve(__dirname, '../../tepTaiLen/monAn');
    assert.strictEqual(fs.existsSync(thuMucMonAn), true, 'Thư mục tepTaiLen/monAn phải tồn tại');

    const cacTepBatBuoc = [
        'nem_nuong.svg',
        'khoai_tay.svg',
        'bo_to_cuon.svg',
        'ga_nuong_lu.svg',
        'lau_rieu_cua.svg',
        'tra_dao.svg',
        'nuoc_ep_dua_hau.svg',
        'mac_dinh.svg'
    ];

    for (const tep of cacTepBatBuoc) {
        const duongDan = path.join(thuMucMonAn, tep);
        assert.strictEqual(fs.existsSync(duongDan), true, `Tệp ảnh ${tep} phải tồn tại`);
        const noiDung = fs.readFileSync(duongDan, 'utf8');
        assert.match(noiDung, /<svg/, `Tệp ${tep} phải là định dạng vector SVG hợp lệ`);
    }

    const cacMon = db.layNhieu('SELECT id, ma_mon, ten_mon, hinh_anh FROM mon_an WHERE id <= 7');
    for (const mon of cacMon) {
        assert.ok(mon.hinh_anh, `Món ${mon.ten_mon} phải có đường dẫn hình ảnh`);
    }
});
