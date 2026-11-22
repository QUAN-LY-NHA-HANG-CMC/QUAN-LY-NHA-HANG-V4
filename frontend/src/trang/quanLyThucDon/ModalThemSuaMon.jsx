// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A13 · THÊM VÀ SỬA MÓN ĂN KÈM CÀI ĐẶT SỐ SUẤT (1440x1000) - CHUẨN FIGMA
// ============================================================================

import React, { useRef, useState } from 'react';
import { X, Check, Utensils, Hash, Layers, AlertCircle, Sparkles, Clock, AlertTriangle } from 'lucide-react';

export default function ModalThemSuaMon({
  monCanSua = null,
  danhMucList = [],
  onDong,
  onLuu
}) {
  const [tenMon, setTenMon] = useState(monCanSua?.ten_mon || '');
  const [maMon, setMaMon] = useState(monCanSua?.ma_mon || '');
  const [gia, setGia] = useState(monCanSua?.don_gia || monCanSua?.gia || 120000);
  const [danhMucId, setDanhMucId] = useState(monCanSua?.danh_muc_id ?? danhMucList[0]?.id ?? '');
  const [donViTinh, setDonViTinh] = useState(monCanSua?.don_vi_tinh || 'phần');
  const [hinhAnh, setHinhAnh] = useState(monCanSua?.anh_mon_an || monCanSua?.hinh_anh || '');
  const [moTa, setMoTa] = useState(monCanSua?.mo_ta || '');
  
  // Quản lý số suất phục vụ trong ngày
  const [coGioiHanSuat, setCoGioiHanSuat] = useState(
    monCanSua?.so_suat_con_lai !== null && monCanSua?.so_suat_con_lai !== undefined
  );
  const [soSuat, setSoSuat] = useState(
    monCanSua?.so_suat_con_lai !== null && monCanSua?.so_suat_con_lai !== undefined 
      ? monCanSua.so_suat_con_lai 
      : 20
  );

  const [dangXuLy, setDangXuLy] = useState(false);
  const dangGui = useRef(false);
  const [loi, setLoi] = useState('');

  const handleLuu = async (e) => {
    e.preventDefault();
    if (dangGui.current) return;
    if (!tenMon.trim() || !maMon.trim()) {
      setLoi('Vui lòng nhập tên món và mã món');
      return;
    }

    dangGui.current = true;
    setDangXuLy(true);
    setLoi('');

    try {
      await onLuu({
        id: monCanSua?.id,
        tenMon: tenMon.trim(),
        maMon: maMon.trim().toUpperCase(),
        donGia: Number(gia) || 0,
        danhMucId: Number(danhMucId),
        donViTinh: donViTinh.trim() || 'phần',
        anhMonAn: hinhAnh.trim() || null,
        moTa: moTa.trim() || null,
        soSuatConLai: coGioiHanSuat ? Math.max(0, parseInt(soSuat, 10) || 0) : null
      });
      onDong();
    } catch (err) {
      setLoi(err.message || 'Lỗi khi lưu thông tin món ăn');
    } finally {
      dangGui.current = false;
      setDangXuLy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
              {monCanSua ? 'CẬP NHẬT THỰC ĐƠN (A13)' : 'THÊM MÓN MỚI (A13)'}
            </span>
            <h3 className="text-lg font-bold text-[#272d29]">
              {monCanSua ? `Chỉnh sửa: ${monCanSua.ten_mon}` : 'Thêm món ăn vào thực đơn'}
            </h3>
          </div>
          <button onClick={onDong} className="p-1 rounded-full hover:bg-stone-100 text-stone-500">
            <X size={18} />
          </button>
        </div>

        {loi && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{loi}</span>
          </div>
        )}

        <form onSubmit={handleLuu} className="py-4 space-y-3.5 text-xs">
          {/* Tên món & Mã món */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">TÊN MÓN ĂN *</label>
              <input
                type="text"
                value={tenMon}
                onChange={(e) => setTenMon(e.target.value)}
                placeholder="Ví dụ: Bò lúc lắc hạt tiêu"
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-[#272d29] focus:outline-none focus:border-[#b64d2d]"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">MÃ MÓN (SKU) *</label>
              <input
                type="text"
                value={maMon}
                onChange={(e) => setMaMon(e.target.value)}
                placeholder="BLL_01"
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-[#272d29] focus:outline-none focus:border-[#b64d2d]"
              />
            </div>
          </div>

          {/* Giá bán, Danh mục & Đơn vị tính */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">GIÁ BÁN (VNĐ) *</label>
              <input
                type="number"
                value={gia}
                onChange={(e) => setGia(e.target.value)}
                step={1000}
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-[#b64d2d] focus:outline-none focus:border-[#b64d2d]"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">DANH MỤC *</label>
              <select
                required
                value={danhMucId}
                onChange={(e) => setDanhMucId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[#272d29] font-medium"
              >
                <option value="" disabled>Chọn danh mục</option>
                {danhMucList.map(dm => (
                  <option key={dm.id} value={dm.id}>{dm.ten_danh_muc || dm.ten}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">ĐƠN VỊ TÍNH</label>
              <input
                type="text"
                value={donViTinh}
                onChange={(e) => setDonViTinh(e.target.value)}
                placeholder="phần / đĩa / nồi"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[#272d29]"
              />
            </div>
          </div>

          {/* CÀI ĐẶT SỐ SUẤT PHỤC VỤ TRONG NGÀY (QUAN TRỌNG) */}
          <div className="p-3.5 bg-orange-50/70 border border-orange-200/80 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider block">
                  QUẢN LÝ SỐ SUẤT BÁN TRONG NGÀY
                </span>
                <p className="text-[11px] text-stone-600">
                  Tự động trừ số suất khi khách gọi món. Khi về 0 suất hệ thống tự khóa đặt món.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCoGioiHanSuat(false)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    !coGioiHanSuat
                      ? 'bg-[#272d29] text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  ∞ Không giới hạn
                </button>
                <button
                  type="button"
                  onClick={() => setCoGioiHanSuat(true)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    coGioiHanSuat
                      ? 'bg-[#b64d2d] text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  Giới hạn số suất
                </button>
              </div>
            </div>

            {coGioiHanSuat && (
              <div className="pt-2 border-t border-orange-200/60 flex items-center gap-3">
                <div className="flex-1">
                  <label className="block font-bold text-stone-700 text-[11px] mb-1">
                    SỐ SUẤT CHUẨN BỊ SẴN SÀNG HÔM NAY:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={soSuat}
                      onChange={(e) => setSoSuat(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-32 bg-white border border-stone-300 rounded-xl p-2 font-bold text-sm text-[#b64d2d] focus:outline-none focus:border-[#b64d2d]"
                    />
                    <span className="font-semibold text-stone-600">suất</span>
                    <div className="flex items-center gap-1 ml-3">
                      <button
                        type="button"
                        onClick={() => setSoSuat(prev => Math.max(0, Number(prev) - 5))}
                        className="px-2 py-1 bg-white border border-stone-200 hover:bg-stone-100 rounded text-[11px] font-bold text-stone-700"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={() => setSoSuat(prev => Number(prev) + 5)}
                        className="px-2 py-1 bg-white border border-stone-200 hover:bg-stone-100 rounded text-[11px] font-bold text-stone-700"
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        onClick={() => setSoSuat(prev => Number(prev) + 10)}
                        className="px-2 py-1 bg-white border border-stone-200 hover:bg-stone-100 rounded text-[11px] font-bold text-stone-700"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        onClick={() => setSoSuat(0)}
                        className="px-2 py-1 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded text-[11px] font-bold text-rose-700"
                      >
                        Báo hết (0)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">LINK HÌNH ẢNH MÓN (URL)</label>
            <input
              type="url"
              value={hinhAnh}
              onChange={(e) => setHinhAnh(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[#272d29] focus:outline-none focus:border-[#b64d2d]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">MÔ TẢ CHI TIẾT MÓN ĂN & NGUYÊN LIỆU</label>
            <textarea
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Thịt bò xào tiêu đen ăn kèm ớt chuông đỏ, hành tây ngọt thanh..."
              rows={2}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[#272d29] focus:outline-none focus:border-[#b64d2d]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={dangXuLy}
              className="w-full py-3.5 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check size={18} />
              <span>{dangXuLy ? 'Đang lưu vào CSDL...' : (monCanSua ? 'Lưu thay đổi vào CSDL' : 'Thêm vào thực đơn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
