// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// P02 · GIẢM GIÁ VÀ CHIẾT KHẤU (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { X, Percent, Tag, Check } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';

export default function ModalGiamGiaChietKhau({
  tongTienGoc = 838080,
  onDong,
  onApDung
}) {
  const [loaiGiam, setLoaiGiam] = useState('phanTram'); // 'phanTram' | 'tienMat' | 'maVip'
  const [giaTri, setGiaTri] = useState(10); // 10%
  const [lyDo, setLyDo] = useState('Khách VIP thành viên thân thiết');

  let soTienGiam = 0;
  if (loaiGiam === 'phanTram') {
    soTienGiam = Math.round((tongTienGoc * giaTri) / 100);
  } else {
    soTienGiam = giaTri;
  }
  const tongSauGiam = Math.max(0, tongTienGoc - soTienGiam);

  const handleXacNhan = () => {
    onApDung({
      loaiGiam,
      giaTri,
      soTienGiam,
      tongSauGiam,
      lyDo
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-stone-200">
        <div className="flex justify-between items-center pb-3 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
              CHIẾT KHẤU THU NGÂN
            </span>
            <h3 className="text-lg font-bold text-[#272d29]">
              Giảm giá & chiết khấu hóa đơn
            </h3>
          </div>
          <button onClick={onDong} className="p-1 rounded-full hover:bg-stone-100 text-stone-500">
            <X size={18} />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          {/* Chọn loại giảm giá */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl font-bold">
            <button
              type="button"
              onClick={() => { setLoaiGiam('phanTram'); setGiaTri(10); }}
              className={`py-2 rounded-lg transition-all ${
                loaiGiam === 'phanTram' ? 'bg-white text-[#272d29] shadow-xs' : 'text-stone-500'
              }`}
            >
              Theo % chiết khấu
            </button>
            <button
              type="button"
              onClick={() => { setLoaiGiam('tienMat'); setGiaTri(50000); }}
              className={`py-2 rounded-lg transition-all ${
                loaiGiam === 'tienMat' ? 'bg-white text-[#272d29] shadow-xs' : 'text-stone-500'
              }`}
            >
              Số tiền trực tiếp (VNĐ)
            </button>
          </div>

          {/* Mức giảm phần trăm nhanh */}
          {loaiGiam === 'phanTram' ? (
            <div>
              <label className="block font-bold text-stone-700 mb-1.5">Mức giảm (%):</label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setGiaTri(pt)}
                    className={`py-2 rounded-xl font-extrabold border ${
                      giaTri === pt ? 'bg-[#b64d2d] text-white border-[#b64d2d]' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    {pt}%
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-bold text-stone-700 mb-1.5">Mức giảm (VNĐ):</label>
              <div className="grid grid-cols-3 gap-2">
                {[50000, 100000, 200000].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setGiaTri(st)}
                    className={`py-2 rounded-xl font-extrabold border ${
                      giaTri === st ? 'bg-[#b64d2d] text-white border-[#b64d2d]' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    {dinhDangTien(st)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lý do chiết khấu */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Lý do chiết khấu / Thẻ VIP:</label>
            <input
              type="text"
              value={lyDo}
              onChange={(e) => setLyDo(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-800"
            />
          </div>

          {/* Kết quả sau chiết khấu */}
          <div className="bg-[#f9ede6] rounded-xl p-4 border border-[#b64d2d]/20 space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>Hóa đơn gốc:</span>
              <span className="font-semibold">{dinhDangTien(tongTienGoc)}</span>
            </div>
            <div className="flex justify-between text-[#a42c35] font-bold">
              <span>Số tiền giảm:</span>
              <span>- {dinhDangTien(soTienGiam)}</span>
            </div>
            <div className="pt-2 border-t border-stone-300 flex justify-between items-baseline font-extrabold text-sm text-[#272d29]">
              <span>Sau chiết khấu:</span>
              <span className="text-base text-[#b64d2d]">{dinhDangTien(tongSauGiam)}</span>
            </div>
          </div>
        </div>

        {/* Nút áp dụng */}
        <button
          onClick={handleXacNhan}
          className="w-full py-3.5 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Check size={16} />
          <span>Áp dụng chiết khấu</span>
        </button>
      </div>
    </div>
  );
}
