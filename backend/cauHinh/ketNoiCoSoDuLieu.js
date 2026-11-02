/**
 * Quản lý kết nối và thực thi truy vấn Cơ sở dữ liệu
 * Hỗ trợ SQLite (qua node:sqlite chuẩn của Node 22+) với Prepared Statements chống SQL Injection
 * Tuân thủ mục 8: Quy tắc cơ sở dữ liệu (QUY_TAC_LAM_DU_AN.txt)
 */
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const cauHinhChung = require('./cauHinhChung');

let ketNoiDb = null;

/**
 * Lấy hoặc khởi tạo instance kết nối cơ sở dữ liệu
 */
function layKetNoi() {
    if (!ketNoiDb) {
        const duongDanThuMucDb = path.dirname(path.resolve(cauHinhChung.coSoDuLieu.duongDanSqlite));
        if (!fs.existsSync(duongDanThuMucDb)) {
            fs.mkdirSync(duongDanThuMucDb, { recursive: true });
        }

        ketNoiDb = new DatabaseSync(path.resolve(cauHinhChung.coSoDuLieu.duongDanSqlite));
        
        // Bật Foreign Keys trong SQLite
        ketNoiDb.exec('PRAGMA foreign_keys = ON;');
        ketNoiDb.exec('PRAGMA journal_mode = WAL;');
    }
    return ketNoiDb;
}

/**
 * Thực thi câu lệnh SQL trả về danh sách bản ghi (SELECT)
 * @param {string} cauLenhSql - Chuỗi SQL có chứa tham số ?
 * @param {Array} thamSo - Mảng tham số truyền vào Prepared Statement
 * @returns {Promise<Array>} Danh sách các dòng kết quả
 */
async function truyVanDanhSach(cauLenhSql, thamSo = []) {
    const db = layKetNoi();
    const statement = db.prepare(cauLenhSql);
    return statement.all(...thamSo);
}

/**
 * Thực thi câu lệnh SQL trả về một bản ghi duy nhất (SELECT)
 * @param {string} cauLenhSql - Chuỗi SQL
 * @param {Array} thamSo - Mảng tham số
 * @returns {Promise<Object|null>} Bản ghi đầu tiên hoặc null nếu không tìm thấy
 */
async function truyVanMotBanGhi(cauLenhSql, thamSo = []) {
    const db = layKetNoi();
    const statement = db.prepare(cauLenhSql);
    const row = statement.get(...thamSo);
    return row !== undefined ? row : null;
}

/**
 * Thực thi câu lệnh thay đổi dữ liệu (INSERT, UPDATE, DELETE)
 * @param {string} cauLenhSql - Chuỗi SQL
 * @param {Array} thamSo - Mảng tham số
 * @returns {Promise<{changes: number, lastInsertRowid: number|bigint}>}
 */
async function thucThi(cauLenhSql, thamSo = []) {
    const db = layKetNoi();
    const statement = db.prepare(cauLenhSql);
    const ketQua = statement.run(...thamSo);
    return {
        changes: ketQua.changes,
        lastInsertRowid: Number(ketQua.lastInsertRowid)
    };
}

/**
 * Thực thi một tập hợp các thao tác trong một giao dịch (Transaction)
 * Đảm bảo tính nguyên tử (Rule 8.8 & Rule 11.2)
 * @param {Function} hamNghiepVu - Hàm chứa các thao tác cần thực thi nguyên tử
 * @returns {Promise<any>}
 */
async function thucThiGiaoDich(hamNghiepVu) {
    const db = layKetNoi();
    db.exec('BEGIN TRANSACTION;');
    try {
        const ketQua = await hamNghiepVu({
            truyVanDanhSach,
            truyVanMotBanGhi,
            thucThi
        });
        db.exec('COMMIT;');
        return ketQua;
    } catch (loi) {
        db.exec('ROLLBACK;');
        throw loi;
    }
}

/**
 * Khởi tạo cấu trúc bảng, chỉ mục và dữ liệu mẫu nếu chưa có
 */
function khoiTaoCoSoDuLieu() {
    const db = layKetNoi();
    const thuMucDatabase = path.resolve(__dirname, '../../database');

    const tệpTaoBang = path.join(thuMucDatabase, 'taoBang.sql');
    if (fs.existsSync(tệpTaoBang)) {
        const sqlTaoBang = fs.readFileSync(tệpTaoBang, 'utf-8');
        db.exec(sqlTaoBang);
    }

    const tệpChiMuc = path.join(thuMucDatabase, 'chiMuc.sql');
    if (fs.existsSync(tệpChiMuc)) {
        const sqlChiMuc = fs.readFileSync(tệpChiMuc, 'utf-8');
        db.exec(sqlChiMuc);
    }

    const tệpRangBuoc = path.join(thuMucDatabase, 'rangBuoc.sql');
    if (fs.existsSync(tệpRangBuoc)) {
        const sqlRangBuoc = fs.readFileSync(tệpRangBuoc, 'utf-8');
        db.exec(sqlRangBuoc);
    }

    const tệpDuLieuMau = path.join(thuMucDatabase, 'duLieuMau.sql');
    if (fs.existsSync(tệpDuLieuMau)) {
        const sqlDuLieuMau = fs.readFileSync(tệpDuLieuMau, 'utf-8');
        db.exec(sqlDuLieuMau);
    }
}

module.exports = {
    layKetNoi,
    truyVanDanhSach,
    truyVanMotBanGhi,
    thucThi,
    thucThiGiaoDich,
    khoiTaoCoSoDuLieu
};
