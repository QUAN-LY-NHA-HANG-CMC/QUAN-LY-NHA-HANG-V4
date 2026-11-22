// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A12 · QUẢN LÝ THỰC ĐƠN & THEO DÕI SỐ SUẤT CÒN LẠI (1440x1000) - CHUẨN FIGMA
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight, 
  Sparkles, RefreshCw, AlertCircle, CheckCircle2, AlertTriangle,
  MinusCircle, PlusCircle, Infinity as InfinityIcon
} from 'lucide-react';
import ModalThemSuaMon from './ModalThemSuaMon';
import ModalXacNhan from '../../thanhPhan/ModalXacNhan';
import { dinhDangTien } from '../../dungChung/dinhDang';
import { api } from '../../dungChung/api';
import { ketNoiSocket } from '../../dungChung/ketNoiSocket';

export default function TrangQuanLyThucDon() {
  const [danhSach, setDanhSach] = useState([]);
  const [danhMucList, setDanhMucList] = useState([]);
  const [hienFormDanhMuc, setHienFormDanhMuc] = useState(false);
  const [dangTaoDanhMuc, setDangTaoDanhMuc] = useState(false);
  const [loiDanhMuc, setLoiDanhMuc] = useState('');
  const [dangTai, setDangTai] = useState(false);
  const [tuKhoa, setTuKhoa] = useState('');
  const [danhMucChon, setDanhMucChon] = useState('all');
  
  // Modals state
  const [monChinhSua, setMonChinhSua] = useState(null);
  const [hienThemMoi, setHienThemMoi] = useState(false);
  const [monChinhSuat, setMonChinhSuat] = useState(null); // Modal chỉnh nhanh số suất
  const [soSuatMoi, setSoSuatMoi] = useState('');
  const [xacNhanAction, setXacNhanAction] = useState(null);
  const [thongBao, setThongBao] = useState(null);

  const showToast = (noiDung, loai = 'thanhCong') => {
    setThongBao({ noiDung, loai });
    setTimeout(() => setThongBao(null), 4000);
  };

  // 1. Tải thực đơn từ backend SQLite
  const taiThucDon = async () => {
    setDangTai(true);
    try {
      const res = await api.get('/api/thuc-don');
      if (res) {
        if (Array.isArray(res.danhMuc)) {
          setDanhMucList(res.danhMuc);
        }
        if (Array.isArray(res.tatCaMon)) {
          setDanhSach(res.tatCaMon);
        }
      }
    } catch (err) {
      setDanhSach([]);
      setDanhMucList([]);
      showToast(err.message, 'loi');
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiThucDon();

    // 2. Lắng nghe cập nhật số suất & còn món từ Socket.io theo thời gian thực
    const socket = ketNoiSocket();
    const handleCapNhatConMon = (data) => {
      setDanhSach(prev => prev.map(m => m.id === data.monId ? { ...m, con_mon: data.conMon, so_suat_con_lai: data.soSuatConLai ?? m.so_suat_con_lai } : m));
    };
    const handleCapNhatSoSuat = (data) => {
      setDanhSach(prev => prev.map(m => m.id === data.monId ? { ...m, so_suat_con_lai: data.soSuatConLai, con_mon: data.conMon } : m));
    };
    const handleThemMon = (monMoi) => {
      setDanhSach(prev => [monMoi, ...prev.filter(m => m.id !== monMoi.id)]);
    };
    const handleXoaMon = (data) => {
      setDanhSach(prev => prev.filter(m => m.id !== data.id));
    };

    socket.on('thuc_don:cap_nhat_con_mon', handleCapNhatConMon);
    socket.on('thuc_don:cap_nhat_so_suat', handleCapNhatSoSuat);
    socket.on('thuc_don:them_mon_moi', handleThemMon);
    socket.on('thuc_don:xoa_mon', handleXoaMon);

    return () => {
      socket.off('thuc_don:cap_nhat_con_mon', handleCapNhatConMon);
      socket.off('thuc_don:cap_nhat_so_suat', handleCapNhatSoSuat);
      socket.off('thuc_don:them_mon_moi', handleThemMon);
      socket.off('thuc_don:xoa_mon', handleXoaMon);
    };
  }, []);

  // 3. Lọc danh sách món
  const monLoc = danhSach.filter(m => {
    const tuKhoaChuan = tuKhoa.toLowerCase().trim();
    const khopTuKhoa = !tuKhoaChuan || 
      (m.ten_mon && m.ten_mon.toLowerCase().includes(tuKhoaChuan)) || 
      (m.ma_mon && m.ma_mon.toLowerCase().includes(tuKhoaChuan));
    const khopDm = danhMucChon === 'all' || String(m.danh_muc_id) === String(danhMucChon);
    return khopTuKhoa && khopDm;
  });

  // 4. Bật / Tắt trạng thái còn món (Bếp / Quản lý)
  const toggleConMon = async (mon) => {
    const trangThaiMoi = mon.con_mon === 1 ? 0 : 1;
    try {
      await api.put(`/api/thuc-don/${mon.id}/trang-thai-mon`, { conMon: trangThaiMoi });
      setDanhSach(prev => prev.map(m => m.id === mon.id ? { 
        ...m, 
        con_mon: trangThaiMoi,
        so_suat_con_lai: trangThaiMoi === 0 ? 0 : m.so_suat_con_lai
      } : m));
      showToast(trangThaiMoi === 1 ? `Đã mở lại món "${mon.ten_mon}"` : `Đã tạm hết món "${mon.ten_mon}"`);
    } catch (err) {
      showToast(`Lỗi cập nhật trạng thái: ${err.message}`, 'loi');
    }
  };

  // 5. Cập nhật nhanh số suất còn lại của món ăn
  const handleLuuSoSuat = async (monId, giaTriSuat) => {
    try {
      const res = await api.put(`/api/thuc-don/${monId}/so-suat`, { soSuatConLai: giaTriSuat });
      setDanhSach(prev => prev.map(m => m.id === monId ? { 
        ...m, 
        so_suat_con_lai: res.so_suat_con_lai, 
        con_mon: res.con_mon 
      } : m));
      setMonChinhSuat(null);
      showToast(`Đã cập nhật số suất món "${res.ten_mon}": ${res.so_suat_con_lai !== null ? res.so_suat_con_lai + ' suất' : 'Không giới hạn'}`);
    } catch (err) {
      showToast(`Lỗi cập nhật số suất: ${err.message}`, 'loi');
    }
  };

  // 6. Xóa món ăn khỏi thực đơn (qua ModalXacNhan Figma)
  const yeuCauXoaMon = (mon) => {
    setXacNhanAction({
      tieuDe: `Xóa món ăn: ${mon.ten_mon}`,
      phanLoai: 'QUẢN TRỊ THỰC ĐƠN (A12)',
      noiDung: `Bạn có chắc chắn muốn xóa vĩnh viễn món "${mon.ten_mon}" [${mon.ma_mon}] khỏi thực đơn nhà hàng?`,
      loaiHanhDong: 'nguyHiem',
      onXacNhan: async () => {
        try {
          await api.delete(`/api/thuc-don/${mon.id}`);
          setDanhSach(prev => prev.filter(m => m.id !== mon.id));
          showToast(`Đã xóa món "${mon.ten_mon}" khỏi thực đơn`);
        } catch (err) {
          showToast(`Lỗi khi xóa món: ${err.message}`, 'loi');
        }
      }
    });
  };

  // 7. Lưu tạo mới hoặc sửa món từ Modal
  const handleLuuMon = async (duLieu) => {
    if (monChinhSua) {
      // Cập nhật món
      const monCapNhat = await api.put(`/api/thuc-don/${monChinhSua.id}`, duLieu);
      setDanhSach(prev => prev.map(m => m.id === monChinhSua.id ? { ...m, ...monCapNhat } : m));
      showToast(`Đã cập nhật món "${duLieu.tenMon}" thành công!`);
    } else {
      // Tạo món mới
      const monMoi = await api.post('/api/thuc-don', duLieu);
      setDanhSach(prev => [monMoi, ...prev.filter(mon => mon.id !== monMoi.id)]);
      showToast(`Đã thêm món "${duLieu.tenMon}" vào thực đơn thành công!`);
    }
    setMonChinhSua(null);
    setHienThemMoi(false);
  };

  const handleTaoDanhMuc = async (e) => {
    e.preventDefault();
    const duLieu = Object.fromEntries(new FormData(e.currentTarget));
    setDangTaoDanhMuc(true);
    setLoiDanhMuc('');
    try {
      const danhMuc = await api.post('/api/thuc-don/danh-muc', duLieu);
      setDanhMucList(prev => [...prev, danhMuc]);
      setHienFormDanhMuc(false);
    } catch (loi) {
      setLoiDanhMuc(loi.message);
    } finally {
      setDangTaoDanhMuc(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast thông báo */}
      {thongBao && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold text-white ${
            thongBao.loai === 'loi' ? 'bg-[#a42c35] border-rose-600' : 'bg-[#226b4c] border-emerald-600'
          }`}>
            {thongBao.loai === 'loi' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{thongBao.noiDung}</span>
          </div>
        </div>
      )}

      {/* Header trang */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#272d29] tracking-tight">
              Quản trị thực đơn món ăn & số suất còn lại
            </h1>
            <button
              onClick={taiThucDon}
              className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors"
              title="Làm mới thực đơn từ máy chủ"
            >
              <RefreshCw size={16} className={dangTai ? 'animate-spin text-[#b64d2d]' : ''} />
            </button>
          </div>
          <p className="text-xs text-[#72776f] mt-1">
            Điều chỉnh giá, thiết lập số suất phục vụ trong ngày, tự động khóa đặt món khi hết suất (Figma A12, C02, K04)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm tên món hoặc mã SKU..."
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#b64d2d]"
            />
          </div>

          <button type="button" onClick={() => setHienFormDanhMuc(true)}
            className="py-2.5 px-4 bg-white border border-stone-200 rounded-xl font-bold text-xs">
            Tạo danh mục
          </button>
          <button
            onClick={() => setHienThemMoi(true)}
            disabled={!danhMucList.length}
            className="py-2.5 px-4 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Plus size={16} />
            <span>Thêm món mới (A13)</span>
          </button>
        </div>
      </div>

      {!danhMucList.length && <p className="text-sm text-stone-600">Hãy tạo danh mục trước khi thêm món.</p>}
      {hienFormDanhMuc && (
        <form onSubmit={handleTaoDanhMuc} className="flex flex-wrap items-end gap-3 p-4 bg-white border border-stone-200 rounded-xl">
          <label className="grid gap-1 text-xs font-bold">Mã danh mục
            <input name="maDanhMuc" required maxLength={20} placeholder="KHAI_VI" className="border border-stone-200 rounded-lg px-3 py-2" />
          </label>
          <label className="grid gap-1 text-xs font-bold">Tên danh mục
            <input name="tenDanhMuc" required maxLength={100} placeholder="Khai vị" className="border border-stone-200 rounded-lg px-3 py-2" />
          </label>
          <button type="submit" disabled={dangTaoDanhMuc} className="px-4 py-2 bg-[#b64d2d] text-white rounded-lg text-xs font-bold">Lưu danh mục</button>
          <button type="button" disabled={dangTaoDanhMuc} onClick={() => { setHienFormDanhMuc(false); setLoiDanhMuc(''); }}
            className="px-4 py-2 text-xs font-bold">Hủy</button>
          {loiDanhMuc && <p role="alert" className="basis-full text-sm text-rose-700">{loiDanhMuc}</p>}
        </form>
      )}
      {/* Bộ lọc danh mục */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setDanhMucChon('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            danhMucChon === 'all' ? 'bg-[#272d29] text-white shadow-xs' : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          Tất cả món ({danhSach.length})
        </button>
        {danhMucList.map(dm => {
          const soLuong = danhSach.filter(m => String(m.danh_muc_id) === String(dm.id)).length;
          return (
            <button
              key={dm.id}
              onClick={() => setDanhMucChon(String(dm.id))}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                String(danhMucChon) === String(dm.id) ? 'bg-[#272d29] text-white shadow-xs' : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              {dm.ten_danh_muc || dm.ten} ({soLuong})
            </button>
          );
        })}
      </div>

      {/* Bảng món ăn */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 border-b border-stone-200 font-bold text-[#72776f] uppercase">
            <tr>
              <th className="p-4">Hình ảnh</th>
              <th className="p-4">Mã SKU</th>
              <th className="p-4">Tên món ăn</th>
              <th className="p-4">Danh mục</th>
              <th className="p-4">Giá niêm yết</th>
              <th className="p-4">Số suất còn lại (Hôm nay)</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {monLoc.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-stone-400 font-medium">
                  {dangTai ? 'Đang tải thực đơn từ máy chủ...' : 'Không tìm thấy món ăn nào phù hợp'}
                </td>
              </tr>
            ) : (
              monLoc.map((mon) => {
                const conMon = mon.con_mon === 1;
                const soSuat = mon.so_suat_con_lai;

                return (
                  <tr key={mon.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-4">
                      {mon.anh_mon_an ? <img
                        src={mon.anh_mon_an}
                        alt={mon.ten_mon} 
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 bg-stone-100" 
                      /> : <span className="text-xs text-stone-500">Chưa có ảnh</span>}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#b64d2d]">{mon.ma_mon}</td>
                    <td className="p-4">
                      <p className="font-bold text-sm text-[#272d29]">{mon.ten_mon}</p>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{mon.mo_ta || 'Chưa có mô tả'}</p>
                    </td>
                    <td className="p-4 font-semibold text-stone-700">
                      {mon.ten_danh_muc || mon.danh_muc_ten || 'Món chính'}
                    </td>
                    <td className="p-4 font-extrabold text-sm text-[#b64d2d]">
                      {dinhDangTien(mon.don_gia || mon.gia)}
                    </td>

                    {/* CỘT QUAN TRỌNG: SỐ SUẤT CÒN LẠI */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {soSuat === null || soSuat === undefined ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600 border border-stone-200 inline-flex items-center gap-1">
                            <InfinityIcon size={12} />
                            <span>Không giới hạn</span>
                          </span>
                        ) : soSuat === 0 || !conMon ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                            <span>✕ Hết suất</span>
                          </span>
                        ) : soSuat <= 5 ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 inline-flex items-center gap-1 animate-pulse">
                            <AlertTriangle size={12} className="text-amber-600" />
                            <span>Sắp hết ({soSuat} suất)</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                            <span>Còn {soSuat} suất</span>
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setMonChinhSuat(mon);
                            setSoSuatMoi(soSuat !== null && soSuat !== undefined ? soSuat : '');
                          }}
                          className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-[#b64d2d] transition-colors"
                          title="Cài đặt lại số suất còn lại"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>

                    {/* TRẠNG THÁI BÁN */}
                    <td className="p-4">
                      <button
                        onClick={() => toggleConMon(mon)}
                        className="flex items-center gap-1.5 transition-colors"
                        title={conMon ? "Nhấn để tạm hết món" : "Nhấn để mở bán lại"}
                      >
                        {conMon && soSuat !== 0 ? (
                          <span className="text-[#226b4c] font-bold flex items-center gap-1">
                            <ToggleRight size={28} className="text-[#226b4c]" />
                            <span>Đang bán</span>
                          </span>
                        ) : (
                          <span className="text-[#a42c35] font-bold flex items-center gap-1">
                            <ToggleLeft size={28} className="text-stone-300" />
                            <span>Tạm ngưng</span>
                          </span>
                        )}
                      </button>
                    </td>

                    {/* THAO TÁC */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setMonChinhSua(mon)}
                          className="p-1.5 hover:bg-stone-100 rounded text-stone-600 hover:text-[#b64d2d]"
                          title="Chỉnh sửa thông tin món"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => yeuCauXoaMon(mon)}
                          className="p-1.5 hover:bg-stone-100 rounded text-stone-600 hover:text-[#a42c35]"
                          title="Xóa món khỏi thực đơn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal nhanh điều chỉnh số suất */}
      {monChinhSuat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold text-[#b64d2d] uppercase tracking-wider block">
                  CÀI ĐẶT SỐ SUẤT
                </span>
                <h4 className="font-bold text-sm text-[#272d29]">
                  {monChinhSuat.ten_mon}
                </h4>
              </div>
              <button 
                onClick={() => setMonChinhSuat(null)}
                className="p-1 hover:bg-stone-100 rounded-full text-stone-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nhập số suất còn lại trong ngày:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={soSuatMoi}
                    onChange={(e) => setSoSuatMoi(e.target.value)}
                    placeholder="Để trống = Không giới hạn"
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-[#b64d2d] focus:outline-none focus:border-[#b64d2d]"
                  />
                  <span className="font-semibold text-stone-600">suất</span>
                </div>
              </div>

              {/* Phím bấm nhanh */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSoSuatMoi(prev => Math.max(0, (parseInt(prev, 10) || 0) + 5))}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg font-bold text-stone-700"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => setSoSuatMoi(prev => Math.max(0, (parseInt(prev, 10) || 0) + 10))}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg font-bold text-stone-700"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => setSoSuatMoi(0)}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold"
                >
                  Báo hết (0 suất)
                </button>
                <button
                  type="button"
                  onClick={() => setSoSuatMoi('')}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold"
                >
                  ∞ Không giới hạn
                </button>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMonChinhSuat(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-600"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleLuuSoSuat(monChinhSuat.id, soSuatMoi === '' ? null : parseInt(soSuatMoi, 10))}
                  className="flex-1 py-2.5 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold shadow-sm"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal A13: Thêm hoặc Sửa món */}
      {(hienThemMoi || monChinhSua) && (
        <ModalThemSuaMon
          monCanSua={monChinhSua}
          danhMucList={danhMucList}
          onDong={() => { setHienThemMoi(false); setMonChinhSua(null); }}
          onLuu={handleLuuMon}
        />
      )}

      {/* Modal Xác nhận chuẩn Figma Quán Mộc */}
      {xacNhanAction && (
        <ModalXacNhan
          hienThi={true}
          tieuDe={xacNhanAction.tieuDe}
          phanLoai={xacNhanAction.phanLoai}
          noiDung={xacNhanAction.noiDung}
          loaiHanhDong={xacNhanAction.loaiHanhDong}
          onXacNhan={() => {
            xacNhanAction.onXacNhan();
            setXacNhanAction(null);
          }}
          onHuy={() => setXacNhanAction(null)}
        />
      )}
    </div>
  );
}
