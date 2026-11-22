// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// P05 · TÁCH HÓA ĐƠN (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';
import { DON_MAU_BAN_08 } from '../../dungChung/duLieuMau';

export default function ModalTachHoaDon({
  ban = { ma_ban: 'B08', ten_ban: 'Bàn 08' },
  donMon = DON_MAU_BAN_08,
  onDong,
  onXacNhanTach
}) {
  const [hoaDon1, setHoaDon1] = useState(donMon.chi_tiet.slice(0, 2));
  const [hoaDon2, setHoaDon2] = useState(donMon.chi_tiet.slice(2));

  const chuyenSang2 = (item) => {
    setHoaDon1(prev => prev.filter(i => i.id !== item.id));
    setHoaDon2(prev => [...prev, item]);
  };

  const chuyenSang1 = (item) => {
    setHoaDon2(prev => prev.filter(i => i.id !== item.id));
    setHoaDon1(prev => [...prev, item]);
  };

  const tong1 = hoaDon1.reduce((sum, item) => sum + item.thanh_tien, 0);
  const tong2 = hoaDon2.reduce((sum, item) => sum + item.thanh_tien, 0);

  const handleXacNhan = () => {
    onXacNhanTach({
      hoaDon1: { chiTiet: hoaDon1, tongTien: tong1 },
      hoaDon2: { chiTiet: hoaDon2, tongTien: tong2 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-stone-200">
        <div className="flex justify-between items-center pb-3 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
              NGHIỆP VỤ THU NGÂN
            </span>
            <h3 className="text-lg font-bold text-[#272d29]">
              Tách hóa đơn theo từng món · {ban.ten_ban || 'Bàn 08'}
            </h3>
          </div>
          <button onClick={onDong} className="p-1 rounded-full hover:bg-stone-100 text-stone-500">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 my-4 text-xs">
          {/* Cột Hóa đơn 1 */}
          <div className="border border-stone-200 rounded-xl p-3 bg-stone-50 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center font-bold pb-2 border-b">
                <span>Hóa đơn 1</span>
                <span className="text-[#b64d2d]">{dinhDangTien(tong1)}</span>
              </div>
              <div className="space-y-1.5 py-2">
                {hoaDon1.map(item => (
                  <div key={item.id} className="bg-white p-2 rounded-lg border border-stone-200 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[#272d29]">{item.ten_mon} × {item.so_luong}</p>
                      <p className="text-[11px] text-stone-500">{dinhDangTien(item.thanh_tien)}</p>
                    </div>
                    <button
                      onClick={() => chuyenSang2(item)}
                      className="p-1.5 bg-stone-100 hover:bg-[#b64d2d] hover:text-white rounded transition-colors"
                      title="Chuyển sang HĐ 2"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-stone-500 pt-2 border-t">{hoaDon1.length} món</p>
          </div>

          {/* Cột Hóa đơn 2 */}
          <div className="border border-stone-200 rounded-xl p-3 bg-stone-50 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center font-bold pb-2 border-b">
                <span>Hóa đơn 2</span>
                <span className="text-[#b64d2d]">{dinhDangTien(tong2)}</span>
              </div>
              <div className="space-y-1.5 py-2">
                {hoaDon2.map(item => (
                  <div key={item.id} className="bg-white p-2 rounded-lg border border-stone-200 flex justify-between items-center">
                    <button
                      onClick={() => chuyenSang1(item)}
                      className="p-1.5 bg-stone-100 hover:bg-[#b64d2d] hover:text-white rounded transition-colors"
                      title="Chuyển về HĐ 1"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <div className="text-right">
                      <p className="font-semibold text-[#272d29]">{item.ten_mon} × {item.so_luong}</p>
                      <p className="text-[11px] text-stone-500">{dinhDangTien(item.thanh_tien)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-stone-500 pt-2 border-t">{hoaDon2.length} món</p>
          </div>
        </div>

        <button
          onClick={handleXacNhan}
          disabled={hoaDon1.length === 0 || hoaDon2.length === 0}
          className="w-full py-3.5 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Check size={18} />
          <span>Xác nhận tách thành 2 hóa đơn độc lập</span>
        </button>
      </div>
    </div>
  );
}
