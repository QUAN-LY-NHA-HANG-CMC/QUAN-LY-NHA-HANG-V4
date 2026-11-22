// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// W03 · TRUNG TÂM THÔNG BÁO (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React from 'react';
import { X, QrCode, PhoneCall, AlertTriangle, ArrowRight, Check } from 'lucide-react';

export default function ModalTrungTamThongBao({
  onDong,
  danhSachThongBao: danhSach = []
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] bg-[#f9f7f2] rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-5 border border-[#272d29]/10">
        <div className="flex justify-between items-center pb-3 border-b border-[#272d29]/10">
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
              THÔNG BÁO THỜI GIAN THỰC
            </span>
            <h3 className="text-lg font-bold text-[#272d29]">
              Trung tâm thông báo
            </h3>
          </div>
          <button
            onClick={onDong}
            className="p-1.5 rounded-full hover:bg-stone-200 text-[#72776f]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-between items-center py-2.5 text-xs">
          <span className="font-semibold text-[#795c21]">Đang chờ xử lý · {danhSach.length}</span>

        </div>

        <div className="space-y-3 pt-1">
          {danhSach.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#72776f]">
              🎉 Tuyệt vời! Bạn không còn thông báo nào chưa xử lý.
            </div>
          ) : (
            danhSach.map((tb) => {
              const Icon = tb.icon;
              return (
                <div
                  key={tb.id}
                  className="bg-white rounded-xl p-3.5 border border-[#272d29]/10 shadow-xs flex items-start gap-3 hover:border-[#b64d2d]/30 transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg ${tb.mauIcon} flex items-center justify-center shrink-0`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#272d29] truncate">
                      {tb.tieuDe}
                    </h4>
                    <p className="text-[11px] text-[#72776f] mt-0.5">
                      {tb.moTa}
                    </p>
                    <button
                      onClick={tb.onAction}
                      className="mt-2 text-xs font-bold text-[#b64d2d] hover:text-[#a14022] flex items-center gap-1"
                    >
                      <span>{tb.action}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
