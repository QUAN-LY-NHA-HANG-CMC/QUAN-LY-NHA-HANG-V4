// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// C11 · THANH TOÁN THÀNH CÔNG (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React from 'react';
import { Check, Star, ArrowRight } from 'lucide-react';
import HeaderKhach from '../../thanhPhan/HeaderKhach';
import { dinhDangTien } from '../../dungChung/dinhDang';
import { hienThiGioVietNam } from '../../dungChung/thoiGian';

const TEN_PHUONG_THUC = { tien_mat: 'Tiền mặt', vietqr: 'VietQR', ket_hop: 'Kết hợp' };

export default function TrangThanhToanThanhCong({
  ban,
  hoaDon,
  onDanhGia,
  onVeTrangChu
}) {
  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#f9f7f2] flex flex-col justify-between p-5 pb-8 shadow-xl border-x border-[#272d29]/5">
      <HeaderKhach tieuDe="Thanh toán thành công" ban={ban} />

      <main className="flex-1 flex flex-col items-center justify-center text-center py-6">
        {/* Vòng tròn checkmark xanh lá cây */}
        <div className="w-20 h-20 bg-[#ebf4ed] text-[#226b4c] rounded-full flex items-center justify-center shadow-lg border-4 border-white mb-4 animate-bounce">
          <Check size={40} className="stroke-[3]" />
        </div>

        <span className="text-xs font-bold tracking-widest text-[#226b4c] uppercase">
          XÁC NHẬN THÀNH CÔNG
        </span>
        <h2 className="text-2xl font-extrabold text-[#272d29] mt-1 mb-2">
          Cảm ơn bạn!
        </h2>
        <p className="text-xs text-[#6c746d] max-w-xs mx-auto leading-relaxed mb-6">
          Thu ngân đã xác nhận thanh toán cho {ban.ten_ban || ban.ma_ban}. Hẹn gặp lại bạn tại Mộc trong những bữa ngon sắp tới.
        </p>

        {/* Hộp tóm tắt hóa đơn */}
        <div className="w-full bg-white rounded-2xl p-4 border border-[#272d29]/10 shadow-xs text-left mb-6 space-y-2 text-xs">
          <div className="flex justify-between text-[#72776f]">
            <span>Mã hóa đơn:</span>
            <span className="font-mono font-bold text-[#272d29]">#{hoaDon.ma_hoa_don}</span>
          </div>
          <div className="flex justify-between text-[#72776f]">
            <span>Thời gian thanh toán:</span>
            <span className="font-semibold text-[#272d29]">{hienThiGioVietNam(hoaDon.thoi_gian_thanh_toan)}</span>
          </div>
          <div className="flex justify-between text-[#72776f]">
            <span>Phương thức:</span>
            <span className="font-semibold text-[#272d29]">{TEN_PHUONG_THUC[hoaDon.phuong_thuc_thanh_toan] ?? '—'}</span>
          </div>
          <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-bold text-sm text-[#272d29]">
            <span>Tổng tiền đã thanh toán:</span>
            <span className="text-base text-[#226b4c] font-extrabold">{dinhDangTien(hoaDon.tong_tien_thanh_toan)}</span>
          </div>
        </div>

        {/* Nút đánh giá dịch vụ (C12) */}
        <div className="w-full space-y-3">
          <button
            onClick={onDanhGia}
            className="w-full py-3.5 px-4 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
          >
            <Star size={18} className="fill-current" />
            <span>Đánh giá trải nghiệm bữa ăn (C12)</span>
          </button>

          <button
            onClick={onVeTrangChu}
            className="w-full py-3 px-4 bg-white hover:bg-stone-50 border border-stone-300 text-[#72776f] hover:text-[#272d29] rounded-xl text-xs font-semibold transition-colors"
          >
            Quay lại trang chủ
          </button>
        </div>
      </main>
    </div>
  );
}
