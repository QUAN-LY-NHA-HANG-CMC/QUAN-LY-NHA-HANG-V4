// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// P08 · HOÀN TẤT VÀ DỌN BÀN (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ModalHoanTatDonBan({
  ban = { ma_ban: 'B08', ten_ban: 'Bàn 08' },
  onDong,
  onXacNhanDonBan
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 text-center">
        <div className="w-14 h-14 bg-stone-100 text-stone-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <Sparkles size={28} />
        </div>

        <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider block">
          KẾT THÚC PHỤC VỤ
        </span>
        <h3 className="text-xl font-bold text-[#272d29] mt-1 mb-2">
          Bàn đã sẵn sàng đón khách mới?
        </h3>
        <p className="text-xs text-[#72776f] leading-relaxed max-w-xs mx-auto mb-6">
          {ban.ten_ban || 'Bàn 08'} sẽ chuyển sang trạng thái Trống.
        </p>

        <div className="space-y-2.5">
          <button
            onClick={onXacNhanDonBan}
            className="w-full py-3.5 bg-[#226b4c] hover:bg-[#1a553c] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            <span>Xác nhận đã dọn bàn</span>
          </button>

          <button
            onClick={onDong}
            className="w-full py-2.5 text-xs text-stone-500 hover:text-stone-800 font-semibold"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
}
