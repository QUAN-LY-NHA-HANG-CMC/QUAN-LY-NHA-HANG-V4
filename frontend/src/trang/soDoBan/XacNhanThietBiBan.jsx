import React, { useEffect, useState } from 'react';
import { api } from '../../dungChung/api';

export default function XacNhanThietBiBan({ banId, trangThaiBan }) {
  const [yeuCau, setYeuCau] = useState([]);
  const [soKhach, setSoKhach] = useState(2);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState('');
  const [daMo, setDaMo] = useState(false);
  const url = `/api/ban-an/${banId}/thiet-bi-cho`;
  useEffect(() => {
    let dung = false;
    const nap = () => api.get(url).then(data => { if (!dung) setYeuCau(data); }).catch(() => {});
    nap();
    const timer = setInterval(nap, 2500);
    return () => { dung = true; clearInterval(timer); };
  }, [url]);

  const luu = async thaoTac => {
    if (dangLuu) return;
    setDangLuu(true);
    setLoi('');
    try {
      await thaoTac();
      setYeuCau(await api.get(url));
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangLuu(false);
    }
  };

  if (trangThaiBan !== 'trong' && !yeuCau.length && !loi) return null;
  return (
    <section className="space-y-2 rounded-xl border bg-white p-3 text-sm">
      <h2 className="font-bold">Thiết bị khách tại bàn</h2>
      {trangThaiBan === 'trong' && !daMo && (
        <form className="flex items-center gap-2" onSubmit={event => {
          event.preventDefault();
          luu(async () => { await api.post(`/api/ban-an/${banId}/mo-ban`, { soKhach }); setDaMo(true); });
        }}>
          <label htmlFor="so-khach-mo-ban">Số khách</label>
          <input id="so-khach-mo-ban" className="w-16 rounded border p-1" type="number" min="1" max="100" required
            value={soKhach} onChange={event => setSoKhach(Number(event.target.value))} />
          <button disabled={dangLuu} className="rounded border px-2 py-1">Mở bàn</button>
        </form>
      )}
      {daMo && <p>Bàn đã mở. Mời khách quét QR.</p>}
      {yeuCau.length > 0 && <p>Đối chiếu mã hiển thị trên điện thoại khách đang ngồi tại bàn.</p>}
      {yeuCau.map(({ id }) => (
        <div className="flex items-center justify-between gap-2" key={id}>
          <strong className="font-mono">{id}</strong>
          <button disabled={dangLuu} className="rounded border px-2 py-1"
            onClick={() => luu(() => api.put(`${url}/${id}/chu`))}>Xác nhận thiết bị đầu tiên</button>
        </div>
      ))}
      {loi && <p role="alert" className="text-red-700">{loi}</p>}
    </section>
  );
}
