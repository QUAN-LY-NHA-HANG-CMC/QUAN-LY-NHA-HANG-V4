import React, { useEffect, useState } from 'react';
import { api } from '../dungChung/api';
import { laySocket } from '../dungChung/ketNoiSocket';

const CAC_SU_KIEN = ['connect', 'pos:xu_ly_mon', 'tien_do_mon_an', 'ban:cap_nhat_cong_viec'];

export default function ThongBaoXuLyMonPos() {
  const [danhSach, setDanhSach] = useState([]);
  const [daAn, setDaAn] = useState([]);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');
  useEffect(() => {
    let lanTai = 0;
    const socket = laySocket();
    const nap = async () => {
      const lan = ++lanTai;
      try {
        const data = await api.get('/api/hoa-don/chi-dao-mon');
        if (lan === lanTai) setDanhSach(data);
      } catch {
        if (lan === lanTai) setDanhSach([]);
      }
    };
    CAC_SU_KIEN.forEach(ten => socket.on(ten, nap));
    nap();
    const timer = setInterval(nap, 15000);
    return () => {
      lanTai++;
      clearInterval(timer);
      CAC_SU_KIEN.forEach(ten => socket.off(ten, nap));
    };
  }, []);

  const khoa = muc => `${muc.id}-${muc.buoc}-${muc.trang_thai_mon}`;
  const muc = danhSach.find(mon => !daAn.includes(khoa(mon)));
  if (!muc) return null;
  const kiemTraBung = muc.lua_chon === 'xac_nhan_bung';
  const khongLay = muc.lua_chon === 'khong_lay';
  const canNau = muc.buoc === 'bep' && !khongLay && muc.trang_thai_mon !== 'hoan_thanh';
  const nguon = muc.buoc === 'thu_ngan' ? 'PHỤC VỤ' : muc.buoc === 'phuc_vu' && !kiemTraBung ? 'BẾP' : 'THU NGÂN';
  const tieuDe = kiemTraBung ? 'Kiểm tra món đã bưng' : khongLay ? 'Khách không lấy món' :
    { bep: canNau ? 'Làm xong rồi gói mang về' : 'Gói mang về', phuc_vu: 'Mang món đã gói ra quầy',
      thu_ngan: 'Món đã có tại quầy · Mời khách nhận' }[muc.buoc];
  const nut = khongLay ? 'Xác nhận đã nhận chỉ đạo' :
    { bep: 'Xác nhận đã gói xong', phuc_vu: 'Xác nhận đã đưa ra quầy', thu_ngan: 'Xác nhận đã tiếp nhận' }[muc.buoc];

  const xacNhan = async daBung => {
    if (dangGui) return;
    setDangGui(true);
    setLoi('');
    try {
      await api.put(`/api/hoa-don/chi-dao-mon/${muc.id}`, { buoc: muc.buoc, daBung });
      setDanhSach(cu => cu.filter(mon => khoa(mon) !== khoa(muc)));
    } catch (err) {
      setLoi(err.message);
    } finally { setDangGui(false); }
  };

  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-black/70 p-4">
      <section role="alertdialog" aria-modal="true" aria-labelledby="tieu-de-chi-dao-pos"
        className="w-full max-w-lg space-y-3 rounded-2xl border-4 border-rose-500 bg-white p-6 shadow-xl">
        <p className="font-bold text-rose-700">CHỈ ĐẠO TỪ {nguon}{muc.uu_tien ? ' · ƯU TIÊN' : ''}</p>
        <h2 id="tieu-de-chi-dao-pos" className="text-xl font-black">{tieuDe}</h2>
        <p>{muc.ten_ban} · {muc.ten_mon} × {muc.so_luong} {muc.don_vi_tinh}</p>
        {muc.ghi_chu && <p className="whitespace-pre-wrap text-sm">{muc.ghi_chu}</p>}
        {loi && <p role="alert" className="text-rose-700">{loi}</p>}
        <div className="flex flex-wrap gap-2">
          {kiemTraBung ? (
            <>
              <button disabled={dangGui} onClick={() => xacNhan(true)} className="rounded bg-rose-700 px-3 py-2 font-bold text-white">Đã bưng</button>
              <button disabled={dangGui} onClick={() => xacNhan(false)} className="rounded border px-3 py-2">Chưa bưng</button>
            </>
          ) : canNau ? (
            <button onClick={() => { setLoi(''); setDaAn(cu => [...cu, khoa(muc)]); }}
              className="rounded bg-rose-700 px-3 py-2 font-bold text-white">Về hàng đợi để làm món</button>
          ) : (
            <button disabled={dangGui} onClick={() => xacNhan()} className="rounded bg-rose-700 px-3 py-2 font-bold text-white">{nut}</button>
          )}
        </div>
      </section>
    </div>
  );
}
