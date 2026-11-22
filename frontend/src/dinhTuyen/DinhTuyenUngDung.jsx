// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// ĐỊNH TUYẾN ỨNG DỤNG VÀ ĐIỀU PHỐI 5 PHÂN HỆ NGHIỆP VỤ
// ============================================================================

import React, { useState, useEffect, useRef, lazy } from 'react';
import TrangChaoMung from '../trang/thucDonQr/TrangChaoMung';
import TrangThamGiaBan, { ThongBaoThamGia } from '../trang/thucDonQr/TrangThamGiaBan';
import { useThamGiaBan } from '../trang/thucDonQr/thamGiaBan';
import TrangThucDon from '../trang/thucDonQr/TrangThucDon';
import TrangGioHang from '../trang/gioHang/TrangGioHang';
import TrangTheoDoiMon from '../trang/theoDoiDonMon/TrangTheoDoiMon';
import TrangYeuCauThanhToanKhach from '../trang/thanhToan/TrangYeuCauThanhToanKhach';
import TrangVietQrKhach from '../trang/thanhToan/TrangVietQrKhach';
import TrangThanhToanThanhCong from '../trang/thanhToan/TrangThanhToanThanhCong';
import TrangDanhGiaDichVu from '../trang/danhGiaDichVu/TrangDanhGiaDichVu';
import TrangDangNhap from '../trang/dangNhap/TrangDangNhap';
import TrangSoDoBan from '../trang/soDoBan/TrangSoDoBan';
import TrangChiTietBan from '../trang/soDoBan/TrangChiTietBan';
import TrangCaLamViecNhanVien from '../trang/caLamViec/TrangCaLamViecNhanVien';
import { laySocket } from '../dungChung/ketNoiSocket';
import { api } from '../dungChung/api';
import { layThamSoUrl, capNhatUrl } from '../dungChung/dieuHuongUrl';
import { hienThiCaDangLam } from '../dungChung/thoiGian';

const TrangKdsBep = lazy(() => import('../trang/dieuPhoiBep/TrangKdsBep'));

const TrangPosKiemBill = lazy(() => import('../trang/thanhToan/TrangPosKiemBill'));

const TrangQuanTri = lazy(() => import('../trang/quanTri/TrangQuanTri'));

export default function DinhTuyenUngDung({ phanHeHienTai, onChuyenPhanHe, thongTinBan }) {
  // State phân hệ khách hàng E-Menu (C01 - C14)
  const [trangKhach, setTrangKhachState] = useState(() => layThamSoUrl('trang', 'chaoMung')); // chaoMung, thucDon, gioHang, theoDoi, yeuCauThanhToan, vietQr, thanhCong, danhGia
  
  const setTrangKhach = (trangMoi) => {
    setTrangKhachState(trangMoi);
    capNhatUrl({ trang: trangMoi });
  };
  const trangTruocHoTro = useRef('theoDoi');
  const chuyenTabKhach = tab => {
    if (tab === 'hoTro') {
      if (trangKhach !== 'hoTro') trangTruocHoTro.current = trangKhach;
      setTrangKhach('hoTro');
    } else if (tab === 'monDaGoi') setTrangKhach('theoDoi');
    else if (tab === 'thucDon') setTrangKhach('thucDon');
  };
  
  const [gioDaChon, setGioDaChon] = useState(null);
  const [loiGio, setLoiGio] = useState('');
  const khoaDon = useRef(null);
  const dangGuiRef = useRef(false);
  const dangSuaRef = useRef(false);
  const [dangSuaGio, setDangSuaGio] = useState(false);
  const [dangGuiDon, setDangGuiDon] = useState(false);
  const banId = thongTinBan?.id;
  const tokenBan = thongTinBan?.token;
  const thamGia = useThamGiaBan(banId, tokenBan, phanHeHienTai === 'khachHang');
  const daVaoBan = thamGia.phien?.trangThai === 'da_vao';
  const phienDangVao = daVaoBan && thamGia.phien.phienId;
  const gioHang = gioDaChon?.banId === banId && gioDaChon?.phienId === phienDangVao ? gioDaChon.mon : [];
  const napGio = async () => {
    if (!banId || !tokenBan) return null;
    return api.get(`/api/ban-an/${banId}/gio-mon`, thamGia.headers);
  };
  const nhanGio = gio => {
    if (!gio) return;
    setGioDaChon(cu => cu?.banId === gio.banId && cu.phienSua > gio.phienSua ? cu : gio);
  };
  useEffect(() => {
    if (!banId || !tokenBan || !phienDangVao || phanHeHienTai !== 'khachHang') return;
    const socket = laySocket();
    let huy = false;
    const nap = () => napGio().then(gio => { if (!huy) nhanGio(gio); })
      .catch(err => { if (!huy) setLoiGio(err.message); });
    const vaoPhong = () => { socket.emit('tham_gia_ban', banId, tokenBan, thamGia.khoa); nap(); };
    vaoPhong();
    socket.on('connect', vaoPhong);
    socket.on('gio_mon:thay_doi', nap);
    const henGio = setInterval(nap, 10000);
    return () => {
      huy = true;
      clearInterval(henGio);
      socket.off('connect', vaoPhong);
      socket.off('gio_mon:thay_doi', nap);
      socket.emit('roi_ban', banId);
    };
  }, [banId, tokenBan, phanHeHienTai, phienDangVao, thamGia.khoa]);

  const suaGio = async (duLieu) => {
    if (!banId || !tokenBan) {
      alert('Vui lòng quét mã QR tại bàn để chọn món.');
      return;
    }
    if (dangSuaRef.current || dangGuiRef.current) return;
    dangSuaRef.current = true;
    setDangSuaGio(true);
    try {
      setLoiGio('');
      const gio = gioDaChon?.banId === banId ? gioDaChon : await napGio();
      nhanGio(await api.put(`/api/ban-an/${banId}/gio-mon`, {
        ...duLieu, phienSua: gio.phienSua, phienId: gio.phienId
      }, thamGia.headers));
    } catch (err) {
      setLoiGio(err.message);
      alert(err.message);
      await napGio().then(nhanGio).catch(() => {});
    } finally {
      dangSuaRef.current = false;
      setDangSuaGio(false);
    }
  };

  // State nhân viên phục vụ (W01 - W11)
  const [trangPhucVu, setTrangPhucVuState] = useState(() => layThamSoUrl('trang', 'soDoBan')); // soDoBan, chiTietBan, caLamViec
  const setTrangPhucVu = (trangMoi) => {
    setTrangPhucVuState(trangMoi);
    capNhatUrl({ trang: trangMoi });
  };
  const [banDangXem, setBanDangXem] = useState(null);
  const [nguoiDung, setNguoiDung] = useState(() => api.layNguoiDung());
  const [trangThaiCa, setTrangThaiCa] = useState(null);
  const [loiTaiCa, setLoiTaiCa] = useState('');
  const maNguoiDung = nguoiDung?.taiKhoanId;
  const napTrangThaiCa = async () => {
    try {
      const ketQua = await api.get('/api/ca-lam-viec/trang-thai-ca');
      if (api.layNguoiDung()?.taiKhoanId === maNguoiDung) {
        setTrangThaiCa({ ...ketQua, maNguoiDung });
        setLoiTaiCa('');
      }
    } catch (loi) {
      if (api.layNguoiDung()?.taiKhoanId === maNguoiDung) {
        setTrangThaiCa(null);
        setLoiTaiCa(loi.message);
      }
    }
  };
  useEffect(() => {
    if (!maNguoiDung) return;
    napTrangThaiCa();
    const lich = setInterval(napTrangThaiCa, 15000);
    const socket = laySocket();
    socket.on('connect', napTrangThaiCa);
    socket.on('ket_qua_duyet_ca', napTrangThaiCa);
    socket.on('ca_lam_viec:thay_doi', napTrangThaiCa);
    return () => {
      clearInterval(lich);
      socket.off('connect', napTrangThaiCa);
      socket.off('ket_qua_duyet_ca', napTrangThaiCa);
      socket.off('ca_lam_viec:thay_doi', napTrangThaiCa);
    };
  }, [maNguoiDung, nguoiDung?.vaiTro]);
  const caHopLe = trangThaiCa?.maNguoiDung === maNguoiDung ? trangThaiCa : null;
  const thongTinCa = {
    hoTen: nguoiDung?.hoTen || nguoiDung?.ho_ten || nguoiDung?.tenDangNhap || 'Nhân viên',
    ca: hienThiCaDangLam(caHopLe?.caDangLam)
  };
  const moCaLamViec = () => setTrangPhucVu('caLamViec');
  useEffect(() => {
    if (['phucVu', 'thuNgan'].includes(phanHeHienTai) &&
        ['phuc_vu', 'thu_ngan'].includes(nguoiDung?.vaiTro) && !caHopLe?.caDangLam && trangPhucVu !== 'caLamViec') {
      setTrangPhucVu('caLamViec');
    }
  }, [phanHeHienTai, nguoiDung?.vaiTro, caHopLe?.caDangLam?.id, trangPhucVu]);

  // Lắng nghe Back/Forward chuyển đổi trang nội bộ
  useEffect(() => {
    const onPopState = () => {
      const trangTuUrl = layThamSoUrl('trang');
      if (trangTuUrl) {
        if (phanHeHienTai === 'khachHang') setTrangKhachState(trangTuUrl);
        if (phanHeHienTai === 'phucVu') setTrangPhucVuState(trangTuUrl);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [phanHeHienTai]);

  // Đăng xuất và dọn dẹp sạch phiên làm việc
  const handleDangXuat = () => {
    api.dangXuat();
    setNguoiDung(null);
    onChuyenPhanHe('dangNhap');
  };

  // Kiểm tra quyền hạn trước khi hiển thị phân hệ nội bộ
  const kiemTraQuyen = (danhSachQuyenChoPhep) => {
    const userHienTai = nguoiDung || api.layNguoiDung();
    const tokenHienTai = api.layToken();
    if (!tokenHienTai || !userHienTai) return false;
    if (userHienTai.vaiTro === 'quan_ly') return true;
    return danhSachQuyenChoPhep.includes(userHienTai.vaiTro);
  };

  const handleThemVaoGio = mon => suaGio({
    monId: mon.id, soLuong: mon.so_luong, ghiChu: mon.ghi_chu, congThem: true
  });

  const handleCapNhatSoLuong = (dongId, thayDoi) => suaGio({ dongId, thayDoi });

  // Khách gửi đơn gọi món qua Backend API để kích hoạt Socket realtime tới Phục vụ & Bếp
  const handleGuiDon = async () => {
    const monCuaToi = gioHang.filter(mon => mon.cuaToi);
    if (dangGuiRef.current || dangSuaRef.current || !monCuaToi.length) return;
    if (!thongTinBan?.id) {
      alert('Vui lòng quét mã QR tại bàn để gửi đơn.');
      return;
    }
    dangGuiRef.current = true;
    setDangGuiDon(true);
    try {
      const danhSachMon = monCuaToi.map(item => ({
        monAnId: item.id,
        soLuong: item.so_luong,
        ghiChu: item.ghi_chu || ''
      }));

      const noiDungDon = JSON.stringify({ phienId: phienDangVao, danhSachMon });
      if (khoaDon.current?.noiDungDon !== noiDungDon) {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        const id = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
        khoaDon.current = { noiDungDon, id };
      }
      await api.post('/api/don-goi-mon', {
        khoaGui: khoaDon.current.id,
        phienSuaGio: gioDaChon.phienSua,
        maQrToken: thongTinBan?.token || thongTinBan?.ma_qr_token,
        banId: thongTinBan?.id,
        nguonTao: 'khach_qr'
      }, thamGia.headers);

      khoaDon.current = null;
      await napGio().then(nhanGio).catch(() => {});
      setTrangKhach('theoDoi');
    } catch (err) {
      alert(err.message || 'Không thể gửi đơn. Vui lòng thử lại.');
      await napGio().then(nhanGio).catch(() => {});
    } finally {
      dangGuiRef.current = false;
      setDangGuiDon(false);
    }
  };

  const [billKhach, setBillKhach] = useState(null);
  const [hoaDonKhach, setHoaDonKhach] = useState(null);
  const [loiThanhToan, setLoiThanhToan] = useState('');
  const [daYeuCau, setDaYeuCau] = useState(false);
  const dangXemThanhToan = ['yeuCauThanhToan', 'vietQr'].includes(trangKhach);
  const guiHoTro = (loaiYeuCau, noiDung) => {
    if (!banId || !tokenBan) throw new Error('Vui lòng quét mã QR tại bàn.');
    return api.post(`/api/ban-an/${banId}/ho-tro`, { loaiYeuCau, noiDung }, thamGia.headers);
  };

  useEffect(() => {
    if (phanHeHienTai !== 'khachHang' || !dangXemThanhToan || !banId || !tokenBan ||
      (!phienDangVao && !hoaDonKhach?.billToken)) return;
    let huy = false;
    let billToken = !phienDangVao || hoaDonKhach?.phien_ban_id === phienDangVao ? hoaDonKhach?.billToken : undefined;
    const socket = laySocket();
    const headers = thamGia.headers;
    const nap = async () => {
      try {
        const hd = await api.get(`/api/hoa-don/ban/${banId}/hoa-don`, { ...headers, ...(billToken ? { 'X-Bill-Token': billToken } : {}) });
        if (huy) return;
        if (hd?.trang_thai === 'da_huy') {
          billToken = undefined;
          setHoaDonKhach(null);
          setTrangKhach('yeuCauThanhToan');
        } else if (hd) {
          billToken = hd.billToken;
          setHoaDonKhach(hd);
          if (hd.trang_thai === 'da_thanh_toan') {
            setTrangKhach('thanhCong');
            return;
          }
        }
        const data = await api.get(`/api/hoa-don/tam-tinh/${banId}`, headers);
        if (!huy) setBillKhach(data);
      } catch (err) {
        if (!huy) setLoiThanhToan(err.message);
      }
    };
    const vaoPhong = () => {
      socket.emit('tham_gia_ban', banId, tokenBan, thamGia.khoa);
      nap();
    };
    const daThanhToan = () => nap();
    vaoPhong();
    socket.on('connect', vaoPhong);
    socket.on('thanh_toan_thanh_cong', daThanhToan);
    const henGio = setInterval(nap, 4000);
    return () => {
      huy = true;
      clearInterval(henGio);
      socket.off('connect', vaoPhong);
      socket.off('thanh_toan_thanh_cong', daThanhToan);
    };
  }, [phanHeHienTai, dangXemThanhToan, banId, tokenBan, phienDangVao, thamGia.khoa]);

  // PHÂN HỆ 1: KHÁCH HÀNG QR E-MENU (C01 - C14)
  function noiDungKhach() {
    if (trangKhach === 'chaoMung' || (['thanhCong', 'danhGia'].includes(trangKhach) && hoaDonKhach?.trang_thai !== 'da_thanh_toan')) {
      return (
        <TrangChaoMung
          ban={thongTinBan}
          onKhamPhaThucDon={() => setTrangKhach('thucDon')}
          onDangNhapNhanVien={() => onChuyenPhanHe('dangNhap')}
          onChuyenTab={chuyenTabKhach}
        />
      );
    }

    if (trangKhach === 'thucDon') {
      return (
        <TrangThucDon
          ban={thongTinBan}
          gioHang={gioHang}
          onThemVaoGio={handleThemVaoGio}
          onXemGioHang={() => setTrangKhach('gioHang')}
          onChuyenTab={chuyenTabKhach}
          onGoiHoTro={() => chuyenTabKhach('hoTro')}
        />
      );
    }

    if (trangKhach === 'gioHang') {
      return (
        <TrangGioHang
          ban={thongTinBan}
          gioHang={gioHang}
          onCapNhatSoLuong={handleCapNhatSoLuong}
          onSuaGhiChu={(item, ghiChu) => suaGio({ dongId: item.dongId, soLuong: item.so_luong, ghiChu })}
          onXoaMon={item => suaGio({ dongId: item.dongId, soLuong: 0 })}
          dangSuaGio={dangSuaGio}
          onQuayLaiThucDon={() => setTrangKhach('thucDon')}
          onGuiDon={handleGuiDon}
          dangGuiDon={dangGuiDon}
          loiGio={loiGio}
          onChuyenTab={chuyenTabKhach}
        />
      );
    }

    if (trangKhach === 'theoDoi' || trangKhach === 'hoTro') {
      return (
        <TrangTheoDoiMon
          ban={thongTinBan}
          khoaThietBi={thamGia.khoa}
          onGoiHoTro={req => guiHoTro('goi_phuc_vu', req.ten)}
          onYeuCauTinhTien={() => setTrangKhach('yeuCauThanhToan')}
          hoTroDangMo={trangKhach === 'hoTro'}
          onDongHoTro={() => setTrangKhach(trangTruocHoTro.current)}
          onChuyenTab={chuyenTabKhach}
        />
      );
    }

    if (trangKhach === 'yeuCauThanhToan' || (trangKhach === 'vietQr' && !hoaDonKhach?.vietQr)) {
      return (
        <TrangYeuCauThanhToanKhach
          ban={thongTinBan}
          bill={billKhach}
          loi={loiThanhToan}
          daYeuCau={daYeuCau}
          coVietQr={Boolean(hoaDonKhach?.vietQr)}
          onChuyenVietQr={() => setTrangKhach('vietQr')}
          onThanhToanTienMat={async () => {
            try {
              await guiHoTro('yeu_cau_thanh_toan', 'Khách yêu cầu lập hóa đơn');
              setLoiThanhToan('');
              setDaYeuCau(true);
            } catch (err) {
              setLoiThanhToan(err.message);
            }
          }}
          onQuayLaiTheoDoi={() => setTrangKhach('theoDoi')}
          onChuyenTab={chuyenTabKhach}
        />
      );
    }

    if (trangKhach === 'vietQr') {
      return (
        <TrangVietQrKhach
          ban={thongTinBan}
          tongTien={hoaDonKhach.tong_tien_thanh_toan}
          vietQr={hoaDonKhach.vietQr}
          onQuayLaiYeuCau={() => setTrangKhach('yeuCauThanhToan')}
          onChuyenTab={chuyenTabKhach}
        />
      );
    }

    if (trangKhach === 'thanhCong') {
      return (
        <TrangThanhToanThanhCong
          ban={thongTinBan}
          hoaDon={hoaDonKhach}
          onDanhGia={() => setTrangKhach('danhGia')}
          onVeTrangChu={() => setTrangKhach('chaoMung')}
        />
      );
    }

    if (trangKhach === 'danhGia') {
      return (
        <TrangDanhGiaDichVu
          ban={thongTinBan}
          onGuiDanhGia={data => api.post(`/api/hoa-don/ban/${banId}/danh-gia`, data, {
            ...thamGia.headers, 'X-Bill-Token': hoaDonKhach.billToken
          })}
          onVeTrangChu={() => setTrangKhach('chaoMung')}
        />
      );
    }
  }

  if (phanHeHienTai === 'khachHang') {
    const dangXemBienNhan = hoaDonKhach?.billToken &&
      (dangXemThanhToan || ['thanhCong', 'danhGia'].includes(trangKhach));
    if (banId && tokenBan && !daVaoBan && !dangXemBienNhan) {
      return <TrangThamGiaBan ban={thongTinBan} thamGia={thamGia} onDangNhap={() => onChuyenPhanHe('dangNhap')} />;
    }
    return <>{noiDungKhach()}{daVaoBan && <ThongBaoThamGia thamGia={thamGia} />}</>;
  }

  // PHÂN HỆ 2: NHÂN VIÊN PHỤC VỤ (W01 - W11)
  if (phanHeHienTai === 'phucVu') {
    if (!kiemTraQuyen(['phuc_vu', 'quan_ly'])) {
      return (
        <TrangDangNhap
          onQuayLaiMenuKhach={() => onChuyenPhanHe('khachHang')}
          thongBaoBatBuoc="Vui lòng đăng nhập tài khoản Phục vụ hoặc Quản lý"
          onDangNhapThanhCong={(user) => {
            setNguoiDung(user);
            if (user.vaiTro === 'quan_ly') onChuyenPhanHe('quanTri');
            else if (user.vaiTro === 'thu_ngan') onChuyenPhanHe('thuNgan');
            else if (user.vaiTro === 'bep') onChuyenPhanHe('bep');
            else onChuyenPhanHe('phucVu');
          }}
        />
      );
    }

    const thongTinNhanVienHienTai = {
      hoTen: nguoiDung?.hoTen || nguoiDung?.ho_ten || nguoiDung?.tenDangNhap || 'Lê Văn Minh',
      ca: nguoiDung?.ca || 'Ca tối',
      nhanVienId: nguoiDung?.nhanVienId || nguoiDung?.nhan_vien_id,
      vaiTro: nguoiDung?.vaiTro
    };

    const phaiVaoCa = nguoiDung?.vaiTro === 'phuc_vu' && !caHopLe?.caDangLam;
    if (!phaiVaoCa && trangPhucVu === 'chiTietBan' && banDangXem) {
      return (
        <TrangChiTietBan
          ban={banDangXem}
          nhanVien={thongTinNhanVienHienTai}
          onQuayLai={() => setTrangPhucVu('soDoBan')}
          onBaoThanhToan={() => api.put(`/api/ban-an/${banDangXem.id}/trang-thai`, { trangThai: 'yeu_cau_thanh_toan' }).then(() => setTrangPhucVu('soDoBan')).catch(err => alert(err.message))}
        />
      );
    }

    if (trangPhucVu === 'caLamViec' || phaiVaoCa) {
      return (
        <TrangCaLamViecNhanVien
          nhanVien={thongTinNhanVienHienTai}
          onQuayLai={() => setTrangPhucVu('soDoBan')}
          onChuyenTab={tab => { if (!phaiVaoCa || tab === 'caLamViec') setTrangPhucVu(tab); }}
          onDangXuat={handleDangXuat}
          sauDiemDanh={napTrangThaiCa}
          trangThaiCa={caHopLe}
          loiTaiCa={phaiVaoCa ? loiTaiCa || 'Xác nhận vào ca để xem sơ đồ bàn.' : loiTaiCa}
        />
      );
    }

    return (
      <TrangSoDoBan
        nhanVien={thongTinNhanVienHienTai}
        onChonBan={(ban) => {
          setBanDangXem(ban);
          setTrangPhucVu('chiTietBan');
        }}
        onChuyenTab={(tab) => setTrangPhucVu(tab)}
        onDangXuat={handleDangXuat}
      />
    );
  }

  // PHÂN HỆ 3: BẾP THÔNG MINH KDS (K01 - K06)
  if (phanHeHienTai === 'bep') {
    if (!kiemTraQuyen(['bep', 'quan_ly'])) {
      return (
        <TrangDangNhap
          onQuayLaiMenuKhach={() => onChuyenPhanHe('khachHang')}
          thongBaoBatBuoc="Vui lòng đăng nhập tài khoản Bếp KDS hoặc Quản lý"
          onDangNhapThanhCong={(user) => {
            setNguoiDung(user);
            if (user.vaiTro === 'quan_ly') onChuyenPhanHe('quanTri');
            else if (user.vaiTro === 'thu_ngan') onChuyenPhanHe('thuNgan');
            else if (user.vaiTro === 'bep') onChuyenPhanHe('bep');
            else onChuyenPhanHe('phucVu');
          }}
        />
      );
    }

    return (
      <TrangKdsBep
        ca={thongTinCa.ca}
        onDangXuat={handleDangXuat}
      />
    );
  }

  // PHÂN HỆ 4: THU NGÂN POS DESKTOP (P01 - P09)
  if (phanHeHienTai === 'thuNgan') {
    if (!kiemTraQuyen(['thu_ngan', 'quan_ly'])) {
      return (
        <TrangDangNhap
          onQuayLaiMenuKhach={() => onChuyenPhanHe('khachHang')}
          thongBaoBatBuoc="Vui lòng đăng nhập tài khoản Thu ngân hoặc Quản lý"
          onDangNhapThanhCong={(user) => {
            setNguoiDung(user);
            if (user.vaiTro === 'quan_ly') onChuyenPhanHe('quanTri');
            else if (user.vaiTro === 'thu_ngan') onChuyenPhanHe('thuNgan');
            else if (user.vaiTro === 'bep') onChuyenPhanHe('bep');
            else onChuyenPhanHe('phucVu');
          }}
        />
      );
    }

    const phaiVaoCa = nguoiDung?.vaiTro === 'thu_ngan' && !caHopLe?.caDangLam;
    if (trangPhucVu === 'caLamViec' || phaiVaoCa) {
      return <TrangCaLamViecNhanVien nhanVien={nguoiDung} onDangXuat={handleDangXuat}
        onChuyenTab={tab => { if (!phaiVaoCa && tab !== 'caLamViec') setTrangPhucVu('soDoBan'); }}
        sauDiemDanh={napTrangThaiCa} trangThaiCa={caHopLe}
        loiTaiCa={phaiVaoCa ? loiTaiCa || 'Xác nhận vào ca để xem sơ đồ bàn.' : loiTaiCa} />;
    }
    return <TrangPosKiemBill nhanVien={thongTinCa} onDangXuat={handleDangXuat} onMoCaLamViec={moCaLamViec} />;
  }

  // PHÂN HỆ 5: QUẢN TRỊ NHÀ HÀNG ADMIN (A01 - A20)
  if (phanHeHienTai === 'quanTri') {
    if (!kiemTraQuyen(['quan_ly'])) {
      return (
        <TrangDangNhap
          onQuayLaiMenuKhach={() => onChuyenPhanHe('khachHang')}
          thongBaoBatBuoc="Quyền truy cập bị từ chối: Cần tài khoản Quản trị viên (Admin)"
          onDangNhapThanhCong={(user) => {
            setNguoiDung(user);
            if (user.vaiTro === 'quan_ly') onChuyenPhanHe('quanTri');
            else if (user.vaiTro === 'thu_ngan') onChuyenPhanHe('thuNgan');
            else if (user.vaiTro === 'bep') onChuyenPhanHe('bep');
            else onChuyenPhanHe('phucVu');
          }}
        />
      );
    }

    return (
      <TrangQuanTri
        nhanVien={thongTinCa}
        onDangXuat={handleDangXuat}
      />
    );
  }

  // ĐĂNG NHẬP CHUNG
  return (
    <TrangDangNhap
      onQuayLaiMenuKhach={() => onChuyenPhanHe('khachHang')}
      onDangNhapThanhCong={(user) => {
        setNguoiDung(user);
        if (user.vaiTro === 'quan_ly') onChuyenPhanHe('quanTri');
        else if (user.vaiTro === 'thu_ngan') onChuyenPhanHe('thuNgan');
        else if (user.vaiTro === 'bep') onChuyenPhanHe('bep');
        else onChuyenPhanHe('phucVu');
      }}
    />
  );
}
