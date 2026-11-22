import React, { useEffect, useState } from 'react';
import HeaderKhach from '../../thanhPhan/HeaderKhach';

const THONG_BAO = {
  chua_mo: 'Bàn chưa mở. Vui lòng nhờ phục vụ mở bàn.',
  cho_duyet: 'Đang chờ xác nhận tham gia bàn.',
  cho_ma: 'Nhập mã hiển thị trên thiết bị đầu tiên.',
  tu_choi: 'Yêu cầu tham gia bị từ chối.',
  het_han: 'Yêu cầu hoặc mã tham gia đã hết hạn.',
  chua_gui: 'Phiên bàn mới đã sẵn sàng.'
};

export default function TrangThamGiaBan({ ban, thamGia, onDangNhap }) {
  const [ma, setMa] = useState('');
  const trangThai = thamGia.phien?.trangThai;

  return (
    <div className="mx-auto min-h-screen max-w-[430px] bg-[#f9f7f2]">
      <HeaderKhach ban={ban} tieuDe="Tham gia bàn" />
      <main className="space-y-4 p-5">
        <p className="font-semibold">{THONG_BAO[trangThai] || 'Đang kiểm tra phiên bàn…'}</p>
        {trangThai === 'cho_duyet' && <p>Đối chiếu mã thiết bị <strong className="font-mono">{thamGia.phien.id}</strong> với phục vụ hoặc khách đã ở bàn.</p>}
        {trangThai === 'cho_ma' && (
          <form className="space-y-3" onSubmit={event => { event.preventDefault(); thamGia.nhapMa(ma); }}>
            <label htmlFor="ma-tham-gia" className="block font-medium">Mã tham gia</label>
            <input id="ma-tham-gia" className="w-full rounded-lg border p-3 font-mono" value={ma}
              onChange={event => setMa(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="off" />
            <button disabled={ma.length !== 6} className="w-full rounded-lg bg-[#b64d2d] px-3 py-2 text-white disabled:opacity-50">Xác nhận mã</button>
          </form>
        )}
        {['het_han', 'tu_choi', 'chua_gui'].includes(trangThai) &&
          <button onClick={() => { setMa(''); thamGia.guiLai(); }} className="rounded-lg bg-[#b64d2d] px-3 py-2 text-white">Gửi yêu cầu tham gia</button>}
        {thamGia.loi && <p role="alert" className="text-sm text-red-700">{thamGia.loi}</p>}
        <button className="block text-sm underline" onClick={onDangNhap}>Đăng nhập nhân viên</button>
      </main>
    </div>
  );
}

export function ThongBaoThamGia({ thamGia }) {
  const [now, setNow] = useState(Date.now);
  const yeuCau = thamGia.phien?.yeuCau;
  const coMa = yeuCau?.some(muc => muc.maMoi);
  const gioMayChu = Math.max(Date.now(), now) + (thamGia.phien?.chenhGio ?? 0);
  useEffect(() => {
    if (!coMa) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [coMa]);
  if (!yeuCau?.length) return null;

  return (
    <aside aria-label="Yêu cầu tham gia bàn" aria-live="polite"
      className="fixed left-1/2 top-4 z-[80] max-h-[75vh] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 space-y-2 overflow-auto rounded-xl border border-[#d9b696] bg-white p-4 shadow-xl">
      <h2 className="font-bold">Có thiết bị muốn tham gia bàn</h2>
      {yeuCau.map(muc => (
        <div key={muc.id} className="space-y-1 border-t pt-2 text-sm">
          <p>Thiết bị <strong className="font-mono">{muc.id}</strong></p>
          {muc.maMoi ? (
            <div>
              <p>Mã tham gia <strong className="font-mono text-lg tracking-wider">{muc.hetHan > gioMayChu ? muc.maMoi : 'Hết hạn'}</strong></p>
              <p>Còn {Math.min(40, Math.max(0, Math.ceil((muc.hetHan - gioMayChu) / 1000)))} giây</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => thamGia.quyetDinh(muc.id, true)} className="rounded bg-[#226b4c] px-3 py-2 text-white">Thêm vào</button>
              <button onClick={() => thamGia.quyetDinh(muc.id, false)} className="rounded border px-3 py-2">Từ chối</button>
            </div>
          )}
        </div>
      ))}
      {thamGia.loi && <p role="alert" className="text-sm text-red-700">{thamGia.loi}</p>}
    </aside>
  );
}
