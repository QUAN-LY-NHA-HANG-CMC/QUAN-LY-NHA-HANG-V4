// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A17 · PHẢN HỒI KHÁCH HÀNG (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Star, MessageSquareHeart, User, Calendar, Check } from 'lucide-react';
import { api } from '../../dungChung/api';
import { hienThiGioVietNam } from '../../dungChung/thoiGian';

export default function TrangPhanHoiKhachHang() {
  const [danhGiaList, setDanhGiaList] = useState([]);
  const [loi, setLoi] = useState('');
  useEffect(() => {
    api.get('/api/hoa-don/danh-gia').then(setDanhGiaList).catch(err => setLoi(err.message));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#272d29] tracking-tight">
          Ý kiến & đánh giá từ khách hàng E-Menu
        </h1>
        <p className="text-xs text-[#72776f] mt-1">
          Lắng nghe phản hồi thực tế từ thực khách để nâng cao chất lượng dịch vụ và tay nghề bếp
        </p>
      </div>

      {loi && <p role="alert">{loi}</p>}
      <div className="grid grid-cols-2 gap-4">
        {danhGiaList.map((dg) => (
          <div key={dg.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-extrabold text-sm text-[#272d29]">{dg.ten_ban}</span>
                <p className="text-[11px] text-stone-400">{hienThiGioVietNam(dg.ngay_tao)}</p>
              </div>

              {/* Số sao */}
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(dg.so_sao)].map((_, i) => (
                  <Star key={i} size={15} className="fill-current" />
                ))}
              </div>
            </div>

            <p className="text-xs text-[#272d29] leading-relaxed italic bg-stone-50 p-3 rounded-xl border border-stone-100">
              "{dg.nhan_xet}"
            </p>


          </div>
        ))}
      </div>
    </div>
  );
}
