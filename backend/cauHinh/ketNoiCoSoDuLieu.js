// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MODULE KẾT NỐI VÀ QUẢN LÝ TRUY VẤN CƠ SỞ DỮ LIỆU SQLITE3
// ============================================================================

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const cauHinh = require('./cauHinhChung');

// Đảm bảo tệp CSDL tồn tại trước khi kết nối
if (!fs.existsSync(cauHinh.duongDanCsdl)) {
    console.warn(`⚠️ CẢNH BÁO: Không tìm thấy tệp CSDL tại ${cauHinh.duongDanCsdl}.`);
}

const db = new DatabaseSync(cauHinh.duongDanCsdl);

// Kích hoạt các chế độ an toàn dữ liệu và đồng bộ trực tiếp vào tệp CSDL
db.exec('PRAGMA foreign_keys = ON;');
// Dùng chế độ DELETE để tất cả thao tác INSERT, UPDATE, DELETE được ghi ngay lập tức
// vào tệp coSoDuLieu.sqlite trên ổ đĩa, giúp các trình xem CSDL (như SQLite Viewer VS Code)
// luôn thấy dữ liệu mới nhất mà không bị giữ lại ở tệp tạm -wal
db.exec('PRAGMA journal_mode = DELETE;');
db.exec('PRAGMA synchronous = FULL;');
db.exec('PRAGMA busy_timeout = 5000;');

chayGiaoDich(() => {
    // Bổ sung cột cho các bảng đã có trước khi DDL tạo chỉ mục.
    const cotBoSung = {
        mon_an: { so_suat_con_lai: 'INTEGER DEFAULT NULL' },
        don_goi_mon: { khoa_gui: 'TEXT', thiet_bi_tao_id: 'TEXT REFERENCES thiet_bi_phien_ban(id)' },
        yeu_cau_huy_mon: { trang_thai_mon_cu: 'TEXT' },
        ca_lam_viec: { thoi_gian_checkin: 'TEXT', thoi_gian_checkout: 'TEXT' },
        chi_tiet_don_mon: { thoi_gian_phuc_vu: 'TEXT' },
        nhan_vien: { ngay_luu_tru: 'DATETIME' }
    };
    for (const [bang, cot] of Object.entries(cotBoSung)) {
        const cacCotHienTai = db.prepare(`PRAGMA table_info(${bang})`).all();
        if (cacCotHienTai.length === 0) continue;
        const tenCotHienTai = new Set(cacCotHienTai.map(muc => muc.name));
        for (const [ten, dinhNghia] of Object.entries(cot)) {
            if (!tenCotHienTai.has(ten)) {
                db.exec(`ALTER TABLE ${bang} ADD COLUMN ${ten} ${dinhNghia}`);
            }
        }
    }

    db.exec(fs.readFileSync(path.join(__dirname, '../../database/taoBang.sql'), 'utf8'));
    db.exec(`INSERT INTO cau_hinh_nha_hang
        (ten_nha_hang, dia_chi, so_dien_thoai, ngan_hang_vietqr, so_tai_khoan_vietqr, ten_chu_tai_khoan_vietqr)
        SELECT 'Quán Mộc', '', '', '', '', '' WHERE NOT EXISTS (SELECT 1 FROM cau_hinh_nha_hang)`);
});

/**
 * Thực thi câu truy vấn lấy danh sách nhiều dòng bản ghi
 * @param {string} sql Câu lệnh SQL có tham số (?)
 * @param {Array} thamSo Mảng giá trị tham số
 * @returns {Array} Danh sách các dòng kết quả
 */
function truyVanNhieu(sql, thamSo = []) {
    const stmt = db.prepare(sql);
    return stmt.all(...thamSo);
}

/**
 * Thực thi câu truy vấn lấy duy nhất 1 bản ghi
 * @param {string} sql Câu lệnh SQL có tham số (?)
 * @param {Array} thamSo Mảng giá trị tham số
 * @returns {Object|null} Bản ghi đầu tiên hoặc null nếu không tìm thấy
 */
function truyVanMot(sql, thamSo = []) {
    const stmt = db.prepare(sql);
    const ketQua = stmt.get(...thamSo);
    return ketQua !== undefined ? ketQua : null;
}

/**
 * Thực thi câu lệnh ghi/sửa/xóa dữ liệu (INSERT, UPDATE, DELETE)
 * @param {string} sql Câu lệnh SQL có tham số (?)
 * @param {Array} thamSo Mảng giá trị tham số
 * @returns {{ changes: number, lastInsertRowid: number|bigint }} Kết quả thực thi
 */
function thucThi(sql, thamSo = []) {
    const stmt = db.prepare(sql);
    const ketQua = stmt.run(...thamSo);
    return ketQua;
}

/**
 * Thực thi một chuỗi các thao tác trong Giao dịch an toàn (Transaction)
 * Tự động COMMIT nếu thành công, ROLLBACK nếu phát sinh bất kỳ ngoại lệ nào
 * @param {Function} hamXuLy Hàm callback chứa các câu lệnh db
 * @returns {*} Giá trị trả về từ hamXuLy
 */
function chayGiaoDich(hamXuLy) {
    db.exec('BEGIN IMMEDIATE TRANSACTION;');
    try {
        const ketQua = hamXuLy(db);
        db.exec('COMMIT TRANSACTION;');
        return ketQua;
    } catch (loi) {
        db.exec('ROLLBACK TRANSACTION;');
        throw loi;
    }
}

module.exports = {
    db,
    truyVanNhieu,
    truyVanMot,
    thucThi,
    chayGiaoDich
};
