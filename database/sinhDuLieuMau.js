// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// HÀM VÀ SCRIPT SINH DỮ LIỆU MẪU CHUẨN FIGMA (SEED SAMPLE DATA)
// ============================================================================

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const cauHinh = require('../backend/cauHinh/cauHinhChung');

const DUONG_DAN_CSDL = cauHinh.duongDanCsdl;
const DUONG_DAN_TAO_BANG = path.join(__dirname, 'taoBang.sql');
const DUONG_DAN_DU_LIEU_MAU = path.join(__dirname, 'duLieuMau.sql');

/**
 * Sinh dữ liệu mẫu chuẩn hóa 100% khớp thiết kế Figma
 * @returns {{ ok: boolean, msg: string, thongKe: Object }}
 */
function sinhDuLieuMau() {
  const db = new DatabaseSync(DUONG_DAN_CSDL);
  try {
  db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; BEGIN IMMEDIATE');

  // Kiểm tra bảng, nếu chưa có bảng thì chạy taoBang.sql
  const bangCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='vai_tro';").get();
  if (!bangCheck) {
    const noiDungTaoBang = fs.readFileSync(DUONG_DAN_TAO_BANG, 'utf-8');
    db.exec(noiDungTaoBang);
  }

  if (db.prepare('SELECT 1 FROM tai_khoan LIMIT 1').get() ||
      db.prepare('SELECT 1 FROM vai_tro LIMIT 1').get()) {
    throw new Error('Seed toàn bộ chỉ dùng cho CSDL mới. CSDL này đã có tài khoản hoặc vai trò.');
  }

  // 2. Nạp dữ liệu mẫu chuẩn hóa từ duLieuMau.sql
  const noiDungDuLieuMau = fs.readFileSync(DUONG_DAN_DU_LIEU_MAU, 'utf-8');
  db.exec(noiDungDuLieuMau);

  // 3. Kiểm tra khóa ngoại sau khi nạp
  const fkCheck = db.prepare('PRAGMA foreign_key_check;').all();
  if (fkCheck.length > 0) {
    throw new Error('Lỗi khóa ngoại sau khi nạp dữ liệu mẫu: ' + JSON.stringify(fkCheck));
  }

  // 4. Lấy số lượng thống kê
  const soBan = db.prepare('SELECT COUNT(*) as c FROM ban_an;').get().c;
  const soMon = db.prepare('SELECT COUNT(*) as c FROM mon_an;').get().c;
  const soNv = db.prepare('SELECT COUNT(*) as c FROM nhan_vien;').get().c;
  const soPhien = db.prepare('SELECT COUNT(*) as c FROM phien_ban;').get().c;

  db.exec('COMMIT');
  return {
    ok: true,
    msg: 'Đã sinh dữ liệu mẫu chuẩn Figma thành công!',
    thongKe: {
      soBan,
      soMon,
      soNhanVien: soNv,
      soPhienBan: soPhien
    }
  };
  } catch (loi) {
    if (db.isTransaction) db.exec('ROLLBACK');
    throw loi;
  } finally {
    db.close();
  }
}

// Nếu thực thi từ dòng lệnh: node database/sinhDuLieuMau.js
if (require.main === module) {
  console.log('\n🌱 Bắt đầu sinh dữ liệu mẫu chuẩn Figma cho Quán Mộc POS...');
  const kq = sinhDuLieuMau();
  console.log(`✅ ${kq.msg}`);
  console.log('📊 Thống kê dữ liệu đã sinh:', kq.thongKe);
  console.log('');
}

module.exports = { sinhDuLieuMau };
