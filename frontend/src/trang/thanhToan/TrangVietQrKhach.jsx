// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// C09 · VIETQR TẠI BÀN (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Download, Copy, Check } from 'lucide-react';
import HeaderKhach from '../../thanhPhan/HeaderKhach';
import DieuHuongDuoiKhach from '../../thanhPhan/DieuHuongDuoiKhach';
import { dinhDangTien } from '../../dungChung/dinhDang';

export default function TrangVietQrKhach({
  ban, tongTien, vietQr, onQuayLaiYeuCau, onChuyenTab
}) {
  const [daSaoChepStk, setDaSaoChepStk] = useState(false);
  const [daSaoChepNd, setDaSaoChepNd] = useState(false);
  const { nganHang, soTaiKhoan: soTk, tenChuTaiKhoan: chuTk, noiDung: noiDungCk, qrUrl } = vietQr;

  const handleCopyStk = () => {
    navigator.clipboard?.writeText(soTk);
    setDaSaoChepStk(true);
    setTimeout(() => setDaSaoChepStk(false), 2000);
  };

  const handleCopyNd = () => {
    navigator.clipboard?.writeText(noiDungCk);
    setDaSaoChepNd(true);
    setTimeout(() => setDaSaoChepNd(false), 2000);
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#f9f7f2] flex flex-col justify-between pb-24 shadow-xl border-x border-[#272d29]/5">
      <HeaderKhach
        tieuDe="VietQR tại bàn"
        ban={ban}
        onQuayLai={onQuayLaiYeuCau}
      />

      <main className="px-5 py-4 flex-1 space-y-4">
        {/* Banner tổng số tiền */}
        <div className="bg-[#2d4336] text-white rounded-2xl p-4.5 text-center shadow-md">
          <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider block mb-1">
            TỔNG THANH TOÁN
          </span>
          <h2 className="text-3xl font-extrabold text-[#f9ede6]">
            {dinhDangTien(tongTien)}
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-white/80">
            <ShieldCheck size={14} className="text-emerald-300" />
            <span>VIETQR · NAPAS 247 TỰ ĐỘNG KHỚP LỆNH</span>
          </div>
        </div>

        {/* Khung chứa mã QR */}
        <div className="bg-white rounded-2xl p-5 border border-[#272d29]/10 shadow-xs flex flex-col items-center">
          <div className="w-60 h-60 bg-stone-50 rounded-xl p-2 border border-stone-200 flex items-center justify-center overflow-hidden">
            <img
              src={qrUrl}
              alt="Mã VietQR thanh toán"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-xs text-[#72776f] mt-3 text-center">
            Mở App ngân hàng bất kỳ để quét mã và chuyển khoản đúng số tiền
          </p>
        </div>

        {/* Thông tin chuyển khoản thủ công */}
        <div className="bg-white rounded-xl p-4 border border-[#272d29]/10 shadow-xs space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-stone-100">
            <span className="text-[#72776f]">Ngân hàng:</span>
            <span className="font-bold text-[#272d29]">{nganHang}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-stone-100">
            <span className="text-[#72776f]">Số tài khoản:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-[#272d29]">{soTk}</span>
              <button
                onClick={handleCopyStk}
                className="p-1 hover:bg-stone-100 rounded text-[#b64d2d]"
                title="Sao chép STK"
              >
                {daSaoChepStk ? <Check size={14} className="text-[#226b4c]" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-stone-100">
            <span className="text-[#72776f]">Chủ tài khoản:</span>
            <span className="font-semibold text-[#272d29]">{chuTk}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-[#72776f]">Nội dung chuyển:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-[#b64d2d] bg-[#f9ede6] px-2 py-0.5 rounded">
                {noiDungCk}
              </span>
              <button
                onClick={handleCopyNd}
                className="p-1 hover:bg-stone-100 rounded text-[#b64d2d]"
                title="Sao chép nội dung"
              >
                {daSaoChepNd ? <Check size={14} className="text-[#226b4c]" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Nút xác nhận chuyển khoản xong */}
        <p role="status" className="text-sm text-center text-stone-700">
          Đang chờ thu ngân xác nhận tiền đã vào tài khoản.
        </p>
      </main>

      <DieuHuongDuoiKhach tabHienTai="monDaGoi" onChuyenTab={onChuyenTab} />
    </div>
  );
}
