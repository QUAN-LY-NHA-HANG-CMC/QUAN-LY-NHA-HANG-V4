// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// SIDEBAR THU NGÂN POS (P01 - P09) THEO CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React from 'react';
import TrangThaiKetNoiVaGio from './TrangThaiKetNoiVaGio';
import { LayoutGrid, History, CreditCard, BarChart3, LogOut, CheckCircle2 } from 'lucide-react';

export default function SidebarThuNgan({
  tabHienTai = 'soDoHoaDon',
  onChuyenTab,
  soBanChoThanhToan = 0,
  nhanVien,
  onDangXuat = null
}) {
  const menuItems = [
    {
      id: 'soDoHoaDon',
      label: 'Sơ đồ & hóa đơn',
      icon: LayoutGrid
    },
    {
      id: 'banChoThanhToan',
      label: 'Bàn chờ thanh toán',
      icon: CreditCard,
      badge: soBanChoThanhToan
    },
    {
      id: 'lichSuHoaDon',
      label: 'Lịch sử hóa đơn',
      icon: History
    },
    {
      id: 'baoCaoCa',
      label: 'Báo cáo ca',
      icon: BarChart3
    }
  ];

  return (
    <aside className="w-64 bg-[#f8f7f2] border-r border-[#272d29]/10 flex flex-col justify-between h-screen shrink-0 select-none">
      {/* Phần trên: Nhận diện & Menu */}
      <div>
        {/* Brand & Chi nhánh */}
        <div className="p-5 border-b border-[#272d29]/10">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-bold text-2xl tracking-tight text-[#b64d2d]">mộc</span>
            <span className="text-[11px] font-semibold tracking-wider text-[#72776f] uppercase">
              CASHIER / POS
            </span>
          </div>

          <div className="bg-[#272d29]/5 rounded-lg p-2.5">
            <p className="text-xs font-semibold text-[#272d29]">Chi nhánh Thảo Điền</p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#226b4c] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#226b4c]"></span>
              Đang mở cửa · 22:00
            </div>
          </div>
        </div>

        {/* Danh sách mục điều hướng */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = tabHienTai === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChuyenTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#b64d2d] text-white shadow-xs font-semibold'
                    : 'text-[#272d29] hover:bg-stone-200/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={18} className="stroke-[1.75]" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      active
                        ? 'bg-white text-[#b64d2d]'
                        : 'bg-[#a42c35] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Phần dưới: Thông tin ca thu ngân */}
      <div className="p-4 border-t border-[#272d29]/10 bg-white/50 m-3 rounded-xl border">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-[#272d29]">{nhanVien.hoTen}</p>
              {nhanVien.ca && <p className="text-xs text-[#72776f] mt-0.5">{nhanVien.ca}</p>}
              <p className="text-[11px] font-medium text-[#2d4336] mt-1">Quầy thu ngân</p>
          </div>

          {onDangXuat && (
            <button
              onClick={onDangXuat}
              className="p-1.5 text-[#72776f] hover:text-[#a42c35] hover:bg-stone-100 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>

          <div className="mt-3 pt-2.5 border-t border-stone-200/60 text-[11px]"><TrangThaiKetNoiVaGio /></div>
      </div>
    </aside>
  );
}
