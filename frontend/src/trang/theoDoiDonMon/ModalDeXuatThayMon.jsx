// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// C14 · ĐỀ XUẤT THAY MÓN TỪ BẾP VÀ QUẢN LÝ (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';

export default function ModalDeXuatThayMon({
  monHet = { ten_mon: 'Cơm chiên hải sản', gia: 129000, so_luong: 1 },
  onDong,
  onDongYThayMon,
  onMoThucDonTuChon
}) {
  const monDeXuat = {
    id: 10,
    ten_mon: 'Mì xào giòn hải sản Mộc',
    gia: 139000,
    chenhLech: 10000,
    bepTruong: 'Quốc Huy (Bếp trưởng)',
    mo_ta: 'Sợi mì tươi chiên phồng giòn rụm, sốt hải sản tôm mực nấm đông cô đậm đà nóng hổi, rau cải thìa giòn ngọt.',
    hinh_anh: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80'
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] bg-[#f9f7f2] rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-5 border border-[#272d29]/10">
        {/* Nút đóng */}
        <div className="flex justify-between items-center pb-3 border-b border-[#272d29]/10">
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
              GỢI Ý TỪ BẾP & QUẢN LÝ
            </span>
            <h3 className="text-base font-bold text-[#272d29]">
              Thay {monHet.ten_mon} × {monHet.so_luong}
            </h3>
          </div>
          <button
            onClick={onDong}
            className="p-1.5 rounded-full hover:bg-stone-200 text-[#72776f]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Thông tin món hết */}
        <div className="bg-rose-50 border border-rose-200/70 rounded-xl p-3 my-3 text-xs flex justify-between items-center">
          <span className="text-[#a42c35] font-semibold">{monHet.ten_mon}</span>
          <span className="text-[#a42c35] font-bold">{dinhDangTien(monHet.gia)} · Hết món</span>
        </div>

        <p className="text-xs text-[#6c746d] leading-relaxed mb-3">
          Bếp trưởng và Quản lý trực tiếp chọn món thay thế tương đồng nhất về khẩu vị và thời gian ra món nhanh cho bàn của bạn:
        </p>

        {/* Card món đề xuất */}
        <div className="bg-white rounded-xl border-2 border-[#2d4336] p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#2d4336] mb-2">
            <Sparkles size={15} className="text-amber-500" />
            <span>Bếp đề xuất · {monDeXuat.bepTruong}</span>
          </div>

          <div className="flex gap-3 mb-3">
            <img
              src={monDeXuat.hinh_anh}
              alt={monDeXuat.ten_mon}
              className="w-20 h-20 rounded-lg object-cover border border-stone-200"
            />
            <div className="flex-1">
              <h4 className="font-bold text-sm text-[#272d29]">
                {monDeXuat.ten_mon}
              </h4>
              <p className="text-[11px] text-[#6c746d] mt-1 line-clamp-2">
                {monDeXuat.mo_ta}
              </p>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="font-bold text-sm text-[#b64d2d]">
                  {dinhDangTien(monDeXuat.gia)}
                </span>
                <span className="text-[11px] text-[#226b4c] font-semibold">
                  (+{dinhDangTien(monDeXuat.chenhLech)})
                </span>
              </div>
            </div>
          </div>

          {/* Nút chấp nhận đổi */}
          <button
            onClick={() => onDongYThayMon(monDeXuat)}
            className="w-full py-3 bg-[#2d4336] hover:bg-[#202e28] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Check size={16} />
            <span>Đổi sang món này (+{dinhDangTien(monDeXuat.chenhLech)})</span>
          </button>
        </div>

        {/* Nút mở thực đơn chọn món khác */}
        <div className="mt-3">
          <button
            onClick={onMoThucDonTuChon}
            className="w-full py-2.5 text-xs text-[#72776f] hover:text-[#272d29] font-medium text-center"
          >
            Hoặc tự chọn món khác từ Thực đơn →
          </button>
        </div>
      </div>
    </div>
  );
}
