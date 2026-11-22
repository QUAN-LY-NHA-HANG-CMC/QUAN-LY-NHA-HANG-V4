// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A03 · HỒ SƠ NHÂN VIÊN (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, Award, Shield } from 'lucide-react';

export default function ModalHoSoNhanVien({
  nhanVien,
  onDong
}) {
  if (!nhanVien) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-stone-200">
        <div className="flex justify-between items-start pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#f9ede6] text-[#b64d2d] flex items-center justify-center font-black text-xl">
              {nhanVien.ho_ten ? nhanVien.ho_ten.split(' ').pop().charAt(0) : 'N'}
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider block">
                {nhanVien.ma_nv || `NV-${String(nhanVien.id).padStart(3, '0')}`}
              </span>
              <h3 className="text-xl font-bold text-[#272d29]">
                {nhanVien.ho_ten}
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {nhanVien.ten_vai_tro || nhanVien.vai_tro_ten || (nhanVien.ma_vai_tro === 'quan_ly' ? 'Quản lý' : nhanVien.ma_vai_tro === 'thu_ngan' ? 'Thu ngân' : nhanVien.ma_vai_tro === 'bep' ? 'Đầu bếp' : 'Nhân viên Phục vụ')}
              </p>
            </div>
          </div>
          <button onClick={onDong} className="p-1 rounded-full hover:bg-stone-100 text-stone-500">
            <X size={18} />
          </button>
        </div>

        <div className="py-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-[11px]">Số điện thoại</span>
              <span className="font-bold text-[#272d29]">{nhanVien.so_dien_thoai || '—'}</span>
            </div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-[11px]">Email công vụ</span>
              <span className="font-bold text-[#272d29] truncate block">{nhanVien.email || 'Chưa cập nhật'}</span>
            </div>
          </div>

          {/* Khu vực bàn phụ trách (Chỉ dành cho Phục vụ) */}
          {(nhanVien.ma_vai_tro === 'phuc_vu' || nhanVien.vai_tro === 'phuc_vu') && (
            <div className="bg-orange-50/60 p-3 rounded-xl border border-orange-200/60">
              <span className="text-[#b64d2d] block text-[11px] font-bold uppercase tracking-wider">
                Bàn phụ trách được giao
              </span>
              <span className="font-bold text-[#2d4336] text-xs mt-0.5 block">
                {nhanVien.khu_vuc_phu_trach || 'Chưa phân công bàn'}
              </span>
            </div>
          )}

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <span className="text-stone-500 block text-[11px]">Ngày gia nhập nhà hàng</span>
            <span className="font-semibold text-stone-800">{nhanVien.ngay_vao_lam || new Date().toISOString().slice(0, 10)}</span>
          </div>

          {/* Đánh giá hiệu suất */}
          <div className="bg-[#ebf4ed] p-3.5 rounded-xl border border-[#226b4c]/20 flex justify-between items-center">
            <div>
              <span className="text-[#226b4c] font-bold block">Hiệu suất phục vụ ca</span>
              <span className="text-[11px] text-stone-600">Đánh giá 4.9/5 sao từ khách hàng QR</span>
            </div>
            <span className="font-black text-lg text-[#226b4c]">98%</span>
          </div>
        </div>

        <button
          onClick={onDong}
          className="w-full py-3 bg-[#272d29] hover:bg-stone-800 text-white rounded-xl font-bold text-xs transition-colors"
        >
          Đóng hồ sơ
        </button>
      </div>
    </div>
  );
}
