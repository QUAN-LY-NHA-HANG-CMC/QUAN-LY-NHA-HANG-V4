// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// TOAST THÔNG BÁO REALTIME TỰ ĐỘNG BIẾN MẤT
// ============================================================================

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ThongBaoToast({ thongBao, onDong }) {
  useEffect(() => {
    if (thongBao) {
      const timer = setTimeout(() => {
        onDong();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [thongBao, onDong]);

  if (!thongBao) return null;

  const loai = thongBao.loai || 'thong_tin';

  let borderStyle = 'border-blue-200 bg-blue-50 text-blue-900';
  let Icon = Info;

  if (loai === 'thanh_cong') {
    borderStyle = 'border-[#226b4c]/30 bg-[#ebf4ed] text-[#226b4c]';
    Icon = CheckCircle2;
  } else if (loai === 'canh_bao' || loai === 'loi') {
    borderStyle = 'border-[#b64d2d]/30 bg-[#f9ede6] text-[#b64d2d]';
    Icon = AlertCircle;
  }

  return (
    <div className="fixed top-16 left-4 right-4 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`pointer-events-auto max-w-md w-full p-3 rounded-xl border shadow-lg flex items-center justify-between gap-3 ${borderStyle}`}>
        <div className="flex items-center gap-2.5">
          <Icon size={18} className="shrink-0" />
          <p className="text-xs font-medium leading-tight">{thongBao.noiDung}</p>
        </div>
        <button
          onClick={onDong}
          className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
