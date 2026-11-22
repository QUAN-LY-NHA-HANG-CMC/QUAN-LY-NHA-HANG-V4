// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A06 · LỊCH PHÂN CA LÀM VIỆC TUẦN (1440x1000) - CHUẨN THIẾT KẾ FIGMA QUÁN MỘC
// KẾT NỐI 100% CSDL BACKEND SQLITE & QUẢN TRỊ CA LÀM THỜI GIAN THỰC
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Clock, Users, ChevronLeft, ChevronRight, Check, 
  Trash2, AlertCircle, RefreshCw, Eye, Sparkles, Filter 
  , X } from 'lucide-react';
import { api } from '../../dungChung/api';
import ModalThemCaLamViec from './ModalThemCaLamViec';
import ModalXacNhan from '../../thanhPhan/ModalXacNhan';

// Hàm lấy ngày Thứ 2 đầu tuần của 1 ngày bất kỳ
function layThuHaiDauTuan(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Thứ 2 là ngày bắt đầu tuần
  return new Date(date.setDate(diff));
}

// Định dạng YYYY-MM-DD
function dinhDangYYYYMMDD(d) {
  const nam = d.getFullYear();
  const thang = String(d.getMonth() + 1).padStart(2, '0');
  const ngay = String(d.getDate()).padStart(2, '0');
  return `${nam}-${thang}-${ngay}`;
}

export default function TrangLichPhanCaAdmin({ onChuyenSangDuyetNghi }) {
  // Quản lý mốc ngày đang xem (Thứ 2 của tuần)
  const [ngayDauTuan, setNgayDauTuan] = useState(() => layThuHaiDauTuan());
  
  // Dữ liệu từ Backend
  const [danhSachNhanVien, setDanhSachNhanVien] = useState([]);
  const [danhSachCa, setDanhSachCa] = useState([]);
  const [soYeuCauChoDuyet, setSoYeuCauChoDuyet] = useState(0);
  const [dangTai, setDangTai] = useState(false);
  const [thongBao, setThongBao] = useState(null);

  // Modals state
  const [modalThemCa, setModalThemCa] = useState(false);
  const [caThemMacDinh, setCaThemMacDinh] = useState({ nhanVienId: null, ngayLam: '' });
  const [caXoa, setCaXoa] = useState(null);

  // Sinh 7 ngày trong tuần từ Thứ 2 đến Chủ nhật
  const cacNgayTrongTuan = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ngayDauTuan);
    d.setDate(ngayDauTuan.getDate() + i);
    const tenThu = i === 6 ? 'Chủ nhật' : `Thứ ${i + 2}`;
    const ngayThang = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    const yyyymmdd = dinhDangYYYYMMDD(d);
    const laHomNay = yyyymmdd === dinhDangYYYYMMDD(new Date());
    return { tenThu, ngayThang, yyyymmdd, laHomNay };
  });

  const showToast = (noiDung, loai = 'thanhCong') => {
    setThongBao({ noiDung, loai });
    setTimeout(() => setThongBao(null), 4000);
  };

  // Tải dữ liệu nhân sự, lịch phân ca và yêu cầu đổi ca từ backend
  const taiDuLieu = async () => {
    setDangTai(true);
    try {
      // 1. Tải danh sách nhân sự
      const dsNv = await api.get('/api/tai-khoan/nhan-su');
      if (Array.isArray(dsNv)) {
        setDanhSachNhanVien(dsNv.filter(nv => nv.trang_thai !== 'da_nghi'));
      }

      // 2. Tải toàn bộ ca làm trong tuần
      const tuNgay = cacNgayTrongTuan[0].yyyymmdd;
      const denNgay = cacNgayTrongTuan[6].yyyymmdd;
      const dsCa = await api.get(`/api/ca-lam-viec/tat-ca-lich?tuNgay=${tuNgay}&denNgay=${denNgay}`);
      if (Array.isArray(dsCa)) {
        setDanhSachCa(dsCa);
      }

      // 3. Tải số lượng yêu cầu đổi ca đang chờ duyệt (A07)
      try {
        const dsYc = await api.get('/api/ca-lam-viec/yeu-cau-doi-ca?trangThai=cho_duyet');
        if (Array.isArray(dsYc)) {
          setSoYeuCauChoDuyet(dsYc.length);
        }
      } catch (e) {}
    } catch (err) {
      showToast('Lỗi tải dữ liệu lịch phân ca: ' + err.message, 'loi');
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
  }, [ngayDauTuan]);

  // Điều hướng tuần
  const chuyenTuanTruoc = () => {
    const d = new Date(ngayDauTuan);
    d.setDate(ngayDauTuan.getDate() - 7);
    setNgayDauTuan(d);
  };

  const chuyenTuanSau = () => {
    const d = new Date(ngayDauTuan);
    d.setDate(ngayDauTuan.getDate() + 7);
    setNgayDauTuan(d);
  };

  const veTuanHienTai = () => {
    setNgayDauTuan(layThuHaiDauTuan());
  };

  // Mở modal xếp ca khi click ô trống của nhân viên
  const handleBamOTrong = (nhanVienId, ngayLam) => {
    setCaThemMacDinh({ nhanVienId, ngayLam });
    setModalThemCa(true);
  };

  // Xóa ca làm việc
  const handleXacNhanXoaCa = async () => {
    if (!caXoa) return;
    try {
      await api.delete(`/api/ca-lam-viec/${caXoa.id}`);
      showToast(`Đã xóa ca ${caXoa.ten_ca} ngày ${caXoa.ngay_lam}!`);
      setCaXoa(null);
      taiDuLieu();
    } catch (err) {
      showToast('Lỗi khi xóa ca làm việc: ' + err.message, 'loi');
    }
  };

  // Định dạng nhãn ca làm việc
  const dinhDangCa = (ca) => {
    const mapTen = {
      ca_sang: 'Ca sáng',
      ca_chieu: 'Ca chiều',
      ca_toi: 'Ca tối',
      ca_gay: 'Ca gãy'
    };
    return mapTen[ca.ten_ca] || ca.ten_ca;
  };

  // Màu sắc thẻ ca
  const mauTheCa = {
    ca_sang: 'bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-400',
    ca_chieu: 'bg-sky-50 text-sky-900 border-sky-200 hover:border-sky-400',
    ca_toi: 'bg-[#2d4336] text-white border-[#2d4336] hover:bg-[#223329]',
    ca_gay: 'bg-purple-50 text-purple-900 border-purple-200 hover:border-purple-400'
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* TOAST THÔNG BÁO */}
      {thongBao && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold shadow-md transition-all ${
          thongBao.loai === 'thanhCong' 
            ? 'bg-[#ebf4ed] text-[#226b4c] border border-[#226b4c]/30' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{thongBao.noiDung}</span>
          <button onClick={() => setThongBao(null)} className="p-1 hover:opacity-70">
            <X size={14} />
          </button>
        </div>
      )}

      {/* HEADER QUẢN TRỊ LỊCH PHÂN CA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
              PHÂN HỆ QUẢN TRỊ (A06)
            </span>
            <span className="text-xs text-stone-500 font-medium">
              CSDL SQLite3 · Realtime
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#272d29] tracking-tight mt-1">
            Lịch phân ca làm việc tuần
          </h1>
          <p className="text-xs text-[#72776f] mt-0.5">
            Phân bổ ca sáng, ca tối, theo dõi ngày công và duyệt yêu cầu nghỉ đổi ca của toàn bộ nhân sự
          </p>
        </div>

        {/* NÚT THAO TÁC HEADER */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Nút điều hướng tuần */}
          <div className="flex items-center bg-white px-2 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-[#272d29] shadow-2xs">
            <button 
              onClick={chuyenTuanTruoc}
              className="p-1 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-800 transition-colors"
              title="Tuần trước"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={veTuanHienTai}
              className="px-2.5 py-0.5 hover:bg-stone-100 rounded-md text-stone-700"
              title="Về tuần hiện tại"
            >
              {cacNgayTrongTuan[0].ngayThang} – {cacNgayTrongTuan[6].ngayThang}
            </button>
            <button 
              onClick={chuyenTuanSau}
              className="p-1 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-800 transition-colors"
              title="Tuần sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Nút Xếp ca mới */}
          <button
            onClick={() => {
              setCaThemMacDinh({ nhanVienId: null, ngayLam: '' });
              setModalThemCa(true);
            }}
            className="py-2.5 px-4 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Phân ca mới</span>
          </button>

          {/* Nút chuyển sang Duyệt nghỉ & đổi ca (A07) */}
          <button
            onClick={onChuyenSangDuyetNghi}
            className="py-2.5 px-4 bg-[#f9ede6] hover:bg-[#f2ded3] text-[#b64d2d] rounded-xl font-bold text-xs border border-[#b64d2d]/20 transition-all flex items-center gap-1.5"
          >
            <span>Duyệt nghỉ & đổi ca (A07)</span>
            {soYeuCauChoDuyet > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#b64d2d] text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
                {soYeuCauChoDuyet}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* THANH CHÚ THÍCH CÁC KHUNG CA */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">CHÚ THÍCH CA:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Ca sáng (10:00 - 15:00)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span>Ca chiều (14:00 - 18:00)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2d4336] text-white font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Ca tối (17:00 - 22:30)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>Ca gãy / Cả ngày</span>
          </span>
        </div>

        <div className="text-stone-500 text-[11px] font-medium">
          💡 <em>Click vào ô trống để xếp ca nhanh cho nhân viên</em>
        </div>
      </div>

      {/* BẢNG MA TRẬN PHÂN CA TRỰC QUAN */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {dangTai ? (
          <div className="py-20 text-center text-stone-400">
            <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-[#b64d2d]" />
            <p className="text-xs font-semibold">Đang đồng bộ lịch phân ca từ CSDL SQLite...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[900px]">
              <thead className="bg-stone-50 border-b border-stone-200 font-bold text-[#72776f] uppercase">
                <tr>
                  <th className="p-4 w-56 sticky left-0 bg-stone-50 z-10 border-r border-stone-200">
                    Nhân viên ({danhSachNhanVien.length})
                  </th>
                  {cacNgayTrongTuan.map((ngay, idx) => (
                    <th 
                      key={idx} 
                      className={`p-3 text-center border-r border-stone-200 last:border-r-0 ${
                        ngay.laHomNay ? 'bg-orange-50/70 text-[#b64d2d]' : ''
                      }`}
                    >
                      <div className="font-extrabold">{ngay.tenThu}</div>
                      <div className="text-[11px] font-normal text-stone-500">{ngay.ngayThang}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {danhSachNhanVien.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-stone-400">
                      Chưa có nhân viên nào trong hệ thống.
                    </td>
                  </tr>
                ) : (
                  danhSachNhanVien.map((nv) => {
                    const maVaiTro = nv.ma_vai_tro || nv.vai_tro || 'phuc_vu';
                    const tenVaiTro = nv.ten_vai_tro || (maVaiTro === 'quan_ly' ? 'Quản lý' : maVaiTro === 'thu_ngan' ? 'Thu ngân' : maVaiTro === 'bep' ? 'Đầu bếp' : 'Phục vụ');

                    return (
                      <tr key={nv.id} className="hover:bg-stone-50/60 transition-colors">
                        {/* Cột 1: Thông tin nhân sự cố định */}
                        <td className="p-3.5 sticky left-0 bg-white z-10 border-r border-stone-200">
                          <div className="font-bold text-[#272d29] text-xs">
                            {nv.ho_ten}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-semibold text-stone-500">
                              {tenVaiTro}
                            </span>
                            <span className="text-stone-300">·</span>
                            <span className="text-[10px] font-mono text-[#b64d2d]">
                              NV-{String(nv.id).padStart(3, '0')}
                            </span>
                          </div>
                        </td>

                        {/* 7 cột: 7 ngày trong tuần */}
                        {cacNgayTrongTuan.map((ngay, nIdx) => {
                          // Lọc các ca làm của nhân viên này trong ngày cụ thể
                          const caTrongNgay = danhSachCa.filter(
                            c => c.nhan_vien_id === nv.id && c.ngay_lam === ngay.yyyymmdd && c.trang_thai !== 'da_huy'
                          );

                          return (
                            <td 
                              key={nIdx} 
                              className={`p-2 align-top text-center border-r border-stone-100 last:border-r-0 min-w-[105px] ${
                                ngay.laHomNay ? 'bg-orange-50/20' : ''
                              }`}
                            >
                              {caTrongNgay.length > 0 ? (
                                <div className="space-y-1.5">
                                  {caTrongNgay.map(ca => (
                                    <div
                                      key={ca.id}
                                      className={`group relative rounded-xl p-2 text-left border shadow-2xs transition-all cursor-pointer ${
                                        mauTheCa[ca.ten_ca] || 'bg-stone-100 border-stone-200'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-extrabold text-[11px] block">
                                          {dinhDangCa(ca)}
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCaXoa(ca);
                                          }}
                                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-black/10 rounded transition-opacity text-stone-400 hover:text-rose-600"
                                          title="Xóa ca làm việc này"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                      <div className="text-[10px] font-mono opacity-80 mt-0.5 flex items-center gap-1">
                                        <Clock size={10} />
                                        <span>{ca.gio_bat_dau}–{ca.gio_ket_thuc}</span>
                                      </div>
                                      {ca.ghi_chu && (
                                        <div className="text-[9px] opacity-75 truncate mt-1">
                                          {ca.ghi_chu}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                /* Ô trống: Cho phép click để thêm ca nhanh */
                                <button
                                  onClick={() => handleBamOTrong(nv.id, ngay.yyyymmdd)}
                                  className="w-full h-16 rounded-xl border border-dashed border-stone-200 hover:border-[#b64d2d] hover:bg-orange-50/50 flex flex-col items-center justify-center text-stone-300 hover:text-[#b64d2d] transition-all group"
                                  title={`Phân ca ngày ${ngay.ngayThang} cho ${nv.ho_ten}`}
                                >
                                  <Plus size={16} className="group-hover:scale-110 transition-transform" />
                                  <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    Thêm ca
                                  </span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL THÊM CA LÀM VIỆC MỚI */}
      {modalThemCa && (
        <ModalThemCaLamViec
          danhSachNhanVien={danhSachNhanVien}
          nhanVienMacDinhId={caThemMacDinh.nhanVienId}
          ngayMacDinh={caThemMacDinh.ngayLam}
          onDong={() => setModalThemCa(false)}
          onThanhCong={(caMoi) => {
            showToast(`Đã xếp ca thành công cho nhân viên!`);
            taiDuLieu();
          }}
        />
      )}

      {/* MODAL XÁC NHẬN XÓA CA */}
      {caXoa && (
        <ModalXacNhan
          hienThi={!!caXoa}
          tieuDe="Xóa ca làm việc"
          phanLoai="QUẢN TRỊ CA LÀM"
          noiDung={`Bạn có chắc chắn muốn xóa ca "${dinhDangCa(caXoa)}" ngày ${caXoa.ngay_lam} của nhân viên ${caXoa.ten_nhan_vien || ''}?`}
          canhBaoPhu="Ca làm việc này sẽ được loại bỏ khỏi lịch tuần của nhân viên."
          loai="nguyHiem"
          nhanNutXacNhan="Xóa ca"
          onDong={() => setCaXoa(null)}
          onXacNhan={handleXacNhanXoaCa}
        />
      )}
    </div>
  );
}
