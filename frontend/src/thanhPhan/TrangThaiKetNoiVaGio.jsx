import React, { useEffect, useState } from 'react';
import { laySocket } from '../dungChung/ketNoiSocket';

const gio = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
const ngay = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' });

export default function TrangThaiKetNoiVaGio({ giaoDienToi = false }) {
  const [bayGio, setBayGio] = useState(Date.now);
  const [ketNoi, setKetNoi] = useState('Đang kết nối');

  useEffect(() => {
    const socket = laySocket();
    const daKetNoi = () => setKetNoi('Đã kết nối');
    const matKetNoi = () => setKetNoi('Mất kết nối');
    if (socket.connected) daKetNoi();
    socket.on('connect', daKetNoi);
    socket.on('disconnect', matKetNoi);
    socket.on('connect_error', matKetNoi);
    const dongHo = setInterval(() => setBayGio(Date.now()), 1000);
    return () => {
      clearInterval(dongHo);
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
