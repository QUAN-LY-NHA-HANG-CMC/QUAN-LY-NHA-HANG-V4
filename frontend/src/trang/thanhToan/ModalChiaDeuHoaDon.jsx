// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// P06 · CHIA ĐỀU HÓA ĐƠN POS (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { X, Minus, Plus, Users, Check } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';

export default function ModalChiaDeuHoaDon({
  tongTien = 838080,
  onDong, loi, dangLuu,
  onXacNhanChia
}) {
  const [soNguoi, setSoNguoi] = useState(4);
  const moiNguoi = Math.floor(tongTien / soNguoi);
  const du = tongTien % soNguoi;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-stone-200">
        <div className="flex justify-between items-center pb-3 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
              CHIA ĐỀU HÓA ĐƠN TẠI QUẦY
            </span>
            <h3 className="text-lg font-bold text-[#272d29]">
              Chia tiền theo đầu người
            </h3>
          </div>
          <button onClick={onDong} className="p-1 rounded-full hover:bg-stone-100 text-stone-500">
            <X size={18} />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          <div className="bg-stone-50 p-4 rounded-xl border flex justify-between items-center">
            <span className="text-stone-600">Tổng hóa đơn:</span>
            <span className="text-base font-extrabold text-[#272d29]">{dinhDangTien(tongTien)}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border">
            <span className="font-bold text-stone-700">Số phần chia:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSoNguoi(prev => Math.max(2, prev - 1))}
                className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-100"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-bold text-base text-[#272d29]">{soNguoi}</span>
              <button
                type="button"
                onClick={() => setSoNguoi(prev => Math.min(20, prev + 1))}
                className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-100"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="bg-[#2d4336] text-white p-5 rounded-2xl text-center">
            <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider block mb-1">
              MỖI KHÁCH THANH TOÁN
            </span>
            <h2 className="text-3xl font-black text-[#f9ede6]">{dinhDangTien(moiNguoi)}</h2>
            {du > 0 && <p>{du} phần đầu thêm 1 đồng</p>}
          </div>
        </div>

        {loi && <p role="alert" className="text-red-700 py-2">{loi}</p>}
        <button
          disabled={dangLuu}
          onClick={() => onXacNhanChia({ soNguoi })}
          className="w-full py-3.5 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Check size={18} />
          <span>Lưu phương án chia</span>
        </button>
      </div>
    </div>
  );
}
