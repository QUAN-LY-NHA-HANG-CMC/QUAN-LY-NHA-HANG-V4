// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// K06 · POPUP ĐỀ NGHỊ ƯU TIÊN CẦN BẾP PHẢN HỒI (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { Clock, Check, X, Bell } from 'lucide-react';

export default function ModalDeNghiUuTien({
  onDong,
  onPhanHoi,
  duLieu = null
}) {
  const [phutUocTinh, setPhutUocTinh] = useState('3');

  const deNghi = duLieu || {
    tenPhucVu: 'Phục vụ Lan',
    tenBan: 'Bàn 03',
    tenMon: 'Lẩu tôm chua cay',
    thoiGianCho: 12,
    lyDo: 'Khách đang giục'
  };

  const handleXacNhan = (chapNhan) => {
    onPhanHoi({
      chapNhan,
      thoiGian: chapNhan ? `${phutUocTinh} phút nữa ra món` : 'Bếp đang quá tải, chưa thể ưu tiên',
      deNghi
    });
    onDong();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#202e28] text-white rounded-3xl border border-emerald-700/50 p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                ĐỀ NGHỊ TỪ PHỤC VỤ
              </span>
              <h3 className="text-base font-bold text-white">
                {deNghi.tenBan || 'Bàn 03'} đề nghị giục món
              </h3>
            </div>
          </div>
          <button onClick={onDong} className="p-1.5 rounded-full hover:bg-white/10 text-white/60">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[#b3c6ba] mb-4 leading-relaxed">
          {deNghi.tenPhucVu || 'Phục vụ'} báo khách {deNghi.tenBan || 'Bàn 03'} đang chờ món <span className="text-amber-300 font-bold">{deNghi.tenMon || 'Lẩu tôm chua cay'}</span> (đã đợi {deNghi.thoiGianCho || 12} phút - {deNghi.lyDo || 'Khách đang giục'}). Bếp có thể ưu tiên ra sớm hơn không?
        </p>

        {/* Chọn ước tính thời gian */}
        <div className="bg-black/30 p-3 rounded-xl mb-5 flex items-center justify-between text-xs">
          <span className="text-[#b3c6ba]">Ước tính thời gian ra món:</span>
          <div className="flex items-center gap-1.5">
            {['2', '3', '5'].map((p) => (
              <button
                key={p}
                onClick={() => setPhutUocTinh(p)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  phutUocTinh === p
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {p} phút
              </button>
            ))}
          </div>
        </div>

        {/* Nút phản hồi */}
        <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
          <button
            onClick={() => handleXacNhan(true)}
            className="py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <Check size={16} />
            <span>Đồng ý ưu tiên ({phutUocTinh}p)</span>
          </button>

          <button
            onClick={() => handleXacNhan(false)}
            className="py-3 bg-white/10 hover:bg-white/20 text-white/80 rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Bếp đang quá tải</span>
          </button>
        </div>
      </div>
    </div>
  );
}
