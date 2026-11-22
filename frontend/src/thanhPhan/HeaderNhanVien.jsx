// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// HEADER CHO NHÂN VIÊN PHỤC VỤ (W01 - W11)
// ============================================================================

import React from 'react';
import { ArrowLeft, Bell, Calendar, LayoutGrid, LogOut } from 'lucide-react';
import { api } from '../dungChung/api';

export default function HeaderNhanVien({
  tieuDe = 'Sơ đồ bàn',
  nhanVien: nhanVienProp = null,
  onQuayLai = null,
  tabHienTai = 'soDoBan',
  onChuyenTab = null,
  soThongBaoChuaXuLy = 0,
  onDangXuat = null
}) {
  const nguoiDungLuu = api.layNguoiDung();
  const nhanVien = nhanVienProp || (nguoiDungLuu ? {
    hoTen: nguoiDungLuu.hoTen || nguoiDungLuu.ho_ten || nguoiDungLuu.tenDangNhap || 'Lê Văn Minh',
    ca: nguoiDungLuu.ca || 'Ca tối'
  } : {
    hoTen: 'Lê Văn Minh',
    ca: 'Ca tối'
  });
  return (
    <div className="w-full bg-[#f9f7f2] border-b border-[#272d29]/10 pt-4 pb-2 px-4 sticky top-0 z-30">
      {/* Khối nhận diện trên */}
      <div className="flex items-center justify-between h-9">
        <div className="flex items-baseline gap-2.5">
          <span className="font-bold text-2xl tracking-tight text-[#b64d2d] leading-none select-none">
            mộc
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-[#72776f] uppercase">
            STAFF / {nhanVien?.ca ? nhanVien.ca.toUpperCase() : 'CA TỐI'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onChuyenTab && onChuyenTab('thongBao')}
            className="relative p-2 rounded-full hover:bg-stone-200/50 text-[#272d29] transition-colors"
            title="Trung tâm thông báo"
          >
            <Bell size={20} className="stroke-[1.75]" />
            {soThongBaoChuaXuLy > 0 && (
              <span className="absolute top-1 right-1 bg-[#a42c35] text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                {soThongBaoChuaXuLy}
              </span>
            )}
          </button>

          {onDangXuat && (
            <button
              onClick={onDangXuat}
              className="p-2 rounded-full hover:bg-stone-200/50 text-[#72776f] hover:text-[#a42c35] transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={18} className="stroke-[1.75]" />
            </button>
          )}
        </div>
      </div>

      {/* Tiêu đề & Nút quay lại */}
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onQuayLai && (
            <button
              onClick={onQuayLai}
              className="p-1 -ml-1 text-[#272d29] hover:text-[#b64d2d] transition-colors"
              title="Quay lại"
            >
              <ArrowLeft size={20} className="stroke-[2]" />
            </button>
          )}
          <h1 className="text-xl font-bold text-[#272d29] tracking-tight">
            {tieuDe}
          </h1>
        </div>

        {/* Thanh tab nhanh trên mobile của Waiter */}
        {onChuyenTab && (
          <div className="flex items-center gap-1 bg-stone-200/60 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => onChuyenTab('soDoBan')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                tabHienTai === 'soDoBan'
                  ? 'bg-white text-[#272d29] shadow-xs font-semibold'
                  : 'text-[#72776f] hover:text-[#272d29]'
              }`}
            >
              Bàn
            </button>
            <button
              onClick={() => onChuyenTab('caLamViec')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                tabHienTai === 'caLamViec'
                  ? 'bg-white text-[#272d29] shadow-xs font-semibold'
                  : 'text-[#72776f] hover:text-[#272d29]'
              }`}
            >
              Ca làm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
