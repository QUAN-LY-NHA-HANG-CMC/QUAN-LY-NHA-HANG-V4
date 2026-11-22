// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// C07 · GỌI HỖ TRỢ TẠI BÀN (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { X, UserCheck, Droplets, Sparkles, MessageSquare, ChevronRight, Check } from 'lucide-react';

export default function ModalGoiHoTro({
  ban = { ma_ban: 'B08', ten_ban: 'Bàn 08' },
  onDong,
  onGuiYeuCau
}) {
  const [daGui, setDaGui] = useState(false);
  const [luaChon, setLuaChon] = useState(null);

  const danhSachYeuCau = [
    { id: 'goiNhanVien', ten: 'Gọi nhân viên', moTa: 'Cần tư vấn món, thêm chén đũa, gọi phục vụ', icon: UserCheck },
    { id: 'themNuocDa', ten: 'Thêm đá / Nước lọc', moTa: 'Yêu cầu bình đá lạnh hoặc nước lọc tinh khiết', icon: Droplets },
    { id: 'khanLanh', ten: 'Thêm khăn lạnh', moTa: 'Khăn vải cao cấp ướp lạnh thảo mộc', icon: Sparkles },
    { id: 'khac', ten: 'Yêu cầu khác', moTa: 'Nhân viên phụ trách sẽ đến bàn ngay sau 1 phút', icon: MessageSquare }
  ];

  const [loi, setLoi] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const handleChon = async (item) => {
    if (dangGui) return;
    setDangGui(true);
    setLuaChon(item);
    try {
      await onGuiYeuCau(item);
    } catch (err) {
      setLoi(err.message);
      setDangGui(false);
      return;
    }
    setDaGui(true);
    setTimeout(() => {
      onDong();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] bg-[#f9f7f2] rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-5 border border-[#272d29]/10">
        {loi && <p role="alert" className="text-red-700">{loi}</p>}
        {/* Nút đóng */}
        <div className="flex items-center justify-between pb-3 border-b border-[#272d29]/10">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#b64d2d] uppercase">
              HỖ TRỢ TẠI BÀN
            </span>
            <h3 className="text-lg font-bold text-[#272d29]">
              Mộc luôn sẵn sàng hỗ trợ
            </h3>
          </div>
          <button
            onClick={onDong}
            className="p-1.5 rounded-full hover:bg-stone-200 text-[#72776f] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {daGui ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-[#ebf4ed] text-[#226b4c] rounded-full flex items-center justify-center mx-auto shadow-xs">
              <Check size={24} className="stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-[#272d29]">
              Đã gửi yêu cầu thành công!
            </h4>
            <p className="text-xs text-[#72776f] max-w-xs mx-auto">
              Nhân viên phụ trách {ban.ten_ban || 'Bàn 08'} đã nhận tín hiệu và sẽ đến hỗ trợ bạn ngay lập tức.
            </p>
          </div>
        ) : (
          <div className="py-4 space-y-2.5">
            <p className="text-xs text-[#72776f] mb-3">
              Chọn nhanh yêu cầu của bạn để nhân viên hỗ trợ kịp thời:
            </p>
            {danhSachYeuCau.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleChon(item)}
                  className="w-full p-3.5 bg-white hover:bg-[#f9ede6]/50 border border-[#272d29]/10 hover:border-[#b64d2d]/30 rounded-xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#272d29]/5 group-hover:bg-[#b64d2d]/10 text-[#272d29] group-hover:text-[#b64d2d] flex items-center justify-center shrink-0 transition-colors">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#272d29]">
                        {item.ten}
                      </h4>
                      <p className="text-[11px] text-[#72776f] mt-0.5 line-clamp-1">
                        {item.moTa}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#72776f] group-hover:text-[#b64d2d] transition-colors" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
