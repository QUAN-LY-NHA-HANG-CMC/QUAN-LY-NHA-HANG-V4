// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// P04 · THANH TOÁN VIETQR MÀN HÌNH POS (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';

export default function ModalThanhToanVietQrPos({
  ban, tongTien, vietQr, dangLuu, loi, onDong, onXacNhanThanhToan
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-stone-200">
        <div className="flex justify-between items-center pb-3 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
              THANH TOÁN VIETQR
            </span>
            <h3 className="text-lg font-bold text-[#272d29]">
              Quét mã VietQR · {ban.ten_ban}
            </h3>
          </div>
          <button onClick={onDong} className="p-1 rounded-full hover:bg-stone-100 text-stone-500">
            <X size={18} />
          </button>
        </div>

        <div className="py-4 flex flex-col items-center text-xs">
          {/* Tổng tiền */}
          <div className="w-full bg-[#2d4336] text-white p-3 rounded-xl text-center mb-4">
            <span className="text-[11px] text-emerald-200 uppercase tracking-wider block">
              SỐ TIỀN THANH TOÁN
            </span>
            <span className="text-2xl font-black text-[#f9ede6]">
              {dinhDangTien(tongTien)}
            </span>
          </div>

          {/* Ảnh mã QR */}
          <div className="w-64 h-64 bg-stone-50 rounded-2xl p-3 border-2 border-dashed border-stone-300 flex items-center justify-center mb-4">
            <img src={vietQr?.qrUrl} alt="VietQR POS" className="w-full h-full object-contain" />
          </div>

          <p className="text-stone-600 text-center">
            Đối chiếu số tiền và nội dung chuyển khoản trên tài khoản nhận trước khi xác nhận.
          </p>
          {loi && <p role="alert" className="text-red-700">{loi}</p>}

        </div>

        <button
          disabled={dangLuu || !vietQr}
          onClick={onXacNhanThanhToan}
          className="w-full py-3.5 bg-[#226b4c] hover:bg-[#1a553c] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={18} />
          <span>Thu ngân xác nhận đã nhận tiền (Thủ công)</span>
        </button>
      </div>
    </div>
  );
}
