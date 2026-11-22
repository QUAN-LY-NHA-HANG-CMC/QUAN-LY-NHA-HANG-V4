// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MÀN HÌNH QUÉT MÃ VIETQR ĐỘNG TỰ ĐỘNG XÁC NHẬN (FIGMA C09 & P04)
// ============================================================================

import React, { useState } from 'react';
import { Copy, Check, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';

export default function TrangVietQR({ vietQr, tongTien, onQuayLai, onGiaLapThanhToan }) {
  const [daSaoChepTk, setDaSaoChepTk] = useState(false);
  const [daSaoChepNoidung, setDaSaoChepNoidung] = useState(false);

  const saoChep = (text, loai) => {
    navigator.clipboard.writeText(text);
    if (loai === 'tk') {
      setDaSaoChepTk(true);
      setTimeout(() => setDaSaoChepTk(false), 2000);
    } else {
      setDaSaoChepNoidung(true);
      setTimeout(() => setDaSaoChepNoidung(false), 2000);
    }
  };

  if (!vietQr) return null;

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-4">
      <button
        onClick={onQuayLai}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#72776f] hover:text-[#272d29]"
      >
        <ArrowLeft size={16} /> Quay lại
      </button>

      {/* Thẻ mã QR */}
      <div className="p-6 rounded-3xl bg-white border border-[#272d29]/10 shadow-lg text-center space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            VietQR NAPAS 24/7
          </span>
          <h2 className="text-lg font-bold text-[#272d29] mt-2">Quét mã chuyển khoản</h2>
          <p className="text-xs text-[#72776f]">Mở ứng dụng ngân hàng bất kỳ để quét mã bên dưới</p>
        </div>

        {/* Khung mã QR */}
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl inline-block shadow-inner">
          {vietQr.qrUrl ? (
            <img
              src={vietQr.qrUrl}
              alt="Mã VietQR Thanh Toán"
              className="w-56 h-56 object-contain rounded-xl mx-auto"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-xs text-stone-400">
              Đang tải mã QR...
            </div>
          )}
        </div>

        {/* Số tiền cần thanh toán */}
        <div className="space-y-0.5">
          <p className="text-xs text-[#72776f]">Số tiền thanh toán:</p>
          <p className="text-2xl font-bold text-[#b64d2d]">
            {dinhDangTien(tongTien || vietQr.soTien)}
          </p>
        </div>

        {/* Chi tiết tài khoản nhận */}
        <div className="p-3 bg-stone-50 rounded-xl space-y-2 text-xs text-left border border-stone-200/60">
          <div className="flex justify-between items-center">
            <span className="text-[#72776f]">Ngân hàng:</span>
            <span className="font-bold text-[#272d29]">{vietQr.nganHang || 'VietinBank (ICB)'}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#72776f]">Số tài khoản:</span>
            <div className="flex items-center gap-1.5 font-bold text-[#272d29]">
              <span>{vietQr.soTaiKhoan}</span>
              <button
                onClick={() => saoChep(vietQr.soTaiKhoan, 'tk')}
                className="p-1 hover:text-[#b64d2d] transition-colors"
                title="Sao chép"
              >
                {daSaoChepTk ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#72776f]">Chủ tài khoản:</span>
            <span className="font-bold text-[#272d29]">{vietQr.tenChuTaiKhoan}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#72776f]">Nội dung:</span>
            <div className="flex items-center gap-1.5 font-bold text-[#b64d2d]">
              <span>{vietQr.noiDung}</span>
              <button
                onClick={() => saoChep(vietQr.noiDung, 'nd')}
                className="p-1 hover:text-[#b64d2d] transition-colors"
                title="Sao chép nội dung"
              >
                {daSaoChepNoidung ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Trạng thái chờ */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#72776f] pt-1">
          <Loader2 size={16} className="animate-spin text-[#b64d2d]" />
          <span>Đang đợi nhận tiền tự động từ hệ thống ngân hàng...</span>
        </div>

        {onGiaLapThanhToan && (
          <button
            onClick={onGiaLapThanhToan}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors mt-2"
          >
            [Demo] Mô phỏng Khách đã chuyển khoản xong
          </button>
        )}
      </div>
    </div>
  );
}
