const { DatabaseSync } = require('node:sqlite');
const cauHinh = require('../backend/cauHinh/cauHinhChung');

const BANG_GIAO_DICH = [
  'tiep_nhan_viec_ban', 'gio_mon_ban', 'lenh_dieu_phoi', 'danh_gia', 'chia_tien_nhom', 'giao_dich_thanh_toan',
  'chi_tiet_hoa_don', 'hoa_don', 'yeu_cau_huy_mon_khach', 'yeu_cau_huy_mon', 'yeu_cau_ho_tro', 'chi_tiet_don_mon',
  'don_goi_mon', 'thiet_bi_phien_ban', 'phien_ban', 'yeu_cau_doi_ca', 'ca_lam_viec', 'phan_cong_ban',
  'nhat_ky_kiem_toan', 'phieu_thu_chi_noi_bo'
];
const BANG_DANH_MUC = [
  'combo_chi_tiet', 'mon_an', 'danh_muc_mon', 'ban_an', 'khu_vuc', 'cau_hinh_nha_hang'
];

/** Dọn dữ liệu vận hành hoặc xóa trắng và giữ tài khoản quản lý. */
function lamSachDuLieu({ toanBo = false } = {}) {
  const db = new DatabaseSync(cauHinh.duongDanCsdl);
  try {
    db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; BEGIN IMMEDIATE; PRAGMA defer_foreign_keys=ON');
    if (toanBo && !db.prepare(`
      SELECT 1 FROM tai_khoan t JOIN vai_tro v ON v.id=t.vai_tro_id
      JOIN nhan_vien n ON n.tai_khoan_id=t.id
      WHERE v.ma_vai_tro='quan_ly' AND t.trang_thai='hoat_dong' AND n.trang_thai='dang_lam'
    `).get()) {
      throw new Error('Cần có tài khoản quản lý đang hoạt động trước khi xóa trắng.');
    }

    const coBang = db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?");
    const bangDaXoa = [...BANG_GIAO_DICH, ...(toanBo ? BANG_DANH_MUC : [])].filter(ten => coBang.get(ten));
    for (const ten of bangDaXoa) db.exec('DELETE FROM ' + ten);
    if (toanBo) {
      const vaiTro = "(SELECT id FROM vai_tro WHERE ma_vai_tro='quan_ly')";
      db.exec(`
        DELETE FROM nhan_vien WHERE tai_khoan_id IS NULL OR tai_khoan_id IN
          (SELECT id FROM tai_khoan WHERE vai_tro_id != ${vaiTro});
        DELETE FROM tai_khoan WHERE vai_tro_id != ${vaiTro};
      `);
    } else if (coBang.get('ban_an')) {
      db.exec("UPDATE ban_an SET trang_thai='trong' WHERE trang_thai!='trong'");
    }

    if (db.prepare('PRAGMA foreign_key_check').get()) {
      throw new Error('Dữ liệu còn lỗi khóa ngoại. Đã hủy thao tác dọn.');
    }
    db.exec('COMMIT');
    return {
      ok: true,
      msg: toanBo ? 'Đã xóa trắng dữ liệu và giữ tài khoản quản lý' : 'Đã làm sạch dữ liệu giao dịch và đơn món',
      bangDaXoa
    };
  } catch (loi) {
    if (db.isTransaction) db.exec('ROLLBACK');
    throw loi;
  } finally {
    db.close();
  }
}

if (require.main === module) {
  try {
    const toanBo = process.argv.includes('--toan-bo') || process.argv.includes('-all');
    console.log(lamSachDuLieu({ toanBo }).msg);
  } catch (loi) {
    console.error(loi.message);
    process.exitCode = 1;
  }
}

module.exports = { lamSachDuLieu };
