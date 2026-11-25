// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MODAL THÊM CA LÀM VIỆC MỚI (FIGMA A06 - CHUẨN THIẾT KẾ QUÁN MỘC POS)
// ============================================================================

import React, { useState } from 'react';
import { X, Calendar, Clock, User, Check, AlertCircle, FileText } from 'lucide-react';
import { api } from '../../dungChung/api';
import { ngayVietNam } from '../../dungChung/thoiGian';

export const CA_MAC_DINH = {
  ca_sang: { ten: 'Ca sáng', gioBatDau: '10:00', gioKetThuc: '15:00' },
  ca_chieu: { ten: 'Ca chiều', gioBatDau: '14:00', gioKetThuc: '18:00' },
  ca_toi: { ten: 'Ca tối', gioBatDau: '17:00', gioKetThuc: '22:30' },
  ca_gay: { ten: 'Ca gãy / Cả ngày', gioBatDau: '10:00', gioKetThuc: '22:00' }
};

export default function ModalThemCaLamViec({
  danhSachNhanVien = [],
  nhanVienMacDinhId = null,
  ngayMacDinh = '',
  onDong,
  onThanhCong
}) {
  const [nhanVienId, setNhanVienId] = useState(nhanVienMacDinhId || (danhSachNhanVien[0]?.id || ''));
  const [ngayLam, setNgayLam] = useState(() => ngayMacDinh || ngayVietNam());
  const [tenCa, setTenCa] = useState('ca_toi');
  const [gioBatDau, setGioBatDau] = useState('17:00');
  const [gioKetThuc, setGioKetThuc] = useState('22:30');
  const [ghiChu, setGhiChu] = useState('');
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState('');

  const handleDoiTenCa = (caKey) => {
    setTenCa(caKey);
    if (CA_MAC_DINH[caKey]) {
      setGioBatDau(CA_MAC_DINH[caKey].gioBatDau);
      setGioKetThuc(CA_MAC_DINH[caKey].gioKetThuc);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nhanVienId) {
      setLoi('Vui lòng chọn nhân viên phân ca');
      return;
    }
    if (!ngayLam) {
      setLoi('Vui lòng chọn ngày làm việc');
      return;
    }
    if (!gioBatDau || !gioKetThuc) {
      setLoi('Vui lòng nhập giờ bắt đầu và kết thúc');
      return;
    }

    setDangLuu(true);
    setLoi('');
    try {
      const res = await api.post('/api/ca-lam-viec/tao-ca', {
        nhanVienId: Number(nhanVienId),
        ngayLam,
        tenCa,
        gioBatDau,
        gioKetThuc,
        ghiChu: ghiChu.trim() || undefined
      });

      if (onThanhCong) {
        onThanhCong(res);
      }
      onDong();
    } catch (err) {
      setLoi(err.message || 'Lỗi khi xếp ca làm việc');
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-stone-200">
        {/* Header Modal */}
        <div className="flex justify-between items-center pb-3 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider block">
              QUẢN TRỊ PHÂN CA (A06)
            </span>
            <h3 className="text-xl font-bold text-[#272d29]">
              Xếp ca làm việc mới
            </h3>
          </div>
          <button 
            onClick={onDong} 
            className="p-1 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {loi && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-semibold">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{loi}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
          {/* 1. Chọn Nhân viên */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              NHÂN SỰ TRỰC CA *
            </label>
            <select
              value={nhanVienId}
              onChange={(e) => setNhanVienId(e.target.value)}
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[#272d29] font-bold focus:outline-none focus:border-[#b64d2d]"
            >
              <option value="">-- Chọn nhân viên --</option>
              {danhSachNhanVien.map(nv => (
                <option key={nv.id} value={nv.id}>
                  {nv.ho_ten} ({nv.ten_vai_tro || nv.ma_vai_tro}) - NV-{String(nv.id).padStart(3, '0')}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Ngày làm việc & Loại ca */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                NGÀY LÀM VIỆC *
              </label>
              <input
                type="date"
                value={ngayLam}
                onChange={(e) => setNgayLam(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[#272d29] font-semibold focus:outline-none focus:border-[#b64d2d]"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                KHUNG CA LÀM *
              </label>
              <select
                value={tenCa}
                onChange={(e) => handleDoiTenCa(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[#272d29] font-semibold focus:outline-none focus:border-[#b64d2d]"
              >
                <option value="ca_sang">Ca sáng (10:00 - 15:00)</option>
                <option value="ca_chieu">Ca chiều (14:00 - 18:00)</option>
                <option value="ca_toi">Ca tối (17:00 - 22:30)</option>
                <option value="ca_gay">Ca gãy / Cả ngày (10:00 - 22:00)</option>
              </select>
            </div>
          </div>

          {/* 3. Giờ bắt đầu & Giờ kết thúc */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                GIỜ BẮT ĐẦU *
              </label>
              <input
                type="time"
                value={gioBatDau}
                onChange={(e) => setGioBatDau(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[#272d29] font-mono font-bold focus:outline-none focus:border-[#b64d2d]"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                GIỜ KẾT THÚC *
              </label>
              <input
                type="time"
                value={gioKetThuc}
                onChange={(e) => setGioKetThuc(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[#272d29] font-mono font-bold focus:outline-none focus:border-[#b64d2d]"
              />
            </div>
          </div>

          {/* 4. Ghi chú phân công */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              GHI CHÚ / KHU VỰC PHÂN CÔNG
            </label>
            <input
              type="text"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Ví dụ: Phụ trách Tầng 1 (Bàn 01-12), Đứng bếp chính..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[#272d29] focus:outline-none focus:border-[#b64d2d]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onDong}
              disabled={dangLuu}
              className="px-4 py-2.5 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl font-bold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={dangLuu}
              className="px-6 py-2.5 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check size={16} />
              <span>{dangLuu ? 'Đang lưu CSDL...' : 'Lưu phân ca làm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
