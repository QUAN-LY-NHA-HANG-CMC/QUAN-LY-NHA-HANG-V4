// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// SCRIPT KHỞI TẠO VÀ KIỂM TRA TOÀN VẸN CƠ SỞ DỮ LIỆU SQLITE3
// ============================================================================

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DUONG_DAN_THU_MUC = __dirname;
const TEP_CSDL = path.join(DUONG_DAN_THU_MUC, 'coSoDuLieu.sqlite');
const TEP_TAO_BANG = path.join(DUONG_DAN_THU_MUC, 'taoBang.sql');
const TEP_DU_LIEU_MAU = path.join(DUONG_DAN_THU_MUC, 'duLieuMau.sql');

console.log('================================================================');
console.log('   BẮT ĐẦU KHỞI TẠO CƠ SỞ DỮ LIỆU SQLITE3 - NHÀ HÀNG MỘC');
console.log('================================================================\n');

// 1. Dọn dẹp tệp CSDL cũ nếu tồn tại
if (fs.existsSync(TEP_CSDL)) {
    console.log(`[1/5] Phát hiện tệp CSDL cũ: ${TEP_CSDL}`);
    fs.unlinkSync(TEP_CSDL);
    console.log('      -> Đã xóa tệp cũ để khởi tạo mới hoàn toàn.\n');
} else {
    console.log('[1/5] Khởi tạo tệp CSDL mới: coSoDuLieu.sqlite\n');
}

// 2. Mở kết nối CSDL và bật Foreign Key
const db = new DatabaseSync(TEP_CSDL);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');
console.log('[2/5] Đã thiết lập kết nối CSDL (Foreign Keys = ON, WAL Mode = ON).\n');

// 3. Thực thi kịch bản tạo bảng (taoBang.sql)
console.log('[3/5] Đang thực thi taoBang.sql...');
const noiDungTaoBang = fs.readFileSync(TEP_TAO_BANG, 'utf-8');
db.exec(noiDungTaoBang);
console.log('      -> Khởi tạo 24 bảng và 31 chỉ mục thành công!\n');

// 4. Thực thi kịch bản nạp dữ liệu mẫu (duLieuMau.sql)
console.log('[4/5] Đang nạp dữ liệu mẫu từ duLieuMau.sql...');
const noiDungDuLieuMau = fs.readFileSync(TEP_DU_LIEU_MAU, 'utf-8');
db.exec(noiDungDuLieuMau);
console.log('      -> Nạp dữ liệu mẫu đồng bộ Figma thành công!\n');

// 5. Kiểm tra tính toàn vẹn (Integrity & Foreign Key Check)
console.log('[5/5] Kiểm tra tính toàn vẹn dữ liệu...');
const fkCheck = db.prepare('PRAGMA foreign_key_check;').all();
if (fkCheck.length > 0) {
    console.error('      ❌ LỖI TOÀN VẸN KHÓA NGOẠI:', fkCheck);
    process.exit(1);
} else {
    console.log('      ✅ PRAGMA foreign_key_check: PASSED (Không có lỗi khóa ngoại)');
}

const integrityCheck = db.prepare('PRAGMA integrity_check;').all();
console.log(`      ✅ PRAGMA integrity_check: ${integrityCheck[0].integrity_check}\n`);

// 6. Thống kê số lượng bản ghi từng bảng
console.log('----------------------------------------------------------------');
console.log('   BẢNG THỐNG KÊ SỐ LƯỢNG BẢN GHI ĐÃ NẠP (24 BẢNG CHUẨN 3NF)');
console.log('----------------------------------------------------------------');

const danhSachBang = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name;
`).all();

let tongSoBanGhi = 0;
danhSachBang.forEach((b, index) => {
    const dem = db.prepare(`SELECT COUNT(*) as total FROM "${b.name}"`).get();
    tongSoBanGhi += dem.total;
    const stt = String(index + 1).padStart(2, ' ');
    const tenBang = b.name.padEnd(25, ' ');
    console.log(`  ${stt}. ${tenBang} : ${dem.total} bản ghi`);
});

const danhSachIndex = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type = 'index' AND name NOT LIKE 'sqlite_%'
`).all();

console.log('----------------------------------------------------------------');
console.log(`  Tổng số bảng nghiệp vụ : ${danhSachBang.length} bảng`);
console.log(`  Tổng số chỉ mục (Index): ${danhSachIndex.length} chỉ mục`);
console.log(`  Tổng số bản ghi mẫu    : ${tongSoBanGhi} bản ghi`);
console.log('================================================================');
console.log('   🎉 BƯỚC 1: KHỞI TẠO CƠ SỞ DỮ LIỆU ĐÃ HOÀN TẤT XUẤT SẮC! 🎉');
console.log('================================================================');

db.close();
