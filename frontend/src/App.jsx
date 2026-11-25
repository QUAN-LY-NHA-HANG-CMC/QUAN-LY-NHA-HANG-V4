// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// APP CHÍNH - 100% GIAO DIỆN CHUẨN FIGMA (KHÔNG CÓ THANH CÔNG CỤ DƯ THỪA)
// ============================================================================

import React, { useState, useEffect, Suspense } from 'react';
import DinhTuyenUngDung from './dinhTuyen/DinhTuyenUngDung';
import ThongBaoToast from './thanhPhan/ThongBaoToast';
import ThongBaoXuLyMonPos from './thanhPhan/ThongBaoXuLyMonPos';
import { taoKetNoiSocket } from './dungChung/ketNoiSocket';
import { api } from './dungChung/api';
import { layThamSoUrl, capNhatUrl } from './dungChung/dieuHuongUrl';

export default function App() {
  // Lấy phân hệ từ URL search params hoặc thông tin đăng nhập (Bảo vệ Route nội bộ)
  const layPhanHeKhoiTao = () => {
    const params = new URLSearchParams(window.location.search);
    const phanHeUrl = params.get('phanHe');
    const nguoiDung = api.layNguoiDung();
    const token = api.layToken();

    const phanHeNoiBo = ['phucVu', 'bep', 'thuNgan', 'quanTri'];
    if (phanHeNoiBo.includes(phanHeUrl)) {
      if (!token || !nguoiDung) return 'dangNhap';
      if (phanHeUrl === 'quanTri' && nguoiDung.vaiTro !== 'quan_ly') return 'dangNhap';
      if (phanHeUrl === 'thuNgan' && nguoiDung.vaiTro !== 'thu_ngan' && nguoiDung.vaiTro !== 'quan_ly') return 'dangNhap';
      if (phanHeUrl === 'bep' && nguoiDung.vaiTro !== 'bep' && nguoiDung.vaiTro !== 'quan_ly') return 'dangNhap';
      if (phanHeUrl === 'phucVu' && nguoiDung.vaiTro !== 'phuc_vu' && nguoiDung.vaiTro !== 'quan_ly') return 'dangNhap';
      return phanHeUrl;
    }

    if (phanHeUrl === 'dangNhap') return 'dangNhap';
    if (phanHeUrl === 'khachHang') return 'khachHang';

    if (nguoiDung && token) {
      if (nguoiDung.vaiTro === 'quan_ly') return 'quanTri';
      if (nguoiDung.vaiTro === 'thu_ngan') return 'thuNgan';
      if (nguoiDung.vaiTro === 'bep') return 'bep';
      if (nguoiDung.vaiTro === 'phuc_vu') return 'phucVu';
    }
    return 'khachHang'; // Mặc định là Khách hàng E-Menu quét mã QR tại bàn (C01)
  };

  const [phanHe, setPhanHe] = useState(layPhanHeKhoiTao);
  const [thongTinBan, setThongTinBan] = useState(null);
  const [thongBao, setThongBao] = useState(null);

  // Chuyển phân hệ và đồng bộ URL tức thì trên thanh địa chỉ
  const handleChuyenPhanHe = (phanHeMoi) => {
    setPhanHe(phanHeMoi);
    capNhatUrl({
      phanHe: phanHeMoi,
      ...(phanHeMoi !== 'quanTri' ? { tab: null, subTab: null } : {})
    });
  };

  // Đồng bộ URL lúc mở trang và lắng nghe nút Back / Forward của trình duyệt
  useEffect(() => {
    // Nếu URL chưa có phanHe thì đồng bộ URL hiện tại
    if (!layThamSoUrl('phanHe')) {
      capNhatUrl({ phanHe }, true);
    }

    const onPopState = () => {
      const phanHeTuUrl = layPhanHeKhoiTao();
      setPhanHe(phanHeTuUrl);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Xác thực token bàn từ Backend nếu có
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      api.get(`/api/ban-an/qr/${encodeURIComponent(token)}`)
        .then(ban => {
          if (ban && ban.id) {
            const duLieuBan = {
              id: ban.id,
              ma_ban: ban.ma_ban,
              ten_ban: ban.ten_ban,
              khu_vuc: ban.ten_khu_vuc || 'Tầng 1 (Khu Máy Lạnh)',
              so_cho: ban.suc_chua || ban.so_cho || 4,
              trang_thai: ban.trang_thai,
              token: token
            };
            setThongTinBan(duLieuBan);

          }
        })
        .catch(err => {
          console.warn('Xác thực QR token bàn không thành công:', err.message);
        });
    }
  }, []);

  useEffect(() => {
    const socket = taoKetNoiSocket();
    const thongBaoBan = (noiDung, loai = 'info') => {
      if (layThamSoUrl('trang') !== 'caLamViec') setThongBao({ loai, noiDung });
    };
    const donMoi = data => thongBaoBan('Có đơn gọi món mới' + (data.tenBan ? ' · ' + data.tenBan : ''));
    const hoTro = data => thongBaoBan((data.tenBan || 'Bàn') + ' gọi hỗ trợ.');
    const tinhTien = data => thongBaoBan((data.tenBan || 'Bàn') + ' yêu cầu tính tiền.');
    const donBan = data => {
      if (api.layNguoiDung()?.vaiTro === 'phuc_vu') thongBaoBan((data.tenBan || 'Bàn') + ' đã thanh toán, cần dọn.');
    };
    const tienDo = data => {
      if (data.trangThaiMoi === 'hoan_thanh') thongBaoBan((data.tenMon || 'Món') + ' đã nấu xong, chờ bưng lên bàn.', 'success');
      if (data.trangThaiMoi === 'da_phuc_vu') thongBaoBan((data.tenMon || 'Món') + ' đã được phục vụ.', 'success');
    };
    socket.on('don_hang_moi', donMoi);
    socket.on('tien_do_mon_an', tienDo);
    socket.on('khach_goi_ho_tro', hoTro);
    socket.on('khach_yeu_cau_thanh_toan', tinhTien);
    socket.on('thanh_toan_thanh_cong', donBan);
    const nghiViec = () => {
      setThongBao({ loai: 'error', noiDung: 'Quản lý đã xác nhận nghỉ việc. Quyền đăng nhập đã kết thúc.' });
      api.dangXuat();
      setPhanHe('dangNhap');
      capNhatUrl({ phanHe: 'dangNhap', trang: null });
    };
    socket.on('nhan_su:da_nghi_viec', nghiViec);

    return () => {
      socket.off('don_hang_moi', donMoi);
      socket.off('tien_do_mon_an', tienDo);
      socket.off('khach_goi_ho_tro', hoTro);
      socket.off('khach_yeu_cau_thanh_toan', tinhTien);
      socket.off('thanh_toan_thanh_cong', donBan);
      socket.off('nhan_su:da_nghi_viec', nghiViec);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f9f7f2] text-[#272d29] flex flex-col font-sans selection:bg-[#f9ede6] selection:text-[#b64d2d]">
      {/* Vùng hiển thị màn hình 100% chuẩn Figma (Không có thanh công cụ trên cùng) */}
      <main className="flex-1 flex flex-col">
        {['bep', 'phuc_vu', 'thu_ngan', 'quan_ly'].includes(api.layNguoiDung()?.vaiTro) &&
          ['bep', 'phucVu', 'thuNgan'].includes(phanHe) && <ThongBaoXuLyMonPos key={phanHe} />}
        <Suspense fallback={<p role="status" className="p-5">Đang tải màn hình…</p>}>
          <DinhTuyenUngDung
            phanHeHienTai={phanHe}
            onChuyenPhanHe={handleChuyenPhanHe}
            thongTinBan={thongTinBan}
          />
        </Suspense>
      </main>

      {/* Toast thông báo realtime */}
      {thongBao && (
        <ThongBaoToast
          loai={thongBao.loai}
          noiDung={thongBao.noiDung}
          onDong={() => setThongBao(null)}
        />
      )}
    </div>
  );
}
