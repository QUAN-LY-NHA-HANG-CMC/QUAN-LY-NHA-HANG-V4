import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../../dungChung/api';
import { dinhDangTien } from '../../dungChung/dinhDang';

function taoMaDotThu() {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}

export default function ModalThuMotPhan({ hoaDon, phuongThuc, chanThu, onDong, onDaThu }) {
  const [soTienNhap, setSoTienNhap] = useState('');
  const [qr, setQr] = useState(null);
  const [maYeuCau, setMaYeuCau] = useState(taoMaDotThu);
  const [dangLuu, setDangLuu] = useState(false);
  const [daGuiThu, setDaGuiThu] = useState(false);
  const [loi, setLoi] = useState('');
  const soTien = Number(soTienNhap);
  const vietQr = phuongThuc === 'vietqr';
  const hopLe = Number.isSafeInteger(soTien) && soTien > 0 && soTien <= hoaDon.conPhaiThu;
  const endpoint = `/api/hoa-don/${hoaDon.id}`;
  const thaoTac = async () => {
    if (dangLuu || !hopLe || (chanThu && !daGuiThu)) return;
    setDangLuu(true);
    setLoi('');
    try {
      if (vietQr && !qr) {
        setQr(await api.post(`${endpoint}/qr-mot-phan`, { soTien, maYeuCau }));
      } else {
        setDaGuiThu(true);
        const phieu = await api.post(`${endpoint}/thu-mot-phan`, { soTien, maYeuCau, phuongThuc });
        onDaThu(phieu);
      }
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangLuu(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <section role="dialog" aria-modal="true" aria-label="Thanh toán, giữ bàn mở"
        className="max-h-[95vh] w-full max-w-md space-y-4 overflow-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Thanh toán, giữ bàn mở · {vietQr ? 'VietQR' : 'Tiền mặt'}</h2>
          <button aria-label="Đóng" onClick={onDong} disabled={dangLuu}><X size={20} /></button>
        </div>
        <dl className="space-y-2 rounded-xl bg-stone-100 p-3 text-sm">
          <div className="flex justify-between"><dt>Tổng bill</dt><dd>{dinhDangTien(hoaDon.tong_tien_thanh_toan)}</dd></div>
          <div className="flex justify-between"><dt>Đã thu trước</dt><dd>{dinhDangTien(hoaDon.daThu)}</dd></div>
          <div className="flex justify-between"><dt>Còn phải thu sau lần này</dt>
            <dd className="font-bold">{dinhDangTien(hoaDon.conPhaiThu - (hopLe ? soTien : 0))}</dd></div>
        </dl>
        <label className="block text-sm font-semibold">
          {vietQr ? 'Số tiền chuyển khoản' : 'Tiền khách trả lần này'}
          <input autoFocus type="number" min="1" max={hoaDon.conPhaiThu} step="1" value={soTienNhap}
            disabled={dangLuu || !!qr || daGuiThu} onChange={e => setSoTienNhap(e.target.value)}
            className="mt-1 w-full rounded-xl border p-3 text-lg" />
        </label>
        {!!soTienNhap && !hopLe && <p className="text-sm text-rose-800">Nhập số tiền lớn hơn 0 và không vượt số tiền còn phải thu.</p>}
        {qr && <div className="text-center text-sm">
          <img className="mx-auto size-44 object-contain" src={qr.qrUrl} alt="Mã VietQR cho khoản trả một phần" />
          <p>Đối chiếu {dinhDangTien(soTien)} và nội dung <strong>{qr.noiDung}</strong> trước khi xác nhận.</p>
          <button className="mt-2 underline" disabled={dangLuu || daGuiThu} onClick={() => {
            setQr(null);
            setMaYeuCau(taoMaDotThu());
          }}>Đổi số tiền</button>
        </div>}
        <p className="text-sm text-stone-600">Bàn vẫn mở để tiếp tục phục vụ.</p>
        {(loi || chanThu) && <p role="alert" className="text-sm text-rose-800">{loi || chanThu}</p>}
        <button disabled={!hopLe || dangLuu || (Boolean(chanThu) && !daGuiThu)} onClick={thaoTac}
          className="w-full rounded-xl bg-emerald-900 p-3 font-bold text-white disabled:opacity-50">
          {vietQr && !qr ? 'Tạo mã VietQR' : 'Xác nhận đã nhận tiền và xem phiếu thu'}
        </button>
      </section>
    </div>
  );
}
