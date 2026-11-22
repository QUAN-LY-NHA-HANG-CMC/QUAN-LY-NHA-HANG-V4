const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync, rmdirSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const thuMuc = mkdtempSync(path.join(tmpdir(), 'quan-moc-migration-'));
const tepMoi = path.join(thuMuc, 'moi.sqlite');
const tepCu = path.join(thuMuc, 'cu.sqlite');
const ddlSql = readFileSync(path.join(__dirname, 'taoBang.sql'), 'utf8');
const duLieuMau = readFileSync(path.join(__dirname, 'duLieuMau.sql'), 'utf8');
const thuMucDuAn = path.join(__dirname, '..');

function khoiDongBackend(tep) {
    execFileSync(process.execPath, ['-e', "require('./backend/cauHinh/ketNoiCoSoDuLieu').db.close()"], {
        cwd: thuMucDuAn,
        env: { ...process.env, DB_PATH: tep, NODE_ENV: 'test' }
    });
}

function schema(db) {
    const bang = db.prepare("SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
    const cot = db.prepare('SELECT name, type, "notnull", dflt_value, pk FROM pragma_table_info(?) ORDER BY name');
    const fk = db.prepare('SELECT * FROM pragma_foreign_key_list(?) ORDER BY id, seq');
    const idx = db.prepare('SELECT name, "unique", origin, partial FROM pragma_index_list(?) ORDER BY name');
    const dinhNghiaIndex = db.prepare('SELECT sql FROM sqlite_schema WHERE type = \'index\' AND name = ?');
    return bang.map(({ name }) => ({
        name, cot: cot.all(name), fk: fk.all(name),
        index: idx.all(name).map(muc => ({ ...muc, sql: dinhNghiaIndex.get(muc.name)?.sql }))
    }));
}

function duLieu(db, cacBang) {
    return cacBang.map(({ name, cot }) => db.prepare(`SELECT ${cot.map(muc => `"${muc.name}"`).join(', ')}
        FROM "${name}" ORDER BY rowid`).all());
}

try {
    const dbCu = new DatabaseSync(tepCu);
    const ddl = new DatabaseSync(':memory:');
    let schemaDdl, schemaCu, duLieuCu;
    try {
        ddl.exec(ddlSql);
        schemaDdl = schema(ddl);
        dbCu.exec(ddlSql);
        dbCu.exec(duLieuMau);
        // Phục dựng các bảng đã có trước khi thêm cột và chỉ mục.
        dbCu.exec(`
            DROP TABLE yeu_cau_huy_mon_khach;
            ALTER TABLE don_goi_mon DROP COLUMN thiet_bi_tao_id;
            DROP TABLE thiet_bi_phien_ban;
            DROP INDEX idx_don_goi_mon_khoa_gui;
            ALTER TABLE don_goi_mon DROP COLUMN khoa_gui;
            ALTER TABLE mon_an DROP COLUMN so_suat_con_lai;
            ALTER TABLE yeu_cau_huy_mon DROP COLUMN trang_thai_mon_cu;
            ALTER TABLE ca_lam_viec DROP COLUMN thoi_gian_checkin;
            ALTER TABLE ca_lam_viec DROP COLUMN thoi_gian_checkout;
            ALTER TABLE chi_tiet_don_mon DROP COLUMN thoi_gian_phuc_vu;
            ALTER TABLE nhan_vien DROP COLUMN ngay_luu_tru;
        `);
        schemaCu = schema(dbCu);
        duLieuCu = duLieu(dbCu, schemaCu);
    } finally {
        ddl.close();
        dbCu.close();
    }

    khoiDongBackend(tepMoi);
    const dbMoi = new DatabaseSync(tepMoi, { readOnly: true });
    try {
        assert.deepEqual(schema(dbMoi), schemaDdl, 'Schema cài mới phải khớp DDL');
    } finally {
        dbMoi.close();
    }

    let duLieuDaNangCap;
    for (let lan = 1; lan <= 2; lan++) {
        khoiDongBackend(tepCu);
        const migrated = new DatabaseSync(tepCu, { readOnly: true });
        try {
            assert.deepEqual(schema(migrated), schemaDdl, 'Schema nâng cấp phải khớp cài mới');
            assert.deepEqual(duLieu(migrated, schemaCu), duLieuCu, 'Dữ liệu lịch sử phải được giữ nguyên');
            assert.deepEqual(migrated.prepare('PRAGMA foreign_key_check').all(), []);
            assert.equal(migrated.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
            const duLieuHienTai = duLieu(migrated, schemaDdl);
            if (lan === 2) assert.deepEqual(duLieuHienTai, duLieuDaNangCap, 'Chạy lại không được đổi dữ liệu');
            duLieuDaNangCap = duLieuHienTai;
        } finally {
            migrated.close();
        }
    }
    console.log(`Migration SQLite đạt: ${schemaDdl.length} bảng, schema cài mới và nâng cấp khớp nhau, dữ liệu giữ nguyên sau hai lần chạy.`);
} finally {
    // Chỉ dọn các tệp trong thư mục tạm do bài kiểm thử tạo.
    rmSync(tepCu, { force: true });
    rmSync(tepMoi, { force: true });
    rmdirSync(thuMuc);
}
