// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// W09 · GỘP BÀN (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { X, Merge, Check } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';

export default function ModalGopBan({
  banHienTai = { ma_ban: 'B08', ten_ban: 'Bàn 08', tam_tinh: 776000, so_khach: 4 },
  danhSachBan = [],
  onDong,
  onXacNhanGop
}) {
  const [banGop, setBanGop] = useState('');

  // Lọc các bàn khác đang có khách
  const banCoKhach = danhSachBan.filter(b => b.ma_ban !== banHienTai.ma_ban && !['trong', 'can_don_dep'].includes(b.trang_thai));
  const banChon = danhSachBan.find(b => b.ma_ban === banGop) || {};

  const tongTienSauGop = (banHienTai.tam_tinh || 0) + (banChon.tam_tinh || 0);
  const tongKhach = (banHienTai.so_khach || 0) + (banChon.so_khach || 0);

  const handleXacNhan = () => {
    onXacNhanGop({
      banChinh: banHienTai.ma_ban,
      banPhu: banGop,
      tongTien: tongTienSauGop
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] bg-[#f9f7f2] rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-5 border border-[#272d29]/10">
        <div className="flex justify-between items-center pb-3 border-b border-[#272d29]/10">
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
              GỘP HÓA ĐƠN & BÀN ĂN
            </span>
            <h3 className="text-lg font-bold text-[#272d29]">
              Gộp bàn cùng phục vụ
            </h3>
          </div>
          <button
            onClick={onDong}
            className="p-1.5 rounded-full hover:bg-stone-200 text-[#72776f]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Thông tin bàn 1 */}
        <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs my-3 text-xs flex justify-between items-center">
          <div>
            <span className="text-[#72776f]">Bàn đang chọn:</span>
            <p className="font-bold text-sm text-[#272d29]">{banHienTai.ten_ban}</p>
          </div>
          <span className="font-bold text-[#b64d2d]">{dinhDangTien(banHienTai.tam_tinh || 0)}</span>
        </div>

        {/* Chọn bàn muốn gộp */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-bold text-[#272d29] block">
            CHỌN BÀN MUỐN GỘP VÀO *
          </label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {banCoKhach.map((b) => (
              <label
                key={b.ma_ban}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  banGop === b.ma_ban
                    ? 'bg-[#2d4336] text-white border-[#2d4336]'
                    : 'bg-white text-[#272d29] border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="banGop"
                    value={b.ma_ban}
                    checked={banGop === b.ma_ban}
                    onChange={(e) => setBanGop(e.target.value)}
                    className="accent-[#b64d2d]"
                  />
                  <span className="font-bold">{b.ten_ban} ({b.so_khach || 0} khách)</span>
                </div>
                <span className={`font-semibold ${banGop === b.ma_ban ? 'text-emerald-200' : 'text-[#b64d2d]'}`}>
                  {dinhDangTien(b.tam_tinh ?? 0)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Kết quả sau gộp */}
        <div className="bg-[#ebf4ed] border border-[#226b4c]/30 rounded-xl p-4 mb-4 text-xs">
          <span className="font-bold text-[#226b4c] block mb-1">Sau khi gộp:</span>
          <div className="flex justify-between text-stone-700">
            <span>Tổng số khách:</span>
            <span className="font-bold">{tongKhach} khách</span>
          </div>
          <div className="flex justify-between text-stone-700 mt-1">
            <span>Hóa đơn hợp nhất:</span>
            <span className="font-bold text-sm text-[#b64d2d]">{dinhDangTien(tongTienSauGop)}</span>
          </div>
        </div>

        {/* Nút xác nhận */}
        <button
          disabled={!banGop}
            onClick={handleXacNhan}
          className="w-full py-3.5 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Merge size={16} />
          <span>Xác nhận gộp {banHienTai.ten_ban} & {banChon.ten_ban}</span>
        </button>
      </div>
    </div>
  );
}
