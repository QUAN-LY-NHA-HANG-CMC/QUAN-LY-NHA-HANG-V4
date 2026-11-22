import { useEffect, useState } from 'react';
import { api } from '../../dungChung/api';

const truong = [
    { key: "tenNhaHang", cot: "ten_nha_hang", nhan: "Tên nhà hàng", type: "text" },
    { key: "diaChi", cot: "dia_chi", nhan: "Địa chỉ", type: "text" },
    { key: "soDienThoai", cot: "so_dien_thoai", nhan: "Điện thoại", type: "tel" },
    { key: "email", cot: "email", nhan: "Email", type: "email" },
    { key: "phanTramVat", cot: "phan_tram_vat", nhan: "VAT (%)", type: "number" },
];

export default function TrangCauHinh() {
  const [giaTri, setGiaTri] = useState({});
  const [trangThai, setTrangThai] = useState('');
  const [sanSang, setSanSang] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  useEffect(() => {
    api.get('/api/he-thong/cau-hinh').then(data => {
      setGiaTri(Object.fromEntries(truong.map(muc => [muc.key, data?.[muc.cot] ?? ''])));
      setSanSang(true);
    }).catch(err => setTrangThai(err.message));
  }, []);
  const luu = async (e) => {
    e.preventDefault();
    if (!sanSang || dangLuu) return;
    setDangLuu(true);
    try {
      const form = Object.fromEntries(truong.map(muc => [
        muc.key, muc.type === 'number' ? Number(giaTri[muc.key]) : giaTri[muc.key]
      ]));
      await api.put('/api/he-thong/cau-hinh', form);
      setTrangThai('Đã lưu cấu hình.');
    } catch (err) {
      setTrangThai(err.message);
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold">Thông tin nhà hàng</h1>
      <form onSubmit={luu} className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
        {truong.map(muc => (
          <label key={muc.key} className="block text-sm font-semibold">
            {muc.nhan}
            <input type={muc.type} min={muc.type === 'number' ? 0 : undefined}
              max={muc.type === 'number' ? 100 : undefined}
              disabled={!sanSang || dangLuu} value={giaTri[muc.key] ?? ''}
              onChange={e => setGiaTri({ ...giaTri, [muc.key]: e.target.value })}
              className="block w-full mt-1 border border-stone-300 rounded-lg p-2" />
          </label>
        ))}
        <button disabled={!sanSang || dangLuu} className="bg-[#2d4336] text-white rounded-xl px-4 py-2">Lưu cấu hình</button>
        {trangThai && <p role="status">{trangThai}</p>}
      </form>
    </div>
  );
}
