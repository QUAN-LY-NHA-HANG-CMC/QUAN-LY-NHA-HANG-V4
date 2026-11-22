// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// P07 · IN HÓA ĐƠN K80 (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React from 'react';
import { X, Printer, Check } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';
export default function ModalInHoaDonK80({ ban, hoaDon, onDong }) {
  const { danhSachMon: chiTiet, tong_tien_mon: tongTienMon,
    tien_vat: vat, tong_tien_thanh_toan: tongCong, tien_chiet_khau: giamGia,
    ma_hoa_don: maHoaDon, ten_thu_ngan: thuNgan } = hoaDon;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Thanh công cụ xem trước và in */}
        <div className="bg-[#272d29] text-white p-4 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              XEM TRƯỚC BẢN IN
            </span>
            <h3 className="font-bold text-sm">Hóa đơn nhiệt K80 (80mm)</h3>
          </div>
          <button onClick={onDong} className="p-1 rounded-full hover:bg-white/10 text-white/70">
            <X size={18} />
          </button>
        </div>

        {/* Nội dung hóa đơn cuộn khổ giấy nhiệt K80 */}
        <div className="hoa-don-k80 p-6 overflow-y-auto flex-1 font-mono text-xs text-[#272d29] space-y-3 bg-[#faf9f6]">
          {/* Header nhà hàng */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-stone-300">
            <h2 className="font-sans font-black text-2xl tracking-tighter text-[#b64d2d]">mộc</h2>
          </div>

          {/* Thông tin hóa đơn */}
          <div className="py-2 border-b border-dashed border-stone-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>HÓA ĐƠN: #{maHoaDon}</span>
              <span>BÀN: {ban.ten_ban}</span>
            </div>
            <div className="flex justify-between">
              <span>Ngày: {hoaDon.thoi_gian_thanh_toan || hoaDon.ngay_tao}</span>
              <span>Thu ngân: {thuNgan}</span>
            </div>
          </div>

          {/* Chi tiết từng món */}
          <div className="py-2 border-b border-dashed border-stone-300 space-y-1.5 text-[11px]">
            <div className="flex justify-between font-bold border-b pb-1 text-stone-500">
              <span>Tên món</span>
              <span>SL × Giá</span>
              <span>T.Tiền</span>
            </div>
            {chiTiet.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="truncate max-w-[140px]">{item.ten_mon}</span>
                <span className="text-stone-500">{item.so_luong} × {item.don_gia / 1000}k</span>
                <span className="font-semibold">{dinhDangTien(item.thanh_tien)}</span>
              </div>
            ))}
          </div>

          {/* Tổng kết tiền */}
          <div className="py-2 border-b border-dashed border-stone-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Tiền món:</span>
              <span>{dinhDangTien(tongTienMon)}</span>
            </div>
            <div className="flex justify-between">
              <span>Thuế GTGT (VAT {hoaDon.phan_tram_vat}%):</span>
              <span>{dinhDangTien(vat)}</span>
            </div>
            {giamGia > 0 && (
              <div className="flex justify-between text-[#a42c35] font-bold">
                <span>Chiết khấu:</span>
                <span>-{dinhDangTien(giamGia)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-sans font-black pt-1 border-t text-[#272d29]">
              <span>TỔNG CỘNG:</span>
              <span>{dinhDangTien(tongCong)}</span>
            </div>
          </div>

          {/* QR đánh giá & Lời cảm ơn */}
          <div className="text-center pt-3 space-y-2">
            <p className="font-bold text-[11px]">CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!</p>
            <p className="text-[10px] text-stone-500">Quét mã QR trên bàn để gửi góp ý cho nhà hàng</p>
          </div>
        </div>

        {/* Nút in */}
        <div className="p-4 bg-white border-t border-stone-200">
          <button
            onClick={() => {
              window.print();
              onDong();
            }}
            className="w-full py-3.5 bg-[#2d4336] hover:bg-[#202e28] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Printer size={18} />
            <span>In hóa đơn K80</span>
          </button>
        </div>
      </div>
    </div>
  );
}
