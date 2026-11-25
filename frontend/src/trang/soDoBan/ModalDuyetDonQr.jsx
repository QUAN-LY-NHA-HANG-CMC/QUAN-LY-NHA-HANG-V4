// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// W04 · DUYỆT ĐƠN QR (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React from 'react';
import { X, CheckCircle2, XCircle, Send } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';
import { hienThiGioVietNam } from '../../dungChung/thoiGian';

export default function ModalDuyetDonQr({
  donMon,
  onDong,
  onDuyetThanhCong,
  onTuChoi
}) {
  const chiTiet = donMon.chi_tiet;
  const tongTien = donMon.tong_tien_mon;

  const handleDuyet = () => {
    onDuyetThanhCong();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] bg-[#f9f7f2] rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 border border-[#272d29]/10">
        <div className="flex justify-between items-center pb-3 border-b border-[#272d29]/10">
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
              XÁC THỰC GỌI MÓN QR
            </span>
            <h3 className="text-lg font-bold text-[#272d29]">
              {donMon.ten_ban || 'Bàn 08'} · #{donMon.ma_don || 'ORD-081'}
            </h3>
          </div>
          <button
            onClick={onDong}
            className="p-1.5 rounded-full hover:bg-stone-200 text-[#72776f]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[#72776f] my-3 leading-relaxed">
          Khách vừa gửi yêu cầu qua QR lúc {hienThiGioVietNam(donMon.thoi_gian)}. Vui lòng kiểm tra lại trước khi chuyển xuống Bếp KDS.
        </p>

        {/* Danh sách món */}
        <div className="space-y-2.5 my-3">
          {chiTiet.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-3 border border-[#272d29]/10 shadow-xs"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-[#272d29]">
                  {item.ten_mon} <span className="text-[#b64d2d]">× {item.so_luong}</span>
                </span>
                <span className="font-semibold text-xs text-[#272d29]">
                  {dinhDangTien(item.thanh_tien)}
                </span>
              </div>
              {item.ghi_chu && (
                <p className="text-[11px] text-[#795c21] bg-amber-50 px-2 py-0.5 rounded mt-1.5 inline-block">
                  Ghi chú: {item.ghi_chu}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Tổng tiền */}
        <div className="bg-white rounded-xl p-3.5 border border-[#272d29]/10 shadow-xs flex justify-between items-baseline font-bold text-sm my-3">
          <span>Tổng tiền 4 món:</span>
          <span className="text-base text-[#b64d2d]">{dinhDangTien(tongTien)}</span>
        </div>

        {/* Nút hành động */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleDuyet}
            className="w-full py-3.5 px-4 bg-[#226b4c] hover:bg-[#1a553c] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
          >
            <Send size={16} />
            <span>Duyệt và gửi Bếp KDS ngay</span>
          </button>

          <button
            onClick={onTuChoi}
            className="w-full py-2.5 px-4 text-xs text-[#a42c35] hover:bg-rose-50 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <XCircle size={15} />
            <span>Từ chối đơn gọi món (W05)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
