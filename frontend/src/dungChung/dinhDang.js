// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// HÀM TIỆN ÍCH ĐỊNH DẠNG TIỀN TỆ, THỜI GIAN
// ============================================================================

export function dinhDangTien(soTien) {
  if (soTien === undefined || soTien === null || isNaN(soTien)) return '0đ';
  return Number(soTien).toLocaleString('vi-VN') + 'đ';
}

export function dinhDangGio(chuoiNgay) {
  if (!chuoiNgay) return '--:--';
  const d = new Date(chuoiNgay);
  if (isNaN(d.getTime())) return chuoiNgay;
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function dinhDangNgay(chuoiNgay) {
  if (!chuoiNgay) return '';
  const d = new Date(chuoiNgay);
  if (isNaN(d.getTime())) return chuoiNgay;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function tinhPhutTroiQua(thoiGianBatDau) {
  if (!thoiGianBatDau) return 0;
  const start = new Date(thoiGianBatDau).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - start) / 60000));
}
