// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// W06 · CHI TIẾT BÀN (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, Plus, ArrowRight, Merge, Trash2, Receipt, PhoneCall, Zap, CheckCircle2, AlertTriangle, Bell } from 'lucide-react';
import HeaderNhanVien from '../../thanhPhan/HeaderNhanVien';
import XacNhanThietBiBan from './XacNhanThietBiBan';
import ModalDatMonHoKhach from './ModalDatMonHoKhach';
import ModalChuyenBan from './ModalChuyenBan';
import ModalGopBan from './ModalGopBan';
import ModalYeuCauHuyMon from './ModalYeuCauHuyMon';
import ModalGiucMonPhucVu from './ModalGiucMonPhucVu';
import ThongBaoChiDao from '../../thanhPhan/ThongBaoChiDao';
import { NHAN_VIEC_BAN, tiepNhanViecBan } from '../../dungChung/viecBan';
import { hienThiGioVietNam } from '../../dungChung/thoiGian';
import ModalTrungTamThongBao from './ModalTrungTamThongBao';
import { dinhDangTien, tinhPhutTroiQua } from '../../dungChung/dinhDang';
import { api } from '../../dungChung/api';
import { laySocket } from '../../dungChung/ketNoiSocket';

export default function TrangChiTietBan({
  ban = { ma_ban: 'B08', ten_ban: 'Bàn 08', khu_vuc: 'Tầng 1', so_cho: 4, so_khach: 4, thoi_gian_vao: '19:08' },
  nhanVien = { hoTen: 'Lê Văn Minh', ca: 'Ca tối' },
  onQuayLai,
  onBaoThanhToan
}) {
  const [hienDatMon, setHienDatMon] = useState(false);
  const [hienChuyenBan, setHienChuyenBan] = useState(false);
  const [hienGopBan, setHienGopBan] = useState(false);
  const [hienHuyMon, setHienHuyMon] = useState(false);
  const [hienGiucMon, setHienGiucMon] = useState(false);
  const [monCanGiuc, setMonCanGiuc] = useState(null);
  const [hienThongBao, setHienThongBao] = useState(false);
  const [thongBaoGiucMon, setThongBaoGiucMon] = useState(null);
  const [phanHoiBep, setPhanHoiBep] = useState(null);

  // Lắng nghe phản hồi từ Bếp KDS qua Socket.io
  useEffect(() => {
    const socket = laySocket();
    if (!socket) return;

    socket.emit('tham_gia_vai_tro', 'phuc_vu');

    const handlePhanHoiBep = (data) => {
      setPhanHoiBep(data);
    };

    socket.on('phuc_vu:nhan_phan_hoi_giuc_mon', handlePhanHoiBep);
    return () => {
      socket.off('phuc_vu:nhan_phan_hoi_giuc_mon', handlePhanHoiBep);
    };
  }, []);

  const [chiTiet, setChiTiet] = useState([]);
  const [viecBan, setViecBan] = useState([]);
  const [danhSachBan, setDanhSachBan] = useState([]);
  const [loi, setLoi] = useState('');
  const [dangLuu, setDangLuu] = useState(false);
  const [lanTai, setLanTai] = useState(0);
  useEffect(() => {
    let huy = false;
    const socket = laySocket();
    const tai = async () => {
      try {
        const [don, banAn, viec] = await Promise.all([
          api.get(`/api/don-goi-mon/ban/${ban.id}`),
          api.get('/api/ban-an'),
          api.get('/api/ban-an/viec-ban?banId=' + ban.id)
        ]);
        if (huy) return;
        setViecBan(viec);
        setChiTiet(don.danhSachMon.map(mon => ({
          ...mon, id: mon.chi_tiet_id, trang_thai: mon.trang_thai_mon,
          thanh_tien: mon.so_luong * mon.don_gia
        })));
        setDanhSachBan(banAn.banAn.map(item => ({
          ...item, khu_vuc: item.ten_khu_vuc, so_khach: item.so_luong_khach, tam_tinh: item.tong_tien_tam_tinh
        })));
      } catch (err) {
        if (!huy) setLoi(err.message);
      }
    };
    const suKien = ['connect', 'trang_thai_ban', 'ban:cap_nhat_cong_viec'];
    tai();
    suKien.forEach(ten => socket.on(ten, tai));
    return () => {
      huy = true;
      suKien.forEach(ten => socket.off(ten, tai));
    };
  }, [ban.id, lanTai]);

  const luu = async (thaoTac, sauKhiLuu) => {
    if (dangLuu) return;
    setDangLuu(true);
    setLoi('');
    try {
      await thaoTac();
      sauKhiLuu();
      setLanTai(lan => lan + 1);
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangLuu(false);
    }
  };

  const tongTien = chiTiet.filter(mon => !['da_huy', 'huy_mon'].includes(mon.trang_thai))
    .reduce((tong, mon) => tong + mon.thanh_tien, 0);
  const monChoBep = chiTiet.filter(mon => mon.trang_thai_don === 'da_duyet' && ['cho_duyet', 'dang_nau'].includes(mon.trang_thai));
  const yeuCauHuyCuaKhach = chiTiet.filter(mon => mon.trang_thai_huy_khach === 'cho_phuc_vu');
  const xuLyYeuCauHuy = (mon, chapNhan) => luu(() => api.put(
    `/api/don-goi-mon/ban/${ban.id}/yeu-cau-huy-khach/${mon.id_yeu_cau_huy_khach}`, { chapNhan }
  ), () => {});

  const mauTrangThaiMon = {
    cho_duyet: 'bg-amber-100 text-amber-800',
    dang_nau: 'bg-orange-100 text-[#b64d2d]',
    hoan_thanh: 'bg-emerald-100 text-emerald-800',
    da_phuc_vu: 'bg-stone-100 text-stone-600'
  };

  const tenTrangThaiMon = {
    cho_duyet: 'Chờ duyệt',
    dang_nau: 'Đang nấu',
    hoan_thanh: 'Nấu xong',
    da_phuc_vu: 'Đã lên bàn',
    da_huy: 'Đã hủy',
    huy_mon: 'Đã hủy',
    yeu_cau_huy: 'Chờ duyệt hủy'
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#f9f7f2] flex flex-col justify-between pb-8 shadow-xl border-x border-[#272d29]/5">
      {loi && <p role="alert" className="fixed z-[60] bg-rose-100 text-red-800 p-3">{loi}</p>}
      <HeaderNhanVien
        tieuDe={`Chi tiết ${ban.ten_ban || 'Bàn 08'}`}
        nhanVien={nhanVien}
        onQuayLai={onQuayLai}
        onChuyenTab={(tab) => {
          if (tab === 'thongBao') setHienThongBao(true);
        }}
      />

      <main className="px-4 py-3 space-y-3.5 flex-1">
        <XacNhanThietBiBan key={ban.id} banId={ban.id} trangThaiBan={ban.trang_thai} />
        {yeuCauHuyCuaKhach.length > 0 && (
          <section className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
            <h2 className="font-bold">Khách yêu cầu hủy món</h2>
            {yeuCauHuyCuaKhach.map(mon => (
              <div key={mon.id_yeu_cau_huy_khach} className="space-y-1 border-t border-amber-200 pt-2">
                <p className="font-semibold">{mon.ten_mon} × {mon.so_luong}</p>
                <p className="break-words">{mon.ly_do_huy_khach}</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={dangLuu} onClick={() => xuLyYeuCauHuy(mon, true)}
                    className="rounded bg-[#226b4c] px-2 py-1 text-white">
                    {mon.trang_thai === 'cho_duyet' ? 'Chấp nhận hủy' : 'Chuyển quản lý'}
                  </button>
                  <button type="button" disabled={dangLuu} onClick={() => xuLyYeuCauHuy(mon, false)}
                    className="rounded border border-stone-400 px-2 py-1">Từ chối yêu cầu</button>
                </div>
              </div>
            ))}
          </section>
        )}
        {viecBan.length > 0 && <section className="rounded-xl border border-stone-200 bg-white p-3 text-sm">
          <h2 className="font-bold">Công việc của bàn</h2>
          {viecBan.map(viec => {
            const cuaToi = viec.nguoi_nhan_id === Number(nhanVien.nhanVienId);
            const hoanTat = viec.loai === 'ho_tro'
              ? () => api.put('/api/ban-an/ho-tro/' + viec.doi_tuong_id + '/xong')
              : viec.loai === 'don_ban' ? () => api.put('/api/ban-an/' + ban.id + '/trang-thai', { trangThai: 'trong' }) : null;
            return <div key={viec.loai + '-' + viec.doi_tuong_id} className="mt-2 border-t pt-2">
              <strong>{NHAN_VIEC_BAN[viec.loai]}</strong><p>{viec.noi_dung}</p>
              <p>{viec.dangXuLy ? 'Đã nhận: ' + viec.nguoi_nhan : viec.tenPhuTrach ? 'Phụ trách: ' + viec.tenPhuTrach : 'Hàng chờ chung'}</p>
              {!viec.dangXuLy && !cuaToi && <button type="button" disabled={dangLuu}
                className="mt-1 font-bold text-[#b64d2d]" onClick={() => luu(() => tiepNhanViecBan(viec), () => {})}>Tiếp nhận</button>}
              {cuaToi && hoanTat && <button type="button" disabled={dangLuu}
                className="mt-1 font-bold text-emerald-700" onClick={() => luu(hoanTat, () => {})}>Đã xử lý</button>}
              {cuaToi && viec.loai === 'duyet_qr' && <button type="button" className="mt-1 font-bold text-[#b64d2d]"
                onClick={onQuayLai}>Mở thông báo bàn để duyệt</button>}
            </div>;
          })}
        </section>}
        {/* Banner phản hồi giục món từ Bếp KDS */}
        {phanHoiBep && (
          <div className={`p-3.5 rounded-2xl border flex items-start gap-3 animate-bounce shadow-md ${
            phanHoiBep.chapNhan ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            {phanHoiBep.chapNhan ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <span className="font-bold block uppercase tracking-wider text-[10px]">
                {phanHoiBep.chapNhan ? '🍳 Bếp đã tiếp nhận ưu tiên' : '⚠️ Bếp phản hồi'}
              </span>
              <p className="mt-0.5 font-medium">
                {phanHoiBep.thoiGian} ({phanHoiBep.tenMon || 'Món đang giục'})
              </p>
            </div>
            <button onClick={() => setPhanHoiBep(null)} className="text-stone-400 hover:text-stone-600 font-bold text-xs p-1">
              ✕
            </button>
          </div>
        )}

        {/* Thông báo đã phát lệnh giục món */}
        {thongBaoGiucMon && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <span>⚡ Đã gửi đề nghị giục món <b>{thongBaoGiucMon.tenMon}</b> tới Bếp KDS</span>
            <button onClick={() => setThongBaoGiucMon(null)} className="text-amber-800 text-xs font-bold">✕</button>
          </div>
        )}

        {/* Banner tổng quan bàn */}
        <div className="bg-white rounded-2xl p-4 border border-[#272d29]/10 shadow-xs">
          <div className="flex justify-between items-start pb-3 border-b border-stone-100">
            <div>
              <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider">
                {ban.khu_vuc || 'TẦNG 1'}
              </span>
              <h2 className="text-xl font-bold text-[#272d29]">
                {ban.ten_ban || 'Bàn 08'}
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#226b4c] bg-[#ebf4ed] px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#226b4c]"></span>
              Đang phục vụ
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 text-center text-xs">
            <div className="bg-stone-50 p-2 rounded-xl">
              <span className="text-[#72776f] block text-[11px]">Số khách</span>
              <span className="font-bold text-[#272d29]">{ban.so_khach || 4} khách</span>
            </div>
            <div className="bg-stone-50 p-2 rounded-xl">
              <span className="text-[#72776f] block text-[11px]">Giờ vào</span>
              <span className="font-bold text-[#272d29]">{hienThiGioVietNam(ban.thoi_gian_bat_dau)}</span>
            </div>
            <div className="bg-stone-50 p-2 rounded-xl">
              <span className="text-[#72776f] block text-[11px]">Thời gian ngồi</span>
              <span className="font-bold text-[#2d4336]">{ban.thoi_gian_bat_dau
                ? `${tinhPhutTroiQua(ban.thoi_gian_bat_dau)} phút`
                : '—'}</span>
            </div>
          </div>
        </div>

        {/* Danh sách món ăn của bàn */}
        <div className="bg-white rounded-2xl p-4 border border-[#272d29]/10 shadow-xs">
          <div className="flex justify-between items-center pb-2.5 border-b border-stone-100">
            <span className="text-xs font-bold text-[#272d29]">Danh sách món ăn ({chiTiet.length})</span>
            <span className="text-xs font-bold text-[#b64d2d]">{dinhDangTien(tongTien)}</span>
          </div>

          <div className="divide-y divide-stone-100 py-1">
            {chiTiet.map((item) => (
              <div key={item.id} className="py-2.5 flex items-start justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-[#272d29]">
                    {item.ten_mon} <span className="text-[#b64d2d]">× {item.so_luong}</span>
                  </h4>
                  {item.ghi_chu && (
                    <p className="text-[11px] text-[#795c21] italic mt-0.5">
                      Ghi chú: {item.ghi_chu}
                    </p>
                  )}
                  {item.ly_do_quan_ly_tu_choi_huy && (
                    <p className="mt-1 break-words text-xs text-rose-800">
                      <strong>Quản lý từ chối hủy:</strong> {item.ly_do_quan_ly_tu_choi_huy}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <span className="font-bold text-[#272d29] block">
                    {dinhDangTien(item.thanh_tien || (item.don_gia * item.so_luong))}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {item.trang_thai === 'dang_nau' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMonCanGiuc(item);
                          setHienGiucMon(true);
                        }}
                        className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors flex items-center gap-1"
                        title="Giục bếp ưu tiên món này"
                      >
                        <Zap size={10} className="fill-amber-600 text-amber-600" />
                        <span>Giục bếp</span>
                      </button>
                    )}
                    {item.xu_ly_pos && <span className="text-xs text-amber-800">
                      {item.xu_ly_pos === 'goi_mang_ve' ? 'Gói mang về' : 'Khách không lấy món'}
                    </span>}
                    {item.trang_thai === 'hoan_thanh' && !item.xu_ly_pos && (
                      <button disabled={dangLuu}
                        className="px-2 py-0.5 text-emerald-800 font-semibold"
                        onClick={() => luu(async () => {
                          const viec = viecBan.find(muc => muc.loai === 'bung_mon' && muc.doi_tuong_id === item.id);
                          if (viec) await tiepNhanViecBan(viec);
                          await api.put(`/api/dieu-phoi-bep/chi-tiet/${item.id}/trang-thai`, { trangThaiMoi: 'da_phuc_vu' });
                        }, () => {})}>Xác nhận đã bưng món</button>
                    )}
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${mauTrangThaiMon[item.trang_thai] || 'bg-stone-100 text-stone-600'}`}>
                      {item.trang_thai === 'cho_duyet' && item.trang_thai_don === 'da_duyet'
                        ? 'Chờ nấu' : tenTrangThaiMon[item.trang_thai] || item.trang_thai}
                    </span>
                    {item.thoi_gian_phuc_vu && <small>{hienThiGioVietNam(item.thoi_gian_phuc_vu)}</small>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nhóm nút thao tác nghiệp vụ phục vụ */}
        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setHienDatMon(true)}
            className="p-3 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-[#272d29] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus size={15} className="text-[#b64d2d]" />
            <span>Đặt món hộ (W07)</span>
          </button>

          <button
            onClick={() => setHienChuyenBan(true)}
            className="p-3 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-[#272d29] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <ArrowRight size={15} className="text-[#2d4336]" />
            <span>Chuyển bàn (W08)</span>
          </button>

          <button
            onClick={() => setHienGopBan(true)}
            className="p-3 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-[#272d29] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Merge size={15} className="text-blue-600" />
            <span>Gộp bàn (W09)</span>
          </button>

          <button
            onClick={() => setHienHuyMon(true)}
            className="p-3 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-[#a42c35] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Trash2 size={15} />
            <span>Hủy món (W10)</span>
          </button>

          {/* Nút giục bếp cho toàn bàn */}
          {monChoBep.length > 0 && <button
            onClick={() => {
              setMonCanGiuc(null);
              setHienGiucMon(true);
            }}
            className="col-span-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300/80 rounded-xl text-amber-950 flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
          >
            <Zap size={16} className="fill-amber-600 text-amber-600" />
            <span className="font-black text-xs">Giục món bàn này (Gửi đề nghị ưu tiên tới Bếp)</span>
          </button>}
        </div>

        {/* Nút báo thanh toán */}
        <button
          onClick={onBaoThanhToan}
          className="w-full py-3.5 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Receipt size={16} />
          <span>Báo thanh toán / In tạm tính</span>
        </button>
      </main>

      {/* Modal W07 */}
      {hienDatMon && (
        <ModalDatMonHoKhach
          ban={ban}
          onDong={() => setHienDatMon(false)}
          onXacNhanDatMon={monMoi => luu(() => api.post('/api/don-goi-mon', {
            banId: ban.id, nguonTao: 'phuc_vu_dat_ho',
            danhSachMon: monMoi.map(mon => ({ monAnId: mon.id, soLuong: mon.so_luong, ghiChu: mon.ghi_chu }))
          }), () => setHienDatMon(false))}
        />
      )}

      {/* Modal W08 */}
      {hienChuyenBan && (
        <ModalChuyenBan
          banHienTai={{ ...ban, tam_tinh: tongTien }}
          danhSachBan={danhSachBan}
          onDong={() => setHienChuyenBan(false)}
          onXacNhanChuyen={info => luu(() => api.post('/api/ban-an/chuyen-ban', {
            banNguonId: ban.id, banDichId: danhSachBan.find(item => item.ma_ban === info.banDich)?.id, lyDo: info.lyDo
          }), onQuayLai)}
        />
      )}

      {/* Modal W09 */}
      {hienGopBan && (
        <ModalGopBan
          banHienTai={{ ...ban, tam_tinh: tongTien }}
          danhSachBan={danhSachBan}
          onDong={() => setHienGopBan(false)}
          onXacNhanGop={info => luu(() => api.post('/api/ban-an/gop-ban', {
            banNguonId: danhSachBan.find(item => item.ma_ban === info.banPhu)?.id, banDichId: ban.id
          }), () => setHienGopBan(false))}
        />
      )}

      {/* Modal W10 */}
      {hienHuyMon && (
        <ModalYeuCauHuyMon
          ban={ban}
          danhSachMon={chiTiet.filter(mon => !['da_huy', 'huy_mon', 'yeu_cau_huy'].includes(mon.trang_thai))}
          onDong={() => setHienHuyMon(false)}
          onGuiYeuCauHuy={req => luu(() => api.post('/api/don-goi-mon/huy-mon', {
            chiTietDonMonId: req.monId, lyDoHuy: [req.lyDo, req.ghiChu].filter(Boolean).join(' — ')
          }), () => setHienHuyMon(false))}
        />
      )}

      {/* Modal Giục món & Đề nghị ưu tiên tới Bếp */}
      {hienGiucMon && monChoBep.length > 0 && (
        <ModalGiucMonPhucVu
          ban={ban}
          danhSachMon={monChoBep}
          monMacDinh={monCanGiuc}
          nhanVien={nhanVien}
          onDong={() => {
            setHienGiucMon(false);
            setMonCanGiuc(null);
          }}
          onGuiThanhCong={(info) => {
            setThongBaoGiucMon(info);
          }}
        />
      )}

      <ThongBaoChiDao boPhan="phuc_vu" />
      {/* Modal Trung tâm thông báo khi bấm quả chuông */}
      {hienThongBao && (
        <ModalTrungTamThongBao
          onDong={() => setHienThongBao(false)}
          onMoDuyetDon={() => setHienThongBao(false)}
        />
      )}
    </div>
  );
}
