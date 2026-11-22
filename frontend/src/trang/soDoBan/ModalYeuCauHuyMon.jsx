// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// W10 · YÊU CẦU HỦY MÓN (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Send } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';

export default function ModalYeuCauHuyMon({
  ban = { ma_ban: 'B08', ten_ban: 'BÀN 08' },
  danhSachMon = [
    { id: 103, ten_mon: 'Cơm chiên hải sản', so_luong: 1, don_gia: 129000, trang_thai: 'cho_duyet' },
    { id: 101, ten_mon: 'Bò lúc lắc', so_luong: 2, don_gia: 189000, trang_thai: 'dang_nau' }
  ],
  onDong,
  onGuiYeuCauHuy
}) {
  const [monChonId, setMonChonId] = useState(danhSachMon[0]?.id || 103);
  const [lyDo, setLyDo] = useState('Khách đổi ý trước khi chế biến');
  const [ghiChu, setGhiChu] = useState('');

  const danhSachLyDo = [
    'Khách đổi ý trước khi chế biến',
    'Món chờ quá lâu khách muốn hủy',
    'Nhân viên ghi nhận nhầm bàn / nhầm món',
    'Bếp báo hết nguyên liệu tươi'
  ];

  const monChon = danhSachMon.find(m => m.id === monChonId) || danhSachMon[0];

  const handleGui = () => {
    onGuiYeuCauHuy({
      banMa: ban.ma_ban,
      monId: monChonId,
      tenMon: monChon?.ten_mon,
      lyDo,
      ghiChu
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] bg-[#f9f7f2] rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-5 border border-[#272d29]/10">
        <div className="flex justify-between items-center pb-3 border-b border-[#272d29]/10">
          <div>
            <span className="text-[11px] font-bold text-[#a42c35] uppercase tracking-wider">
              KIỂM TOÁN HỦY MÓN
            </span>
            <h3 className="text-lg font-bold text-[#272d29]">
              Yêu cầu hủy món · {ban.ten_ban || 'Bàn 08'}
            </h3>
          </div>
          <button
            onClick={onDong}
            className="p-1.5 rounded-full hover:bg-stone-200 text-[#72776f]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chọn món cần hủy */}
        <div className="space-y-2 my-3">
          <label className="text-xs font-bold text-[#272d29] block">
            CHỌN MÓN MUỐN HỦY *
          </label>
          <div className="space-y-1.5">
            {danhSachMon.map((item) => (
              <label
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  monChonId === item.id
                    ? 'bg-rose-50 border-[#a42c35] text-[#272d29]'
                    : 'bg-white border-stone-200 text-[#72776f]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="monHuy"
                    value={item.id}
                    checked={monChonId === item.id}
                    onChange={() => setMonChonId(item.id)}
                    className="accent-[#a42c35]"
                  />
                  <div>
                    <p className="font-bold text-sm text-[#272d29]">{item.ten_mon} × {item.so_luong}</p>
                    <p className="text-[11px] text-[#72776f]">Trạng thái: {item.trang_thai}</p>
                  </div>
                </div>
                <span className="font-bold text-xs text-[#a42c35]">
                  {dinhDangTien(item.don_gia * item.so_luong)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Chọn lý do */}
        <div className="space-y-2 mb-3">
          <label className="text-xs font-bold text-[#272d29] block">
            LÝ DO HỦY MÓN *
          </label>
          <div className="space-y-1">
            {danhSachLyDo.map((item) => (
              <label
                key={item}
                className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-stone-200 text-xs cursor-pointer"
              >
                <input
                  type="radio"
                  name="lyDoHuy"
                  value={item}
                  checked={lyDo === item}
                  onChange={(e) => setLyDo(e.target.value)}
                  className="accent-[#a42c35]"
                />
                <span className="font-medium text-[#272d29]">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cảnh báo kiểm toán */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs flex items-start gap-2">
          <ShieldCheck size={16} className="text-[#795c21] shrink-0 mt-0.5" />
          <p className="text-[#795c21] leading-relaxed">
            Hành động này được ghi vào Nhật ký kiểm toán và gửi thông báo khẩn tới Quản lý để phê duyệt (A19).
          </p>
        </div>

        {/* Nút gửi */}
        <button
          onClick={handleGui}
          className="w-full py-3.5 bg-[#a42c35] hover:bg-[#8e242c] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Send size={16} />
          <span>Gửi yêu cầu hủy món tới Quản lý</span>
        </button>
      </div>
    </div>
  );
}
