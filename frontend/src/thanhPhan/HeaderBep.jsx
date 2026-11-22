// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// HEADER KDS BẾP THÔNG MINH (K01 - K06) THEO CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React from 'react';
import TrangThaiKetNoiVaGio from './TrangThaiKetNoiVaGio';
import { Volume2, VolumeX, AlertTriangle, LogOut, CheckCircle2 } from 'lucide-react';

export default function HeaderBep({
  tabHienTai = 'theoBan',
  onChuyenTab,
  soPhieuCho = 3,
  soGomMon = 3,
  soHoanThanh = 46,
  soMonHet = 1,
  coChiDaoKhanCap = true,
  onMoChiDaoKhanCap,
  amThanhBao = true,
  onBatTatAmThanh,
  tramHienTai = 'bepNong',
  onChonTram,
  ca,
  onDangXuat = null
}) {
  return (
    <header className="bg-[#202e28] text-[#e1eae1] border-b border-emerald-950 select-none">
      {/* Hàng 1: Bar nhận diện và ca bếp */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-2xl tracking-tight text-[#b64d2d]">mộc</span>
            <span className="text-xs font-semibold tracking-wider text-[#b3c6ba] uppercase">
              KITCHEN DISPLAY
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/20" />

          <div className="text-xs text-[#b3c6ba]">
            Chi nhánh Thảo Điền <span className="text-white/40">/</span> Bếp nóng · Trạm 01
          </div>

          {ca && <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-xs font-medium text-emerald-200">{ca}</span>}
        </div>

        <div className="flex items-center gap-4 text-xs">
          <TrangThaiKetNoiVaGio giaoDienToi />

          {onDangXuat && (
            <button
              onClick={onDangXuat}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Hàng 2: Các tab vận hành bếp */}
      <div className="px-6 py-2.5 flex items-center justify-between bg-[#19241f]">
        <div className="flex items-center gap-2">
          {/* Tab 1: Phiếu theo bàn */}
          <button
            onClick={() => onChuyenTab('theoBan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tabHienTai === 'theoBan'
                ? 'bg-[#2d4336] text-white shadow-xs'
                : 'text-[#b3c6ba] hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>Phiếu theo bàn</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-[#b64d2d] text-white font-bold">
              {soPhieuCho}
            </span>
          </button>

          {/* Tab 2: Gom món */}
          <button
            onClick={() => onChuyenTab('gomMon')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tabHienTai === 'gomMon'
                ? 'bg-[#2d4336] text-white shadow-xs'
                : 'text-[#b3c6ba] hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>Gom món</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-600 text-white font-bold">
              {soGomMon}
            </span>
          </button>

          {/* Tab 3: Đã làm xong */}
          <button
            onClick={() => onChuyenTab('daLamXong')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tabHienTai === 'daLamXong'
                ? 'bg-[#2d4336] text-white shadow-xs'
                : 'text-[#b3c6ba] hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>Đã làm xong</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-700/80 text-white font-bold">
              {soHoanThanh}
            </span>
          </button>

          {/* Tab 4: Trạng thái món */}
          <button
            onClick={() => onChuyenTab('trangThaiMon')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tabHienTai === 'trangThaiMon'
                ? 'bg-[#2d4336] text-white shadow-xs'
                : 'text-[#b3c6ba] hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>Trạng thái món</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-rose-700 text-white font-bold">
              {soMonHet} hết
            </span>
          </button>
        </div>

        {/* Cảnh báo chỉ đạo gấp bắt buộc (K05) */}
        {coChiDaoKhanCap && (
          <button
            onClick={onMoChiDaoKhanCap}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#a42c35] text-white text-xs font-bold shadow-md hover:bg-[#8e242c] transition-all animate-bounce"
          >
            <AlertTriangle size={15} />
            <span>● 1 CHỈ ĐẠO MỚI TỪ QUẢN LÝ</span>
          </button>
        )}
      </div>

      {/* Hàng 3: Bộ lọc trạm và cài đặt âm thanh */}
      <div className="px-6 py-2 bg-[#202e28] border-t border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[#b3c6ba]">Trạm bếp:</span>
          {['bepNong', 'barPhaChe', 'tatCa'].map((tram) => {
            const ten = tram === 'bepNong' ? 'Bếp nóng' : tram === 'barPhaChe' ? 'Bar / Đồ uống' : 'Tất cả trạm';
            const active = tramHienTai === tram;
            return (
              <button
                key={tram}
                onClick={() => onChonTram(tram)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  active
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-[#b3c6ba] hover:bg-white/10'
                }`}
              >
                {ten}
              </button>
            );
          })}
        </div>

        <button
          onClick={onBatTatAmThanh}
          className="flex items-center gap-1.5 text-[#b3c6ba] hover:text-white transition-colors"
        >
          {amThanhBao ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} />}
          <span>Chuông: {amThanhBao ? 'Bật · Tự động cập nhật' : 'Tắt'}</span>
        </button>
      </div>
    </header>
  );
}
