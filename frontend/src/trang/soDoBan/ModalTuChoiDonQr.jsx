// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// W05 · TỪ CHỐI ĐƠN QR (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function ModalTuChoiDonQr({
  ban = { ma_ban: 'B08', ten_ban: 'BÀN 08' },
  onDong,
  onXacNhanTuChoi
}) {
  const [lyDo, setLyDo] = useState('Món vừa hết nguyên liệu');
  const [ghiChu, setGhiChu] = useState('');

  const danhSachLyDo = [
    'Món vừa hết nguyên liệu',
    'Bàn chưa có khách ngồi / Quét nhầm mã QR',
    'Khách yêu cầu hủy đơn qua nhân viên',
    'Thông tin gọi món không rõ ràng'
  ];

  const handleXacNhan = () => {
    onXacNhanTuChoi({ lyDo, ghiChu });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] bg-[#f9f7f2] rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-5 border border-[#272d29]/10">
        <div className="flex justify-between items-center pb-3 border-b border-[#272d29]/10">
          <div>
            <span className="text-[11px] font-bold text-[#a42c35] uppercase tracking-wider">
              ĐƠN QR / {ban.ten_ban || 'BÀN 08'}
            </span>
            <h3 className="text-lg font-bold text-[#272d29]">
              Từ chối đơn gọi món
            </h3>
          </div>
          <button
            onClick={onDong}
            className="p-1.5 rounded-full hover:bg-stone-200 text-[#72776f]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[#72776f] my-3 leading-relaxed">
          Khách sẽ nhận thông báo kèm lý do từ chối trên màn hình E-Menu. Đơn sẽ chưa được chuyển tới Bếp.
        </p>

        {/* Lựa chọn lý do */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-bold text-[#272d29] block">
            LÝ DO TỪ CHỐI *
          </label>
          <div className="space-y-1.5">
            {danhSachLyDo.map((item) => (
              <label
                key={item}
                className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-stone-200 cursor-pointer hover:border-[#b64d2d]/30 text-xs text-[#272d29]"
              >
                <input
                  type="radio"
                  name="lyDoTuChoi"
                  value={item}
                  checked={lyDo === item}
                  onChange={(e) => setLyDo(e.target.value)}
                  className="accent-[#b64d2d]"
                />
                <span className="font-medium">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ghi chú chi tiết */}
        <div className="mb-4">
          <label className="text-xs font-bold text-[#272d29] block mb-1">
            Ghi chú thêm cho khách (tùy chọn)
          </label>
          <textarea
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            placeholder="Nhập chi tiết nhắn gửi tới khách..."
            rows={2}
            className="w-full text-xs bg-white border border-stone-200 rounded-xl p-3 text-[#272d29] focus:outline-none focus:ring-2 focus:ring-[#b64d2d]/20 focus:border-[#b64d2d]"
          />
        </div>

        {/* Nút hành động */}
        <div className="space-y-2">
          <button
            onClick={handleXacNhan}
            className="w-full py-3.5 px-4 bg-[#a42c35] hover:bg-[#8e242c] text-white rounded-xl font-bold text-sm shadow-md transition-all"
          >
            Xác nhận từ chối đơn
          </button>

          <button
            onClick={onDong}
            className="w-full py-2.5 text-xs text-[#72776f] hover:text-[#272d29] font-semibold"
          >
            Quay lại kiểm tra đơn
          </button>
        </div>
      </div>
    </div>
  );
}
