import React, { useState } from 'react';
import { api } from '../../dungChung/api';

const TEN = {
  cho_duyet: 'Chờ nấu', dang_nau: 'Đang nấu', hoan_thanh: 'Chờ bưng',
  yeu_cau_huy: 'Chờ quản lý duyệt hủy', da_phuc_vu: 'Đã lên bàn'
};
const DA_XU_LY = { goi_mang_ve: 'Gói mang về', khong_lay: 'Không lấy, vẫn trả tiền' };

function LuaChon({ mon, banId, onDong, onDaXuLy }) {
  const [luaChon, setLuaChon] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [soLuong, setSoLuong] = useState(mon.so_luong);
  const [uuTien, setUuTien] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');
  const trangThai = mon.trang_thai_mon;
  const luaChonGoi = { cho_duyet: 'Làm rồi gói', dang_nau: 'Làm xong rồi gói', hoan_thanh: 'Gói mang về' };
  const cacLuaChon = [
    ['goi_mang_ve', luaChonGoi[trangThai]],
    ['dung_tai_ban', 'Vẫn dùng tại bàn'],
    ...(trangThai === 'hoan_thanh' ? [['xac_nhan_bung', 'Nhờ phục vụ xác nhận đã bưng']] : []),
    ['khong_lay', 'Không lấy nhưng vẫn trả tiền'],
    ['huy', trangThai === 'cho_duyet' ? 'Yêu cầu hủy để bỏ khỏi bill' : 'Gửi quản lý duyệt hủy']
  ];
  const gui = async event => {
    event.preventDefault();
    setDangGui(true);
    setLoi('');
    try {
      await api.post(`/api/hoa-don/ban/${banId}/mon/${mon.id}/xu-ly`, {
        luaChon, trangThai, soLuong: Number(soLuong), soLuongHienTai: mon.so_luong, ghiChu, uuTien
      });
      onDaXuLy();
      onDong();
    } catch (err) {
      setLoi(err.message);
      onDaXuLy();
    } finally { setDangGui(false); }
  };
  return (
    <form onSubmit={gui} className="mt-2 space-y-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
      <h5 className="font-bold">{mon.ten_mon} × {mon.so_luong} {mon.don_vi_tinh} · {TEN[trangThai]}</h5>
      {mon.so_luong > 1 && <label className="flex items-center gap-2">
        Số lượng xử lý
        <input type="number" min="1" max={mon.so_luong} required value={soLuong}
          className="w-16 rounded border bg-white p-1" onChange={event => setSoLuong(event.target.value)} /> {mon.don_vi_tinh}
      </label>}
      {cacLuaChon.map(([id, nhan]) => (
        <label key={id} className="flex items-center gap-2 py-0.5">
          <input type="radio" name={`xu-ly-${mon.id}`} checked={luaChon === id} onChange={() => setLuaChon(id)} /> {nhan}
        </label>
      ))}
      {luaChon === 'goi_mang_ve' && trangThai !== 'hoan_thanh' && <label className="flex items-center gap-2">
        <input type="checkbox" checked={uuTien} onChange={e => setUuTien(e.target.checked)} /> Báo bếp ưu tiên
      </label>}
      <input className="w-full rounded border bg-white p-2" value={ghiChu} maxLength={300}
        aria-label="Ghi chú hoặc lý do hủy" placeholder={luaChon === 'huy' ? 'Nhập lý do hủy' : 'Ghi chú (nếu có)'}
        onChange={event => setGhiChu(event.target.value)} />
      {loi && <p role="alert" className="text-rose-800">{loi}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDong} disabled={dangGui} className="rounded border px-2 py-1">Quay lại</button>
        <button disabled={dangGui || !luaChon || (luaChon === 'huy' && !ghiChu.trim())}
          className="rounded bg-emerald-900 px-2 py-1 font-bold text-white disabled:opacity-50">Xác nhận xử lý</button>
      </div>
    </form>
  );
}

export default function XuLyMonPos({ mon, chiTiet, banId, onDaXuLy }) {
  const [id, setId] = useState(null);
  const tong = mon.tong_so_luong;
  const daLen = chiTiet.filter(muc => muc.trang_thai_mon === 'da_phuc_vu').reduce((s, muc) => s + muc.so_luong, 0);
  const daNau = daLen + chiTiet.filter(muc => muc.trang_thai_mon === 'hoan_thanh').reduce((s, muc) => s + muc.so_luong, 0);
  const nhan = daLen ? `Đã lên ${daLen}/${tong}` : daNau ? `Đã nấu ${daNau}/${tong}` : `Đã lên 0/${tong}`;
  return (
    <>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-800">{nhan} {mon.don_vi_tinh}</span>
        {chiTiet.map(muc => {
          const tinhTrang = muc.cho_phuc_vu_huy ? 'Chờ phục vụ xử lý hủy' :
            DA_XU_LY[muc.lua_chon] ||
            (muc.lua_chon === 'xac_nhan_bung' && muc.trang_thai_mon === 'hoan_thanh' ? 'Chờ xác nhận đã bưng' : null);
          if (tinhTrang || muc.trang_thai_mon === 'yeu_cau_huy')
            return <span key={muc.id} className="rounded bg-amber-50 px-2 py-1">{muc.so_luong} · {tinhTrang || TEN[muc.trang_thai_mon]}</span>;
          if (muc.trang_thai_mon === 'da_phuc_vu' || !TEN[muc.trang_thai_mon]) return null;
          return <button key={muc.id} type="button" aria-expanded={id === muc.id} onClick={() => setId(id === muc.id ? null : muc.id)}
            className="rounded bg-[#a9472b] px-2 py-1 font-semibold text-white">
            {muc.so_luong} {TEN[muc.trang_thai_mon].toLowerCase()} · Xử lý món
          </button>;
        })}
      </div>
      {chiTiet.filter(muc => muc.id === id && !DA_XU_LY[muc.lua_chon] && !muc.cho_phuc_vu_huy &&
        ['cho_duyet', 'dang_nau', 'hoan_thanh'].includes(muc.trang_thai_mon)).map(muc =>
        <LuaChon key={`${id}-${muc.trang_thai_mon}-${muc.so_luong}`} mon={muc} banId={banId} onDong={() => setId(null)} onDaXuLy={onDaXuLy} />)}
    </>
  );
}
