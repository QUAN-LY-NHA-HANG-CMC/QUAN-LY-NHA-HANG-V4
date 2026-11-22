// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MÀN HÌNH YÊU CẦU TÍNH TIỀN TẠI BÀN (FIGMA C08, C09)
// ============================================================================

import React, { useState } from 'react';
import { QrCode, Users, Banknote, CheckCircle, ArrowRight } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';

export default function TrangYeuCauThanhToan({
  tamTinh = { danhSachMon: [], tongTienMon: 0, tienVat: 0, tongTienThanhToan: 0 },
  onMoVietQR,
  onMoChiaTien,
  onGoiThuNganTienMat,
  dangGoiThuNgan = false
}) {
  const { danhSachMon = [], tongTienMon = 0, tienVat = 0, tongTienThanhToan = 0 } = tamTinh;

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#272d29]">Hóa đơn tạm tính</h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
          VAT 8% bao gồm
        </span>
      </div>

      {/* Chi tiết từng món */}
      <div className="p-4 rounded-2xl bg-white border border-[#272d29]/10 shadow-xs space-y-2.5">
        <div className="space-y-2">
          {danhSachMon.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#72776f]">x{item.tong_so_luong}</span>
                <span className="font-medium text-[#272d29]">{item.ten_mon}</span>
              </div>
              <span className="font-semibold text-[#272d29]">
                {dinhDangTien(item.tong_thanh_tien)}
              </span>
            </div>
          ))}
        </div>

        <div className="h-[1px] bg-stone-100 my-2" />

        {/* Tổng kết tiền */}
        <div className="space-y-1.5 text-xs text-[#72776f]">
          <div className="flex justify-between">
            <span>Tổng tiền món:</span>
            <span className="font-medium text-[#272d29]">{dinhDangTien(tongTienMon)}</span>
          </div>
          <div className="flex justify-between">
            <span>Thuế GTGT (VAT 8%):</span>
            <span className="font-medium text-[#272d29]">{dinhDangTien(tienVat)}</span>
          </div>
          <div className="h-[1px] bg-stone-100 my-1" />
          <div className="flex justify-between text-base font-bold text-[#272d29] pt-1">
            <span>Tổng thanh toán:</span>
            <span className="text-lg text-[#b64d2d]">{dinhDangTien(tongTienThanhToan)}</span>
          </div>
        </div>
      </div>

      {/* Lựa chọn phương thức thanh toán */}
      <div className="space-y-2.5 pt-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#72776f]">
          Chọn hình thức thanh toán
        </h3>

        {/* 1. Thanh toán VietQR động tại bàn (Khuyên dùng) */}
        <button
          onClick={onMoVietQR}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#2d4336] to-[#3a5444] text-white shadow-md flex items-center justify-between text-left hover:brightness-105 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <QrCode size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm">Quét mã VietQR tức thì</h4>
                <span className="text-[10px] font-bold bg-[#b64d2d] text-white px-1.5 py-0.2 rounded">
                  Khuyên dùng
                </span>
              </div>
              <p className="text-[11px] text-white/80 mt-0.5">
                Chuyển khoản chính xác số tiền kèm nội dung hóa đơn
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-white/80" />
        </button>

        {/* 2. Chia tiền nhóm (Figma C10) */}
        <button
          onClick={onMoChiaTien}
          className="w-full p-3.5 rounded-2xl bg-white border border-[#272d29]/10 shadow-xs flex items-center justify-between text-left hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f9ede6] text-[#b64d2d] flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#272d29]">Chia tiền theo nhóm</h4>
              <p className="text-[11px] text-[#72776f]">
                Tự động chia đều hóa đơn và sinh QR từng người
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-stone-400" />
        </button>

        {/* 3. Gọi Thu ngân thanh toán tiền mặt */}
        <button
          onClick={onGoiThuNganTienMat}
          disabled={dangGoiThuNgan}
          className="w-full p-3.5 rounded-2xl bg-white border border-[#272d29]/10 shadow-xs flex items-center justify-between text-left hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
              <Banknote size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#272d29]">
                {dangGoiThuNgan ? 'Đã báo Thu ngân...' : 'Thanh toán tiền mặt'}
              </h4>
              <p className="text-[11px] text-[#72776f]">
                Nhân viên sẽ mang phiếu tạm tính và tiền thối lại bàn
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-stone-400" />
        </button>
      </div>
    </div>
  );
}
