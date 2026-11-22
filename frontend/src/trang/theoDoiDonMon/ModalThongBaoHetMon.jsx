// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// C06 & C13 · THÔNG BÁO HẾT MÓN (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';

export default function ModalThongBaoHetMon({
  monHet = { ten_mon: 'Cơm chiên hải sản', so_luong: 1, gia: 129000 },
  onDong,
  onChonMonThayThe,
  onXacNhanHuyMon
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] bg-[#f9f7f2] rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 border border-[#272d29]/10">
        {/* Nút đóng */}
        <div className="flex justify-end">
          <button
            onClick={onDong}
            className="p-1 rounded-full hover:bg-stone-200 text-[#72776f]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Biểu tượng cảnh báo */}
        <div className="text-center py-2">
          <div className="w-14 h-14 bg-rose-100 text-[#a42c35] rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
            <AlertTriangle size={28} className="stroke-[2.5]" />
          </div>

          <span className="text-[11px] font-bold tracking-wider text-[#a42c35] uppercase">
            THÔNG BÁO TỪ BẾP
          </span>
          <h3 className="text-xl font-bold text-[#272d29] mt-1 mb-2">
            Rất tiếc, món vừa hết
          </h3>
          <p className="text-xs text-[#6c746d] leading-relaxed max-w-xs mx-auto">
            {monHet?.ten_mon || 'Cơm chiên hải sản'} không còn đủ nguyên liệu tươi ngon nhất. Bếp vừa cập nhật trạng thái hết món.
          </p>
        </div>

        {/* Hộp chi tiết món hết */}
        <div className="bg-white rounded-xl p-4 border border-[#272d29]/10 shadow-xs my-4">
          <span className="text-[11px] font-semibold text-[#72776f]">Món cần thay đổi:</span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-sm text-[#272d29]">
              {monHet?.ten_mon || 'Cơm chiên hải sản'} × {monHet?.so_luong || 1}
            </span>
            <span className="font-bold text-sm text-[#a42c35]">
              {dinhDangTien((monHet?.gia || 129000) * (monHet?.so_luong || 1))}
            </span>
          </div>
          <p className="text-[11px] text-[#72776f] mt-1">
            Chưa tính vào hóa đơn của bàn
          </p>
        </div>

        {/* Các nút hành động */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onChonMonThayThe}
            className="w-full py-3.5 px-4 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
          >
            <RefreshCw size={16} />
            <span>Xem món đề xuất thay thế (C14)</span>
          </button>

          <button
            onClick={onXacNhanHuyMon}
            className="w-full py-3 px-4 bg-white hover:bg-stone-100 text-[#72776f] border border-stone-300 rounded-xl font-semibold text-xs transition-colors"
          >
            Bỏ món này, không gọi thay thế
          </button>
        </div>
      </div>
    </div>
  );
}
