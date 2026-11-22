// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// HEADER CHUẨN FIGMA C01, C02, C04
// ============================================================================

import React from 'react';
import { Bell, PhoneCall, LogOut, User } from 'lucide-react';

export default function Header({ 
  ban = { ma_ban: 'B08', ten_ban: 'Bàn 08' }, 
  nguoiDung = null,
  onGoiHoTro = null,
  onDangXuat = null,
  tieuDe = null
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#f9f7f2]/95 backdrop-blur-md border-b border-[#272d29]/10 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Vị trí bàn */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-2xl tracking-tighter text-[#b64d2d]">mộc</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#72776f]">
              DINING
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#272d29]/20" />

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#272d29]/5 rounded-full text-xs font-semibold text-[#272d29]">
            <span className="w-2 h-2 rounded-full bg-[#226b4c] animate-pulse"></span>
            {ban ? `${ban.ten_ban || ban.ma_ban}` : 'Hệ Thống POS'}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {onGoiHoTro && (
            <button
              onClick={onGoiHoTro}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#795c21] bg-[#fbf2dd] hover:bg-[#f6f0dd] rounded-lg transition-colors border border-[#795c21]/20 shadow-xs"
              title="Gọi phục vụ hoặc yêu cầu hỗ trợ"
            >
              <PhoneCall size={14} />
              <span className="hidden sm:inline">Gọi phục vụ</span>
            </button>
          )}

          {nguoiDung ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#272d29]/10">
              <span className="text-xs font-medium text-[#272d29] hidden sm:inline">
                {nguoiDung.hoTen || nguoiDung.tenDangNhap} ({nguoiDung.vaiTro})
              </span>
              <button
                onClick={onDangXuat}
                className="p-1.5 text-[#72776f] hover:text-[#b64d2d] rounded-lg hover:bg-stone-100 transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="p-1.5 text-[#72776f]">
              <Bell size={18} />
            </div>
          )}
        </div>
      </div>

      {tieuDe && (
        <div className="max-w-6xl mx-auto pt-2 pb-0.5">
          <h1 className="text-lg font-bold text-[#272d29]">{tieuDe}</h1>
        </div>
      )}
    </header>
  );
}
