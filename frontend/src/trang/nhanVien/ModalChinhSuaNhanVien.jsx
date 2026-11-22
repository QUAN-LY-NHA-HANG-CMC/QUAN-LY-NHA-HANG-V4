// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MODAL CHỈNH SỬA THÔNG TIN NHÂN SỰ & PHÂN QUYỀN (CHUẨN FIGMA A02 / A03)
// ============================================================================

import React, { useState } from 'react';
import { X, Check, Key, Shield, UserCheck, AlertCircle } from 'lucide-react';

export default function ModalChinhSuaNhanVien({
  nhanVien,
  onDong,
  onCapNhat
}) {
  if (!nhanVien) return null;

  const [hoTen, setHoTen] = useState(nhanVien.ho_ten || '');
  const [soDienThoai, setSoDienThoai] = useState(nhanVien.so_dien_thoai || '');
  const [email, setEmail] = useState(nhanVien.email || '');
  const [cccd, setCccd] = useState(nhanVien.cccd || '');
  const [vaiTro, setVaiTro] = useState(nhanVien.ma_vai_tro || nhanVien.vai_tro || 'phuc_vu');
  const [hinhThucLamViec, setHinhThucLamViec] = useState(nhanVien.hinh_thuc_lam_viec || 'toan_thoi_gian');
  const [mucLuong, setMucLuong] = useState(nhanVien.muc_luong || 0);
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hoTen.trim()) {
      setLoi('Họ tên nhân viên không được để trống');
      return;
    }

    setDangLuu(true);
    setLoi('');
    try {
      await onCapNhat(nhanVien.id, {
        hoTen: hoTen.trim(),
        soDienThoai: soDienThoai.trim(),
        email: email.trim(),
        cccd: cccd.trim(),
        vaiTro,
        hinhThucLamViec,
        mucLuong: Number(mucLuong) || 0,
        matKhauMoi: matKhauMoi.trim() || undefined
      });
      onDong();
    } catch (err) {
      setLoi(err.message || 'Lỗi khi cập nhật thông tin nhân viên');
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 my-8">
        {/* Header Modal */}
        <div className="flex justify-between items-center pb-3 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
              QUẢN TRỊ NHÂN VIÊN
            </span>
            <h3 className="text-xl font-bold text-[#272d29]">
              Chỉnh sửa thông tin: {nhanVien.ho_ten}
            </h3>
          </div>
          <button onClick={onDong} className="p-1 rounded-full hover:bg-stone-100 text-stone-500">
            <X size={20} />
          </button>
        </div>

        {loi && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{loi}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
          {/* Thông tin tài khoản (Chỉ đọc) */}
          <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div>
              <span className="text-stone-500 text-[11px] block">MÃ NHÂN VIÊN</span>
              <span className="font-mono font-bold text-[#b64d2d]">
                NV-{String(nhanVien.id).padStart(3, '0')}
              </span>
            </div>
            <div>
              <span className="text-stone-500 text-[11px] block">TÊN ĐĂNG NHẬP</span>
              <span className="font-mono font-bold text-[#272d29]">
                {nhanVien.ten_dang_nhap}
              </span>
            </div>
          </div>

          {/* Họ tên & Số điện thoại */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                HỌ VÀ TÊN NHÂN VIÊN *
              </label>
              <input
                type="text"
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                required
                className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-[#272d29] focus:outline-none focus:border-[#b64d2d]"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                SỐ ĐIỆN THOẠI LIÊN HỆ *
              </label>
              <input
                type="tel"
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
                required
                className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-[#272d29] focus:outline-none focus:border-[#b64d2d]"
              />
            </div>
          </div>

          {/* Email & CCCD */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                EMAIL CÔNG VỤ
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lan.nguyen@quanmoc.vn"
                className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-[#272d29] focus:outline-none focus:border-[#b64d2d]"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                SỐ CCCD / ĐỊNH DANH
              </label>
              <input
                type="text"
                value={cccd}
                onChange={(e) => setCccd(e.target.value)}
                placeholder="07909000xxxx"
                className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-[#272d29] focus:outline-none focus:border-[#b64d2d]"
              />
            </div>
          </div>

          {/* Vai trò & Hình thức làm việc */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                VAI TRÒ TRUY CẬP (RBAC) *
              </label>
              <select
                value={vaiTro}
                onChange={(e) => setVaiTro(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-[#272d29] font-medium focus:outline-none focus:border-[#b64d2d]"
              >
                <option value="phuc_vu">Nhân viên Phục vụ (Mobile/Tablet)</option>
                <option value="thu_ngan">Thu ngân (POS Desktop)</option>
                <option value="bep">Đầu bếp / KDS (Kitchen Display)</option>
                <option value="quan_ly">Quản lý nhà hàng (Admin Full)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                HÌNH THỨC LÀM VIỆC *
              </label>
              <select
                value={hinhThucLamViec}
                onChange={(e) => setHinhThucLamViec(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-[#272d29] font-medium focus:outline-none focus:border-[#b64d2d]"
              >
                <option value="toan_thoi_gian">Toàn thời gian (Full-time)</option>
                <option value="ban_thoi_gian">Bán thời gian (Part-time)</option>
              </select>
            </div>
          </div>

          {/* Mức lương & Đặt lại mật khẩu */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                MỨC LƯƠNG CƠ BẢN (VNĐ)
              </label>
              <input
                type="number"
                value={mucLuong}
                onChange={(e) => setMucLuong(e.target.value)}
                min="0"
                step="500000"
                className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-[#272d29] focus:outline-none focus:border-[#b64d2d]"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                ĐẶT LẠI MẬT KHẨU MỚI
              </label>
              <input
                type="password"
                value={matKhauMoi}
                onChange={(e) => setMatKhauMoi(e.target.value)}
                placeholder="Để trống nếu không đổi"
                className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-[#272d29] focus:outline-none focus:border-[#b64d2d]"
              />
            </div>
          </div>

          {/* Nút lưu */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onDong}
              className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-[#272d29] rounded-xl font-bold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={dangLuu}
              className="flex-1 py-3 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Check size={16} />
              <span>{dangLuu ? 'Đang lưu...' : 'Lưu cập nhật'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
