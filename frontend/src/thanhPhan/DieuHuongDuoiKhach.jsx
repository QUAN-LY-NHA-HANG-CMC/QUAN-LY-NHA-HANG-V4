// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// ĐIỀU HƯỚNG CUỐI CHUẨN THIẾT KẾ FIGMA CHO PHÂN HỆ KHÁCH HÀNG (C01 - C14)
// ============================================================================

import React from 'react';
import { LayoutGrid, Bell, Clock } from 'lucide-react';

export default function DieuHuongDuoiKhach({
  tabHienTai = 'thucDon',
  onChuyenTab,
  soLuongMonDangCho = 0
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-[#f9f7f2] border-t border-[#272d29]/10 py-2.5 px-4 z-40">
      <div className="flex items-center justify-around">
        {/* Tab 1: Thực đơn */}
        <button
          onClick={() => onChuyenTab('thucDon')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            tabHienTai === 'thucDon'
              ? 'text-[#b64d2d] font-semibold'
              : 'text-[#72776f] hover:text-[#272d29]'
          }`}
        >
          <LayoutGrid size={20} className="stroke-[1.75]" />
          <span className="text-[12px] mt-1">Thực đơn</span>
        </button>

        {/* Tab 2: Món đã gọi */}
        <button
          onClick={() => onChuyenTab('monDaGoi')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            tabHienTai === 'monDaGoi'
              ? 'text-[#b64d2d] font-semibold'
              : 'text-[#72776f] hover:text-[#272d29]'
          }`}
        >
          <div className="relative">
            <Bell size={20} className="stroke-[1.75]" />
            {soLuongMonDangCho > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#b64d2d] text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                {soLuongMonDangCho}
              </span>
            )}
          </div>
          <span className="text-[12px] mt-1">Món đã gọi</span>
        </button>

        {/* Tab 3: Hỗ trợ */}
        <button
          onClick={() => onChuyenTab('hoTro')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            tabHienTai === 'hoTro'
              ? 'text-[#b64d2d] font-semibold'
              : 'text-[#72776f] hover:text-[#272d29]'
          }`}
        >
          <Clock size={20} className="stroke-[1.75]" />
          <span className="text-[12px] mt-1">Hỗ trợ</span>
        </button>
      </div>
    </nav>
  );
}
