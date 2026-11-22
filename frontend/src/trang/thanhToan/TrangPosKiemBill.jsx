// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// P01 · POS KIỂM BILL VÀ SƠ ĐỒ THANH TOÁN (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  Banknote,
  QrCode,
  Percent,
  Printer,
  Sparkles,
  Users,
  Split,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import SidebarThuNgan from '../../thanhPhan/SidebarThuNgan';
import ModalGiamGiaChietKhau from './ModalGiamGiaChietKhau';
import ModalThanhToanTienMat from './ModalThanhToanTienMat';
import ModalThanhToanVietQrPos from './ModalThanhToanVietQrPos';
import ModalChiaDeuHoaDon from './ModalChiaDeuHoaDon';
import ModalInHoaDonK80 from './ModalInHoaDonK80';
import ModalHoanTatDonBan from './ModalHoanTatDonBan';
import ThongBaoChiDao from '../../thanhPhan/ThongBaoChiDao';
import TrangLichSuHoaDonPos from './TrangLichSuHoaDonPos';
import ModalChuyenBan from '../soDoBan/ModalChuyenBan';
import ModalGopBan from '../soDoBan/ModalGopBan';
import { api } from '../../dungChung/api';
import { dinhDangTien } from '../../dungChung/dinhDang';
import { laySocket } from '../../dungChung/ketNoiSocket';

export default function TrangPosKiemBill({ nhanVien, onDangXuat, onMoCaLamViec }) {
  const [tabSidebar, setTabSidebar] = useState('soDoHoaDon');
  const [khuVucChon, setKhuVucChon] = useState('');
  const [banDangChon, setBanDangChon] = useState(null);

  // Modal states
  const [hienGiamGia, setHienGiamGia] = useState(false);
  const [hienTienMat, setHienTienMat] = useState(false);
  const [hienVietQr, setHienVietQr] = useState(false);
  const [hienChiaDeu, setHienChiaDeu] = useState(false);
  const [hienInK80, setHienInK80] = useState(false);
  const [hienDonBan, setHienDonBan] = useState(false);
  const [thaoTacBan, setThaoTacBan] = useState('');
  const [soKhachMoBan, setSoKhachMoBan] = useState(2);

  const [danhSachBan, setDanhSachBan] = useState([]);
  const [bill, setBill] = useState(null);
  const [hoaDon, setHoaDon] = useState(null);
  const [banDaThuTien, setBanDaThuTien] = useState(null);
  const [phanTram, setPhanTram] = useState(0);
  const [loi, setLoi] = useState('');
  const [dangLuu, setDangLuu] = useState(false);
  const khoa = useRef(false);
  const banId = banDangChon?.id;
  const banHienTai = danhSachBan.find(ban => ban.id === banId);
  const dangCoPhien = Boolean(banHienTai && !['trong', 'can_don_dep'].includes(banHienTai.trang_thai));

  useEffect(() => {
    let huy = false;
    const socket = laySocket();
    const taiBan = async () => {
      try {
        const data = await api.get('/api/ban-an');
        if (huy) return;
        const banAn = data.banAn.map(ban => ({ ...ban, khu_vuc: ban.ten_khu_vuc, so_khach: ban.so_luong_khach, tam_tinh: ban.tong_tien_tam_tinh }));
        setDanhSachBan(banAn);
        setKhuVucChon(khu => khu || banAn[0]?.khu_vuc || '');
      } catch (err) {
        if (!huy) setLoi(err.message);
      }
    };
    const suKien = ['trang_thai_ban', 'thanh_toan_thanh_cong', 'connect'];
    taiBan();
    suKien.forEach(ten => socket.on(ten, taiBan));
    return () => {
      huy = true;
      suKien.forEach(ten => socket.off(ten, taiBan));
    };
  }, []);

  useEffect(() => {
    if (!dangCoPhien) return;
    let phienTai = 0;
    const socket = laySocket();
    const taiBill = async () => {
      const lanTai = ++phienTai;
      try {
        const data = await api.get(`/api/hoa-don/tam-tinh/${banId}?chietKhau=${phanTram}`);
        if (lanTai === phienTai) setBill({ ...data, phanTram });
      } catch (err) {
        if (lanTai === phienTai) {
          setBill(null);
          setLoi(err.message);
        }
      }
    };
    const doiTrangThaiBan = duLieu => {
      if (Number(duLieu?.banId) !== banId) return;
      if (['trong', 'can_don_dep'].includes(duLieu.trangThai)) {
        phienTai++;
        setBill(null);
        return;
      }
      taiBill();
    };
    const suKien = ['tien_do_mon_an', 'ban:cap_nhat_cong_viec', 'connect'];
    taiBill();
    suKien.forEach(ten => socket.on(ten, taiBill));
    socket.on('trang_thai_ban', doiTrangThaiBan);
    const henGio = setInterval(taiBill, 15000);
    return () => {
      phienTai++;
      clearInterval(henGio);
      suKien.forEach(ten => socket.off(ten, taiBill));
      socket.off('trang_thai_ban', doiTrangThaiBan);
    };
  }, [banId, dangCoPhien, phanTram]);

  const billHienTai = dangCoPhien && bill?.banId === banId && bill.phanTram === phanTram ? bill : null;
  const banLoc = danhSachBan.filter(b => b.khu_vuc === khuVucChon);
  const lyDoChanThu = billHienTai?.lyDoChanThu;
  const choPhepThu = Boolean(billHienTai?.danhSachMon.length) && !lyDoChanThu && !dangLuu;
  const luu = async (thaoTac) => {
    if (khoa.current) return;
    khoa.current = true;
    setDangLuu(true);
    setLoi('');
    try {
      await thaoTac();
    } catch (err) {
      setLoi(err.message);
    } finally {
      khoa.current = false;
      setDangLuu(false);
    }
  };

  const moThanhToan = phuongThuc => luu(async () => {
    const hd = await api.post('/api/hoa-don/tao-hoa-don', {
      banId, phanTramChietKhau: phanTram, phuongThuc
    });
    setBanDaThuTien(null);
    setHoaDon(hd);
    if (phuongThuc === 'vietqr') setHienVietQr(true);
    else setHienTienMat(true);
  });

  const xacNhanThanhToan = (phuongThucThanhToan, tienKhachDua) => luu(async () => {
    const ketQua = await api.post(`/api/hoa-don/${hoaDon.id}/thanh-toan`, { phuongThucThanhToan, tienKhachDua });
    if (ketQua?.trangThai !== 'da_thanh_toan' || ketQua.hoaDonId !== hoaDon.id) {
      throw new Error('Chưa nhận được xác nhận thanh toán cho hóa đơn này.');
    }
    const daThu = await api.get(`/api/hoa-don/${hoaDon.id}`).catch(() => ({
      ...hoaDon,
      trang_thai: ketQua.trangThai,
      phuong_thuc_thanh_toan: ketQua.phuongThucThanhToan
    }));
    setBanDaThuTien(banDangChon);
    setHoaDon(daThu);
    setHienVietQr(false);
    setHienTienMat(false);
    setHienInK80(true);
  });

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
    yeu_cau_thanh_toan: 'Yêu cầu tính tiền',
    can_don_dep: 'Cần dọn dẹp'
  };

  const tongTienGoc = billHienTai?.tongTienMon ?? 0;
  const tienGiamGia = billHienTai?.tienChietKhau ?? 0;
  const tongPhaiThu = billHienTai?.tongTienThanhToan ?? 0;

  return (
    <div className="flex h-screen bg-[#f8f7f2] font-sans overflow-hidden">
      {/* Sidebar Thu ngân POS */}
      <SidebarThuNgan
        nhanVien={nhanVien}
        tabHienTai={tabSidebar}
        onChuyenTab={setTabSidebar}
        onDangXuat={onDangXuat}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <button type="button" onClick={onMoCaLamViec} className="self-end m-3 rounded-lg border px-3 py-2 text-xs font-bold">Ca làm của tôi</button>
        {tabSidebar === 'lichSuHoaDon' ? (
          <div className="flex-1 overflow-y-auto">
            <TrangLichSuHoaDonPos onXemChiTietIn={hd => luu(async () => {
              const billDaThu = await api.get(`/api/hoa-don/${hd.id}`);
              setHoaDon(billDaThu);
              setBanDaThuTien({ id: billDaThu.ban_an_id, ten_ban: billDaThu.ten_ban });
              setHienInK80(true);
            })} />
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Cột trái: Sơ đồ bàn theo tầng */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto border-r border-stone-200">
              {/* Header sơ đồ */}
              <div className="flex justify-between items-center pb-4 border-b border-stone-200 mb-4">
                <div>
                  <h1 className="text-xl font-black text-[#272d29] tracking-tight">
                    Sơ đồ bàn & kiểm bill
                  </h1>
                  <p className="text-xs text-[#72776f] mt-0.5">
                    Kiểm tra món và số tiền trước khi xác nhận thanh toán
                  </p>
                </div>

                {/* Khu vực Tabs */}
                <div className="flex items-center gap-1.5 bg-stone-200/60 p-1 rounded-xl text-xs font-semibold">
                  {[...new Set(danhSachBan.map(ban => ban.khu_vuc))].map(kv => (
                    <button
                      key={kv}
                      onClick={() => setKhuVucChon(kv)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        khuVucChon === kv ? 'bg-white text-[#272d29] shadow-xs font-bold' : 'text-stone-600'
                      }`}
                    >
                      {kv}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lưới các bàn ăn */}
              <div className="grid grid-cols-3 gap-3">
                {banLoc.map((b) => {
                  const chon = banDangChon?.ma_ban === b.ma_ban;
                  const badgeClass = mauTrangThai[b.trang_thai] || 'bg-stone-100 text-stone-600';
                  return (
                    <div
                      key={b.ma_ban}
                      onClick={() => { setBanDangChon(b); setBill(null); setPhanTram(0); setLoi(''); }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between h-32 ${
                        chon
                          ? 'bg-white border-2 border-[#b64d2d] shadow-md ring-2 ring-[#b64d2d]/10'
                          : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-black text-2xl text-[#272d29] leading-none">{b.ten_ban}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                          {tenTrangThai[b.trang_thai] || b.trang_thai}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-stone-500">
                          <span>{b.so_cho} chỗ</span>
                          {b.so_khach > 0 && <span>{b.so_khach} khách</span>}
                        </div>
                        {b.tam_tinh > 0 && (
                          <div className="font-bold text-xs text-[#b64d2d]">
                            {dinhDangTien(b.tam_tinh)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cột phải: Khung kiểm tra bill và hành động thanh toán */}
            <div className="w-96 bg-white flex flex-col h-screen border-l border-stone-200 shrink-0">
              {/* Header bill */}
              <div className="p-5 border-b border-stone-200 bg-stone-50">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider block">
                      HÓA ĐƠN CHI TIẾT
                    </span>
                    <h2 className="text-xl font-black text-[#272d29]">
                      {banDangChon?.ten_ban || 'Chọn bàn'}
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {banHienTai?.khu_vuc} {banHienTai?.so_khach ? `· ${banHienTai.so_khach} khách` : ''}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-stone-600 bg-stone-200 px-2 py-1 rounded">
                    {banHienTai && tenTrangThai[banHienTai.trang_thai]}
                  </span>
                </div>
              </div>

              {/* Danh sách món trong bill */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3 text-xs">
                {loi && <p role="alert" className="text-red-700">{loi}</p>}
                {lyDoChanThu && lyDoChanThu !== loi && <p role="status" className="rounded-lg bg-amber-50 p-2 text-amber-900">{lyDoChanThu}</p>}
                {(billHienTai?.danhSachMon ?? []).map((item) => (
                  <div key={`${item.mon_an_id}-${item.don_gia}`} className="flex justify-between items-start pb-2 border-b border-stone-100">
                    <div>
                      <h4 className="font-bold text-[#272d29]">{item.ten_mon}</h4>
                      <p className="text-[11px] text-stone-500">
                        {item.tong_so_luong} × {dinhDangTien(item.don_gia)}
                      </p>
                      {item.ghi_chu && (
                        <p className="text-[10px] text-amber-700 italic">{item.ghi_chu}</p>
                      )}
                    </div>
                    <span className="font-bold text-[#272d29]">
                      {dinhDangTien(item.tong_thanh_tien)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Khối tính tiền */}
              <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Tiền món</span>
                  <span className="font-semibold">{dinhDangTien(tongTienGoc)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>VAT {billHienTai?.phanTramVat ?? 0}%</span>
                  <span className="font-semibold">{dinhDangTien(billHienTai?.tienVat ?? 0)}</span>
                </div>
                {tienGiamGia > 0 && (
                  <div className="flex justify-between text-[#a42c35] font-bold">
                    <span>Chiết khấu giảm giá:</span>
                    <span>-{dinhDangTien(tienGiamGia)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-300 flex justify-between items-baseline font-black text-base text-[#272d29]">
                  <span>TỔNG THANH TOÁN:</span>
                  <span className="text-xl text-[#b64d2d]">{dinhDangTien(tongPhaiThu)}</span>
                </div>
              </div>

              {/* Nhóm nút thanh toán & nghiệp vụ hóa đơn */}
              <div className="p-4 bg-white border-t border-stone-200 space-y-2">
                {/* 2 nút thanh toán chính */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={!choPhepThu || !billHienTai?.vietQr}
                    onClick={() => moThanhToan('vietqr')}
                    className="py-3 px-3 bg-[#2d4336] hover:bg-[#202e28] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <QrCode size={16} />
                    <span>VietQR (P04)</span>
                  </button>

                  <button
                    disabled={!choPhepThu}
                    onClick={() => moThanhToan('tien_mat')}
                    className="py-3 px-3 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Banknote size={16} />
                    <span>Tiền mặt (P03)</span>
                  </button>
                </div>

                {/* Các nút nghiệp vụ phụ */}
                <div className="grid grid-cols-4 gap-1 text-[11px] font-bold text-stone-700">
                  <button
                    disabled={!choPhepThu}
                    onClick={() => setHienGiamGia(true)}
                    className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-center"
                    title="Giảm giá"
                  >
                    Giảm giá (P02)
                  </button>

                  <button
                    disabled={!choPhepThu}
                    onClick={() => setHienChiaDeu(true)}
                    className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-center"
                    title="Chia đều"
                  >
                    Chia đều (P06)
                  </button>
                  <button
                    disabled={!banDaThuTien || banDaThuTien.id !== banId || !hoaDon}
                    onClick={() => setHienInK80(true)}
                    className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-center"
                    title="In bill"
                  >
                    In K80 (P07)
                  </button>
                </div>

                {banHienTai && (
                  <div className="flex gap-2 text-xs">
                    {banHienTai.trang_thai === 'trong' && (
                      <button className="rounded-lg border px-3 py-2" onClick={() => setThaoTacBan('mo')}>Mở bàn</button>
                    )}
                    {dangCoPhien && (
                      <>
                        <button className="rounded-lg border px-3 py-2" onClick={() => setThaoTacBan('chuyen')}>Chuyển bàn</button>
                        <button className="rounded-lg border px-3 py-2" onClick={() => setThaoTacBan('gop')}>Gộp bàn</button>
                      </>
                    )}
                  </div>
                )}

                {/* Nút hoàn tất & dọn bàn */}
                <button
                  disabled={banHienTai?.trang_thai !== 'can_don_dep'}
                  onClick={() => setHienDonBan(true)}
                  className="w-full py-2.5 bg-stone-100 hover:bg-[#ebf4ed] text-stone-600 hover:text-[#226b4c] border border-stone-200 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Xác nhận bàn đã dọn</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {thaoTacBan === 'mo' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <form className="rounded-xl bg-white p-5 space-y-3" onSubmit={e => {
            e.preventDefault();
            luu(async () => {
              await api.post(`/api/ban-an/${banId}/mo-ban`, { soKhach: Number(soKhachMoBan) });
              setThaoTacBan('');
            });
          }}>
            <h2 className="font-bold">Mở {banHienTai.ten_ban}</h2>
            <label className="block">Số khách
              <input required type="number" min="1" max="100" value={soKhachMoBan}
                onChange={e => setSoKhachMoBan(e.target.value)} className="block rounded border px-3 py-2" />
            </label>
            {loi && <p role="alert" className="text-red-700">{loi}</p>}
            <button disabled={dangLuu} className="rounded-lg bg-[#2d4336] text-white px-3 py-2">Mở bàn</button>
            <button type="button" onClick={() => setThaoTacBan('')} className="px-3 py-2">Đóng</button>
          </form>
        </div>
      )}
      {thaoTacBan === 'chuyen' && (
        <ModalChuyenBan banHienTai={banHienTai} danhSachBan={danhSachBan} onDong={() => setThaoTacBan('')}
          onXacNhanChuyen={({ banDich, lyDo }) => luu(async () => {
            const dich = danhSachBan.find(ban => ban.ma_ban === banDich);
            await api.post('/api/ban-an/chuyen-ban', { banNguonId: banId, banDichId: dich.id, lyDo });
            setBanDangChon(dich);
            setKhuVucChon(dich.khu_vuc);
            setThaoTacBan('');
          })} />
      )}
      {thaoTacBan === 'gop' && (
        <ModalGopBan banHienTai={banHienTai} danhSachBan={danhSachBan} onDong={() => setThaoTacBan('')}
          onXacNhanGop={({ banPhu }) => luu(async () => {
            const nguon = danhSachBan.find(ban => ban.ma_ban === banPhu);
            await api.post('/api/ban-an/gop-ban', { banNguonId: nguon.id, banDichId: banId });
            setThaoTacBan('');
          })} />
      )}
      {loi && ['gop', 'chuyen'].includes(thaoTacBan) &&
        <p role="alert" className="fixed z-[60] top-4 right-4 bg-rose-100 text-rose-900 p-3 rounded">{loi}</p>}

      {/* Modal P02 Giảm giá */}
      {hienGiamGia && (
        <ModalGiamGiaChietKhau
          tongTienGoc={tongTienGoc}
          onDong={() => setHienGiamGia(false)}
          onApDung={(kq) => {
            setPhanTram(Math.max(0, Math.min(100, kq.soTienGiam * 100 / tongTienGoc)));
            setHienGiamGia(false);
          }}
        />
      )}

      {/* Modal P03 Tiền mặt */}
      {hienTienMat && (
        <ModalThanhToanTienMat
          tongTien={hoaDon.tong_tien_thanh_toan}
          dangLuu={dangLuu}
          chanThu={Boolean(lyDoChanThu)}
          loi={lyDoChanThu || loi}
          onDong={() => !dangLuu && setHienTienMat(false)}
          onXacNhanThanhToan={({ tienKhachDua }) => xacNhanThanhToan('tien_mat', tienKhachDua)}
        />
      )}

      {/* Modal P04 VietQR */}
      {hienVietQr && (
        <ModalThanhToanVietQrPos
          ban={banDangChon}
          tongTien={hoaDon.tong_tien_thanh_toan}
          vietQr={lyDoChanThu ? null : hoaDon.vietQr}
          dangLuu={dangLuu}
          loi={lyDoChanThu || loi}
          onDong={() => !dangLuu && setHienVietQr(false)}
          onXacNhanThanhToan={() => xacNhanThanhToan('vietqr')}
        />
      )}

      {/* Modal P06 Chia đều */}
      {hienChiaDeu && (
        <ModalChiaDeuHoaDon
          tongTien={tongPhaiThu}
          loi={loi}
          dangLuu={dangLuu}
          onDong={() => setHienChiaDeu(false)}
          onXacNhanChia={(info) => {
            luu(async () => {
              const hd = await api.post('/api/hoa-don/tao-hoa-don', { banId, phanTramChietKhau: phanTram });
              await api.post(`/api/hoa-don/${hd.id}/chia-tien`, { soNguoiChia: info.soNguoi });
              setHienChiaDeu(false);
            });
          }}
        />
      )}

      {/* Modal P07 In K80 */}
      {hienInK80 && (
        <ModalInHoaDonK80
          ban={banDaThuTien}
          hoaDon={hoaDon}
          onDong={() => setHienInK80(false)}
        />
      )}

      {/* Modal P08 Hoàn tất & dọn bàn */}
      {hienDonBan && (
        <ModalHoanTatDonBan
          ban={banDangChon}
          onDong={() => setHienDonBan(false)}
          onXacNhanDonBan={() => luu(async () => {
            await api.put(`/api/ban-an/${banId}/trang-thai`, { trangThai: 'trong' });
            setHienDonBan(false);
          })}
        />
      )}

      {/* Modal Chỉ đạo Điều phối từ Quản lý tới Thu ngân (Realtime Socket.io) */}
      <ThongBaoChiDao boPhan="thu_ngan" />
    </div>
  );
}
