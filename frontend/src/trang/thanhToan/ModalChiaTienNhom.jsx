// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// C10 · CHIA TIỀN NHÓM (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { X, Minus, Plus, Users, Share2, Copy, Check } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';

export default function ModalChiaTienNhom({
  tongTien = 838080,
  soNguoiMacDinh = 4,
  onDong
}) {
  const [soNguoi, setSoNguoi] = useState(soNguoiMacDinh);
  const [daSaoChep, setDaSaoChep] = useState(false);

  const tang = () => setSoNguoi(prev => Math.min(20, prev + 1));
  const giam = () => setSoNguoi(prev => Math.max(2, prev - 1));

  const moiNguoi = Math.round(tongTien / soNguoi);

  const handleSaoChep = () => {
    const noiDung = `Quán Mộc - Chia tiền hóa đơn Bàn 08:\nTổng tiền: ${dinhDangTien(tongTien)}\nSố người: ${soNguoi}\nMỗi bạn: ${dinhDangTien(moiNguoi)}\nSTK Vietcombank: 0071000888999 - CONG TY AM THUC MOC`;
    navigator.clipboard?.writeText(noiDung);
    setDaSaoChep(true);
    setTimeout(() => setDaSaoChep(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] bg-[#f9f7f2] rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-5 border border-[#272d29]/10">
        <div className="flex justify-between items-center pb-3 border-b border-[#272d29]/10">
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
              TÍNH TOÁN NHÓM
            </span>
            <h3 className="text-lg font-bold text-[#272d29]">
              Chia đều, vui cả bàn.
            </h3>
          </div>
          <button
            onClick={onDong}
            className="p-1.5 rounded-full hover:bg-stone-200 text-[#72776f]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Thông tin hóa đơn */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex justify-between items-center text-xs">
            <span className="text-[#72776f]">Hóa đơn Bàn 08</span>
            <span className="font-bold text-sm text-[#272d29]">{dinhDangTien(tongTien)}</span>
          </div>

          {/* Điều chỉnh số người */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-[#272d29] block">Số người chia</span>
              <span className="text-[11px] text-[#72776f]">Nhấn để tăng/giảm</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={giam}
                className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-[#272d29] hover:bg-stone-100"
                disabled={soNguoi <= 2}
              >
                <Minus size={15} />
              </button>
              <span className="w-8 text-center font-bold text-base text-[#272d29]">
                {soNguoi}
              </span>
              <button
                type="button"
                onClick={tang}
                className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-[#272d29] hover:bg-stone-100"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Kết quả chia tiền */}
          <div className="bg-[#2d4336] text-white rounded-2xl p-5 text-center shadow-md">
            <span className="text-xs font-semibold text-emerald-200 tracking-wide uppercase block mb-1">
              MỖI NGƯỜI THANH TOÁN
            </span>
            <h2 className="text-3xl font-extrabold text-[#f9ede6]">
              {dinhDangTien(moiNguoi)}
            </h2>
            <p className="text-[11px] text-white/60 mt-1">
              Đã làm tròn số tiền chính xác
            </p>
          </div>

          {/* Nút sao chép nội dung chia tiền */}
          <button
            onClick={handleSaoChep}
            className="w-full py-3.5 bg-white hover:bg-stone-50 border border-stone-300 text-[#272d29] rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            {daSaoChep ? <Check size={16} className="text-[#226b4c]" /> : <Copy size={16} />}
            <span>{daSaoChep ? 'Đã sao chép vào bộ nhớ!' : 'Sao chép để gửi nhóm Zalo / Messenger'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
