// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// W08 · CHUYỂN BÀN (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';

export default function ModalChuyenBan({
  banHienTai = { ma_ban: 'B08', ten_ban: 'Bàn 08', khu_vuc: 'Tầng 1', tam_tinh: 776000 },
  danhSachBan = [],
  onDong,
  onXacNhanChuyen
}) {
  const [banDich, setBanDich] = useState('');
  const [lyDo, setLyDo] = useState('Khách muốn đổi chỗ ngồi thoáng hơn');

  // Lấy các bàn đang trống
  const banTrong = danhSachBan.filter(b => b.trang_thai === 'trong');

  const handleXacNhan = () => {
    onXacNhanChuyen({
      banNguon: banHienTai.ma_ban,
      banDich,
      lyDo
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] bg-[#f9f7f2] rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-5 border border-[#272d29]/10">
        <div className="flex justify-between items-center pb-3 border-b border-[#272d29]/10">
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
              ĐIỀU CHUYỂN VỊ TRÍ
            </span>
            <h3 className="text-lg font-bold text-[#272d29]">
              Chuyển sang bàn trống
            </h3>
          </div>
          <button
            onClick={onDong}
            className="p-1.5 rounded-full hover:bg-stone-200 text-[#72776f]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Thông tin bàn nguồn */}
        <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs my-3 text-xs">
          <span className="text-[#72776f]">Bàn nguồn:</span>
          <p className="font-bold text-sm text-[#272d29] mt-0.5">
            {banHienTai.ten_ban || 'Bàn 08'} · {banHienTai.khu_vuc || 'Tầng 1'}
          </p>
          <p className="text-[#b64d2d] font-semibold mt-0.5">
            Tạm tính: 776.000đ · 4 khách
          </p>
        </div>

        {/* Chọn bàn đích */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-bold text-[#272d29] block">
            CHỌN BÀN ĐÍCH ĐANG TRỐNG *
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {banTrong.map((b) => (
              <button
                key={b.ma_ban}
                type="button"
                onClick={() => setBanDich(b.ma_ban)}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  banDich === b.ma_ban
                    ? 'bg-[#2d4336] text-white border-[#2d4336] shadow-xs'
                    : 'bg-white text-[#272d29] border-stone-200 hover:border-stone-300'
                }`}
              >
                <p className="font-bold">{b.ten_ban}</p>
                <p className={`text-[11px] ${banDich === b.ma_ban ? 'text-emerald-200' : 'text-[#72776f]'}`}>
                  {b.khu_vuc} · {b.so_cho} chỗ
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Lý do chuyển */}
        <div className="mb-4">
          <label className="text-xs font-bold text-[#272d29] block mb-1">
            Lý do chuyển bàn
          </label>
          <input
            type="text"
            value={lyDo}
            onChange={(e) => setLyDo(e.target.value)}
            className="w-full text-xs bg-white border border-stone-200 rounded-xl p-3 text-[#272d29]"
          />
        </div>

        {/* Nút xác nhận */}
        <button
          disabled={!banDich}
            onClick={handleXacNhan}
          className="w-full py-3.5 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <ArrowRight size={16} />
          <span>Xác nhận chuyển sang {banDich}</span>
        </button>
      </div>
    </div>
  );
}
