import React, { useEffect, useState } from 'react';
import { api } from '../dungChung/api';
import { laySocket } from '../dungChung/ketNoiSocket';
import { hienThiGioVietNam } from '../dungChung/thoiGian';

export default function ThongBaoChiDao({ boPhan }) {
  const [danhSach, setDanhSach] = useState([]);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState('');
  useEffect(() => {
    const socket = laySocket();
    const tenSuKien = 'dieu_phoi:' + boPhan;
    let huy = false;
    const nap = () => api.get('/api/dieu-phoi-bep/lich-su-lenh?boPhan=' + boPhan)
      .then(data => {
        if (!huy) setDanhSach(data.filter(lenh => lenh.trang_thai === 'cho_tiep_nhan' && !lenh.da_tiep_nhan_bo_phan));
      }).catch(() => {});
    nap();
    socket.on('connect', nap);
    socket.on(tenSuKien, nap);
    return () => { huy = true; socket.off('connect', nap); socket.off(tenSuKien, nap); };
  }, [boPhan]);

  const lenh = danhSach[0];
  if (!lenh) return null;
  const xacNhan = async () => {
    if (dangLuu) return;
    setDangLuu(true);
    setLoi('');
    try {
      await api.put('/api/dieu-phoi-bep/lenh/' + lenh.id + '/xac-nhan');
      setDanhSach(cu => cu.filter(muc => muc.id !== lenh.id));
    } catch (err) {
      setLoi(err.message);
    } finally { setDangLuu(false); }
  };
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4">
      <section role="alertdialog" aria-modal="true" aria-labelledby="tieuDeChiDao" className="w-full max-w-lg rounded-2xl border-4 border-rose-500 bg-white p-6 shadow-xl">
        <p className="mb-2 font-bold text-rose-700">CHỈ ĐẠO TỪ QUẢN LÝ · {boPhan === 'phuc_vu' ? 'PHỤC VỤ' : 'THU NGÂN'}</p>
        <h2 id="tieuDeChiDao" className="text-xl font-black">{lenh.tieu_de}</h2>
        <p className="mt-2 whitespace-pre-wrap">{lenh.noi_dung}</p>
        <p className="mt-2 text-sm text-stone-600">{[lenh.ten_ban, hienThiGioVietNam(lenh.thoi_gian_tao)].filter(Boolean).join(' · ')}</p>
        {loi && <p role="alert" className="mt-2 text-rose-700">{loi}</p>}
        <button autoFocus type="button" disabled={dangLuu} onClick={xacNhan}
          className="mt-4 rounded-lg bg-rose-700 px-4 py-2 font-bold text-white disabled:opacity-50">Xác nhận đã tiếp nhận</button>
      </section>
    </div>
  );
}
