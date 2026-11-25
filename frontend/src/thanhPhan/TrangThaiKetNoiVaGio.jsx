import React, { useEffect, useState } from 'react';
import { laySocket } from '../dungChung/ketNoiSocket';
import { api } from '../dungChung/api';

const gio = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const ngay = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' });

export default function TrangThaiKetNoiVaGio({ giaoDienToi = false }) {
  const [bayGio, setBayGio] = useState(Date.now);
  const [ketNoi, setKetNoi] = useState('Đang kết nối');

  useEffect(() => {
    const socket = laySocket();
    let daDong = false;
    let moc = Date.now() - performance.now();
    const dongBoGio = async () => {
      const batDau = performance.now();
      try {
        const { thoiGianMayChu } = await api.get('/api/kiem-tra-suc-khoe');
        const gioMayChu = Date.parse(thoiGianMayChu);
        if (daDong || !Number.isFinite(gioMayChu)) return;
        moc = gioMayChu - (batDau + performance.now()) / 2;
        setBayGio(moc + performance.now());
      } catch {
        // Tiếp tục chạy từ mốc đồng bộ gần nhất khi mất mạng.
      }
    };
    const daKetNoi = () => { setKetNoi('Đã kết nối'); dongBoGio(); };
    const matKetNoi = () => setKetNoi('Mất kết nối');
    if (socket.connected) daKetNoi();
    else dongBoGio();
    socket.on('connect', daKetNoi);
    socket.on('disconnect', matKetNoi);
    socket.on('connect_error', matKetNoi);
    const dongHo = setInterval(() => setBayGio(moc + performance.now()), 1000);
    const henDongBo = setInterval(dongBoGio, 60000);
    return () => {
      daDong = true;
      clearInterval(dongHo);
      clearInterval(henDongBo);
      socket.off('connect', daKetNoi);
      socket.off('disconnect', matKetNoi);
      socket.off('connect_error', matKetNoi);
    };
  }, []);

  const dangKetNoi = ketNoi === 'Đã kết nối';
  return (
    <div className={`flex flex-wrap items-center gap-1.5 font-medium ${giaoDienToi ? 'text-[#d8ead9]' : 'text-stone-600'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dangKetNoi ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      <span role="status">{ketNoi}</span>
      <span aria-hidden="true" className={giaoDienToi ? 'text-white/30' : 'text-stone-300'}>|</span>
      <time title="Giờ Việt Nam" dateTime={new Date(bayGio).toISOString()} className="whitespace-nowrap">
        {gio.format(bayGio)} · {ngay.format(bayGio)}
      </time>
    </div>
  );
}
