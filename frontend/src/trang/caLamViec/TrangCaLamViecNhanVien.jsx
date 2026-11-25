// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// W11 · CA LÀM VÀ YÊU CẦU NGHỈ (430x980) - CHUẨN THIẾT KẾ FIGMA QUÁN MỘC
// KẾT NỐI 100% CSDL BACKEND SQLITE & TẠO PHIẾU ĐỔI CA THỜI GIAN THỰC
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Send, RefreshCw, X, ArrowRight } from 'lucide-react';
import HeaderNhanVien from '../../thanhPhan/HeaderNhanVien';
import { api } from '../../dungChung/api';
import { laySocket } from '../../dungChung/ketNoiSocket';
import { hienThiGioVietNam, ngayVietNam, trongKhungGioCa } from '../../dungChung/thoiGian';

export default function TrangCaLamViecNhanVien({
  nhanVien = { hoTen: 'Lê Văn Minh', ca: 'Ca tối' },
  onQuayLai,
  onChuyenTab,
  onDangXuat,
  sauDiemDanh,
  trangThaiCa,
  loiTaiCa
}) {
  const [loaiYeuCau, setLoaiYeuCau] = useState('doi_ca'); // 'nghi_ca' | 'doi_ca'
  const [caChonId, setCaChonId] = useState('');
  const [nhanVienNhanCaId, setNhanVienNhanCaId] = useState('');
  const [lyDo, setLyDo] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const [thongBao, setThongBao] = useState(null);

  // Dữ liệu từ API
  const [lichCaNhan, setLichCaNhan] = useState([]);
  const [dongNghiep, setDongNghiep] = useState([]);
  const [dangTai, setDangTai] = useState(false);
  const [ketQuaYeuCau, setKetQuaYeuCau] = useState([]);

  const showToast = (noiDung, loai = 'thanhCong') => {
    setThongBao({ noiDung, loai });
    setTimeout(() => setThongBao(null), 4000);
  };

  const taiLichCa = async () => {
    const lich = await api.get('/api/ca-lam-viec/lich-ca-nhan');
    if (Array.isArray(lich)) {
      const lichHienThi = lich.filter(ca => ca.trang_thai !== 'da_huy');
      setLichCaNhan(lichHienThi);
      setCaChonId(id => lichHienThi.some(ca => Number(ca.id) === Number(id)) ? id : (lichHienThi[0]?.id || ''));
    }
  };

  const taiDuLieu = async () => {
    setDangTai(true);
    try {
      await taiLichCa();
      setKetQuaYeuCau(await api.get('/api/ca-lam-viec/yeu-cau-doi-ca'));

      // 2. Tải danh sách đồng nghiệp để chọn người đổi ca cùng
      const resNv = await api.get('/api/ca-lam-viec/dong-nghiep');
      if (Array.isArray(resNv)) {
        const nguoiDungHienTai = api.layNguoiDung();
        const khacMinh = resNv.filter(n => n.id !== (nguoiDungHienTai?.nhanVienId || nguoiDungHienTai?.nhan_vien_id));
        setDongNghiep(khacMinh);
        if (khacMinh.length > 0 && !nhanVienNhanCaId) {
          setNhanVienNhanCaId(khacMinh[0].id);
        }
      }
    } catch (err) {
      console.warn('Lỗi tải dữ liệu ca làm:', err.message);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
    const socket = laySocket();
    const nhan = data => {
      showToast((data.loaiYeuCau === 'doi_ca' ? 'Yêu cầu đổi ca' : 'Yêu cầu nghỉ ca') +
        (['da_duyet', 'da_chap_thuan'].includes(data.trangThai) ? ' đã được chấp thuận.' : ' đã bị từ chối.'));
      taiDuLieu();
      sauDiemDanh?.();
    };
    socket.on('ket_qua_duyet_ca', nhan);
    socket.on('connect', taiDuLieu);
    socket.on('ca_lam_viec:thay_doi', taiDuLieu);
    const henCapNhatLich = setInterval(() => taiLichCa().catch(() => {}), 15000);
    return () => {
      clearInterval(henCapNhatLich);
      socket.off('ket_qua_duyet_ca', nhan);
      socket.off('connect', taiDuLieu);
      socket.off('ca_lam_viec:thay_doi', taiDuLieu);
    };
  }, []);

  const handleGuiYeuCau = async (e) => {
    e.preventDefault();
    if (!caChonId) {
      showToast('Vui lòng chọn ca làm việc cần đổi / xin nghỉ', 'loi');
      return;
    }
    if (!lyDo.trim()) {
      showToast('Vui lòng nhập lý do cụ thể', 'loi');
      return;
    }

    setDangGui(true);
    try {
      await api.post('/api/ca-lam-viec/yeu-cau-doi-ca', {
        caLamViecId: Number(caChonId),
        loaiYeuCau: loaiYeuCau === 'xin_nghi' ? 'nghi_ca' : 'doi_ca',
        nhanVienNhanCaId: loaiYeuCau === 'doi_ca' ? Number(nhanVienNhanCaId) : null,
        lyDo: lyDo.trim()
      });

      showToast('Đã gửi yêu cầu đổi/nghỉ ca thành công tới Quản lý xét duyệt!');
      setLyDo('');
      taiDuLieu();
    } catch (err) {
      showToast('Lỗi gửi yêu cầu: ' + err.message, 'loi');
    } finally {
      setDangGui(false);
    }
  };

  // Ca hiện tại hôm nay (nếu có)
  const [dangDiemDanh, setDangDiemDanh] = useState(false);
  const diemDanh = async (ca) => {
    if (dangDiemDanh) return;
    setDangDiemDanh(true);
    const action = ca?.trang_thai === 'ke_hoach' ? 'checkin' : 'checkout';
    try {
      await api.put(`/api/ca-lam-viec/${ca.id}/${action}`);
      await sauDiemDanh?.();
      await taiDuLieu();
    } catch (err) {
      setThongBao({ noiDung: err.message, loai: 'loi' });
    } finally {
      setDangDiemDanh(false);
    }
  };

  const gioMayChu = trangThaiCa?.thoiGianMayChu ?? Date.now();
  const homNay = ngayVietNam(gioMayChu);
  const caHomNay = trangThaiCa?.caDangLam || lichCaNhan.find(c => c.ngay_lam === homNay);

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#f9f7f2] flex flex-col justify-between pb-8 shadow-xl border-x border-[#272d29]/5">
      <HeaderNhanVien
        tieuDe="Ca làm và yêu cầu nghỉ"
        nhanVien={nhanVien}
        tabHienTai="caLamViec"
        onChuyenTab={tab => tab === 'thongBao'
          ? document.getElementById('thongBaoCaLam')?.scrollIntoView({ block: 'center' }) : onChuyenTab?.(tab)}
        onDangXuat={onDangXuat}
      />

      <main className="px-4 py-3 space-y-4 flex-1">
        {loiTaiCa && <p role="alert" className="text-sm text-rose-700">{loiTaiCa}</p>}
        <section id="thongBaoCaLam" className="rounded-xl bg-white p-4 text-sm">
          <h2 className="font-bold">Thông báo ca làm</h2>
          {ketQuaYeuCau.filter(y => y.trang_thai !== 'cho_duyet').length ? (
            <ul>{ketQuaYeuCau.filter(y => y.trang_thai !== 'cho_duyet').map(y => (
              <li key={y.id} className="mt-2">{y.loai_yeu_cau === 'doi_ca' ? 'Đổi ca' : 'Xin nghỉ ca'} ·
                {['da_duyet', 'da_chap_thuan'].includes(y.trang_thai) ? ' Đã chấp thuận' : ' Đã từ chối'}
                {y.ly_do ? ' · ' + y.ly_do : ''} · {hienThiGioVietNam(y.ngay_duyet)}</li>
            ))}</ul>
          ) : <p>Chưa có thông báo ca làm.</p>}
        </section>
        {/* Toast thông báo */}
        {thongBao && (
          <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-bold shadow-md ${
            thongBao.loai === 'thanhCong' ? 'bg-[#ebf4ed] text-[#226b4c] border border-[#226b4c]/30' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <span>{thongBao.noiDung}</span>
            <button onClick={() => setThongBao(null)} className="p-0.5">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Ca hiện tại đang làm việc */}
        <div className="bg-[#2d4336] text-white rounded-2xl p-4 shadow-sm border border-[#2d4336]">
          <span className="text-[11px] font-bold text-emerald-200 tracking-wider uppercase block mb-1">
            CA LÀM VIỆC CỦA BẠN
          </span>
          {caHomNay ? (
            <>
              <h2 className="text-lg font-bold">
                {caHomNay.ten_ca === 'ca_sang' ? 'Ca sáng' : caHomNay.ten_ca === 'ca_chieu' ? 'Ca chiều' : 'Ca tối'} · {caHomNay.gio_bat_dau} – {caHomNay.gio_ket_thuc}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#d8ead9] mt-1.5">
                <span className={`w-2 h-2 rounded-full ${caHomNay.trang_thai === 'da_checkin' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span>Trạng thái: {caHomNay.trang_thai === 'da_checkin' ? 'Đã Check-in' : caHomNay.trang_thai === 'ke_hoach' ? 'Theo kế hoạch' : 'Hoàn thành'}</span>
                <span className="text-white/40">·</span>
                <span>Ngày {caHomNay.ngay_lam}</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-emerald-100">Hôm nay bạn không có ca làm việc được phân công.</p>
          )}
        </div>

        {/* Lịch làm việc trong tuần */}
        <div className="bg-white rounded-2xl p-4 border border-[#272d29]/10 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-[#272d29] uppercase">
              Lịch phân ca cá nhân ({lichCaNhan.length} ca)
            </h3>
            <button onClick={taiDuLieu} className="text-stone-400 hover:text-stone-700">
              <RefreshCw size={13} className={dangTai ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="space-y-2 text-xs max-h-56 overflow-y-auto">
            {lichCaNhan.length === 0 ? (
              <p className="text-stone-400 italic text-center py-4">Chưa có ca làm việc nào được phân công.</p>
            ) : (
              lichCaNhan.map((l) => {
                const laHomNay = l.ngay_lam === homNay;
                const tenCaTxt = l.ten_ca === 'ca_sang' ? 'Ca sáng' : l.ten_ca === 'ca_chieu' ? 'Ca chiều' : 'Ca tối';
                return (
                  <div
                    key={l.id}
                    className={`p-2.5 rounded-xl flex items-center justify-between border ${
                      laHomNay
                        ? 'bg-[#f9ede6] border-[#b64d2d] text-[#b64d2d] font-bold'
                        : 'bg-stone-50 border-stone-200 text-[#272d29]'
                    }`}
                  >
                    <div>
                      <span className="font-bold">{l.ngay_lam}: </span>
                      <span>{tenCaTxt} ({l.gio_bat_dau}–{l.gio_ket_thuc})</span>
                      {l.ghi_chu && <p className="text-[10px] text-stone-500 font-normal">{l.ghi_chu}</p>}
                      {l.thoi_gian_checkin && <p>Vào ca {hienThiGioVietNam(l.thoi_gian_checkin)}</p>}
                      {l.thoi_gian_checkout && <p>Hết ca {hienThiGioVietNam(l.thoi_gian_checkout)}</p>}
                    </div>
                    {(laHomNay || trongKhungGioCa(l, gioMayChu) || l.trang_thai === 'da_checkin') &&
                      ['ke_hoach', 'da_checkin'].includes(l.trang_thai) && (
                        <button disabled={dangDiemDanh || (l.trang_thai === 'ke_hoach' && !trongKhungGioCa(l, gioMayChu))} onClick={() => diemDanh(l)}
                          className="text-[10px] bg-[#b64d2d] text-white px-2 py-1 rounded-full disabled:opacity-50">
                          {l.trang_thai === 'ke_hoach' ? 'Vào ca' : 'Hết ca'}
                        </button>
                      )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Form gửi yêu cầu đổi ca / xin nghỉ */}
        <form onSubmit={handleGuiYeuCau} className="bg-white rounded-2xl p-4 border border-[#272d29]/10 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#272d29] uppercase">
            Tạo yêu cầu đổi ca / xin nghỉ (A07)
          </h3>

          {/* Tab chọn loại yêu cầu */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLoaiYeuCau('doi_ca')}
              className={`py-1.5 rounded-lg transition-all ${
                loaiYeuCau === 'doi_ca' ? 'bg-white text-[#272d29] shadow-xs font-bold' : 'text-[#72776f]'
              }`}
            >
              Đổi ca làm việc
            </button>
            <button
              type="button"
              onClick={() => setLoaiYeuCau('xin_nghi')}
              className={`py-1.5 rounded-lg transition-all ${
                loaiYeuCau === 'xin_nghi' ? 'bg-white text-[#272d29] shadow-xs font-bold' : 'text-[#72776f]'
              }`}
            >
              Xin nghỉ ca
            </button>
          </div>

          <div className="text-xs space-y-2.5">
            {/* Chọn ca làm việc muốn đổi / nghỉ */}
            <div>
              <label className="block text-[11px] font-bold text-[#272d29] mb-1">
                CHỌN CA LÀM VIỆC CẦN {loaiYeuCau === 'doi_ca' ? 'ĐỔI' : 'NGHỈ'} *
              </label>
              <select
                value={caChonId}
                onChange={(e) => setCaChonId(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[#272d29] font-medium"
              >
                {lichCaNhan.map(c => (
                  <option key={c.id} value={c.id}>
                    Ngày {c.ngay_lam} - {c.ten_ca} ({c.gio_bat_dau}–{c.gio_ket_thuc})
                  </option>
                ))}
              </select>
            </div>

            {loaiYeuCau === 'doi_ca' && (
              <div>
                <label className="block text-[11px] font-bold text-[#272d29] mb-1">
                  ĐỒNG NGHIỆP NHẬN CA THAY THẾ *
                </label>
                <select
                  value={nhanVienNhanCaId}
                  onChange={(e) => setNhanVienNhanCaId(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[#272d29] font-medium"
                >
                  {dongNghiep.map(nv => (
                    <option key={nv.id} value={nv.id}>
                      {nv.ho_ten} ({nv.ten_vai_tro || nv.ma_vai_tro})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#272d29] mb-1">
                LÝ DO CỤ THỂ *
              </label>
              <textarea
                value={lyDo}
                onChange={(e) => setLyDo(e.target.value)}
                placeholder="Nhập lý do gửi Quản lý xét duyệt..."
                required
                rows={2}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[#272d29]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={dangGui}
            className="w-full py-3 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send size={15} />
            <span>{dangGui ? 'Đang gửi...' : 'Gửi yêu cầu tới Quản lý'}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
