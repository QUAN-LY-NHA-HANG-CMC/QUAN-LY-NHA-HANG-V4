/**
 * Quản lý kết nối và thực thi truy vấn Cơ sở dữ liệu SQLite
 * Hỗ trợ Prepared Statements chống SQL Injection
 * Tuân thủ Quy chuẩn phát triển toàn dự án
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
        const duongDanCoSoDuLieu = cauHinhChung.coSoDuLieu?.duongDanSqlite || cauHinhChung.duongDanCoSoDuLieu || './database/quan_ly_nha_hang.sqlite';
        const duongDanThuMucDb = path.dirname(path.resolve(duongDanCoSoDuLieu));
        if (!fs.existsSync(duongDanThuMucDb)) {
            fs.mkdirSync(duongDanThuMucDb, { recursive: true });
        }

        ketNoiDb = new DatabaseSync(path.resolve(duongDanCoSoDuLieu));
        ketNoiDb.exec('PRAGMA foreign_keys = ON;');
        ketNoiDb.exec('PRAGMA journal_mode = WAL;');
        ketNoiDb.exec('PRAGMA busy_timeout = 5000;');
    }
    return ketNoiDb;
}

/**
 * Thực thi câu lệnh SQL trả về danh sách bản ghi (SELECT)
 */
function layNhieu(cauLenhSql, thamSo = []) {
    const db = layKetNoi();
    const statement = db.prepare(cauLenhSql);
    return statement.all(...thamSo);
}

const truyVanDanhSach = layNhieu;

/**
 * Thực thi câu lệnh SQL trả về một bản ghi duy nhất (SELECT)
 */
function layMot(cauLenhSql, thamSo = []) {
    const db = layKetNoi();
    const statement = db.prepare(cauLenhSql);
    const row = statement.get(...thamSo);
    return row !== undefined ? row : null;
}

const truyVanMotBanGhi = layMot;

/**
 * Thực thi câu lệnh thay đổi dữ liệu (INSERT, UPDATE, DELETE)
 */
function thucThi(cauLenhSql, thamSo = []) {
    const db = layKetNoi();
    const statement = db.prepare(cauLenhSql);
    const ketQua = statement.run(...thamSo);
    return {
        changes: Number(ketQua.changes),
        lastInsertRowid: Number(ketQua.lastInsertRowid)
    };
}

/**
 * Thực thi câu lệnh SQL thô
 */
function chayTruyVan(cauLenhSql) {
    const db = layKetNoi();
    return db.exec(cauLenhSql);
}

/**
 * Thực thi một tập hợp các thao tác trong một giao dịch (Transaction)
 */
async function thucThiGiaoDich(hamNghiepVu) {
    const db = layKetNoi();
    db.exec('BEGIN TRANSACTION;');
    try {
        const ketQua = await hamNghiepVu({
            truyVanDanhSach,
            truyVanMotBanGhi,
            thucThi,
            layNhieu,
            layMot,
            chayTruyVan
        });
        db.exec('COMMIT;');
        return ketQua;
    } catch (loi) {
        db.exec('ROLLBACK;');
        throw loi;
    }
}

function chayGiaoDich(hamThucThi) {
    const db = layKetNoi();
    db.exec('BEGIN TRANSACTION;');
    try {
        const ketQua = hamThucThi(db);
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

    const tepTaoBang = path.join(thuMucDatabase, 'taoBang.sql');
    if (fs.existsSync(tepTaoBang)) {
        const sqlTaoBang = fs.readFileSync(tepTaoBang, 'utf-8');
        db.exec(sqlTaoBang);
    }

    const tepChiMuc = path.join(thuMucDatabase, 'chiMuc.sql');
    if (fs.existsSync(tepChiMuc)) {
        const sqlChiMuc = fs.readFileSync(tepChiMuc, 'utf-8');
        db.exec(sqlChiMuc);
    }

    const tepRangBuoc = path.join(thuMucDatabase, 'rangBuoc.sql');
    if (fs.existsSync(tepRangBuoc)) {
        const sqlRangBuoc = fs.readFileSync(tepRangBuoc, 'utf-8');
        db.exec(sqlRangBuoc);
    }

    const tepDuLieuMau = path.join(thuMucDatabase, 'duLieuMau.sql');
    if (fs.existsSync(tepDuLieuMau)) {
        const sqlDuLieuMau = fs.readFileSync(tepDuLieuMau, 'utf-8');
        db.exec(sqlDuLieuMau);
    }
}

module.exports = {
    layKetNoi,
    layMot,
    layNhieu,
    truyVanDanhSach,
    truyVanMotBanGhi,
    thucThi,
    chayTruyVan,
    thucThiGiaoDich,
    chayGiaoDich,
    khoiTaoCoSoDuLieu
};
