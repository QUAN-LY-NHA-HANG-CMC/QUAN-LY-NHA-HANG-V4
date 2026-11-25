// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// POPUP CHỈ ĐẠO THANH TOÁN TỪ QUẢN LÝ TỚI THU NGÂN POS (REAL-TIME SOCKET.IO)
// ============================================================================

import React from 'react';
import { CreditCard, Clock, User, CheckCircle2, X, AlertTriangle, Receipt } from 'lucide-react';
import { api } from '../../dungChung/api';
import { dinhDangGio } from '../../dungChung/dinhDang';
import { laySocket } from '../../dungChung/ketNoiSocket';

export default function ModalDieuPhoiThuNgan({
  lenhDieuPhoi,
  onDong,
  onDaTiepNhan
}) {
  if (!lenhDieuPhoi) return null;

  const tenBan = lenhDieuPhoi.tenBan || lenhDieuPhoi.ten_ban || lenhDieuPhoi.maBan || 'Bàn yêu cầu';
  const noiDung = lenhDieuPhoi.noiDung || lenhDieuPhoi.noi_dung || 'Yêu cầu thu ngân xử lý hóa đơn / thanh toán';
  const nguoiGui = lenhDieuPhoi.tenNguoiGui || lenhDieuPhoi.ten_nguoi_gui || 'Quản lý';
  const thoiGian = lenhDieuPhoi.thoiGian || lenhDieuPhoi.thoi_gian_tao || 'Vừa xong';

  const handleXacNhan = async () => {
    try {
      if (lenhDieuPhoi.id) {
        await api.put(`/api/dieu-phoi-bep/lenh/${lenhDieuPhoi.id}/xac-nhan`);
      }
      const socket = laySocket();
      if (socket && lenhDieuPhoi.id) {
        const user = api.layNguoiDung();
        socket.emit('dieu_phoi:xac_nhan', {
          id: lenhDieuPhoi.id,
          tenNguoiTiepNhan: user?.ho_ten || 'Trần Thị Thu Ngân (Thu ngân)',
          boPhan: 'thu_ngan',
          tenBan,
          thoiGianTiepNhan: dinhDangGio(Date.now())
        });
      }
    } catch (e) {
      console.warn('Lỗi xác nhận tiếp nhận lệnh thu ngân:', e.message);
    }
    if (onDaTiepNhan) onDaTiepNhan(lenhDieuPhoi);
    if (onDong) onDong();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-blue-500 shadow-2xl relative overflow-hidden">
        {/* Dải viền xanh thanh toán */}
        <div className="h-2.5 w-full bg-blue-600 animate-pulse" />

        <div className="p-6 md:p-8 space-y-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-sm animate-bounce">
                <Receipt size={24} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 block">
                  💳 CHỈ ĐẠO THANH TOÁN TỪ QUẢN LÝ
                </span>
                <h2 className="text-xl font-black text-[#272d29]">
                  Hóa đơn / Bàn: <span className="text-[#b64d2d]">{tenBan}</span>
                </h2>
              </div>
            </div>

            <button
              onClick={onDong}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Người phát & Thời gian */}
          <div className="flex items-center gap-3 text-xs bg-[#fbf9f5] border border-stone-200/80 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 font-bold text-stone-700">
              <User size={13} className="text-[#2d4336]" />
              <span>{nguoiGui}</span>
            </div>
            <span className="text-stone-300">•</span>
            <div className="flex items-center gap-1.5 text-stone-500">
              <Clock size={13} className="text-amber-500" />
              <span>Phát lúc {thoiGian}</span>
            </div>
          </div>

          {/* Nội dung chỉ đạo */}
          <div className="p-5 rounded-2xl bg-[#f7f5f0] border border-stone-200/70 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
              CHỈ ĐẠO THU NGÂN XỬ LÝ:
            </span>
            <p className="text-sm font-bold text-[#272d29] leading-relaxed">
              "{noiDung}"
            </p>
          </div>

          {/* Nút xác nhận tiếp nhận */}
          <button
            onClick={handleXacNhan}
            className="w-full py-4 px-6 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-[0.99]"
          >
            <CheckCircle2 size={18} />
            <span>Thu ngân đã tiếp nhận xử lý {tenBan} ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
}
