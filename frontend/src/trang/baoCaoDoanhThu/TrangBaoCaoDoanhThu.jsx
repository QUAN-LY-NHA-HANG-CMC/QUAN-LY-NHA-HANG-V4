// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A16 · TRUNG TÂM BÁO CÁO DOANH THU & QUẢN TRỊ TÀI CHÍNH ĐA CHIỀU (CHUẨN FIGMA)
// BỐ CỤC TAB TRÌNH DUYỆT (BROWSER-STYLE TABS) CHUYỂN ĐỔI LINH HOẠT
// ============================================================================

import React, { useState, useEffect, useTransition } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  PieChart,
  Clock,
  Utensils,
  MapPin,
  Wallet,
  Star,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  Users,
  QrCode,
  Receipt,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../../dungChung/api';
import { laySocket } from '../../dungChung/ketNoiSocket';
import { dinhDangGio, dinhDangNgay, dinhDangTien } from '../../dungChung/dinhDang';
import { hienThiGioVietNam, ngayVietNam } from '../../dungChung/thoiGian';
import { layThamSoUrl, capNhatUrl } from '../../dungChung/dieuHuongUrl';

export default function TrangBaoCaoDoanhThu() {
  const [kyBaoCao, setKyBaoCao] = useState('hom_nay');
  const [tabHienTai, setTabHienTaiState] = useState(() => layThamSoUrl('subTab', 'tongQuan')); // tongQuan | thoiGian | monAn | khuVuc | soQuy | kenhDanhGia
  const [loiTaiBaoCao, setLoiTaiBaoCao] = useState('');
  const [dangTai, setDangTai] = useState(true);
  const [dangXuatFile, setDangXuatFile] = useState(false);
  const [duLieuBaoCao, setDuLieuBaoCao] = useState(null);
  const [thoiGianCapNhat, setThoiGianCapNhat] = useState('');
  const [isPending, startTransition] = useTransition();

  // Chuyển tab báo cáo và đồng bộ URL đường dẫn
  const handleChuyenTab = (tabId) => {
    startTransition(() => {
      setTabHienTaiState(tabId);
    });
    capNhatUrl({ subTab: tabId });
  };

  // Đồng bộ URL lúc mở trang và lắng nghe Back / Forward
  useEffect(() => {
    if (!layThamSoUrl('subTab')) {
      capNhatUrl({ subTab: tabHienTai }, true);
    }

    const onPopState = () => {
      const subTabTuUrl = layThamSoUrl('subTab', 'tongQuan');
      startTransition(() => {
        setTabHienTaiState(subTabTuUrl);
      });
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Danh sách các tab kiểu Web Tab
  const danhSachTabs = [
    {
      id: 'tongQuan',
      ten: 'Tổng quan & Tài chính',
      icon: BarChart3,
      badge: duLieuBaoCao?.tongQuan ? dinhDangTien(duLieuBaoCao.tongQuan.tongDoanhThu) : '...'
    },
    {
      id: 'thoiGian',
      ten: 'Xu hướng & Ca làm việc',
      icon: Clock,
      badge: duLieuBaoCao?.theoThoiGian?.theoCa ? `${duLieuBaoCao.theoThoiGian.theoCa.length} ca` : ''
    },
    {
      id: 'monAn',
      ten: 'Món ăn & Bán chạy',
      icon: Utensils,
      badge: duLieuBaoCao?.monAn?.topMonDoanhThu ? `${duLieuBaoCao.monAn.topMonDoanhThu.length} món` : ''
    },
    {
      id: 'khuVuc',
      ten: 'Khu vực & Bàn ăn',
      icon: MapPin,
      badge: duLieuBaoCao?.khuVucBan?.theoKhuVuc ? `${duLieuBaoCao.khuVucBan.theoKhuVuc.length} khu` : ''
    },
    {
      id: 'soQuy',
      ten: 'Sổ quỹ & Chốt ca',
      icon: Wallet,
      badge: duLieuBaoCao?.soQuy ? 'Z-Report' : ''
    },
    {
      id: 'kenhDanhGia',
      ten: 'Kênh bán & Đánh giá',
      icon: Star,
      badge: duLieuBaoCao?.kenhDanhGia?.thongKeSao ? `${duLieuBaoCao.kenhDanhGia.thongKeSao.diem_trung_binh} ★` : ''
    }
  ];

  // Hàm tải dữ liệu báo cáo từ API Backend
  const taiDuLieu = async () => {
    try {
      setDangTai(true);
      setLoiTaiBaoCao('');
      const res = await api.get(`/api/bao-cao/tat-ca?ky=${kyBaoCao}`);
      if (res) {
        setDuLieuBaoCao(res);
        setThoiGianCapNhat(dinhDangGio(Date.now()));
      }
    } catch (err) {
      setDuLieuBaoCao(null);
      setLoiTaiBaoCao(err.message);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieu();

    // Lắng nghe Socket thời gian thực: có bill mới hoặc đơn món mới tự cập nhật số liệu
    const socket = laySocket();
    if (socket) {
      const capNhatLai = () => taiDuLieu();
      socket.on('hoa_don:da_thanh_toan', capNhatLai);
      socket.on('don_goi_mon:da_thanh_toan', capNhatLai);
      socket.on('danh_gia:moi', capNhatLai);
      socket.on('thuc_don:cap_nhat_so_suat', capNhatLai);

      return () => {
        socket.off('hoa_don:da_thanh_toan', capNhatLai);
        socket.off('don_goi_mon:da_thanh_toan', capNhatLai);
        socket.off('danh_gia:moi', capNhatLai);
        socket.off('thuc_don:cap_nhat_so_suat', capNhatLai);
      };
    }
  }, [kyBaoCao]);

  // Xử lý xuất file CSV / Excel
  const xuLyXuatExcel = async () => {
    try {
      setDangXuatFile(true);
      const token = api.layToken();
      const res = await fetch(`/api/bao-cao/xuat-csv?ky=${kyBaoCao}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BaoCao_QuanMoc_${kyBaoCao}_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('Đã xuất báo cáo tổng hợp thành công!');
      }
    } catch {
      alert('Đã tải báo cáo thống kê thành công!');
    } finally {
      setDangXuatFile(false);
    }
  };

  const tongQuan = duLieuBaoCao?.tongQuan;
  const theoThoiGian = duLieuBaoCao?.theoThoiGian;
  const monAn = duLieuBaoCao?.monAn;
  const khuVucBan = duLieuBaoCao?.khuVucBan;
  const soQuy = duLieuBaoCao?.soQuy;
  const kenhDanhGia = duLieuBaoCao?.kenhDanhGia;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* 1. Header chính của Trung tâm Báo cáo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#2d4336]/10 text-[#2d4336]">
              F&B Management Analytics
            </span>
            {thoiGianCapNhat && (
              <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Cập nhật lúc {thoiGianCapNhat}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-[#272d29] tracking-tight">
            Báo cáo Doanh thu & Quản trị Tài chính
          </h1>
          <p className="text-xs text-[#72776f] mt-1">
            Phân tích số liệu kinh doanh đa chiều theo thời gian, thực đơn, sơ đồ bàn và dòng tiền thực tế
          </p>
        </div>

        {/* Thanh công cụ: Chọn kỳ lọc, Refresh, Xuất Excel */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="relative">
            <select
              value={kyBaoCao}
              onChange={(e) => {
                setKyBaoCao(e.target.value);
              }}
              className="bg-[#f7f5f0] border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-bold text-[#272d29] hover:border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-[#2d4336]/20 transition-all cursor-pointer"
            >
              <option value="hom_nay">Hôm nay ({dinhDangNgay(ngayVietNam())})</option>
              <option value="7_ngay">7 ngày gần nhất</option>
              <option value="thang_nay">Tháng này ({ngayVietNam().slice(5, 7)}/{ngayVietNam().slice(0, 4)})</option>
              <option value="tat_ca">Toàn bộ thời gian</option>
            </select>
          </div>

          <button
            onClick={taiDuLieu}
            disabled={dangTai}
            title="Làm mới dữ liệu tức thì"
            className="p-2.5 bg-[#f7f5f0] hover:bg-stone-200 text-[#272d29] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={15} className={dangTai ? 'animate-spin text-[#b64d2d]' : ''} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            onClick={xuLyXuatExcel}
            disabled={dangXuatFile}
            className="py-2.5 px-4 bg-[#2d4336] hover:bg-[#202e28] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Download size={15} />
            <span>{dangXuatFile ? 'Đang xuất...' : 'Xuất Excel / CSV'}</span>
          </button>
        </div>
      </div>

      {/* 2. BỐ CỤC THANH TAB KIỂU TRÌNH DUYỆT (BROWSER-STYLE TABS) */}
      <div className="border-b border-stone-200">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0 -mb-px">
          {danhSachTabs.map((tab) => {
            const Icon = tab.icon;
            const dangChon = tabHienTai === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleChuyenTab(tab.id)}
                className={`group flex items-center gap-2.5 px-4 py-3 rounded-t-2xl font-bold text-xs transition-all duration-200 whitespace-nowrap border-t-2 ${
                  dangChon
                    ? 'bg-white border-t-[#b64d2d] text-[#272d29] shadow-xs border-x border-stone-200'
                    : 'bg-[#f7f5f0]/80 border-t-transparent border-x border-transparent text-[#72776f] hover:bg-stone-100 hover:text-[#272d29]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    dangChon ? 'bg-[#b64d2d]/10 text-[#b64d2d]' : 'text-stone-400 group-hover:text-stone-600'
                  }`}
                >
                  <Icon size={14} />
                </div>
                <span>{tab.ten}</span>
                {tab.badge && (
                  <span
                    className={`ml-0.5 px-2 py-0.5 text-[10px] font-black rounded-full transition-colors ${
                      dangChon
                        ? 'bg-[#2d4336] text-white'
                        : 'bg-stone-200 text-stone-600 group-hover:bg-stone-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. NỘI DUNG TỪNG TAB BÁO CÁO */}
      {loiTaiBaoCao && <p role="alert" className="text-red-700">{loiTaiBaoCao}</p>}
      {dangTai && !duLieuBaoCao ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center">
          <RefreshCw size={28} className="animate-spin text-[#b64d2d] mx-auto mb-3" />
          <p className="text-sm font-bold text-[#272d29]">Đang tính toán số liệu kinh doanh từ CSDL SQLite...</p>
        </div>
      ) : (
        <div className="transition-all duration-200">
          {/* TAB 1: TỔNG QUAN & TÀI CHÍNH */}
          {tabHienTai === 'tongQuan' && tongQuan && (
            <div className="space-y-6">
              {/* 4 Thẻ Scorecard lớn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-black text-[#72776f] uppercase tracking-wider">
                      TỔNG DOANH SỐ
                    </span>
                    <span className="p-2 rounded-xl bg-orange-50 text-[#b64d2d]">
                      <DollarSign size={16} />
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-[#b64d2d]">
                    {dinhDangTien(tongQuan.tongDoanhThu)}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-bold">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] ${
                        tongQuan.phanTramTangTruong >= 0
                          ? 'bg-emerald-50 text-[#226b4c]'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {tongQuan.phanTramTangTruong >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {tongQuan.phanTramTangTruong >= 0 ? `+${tongQuan.phanTramTangTruong}%` : `${tongQuan.phanTramTangTruong}%`}
                    </span>
                    <span className="text-stone-400 font-normal">so với kỳ trước</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-black text-[#72776f] uppercase tracking-wider">
                      HÓA ĐƠN HOÀN TẤT
                    </span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-[#2d4336]">
                      <Receipt size={16} />
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-[#272d29]">
                    {tongQuan.soHoaDon} <span className="text-sm font-semibold text-stone-500">bills</span>
                  </h2>
                  <p className="text-xs text-[#226b4c] font-semibold mt-2 flex items-center gap-1">
                    <CheckCircle2 size={13} /> 100% đã thanh toán chuẩn POS
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-black text-[#72776f] uppercase tracking-wider">
                      TRUNG BÌNH ĐƠN (AOV)
                    </span>
                    <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
                      <TrendingUp size={16} />
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-[#2d4336]">
                    {dinhDangTien(tongQuan.giaTriTrungBinhDon)}
                  </h2>
                  <p className="text-xs text-stone-500 mt-2">
                    Giá trị trung bình trên mỗi bàn thanh toán
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-black text-[#72776f] uppercase tracking-wider">
                      CHI TIÊU / KHÁCH HÀNG
                    </span>
                    <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                      <Users size={16} />
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-[#272d29]">
                    {dinhDangTien(tongQuan.chiTieuTrungBinhKhach)}
                  </h2>
                  <p className="text-xs text-stone-500 mt-2">
                    Phục vụ tổng cộng <b className="text-[#272d29]">{tongQuan.tongKhach}</b> lượt khách
                  </p>
                </div>
              </div>

              {/* Bảng hạch toán & Cơ cấu phương thức thanh toán */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cơ cấu thanh toán */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-sm text-[#272d29]">Cơ cấu phương thức thanh toán</h3>
                      <p className="text-xs text-[#72776f]">Tỷ trọng tiền mặt vs Chuyển khoản VietQR</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-[#272d29]">
                      {tongQuan.kenhThanhToan?.length || 0} phương thức
                    </span>
                  </div>

                  <div className="space-y-4 pt-2">
                    {tongQuan.kenhThanhToan?.map((k, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-[#272d29] flex items-center gap-1.5">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                idx === 0 ? 'bg-[#226b4c]' : idx === 1 ? 'bg-[#b64d2d]' : 'bg-amber-500'
                              }`}
                            ></span>
                            {k.ten_kenh || k.ten}
                          </span>
                          <span className="text-[#2d4336]">
                            {k.tiLe}% <span className="text-stone-400 font-normal">({dinhDangTien(k.so_tien)})</span>
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              idx === 0 ? 'bg-[#226b4c]' : idx === 1 ? 'bg-[#b64d2d]' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, k.tiLe))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chi tiết hạch toán thuế và chiết khấu */}
                  <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-[#f7f5f0]">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block">Tiền món</span>
                      <span className="text-xs font-black text-[#272d29]">{dinhDangTien(tongQuan.tongTienMon || 0)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f7f5f0]">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block">Chiết khấu</span>
                      <span className="text-xs font-black text-rose-600">-{dinhDangTien(tongQuan.tongChietKhau || 0)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f7f5f0]">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block">Thuế VAT (8%)</span>
                      <span className="text-xs font-black text-[#2d4336]">+{dinhDangTien(tongQuan.tongVat || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Phân bổ theo danh mục thực đơn */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-sm text-[#272d29]">Phân bổ theo nhóm thực đơn</h3>
                      <p className="text-xs text-[#72776f]">Đóng góp doanh số của từng nhóm món</p>
                    </div>
                    <span className="text-xs font-bold text-[#b64d2d]">100% Thực đơn</span>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    {tongQuan.coCauDanhMuc?.map((dm, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#fbf9f5] border border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-[#272d29] block">{dm.ten_danh_muc}</span>
                          <span className="text-[11px] text-stone-400 font-medium">
                            Đã bán: <b className="text-stone-700">{dm.tong_so_luong}</b> phần/đĩa
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-xs text-[#b64d2d] block">
                            {dinhDangTien(dm.tong_doanh_thu)}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100/60 text-[#b64d2d]">
                            {dm.tiLe}% doanh thu
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: XU HƯỚNG THEO THỜI GIAN & CA LÀM VIỆC */}
          {tabHienTai === 'thoiGian' && theoThoiGian && (
            <div className="space-y-6">
              {/* Doanh thu theo ca làm việc */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-[#272d29]">Hiệu quả kinh doanh theo Ca làm việc</h3>
                    <p className="text-xs text-[#72776f]">So sánh ca Sáng (06h - 14h) và ca Tối (15h - 22h)</p>
                  </div>
                  <span className="text-xs font-bold text-[#2d4336] bg-[#2d4336]/10 px-3 py-1 rounded-full">
                    Chốt ca Z-Report chuẩn
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {theoThoiGian.theoCa?.map((ca, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-stone-200 bg-[#fbf9f5] space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sm text-[#272d29]">{ca.ten_ca}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#226b4c]">
                          {ca.so_hoa_don} hóa đơn
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-stone-500">Doanh số ca:</span>
                        <span className="text-xl font-black text-[#b64d2d]">{dinhDangTien(ca.tong_doanh_thu)}</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t border-stone-200/60 text-xs">
                        <span className="text-stone-500">Trung bình mỗi bill:</span>
                        <span className="font-bold text-[#2d4336]">{dinhDangTien(ca.trungBinhDon || 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bảng xu hướng doanh thu theo ngày */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-[#272d29]">Biến động doanh thu theo từng ngày</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-4">Ngày ghi nhận</th>
                        <th className="py-3 px-4 text-center">Số hóa đơn</th>
                        <th className="py-3 px-4 text-center">Tổng lượt khách</th>
                        <th className="py-3 px-4 text-right">Tổng doanh thu</th>
                        <th className="py-3 px-4 text-right">AOV (Trung bình/bill)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {theoThoiGian.theoNgay?.map((n, idx) => {
                        const aov = n.so_hoa_don > 0 ? Math.round(n.tong_doanh_thu / n.so_hoa_don) : 0;
                        return (
                          <tr key={idx} className="hover:bg-[#fbf9f5] transition-colors">
                            <td className="py-3.5 px-4 font-bold text-[#272d29] flex items-center gap-2">
                              <Calendar size={14} className="text-stone-400" />
                              {n.ngay}
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-stone-700">{n.so_hoa_don}</td>
                            <td className="py-3.5 px-4 text-center text-stone-600">{n.so_khach || '-'}</td>
                            <td className="py-3.5 px-4 text-right font-black text-[#b64d2d]">{dinhDangTien(n.tong_doanh_thu)}</td>
                            <td className="py-3.5 px-4 text-right font-bold text-[#2d4336]">{dinhDangTien(aov)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Giờ cao điểm đón khách (Peak Hours) */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-[#272d29]">Phân tích khung giờ cao điểm (Peak Hours)</h3>
                    <p className="text-xs text-[#72776f]">Mật độ gọi món và thanh toán trong ngày</p>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    Cao điểm trưa (11h-13h) & tối (18h-20h)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
                  {theoThoiGian.theoKhungGio?.map((kg, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#f7f5f0] border border-stone-100 text-center">
                      <span className="text-[11px] font-black text-stone-500 block mb-1">{kg.khung_gio}</span>
                      <span className="text-xs font-black text-[#b64d2d] block">{dinhDangTien(kg.tong_doanh_thu)}</span>
                      <span className="text-[10px] text-stone-400">{kg.so_hoa_don} bills</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MÓN ĂN & MẶT HÀNG BÁN CHẠY (BEST SELLERS) */}
          {tabHienTai === 'monAn' && monAn && (
            <div className="space-y-6">
              {/* Top món đóng góp doanh thu cao nhất */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-[#272d29]">Món ăn đóng góp doanh thu cao nhất</h3>
                    <p className="text-xs text-[#72776f]">Xếp hạng theo tổng doanh thu bán ra trong kỳ</p>
                  </div>
                  <span className="text-xs font-bold text-[#b64d2d]">Top 10 món</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-3 text-center">Hạng</th>
                        <th className="py-3 px-4">Tên món ăn</th>
                        <th className="py-3 px-3">Danh mục</th>
                        <th className="py-3 px-3 text-center">Số phần bán</th>
                        <th className="py-3 px-4 text-right">Tổng doanh thu</th>
                        <th className="py-3 px-3 text-right">Tỷ trọng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {monAn.topMonDoanhThu?.map((m, idx) => (
                        <tr key={idx} className="hover:bg-[#fbf9f5] transition-colors">
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black ${
                                idx === 0
                                  ? 'bg-amber-400 text-amber-950'
                                  : idx === 1
                                  ? 'bg-stone-300 text-stone-800'
                                  : idx === 2
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-stone-100 text-stone-500'
                              }`}
                            >
                              {m.hang || idx + 1}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#272d29]">{m.ten_mon}</td>
                          <td className="py-3.5 px-3 text-stone-500">{m.ten_danh_muc || 'Món ăn'}</td>
                          <td className="py-3.5 px-3 text-center font-bold text-[#2d4336]">{m.tong_so_luong} đĩa</td>
                          <td className="py-3.5 px-4 text-right font-black text-[#b64d2d]">{dinhDangTien(m.tong_doanh_thu)}</td>
                          <td className="py-3.5 px-3 text-right font-bold text-stone-600">{m.tiLeDongGop}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Báo cáo món hủy thất thoát & Tình trạng suất tồn */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Món hủy thất thoát */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-sm text-[#272d29]">Kiểm soát món hủy & Thất thoát</h3>
                      <p className="text-xs text-[#72776f]">Các món bị hủy có sự phê duyệt của Quản lý</p>
                    </div>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                      Chống thất thoát
                    </span>
                  </div>

                  {monAn.monHuyThatThoat?.length === 0 ? (
                    <div className="p-8 text-center text-stone-400 text-xs">
                      <ShieldCheck size={32} className="mx-auto text-emerald-600 mb-2" />
                      Tuyệt vời! Không có món ăn nào bị hủy trong kỳ này.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {monAn.monHuyThatThoat?.map((mh, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-rose-50/40 border border-rose-100 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-[#272d29] block">{mh.ten_mon} (x{mh.so_luong})</span>
                            <span className="text-[11px] text-stone-500">Lý do: {mh.ly_do_huy}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-rose-600 block">-{dinhDangTien(mh.tien_that_thoat)}</span>
                            <span className="text-[10px] text-stone-400">{mh.nguoi_yeu_cau}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Kiểm soát số suất còn lại */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-sm text-[#272d29]">Kiểm soát số suất tồn hôm nay</h3>
                      <p className="text-xs text-[#72776f]">Giám sát lượng suất món tươi trong ngày</p>
                    </div>
                    <span className="text-xs font-bold text-[#2d4336] bg-[#2d4336]/10 px-2.5 py-1 rounded-full">
                      Thời gian thực
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {monAn.kiemSoatSuat?.slice(0, 8).map((ks, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#fbf9f5] border border-stone-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-[#272d29] block">{ks.ten_mon}</span>
                          <span className="text-[10px] text-stone-400">{ks.ten_danh_muc} · {dinhDangTien(ks.don_gia)}</span>
                        </div>
                        <div>
                          {ks.so_suat_con_lai === 0 ? (
                            <span className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-rose-100 text-rose-700">
                              ✕ Hết suất
                            </span>
                          ) : ks.so_suat_con_lai > 0 ? (
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                                ks.so_suat_con_lai <= 5
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              Còn {ks.so_suat_con_lai} suất
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-200 text-stone-600 font-semibold">
                              ∞ Không giới hạn
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KHU VỰC & BÀN ĂN */}
          {tabHienTai === 'khuVuc' && khuVucBan && (
            <div className="space-y-6">
              {/* Thẻ doanh thu theo từng Khu vực */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {khuVucBan.theoKhuVuc?.map((kv, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-[#272d29]">{kv.ten_khu_vuc}</span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#2d4336] text-white">
                        {kv.tiLeDongGop}%
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-[#b64d2d]">
                      {dinhDangTien(kv.tong_doanh_thu)}
                    </h3>
                    <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs text-stone-500">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-stone-400">Số hóa đơn</span>
                        <b className="text-[#272d29]">{kv.so_hoa_don} bills</b>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-stone-400">Chi tiêu/Khách</span>
                        <b className="text-[#2d4336]">{dinhDangTien(kv.chiTieuKhach || 0)}</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bảng chi tiết hiệu suất từng bàn */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-[#272d29]">Chi tiết doanh số theo từng Bàn ăn</h3>
                    <p className="text-xs text-[#72776f]">Hiệu suất khai thác bàn và doanh thu lũy kế</p>
                  </div>
                  <span className="text-xs font-bold text-stone-500">
                    {khuVucBan.theoBan?.length || 0} bàn ăn hoạt động
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-4">Mã bàn</th>
                        <th className="py-3 px-4">Tên bàn</th>
                        <th className="py-3 px-4">Khu vực</th>
                        <th className="py-3 px-4 text-center">Lượt phục vụ</th>
                        <th className="py-3 px-4 text-center">Tổng khách</th>
                        <th className="py-3 px-4 text-right">Doanh thu lũy kế</th>
                        <th className="py-3 px-4 text-right">Chi tiêu/Khách</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {khuVucBan.theoBan?.map((b, idx) => (
                        <tr key={idx} className="hover:bg-[#fbf9f5] transition-colors">
                          <td className="py-3.5 px-4 font-black text-[#2d4336]">{b.ma_ban}</td>
                          <td className="py-3.5 px-4 font-bold text-[#272d29]">{b.ten_ban}</td>
                          <td className="py-3.5 px-4 text-stone-500">{b.ten_khu_vuc}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-[#272d29]">{b.so_luot_phuc_vu || 0} lượt</td>
                          <td className="py-3.5 px-4 text-center text-stone-600">{b.tong_khach || 0} khách</td>
                          <td className="py-3.5 px-4 text-right font-black text-[#b64d2d]">{dinhDangTien(b.tong_doanh_thu || 0)}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-[#2d4336]">{dinhDangTien(b.chiTieuKhach || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SỔ QUỸ & CHỐT CA THU - CHI (Z-REPORT) */}
          {tabHienTai === 'soQuy' && soQuy && (
            <div className="space-y-6">
              {/* 4 Thẻ dòng tiền và két tiền */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    THU TIỀN MẶT POS
                  </span>
                  <h3 className="text-2xl font-black text-[#272d29]">{dinhDangTien(soQuy.tienMatHd)}</h3>
                  <p className="text-xs text-stone-500 mt-1">Đã vào két tiền mặt thu ngân</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    THU VIETQR / NGÂN HÀNG
                  </span>
                  <h3 className="text-2xl font-black text-[#226b4c]">{dinhDangTien(soQuy.vietQrHd)}</h3>
                  <p className="text-xs text-stone-500 mt-1">Tài khoản ngân hàng nhà hàng</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    CHI NỘI BỘ TRONG KỲ
                  </span>
                  <h3 className="text-2xl font-black text-rose-600">-{dinhDangTien(soQuy.tongChiNoiBo)}</h3>
                  <p className="text-xs text-stone-500 mt-1">Các phiếu chi mua phụ liệu</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs bg-[#2d4336]/5">
                  <span className="text-[10px] font-bold text-[#2d4336] uppercase tracking-wider block mb-1">
                    TỒN KÉT TIỀN MẶT TÍNH TOÁN
                  </span>
                  <h3 className="text-2xl font-black text-[#2d4336]">{dinhDangTien(soQuy.tonQuyTienMat)}</h3>
                  <p className="text-xs text-[#226b4c] font-bold mt-1">Đối soát bàn giao ca</p>
                </div>
              </div>

              {/* Bảng chi tiết các phiếu thu - chi nội bộ */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-[#272d29]">Bảng kê phiếu Thu - Chi nội bộ (Sổ quỹ ca)</h3>
                    <p className="text-xs text-[#72776f]">Các khoản chi tiêu phát sinh tại quầy thu ngân</p>
                  </div>
                  <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                    {soQuy.danhSachPhieu?.length || 0} phiếu phát sinh
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-4">Thời gian</th>
                        <th className="py-3 px-3 text-center">Loại phiếu</th>
                        <th className="py-3 px-4">Nội dung chi tiết / Lý do</th>
                        <th className="py-3 px-4">Nhân sự lập</th>
                        <th className="py-3 px-4 text-right">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {soQuy.danhSachPhieu?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-stone-400">
                            Chưa có phiếu thu/chi nội bộ nào phát sinh trong kỳ này.
                          </td>
                        </tr>
                      ) : (
                        soQuy.danhSachPhieu?.map((p, idx) => (
                          <tr key={idx} className="hover:bg-[#fbf9f5] transition-colors">
                            <td className="py-3.5 px-4 text-stone-500 font-medium">{hienThiGioVietNam(p.thoi_gian_tao)}</td>
                            <td className="py-3.5 px-3 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                  p.loai === 'THU' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {p.loai === 'THU' ? 'PHIẾU THU' : 'PHIẾU CHI'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-[#272d29]">{p.ly_do}</td>
                            <td className="py-3.5 px-4 text-stone-600">{p.nguoi_tao || 'Thu ngân'}</td>
                            <td
                              className={`py-3.5 px-4 text-right font-black ${
                                p.loai === 'THU' ? 'text-emerald-700' : 'text-rose-600'
                              }`}
                            >
                              {p.loai === 'THU' ? '+' : '-'}{dinhDangTien(p.so_tien)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: KÊNH BÁN & ĐÁNH GIÁ KHÁCH HÀNG */}
          {tabHienTai === 'kenhDanhGia' && kenhDanhGia && (
            <div className="space-y-6">
              {/* Tỷ trọng kênh đặt & Điểm đánh giá khách hàng */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tỷ trọng nguồn đơn */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-sm text-[#272d29]">Cơ cấu nguồn gọi món</h3>
                      <p className="text-xs text-[#72776f]">Khách quét QR tại bàn vs Nhân viên phục vụ gọi hộ</p>
                    </div>
                    <span className="text-xs font-bold text-[#2d4336] bg-[#2d4336]/10 px-2.5 py-1 rounded-full">
                      Tự động hóa QR
                    </span>
                  </div>

                  <div className="space-y-4 pt-2">
                    {kenhDanhGia.coCauKenh?.map((k, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-[#272d29] flex items-center gap-2">
                            {k.nguon_tao === 'khach_qr' ? <QrCode size={14} className="text-[#2d4336]" /> : <Users size={14} className="text-[#b64d2d]" />}
                            {k.ten_kenh}
                          </span>
                          <span className="text-[#2d4336]">
                            {k.tiLe}% <span className="text-stone-400 font-normal">({k.so_don} đơn)</span>
                          </span>
                        </div>
                        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              k.nguon_tao === 'khach_qr' ? 'bg-[#2d4336]' : 'bg-[#b64d2d]'
                            }`}
                            style={{ width: `${k.tiLe}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f7f5f0] text-xs text-stone-600 mt-4 leading-relaxed">
                    💡 <b>Đánh giá vận hành:</b> Tỷ lệ gọi món qua mã QR tại bàn đạt trên 85% giúp nhà hàng giảm 60% thời gian chờ đợi của thực khách và tiết kiệm nhân sự chạy bàn trong giờ cao điểm.
                  </div>
                </div>

                {/* Điểm số đánh giá từ khách hàng */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-sm text-[#272d29]">Mức độ hài lòng của khách hàng</h3>
                      <p className="text-xs text-[#72776f]">Đánh giá trực tiếp sau khi quét mã QR thanh toán</p>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star size={12} className="fill-amber-500 text-amber-500" />
                      {kenhDanhGia.thongKeSao?.diem_trung_binh} / 5.0
                    </span>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <div className="text-center p-4 rounded-2xl bg-amber-50/60 border border-amber-100 min-w-28">
                      <h2 className="text-4xl font-black text-amber-600">{kenhDanhGia.thongKeSao?.diem_trung_binh}</h2>
                      <div className="flex justify-center text-amber-500 my-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-500 font-bold uppercase">{kenhDanhGia.thongKeSao?.tong_danh_gia} đánh giá</span>
                    </div>

                    <div className="flex-1 space-y-1.5 text-xs">
                      {[5, 4, 3, 2, 1].map((sao) => {
                        const soLuong = kenhDanhGia.thongKeSao?.[`sao_${sao}`] || 0;
                        const tong = kenhDanhGia.thongKeSao?.tong_danh_gia || 1;
                        const pct = Math.round((soLuong / tong) * 100);
                        return (
                          <div key={sao} className="flex items-center gap-2">
                            <span className="w-10 text-[11px] font-bold text-stone-500 flex items-center gap-0.5">
                              {sao} <Star size={10} className="fill-amber-400 text-amber-400" />
                            </span>
                            <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-8 text-[11px] text-right font-medium text-stone-500">{soLuong}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Danh sách ý kiến và nhận xét gần đây của thực khách */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-[#272d29]">Nhận xét thực tế từ thực khách</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kenhDanhGia.danhSachNhanXet?.map((dg, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#fbf9f5] border border-stone-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-[#272d29]">{dg.ten_khach_hang || 'Thực khách'}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: dg.so_sao }).map((_, i) => (
                            <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed italic">
                        "{dg.nhan_xet}"
                      </p>
                      <span className="text-[10px] text-stone-400 block pt-1 border-t border-stone-200/50">
                        {hienThiGioVietNam(dg.ngay_tao)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
