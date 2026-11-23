// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A02 · QUẢN TRỊ NHÂN SỰ & PHÂN QUYỀN (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, Eye, Settings, Search, CheckCircle2, 
  Pencil, Ban, UserCheck, Trash2, AlertCircle, RefreshCw, LayoutGrid, MapPin 
} from 'lucide-react';
import ModalHoSoNhanVien from './ModalHoSoNhanVien';
import ModalPhanQuyenGiaoBan from './ModalPhanQuyenGiaoBan';
import ModalCapTaiKhoan from './ModalCapTaiKhoan';
import ModalChinhSuaNhanVien from './ModalChinhSuaNhanVien';
import ModalXacNhan from '../../thanhPhan/ModalXacNhan';
import { api } from '../../dungChung/api';

export default function TrangDanhSachNhanVien() {
  const [danhSach, setDanhSach] = useState([]);
  const [xemLuuTru, setXemLuuTru] = useState(false);
  const [dangTai, setDangTai] = useState(false);
  const [tuKhoa, setTuKhoa] = useState('');
  const [thongBao, setThongBao] = useState(null);

  // Modals state
  const [nhanVienXem, setNhanVienXem] = useState(null);
  const [nhanVienSua, setNhanVienSua] = useState(null);
  const [nhanVienPhanQuyen, setNhanVienPhanQuyen] = useState(null);
  const [hienCapTk, setHienCapTk] = useState(false);
  const [xacNhanAction, setXacNhanAction] = useState(null);

  // Tải danh sách nhân sự thực tế từ máy chủ Backend
  const taiDanhSach = async () => {
    setDangTai(true);
    try {
      const res = await api.get('/api/tai-khoan/nhan-su?baoGomLuuTru=1');
      if (Array.isArray(res)) {
        setDanhSach(res);
      }
    } catch (err) {
      console.error('Không thể tải nhân sự từ backend:', err.message);
      showToast('Không thể tải danh sách nhân sự từ máy chủ: ' + err.message, 'loi');
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDanhSach();
  }, []);

  const showToast = (noiDung, loai = 'thanhCong') => {
    setThongBao({ noiDung, loai });
    setTimeout(() => setThongBao(null), 4000);
  };

  // 1. Tạo nhân viên mới & cấp tài khoản (Ghi trực tiếp vào CSDL backend)
  const handleTaoTk = async (thongTin) => {
    try {
      const nvMoi = await api.post('/api/tai-khoan/nhan-su', thongTin);

      setDanhSach(prev => [nvMoi, ...prev.filter(item => item.id !== nvMoi.id)]);
      showToast(`Đã tạo thành công nhân viên "${thongTin.hoTen}" và cấp tài khoản ${thongTin.tenDangNhap}!`);
      // Đồng bộ lại danh sách từ CSDL
      taiDanhSach();
    } catch (err) {
      showToast(`Lỗi tạo nhân sự: ${err.message}`, 'loi');
      throw err;
    }
  };

  // 2. Chỉnh sửa thông tin nhân sự
  const handleCapNhat = async (id, duLieu) => {
    try {
      const nvCapNhat = await api.put(`/api/tai-khoan/nhan-su/${id}`, duLieu);
      setDanhSach(prev => prev.map(item => item.id === id ? { ...item, ...nvCapNhat } : item));
      showToast(`Đã cập nhật thông tin nhân viên "${duLieu.hoTen}" thành công!`);
      // Đồng bộ lại danh sách từ CSDL
      taiDanhSach();
    } catch (err) {
      showToast(`Lỗi cập nhật nhân sự: ${err.message}`, 'loi');
      throw err;
    }
  };

  // 3. Đình chỉ / Kích hoạt lại nhân viên (Mở Modal Xác nhận Figma)
  const handleToggleDinhChi = (nv) => {
    const dangDinhChi = (nv.trang_thai === 'tam_nghi' || nv.trang_thai === 'tam_khoa');
    const trangThaiMoi = dangDinhChi ? 'dang_lam' : 'tam_khoa';

    setXacNhanAction({
      tieuDe: dangDinhChi ? `Mở lại quyền làm việc: ${nv.ho_ten}` : `Đình chỉ công tác: ${nv.ho_ten}`,
      phanLoai: 'QUẢN TRỊ TRẠNG THÁI NHÂN SỰ',
      noiDung: dangDinhChi
        ? `Khôi phục quyền làm việc và mở khóa đăng nhập cho nhân viên "${nv.ho_ten}" (Tài khoản: ${nv.ten_dang_nhap}).`
        : `Bạn có chắc muốn đình chỉ công tác nhân viên "${nv.ho_ten}" (Tài khoản: ${nv.ten_dang_nhap})? Tài khoản này sẽ bị khóa và không thể đăng nhập vào hệ thống.`,
      canhBaoPhu: dangDinhChi 
        ? 'Nhân viên có thể đăng nhập nhận ca và phục vụ bàn bình thường.' 
        : 'Bạn có thể mở khóa kích hoạt lại nhân viên bất cứ lúc nào.',
      loai: dangDinhChi ? 'moKhoa' : 'canhBao',
      nhanNutXacNhan: dangDinhChi ? 'Mở khóa nhân viên' : 'Đình chỉ công tác',
      onThucHien: async () => {
        try {
          const res = await api.put(`/api/tai-khoan/nhan-su/${nv.id}/trang-thai`, { trangThai: trangThaiMoi });
          setDanhSach(prev => prev.map(item => item.id === nv.id ? { ...item, trang_thai: res.trang_thai, trang_thai_tk: res.trang_thai_tk } : item));
          showToast(`Đã ${dangDinhChi ? 'mở lại hoạt động' : 'đình chỉ công tác'} nhân viên "${nv.ho_ten}" thành công!`);
        } catch (err) {
          showToast(`Lỗi: ${err.message}`, 'loi');
        } finally {
          setXacNhanAction(null);
        }
      }
    });
  };

  const xacNhanNghiViec = nv => setXacNhanAction({
    tieuDe: 'Xác nhận nghỉ việc',
    phanLoai: 'QUẢN TRỊ NHÂN SỰ',
    noiDung: `Xác nhận ${nv.ho_ten} đã nghỉ việc. Hệ thống sẽ dừng quyền đăng nhập của nhân viên.`,
    loai: 'canhBao',
    nhanNutXacNhan: 'Xác nhận nghỉ việc',
    onThucHien: async () => {
      try {
        const moi = await api.put(`/api/tai-khoan/nhan-su/${nv.id}/trang-thai`, { trangThai: 'da_nghi' });
        setDanhSach(cu => cu.map(item => item.id === nv.id ? { ...item, ...moi } : item));
        showToast('Đã xác nhận nghỉ việc.');
      } catch (loi) {
        showToast(loi.message, 'loi');
      } finally { setXacNhanAction(null); }
    }
  });

  // 4. Xóa nhân viên khỏi hệ thống (Mở Modal Xác nhận Figma)
  const handleXoaNhanVien = (nv) => {
    setXacNhanAction({
      tieuDe: `Xóa nhân sự: ${nv.ho_ten}`,
      phanLoai: 'XÁC NHẬN XÓA NHÂN SỰ',
      noiDung: `Xóa "${nv.ho_ten}" (tài khoản: ${nv.ten_dang_nhap}) khỏi danh sách nhân sự?`,
      canhBaoPhu: 'Tài khoản sẽ mất quyền truy cập. Hóa đơn và lịch sử nghiệp vụ được giữ lại.',
      loai: 'nguyHiem',
      nhanNutXacNhan: 'Xóa nhân sự',
      onThucHien: async () => {
        try {
          await api.delete(`/api/tai-khoan/nhan-su/${nv.id}`);
          await taiDanhSach();
          showToast(`Đã xóa "${nv.ho_ten}" khỏi danh sách nhân sự.`);
        } catch (err) {
          showToast(`Lỗi khi xóa nhân viên: ${err.message}`, 'loi');
        } finally {
          setXacNhanAction(null);
        }
      }
    });
  };

  const khoiPhuc = nv => setXacNhanAction({
    tieuDe: 'Khôi phục nhân viên',
    noiDung: `Khôi phục hồ sơ của ${nv.ho_ten} và mở lại tài khoản ${nv.ten_dang_nhap}?`,
    loai: 'moKhoa',
    nhanNutXacNhan: 'Khôi phục',
    onThucHien: async () => {
      try {
        const nhanVien = await api.put(`/api/tai-khoan/nhan-su/${nv.id}/khoi-phuc`, {});
        setDanhSach(cu => cu.map(item => item.id === nv.id
          ? { ...item, ...nhanVien, ngay_luu_tru: null } : item));
        showToast(`Đã khôi phục ${nv.ho_ten}.`);
      } catch (err) {
        showToast(err.message, 'loi');
      } finally {
        setXacNhanAction(null);
      }
    }
  });

  const danhSachTheoTab = danhSach.filter(nv => Boolean(nv.ngay_luu_tru) === xemLuuTru);
  const nhanSuLoc = danhSachTheoTab.filter(nv => {
    const ten = nv.ho_ten ? nv.ho_ten.toLowerCase() : '';
    const tk = nv.ten_dang_nhap ? nv.ten_dang_nhap.toLowerCase() : '';
    const sdt = nv.so_dien_thoai || '';
    const q = tuKhoa.toLowerCase();
    return !tuKhoa || ten.includes(q) || tk.includes(q) || sdt.includes(q);
  });

  const mauVaiTro = {
    quan_ly: 'bg-purple-100 text-purple-800 border-purple-200',
    thu_ngan: 'bg-blue-100 text-blue-800 border-blue-200',
    bep: 'bg-amber-100 text-amber-800 border-amber-200',
    phuc_vu: 'bg-emerald-100 text-[#226b4c] border-emerald-200'
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast thông báo */}
      {thongBao && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold shadow-md transition-all ${
          thongBao.loai === 'thanhCong' ? 'bg-[#ebf4ed] text-[#226b4c] border border-[#226b4c]/30' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{thongBao.noiDung}</span>
          </div>
          <button onClick={() => setThongBao(null)} className="text-stone-400 hover:text-stone-700">
            ✕
          </button>
        </div>
      )}

      {/* Tiêu đề & nút hành động */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#272d29] tracking-tight">
              Quản trị nhân sự & phân quyền
            </h1>
            <button
              onClick={taiDanhSach}
              disabled={dangTai}
              title="Tải lại dữ liệu"
              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-[#b64d2d] transition-colors"
            >
              <RefreshCw size={16} className={dangTai ? 'animate-spin text-[#b64d2d]' : ''} />
            </button>
          </div>
          <p className="text-xs text-[#72776f] mt-1">
            Tổng cộng: <b>{danhSachTheoTab.length} nhân sự</b>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm theo tên, tài khoản, SĐT..."
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#b64d2d]"
            />
          </div>

          <button
            onClick={() => setHienCapTk(true)}
            className="py-2.5 px-4 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <UserPlus size={16} />
            <span>Cấp tài khoản mới (A05)</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2" aria-label="Danh sách nhân sự">
        {[false, true].map(luuTru => (
          <button key={String(luuTru)} type="button" aria-pressed={xemLuuTru === luuTru}
            onClick={() => setXemLuuTru(luuTru)}
            className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-semibold aria-pressed:bg-[#b64d2d] aria-pressed:text-white">
            {luuTru ? 'Đã lưu trữ' : 'Danh sách nhân viên'}
          </button>
        ))}
      </div>

      {/* Bảng danh sách nhân sự */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 font-bold text-[#72776f] uppercase">
              <tr>
                <th className="p-4">Mã NV</th>
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Tài khoản</th>
                <th className="p-4">Vai trò (RBAC)</th>
                <th className="p-4">Số điện thoại</th>
                <th className="p-4">Hình thức</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center min-w-[180px]">Thao tác quản trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {nhanSuLoc.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-400">
                    {tuKhoa ? `Không tìm thấy nhân viên phù hợp với "${tuKhoa}"` : 'Danh sách đang trống.'}
                  </td>
                </tr>
              ) : (
                nhanSuLoc.map((nv) => {
                  const maVaiTro = nv.ma_vai_tro || nv.vai_tro || 'phuc_vu';
                  const tenVaiTro = nv.ten_vai_tro || nv.vai_tro_ten || (maVaiTro === 'quan_ly' ? 'Quản lý' : maVaiTro === 'thu_ngan' ? 'Thu ngân' : maVaiTro === 'bep' ? 'Đầu bếp' : 'Phục vụ');
                  const dangDinhChi = (nv.trang_thai === 'tam_nghi' || nv.trang_thai === 'tam_khoa');

                  return (
                    <tr key={nv.id} className={`hover:bg-stone-50/80 transition-colors ${dangDinhChi ? 'bg-amber-50/30' : ''}`}>
                      <td className="p-4 font-mono font-bold text-[#b64d2d]">
                        NV-{String(nv.id).padStart(3, '0')}
                      </td>
                      <td className="p-4 font-bold text-[#272d29]">
                        <div className="flex items-center gap-2">
                          <span>{nv.ho_ten}</span>
                          {maVaiTro === 'quan_ly' && (
                            <span className="p-0.5 rounded bg-purple-100 text-purple-700" title="Quản trị viên">
                              <Shield size={12} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-stone-600">{nv.ten_dang_nhap}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${mauVaiTro[maVaiTro] || 'bg-stone-100'}`}>
                          {tenVaiTro}
                        </span>
                        {maVaiTro === 'phuc_vu' && (
                          <div className="text-[10px] text-[#b64d2d] font-semibold mt-1 flex items-center gap-1">
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate max-w-[130px]" title={nv.khu_vuc_phu_trach || 'Chưa phân công bàn'}>
                              {nv.khu_vuc_phu_trach || 'Chưa có bàn'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-stone-600">{nv.so_dien_thoai || '—'}</td>
                      <td className="p-4 text-stone-600 font-medium">
                        {nv.hinh_thuc_lam_viec === 'ban_thoi_gian' ? 'Part-time' : 'Full-time'}
                      </td>
                      <td className="p-4">
                        {xemLuuTru ? <span>Đã lưu trữ</span> : dangDinhChi ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            Đình chỉ / Tạm khóa
                          </span>
                        ) : nv.trang_thai === 'da_nghi' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            Đã nghỉ việc
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#226b4c] border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#226b4c]"></span>
                            Đang làm việc
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {xemLuuTru ? (
                          <button type="button" onClick={() => khoiPhuc(nv)}
                            className="rounded-lg px-3 py-1.5 font-bold text-emerald-700 hover:bg-emerald-50">
                            Khôi phục
                          </button>
                        ) : <div className="flex items-center justify-center gap-1.5">
                          {/* 1. Xem chi tiết hồ sơ */}
                          <button
                            onClick={() => setNhanVienXem(nv)}
                            className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 hover:text-[#272d29] transition-colors"
                            title="Xem chi tiết hồ sơ (A03)"
                          >
                            <Eye size={16} />
                          </button>

                          {/* 2. CHỈNH SỬA THÔNG TIN NHÂN SỰ */}
                          <button
                            onClick={() => setNhanVienSua(nv)}
                            className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-700 hover:text-amber-900 transition-colors"
                            title="Chỉnh sửa thông tin nhân viên"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* 3. ĐÌNH CHỈ / KÍCH HOẠT LẠI */}
                          <button
                            onClick={() => handleToggleDinhChi(nv)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              dangDinhChi 
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                                : 'hover:bg-amber-50 text-stone-500 hover:text-amber-800'
                            }`}
                            title={dangDinhChi ? "Kích hoạt lại nhân viên" : "Đình chỉ / Tạm khóa tài khoản"}
                          >
                            {dangDinhChi ? <UserCheck size={16} /> : <Ban size={16} />}
                          </button>

                          {/* 4. CÀI ĐẶT BÀN PHỤ TRÁCH (CHỈ DÀNH RIÊNG CHO PHỤC VỤ) */}
                          {maVaiTro === 'phuc_vu' && (
                            <button
                              onClick={() => setNhanVienPhanQuyen(nv)}
                              className="p-1.5 hover:bg-orange-50 rounded-lg text-[#b64d2d] hover:text-[#94381d] transition-colors"
                              title="Cài đặt bàn phụ trách (Sơ đồ trực quan A04)"
                            >
                              <LayoutGrid size={16} />
                            </button>
                          )}

                          {maVaiTro !== 'quan_ly' && nv.trang_thai !== 'da_nghi' && (
                            <button type="button" onClick={() => xacNhanNghiViec(nv)}
                              className="p-1.5 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50">Nghỉ việc</button>
                          )}
                          {/* 5. XÓA NHÂN VIÊN */}
                          <button
                            onClick={() => handleXoaNhanVien(nv)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-stone-400 hover:text-rose-600 transition-colors"
                            title="Xóa khỏi danh sách nhân sự"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal A03: Xem hồ sơ */}
      {nhanVienXem && (
        <ModalHoSoNhanVien
          nhanVien={nhanVienXem}
          onDong={() => setNhanVienXem(null)}
        />
      )}

      {/* Modal Chỉnh sửa thông tin nhân viên */}
      {nhanVienSua && (
        <ModalChinhSuaNhanVien
          nhanVien={nhanVienSua}
          onDong={() => setNhanVienSua(null)}
          onCapNhat={handleCapNhat}
        />
      )}

      {/* Modal A04: Cài đặt bàn phụ trách trực quan (Dành riêng cho Phục vụ) */}
      {nhanVienPhanQuyen && (
        <ModalPhanQuyenGiaoBan
          nhanVien={nhanVienPhanQuyen}
          onDong={() => setNhanVienPhanQuyen(null)}
          onLuuPhanQuyen={(data) => {
            showToast(`Đã cập nhật ${data.banAnIds?.length || 0} bàn phụ trách cho ${nhanVienPhanQuyen.ho_ten}!`);
            taiDanhSach();
          }}
        />
      )}

      {/* Modal A05: Cấp tài khoản mới */}
      {hienCapTk && (
        <ModalCapTaiKhoan
          onDong={() => setHienCapTk(false)}
          onTaoTaiKhoan={handleTaoTk}
        />
      )}

      {/* Modal Xác nhận Hành động chuẩn Figma (Thay thế window.confirm popup mặc định) */}
      {xacNhanAction && (
        <ModalXacNhan
          hienThi={!!xacNhanAction}
          tieuDe={xacNhanAction.tieuDe}
          phanLoai={xacNhanAction.phanLoai}
          noiDung={xacNhanAction.noiDung}
          canhBaoPhu={xacNhanAction.canhBaoPhu}
          loai={xacNhanAction.loai}
          nhanNutXacNhan={xacNhanAction.nhanNutXacNhan}
          onXacNhan={xacNhanAction.onThucHien}
          onHuy={() => setXacNhanAction(null)}
        />
      )}
    </div>
  );
}
