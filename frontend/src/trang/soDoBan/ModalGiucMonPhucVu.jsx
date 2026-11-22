// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MODAL GIỤC MÓN & XIN ƯU TIÊN BẾP KDS (DÀNH CHO PHỤC VỤ)
// ============================================================================

import React, { useState } from 'react';
import { X, Zap, Clock, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { laySocket } from '../../dungChung/ketNoiSocket';

export default function ModalGiucMonPhucVu({
  ban,
  danhSachMon = [],
  monMacDinh = null,
  nhanVien = { hoTen: 'Lê Văn Minh' },
  onDong,
  onGuiThanhCong
}) {
  const [monChon, setMonChon] = useState(String(monMacDinh?.id ?? 0));
  const [loi, setLoi] = useState('');
  const [thoiGianCho, setThoiGianCho] = useState('15');
  const [lyDo, setLyDo] = useState('Khách giục gấp vì chờ lâu');
  const [dangGui, setDangGui] = useState(false);

  const danhSachLyDo = [
    'Khách giục gấp vì chờ lâu',
    'Bàn có trẻ nhỏ đang đói',
    'Khách sắp có việc phải đi sớm',
    'Khách đã nhắc lần 2'
  ];

  const handleGuiGiucMon = () => {
    if (dangGui) return;
    setLoi('');
    setDangGui(true);
    const thongTin = {
      banId: ban.id,
      chiTietId: Number(monChon),
      thoiGianCho: parseInt(thoiGianCho, 10) || 15,
      lyDo
    };

    const socket = laySocket();
    socket.timeout(5000).emit('phuc_vu:giuc_mon', thongTin, (err, ketQua) => {
      setDangGui(false);
      if (err || !ketQua?.ok) {
        setLoi(ketQua?.msg || 'Chưa nhận được xác nhận từ máy chủ.');
        return;
      }
      onGuiThanhCong?.(ketQua.data);
      onDong();
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] bg-[#f9f7f2] rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 border border-[#272d29]/10">
        {/* Header modal */}
        <div className="flex justify-between items-start pb-3 border-b border-[#272d29]/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <Zap size={20} className="fill-amber-500" />
            </div>
            <div>
              <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider block">
                ĐỀ NGHỊ ƯU TIÊN BẾP
              </span>
              <h3 className="text-lg font-bold text-[#272d29]">
                Giục món {ban?.ten_ban || 'Bàn 08'}
              </h3>
            </div>
          </div>
          <button
            onClick={onDong}
            className="p-1.5 rounded-full hover:bg-stone-200 text-[#72776f]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          {/* Thông tin nhân viên gửi */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900">
            <span className="font-semibold">Phục vụ gửi:</span>
            <span className="font-black">{nhanVien?.hoTen || 'Lê Văn Minh'}</span>
          </div>

          {/* Chọn món cần giục */}
          <div>
            <label className="block text-[11px] font-bold text-[#272d29] uppercase tracking-wider mb-1.5">
              MÓN ĂN CẦN BẾP ƯU TIÊN
            </label>
            <select
              value={monChon}
              onChange={(e) => setMonChon(e.target.value)}
              className="w-full bg-white border border-[#272d29]/15 rounded-xl p-3 text-xs font-bold text-[#272d29] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              <option value="0">Tất cả các món đang chờ của bàn</option>
              {danhSachMon.map(m => (
                <option key={m.id} value={m.id}>
                  {m.ten_mon} (x{m.so_luong}) - {m.trang_thai === 'dang_nau' ? 'Đang nấu' : 'Chờ nấu'}
                </option>
              ))}
            </select>
          </div>

          {/* Thời gian khách đã chờ */}
          <div>
            <label className="block text-[11px] font-bold text-[#272d29] uppercase tracking-wider mb-1.5">
              KHÁCH ĐÃ ĐỢI (PHÚT)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['10', '15', '20', '25'].map((phut) => (
                <button
                  key={phut}
                  type="button"
                  onClick={() => setThoiGianCho(phut)}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    thoiGianCho === phut
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white border-stone-200 text-[#272d29] hover:bg-stone-50'
                  }`}
                >
                  {phut} phút
                </button>
              ))}
            </div>
          </div>

          {/* Lý do giục */}
          <div>
            <label className="block text-[11px] font-bold text-[#272d29] uppercase tracking-wider mb-1.5">
              LÝ DO GIỤC MÓN
            </label>
            <div className="space-y-1.5">
              {danhSachLyDo.map((ld, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLyDo(ld)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors flex items-center justify-between ${
                    lyDo === ld
                      ? 'bg-[#f9ede6] border-[#b64d2d] text-[#b64d2d] font-bold'
                      : 'bg-white border-stone-200 text-[#272d29] hover:bg-stone-50'
                  }`}
                >
                  <span>{ld}</span>
                  {lyDo === ld && <CheckCircle2 size={15} className="text-[#b64d2d]" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nút gửi */}
        <div className="pt-2 border-t border-[#272d29]/10">
          <button
            onClick={handleGuiGiucMon}
            disabled={dangGui || !danhSachMon.length}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-[#b64d2d] hover:brightness-105 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            <Send size={16} />
            <span>{dangGui ? 'Đang gửi tới Bếp...' : 'Gửi đề nghị tới Bếp KDS ngay'}</span>
          </button>
          {loi && <p role="alert" className="text-xs text-rose-700">{loi}</p>}
        </div>
      </div>
    </div>
  );
}
