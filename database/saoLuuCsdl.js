// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// SCRIPT SAO LƯU CƠ SỞ DỮ LIỆU ĐỊNH KỲ CHO PRODUCTION (DATABASE BACKUP)
// ============================================================================

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const { duongDanCsdl: DUONG_DAN_CSDL_GOC } = require('../backend/cauHinh/cauHinhChung');
const THU_MUC_SAO_LUU = process.env.BACKUP_DIR || path.join(path.dirname(DUONG_DAN_CSDL_GOC), 'saoLuu');

function thucHienSaoLuu() {
  if (!fs.existsSync(DUONG_DAN_CSDL_GOC)) {
    console.error('❌ Không tìm thấy tệp CSDL nguồn tại:', DUONG_DAN_CSDL_GOC);
    return false;
  }

  if (!fs.existsSync(THU_MUC_SAO_LUU)) {
    fs.mkdirSync(THU_MUC_SAO_LUU, { recursive: true });
  }

  const thoiGian = new Date();
  const chuoiThoiGian = thoiGian.toISOString().replace(/[:.]/g, '-');
  const tenTepSaoLuu = `coSoDuLieu_${chuoiThoiGian}.sqlite`;
  const duongDanDich = path.join(THU_MUC_SAO_LUU, tenTepSaoLuu);

  const db = new DatabaseSync(DUONG_DAN_CSDL_GOC, { readOnly: true });
  try {
    db.exec('PRAGMA busy_timeout = 5000');
    db.prepare('VACUUM INTO ?').run(duongDanDich);
  } finally {
    db.close();
  }

  const kichThuocKb = (fs.statSync(duongDanDich).size / 1024).toFixed(2);
  console.log(`✅ Đã sao lưu CSDL thành công: ${tenTepSaoLuu} (${kichThuocKb} KB)`);

  return {
    ok: true,
    tenTep: tenTepSaoLuu,
    duongDan: duongDanDich,
    kichThuocKb
  };
}

if (require.main === module) {
  thucHienSaoLuu();
}

module.exports = { thucHienSaoLuu };
