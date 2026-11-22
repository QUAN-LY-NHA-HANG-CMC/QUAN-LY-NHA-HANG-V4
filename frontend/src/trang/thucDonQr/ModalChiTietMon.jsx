// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// C03 · CHI TIẾT MÓN (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { X, Minus, Plus, AlertCircle } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';

export default function ModalChiTietMon({
  mon,
  onDong,
  onThemVaoGio
}) {
  const [soLuong, setSoLuong] = useState(1);
  const [ghiChu, setGhiChu] = useState('');
  if (!mon) return null;

  const soSuatConLai = mon.so_suat_con_lai;
  const hetMon = mon.con_mon === 0 || soSuatConLai === 0;
  const gioiHanToiDa = soSuatConLai !== null && soSuatConLai !== undefined ? soSuatConLai : 99;

  const tangSoLuong = () => {
    if (soLuong < gioiHanToiDa) {
      setSoLuong(prev => prev + 1);
    }
  };
  const giamSoLuong = () => setSoLuong(prev => Math.max(1, prev - 1));

  const tongTien = (mon.gia || mon.don_gia || 0) * soLuong;

  const handleXacNhan = () => {
    if (hetMon) return;
    onThemVaoGio({
      ...mon,
      so_luong: soLuong,
      ghi_chu: ghiChu,
      thanh_tien: tongTien
    });
    onDong();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] bg-[#f9f7f2] rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col border border-[#272d29]/10">
        {/* Hình ảnh và Nút đóng */}
        <div className={mon.hinh_anh ? 'relative w-full h-56 bg-stone-200 shrink-0' : 'relative h-12 shrink-0'}>
          {mon.hinh_anh && <img
            src={mon.hinh_anh}
            alt={mon.ten_mon}
            className="w-full h-full object-cover"
          />}
          <button
            onClick={onDong}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nội dung chi tiết */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Nhãn loại món & Số suất còn lại */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-[#f9ede6] text-[#b64d2d] rounded text-[11px] font-bold tracking-wider uppercase">
                {mon.nhan ? mon.nhan.toUpperCase() : 'MÓN CHÍNH'}
              </span>
              {soSuatConLai !== null && soSuatConLai !== undefined && (
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider ${
                  soSuatConLai === 0 || hetMon
                    ? 'bg-rose-100 text-rose-800'
                    : soSuatConLai <= 5
                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {soSuatConLai === 0 ? '✕ HẾT SUẤT HÔM NAY' : `CÒN ${soSuatConLai} SUẤT`}
                </span>
              )}
            </div>

            {/* Tên món và giá */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="text-xl font-bold text-[#272d29] leading-snug">
                {mon.ten_mon}
              </h2>
              <span className="text-lg font-bold text-[#b64d2d] shrink-0">
                {dinhDangTien(mon.gia)}
              </span>
            </div>

            {mon.mo_ta && <p className="text-sm text-[#6c746d] mb-4">{mon.mo_ta}</p>}
            {mon.danhSachMonCon?.length > 0 && (
              <ul className="mb-4 text-sm text-[#272d29]">
                {mon.danhSachMonCon.map(item => (
                  <li key={item.mon_an_id}>{item.so_luong} × {item.ten_mon}</li>
                ))}
              </ul>
            )}

            {/* Thông tin dị ứng */}
            <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl p-3.5 mb-5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#795c21] mb-1">
                <AlertCircle size={15} />
                <span>Thông tin dị ứng</span>
              </div>
              <p className="text-xs text-[#795c21] leading-relaxed">
                {mon.di_ung || 'Vui lòng hỏi nhân viên về thành phần nếu bạn có dị ứng thực phẩm.'}
              </p>
            </div>

            {/* Chọn số lượng */}
            <div className="flex items-center justify-between py-3 border-y border-[#272d29]/10 mb-4">
              <span className="text-sm font-bold text-[#272d29]">Số lượng</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={giamSoLuong}
                  className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-[#272d29] hover:bg-stone-200/50 transition-colors disabled:opacity-40"
                  disabled={soLuong <= 1}
                >
                  <Minus size={15} />
                </button>
                <span className="w-8 text-center font-bold text-base text-[#272d29]">
                  {soLuong}
                </span>
                <button
                  type="button"
                  onClick={tangSoLuong}
                  className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-[#272d29] hover:bg-stone-200/50 transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Ghi chú cho bếp */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-[#272d29] mb-1.5">
                Ghi chú cho bếp
              </label>
              <textarea
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="Ví dụ: Ít cay, thịt chín vừa, không hành..."
                maxLength={200}
                rows={2}
                className="w-full text-sm bg-white border border-stone-200 rounded-xl p-3 text-[#272d29] focus:outline-none focus:ring-2 focus:ring-[#b64d2d]/20 focus:border-[#b64d2d] transition-all"
              />
              <div className="flex justify-between items-center text-[11px] text-[#72776f] mt-1 px-1">
                <span>Áp dụng cho cả {soLuong} phần</span>
                <span>{ghiChu.length}/200 ký tự</span>
              </div>
            </div>
          </div>

          {/* Nút thêm vào giỏ */}
          <button
            onClick={handleXacNhan}
            disabled={hetMon}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-between shadow-md transition-all ${
              hetMon
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-[#b64d2d] hover:bg-[#a14022] text-white active:scale-[0.99]'
            }`}
          >
            <span>{hetMon ? 'Món đã hết suất phục vụ hôm nay' : 'Thêm vào giỏ'}</span>
            {!hetMon && <span>{dinhDangTien(tongTien)}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
