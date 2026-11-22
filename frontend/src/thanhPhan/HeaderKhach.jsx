// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// HEADER CHUẨN THIẾT KẾ FIGMA CHO PHÂN HỆ KHÁCH HÀNG (C01 - C14)
// ============================================================================

import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';

export default function HeaderKhach({
  tieuDe = 'Chào mừng tại bàn',
  ban = { ma_ban: 'B08', ten_ban: 'QUÁN MỘC' },
  onQuayLai = null,
  onMoThongBao = null,
  soThongBao = 0
}) {
  const tenBanHienThi = ban?.ten_ban ? ban.ten_ban.toUpperCase() : 'QUÁN MỘC';

  return (
    <div className="w-full bg-[#f9f7f2] border-b border-[#272d29]/10 pt-4 pb-3 px-5 sticky top-0 z-30">
      {/* Khối nhận diện trên */}
      <div className="flex items-center justify-between h-9">
        <div className="flex items-baseline gap-2.5">
          <span className="font-bold text-2xl tracking-tight text-[#b64d2d] leading-none select-none">
            mộc
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-[#72776f] uppercase">
            DINING / {tenBanHienThi}
          </span>
        </div>

        <button
          onClick={onMoThongBao}
          className="relative p-2 rounded-full hover:bg-stone-200/50 text-[#272d29] transition-colors"
          title="Thông báo"
        >
          <Bell size={20} className="stroke-[1.75]" />
          {soThongBao > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#a42c35] rounded-full ring-2 ring-[#f9f7f2]" />
          )}
        </button>
      </div>

      {/* Tiêu đề màn hình & Nút quay lại */}
      <div className="mt-3 flex items-center gap-2">
        {onQuayLai && (
          <button
            onClick={onQuayLai}
            className="p-1 -ml-1 text-[#272d29] hover:text-[#b64d2d] transition-colors"
            title="Quay lại"
          >
            <ArrowLeft size={20} className="stroke-[2]" />
          </button>
        )}
        <h1 className="text-xl font-bold text-[#272d29] tracking-tight truncate">
          {tieuDe}
        </h1>
      </div>
    </div>
  );
}
