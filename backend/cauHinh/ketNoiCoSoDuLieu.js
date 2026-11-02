const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const cauHinhChung = require('./cauHinhChung.js');
const ghiNhatKy = require('../tienIch/ghiNhatKy.js');

// Đảm bảo thư mục database tồn tại
const thuMucDb = path.dirname(cauHinhChung.duongDanCoSoDuLieu);
if (!fs.existsSync(thuMucDb)) {
    fs.mkdirSync(thuMucDb, { recursive: true });
}

let db = null;

function layKetNoi() {
    if (!db) {
        db = new DatabaseSync(cauHinhChung.duongDanCoSoDuLieu);
        db.exec('PRAGMA foreign_keys = ON;');
        db.exec('PRAGMA journal_mode = WAL;');
    }
    return db;
}

function layMot(sql, thamSo = []) {
    const ketNoi = layKetNoi();
    const lenh = ketNoi.prepare(sql);
    return lenh.get(...thamSo);
}

function layNhieu(sql, thamSo = []) {
    const ketNoi = layKetNoi();
    const lenh = ketNoi.prepare(sql);
    return lenh.all(...thamSo);
}

function thucThi(sql, thamSo = []) {
    const ketNoi = layKetNoi();
    const lenh = ketNoi.prepare(sql);
    return lenh.run(...thamSo);
}

function chayTruyVan(sql) {
    const ketNoi = layKetNoi();
    return ketNoi.exec(sql);
}

function chayGiaoDich(hamThucThi) {
    const ketNoi = layKetNoi();
    ketNoi.exec('BEGIN TRANSACTION;');
    try {
        const ketQua = hamThucThi(ketNoi);
        ketNoi.exec('COMMIT;');
        return ketQua;
    } catch (loi) {
        ketNoi.exec('ROLLBACK;');
        throw loi;
    }
}

async function khoiTaoCoSoDuLieu() {
    try {
        const duongDanTaoBang = path.resolve(__dirname, '../../database/taoBang.sql');
        const duongDanChiMuc = path.resolve(__dirname, '../../database/chiMuc.sql');
        const duongDanRangBuoc = path.resolve(__dirname, '../../database/rangBuoc.sql');
        const duongDanDuLieuMau = path.resolve(__dirname, '../../database/duLieuMau.sql');

        if (fs.existsSync(duongDanTaoBang)) {
            const sqlTaoBang = fs.readFileSync(duongDanTaoBang, 'utf8');
            chayTruyVan(sqlTaoBang);
        }

        if (fs.existsSync(duongDanChiMuc)) {
            const sqlChiMuc = fs.readFileSync(duongDanChiMuc, 'utf8');
            chayTruyVan(sqlChiMuc);
        }

        if (fs.existsSync(duongDanRangBuoc)) {
            const sqlRangBuoc = fs.readFileSync(duongDanRangBuoc, 'utf8');
            chayTruyVan(sqlRangBuoc);
        }

        if (fs.existsSync(duongDanDuLieuMau)) {
            const sqlDuLieuMau = fs.readFileSync(duongDanDuLieuMau, 'utf8');
            chayTruyVan(sqlDuLieuMau);
        }

        ghiNhatKy.ghiThongTin('Khởi tạo cơ sở dữ liệu thành công.');
        return true;
    } catch (loi) {
        ghiNhatKy.ghiLoi('Lỗi khi khởi tạo cơ sở dữ liệu', loi);
        throw loi;
    }
}

module.exports = {
    layKetNoi,
    layMot,
    layNhieu,
    thucThi,
    chayTruyVan,
    chayGiaoDich,
    khoiTaoCoSoDuLieu
};
