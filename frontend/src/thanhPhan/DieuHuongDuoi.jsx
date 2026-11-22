// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// THANH ĐIỀU HƯỚNG DƯỚI (BOTTOM NAV) CHUẨN FIGMA C01, C02, C05, C08
// ============================================================================

import React from 'react';
import { Utensils, ShoppingBag, Clock, CreditCard } from 'lucide-react';
import { dinhDangTien } from '../dungChung/dinhDang';

export default function DieuHuongDuoi({
  tabHienTai = 'thuc-don',
  onChuyenTab,
  soLuongGioHang = 0,
  tongTienGioHang = 0,
  soMonDangNau = 0
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#ffffff]/95 backdrop-blur-md border-t border-[#272d29]/10 shadow-lg px-2 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Tab Thực đơn */}
        <button
          onClick={() => onChuyenTab('thuc-don')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            tabHienTai === 'thuc-don'
              ? 'text-[#b64d2d] font-semibold'
              : 'text-[#72776f] hover:text-[#272d29]'
          }`}
        >
          <Utensils size={20} className={tabHienTai === 'thuc-don' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px]">Thực đơn</span>
        </button>

        {/* Tab Giỏ hàng */}
        <button
          onClick={() => onChuyenTab('gio-hang')}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            tabHienTai === 'gio-hang'
              ? 'text-[#b64d2d] font-semibold'
              : 'text-[#72776f] hover:text-[#272d29]'
          }`}
        >
          <div className="relative">
            <ShoppingBag size={20} className={tabHienTai === 'gio-hang' ? 'stroke-[2.5]' : ''} />
            {soLuongGioHang > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#b64d2d] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {soLuongGioHang}
              </span>
            )}
          </div>
          <span className="text-[11px]">
            {soLuongGioHang > 0 ? dinhDangTien(tongTienGioHang) : 'Giỏ hàng'}
          </span>
        </button>

        {/* Tab Món đã gọi (Tiến độ KDS) */}
        <button
          onClick={() => onChuyenTab('theo-doi')}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            tabHienTai === 'theo-doi'
              ? 'text-[#b64d2d] font-semibold'
              : 'text-[#72776f] hover:text-[#272d29]'
          }`}
        >
          <div className="relative">
            <Clock size={20} className={tabHienTai === 'theo-doi' ? 'stroke-[2.5]' : ''} />
            {soMonDangNau > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-[11px]">Món đã gọi</span>
        </button>

        {/* Tab Thanh toán / Hóa đơn */}
        <button
          onClick={() => onChuyenTab('thanh-toan')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            tabHienTai === 'thanh-toan'
              ? 'text-[#b64d2d] font-semibold'
              : 'text-[#72776f] hover:text-[#272d29]'
          }`}
        >
          <CreditCard size={20} className={tabHienTai === 'thanh-toan' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px]">Thanh toán</span>
        </button>
      </div>
    </div>
  );
}
