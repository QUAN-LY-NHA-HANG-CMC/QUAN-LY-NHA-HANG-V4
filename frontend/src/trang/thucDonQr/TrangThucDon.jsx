// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// C02 · THỰC ĐƠN (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import HeaderKhach from '../../thanhPhan/HeaderKhach';
import DieuHuongDuoiKhach from '../../thanhPhan/DieuHuongDuoiKhach';
import ModalChiTietMon from './ModalChiTietMon';
import { dinhDangTien } from '../../dungChung/dinhDang';
import { api } from '../../dungChung/api';
import { ketNoiSocket } from '../../dungChung/ketNoiSocket';

export default function TrangThucDon({
  ban = { ma_ban: 'B08', ten_ban: 'Bàn 08' },
  danhSachMon: danhSachMonTruyenVao,
  gioHang = [],
  onThemVaoGio,
  onXemGioHang,
  onChuyenTab,
  onGoiHoTro
}) {
  const [tuKhoa, setTuKhoa] = useState('');
  const [danhMucChon, setDanhMucChon] = useState('all');
  const [monDangXem, setMonDangXem] = useState(null);
  const [danhSachMonApi, setDanhSachMonApi] = useState(danhSachMonTruyenVao || null);
  const [loi, setLoi] = useState('');
  const [danhMucApi, setDanhMucApi] = useState(null);

  // Tự động nạp dữ liệu món ăn từ Backend API & lắng nghe Socket
  useEffect(() => {
    if (danhSachMonTruyenVao) return;
    api.get('/api/thuc-don')
      .then(res => {
        if (res) {
          const rawList = Array.isArray(res.tatCaMon) ? res.tatCaMon : (Array.isArray(res.monAn) ? res.monAn : (Array.isArray(res) ? res : []));
          if (rawList.length > 0) {
            setDanhSachMonApi(rawList.map(m => ({
              ...m,
              gia: m.don_gia,
              hinh_anh: m.anh_mon_an || null,
              danh_muc_ten: m.ten_danh_muc || m.danh_muc_ten || 'Món chính'
            })));
          }
          if (Array.isArray(res.danhMuc) && res.danhMuc.length > 0) {
            setDanhMucApi([
              { id: 'all', ten: 'Tất cả' },
              ...res.danhMuc.map(dm => ({ id: dm.id, ten: dm.ten_danh_muc || dm.ten }))
            ]);
          }
        }
      })
      .catch(err => {
        setLoi(err.message);
      });

    // Lắng nghe cập nhật số suất & còn món từ Socket.io theo thời gian thực
    try {
      const socket = ketNoiSocket();
      const capNhatSuat = (data) => {
        setDanhSachMonApi(prev => {
          if (!prev) return prev;
          return prev.map(m => m.id === data.monId ? { ...m, so_suat_con_lai: data.soSuatConLai, con_mon: data.conMon } : m);
        });
      };
      socket.on('thuc_don:cap_nhat_so_suat', capNhatSuat);
      socket.on('thuc_don:cap_nhat_con_mon', capNhatSuat);
      return () => {
        socket.off('thuc_don:cap_nhat_so_suat', capNhatSuat);
        socket.off('thuc_don:cap_nhat_con_mon', capNhatSuat);
      };
    } catch (e) {}
  }, [danhSachMonTruyenVao]);

  const danhSachMon = danhSachMonApi ?? [];
  const danhMucHienThi = danhMucApi ?? [];

  // Lọc danh sách món ăn theo từ khóa và danh mục
  const monHienThi = useMemo(() => {
    return danhSachMon.filter(m => {
      const khopTuKhoa = !tuKhoa || m.ten_mon.toLowerCase().includes(tuKhoa.toLowerCase());
      const khopDanhMuc = danhMucChon === 'all' || m.danh_muc_id === danhMucChon;
      return khopTuKhoa && khopDanhMuc;
    });
  }, [danhSachMon, tuKhoa, danhMucChon]);

  const comboGoiY = danhSachMon.find(mon => mon.la_combo && mon.con_mon);
  const moMon = async (mon) => {
    setMonDangXem(mon);
    if (!mon.la_combo) return;
    try {
      const data = await api.get(`/api/thuc-don/${mon.id}`);
      setMonDangXem(hienTai => hienTai?.id === mon.id
        ? { ...hienTai, danhSachMonCon: data.danhSachMonCon }
        : hienTai);
    } catch (err) {
      setLoi(err.message);
    }
  };

  // Tính tổng số lượng và số tiền trong giỏ hàng
  const tongSoLuongGio = gioHang.reduce((tong, item) => tong + item.so_luong, 0);
  const tongTienGio = gioHang.reduce((tong, item) => tong + (item.gia * item.so_luong), 0);

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#f9f7f2] flex flex-col justify-between pb-28 shadow-xl border-x border-[#272d29]/5">
      {/* Header chuẩn Figma */}
      <HeaderKhach
        tieuDe="Thực đơn"
        ban={ban}
        onMoThongBao={onGoiHoTro}
      />

      {/* Nội dung chính cuộn dọc */}
      <main className="px-5 py-3 space-y-4 flex-1">
        {/* Ô tìm kiếm món */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72776f]" />
          <input
            type="text"
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm món, đồ uống, combo…"
            className="w-full bg-white border border-[#272d29]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#272d29] placeholder-[#72776f] focus:outline-none focus:ring-2 focus:ring-[#b64d2d]/20 focus:border-[#b64d2d] transition-all"
          />
        </div>

        {/* Thanh trượt danh mục món */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {danhMucHienThi.map((dm) => {
            const active = danhMucChon === dm.id;
            return (
              <button
                key={dm.id}
                onClick={() => setDanhMucChon(dm.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#272d29] text-white shadow-xs'
                    : 'bg-white text-[#72776f] border border-stone-200 hover:border-stone-300'
                }`}
              >
                {dm.ten}
              </button>
            );
          })}
        </div>

        {loi && <p role="alert" className="text-red-700">{loi}</p>}
        {comboGoiY && danhMucChon === 'all' && !tuKhoa && (
          <button onClick={() => moMon(comboGoiY)}
            className="w-full bg-[#2d4336] text-white rounded-2xl p-4 text-left">
            <span className="text-[11px] text-emerald-200 block">Combo gợi ý</span>
            <span className="font-bold block">{comboGoiY.ten_mon}</span>
            <span className="text-sm">{dinhDangTien(comboGoiY.gia)}</span>
          </button>
        )}
        {/* Tiêu đề mục món */}
        <div className="pt-1">
          <h2 className="text-base font-bold text-[#272d29]">
            {danhMucChon === 'all' ? 'Món ngon được yêu thích' : 'Danh sách món'}
          </h2>
        </div>

        {/* Danh sách thẻ món ăn */}
        <div className="space-y-3">
          {monHienThi.map((mon) => {
            const hetMon = mon.con_mon === 0 || mon.so_suat_con_lai === 0;
            const coSuat = mon.so_suat_con_lai !== null && mon.so_suat_con_lai !== undefined;

            return (
              <div
                key={mon.id}
                onClick={() => moMon(mon)}
                className={`bg-white rounded-xl p-3 border shadow-xs flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] ${
                  hetMon 
                    ? 'opacity-60 border-stone-200 bg-stone-50/60' 
                    : 'border-[#272d29]/10 hover:border-[#b64d2d]/30'
                }`}
              >
                {/* Hình ảnh */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60">
                  {mon.hinh_anh ? <img
                    src={mon.hinh_anh}
                    alt={mon.ten_mon}
                    className="w-full h-full object-cover"
                  /> : <span className="grid place-items-center h-full text-[10px] text-stone-500">Chưa có ảnh</span>}
                  {hetMon && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-1">
                      <span className="text-[10px] font-extrabold text-white text-center leading-tight">HẾT MÓN</span>
                    </div>
                  )}
                </div>

                {/* Thông tin món */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-sm text-[#272d29] truncate">
                      {mon.ten_mon}
                    </h3>
                    {coSuat && !hetMon && mon.so_suat_con_lai <= 5 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                        Chỉ còn {mon.so_suat_con_lai}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#72776f] mt-0.5 truncate">
                    {mon.nhan || `${mon.danh_muc_ten} · Bếp nóng`}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-bold text-sm text-[#b64d2d]">
                      {dinhDangTien(mon.gia)}
                    </span>
                    {coSuat && !hetMon && mon.so_suat_con_lai > 5 && (
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Còn {mon.so_suat_con_lai} suất
                      </span>
                    )}
                  </div>
                </div>

                {/* Nút thêm nhanh */}
                <button
                  type="button"
                  disabled={hetMon}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hetMon) return;
                    onThemVaoGio({
                      ...mon,
                      so_luong: 1,
                      ghi_chu: '',
                      thanh_tien: mon.gia
                    });
                  }}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0 shadow-xs ${
                    hetMon
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-[#f9ede6] hover:bg-[#b64d2d] text-[#b64d2d] hover:text-white'
                  }`}
                  title={hetMon ? "Món đã hết suất" : "Thêm món vào giỏ"}
                >
                  <Plus size={18} className="stroke-[2.5]" />
                </button>
              </div>
            );
          })}

          {monHienThi.length === 0 && (
            <div className="text-center py-12 px-4 text-stone-400 bg-white rounded-xl border border-dashed border-stone-200">
              <p className="text-sm font-semibold text-stone-600 mb-1">
                {danhSachMon.length === 0 ? 'Thực đơn hiện đang trống' : 'Không tìm thấy món ăn phù hợp'}
              </p>
              <p className="text-xs text-stone-400">
                {danhSachMon.length === 0 ? 'Hệ thống chưa nạp món hoặc CSDL vừa được làm sạch. Quản trị viên có thể nạp dữ liệu mẫu trong phần Cài đặt.' : 'Hãy thử tìm kiếm với tên món khác hoặc chuyển danh mục.'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Nút Xem giỏ hàng nổi phía trên Bottom Nav (khi có món trong giỏ) */}
      {tongSoLuongGio > 0 && (
        <div className="fixed bottom-16 left-0 right-0 max-w-[430px] mx-auto px-5 z-40">
          <button
            onClick={onXemGioHang}
            className="w-full py-3.5 px-5 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-sm flex items-center justify-between shadow-xl transition-all active:scale-[0.99] border border-white/20"
          >
            <span className="flex items-center gap-2">
              <span>Xem giỏ hàng</span>
              <span className="w-1 h-1 rounded-full bg-white/60"></span>
              <span>{tongSoLuongGio} món</span>
            </span>
            <span>{dinhDangTien(tongTienGio)}</span>
          </button>
        </div>
      )}

      {/* Điều hướng cuối */}
      <DieuHuongDuoiKhach
        tabHienTai="thucDon"
        onChuyenTab={onChuyenTab}
        soLuongMonDangCho={tongSoLuongGio}
      />

      {/* Modal chi tiết món (C03) */}
      {monDangXem && (
        <ModalChiTietMon
          mon={monDangXem}
          onDong={() => setMonDangXem(null)}
          onThemVaoGio={onThemVaoGio}
        />
      )}
    </div>
  );
}
