// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A10 · QUẢN LÝ PHÒNG BÀN & CHỈNH SỬA BÀN ĂN (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, QrCode, Check, X, Users, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../dungChung/api';
import ModalXacNhan from '../../thanhPhan/ModalXacNhan';

export default function TrangQuanLyPhongBan({ onChuyenSangTaoQr }) {
  const [danhSach, setDanhSach] = useState([]);
  const [danhSachKhuVuc, setDanhSachKhuVuc] = useState([]);
  const [khuVucChon, setKhuVucChon] = useState(null);
  const [hienFormKhuVuc, setHienFormKhuVuc] = useState(false);
  const [dangTaoKhuVuc, setDangTaoKhuVuc] = useState(false);
  const [loiKhuVuc, setLoiKhuVuc] = useState('');
  const [dangTai, setDangTai] = useState(false);
  const [thongBao, setThongBao] = useState(null);

  // State Modal Chỉnh sửa / Thêm mới
  const [banDangSua, setBanDangSua] = useState(null);
  const [hienModalThem, setHienModalThem] = useState(false);
  const [xacNhanXoaBan, setXacNhanXoaBan] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    ma_ban: '',
    ten_ban: '',
    khu_vuc_id: '',
    suc_chua: 4,
    tu_dong_duyet_mon: 0
  });

  // Tải danh sách bàn và khu vực từ Backend
  const taiDuLieu = async () => {
    try {
      setDangTai(true);
      const res = await api.get('/api/ban-an');
      if (res) {
        if (Array.isArray(res.banAn)) {
          // Chuẩn hóa dữ liệu bàn
          const banChuan = res.banAn.map(b => ({
            id: b.id,
            ma_ban: b.ma_ban,
            ten_ban: b.ten_ban,
            khu_vuc: b.ten_khu_vuc,
            khu_vuc_id: b.khu_vuc_id,
            so_cho: b.suc_chua || 4,
            trang_thai: b.trang_thai || 'trong',
            tu_dong_duyet_mon: b.tu_dong_duyet_mon || 0
          }));
          setDanhSach(banChuan);
        }
        if (Array.isArray(res.khuVuc)) {
          setDanhSachKhuVuc(res.khuVuc);
        }
      }
    } catch (err) {
      setLoiKhuVuc('Không tải được danh sách phòng bàn. ' + err.message);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
  }, []);

  // Lọc bàn theo khu vực
  const banLoc = danhSach.filter(b => khuVucChon === null || b.khu_vuc_id === khuVucChon);

  const handleTaoKhuVuc = async (e) => {
    e.preventDefault();
    const duLieu = Object.fromEntries(new FormData(e.currentTarget));
    setDangTaoKhuVuc(true);
    setLoiKhuVuc('');
    try {
      const khuVuc = await api.post('/api/ban-an/khu-vuc', duLieu);
      setDanhSachKhuVuc(prev => [...prev, khuVuc]);
      setKhuVucChon(khuVuc.id);
      setHienFormKhuVuc(false);
      setThongBao({ loai: 'thanhCong', noiDung: 'Đã tạo khu vực ' + khuVuc.ten_khu_vuc });
    } catch (err) {
      setLoiKhuVuc(err.message);
    } finally {
      setDangTaoKhuVuc(false);
    }
  };

  // Mở modal sửa bàn
  const handleMoSuaBan = (ban) => {
    setBanDangSua(ban);
    setFormData({
      id: ban.id,
      ma_ban: ban.ma_ban,
      ten_ban: ban.ten_ban,
      khu_vuc_id: ban.khu_vuc_id,
      suc_chua: ban.so_cho || 4,
      tu_dong_duyet_mon: ban.tu_dong_duyet_mon || 0
    });
  };

  // Mở modal thêm bàn
  const handleMoThemBan = () => {
    if (!danhSachKhuVuc.length) return;
    setFormData({
      id: null,
      ma_ban: `B${String(danhSach.length + 1).padStart(2, '0')}`,
      ten_ban: `Bàn ${String(danhSach.length + 1).padStart(2, '0')}`,
      khu_vuc_id: khuVucChon ?? danhSachKhuVuc[0].id,
      suc_chua: 4,
      tu_dong_duyet_mon: 0
    });
    setHienModalThem(true);
  };

  // Lưu chỉnh sửa bàn
  const handleLuuSuaBan = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        // Cập nhật bàn ăn hiện có
        await api.put(`/api/ban-an/${formData.id}`, {
          tenBan: formData.ten_ban,
          maBan: formData.ma_ban,
          khuVucId: formData.khu_vuc_id,
          sucChua: formData.suc_chua,
          tuDongDuyetMon: formData.tu_dong_duyet_mon === 1
        });

        const tenKhuVuc = danhSachKhuVuc.find(k => k.id === Number(formData.khu_vuc_id))?.ten_khu_vuc;

        setDanhSach(prev => prev.map(b => b.id === formData.id ? {
          ...b,
          ten_ban: formData.ten_ban,
          ma_ban: formData.ma_ban,
          so_cho: formData.suc_chua,
          khu_vuc: tenKhuVuc,
          khu_vuc_id: formData.khu_vuc_id,
          tu_dong_duyet_mon: formData.tu_dong_duyet_mon
        } : b));

        setThongBao({ loai: 'thanhCong', noiDung: `Cập nhật thông tin ${formData.ten_ban} thành công!` });
      }
      setBanDangSua(null);
    } catch (err) {
      alert('Lỗi khi cập nhật bàn: ' + (err.message || 'Không thể kết nối máy chủ'));
    }
  };

  // Lưu tạo bàn mới
  const handleLuuThemBan = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/ban-an', {
        tenBan: formData.ten_ban,
        maBan: formData.ma_ban,
        khuVucId: formData.khu_vuc_id,
        sucChua: formData.suc_chua,
        tuDongDuyetMon: formData.tu_dong_duyet_mon === 1
      });

      const tenKhuVuc = danhSachKhuVuc.find(k => k.id === Number(formData.khu_vuc_id))?.ten_khu_vuc;

      const banMoi = {
        id: res.id,
        ma_ban: formData.ma_ban,
        ten_ban: formData.ten_ban,
        khu_vuc: tenKhuVuc,
        khu_vuc_id: formData.khu_vuc_id,
        so_cho: formData.suc_chua,
        trang_thai: 'trong',
        tu_dong_duyet_mon: formData.tu_dong_duyet_mon
      };

      setDanhSach(prev => [...prev, banMoi]);
      setThongBao({ loai: 'thanhCong', noiDung: `Đã tạo thêm ${formData.ten_ban} thành công!` });
      setHienModalThem(false);
    } catch (err) {
      alert('Lỗi tạo bàn mới: ' + (err.message || 'Không thể kết nối máy chủ'));
    }
  };

  // Xóa bàn ăn (Mở Modal Xác nhận Figma)
  const handleXoaBan = (ban) => {
    setXacNhanXoaBan({
      ban,
      tieuDe: `Xác nhận xóa: ${ban.ten_ban}`,
      phanLoai: 'QUẢN LÝ PHÒNG BÀN',
      noiDung: `Bạn có chắc chắn muốn xóa/ngừng sử dụng bàn "${ban.ten_ban}" (${ban.ma_ban})?`,
      canhBaoPhu: 'Bàn này sẽ được loại bỏ khỏi sơ đồ phục vụ nhà hàng.',
      loai: 'nguyHiem',
      nhanNutXacNhan: 'Xóa bàn',
      onThucHien: async () => {
        try {
          if (ban.id) {
            await api.delete(`/api/ban-an/${ban.id}`);
          }
          setDanhSach(prev => prev.filter(b => b.ma_ban !== ban.ma_ban));
          setThongBao({ loai: 'thanhCong', noiDung: `Đã xóa ${ban.ten_ban} khỏi danh sách hoạt động!` });
        } catch (err) {
          alert('Lỗi khi xóa bàn: ' + (err.message || 'Không thể kết nối máy chủ'));
        } finally {
          setXacNhanXoaBan(null);
        }
      }
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Tiêu đề & Nút thao tác */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#272d29] tracking-tight">
            Quản lý danh sách phòng & bàn ăn
          </h1>
          <p className="text-xs text-[#72776f] mt-1">
            Thiết lập khu vực không gian nhà hàng, tạo bàn mới, chỉnh sửa thông tin và mã QR
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setHienFormKhuVuc(true)}
            className="py-2.5 px-4 bg-white border border-stone-200 rounded-xl font-bold text-xs">
            Tạo khu vực
          </button>
          <button
            onClick={onChuyenSangTaoQr}
            className="py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-200 text-[#272d29] rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <QrCode size={16} className="text-[#b64d2d]" />
            <span>Xuất mã QR các bàn (A11) →</span>
          </button>

          <button
            onClick={handleMoThemBan}
            disabled={dangTai || !danhSachKhuVuc.length}
            className="py-2.5 px-4 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus size={16} />
            <span>Thêm bàn mới</span>
          </button>
        </div>
      </div>

      {/* Thông báo kết quả thao tác */}
      {thongBao && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-[#226b4c] border border-emerald-200 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{thongBao.noiDung}</span>
          </div>
          <button onClick={() => setThongBao(null)} className="text-stone-400 hover:text-stone-600">
            <X size={15} />
          </button>
        </div>
      )}

      {loiKhuVuc && <p role="alert" className="text-sm text-rose-700">{loiKhuVuc}</p>}
      {!dangTai && danhSachKhuVuc.length === 0 && <p className="text-sm text-stone-600">Chưa có khu vực. Hãy tạo khu vực trước khi thêm bàn.</p>}
      {hienFormKhuVuc && (
        <form onSubmit={handleTaoKhuVuc} className="flex flex-wrap items-end gap-3 p-4 bg-white border border-stone-200 rounded-xl">
          <label className="grid gap-1 text-xs font-bold">Mã khu vực
            <input name="maKhuVuc" required maxLength={20} className="border border-stone-200 rounded-lg px-3 py-2" placeholder="T1" />
          </label>
          <label className="grid gap-1 text-xs font-bold">Tên khu vực
            <input name="tenKhuVuc" required maxLength={100} className="border border-stone-200 rounded-lg px-3 py-2" placeholder="Tầng 1" />
          </label>
          <button type="submit" disabled={dangTaoKhuVuc} className="px-4 py-2 bg-[#b64d2d] text-white rounded-lg text-xs font-bold disabled:opacity-50">Lưu khu vực</button>
          <button type="button" disabled={dangTaoKhuVuc} onClick={() => { setHienFormKhuVuc(false); setLoiKhuVuc(''); }}
            className="px-4 py-2 text-xs font-bold">Hủy</button>
        </form>
      )}
      {/* Bộ lọc khu vực */}
      <div className="flex items-center gap-2">
        {[{ id: null, ten_khu_vuc: 'Tất cả' }, ...danhSachKhuVuc].map(kv => (
          <button
            key={kv.id ?? 'tat-ca'}
            onClick={() => setKhuVucChon(kv.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              khuVucChon === kv.id ? 'bg-[#272d29] text-white shadow-xs' : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
            }`}
          >
            {kv.ten_khu_vuc}
          </button>
        ))}
      </div>

      {/* Lưới các bàn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {banLoc.map((b) => (
          <div
            key={b.ma_ban}
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between h-40 group hover:border-[#b64d2d]/40 hover:shadow-md transition-all relative"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs font-bold text-[#b64d2d] uppercase block">{b.ma_ban}</span>
                <h3 className="text-xl font-black text-[#272d29] mt-0.5">{b.ten_ban}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                  <Users size={12} />
                  <span>{b.so_cho} chỗ</span>
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-stone-100 text-xs">
              <span className="text-stone-500 font-medium truncate max-w-[130px]">{b.khu_vuc}</span>

              {/* Nút hành động Chỉnh sửa / Xóa */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMoSuaBan(b)}
                  title="Chỉnh sửa thông tin bàn"
                  className="p-1.5 rounded-lg text-stone-500 hover:text-[#b64d2d] hover:bg-[#f9ede6] transition-colors cursor-pointer"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleXoaBan(b)}
                  title="Xóa bàn"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CHỈNH SỬA THÔNG TIN BÀN */}
      {banDangSua && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in duration-150">
            <div className="bg-[#272d29] text-white p-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-[#f9ede6] uppercase tracking-wider block">QUẢN LÝ BÀN ĂN</span>
                <h3 className="font-bold text-sm">Chỉnh sửa thông tin {banDangSua.ten_ban}</h3>
              </div>
              <button onClick={() => setBanDangSua(null)} className="p-1 rounded-full hover:bg-white/10 text-white/70">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLuuSuaBan} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">MÃ BÀN *</label>
                <input
                  type="text"
                  value={formData.ma_ban}
                  onChange={(e) => setFormData({ ...formData, ma_ban: e.target.value })}
                  required
                  placeholder="Ví dụ: B08, VIP01"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-mono font-bold text-[#272d29]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">TÊN HIỂN THỊ BÀN *</label>
                <input
                  type="text"
                  value={formData.ten_ban}
                  onChange={(e) => setFormData({ ...formData, ten_ban: e.target.value })}
                  required
                  placeholder="Ví dụ: Bàn 08, Phòng VIP Hoàng Gia"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-bold text-[#272d29]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">KHU VỰC *</label>
                  <select
                    value={formData.khu_vuc_id}
                    onChange={(e) => setFormData({ ...formData, khu_vuc_id: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-semibold text-[#272d29]"
                  >
                    {danhSachKhuVuc.map(kv => (
                      <option key={kv.id} value={kv.id}>{kv.ten_khu_vuc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">SỐ CHỖ NGỒI *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.suc_chua}
                    onChange={(e) => setFormData({ ...formData, suc_chua: Number(e.target.value) })}
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-bold text-[#272d29]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <input
                    type="checkbox"
                    checked={formData.tu_dong_duyet_mon === 1}
                    onChange={(e) => setFormData({ ...formData, tu_dong_duyet_mon: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 text-[#b64d2d] rounded accent-[#b64d2d]"
                  />
                  <div>
                    <span className="font-bold text-stone-800 block">Tự động duyệt món (Fast Track)</span>
                    <span className="text-[10px] text-stone-500">Khách quét QR đặt món chuyển thẳng Bếp KDS không cần phục vụ bấm duyệt</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setBanDangSua(null)}
                  className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Check size={16} />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM BÀN ĂN MỚI */}
      {hienModalThem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in duration-150">
            <div className="bg-[#272d29] text-white p-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-[#f9ede6] uppercase tracking-wider block">THÊM MỚI PHÒNG BÀN</span>
                <h3 className="font-bold text-sm">Khởi tạo bàn ăn & mã QR mới</h3>
              </div>
              <button onClick={() => setHienModalThem(false)} className="p-1 rounded-full hover:bg-white/10 text-white/70">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLuuThemBan} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">MÃ BÀN *</label>
                <input
                  type="text"
                  value={formData.ma_ban}
                  onChange={(e) => setFormData({ ...formData, ma_ban: e.target.value })}
                  required
                  placeholder="Ví dụ: B19, VIP02"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-mono font-bold text-[#272d29]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">TÊN HIỂN THỊ BÀN *</label>
                <input
                  type="text"
                  value={formData.ten_ban}
                  onChange={(e) => setFormData({ ...formData, ten_ban: e.target.value })}
                  required
                  placeholder="Ví dụ: Bàn 19"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-bold text-[#272d29]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">KHU VỰC *</label>
                  <select
                    value={formData.khu_vuc_id}
                    onChange={(e) => setFormData({ ...formData, khu_vuc_id: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-semibold text-[#272d29]"
                  >
                    {danhSachKhuVuc.map(kv => (
                      <option key={kv.id} value={kv.id}>{kv.ten_khu_vuc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">SỐ CHỖ NGỒI *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.suc_chua}
                    onChange={(e) => setFormData({ ...formData, suc_chua: Number(e.target.value) })}
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-bold text-[#272d29]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <input
                    type="checkbox"
                    checked={formData.tu_dong_duyet_mon === 1}
                    onChange={(e) => setFormData({ ...formData, tu_dong_duyet_mon: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 text-[#b64d2d] rounded accent-[#b64d2d]"
                  />
                  <div>
                    <span className="font-bold text-stone-800 block">Tự động duyệt món (Fast Track)</span>
                    <span className="text-[10px] text-stone-500">Khách quét QR đặt món chuyển thẳng Bếp KDS</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setHienModalThem(false)}
                  className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Tạo bàn mới</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa Bàn chuẩn Figma */}
      {xacNhanXoaBan && (
        <ModalXacNhan
          hienThi={!!xacNhanXoaBan}
          tieuDe={xacNhanXoaBan.tieuDe}
          phanLoai={xacNhanXoaBan.phanLoai}
          noiDung={xacNhanXoaBan.noiDung}
          canhBaoPhu={xacNhanXoaBan.canhBaoPhu}
          loai={xacNhanXoaBan.loai}
          nhanNutXacNhan={xacNhanXoaBan.nhanNutXacNhan}
          onXacNhan={xacNhanXoaBan.onThucHien}
          onHuy={() => setXacNhanXoaBan(null)}
        />
      )}
    </div>
  );
}
