// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// C05 · THEO DÕI MÓN (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Flame, AlertCircle, PhoneCall, Receipt, Sparkles } from 'lucide-react';
import HeaderKhach from '../../thanhPhan/HeaderKhach';
import DieuHuongDuoiKhach from '../../thanhPhan/DieuHuongDuoiKhach';
import ModalGoiHoTro from './ModalGoiHoTro';
import ModalXacNhan from '../../thanhPhan/ModalXacNhan';
import { dinhDangTien } from '../../dungChung/dinhDang';

import { api } from "../../dungChung/api";
import { laySocket } from "../../dungChung/ketNoiSocket";

export default function TrangTheoDoiMon({
  ban = { ma_ban: 'B08', ten_ban: 'Bàn 08' },
  khoaThietBi,
  onYeuCauTinhTien,
  onChuyenTab,
  onGoiHoTro,
  hoTroDangMo = false,
  onDongHoTro
}) {
  const [hienModalHoTro, setHienModalHoTro] = useState(false);

  const [chiTiet, setChiTiet] = useState([]);
  const [loi, setLoi] = useState('');
  const [monYeuCauHuy, setMonYeuCauHuy] = useState(null);
  const [lyDoHuy, setLyDoHuy] = useState('');
  const [loiHuy, setLoiHuy] = useState('');
  const [dangGuiHuy, setDangGuiHuy] = useState(false);
  const [daNhoPhucVu, setDaNhoPhucVu] = useState([]);

  const guiYeuCauHuy = async () => {
    if (dangGuiHuy || !monYeuCauHuy) return;
    if (!lyDoHuy.trim()) {
      setLoiHuy('Vui lòng nhập lý do hủy.');
      return;
    }
    setDangGuiHuy(true);
    try {
      if (monYeuCauHuy.coQuyenYeuCauHuy) {
        await api.post(`/api/don-goi-mon/ban/${ban.id}/chi-tiet/${monYeuCauHuy.id}/yeu-cau-huy`, { lyDo: lyDoHuy }, {
          'X-Table-Token': ban.token, 'X-Device-Key': khoaThietBi
        });
        setChiTiet(cu => cu.map(mon => mon.id === monYeuCauHuy.id ? {
          ...mon, coQuyenYeuCauHuy: false, trang_thai_huy_khach: 'cho_phuc_vu'
        } : mon));
      } else {
        const { id, ten_mon, so_luong, ma_don } = monYeuCauHuy;
        await onGoiHoTro({ ten: `Nhờ kiểm tra hủy món ${ten_mon} × ${so_luong} · ${ma_don} · ${lyDoHuy.trim()}`.slice(0, 300) });
        setDaNhoPhucVu(cu => [...cu, id]);
      }
      setMonYeuCauHuy(null);
    } catch (err) {
      setLoiHuy(err.message);
    } finally {
      setDangGuiHuy(false);
    }
  };

  const thaoTacHuy = mon => (
    <>
      {mon.trang_thai_huy_khach === 'cho_phuc_vu' &&
        <p role="status" className="mt-1 text-xs font-medium text-amber-800">Đang chờ phục vụ xử lý hủy</p>}
      {mon.trang_thai_huy_khach === 'tu_choi' &&
        <p className="mt-1 text-xs text-stone-600">Yêu cầu hủy đã bị từ chối</p>}
      {daNhoPhucVu.includes(mon.id) && (
        <p role="status" className="mt-1 text-xs font-medium text-amber-800">Đã nhờ phục vụ kiểm tra</p>
      )}
      {mon.xu_ly_pos && <p className="mt-1 text-xs text-stone-600">
        {mon.xu_ly_pos === 'goi_mang_ve' ? 'Gói mang về' : 'Đã ghi nhận không lấy món'}
      </p>}
      {!mon.xu_ly_pos && mon.trang_thai_huy_khach !== 'cho_phuc_vu' && !daNhoPhucVu.includes(mon.id) && (
        <button type="button" className="mt-1 text-xs font-semibold text-rose-700 underline"
          aria-label={`${mon.coQuyenYeuCauHuy ? 'Yêu cầu hủy' : 'Nhờ phục vụ hủy'} ${mon.ten_mon}`} onClick={() => {
            setLyDoHuy('');
            setLoiHuy('');
            setMonYeuCauHuy(mon);
          }}>{mon.coQuyenYeuCauHuy ? 'Yêu cầu hủy' : 'Nhờ phục vụ hủy'}</button>
      )}
    </>
  );

  useEffect(() => {
    if (!ban?.id || !ban.token) return;
    let lanTai = 0;
    const socket = laySocket();
    const tai = async () => {
      const lan = ++lanTai;
      try {
        const data = await api.get(`/api/don-goi-mon/ban/${ban.id}`, { 'X-Table-Token': ban.token, 'X-Device-Key': khoaThietBi });
        if (lan !== lanTai) return;
        setChiTiet(data.danhSachMon.map(mon => ({
          ...mon, id: mon.chi_tiet_id, trang_thai: mon.trang_thai_mon
        })));
        setLoi('');
      } catch (err) {
        if (lan === lanTai) setLoi(err.message);
      }
    };
    const thamGia = () => {
      socket.emit('tham_gia_ban', ban.id, ban.token, khoaThietBi);
      tai();
    };
    thamGia();
    const suKien = ['tien_do_mon_an', 'trang_thai_don_hang', 'thanh_toan_thanh_cong'];
    suKien.forEach(ten => socket.on(ten, tai));
    socket.on('connect', thamGia);
    const henGio = setInterval(tai, 15000);
    return () => {
      lanTai++;
      clearInterval(henGio);
      suKien.forEach(ten => socket.off(ten, tai));
      socket.off('connect', thamGia);
    };
  }, [ban?.id, ban?.token, khoaThietBi]);

  // Phân nhóm trạng thái món
  const monChoDuyet = chiTiet.filter(m => m.trang_thai === 'cho_duyet' && m.trang_thai_don === 'cho_duyet');
  const monDangNau = chiTiet.filter(m => m.trang_thai === 'dang_nau' || (m.trang_thai === 'cho_duyet' && m.trang_thai_don === 'da_duyet'));
  const monDaPhucVu = chiTiet.filter(m => m.trang_thai === 'da_phuc_vu');
  const monChoBung = chiTiet.filter(m => m.trang_thai === 'hoan_thanh');

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#f9f7f2] flex flex-col justify-between pb-28 shadow-xl border-x border-[#272d29]/5">
      {/* Header chuẩn Figma */}
      <HeaderKhach
        tieuDe="Theo dõi món"
        ban={ban}
        onMoThongBao={() => setHienModalHoTro(true)}
      />

      <main className="px-5 py-4 flex-1 space-y-4">
        {loi && <p role="alert" className="text-red-700">{loi}</p>}
        {!chiTiet.length && !loi && <p>Chưa có món trong phiên bàn hiện tại.</p>}
        {chiTiet.some(mon => ['da_huy', 'huy_mon', 'yeu_cau_huy'].includes(mon.trang_thai)) && (
          <ul className="text-sm text-stone-700">
            {chiTiet.filter(mon => ['da_huy', 'huy_mon', 'yeu_cau_huy'].includes(mon.trang_thai)).map(mon => (
              <li key={mon.id}>{mon.ten_mon} · {mon.trang_thai === 'yeu_cau_huy' ? 'Đang chờ quản lý duyệt hủy' : 'Đã hủy'}
                {mon.trang_thai !== 'yeu_cau_huy' && <button className="ml-2 underline" onClick={() => onChuyenTab('thucDon')}>Chọn món khác</button>}</li>
            ))}
          </ul>
        )}

        {/* Danh sách các nhóm trạng thái món */}

        {/* 1. Đang chờ duyệt */}
        {monChoDuyet.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#795c21]">
              <Clock size={15} />
              <span>Chờ nhân viên duyệt ({monChoDuyet.length})</span>
            </div>
            {monChoDuyet.map((m) => (
              <div
                key={m.id}
                className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#272d29]">{m.ten_mon} × {m.so_luong}</h4>
                  <p className="text-[11px] text-[#795c21] mt-0.5">Đang đợi phục vụ xác nhận chuyển bếp</p>
                  {thaoTacHuy(m)}
                </div>
                <span className="text-xs font-semibold text-[#795c21]">Chờ duyệt</span>
              </div>
            ))}
          </div>
        )}

        {/* 2. Đang nấu */}
        {monDangNau.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#b64d2d]">
              <Flame size={15} />
              <span>Đã chuyển bếp ({monDangNau.length})</span>
            </div>
            {monDangNau.map((m) => (
              <div
                key={m.id}
                className="bg-white border border-[#b64d2d]/20 rounded-xl p-3.5 shadow-xs flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#272d29]">{m.ten_mon} × {m.so_luong}</h4>
                  {m.ghi_chu && <p className="text-[11px] text-[#72776f] mt-0.5 italic">{m.ghi_chu}</p>}
                  {thaoTacHuy(m)}
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-[#f9ede6] text-[#b64d2d] rounded text-[11px] font-bold">
                    {m.trang_thai === 'cho_duyet' ? 'Chờ nấu' : 'Đang nấu'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Hoàn thành & Đã phục vụ */}
        {[
          { id: 'choBung', mon: monChoBung, tieuDe: 'Bếp đã nấu xong', ghiChu: 'Chờ phục vụ mang ra', trangThai: 'Chờ bưng' },
          { id: 'daPhucVu', mon: monDaPhucVu, tieuDe: 'Đã hoàn thành & lên bàn', ghiChu: 'Đã phục vụ tại bàn', trangThai: 'Đã lên bàn' }
        ].filter(nhom => nhom.mon.length > 0).map(nhom => (
          <div key={nhom.id} className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#226b4c]">
              <CheckCircle2 size={15} />
              <span>{nhom.tieuDe} ({nhom.mon.length})</span>
            </div>
            {nhom.mon.map((m) => (
              <div
                key={m.id}
                className="bg-white border border-stone-200 rounded-xl p-3.5 flex items-center justify-between opacity-80"
              >
                <div>
                  <h4 className="text-sm font-semibold text-[#272d29]">{m.ten_mon} × {m.so_luong}</h4>
                  <p className="text-[11px] text-[#72776f] mt-0.5">{m.ghi_chu || nhom.ghiChu}</p>
                  {thaoTacHuy(m)}
                </div>
                <span className="text-xs font-bold text-[#226b4c] bg-[#ebf4ed] px-2 py-0.5 rounded">
                  {nhom.trangThai}
                </span>
              </div>
            ))}
          </div>
        ))}

        {/* Các nút gọi dịch vụ tại chỗ */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          <button
            onClick={() => setHienModalHoTro(true)}
            className="py-3 px-3 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-[#272d29] flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <PhoneCall size={15} className="text-[#795c21]" />
            <span>Gọi hỗ trợ</span>
          </button>

          <button
            onClick={onYeuCauTinhTien}
            className="py-3 px-3 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Receipt size={15} />
            <span>Yêu cầu tính tiền</span>
          </button>
        </div>
      </main>

      {/* Điều hướng cuối */}
      <DieuHuongDuoiKhach
        tabHienTai={hoTroDangMo ? 'hoTro' : 'monDaGoi'}
        onChuyenTab={onChuyenTab}
        soLuongMonDangCho={monDangNau.length + monChoDuyet.length}
      />

      {/* Modal C07 Gọi hỗ trợ */}
      {(hienModalHoTro || hoTroDangMo) && (
        <ModalGoiHoTro
          ban={ban}
          onDong={() => {
            setHienModalHoTro(false);
            if (hoTroDangMo) onDongHoTro();
          }}
          onGuiYeuCau={onGoiHoTro}
        />
      )}

      {monYeuCauHuy && (
        <ModalXacNhan hienThi tieuDe={monYeuCauHuy.coQuyenYeuCauHuy ? 'Yêu cầu hủy món' : 'Nhờ phục vụ kiểm tra hủy món'} phanLoai={ban.ten_ban}
          noiDung={<>
            <p>{monYeuCauHuy.ten_mon} × {monYeuCauHuy.so_luong}</p>
            <label htmlFor="ly-do-huy-khach" className="mt-2 block">Lý do hủy</label>
            <textarea id="ly-do-huy-khach" className="mt-1 w-full rounded-lg border bg-white p-2"
              value={lyDoHuy} maxLength={300} rows={3} onChange={event => setLyDoHuy(event.target.value)} />
          </>}
          canhBaoPhu={monYeuCauHuy.coQuyenYeuCauHuy ? undefined : 'Phục vụ sẽ xác minh món trước khi xử lý.'}
          loi={loiHuy} dangXuLy={dangGuiHuy} nhanNutXacNhan={monYeuCauHuy.coQuyenYeuCauHuy ? 'Gửi yêu cầu hủy' : 'Gọi phục vụ'}
          onHuy={() => setMonYeuCauHuy(null)} onXacNhan={guiYeuCauHuy} />
      )}
    </div>
  );
}
