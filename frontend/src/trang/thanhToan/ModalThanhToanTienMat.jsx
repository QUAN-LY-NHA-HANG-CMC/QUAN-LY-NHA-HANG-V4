// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// P03 · THANH TOÁN TIỀN MẶT (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { X, Banknote, Check } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';

export default function ModalThanhToanTienMat({
  tongTien, dangLuu, chanThu, loi,
  onDong,
  onXacNhanThanhToan
}) {
  const [tienKhachDua, setTienKhachDua] = useState(0);
  const chiDongBan = tongTien === 0;

  const tienThoi = Math.max(0, tienKhachDua - tongTien);
  const chuaDu = tienKhachDua < tongTien;

  const handleXacNhan = () => {
    onXacNhanThanhToan({
      phuongThuc: 'tien_mat',
      tongTien,
      tienKhachDua,
      tienThoi
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-stone-200">
        <div className="flex justify-between items-center pb-3 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
              QUẦY THU NGÂN
            </span>
            <h3 className="text-lg font-bold text-[#272d29]">
              {chiDongBan ? 'Chốt bill, đóng bàn' : 'Thanh toán tiền mặt'}
            </h3>
          </div>
          <button onClick={onDong} className="p-1 rounded-full hover:bg-stone-100 text-stone-500">
            <X size={18} />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          {/* Tổng tiền cần thu */}
          <div className="bg-[#2d4336] text-white p-4 rounded-xl text-center">
            <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider block">
              TỔNG CẦN THU
            </span>
            <h2 className="text-2xl font-black text-[#f9ede6] mt-1">
              {dinhDangTien(tongTien)}
            </h2>
          </div>

          {chiDongBan ? <p className="text-center text-sm text-stone-600">Số tiền còn phải thu là 0đ. Xác nhận để hoàn tất bill và chuyển bàn sang Cần dọn dẹp.</p> : <>
          {/* Ô nhập tiền khách đưa */}
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">
              TIỀN KHÁCH ĐƯA (VNĐ)
            </label>
            <input
              type="number"
              value={tienKhachDua}
              onChange={(e) => setTienKhachDua(Number(e.target.value))}
              step={1000}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-lg font-bold text-[#272d29] focus:outline-none focus:border-[#b64d2d]"
            />
          </div>

          {/* Nút chọn mệnh giá tiền nhanh */}
          <div className="grid grid-cols-3 gap-2">
            {[850000, 900000, 1000000].map((mg) => (
              <button
                key={mg}
                type="button"
                onClick={() => setTienKhachDua(mg)}
                className={`py-2 px-1 rounded-lg border font-bold text-xs transition-colors ${
                  tienKhachDua === mg
                    ? 'bg-[#b64d2d] text-white border-[#b64d2d]'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
              >
                {dinhDangTien(mg)}
              </button>
            ))}
          </div>

          {/* Tiền thối lại */}
          <div className={`p-4 rounded-xl border flex justify-between items-center ${
            chuaDu
              ? 'bg-rose-50 border-rose-200 text-[#a42c35]'
              : 'bg-[#ebf4ed] border-[#226b4c]/30 text-[#226b4c]'
          }`}>
            <div>
              <span className="font-bold block">
                {chuaDu ? 'Chưa đủ tiền:' : 'Tiền thối lại khách:'}
              </span>
              <span className="text-[11px] text-stone-500">
                {chuaDu ? 'Vui lòng nhận thêm' : 'Đếm kỹ trước khi gửi khách'}
              </span>
            </div>
            <span className="text-xl font-black">
              {dinhDangTien(chuaDu ? (tongTien - tienKhachDua) : tienThoi)}
            </span>
          </div>
          </>}
        </div>

        {loi && <p role="alert" className="text-red-700">{loi}</p>}
        <button
          onClick={handleXacNhan}
          disabled={chuaDu || dangLuu || chanThu}
          className="w-full py-3.5 bg-[#226b4c] hover:bg-[#1a553c] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Check size={18} />
          <span>{chiDongBan ? 'Xác nhận đóng bàn & In bill' : 'Xác nhận nhận đủ tiền & In bill'}</span>
        </button>
      </div>
    </div>
  );
}
