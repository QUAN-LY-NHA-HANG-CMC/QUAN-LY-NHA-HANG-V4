// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// KDS BẾP THÔNG MINH (K01 - K06) - 100% CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, CheckCircle2, Flame, AlertTriangle, Layers, RotateCcw, Volume2, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import HeaderBep from '../../thanhPhan/HeaderBep';
import ModalChiDaoGapBatBuoc from './ModalChiDaoGapBatBuoc';
import ModalDeNghiUuTien from './ModalDeNghiUuTien';
import { laySocket } from '../../dungChung/ketNoiSocket';
import { api } from '../../dungChung/api';
import { dinhDangGio } from '../../dungChung/dinhDang';
import { hienThiGioVietNam } from '../../dungChung/thoiGian';

export default function TrangKdsBep({ ca, onDangXuat }) {
  const [tabHienTai, setTabHienTai] = useState('theoBan'); // 'theoBan' | 'gomMon' | 'daLamXong' | 'trangThaiMon'
  const [tramHienTai, setTramHienTai] = useState('bepNong');
  const [amThanhBao, setAmThanhBao] = useState(false);
  const audio = useRef(null);
  const [hienChiDaoKhanCap, setHienChiDaoKhanCap] = useState(false);
  const [chiDaoHienTai, setChiDaoHienTai] = useState(null);
  const [hienDeNghiUuTien, setHienDeNghiUuTien] = useState(false);
  const [deNghiUuTienData, setDeNghiUuTienData] = useState(null);

  // Lắng nghe lệnh điều phối thời gian thực từ Quản lý gửi tới Bếp
  useEffect(() => {
    const socket = laySocket();
    if (!socket) return;

    // Tham gia phòng bếp
    socket.emit('tham_gia_vai_tro', 'bep');

    const handleDieuPhoiMoi = (duLieu) => {
      if (duLieu.boPhan === 'bep' || duLieu.boPhan === 'tat_ca') {
        setChiDaoHienTai(duLieu);
        setHienChiDaoKhanCap(true);
      }
    };

    const handleDeNghiGiucMon = (duLieu) => {
      setDeNghiUuTienData(duLieu);
      setHienDeNghiUuTien(true);
    };

    socket.on('dieu_phoi:bep', handleDieuPhoiMoi);
    socket.on('dieu_phoi:moi', handleDieuPhoiMoi);
    socket.on('bep:co_de_nghi_giuc_mon', handleDeNghiGiucMon);

    return () => {
      socket.off('dieu_phoi:bep', handleDieuPhoiMoi);
      socket.off('dieu_phoi:moi', handleDieuPhoiMoi);
      socket.off('bep:co_de_nghi_giuc_mon', handleDeNghiGiucMon);
    };
  }, []);

  const [duLieu, setDuLieu] = useState({ phieu: [], gom: [], mon: [], xong: [] });
  const [loi, setLoi] = useState('');
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const yeuCau = useRef(0);
  const taiDuLieu = useCallback(async () => {
    const id = ++yeuCau.current;
    try {
      const [hangDoi, gom, daXong, thucDon] = await Promise.all([
        api.get('/api/dieu-phoi-bep/hang-doi'),
        api.get('/api/dieu-phoi-bep/hang-doi?cheDo=gom_mon'),
        api.get('/api/dieu-phoi-bep/da-hoan-thanh'),
        api.get('/api/thuc-don')
      ]);
      if (id !== yeuCau.current) return;
      const phieu = new Map();
      for (const mon of hangDoi) {
        if (!phieu.has(mon.don_goi_mon_id)) {
          phieu.set(mon.don_goi_mon_id, {
            id: mon.don_goi_mon_id,
            ma_ban: mon.ma_ban,
            ma_don: mon.ma_don,
            thoi_gian_tao: mon.thoi_gian_gui,
            thoi_gian_cho_phut: mon.so_phut_cho,
            mon_an: []
          });
        }
        phieu.get(mon.don_goi_mon_id).mon_an.push({
          ...mon, id: mon.chi_tiet_id, trang_thai: mon.trang_thai_mon
        });
      }
      setDuLieu({
        phieu: [...phieu.values()],
        gom: gom.map(nhom => ({
          ...nhom,
          chi_tiet: hangDoi.filter(mon => mon.mon_an_id === nhom.mon_an_id).map(mon => ({
            ...mon, ban: mon.ma_ban, thoi_gian_cho: `${mon.so_phut_cho}p`
          }))
        })),
        xong: daXong.map(mon => ({
          ...mon, id: mon.chi_tiet_id, ban: mon.ma_ban,
          thoi_gian_xong: mon.thoi_gian_hoan_thanh_nau,
          phuc_vu: mon.dau_bep_nau, da_bung: mon.trang_thai_mon === 'da_phuc_vu'
        })),
        mon: thucDon.tatCaMon.map(mon => ({
          ...mon, con_hang: Boolean(mon.con_mon), hinh_anh: mon.anh_mon_an
        }))
      });
      setLoi('');
    } catch (err) {
      if (id === yeuCau.current) setLoi(err.message);
    } finally {
      if (id === yeuCau.current) setDangTai(false);
    }
  }, []);

  useEffect(() => {
    const socket = laySocket();
    const suKien = ['connect', 'don_hang_moi', 'tien_do_mon_an', 'thanh_toan_thanh_cong', 'pos:xu_ly_mon',
      'thuc_don:cap_nhat_con_mon', 'thuc_don:cap_nhat_so_suat'];
    suKien.forEach(ten => socket.on(ten, taiDuLieu));
    taiDuLieu();
    const henGio = setInterval(taiDuLieu, 30000);
    return () => {
      yeuCau.current++;
      clearInterval(henGio);
      suKien.forEach(ten => socket.off(ten, taiDuLieu));
    };
  }, [taiDuLieu]);

  const batTatAmThanh = async () => {
    if (amThanhBao) {
      setAmThanhBao(false);
      return;
    }
    try {
      audio.current ??= new window.AudioContext();
      await audio.current.resume();
      setAmThanhBao(true);
    } catch (err) {
      setLoi(err.message);
    }
  };
  useEffect(() => {
    if (!amThanhBao) return;
    const socket = laySocket();
    const bao = (don) => {
      if (don.trangThaiDon !== 'da_duyet' || !audio.current) return;
      const ctx = audio.current;
      const nhip = ctx.createOscillator();
      const amLuong = ctx.createGain();
      nhip.frequency.value = 740;
      amLuong.gain.setValueAtTime(0.06, ctx.currentTime);
      amLuong.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);
      nhip.connect(amLuong).connect(ctx.destination);
      nhip.start();
      nhip.stop(ctx.currentTime + 0.24);
    };
    socket.on('don_hang_moi', bao);
    socket.on('tien_do_mon_an', bao);
    return () => {
      socket.off('don_hang_moi', bao);
      socket.off('tien_do_mon_an', bao);
    };
  }, [amThanhBao]);
  useEffect(() => () => {
    audio.current?.close();
    audio.current = null;
  }, []);

  const { phieu: danhSachPhieu, gom: danhSachGomMon, mon: danhSachMon, xong: danhSachDaXong } = duLieu;

  const luu = async (thaoTac) => {
    if (dangLuu) return;
    setDangLuu(true);
    try {
      await thaoTac();
      await taiDuLieu();
    } catch (err) {
      await taiDuLieu();
      setLoi(err.message);
    } finally {
      setDangLuu(false);
    }
  };

  const capNhatMon = (id, trangThaiMoi) =>
    api.put(`/api/dieu-phoi-bep/chi-tiet/${id}/trang-thai`, { trangThaiMoi });

  const capNhatNhieuMon = (cacMon, trangThaiMoi) =>
    luu(async () => {
      for (const mon of cacMon) await capNhatMon(mon.chi_tiet_id, trangThaiMoi);
    });

  const soMonHet = danhSachMon.filter(m => !m.con_hang).length;

  return (
    <div className="w-full min-h-screen bg-[#19241f] text-[#e1eae1] flex flex-col font-sans select-none">
      {/* Header chuẩn Figma KDS */}
      <HeaderBep
        ca={ca}
        tabHienTai={tabHienTai}
        onChuyenTab={setTabHienTai}
        soPhieuCho={danhSachPhieu.length}
        soGomMon={danhSachGomMon.length}
        soHoanThanh={danhSachDaXong.length}
        soMonHet={soMonHet}
        coChiDaoKhanCap={hienChiDaoKhanCap}
        onMoChiDaoKhanCap={() => setHienChiDaoKhanCap(true)}
        amThanhBao={amThanhBao}
        onBatTatAmThanh={batTatAmThanh}
        tramHienTai={tramHienTai}
        onChonTram={setTramHienTai}
        onDangXuat={onDangXuat}
      />

      {/* Nội dung chính theo Tab */}
      <main className="flex-1 p-6 overflow-x-auto">
        {dangTai && <p>Đang tải dữ liệu bếp…</p>}
        {loi && <p role="alert" className="text-rose-300 mb-4">{loi}</p>}
        {/* TAB 1: K01 · KDS THEO BÀN (FIFO TICKETS) */}
        {tabHienTai === 'theoBan' && (
          <div className="flex gap-5 items-start min-w-max pb-6">
            {danhSachPhieu.map((phieu) => {
              const laTre = phieu.thoi_gian_cho_phut >= 15;
              const laChuY = phieu.thoi_gian_cho_phut >= 10 && phieu.thoi_gian_cho_phut < 15;

              const mauHeader = laTre
                ? 'bg-[#a42c35] text-white border-b-2 border-rose-300'
                : laChuY
                ? 'bg-amber-600 text-white border-b-2 border-amber-300'
                : 'bg-[#2d4336] text-white border-b-2 border-emerald-400';

              return (
                <div
                  key={phieu.id}
                  className="w-80 bg-white text-[#272d29] rounded-2xl shadow-xl overflow-hidden border border-white/20 flex flex-col"
                >
                  {/* Header phiếu */}
                  <div className={`p-4 ${mauHeader} flex justify-between items-start`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-2xl tracking-tight leading-none">
                          {phieu.ma_ban}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/20">
                          #{phieu.ma_don}
                        </span>
                      </div>
                      <p className="text-xs opacity-90 mt-1">
                        Gửi lúc: {hienThiGioVietNam(phieu.thoi_gian_tao)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-black/25">
                        <Clock size={13} />
                        <span>{phieu.thoi_gian_cho_phut}p</span>
                      </span>
                      {laTre && <p className="text-[10px] font-bold uppercase mt-1 text-rose-200">Ưu tiên ra ngay</p>}
                    </div>
                  </div>

                  {/* Danh sách món ăn trong phiếu */}
                  <div className="p-4 space-y-3 flex-1 bg-stone-50 divide-y divide-stone-200/80">
                    {phieu.mon_an.map((mon) => (
                      <div key={mon.id} className="pt-3 first:pt-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-[#272d29]">
                            <span className="text-base text-[#b64d2d] mr-1.5">{mon.so_luong} ×</span>
                            {mon.ten_mon}
                          </h4>
                          {mon.phut_con_lai && (
                            <span className="text-[11px] font-semibold text-stone-500">
                              ~{mon.phut_con_lai}p
                            </span>
                          )}
                        </div>

                        {mon.ghi_chu && (
                          <div className="bg-[#fbf2dd] text-[#795c21] text-xs font-semibold px-2.5 py-1 rounded-md mt-1.5 inline-block">
                            Ghi chú: {mon.ghi_chu}
                          </div>
                        )}

                        {/* Nút chuyển trạng thái món */}
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            mon.trang_thai === 'hoan_thanh'
                              ? 'bg-emerald-100 text-[#226b4c]'
                              : mon.trang_thai === 'dang_nau'
                              ? 'bg-orange-100 text-[#b64d2d]'
                              : 'bg-stone-200 text-stone-600'
                          }`}>
                            {mon.trang_thai === 'hoan_thanh' ? '✓ Đã xong' : mon.trang_thai === 'dang_nau' ? 'Đang nấu' : 'Chờ nấu'}
                          </span>

                          {mon.trang_thai !== 'hoan_thanh' ? (
                            <button
                              disabled={dangLuu}
                              onClick={() => luu(() => capNhatMon(mon.id, mon.trang_thai === 'dang_nau' ? 'hoan_thanh' : 'dang_nau'))}
                              className="px-3 py-1 bg-[#226b4c] hover:bg-[#1a553c] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                            >
                              {mon.trang_thai === 'dang_nau' ? 'Xong món' : 'Nấu món'}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Nút hoàn thành toàn bộ phiếu */}
                  <div className="p-3 bg-white border-t border-stone-200">
                    <button
                      disabled={dangLuu || phieu.mon_an.some(mon => mon.trang_thai !== 'dang_nau')}
                      onClick={() => capNhatNhieuMon(phieu.mon_an, 'hoan_thanh')}
                      className="w-full py-2.5 bg-[#2d4336] hover:bg-[#202e28] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <CheckCircle2 size={16} />
                      <span>Hoàn thành cả phiếu {phieu.ma_ban}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {!dangTai && !loi && danhSachPhieu.length === 0 && (
              <div className="text-center py-20 text-[#b3c6ba] w-full">
                <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-3" />
                <h3 className="text-lg font-bold text-white">Bếp đã hoàn thành toàn bộ món!</h3>
                <p className="text-xs text-[#b3c6ba] mt-1">Không còn phiếu chờ chế biến.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: K02 · KDS GOM MÓN (BATCH COOKING) */}
        {tabHienTai === 'gomMon' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="bg-[#202e28] p-4 rounded-2xl border border-white/10 flex justify-between items-center text-xs">
              <div>
                <h2 className="text-base font-bold text-white">Gom món chế biến hàng loạt</h2>
                <p className="text-[#b3c6ba] mt-0.5">Tự động tổng hợp các đĩa cùng loại từ các bàn khác nhau để nấu chung một mẻ.</p>
              </div>
              <button
                onClick={() => setHienDeNghiUuTien(true)}
                className="px-3 py-2 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-xl font-bold flex items-center gap-1.5"
              >
                <span>Mở đề nghị ưu tiên (K06)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {danhSachGomMon.map((gom, idx) => (
                <div key={idx} className="bg-white text-[#272d29] rounded-2xl p-5 shadow-lg border border-stone-200">
                  <div className="flex justify-between items-start pb-3 border-b border-stone-200">
                    <div>
                      <span className="text-xs font-bold text-[#b64d2d] uppercase">{gom.tram}</span>
                      <h3 className="text-xl font-black text-[#272d29]">{gom.ten_mon}</h3>
                    </div>
                    <span className="text-2xl font-black text-[#b64d2d] bg-[#f9ede6] px-3.5 py-1 rounded-xl">
                      {gom.tong_so_luong} đĩa
                    </span>
                  </div>

                  <div className="py-3 space-y-2">
                    <span className="text-xs font-bold text-[#72776f] block">Chi tiết theo từng bàn:</span>
                    {gom.chi_tiet.map((ct, cIdx) => (
                      <div key={cIdx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-extrabold text-sm text-[#272d29] mr-2">{ct.ban}</span>
                          <span className="font-bold text-[#b64d2d]">{ct.so_luong} đĩa</span>
                          <span className="text-stone-500 ml-2">({ct.ghi_chu})</span>
                        </div>
                        <span className="text-stone-400 font-semibold">{ct.thoi_gian_cho}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={dangLuu || !gom.chi_tiet.some(mon => mon.trang_thai_mon === 'cho_duyet')}
                    onClick={() => capNhatNhieuMon(gom.chi_tiet.filter(mon => mon.trang_thai_mon === 'cho_duyet'), 'dang_nau')}
                    className="w-full mt-2 py-3 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Flame size={16} />
                    <span>Nấu chung cả mẻ {gom.tong_so_luong} phần</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: K03 · MÓN ĐÃ HOÀN THÀNH */}
        {tabHienTai === 'daLamXong' && (
          <div className="max-w-5xl mx-auto bg-white text-[#272d29] rounded-2xl shadow-xl overflow-hidden border border-stone-200 p-6">
            <h2 className="text-lg font-bold text-[#272d29] mb-4">Lịch sử món đã chế biến xong trong ca</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-[#72776f] uppercase font-bold border-b">
                  <tr>
                    <th className="p-3">Bàn</th>
                    <th className="p-3">Tên món</th>
                    <th className="p-3">Số lượng</th>
                    <th className="p-3">Thời gian hoàn thành</th>
                    <th className="p-3">Phục vụ bưng</th>
                    <th className="p-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {danhSachDaXong.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50">
                      <td className="p-3 font-bold text-sm text-[#272d29]">{item.ban}</td>
                      <td className="p-3 font-semibold">{item.ten_mon}</td>
                      <td className="p-3 font-bold text-[#b64d2d]">{item.so_luong}</td>
                      <td className="p-3 text-stone-500">{hienThiGioVietNam(item.thoi_gian_xong)}</td>
                      <td className="p-3 font-medium">{item.phuc_vu}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ebf4ed] text-[#226b4c]">
                          {item.da_bung ? 'Đã lên bàn' : 'Chờ bưng'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: K04 · TRẠNG THÁI THỰC ĐƠN / BÁO HẾT MÓN NHANH */}
        {tabHienTai === 'trangThaiMon' && (
          <div className="max-w-4xl mx-auto bg-white text-[#272d29] rounded-2xl shadow-xl border border-stone-200 p-6">
            <div className="flex justify-between items-center pb-4 border-b border-stone-200 mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#272d29]">Cập nhật trạng thái còn / hết món</h2>
                <p className="text-xs text-[#72776f] mt-0.5">Bếp trưởng có thể gạt công tắc để lập tức khóa món trên menu QR của khách hàng khi hết nguyên liệu.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-rose-100 text-[#a42c35] rounded-full">
                {soMonHet} món đang hết
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {danhSachMon.map((mon) => (
                <div key={mon.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {mon.hinh_anh && <img src={mon.hinh_anh} alt={mon.ten_mon} className="w-12 h-12 rounded-lg object-cover" />}
                    <div>
                      <h4 className="font-bold text-sm text-[#272d29]">{mon.ten_mon}</h4>
                      <p className="text-stone-500">{mon.ten_danh_muc} · {mon.tram_bep === 'bep_nong' ? 'Bếp nóng' : 'Bar / Bếp lạnh'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${mon.con_hang ? 'text-[#226b4c]' : 'text-[#a42c35]'}`}>
                      {mon.con_hang ? 'Đang phục vụ' : 'Hết món'}
                    </span>
                    <button
                      disabled={dangLuu}
                      onClick={() => luu(() => api.put(`/api/thuc-don/${mon.id}/trang-thai-mon`, { conMon: !mon.con_hang }))}
                      className={`p-1 rounded-full transition-colors ${
                        mon.con_hang ? 'text-[#226b4c]' : 'text-stone-300'
                      }`}
                    >
                      {mon.con_hang ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal K05: Chỉ đạo gấp bắt buộc từ Quản lý (Realtime Socket.io) */}
      {hienChiDaoKhanCap && chiDaoHienTai && (
        <ModalChiDaoGapBatBuoc
          chiDao={chiDaoHienTai}
          onDong={() => setHienChiDaoKhanCap(false)}
          onXacNhanUuTien={async (cd) => {
            setHienChiDaoKhanCap(false);
            try {
              if (cd?.id) {
                await api.put(`/api/dieu-phoi-bep/lenh/${cd.id}/xac-nhan`);
              }
              const socket = laySocket();
              if (socket && cd?.id) {
                socket.emit('dieu_phoi:xac_nhan', {
                  id: cd.id,
                  tenNguoiTiepNhan: 'Bùi Văn Bếp Trưởng',
                  boPhan: 'bep',
                  thoiGianTiepNhan: dinhDangGio(Date.now())
                });
              }
            } catch (e) {
              console.warn('Lỗi xác nhận lệnh điều phối:', e.message);
            }
          }}
        />
      )}

      {/* Modal K06: Đề nghị ưu tiên */}
      {hienDeNghiUuTien && (
        <ModalDeNghiUuTien
          duLieu={deNghiUuTienData}
          onDong={() => {
            setHienDeNghiUuTien(false);
            setDeNghiUuTienData(null);
          }}
          onPhanHoi={(res) => {
            const socket = laySocket();
            if (socket) {
              socket.emit('bep:phan_hoi_giuc_mon', {
                ...res,
                tenBan: deNghiUuTienData?.tenBan || 'Bàn 03',
                tenMon: deNghiUuTienData?.tenMon || 'Lẩu tôm chua cay',
                thoiGianPhanHoi: dinhDangGio(Date.now())
              });
            }
          }}
        />
      )}
    </div>
  );
}
