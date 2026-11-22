// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// W02 · SƠ ĐỒ BÀN (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Users, Clock, AlertCircle, RefreshCw, QrCode } from 'lucide-react';
import HeaderNhanVien from '../../thanhPhan/HeaderNhanVien';
import ModalTrungTamThongBao from './ModalTrungTamThongBao';
import ModalDuyetDonQr from './ModalDuyetDonQr';
import ModalTuChoiDonQr from './ModalTuChoiDonQr';
import ThongBaoChiDao from '../../thanhPhan/ThongBaoChiDao';
import { NHAN_VIEC_BAN, tiepNhanViecBan } from '../../dungChung/viecBan';
import { NHAN_TRANG_THAI_BAN } from '../../dungChung/hangSo';
import { dinhDangTien } from '../../dungChung/dinhDang';
import { api } from '../../dungChung/api';
import { laySocket } from '../../dungChung/ketNoiSocket';

export default function TrangSoDoBan({
  nhanVien: nhanVienProp,
  danhSachBan: danhSachBanTruyenVao,
  onChonBan,
  onChuyenTab,
  onDangXuat
}) {
  const nguoiDungLuu = api.layNguoiDung();
  const nhanVien = nhanVienProp || (nguoiDungLuu ? {
    hoTen: nguoiDungLuu.hoTen || nguoiDungLuu.ho_ten || nguoiDungLuu.tenDangNhap || 'Lê Văn Minh',
    ca: nguoiDungLuu.ca || 'Ca tối'
  } : {
    hoTen: 'Lê Văn Minh',
    ca: 'Ca tối'
  });

  const [khuVucChon, setKhuVucChon] = useState('');
  const [hienThongBao, setHienThongBao] = useState(false);
  const [hienDuyetQr, setHienDuyetQr] = useState(false);
  const [hienTuChoiQr, setHienTuChoiQr] = useState(false);
  const [viecBan, setViecBan] = useState([]);
  const [donChon, setDonChon] = useState(null);
  const [loi, setLoi] = useState('');
  const [dangLuu, setDangLuu] = useState(false);
  const [danhSachBanApi, setDanhSachBanApi] = useState(danhSachBanTruyenVao || null);

  const napDanhSachBan = async () => {
    try {
      const [data, viec] = await Promise.all([api.get('/api/ban-an'), api.get('/api/ban-an/viec-ban')]);
      setViecBan(viec);
      const banAn = data.banAn.map(ban => ({
        ...ban, khu_vuc: ban.ten_khu_vuc, so_cho: ban.suc_chua, so_khach: ban.so_luong_khach,
        tam_tinh: ban.tong_tien_tam_tinh
      }));
      setDanhSachBanApi(banAn);
      setKhuVucChon(hienTai => hienTai || banAn[0]?.khu_vuc || '');
    } catch (err) {
      setLoi(err.message);
    }
  };

  useEffect(() => {
    const socket = laySocket();
    const suKien = ['connect', 'trang_thai_ban', 'ban:cap_nhat_cong_viec'];
    suKien.forEach(ten => socket.on(ten, napDanhSachBan));
    napDanhSachBan();
    const lich = setInterval(napDanhSachBan, 15000);
    return () => {
      clearInterval(lich);
      suKien.forEach(ten => socket.off(ten, napDanhSachBan));
    };
  }, []);

  const moDon = async (don) => {
    try {
      const data = await api.get(`/api/don-goi-mon/ban/${don.ban_an_id}`);
      const chiTiet = data.danhSachMon.filter(mon => mon.don_goi_mon_id === don.id && mon.trang_thai_mon !== 'da_huy')
        .map(mon => ({ ...mon, id: mon.chi_tiet_id, thanh_tien: mon.so_luong * mon.don_gia }));
      setDonChon({ ...don, chi_tiet: chiTiet, thoi_gian: don.thoi_gian_gui, tong_tien_mon: chiTiet.reduce((tong, mon) => tong + mon.thanh_tien, 0) });
      setHienThongBao(false);
      setHienDuyetQr(true);
    } catch (err) {
      setLoi(err.message);
    }
  };

  const xuLyDon = async (thaoTac, lyDoTuChoi) => {
    if (dangLuu) return;
    setDangLuu(true);
    setLoi('');
    try {
      await api.put(`/api/don-goi-mon/${donChon.id}/${thaoTac}`, { lyDoTuChoi });
      setHienDuyetQr(false);
      setHienTuChoiQr(false);
      await napDanhSachBan();
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangLuu(false);
    }
  };

  const soThongBao = viecBan.length;
  const danhSachBan = danhSachBanApi ?? [];
  const banHienThi = danhSachBan.filter(ban => ban.khu_vuc === khuVucChon);

  const tongSoBan = banHienThi.length;
  const soBanCoKhach = banHienThi.filter(b => b.trang_thai !== 'trong').length;

  const mauTrangThai = {
    trong: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    co_khach: 'bg-blue-50 text-blue-700 border-blue-200',
    cho_mon: 'bg-amber-50 text-amber-700 border-amber-200',
    yeu_cau_thanh_toan: 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse',
    can_don_dep: 'bg-stone-100 text-stone-600 border-stone-300'
  };

  const tenTrangThai = {
    trong: 'Trống',
    co_khach: 'Có khách',
    cho_mon: 'Chờ món',
    yeu_cau_thanh_toan: 'Thanh toán',
    can_don_dep: 'Cần dọn dẹp'
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#f9f7f2] flex flex-col justify-between pb-8 shadow-xl border-x border-[#272d29]/5">
      {/* Header chuẩn Figma */}
      {loi && <p role="alert" className="fixed z-[60] bg-rose-100 text-red-800 p-3">{loi}</p>}
      <HeaderNhanVien
        tieuDe="Sơ đồ bàn"
        nhanVien={nhanVien}
        tabHienTai="soDoBan"
        onChuyenTab={(tab) => {
          if (tab === 'thongBao') {
            setHienThongBao(true);
          } else if (onChuyenTab) {
            onChuyenTab(tab);
          }
        }}
        soThongBaoChuaXuLy={soThongBao}
        onDangXuat={onDangXuat}
      />

      <main className="px-4 py-3 space-y-3.5 flex-1">
        {/* Banner chào và thông tin ca */}
        <div className="bg-white rounded-2xl p-4 border border-[#272d29]/10 shadow-xs flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#272d29]">
              Xin chào, {nhanVien.hoTen?.split(' ').pop() || nhanVien.hoTen || 'Minh'} · {nhanVien.ca || 'Ca tối'}
            </h2>
            <p className="text-xs text-[#72776f] mt-0.5">
              Nhân viên: <span className="font-semibold text-[#272d29]">{nhanVien.hoTen}</span> · {khuVucChon}
            </p>
          </div>

          <button
            onClick={() => setHienThongBao(true)}
            className="px-3 py-1.5 bg-[#f9ede6] hover:bg-[#b64d2d] text-[#b64d2d] hover:text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            Thông báo bàn ({soThongBao})
          </button>
        </div>

        {/* Bộ chọn khu vực */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[...new Set(danhSachBan.map(ban => ban.khu_vuc))].map((kv) => (
              <button
                key={kv}
                onClick={() => setKhuVucChon(kv)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  khuVucChon === kv
                    ? 'bg-[#272d29] text-white shadow-xs'
                    : 'bg-white text-[#72776f] border border-stone-200 hover:border-stone-300'
                }`}
              >
                {kv}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-semibold text-[#72776f]">
            {tongSoBan} bàn · {soBanCoKhach} có khách
          </span>
        </div>

        {/* Lưới các bàn ăn */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {banHienThi.map((ban) => {
            const badgeClass = mauTrangThai[ban.trang_thai] || 'bg-stone-100 text-stone-600 border-stone-200';
            const label = tenTrangThai[ban.trang_thai] || ban.trang_thai;
            const maSo = ban.ma_ban.replace(/^[A-Za-z\-]+/, '');

            return (
              <div
                key={ban.ma_ban}
                onClick={() => onChonBan(ban)}
                className="bg-white rounded-2xl p-4 border border-[#272d29]/10 shadow-xs cursor-pointer hover:border-[#b64d2d]/40 transition-all active:scale-[0.98] flex flex-col justify-between h-32"
              >
                {/* Dòng mã bàn và trạng thái */}
                <div className="flex items-start justify-between">
                  <span className="font-extrabold text-2xl text-[#272d29] leading-none">
                    {maSo || ban.ma_ban}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    {label}
                  </span>
                </div>

                {/* Thông tin bàn và số tiền */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#72776f]">
                    <span>{ban.so_cho} chỗ</span>
                    {ban.so_khach > 0 && <span>{ban.so_khach} khách</span>}
                  </div>

                  {ban.so_huy_mon_khach > 0 && <p className="text-xs font-bold text-rose-700">{ban.so_huy_mon_khach} yêu cầu hủy món</p>}
                  {ban.tam_tinh > 0 && (
                    <div className="font-bold text-xs text-[#b64d2d] truncate">
                      {dinhDangTien(ban.tam_tinh)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal W03 Trung tâm thông báo */}
      {hienThongBao && (
        <ModalTrungTamThongBao
          onDong={() => setHienThongBao(false)}
          danhSachThongBao={viecBan.map(viec => ({
            id: viec.loai + '-' + viec.doi_tuong_id,
            tieuDe: viec.ten_ban + ' · ' + NHAN_VIEC_BAN[viec.loai],
            moTa: viec.noi_dung + ' · ' + (viec.dangXuLy ? 'Đã nhận: ' + viec.nguoi_nhan :
              viec.tenPhuTrach ? 'Phụ trách: ' + viec.tenPhuTrach : 'Hàng chờ chung'),
            icon: QrCode, mauIcon: 'bg-amber-100',
            action: viec.dangXuLy ? 'Mở công việc' : 'Tiếp nhận',
            onAction: async () => {
              try {
                if (!viec.dangXuLy) await tiepNhanViecBan(viec);
                if (viec.loai === 'duyet_qr') {
                  await moDon({ id: viec.doi_tuong_id, ban_an_id: viec.ban_id, ten_ban: viec.ten_ban,
                    ma_don: viec.noi_dung, thoi_gian_gui: viec.ngay_tao });
                } else {
                  const ban = danhSachBanApi?.find(muc => muc.id === viec.ban_id);
                  if (ban) onChonBan(ban);
                }
              } catch (err) { setLoi(err.message); await napDanhSachBan(); }
            }
          }))}
        />
      )}

      {/* Modal W04 Duyệt đơn QR */}
      {hienDuyetQr && (
        <ModalDuyetDonQr
          onDong={() => setHienDuyetQr(false)}
          donMon={donChon}
          onDuyetThanhCong={() => xuLyDon('duyet')}
          onTuChoi={() => {
            setHienDuyetQr(false);
            setHienTuChoiQr(true);
          }}
        />
      )}

      {/* Modal W05 Từ chối đơn QR */}
      {hienTuChoiQr && (
        <ModalTuChoiDonQr
          onDong={() => setHienTuChoiQr(false)}
          onXacNhanTuChoi={({ lyDo, ghiChu }) => xuLyDon('tu-choi', [lyDo, ghiChu].filter(Boolean).join(' — '))}
        />
      )}

      {/* Modal Lệnh Điều phối từ Quản lý tới Phục vụ (Realtime Socket.io) */}
      <ThongBaoChiDao boPhan="phuc_vu" />
    </div>
  );
}
