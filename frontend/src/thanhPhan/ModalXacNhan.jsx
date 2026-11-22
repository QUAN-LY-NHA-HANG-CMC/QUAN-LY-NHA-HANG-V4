// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MODAL XÁC NHẬN HÀNH ĐỘNG CHUẨN THIẾT KẾ FIGMA (THAY THẾ WINDOW.CONFIRM)
// ============================================================================

import React from 'react';
import { AlertTriangle, AlertCircle, Trash2, Ban, UserCheck, X } from 'lucide-react';

export default function ModalXacNhan({
  hienThi,
  tieuDe = 'Xác nhận hành động',
  phanLoai = 'QUẢN TRỊ NHÀ HÀNG',
  noiDung,
  canhBaoPhu,
  loi,
  loai = 'nguyHiem', // 'nguyHiem', 'canhBao', 'thongTin'
  nhanNutXacNhan = 'Xác nhận',
  nhanNutHuy = 'Hủy bỏ',
  onXacNhan,
  onHuy,
  dangXuLy = false
}) {
  if (!hienThi) return null;

  const bieuTuong = {
    nguyHiem: <Trash2 size={24} className="text-rose-600" />,
    canhBao: <Ban size={24} className="text-amber-600" />,
    moKhoa: <UserCheck size={24} className="text-[#226b4c]" />,
    thongTin: <AlertCircle size={24} className="text-[#b64d2d]" />
  }[loai] || <AlertTriangle size={24} className="text-amber-600" />;

  const mauNutXacNhan = {
    nguyHiem: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
    canhBao: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
    moKhoa: 'bg-[#226b4c] hover:bg-[#1b553c] text-white shadow-emerald-200',
    thongTin: 'bg-[#b64d2d] hover:bg-[#a14022] text-white shadow-orange-200'
  }[loai] || 'bg-[#b64d2d] hover:bg-[#a14022] text-white';

  const mauVienIcon = {
    nguyHiem: 'bg-rose-50 border-rose-200',
    canhBao: 'bg-amber-50 border-amber-200',
    moKhoa: 'bg-emerald-50 border-emerald-200',
    thongTin: 'bg-[#f9ede6] border-[#b64d2d]/30'
  }[loai] || 'bg-stone-50 border-stone-200';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 relative">
        {/* Nút đóng góc phải */}
        <button
          type="button"
          onClick={onHuy}
          disabled={dangXuLy}
          aria-label="Đóng hộp xác nhận"
          className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header với Icon */}
        <div className="flex items-start gap-4 pb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${mauVienIcon}`}>
            {bieuTuong}
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider block">
              {phanLoai}
            </span>
            <h3 className="text-lg font-bold text-[#272d29] leading-snug mt-0.5">
              {tieuDe}
            </h3>
          </div>
        </div>

        {/* Nội dung thông báo */}
        <div className="py-2 text-xs space-y-2.5">
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-[#272d29] font-medium leading-relaxed">
            {noiDung}
          </div>

          {canhBaoPhu && (
            <p className="text-[11px] text-stone-500 italic px-1">
              {canhBaoPhu}
            </p>
          )}
          {loi && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 font-semibold text-rose-800">{loi}</p>}
        </div>

        {/* Nút hành động */}
        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onHuy}
            disabled={dangXuLy}
            className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-[#272d29] rounded-xl font-bold text-xs transition-colors"
          >
            {nhanNutHuy}
          </button>
          <button
            type="button"
            onClick={onXacNhan}
            disabled={dangXuLy}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-50 ${mauNutXacNhan}`}
          >
            {dangXuLy ? 'Đang thực hiện...' : nhanNutXacNhan}
          </button>
        </div>
      </div>
    </div>
  );
}
