// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A01 · TỔNG QUAN VẬN HÀNH (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  Utensils,
  Clock,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';

import { api } from '../../dungChung/api';

export default function TrangTongQuanVanHanh({ onChuyenTab }) {
  const [data, setData] = useState(null);
  const [loi, setLoi] = useState('');
  useEffect(() => {
    const nap = () => api.get('/api/he-thong/thong-ke').then(setData).catch(err => setLoi(err.message));
    nap();
    const henGio = setInterval(nap, 30000);
    return () => clearInterval(henGio);
  }, []);
  if (!data) return <p className="p-8" role="status">{loi || 'Đang tải tổng quan…'}</p>;
  const { thongKeHomNay, tinhTrangBan, topMonBanChay } = data;
  const tongSoBan = tinhTrangBan.reduce((tong, b) => tong + b.so_luong, 0);
  const banCoKhach = tinhTrangBan.filter(b => !['trong', 'can_don_dep'].includes(b.trang_thai))
    .reduce((tong, b) => tong + b.so_luong, 0);
  const congSuat = tongSoBan ? Math.round(banCoKhach * 100 / tongSoBan) : 0;
  const soHoaDon = thongKeHomNay.tong_so_hoa_don;
  const doanhThu = thongKeHomNay.tong_doanh_thu;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#272d29] tracking-tight">
            Tổng quan vận hành nhà hàng
          </h1>
          <p className="text-xs text-[#72776f] mt-1">
            Dữ liệu hoạt động trực tiếp theo thời gian thực · Chi nhánh Thảo Điền
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-[#226b4c]">Hệ thống đồng bộ trực tiếp</span>
        </div>
      </div>

      {/* 4 Thẻ KPI chính */}
      <div className="grid grid-cols-4 gap-4">
        {/* KPI 1: Doanh thu */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#72776f] uppercase">Doanh thu hôm nay</span>
            <span className="p-2 bg-emerald-50 text-[#226b4c] rounded-xl">
              <TrendingUp size={18} />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-[#272d29]">
              {dinhDangTien(doanhThu)}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-xs text-[#226b4c] font-bold">
              <ArrowUpRight size={14} />
              <span>Đã thu tiền</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Hóa đơn & Đơn */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#72776f] uppercase">Khách & Đơn hàng</span>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Users size={18} />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-[#272d29]">
              {soHoaDon} hóa đơn
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {soHoaDon} hóa đơn đã hoàn tất
            </p>
          </div>
        </div>

        {/* KPI 3: Giá trị trung bình đơn */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#72776f] uppercase">Giá trị TB / HĐ</span>
            <span className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <DollarSign size={18} />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-[#272d29]">
              {dinhDangTien(soHoaDon ? Math.round(doanhThu / soHoaDon) : 0)}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Mục tiêu ca: 400.000đ/HĐ
            </p>
          </div>
        </div>

        {/* KPI 4: Công suất bàn */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#72776f] uppercase">Công suất bàn</span>
            <span className="p-2 bg-[#f9ede6] text-[#b64d2d] rounded-xl">
              <Utensils size={18} />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-[#b64d2d]">
              {congSuat}%
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {banCoKhach} / {tongSoBan} bàn đang có khách
            </p>
          </div>
        </div>
      </div>

      {/* 2 Khối Vận hành: Bếp KDS & Món bán chạy */}
      <div className="grid grid-cols-2 gap-6">
        {/* Tình hình bếp KDS */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-[#b64d2d]" />
              <h3 className="font-bold text-sm text-[#272d29]">Vận hành Bếp KDS thời gian thực</h3>
            </div>
            <button
              onClick={() => onChuyenTab('dieuPhoiBep')}
              className="text-xs text-[#b64d2d] font-bold hover:underline"
            >
              Xem chi tiết →
            </button>
          </div>


        </div>

        {/* Top món bán chạy nhất */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-stone-100">
            <h3 className="font-bold text-sm text-[#272d29]">Món bán chạy nhất hôm nay</h3>
            <button
              onClick={() => onChuyenTab('baoCao')}
              className="text-xs text-[#b64d2d] font-bold hover:underline"
            >
              Báo cáo doanh số →
            </button>
          </div>

          <div className="py-2 divide-y divide-stone-100 text-xs">
            {topMonBanChay.map((mon, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-stone-400 w-4">{idx + 1}</span>
                  <span className="font-bold text-[#272d29]">{mon.ten_mon}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#b64d2d] mr-3">{mon.tong_so_luong} phần</span>
                  <span className="text-stone-500">{dinhDangTien(mon.tong_tien)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
