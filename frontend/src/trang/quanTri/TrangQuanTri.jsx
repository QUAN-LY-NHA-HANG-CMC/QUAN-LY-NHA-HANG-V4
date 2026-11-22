// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// TRANG QUẢN TRỊ NHÀ HÀNG TOÀN DIỆN (A01 - A20) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState, useEffect } from 'react';
import SidebarQuanTri from '../../thanhPhan/SidebarQuanTri';
import TrangTongQuanVanHanh from './TrangTongQuanVanHanh';
import TrangDanhSachNhanVien from '../nhanVien/TrangDanhSachNhanVien';
import TrangLichPhanCaAdmin from '../caLamViec/TrangLichPhanCaAdmin';
import TrangDuyetNghiDoiCaAdmin from '../caLamViec/TrangDuyetNghiDoiCaAdmin';
import TrangQuanLyPhongBan from '../quanLyBanQr/TrangQuanLyPhongBan';
import TrangThietLapBanVaQr from '../quanLyBanQr/TrangThietLapBanVaQr';
import TrangQuanLyThucDon from '../quanLyThucDon/TrangQuanLyThucDon';
import TrangBaoCaoDoanhThu from '../baoCaoDoanhThu/TrangBaoCaoDoanhThu';
import TrangPhanHoiKhachHang from './TrangPhanHoiKhachHang';
import TrangDieuPhoiKhanCap from './TrangDieuPhoiKhanCap';
import TrangDuyetHuyMonAdmin from './TrangDuyetHuyMonAdmin';
import TrangNhatKyKiemToan from './TrangNhatKyKiemToan';
import TrangThongTinNhaHang from './TrangThongTinNhaHang';
import TrangCauHinhVietQR from './TrangCauHinhVietQR';
import TrangTienIchDuLieu from './TrangTienIchDuLieu';
import { layThamSoUrl, capNhatUrl } from '../../dungChung/dieuHuongUrl';
import { api } from '../../dungChung/api';
import { laySocket } from '../../dungChung/ketNoiSocket';

export default function TrangQuanTri({ nhanVien, onDangXuat }) {
  const [tabHienTai, setTabHienTaiState] = useState(() => layThamSoUrl('tab', 'tongQuan'));
  const [soChoDuyet, setSoChoDuyet] = useState(0);
  useEffect(() => {
    const socket = laySocket();
    let huy = false;
    const nap = () => api.get('/api/don-goi-mon/yeu-cau-huy-mon/so-cho-duyet')
      .then(data => { if (!huy) setSoChoDuyet(data.soLuong); }).catch(() => {});
    nap();
    const suKien = ['connect', 'yeu_cau_huy_mon:thay_doi', 'trang_thai_ban'];
    suKien.forEach(ten => socket.on(ten, nap));
    return () => { huy = true; suKien.forEach(ten => socket.off(ten, nap)); };
  }, []);

  // Chuyển tab trong Quản trị và cập nhật URL đường dẫn trên thanh trình duyệt
  const setTabHienTai = (tabMoi) => {
    setTabHienTaiState(tabMoi);
    capNhatUrl({
      tab: tabMoi,
      ...(tabMoi !== 'baoCao' ? { subTab: null } : {})
    });
  };

  // Đồng bộ URL lúc mở trang và lắng nghe sự kiện Back/Forward của trình duyệt
  useEffect(() => {
    if (!layThamSoUrl('tab')) {
      capNhatUrl({ tab: tabHienTai }, true);
    }

    const onPopState = () => {
      const tabTuUrl = layThamSoUrl('tab', 'tongQuan');
      setTabHienTaiState(tabTuUrl);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <div className="flex h-screen bg-[#f8f7f2] font-sans overflow-hidden">
      {/* Sidebar Quản trị chuẩn Figma */}
      <SidebarQuanTri
        nhanVien={nhanVien}
        tabHienTai={tabHienTai}
        soYeuCauHuyMon={soChoDuyet}
        onChuyenTab={setTabHienTai}
        onDangXuat={onDangXuat}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 overflow-y-auto">
        {tabHienTai === 'tongQuan' && (
          <TrangTongQuanVanHanh onChuyenTab={setTabHienTai} />
        )}

        {tabHienTai === 'nhanSu' && (
          <TrangDanhSachNhanVien />
        )}

        {tabHienTai === 'phanCa' && (
          <TrangLichPhanCaAdmin onChuyenSangDuyetNghi={() => setTabHienTai('duyetNghi')} />
        )}

        {tabHienTai === 'duyetNghi' && (
          <TrangDuyetNghiDoiCaAdmin onQuayLaiLich={() => setTabHienTai('phanCa')} />
        )}

        {tabHienTai === 'phongBan' && (
          <TrangQuanLyPhongBan onChuyenSangTaoQr={() => setTabHienTai('thietLapQr')} />
        )}

        {tabHienTai === 'thietLapQr' && (
          <TrangThietLapBanVaQr onQuayLai={() => setTabHienTai('phongBan')} />
        )}

        {tabHienTai === 'thucDon' && (
          <TrangQuanLyThucDon />
        )}

        {tabHienTai === 'baoCao' && (
          <TrangBaoCaoDoanhThu />
        )}

        {tabHienTai === 'phanHoi' && (
          <TrangPhanHoiKhachHang />
        )}

        {tabHienTai === 'dieuPhoiBep' && (
          <TrangDieuPhoiKhanCap />
        )}

        {tabHienTai === 'duyetHuyMon' && (
          <TrangDuyetHuyMonAdmin />
        )}

        {tabHienTai === 'nhatKyKiemToan' && (
          <TrangNhatKyKiemToan />
        )}

        {tabHienTai === 'caiDat' && (
          <div className="space-y-8 pb-12">
            <TrangThongTinNhaHang />
            <TrangCauHinhVietQR />
            <TrangTienIchDuLieu />
          </div>
        )}
      </div>
    </div>
  );
}
