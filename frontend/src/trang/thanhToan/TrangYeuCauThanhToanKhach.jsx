// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// C08 · YÊU CẦU TÍNH TIỀN (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { QrCode, Users, Banknote, ShieldCheck } from 'lucide-react';
import HeaderKhach from '../../thanhPhan/HeaderKhach';
import DieuHuongDuoiKhach from '../../thanhPhan/DieuHuongDuoiKhach';
import { dinhDangTien } from '../../dungChung/dinhDang';

export default function TrangYeuCauThanhToanKhach({
  ban, bill, loi, coVietQr, daYeuCau,
  onChuyenVietQr,
  onThanhToanTienMat,
  onQuayLaiTheoDoi,
  onChuyenTab
}) {

  const chiTiet = bill?.danhSachMon ?? [];
  const tongTienMon = bill?.tongTienMon ?? 0;
  const vat = bill?.tienVat ?? 0;
  const tongCong = bill?.tongTienThanhToan ?? 0;

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#f9f7f2] flex flex-col justify-between pb-24 shadow-xl border-x border-[#272d29]/5">
      {/* Header chuẩn Figma */}
      <HeaderKhach
        tieuDe="Yêu cầu tính tiền"
        ban={ban}
        onQuayLai={onQuayLaiTheoDoi}
      />

      <main className="px-5 py-4 flex-1 space-y-4">
        {loi && <p role="alert" className="text-red-700">{loi}</p>}
        {daYeuCau && <p role="status">Đã gửi yêu cầu. Thu ngân sẽ lập hóa đơn cho bàn.</p>}
        {/* Card hóa đơn tạm tính */}
        <div className="bg-white rounded-2xl p-4 border border-[#272d29]/10 shadow-xs">
          <div className="flex justify-between items-start pb-3 border-b border-stone-100">
            <div>
              <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
                HÓA ĐƠN TẠM TÍNH
              </span>
              <h3 className="text-base font-bold text-[#272d29]">
                {ban?.ten_ban || 'Chưa nhận diện bàn'}
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-[#72776f] bg-stone-100 px-2.5 py-1 rounded-md">
              
            </span>
          </div>

          {/* Danh sách món ăn */}
          <div className="py-3 space-y-2 border-b border-stone-100 text-xs">
            {chiTiet.map((item) => (
              <div key={`${item.mon_an_id}-${item.don_gia}`} className="flex justify-between items-center">
                <span className="text-[#272d29]">
                  {item.ten_mon} <span className="font-semibold text-stone-500">× {item.tong_so_luong}</span>
                </span>
                <span className="font-semibold text-[#272d29]">
                  {dinhDangTien(item.tong_thanh_tien || (item.don_gia * item.tong_so_luong))}
                </span>
              </div>
            ))}
          </div>

          {/* Chi tiết thanh toán */}
          <div className="pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-[#72776f]">
              <span>Tạm tính tiền món</span>
              <span className="font-semibold text-[#272d29]">{dinhDangTien(tongTienMon)}</span>
            </div>
            <div className="flex justify-between text-[#72776f]">
              <span>VAT {bill?.phanTramVat ?? 0}%</span>
              <span className="font-semibold text-[#272d29]">{dinhDangTien(vat)}</span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-bold text-sm text-[#272d29]">
              <span>Tổng thanh toán</span>
              <span className="text-lg text-[#b64d2d] font-extrabold">{dinhDangTien(tongCong)}</span>
            </div>
          </div>
        </div>

        {/* Nút chia tiền nhóm (C10) */}


        {/* Phương thức thanh toán */}
        <div className="space-y-2.5 pt-1">
          {/* Nút VietQR tại bàn */}
          <button
            disabled={!coVietQr}
            onClick={onChuyenVietQr}
            className="w-full py-3.5 px-4 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
          >
            <QrCode size={18} />
            <span>Thanh toán VietQR tại bàn</span>
          </button>

          {/* Nút thanh toán tiền mặt */}
          <button
            disabled={!ban?.id || daYeuCau}
            onClick={onThanhToanTienMat}
            className="w-full py-3 px-4 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-[#72776f] hover:text-[#272d29] flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Banknote size={16} />
            <span>Gọi thu ngân lập hóa đơn</span>
          </button>
        </div>
      </main>

      {/* Điều hướng cuối */}
      <DieuHuongDuoiKhach tabHienTai="monDaGoi" onChuyenTab={onChuyenTab} />

      {/* Modal C10 Chia tiền nhóm */}

    </div>
  );
}
