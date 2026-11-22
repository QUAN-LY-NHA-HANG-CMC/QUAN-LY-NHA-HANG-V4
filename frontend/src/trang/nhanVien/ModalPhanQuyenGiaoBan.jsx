// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A04 · CÀI ĐẶT BÀN PHỤ TRÁCH & PHÂN QUYỀN (CHUYÊN BIỆT CHO NHÂN VIÊN PHỤC VỤ)
// MÀN HÌNH CHỌN BÀN TRỰC QUAN (VISUAL TABLE SELECTOR GRID) - FIGMA QUÁN MỘC POS
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Check, MapPin, Users, LayoutGrid, CheckSquare, 
  Square, RefreshCw, AlertCircle, Info, Sparkles 
} from 'lucide-react';
import { api } from '../../dungChung/api';

export default function ModalPhanQuyenGiaoBan({
  nhanVien,
  onDong,
  onLuuPhanQuyen
}) {


  // Tabs: 'soDoBan' (Màn hình chọn bàn trực quan) | 'quyenNghiepVu' (Quyền phục vụ)
  const [tabHienTai, setTabHienTai] = useState('soDoBan');

  // Danh sách toàn bộ bàn và khu vực từ API
  const [danhSachBan, setDanhSachBan] = useState([]);
  const [danhSachKhuVuc, setDanhSachKhuVuc] = useState([]);
  const [khuVucChon, setKhuVucChon] = useState('tat_ca');
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [thongBaoLoi, setThongBaoLoi] = useState('');

  // Danh sách ID các bàn được chọn phụ trách
  const [banDaChon, setBanDaChon] = useState([]);

  // Ma trận quyền phục vụ chi tiết
  const [quyen, setQuyen] = useState({
    xemDonQr: true,
    duyetDonQr: true,
    datMonHo: true,
    chuyenGopBan: true,
    guiYeuCauHuyMon: true,
    inHoaDon: false,
    chietKhau: false
  });

  // Tải danh sách bàn và bàn đã phân công từ Backend
  useEffect(() => {
    if (!nhanVien) return;
    let unmounted = false;

    const taiDuLieu = async () => {
      setDangTai(true);
      setThongBaoLoi('');
      try {
        // 1. Tải toàn bộ bàn ăn của nhà hàng
        const resBan = await api.get('/api/ban-an');
        if (!unmounted && resBan) {
          const dsBan = resBan.banAn || [];
          setDanhSachBan(dsBan);
          setDanhSachKhuVuc(resBan.khuVuc || []);

          // 2. Tải danh sách bàn nhân viên này đang phụ trách từ CSDL
          try {
            const resPhanCong = await api.get(`/api/tai-khoan/nhan-su/${nhanVien.id}/ban-phu-trach`);
            if (!unmounted && Array.isArray(resPhanCong)) {
              const ids = resPhanCong.map(b => b.ban_an_id);
              setBanDaChon(ids);
            }
          } catch (e) {
            // Nếu chưa có phân công hoặc có danh sách trong props
            if (nhanVien.khu_vuc_phu_trach) {
              const maBans = nhanVien.khu_vuc_phu_trach.split(',').map(s => s.trim());
              const ids = dsBan.filter(b => maBans.includes(b.ma_ban)).map(b => b.id);
              if (!unmounted) setBanDaChon(ids);
            }
          }
        }
      } catch (err) {
        if (!unmounted) {
          setThongBaoLoi('Không thể tải sơ đồ phòng bàn từ máy chủ: ' + err.message);
        }
      } finally {
        if (!unmounted) setDangTai(false);
      }
    };

    taiDuLieu();
    if (!nhanVien) return null;

  return () => { unmounted = true; };
  }, [nhanVien.id]);

  // Thao tác chọn / bỏ chọn 1 bàn
  const toggleChonBan = (banId) => {
    setBanDaChon(prev => 
      prev.includes(banId) ? prev.filter(id => id !== banId) : [...prev, banId]
    );
  };

  // Chọn tất cả bàn hiển thị
  const handleChonTatCa = () => {
    const idsHienThi = banLoc.map(b => b.id);
    setBanDaChon(prev => Array.from(new Set([...prev, ...idsHienThi])));
  };

  // Bỏ chọn tất cả bàn hiển thị
  const handleBoChonTatCa = () => {
    const idsHienThi = new Set(banLoc.map(b => b.id));
    setBanDaChon(prev => prev.filter(id => !idsHienThi.has(id)));
  };

  // Bật/tắt quyền nghiệp vụ
  const toggleQuyen = (key) => {
    setQuyen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Lưu phân công bàn phụ trách vào CSDL SQLite Backend
  const handleLuu = async () => {
    setDangLuu(true);
    setThongBaoLoi('');
    try {
      // 1. Ghi nhận phân công bàn vào CSDL backend
      await api.put(`/api/tai-khoan/nhan-su/${nhanVien.id}/ban-phu-trach`, {
        banAnIds: banDaChon
      });

      // 2. Tạo chuỗi tóm tắt khu vực bàn
      const cacBanChon = danhSachBan.filter(b => banDaChon.includes(b.id));
      const moTaBans = cacBanChon.map(b => b.ma_ban).join(', ');

      if (onLuuPhanQuyen) {
        onLuuPhanQuyen({
          nhanVienId: nhanVien.id,
          banAnIds: banDaChon,
          cacBanChon,
          moTaBans,
          quyen
        });
      }
      onDong();
    } catch (err) {
      setThongBaoLoi('Lỗi khi lưu phân công bàn: ' + err.message);
    } finally {
      setDangLuu(false);
    }
  };

  // Lọc bàn theo khu vực đang chọn
  const banLoc = danhSachBan.filter(b => {
    if (khuVucChon === 'tat_ca') return true;
    return String(b.khu_vuc_id) === String(khuVucChon);
  });

  // Tóm tắt các bàn đang được chọn
  const cacBanDangChon = danhSachBan.filter(b => banDaChon.includes(b.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* HEADER MODAL */}
        <div className="p-5 bg-stone-50/80 border-b border-stone-200 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#b64d2d] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <LayoutGrid size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                  CHỈ ÁP DỤNG PHỤC VỤ (A04)
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  {nhanVien.ten_dang_nhap ? `@${nhanVien.ten_dang_nhap}` : `NV-${String(nhanVien.id).padStart(3, '0')}`}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#272d29] mt-0.5">
                Cài đặt bàn phụ trách: <span className="text-[#b64d2d]">{nhanVien.ho_ten}</span>
              </h3>
            </div>
          </div>
          <button 
            onClick={onDong} 
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* THANH TAB ĐIỀU HƯỚNG */}
        <div className="flex items-center justify-between px-5 pt-3 border-b border-stone-200 bg-white">
          <div className="flex gap-2">
            <button
              onClick={() => setTabHienTai('soDoBan')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                tabHienTai === 'soDoBan'
                  ? 'border-[#b64d2d] text-[#b64d2d]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <LayoutGrid size={15} />
              <span>Sơ đồ chọn bàn trực quan</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[#b64d2d]/10 text-[#b64d2d] rounded-full text-[10px]">
                {banDaChon.length} bàn
              </span>
            </button>
            <button
              onClick={() => setTabHienTai('quyenNghiepVu')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                tabHienTai === 'quyenNghiepVu'
                  ? 'border-[#b64d2d] text-[#b64d2d]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Shield size={15} />
              <span>Ma trận quyền nghiệp vụ</span>
            </button>
          </div>

          {/* Badge thống kê nhanh */}
          <div className="text-xs font-medium text-stone-500 hidden sm:block">
            Đã phân công: <strong className="text-[#2d4336]">{banDaChon.length}</strong> / {danhSachBan.length} bàn
          </div>
        </div>

        {/* THÔNG BÁO LỖI NẾU CÓ */}
        {thongBaoLoi && (
          <div className="mx-5 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{thongBaoLoi}</span>
          </div>
        )}

        {/* NỘI DUNG CUỘN CHÍNH */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {tabHienTai === 'soDoBan' ? (
            <>
              {/* THANH LỌC KHU VỰC VÀ NÚT CHỌN NHANH */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                {/* Tabs khu vực */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-bold text-stone-500 mr-1">KHU VỰC:</span>
                  <button
                    onClick={() => setKhuVucChon('tat_ca')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      khuVucChon === 'tat_ca'
                        ? 'bg-[#272d29] text-white shadow-xs'
                        : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    Tất cả ({danhSachBan.length})
                  </button>
                  {danhSachKhuVuc.map(kv => {
                    const soBanKv = danhSachBan.filter(b => b.khu_vuc_id === kv.id).length;
                    return (
                      <button
                        key={kv.id}
                        onClick={() => setKhuVucChon(kv.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          String(khuVucChon) === String(kv.id)
                            ? 'bg-[#b64d2d] text-white shadow-xs'
                            : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                        }`}
                      >
                        {kv.ten_khu_vuc} ({soBanKv})
                      </button>
                    );
                  })}
                </div>

                {/* Các nút chọn nhanh */}
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={handleChonTatCa}
                    className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                    title="Chọn tất cả các bàn trong khu vực đang xem"
                  >
                    <CheckSquare size={14} />
                    <span>Chọn tất cả</span>
                  </button>
                  <button
                    onClick={handleBoChonTatCa}
                    className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                    title="Bỏ chọn các bàn trong khu vực đang xem"
                  >
                    <Square size={14} />
                    <span>Bỏ chọn</span>
                  </button>
                </div>
              </div>

              {/* LƯỚI BÀN ĂN TRỰC QUAN (CARD GRID) */}
              {dangTai ? (
                <div className="py-16 text-center text-stone-400">
                  <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#b64d2d]" />
                  <p className="text-xs">Đang tải sơ đồ phòng bàn...</p>
                </div>
              ) : banLoc.length === 0 ? (
                <div className="py-12 text-center text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  <p className="text-xs">Không có bàn nào trong khu vực này</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {banLoc.map(ban => {
                    const daChon = banDaChon.includes(ban.id);
                    return (
                      <div
                        key={ban.id}
                        onClick={() => toggleChonBan(ban.id)}
                        className={`relative rounded-2xl p-3.5 cursor-pointer transition-all border-2 select-none flex flex-col justify-between min-h-[115px] ${
                          daChon
                            ? 'bg-[#fcf4f1] border-[#b64d2d] shadow-sm ring-2 ring-[#b64d2d]/20'
                            : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-md'
                        }`}
                      >
                        {/* Hàng 1: Mã bàn & Trạng thái check */}
                        <div className="flex items-center justify-between">
                          <span className={`text-base font-black font-mono tracking-tight ${
                            daChon ? 'text-[#b64d2d]' : 'text-[#272d29]'
                          }`}>
                            {ban.ma_ban}
                          </span>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            daChon 
                              ? 'bg-[#b64d2d] text-white shadow-xs' 
                              : 'border border-stone-300 bg-stone-50 text-transparent'
                          }`}>
                            <Check size={13} strokeWidth={3} />
                          </div>
                        </div>

                        {/* Hàng 2: Tên bàn & Sức chứa */}
                        <div className="my-1.5">
                          <h4 className="text-xs font-bold text-stone-800 line-clamp-1">
                            {ban.ten_ban}
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
                            <Users size={12} className="text-stone-400 shrink-0" />
                            <span>{ban.suc_chua || 4} chỗ ngồi</span>
                          </div>
                        </div>

                        {/* Hàng 3: Khu vực & Huy hiệu đang phụ trách */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px]">
                          <span className="text-stone-400 truncate max-w-[90px]">
                            {ban.ten_khu_vuc ? ban.ten_khu_vuc.split('(')[0].trim() : 'Khu vực'}
                          </span>
                          <span className={`font-bold px-1.5 py-0.5 rounded ${
                            daChon 
                              ? 'bg-[#b64d2d]/10 text-[#b64d2d]' 
                              : 'text-stone-400'
                          }`}>
                            {daChon ? 'Đang phụ trách' : 'Chưa chọn'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* THANH TÓM TẮT CÁC BÀN ĐANG ĐƯỢC CHỌN */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#b64d2d]" />
                    <span>DANH SÁCH BÀN ĐÃ PHÂN CÔNG ({banDaChon.length} BÀN):</span>
                  </span>
                  {banDaChon.length > 0 && (
                    <button
                      onClick={() => setBanDaChon([])}
                      className="text-[11px] text-rose-600 hover:underline font-bold"
                    >
                      Xóa toàn bộ phân công
                    </button>
                  )}
                </div>
                {cacBanDangChon.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">
                    Chưa chọn bàn nào. Hãy bấm trực tiếp vào các ô bàn ở trên để giao cho nhân viên phục vụ này.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {cacBanDangChon.map(b => (
                      <span 
                        key={b.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#b64d2d]/30 text-[#b64d2d] rounded-lg text-xs font-bold shadow-2xs"
                      >
                        <span>{b.ma_ban}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleChonBan(b.id); }}
                          className="hover:bg-orange-100 rounded p-0.5 text-stone-400 hover:text-stone-700"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* TAB 2: MA TRẬN QUYỀN HẠN PHỤC VỤ */
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
                <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Chính sách Phân quyền Nhân viên Phục vụ (RBAC):</strong>
                  <span>
                    Các quyền dưới đây được áp dụng khi nhân viên phục vụ đăng nhập ứng dụng Mobile/Tablet để nhận đơn gọi món QR và phục vụ bàn.
                  </span>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2.5">
                {[
                  { key: 'xemDonQr', label: 'Xem danh sách đơn gọi món QR khách hàng tại bàn', moTa: 'Cho phép xem khách tại bàn phụ trách đang chọn món gì' },
                  { key: 'duyetDonQr', label: 'Duyệt chuyển đơn gọi món xuống Bếp KDS', moTa: 'Xác nhận đơn món của khách để chuyển tức thì cho bếp nấu' },
                  { key: 'datMonHo', label: 'Gọi món và thêm món trực tiếp hộ khách', moTa: 'Hỗ trợ khách hàng gọi món trên thiết bị của nhân viên' },
                  { key: 'chuyenGopBan', label: 'Thực hiện chuyển bàn hoặc gộp bàn', moTa: 'Chuyển dời phiên bàn của khách giữa các bàn phụ trách' },
                  { key: 'guiYeuCauHuyMon', label: 'Gửi yêu cầu hủy món ăn về Bếp/Quản lý', moTa: 'Cần Quản lý hoặc Bếp trưởng duyệt hủy nếu đã bắt đầu nấu' },
                  { key: 'inHoaDon', label: 'In hóa đơn tạm tính gửi khách xem trước', moTa: 'In phiếu tạm tính để khách kiểm tra trước khi thanh toán' },
                  { key: 'chietKhau', label: 'Áp dụng giảm giá và mã khuyến mãi trực tiếp', moTa: 'Chỉ nên bật cho Trưởng ca hoặc nhân viên có thẩm quyền' }
                ].map(item => (
                  <label 
                    key={item.key} 
                    className="flex items-start justify-between cursor-pointer p-3 bg-white hover:bg-stone-100/70 rounded-xl border border-stone-200 transition-colors"
                  >
                    <div className="pr-3">
                      <span className="font-bold text-xs text-[#272d29] block">{item.label}</span>
                      <span className="text-[11px] text-stone-500 mt-0.5 block">{item.moTa}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={quyen[item.key]}
                      onChange={() => toggleQuyen(item.key)}
                      className="w-5 h-5 accent-[#b64d2d] rounded mt-1 shrink-0"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <div className="text-xs text-stone-600 hidden sm:block">
            {banDaChon.length > 0 ? (
              <span>Đang phân công <strong className="text-[#b64d2d] font-bold">{banDaChon.length} bàn</strong> cho <strong>{nhanVien.ho_ten}</strong></span>
            ) : (
              <span className="text-amber-700">⚠️ Chưa phân công bàn nào</span>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onDong}
              disabled={dangLuu}
              className="flex-1 sm:flex-none px-4 py-2.5 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl font-bold text-xs transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleLuu}
              disabled={dangLuu}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {dangLuu ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Đang lưu CSDL...</span>
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  <span>Lưu phân công bàn ({banDaChon.length} bàn)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
