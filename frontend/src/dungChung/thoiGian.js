const DINH_DANG = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'medium'
});
const NGAY_VIET_NAM = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });

export function ngayVietNam(moc = Date.now()) {
  return NGAY_VIET_NAM.format(moc);
}

export function docMocThoiGian(giaTri) {
  const chuoi = typeof giaTri === 'string' && /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(giaTri)
    ? giaTri.replace(' ', 'T') + 'Z' : giaTri;
  return new Date(chuoi);
}

export function hienThiGioVietNam(giaTri) {
  if (!giaTri) return '—';
  const moc = docMocThoiGian(giaTri);
  return Number.isNaN(moc.getTime()) ? '—' : DINH_DANG.format(moc);
}

export function hienThiCaDangLam(ca) {
  if (!ca) return '';
  const tenCa = { ca_sang: 'Ca sáng', ca_chieu: 'Ca chiều', ca_toi: 'Ca tối', ca_gay: 'Ca gãy' };
  return `${tenCa[ca.ten_ca] ?? 'Ca làm'} · ${ca.gio_bat_dau.slice(0, 5)} – ${ca.gio_ket_thuc.slice(0, 5)}`;
}

export function trongKhungGioCa(ca, bayGio) {
  const moc = gio => Date.parse(ca.ngay_lam + 'T' + (gio.length === 5 ? gio + ':00' : gio) + '+07:00');
  const batDau = moc(ca.gio_bat_dau);
  const ketThuc = moc(ca.gio_ket_thuc);
  return bayGio >= batDau && bayGio < (ketThuc < batDau ? ketThuc + 86400000 : ketThuc);
}
