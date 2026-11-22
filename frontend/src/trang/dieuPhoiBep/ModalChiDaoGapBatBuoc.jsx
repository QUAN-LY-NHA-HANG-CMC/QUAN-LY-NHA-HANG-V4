// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// K05 · POPUP CHỈ ĐẠO GẤP BẮT BUỘC (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React from 'react';
import { AlertTriangle, Clock, User, CheckCircle2, X, Utensils, MapPin } from 'lucide-react';
import { CHI_DAO_BEP_KHAN_CAP } from '../../dungChung/duLieuMau';

export default function ModalChiDaoGapBatBuoc({
  chiDao = CHI_DAO_BEP_KHAN_CAP,
  onDong,
  onXacNhanUuTien
}) {
  const tenBan = chiDao.tenBan || chiDao.ten_ban || chiDao.maBan || 'Bàn 08';
  const tenMon = chiDao.tenMon || chiDao.ten_mon;
  const soLuong = chiDao.soLuongMon || chiDao.so_luong_mon;
  const nguoiGui = chiDao.tenNguoiGui || chiDao.ten_nguoi_gui || chiDao.nguoiGui || 'Quản lý';
  const thoiGian = chiDao.thoiGian || chiDao.thoi_gian_tao || 'Vừa xong';
  const noiDung = chiDao.noiDung || chiDao.noi_dung || CHI_DAO_BEP_KHAN_CAP.noiDung;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-xl bg-[#202e28] text-white rounded-3xl border-2 border-[#a42c35] p-8 shadow-2xl relative overflow-hidden">
        {/* Dải nháy viền đỏ khẩn cấp */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#a42c35] animate-pulse" />

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#a42c35] text-white flex items-center justify-center shrink-0 shadow-lg animate-bounce">
              <AlertTriangle size={26} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-400 tracking-wider uppercase block">
                {chiDao.tieuDe || 'CHỈ ĐẠO GẤP BẮT BUỘC TỪ QUẢN LÝ'}
              </span>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>Ưu tiên khẩn cấp cho {tenBan}</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onDong}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Thông tin người gửi và thời gian */}
        <div className="flex items-center gap-4 text-xs text-[#b3c6ba] bg-black/30 p-3 rounded-xl mb-5">
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-emerald-400" />
            <span className="font-semibold text-white">{nguoiGui}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-amber-400" />
            <span>Thời gian phát lệnh: {thoiGian}</span>
          </div>
          {tenBan && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1.5 text-orange-300 font-bold">
                <MapPin size={14} />
                <span>{tenBan}</span>
              </div>
            </>
          )}
        </div>

        {/* Nội dung chỉ đạo */}
        <div className="bg-[#19241f] border border-white/10 rounded-2xl p-5 mb-6 text-sm leading-relaxed text-[#e1eae1]">
          <p className="font-medium text-white mb-3 text-base">
            "{noiDung}"
          </p>

          {/* Món ăn liên quan */}
          {tenMon ? (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 font-bold flex items-center gap-2.5">
              <Utensils size={16} className="text-rose-400" />
              <span>
                Món ăn liên quan: <b className="text-white text-sm">{tenMon}</b>
                {soLuong ? ` × ${soLuong} phần` : ''}
              </span>
            </div>
          ) : (
            <div className="text-xs text-rose-300 font-semibold mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Yêu cầu bếp trưởng xử lý ngay</span>
            </div>
          )}
        </div>

        {/* Nút xác nhận thực thi */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onXacNhanUuTien && onXacNhanUuTien(chiDao)}
            className="flex-1 py-4 px-6 bg-[#a42c35] hover:bg-[#8e242c] text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all active:scale-[0.99] cursor-pointer"
          >
            <CheckCircle2 size={20} />
            <span>Bếp trưởng xác nhận ưu tiên ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
}
