// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A11 · THIẾT LẬP BÀN VÀ QR (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState, useEffect } from 'react';
import { QrCode, Download, Printer, ArrowLeft, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { api } from '../../dungChung/api';

export default function TrangThietLapBanVaQr({ onQuayLai }) {
  const [danhSachBan, setDanhSachBan] = useState([]);
  const [banChon, setBanChon] = useState(null);
  const [loi, setLoi] = useState('');
  const [qrImg, setQrImg] = useState('');
  const [daSaoChep, setDaSaoChep] = useState(false);

  // Tải danh sách bàn thực tế kèm Token từ CSDL
  useEffect(() => {
    api.get('/api/ban-an')
      .then(res => {
        if (res?.banAn && Array.isArray(res.banAn) && res.banAn.length > 0) {
          setDanhSachBan(res.banAn);
          setBanChon(res.banAn[0]);
        }
      })
      .catch(err => setLoi(err.message));
  }, []);

  const tokenHienTai = banChon?.ma_qr_token;
  const url = new URL('/', window.location.origin);
  if (tokenHienTai) {
    url.searchParams.set('phanHe', 'khachHang');
    url.searchParams.set('ban', banChon.ma_ban);
    url.searchParams.set('token', tokenHienTai);
  }
  const urlMenu = url.href;
  useEffect(() => {
    let huy = false;
    setQrImg('');
    if (tokenHienTai) {
      QRCode.toDataURL(urlMenu, { width: 900, margin: 3 }).then(data => {
        if (!huy) setQrImg(data);
      }).catch(err => setLoi(err.message));
    }
    return () => { huy = true; };
  }, [tokenHienTai, urlMenu]);

  const handleSaoChepLink = () => {
    navigator.clipboard.writeText(urlMenu);
    setDaSaoChep(true);
    setTimeout(() => setDaSaoChep(false), 2500);
  };

  if (!banChon) return <p role="status" className="p-8">{loi || 'Chưa có bàn để tạo QR.'}</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#272d29] tracking-tight">
            Tạo & in mã QR đặt bàn (E-Menu)
          </h1>
          <p className="text-xs text-[#72776f] mt-1">
            Mỗi bàn có mã QR định danh riêng biệt, tự động nhận diện bàn ăn khi khách quét mã
          </p>
        </div>

        {onQuayLai && (
          <button
            onClick={onQuayLai}
            className="text-xs font-bold text-[#b64d2d] hover:underline flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            <span>Quay lại Danh sách bàn (A10)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Cột 1: Danh sách bàn để chọn */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2 max-h-[560px] overflow-y-auto">
          <span className="text-xs font-bold text-stone-700 block mb-2 uppercase">Chọn bàn muốn xuất QR:</span>
          {danhSachBan.map(b => (
            <button
              key={b.ma_ban}
              onClick={() => setBanChon(b)}
              className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex justify-between items-center ${
                banChon.ma_ban === b.ma_ban
                  ? 'bg-[#b64d2d] text-white border-[#b64d2d] font-bold shadow-xs'
                  : 'bg-stone-50 text-[#272d29] border-stone-200 hover:border-stone-300'
              }`}
            >
              <div>
                <span className="font-bold">{b.ten_ban} ({b.ma_ban})</span>
                <span className={`block text-[10px] mt-0.5 truncate max-w-[140px] font-mono ${banChon.ma_ban === b.ma_ban ? 'text-white/80' : 'text-stone-400'}`}>
                  {b.ma_qr_token || b.qr_token || 'Token tự động'}
                </span>
              </div>
              <span className={`text-[11px] shrink-0 ${banChon.ma_ban === b.ma_ban ? 'text-white/80' : 'text-stone-500'}`}>
                {b.ten_khu_vuc || b.khu_vuc || 'Tầng 1'}
              </span>
            </button>
          ))}
        </div>

        {/* Cột 2 & 3: Khung thiết kế thẻ để bàn (Tent card mockup) */}
        <div className="col-span-2 bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col items-center justify-center text-center">
          {/* Mockup biển mica để bàn */}
          <div className="w-80 bg-[#f9f7f2] border-4 border-[#2d4336] rounded-3xl p-5 shadow-xl space-y-3.5">
            <div>
              <span className="font-sans font-black text-3xl text-[#b64d2d]">mộc</span>
              <p className="text-[10px] font-bold tracking-widest uppercase text-stone-500 mt-0.5">ẨM THỰC VIỆT ĐƯƠNG ĐẠI</p>
            </div>

            <div className="bg-[#2d4336] text-white py-2 px-4 rounded-xl">
              <h3 className="text-lg font-black tracking-tight">{(banChon.ten_ban || 'BÀN 01').toUpperCase()}</h3>
              <p className="text-[11px] text-emerald-200">{banChon.ten_khu_vuc || banChon.khu_vuc || 'Tầng 1'} · {banChon.suc_chua || banChon.so_cho || 4} chỗ</p>
            </div>

            <div className="w-48 h-48 bg-white p-2 rounded-2xl border-2 border-stone-200 mx-auto shadow-xs flex items-center justify-center">
              <img src={qrImg} alt={`Mã QR ${banChon.ten_ban}`} className="w-full h-full object-contain" />
            </div>

            {/* Token bàn hiển thị rõ ràng */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2 text-[10px] font-mono text-amber-900 break-all">
              <span className="font-bold block uppercase tracking-wider text-[9px] text-amber-700">Token định danh duy nhất:</span>
              <span>{tokenHienTai}</span>
            </div>

            <div className="text-[11px] text-stone-600 leading-tight">
              <p className="font-bold text-[#272d29]">QUÉT MÃ ĐỂ XEM THỰC ĐƠN & GỌI MÓN</p>
              <p className="text-[10px] text-stone-500 mt-1">Tự động nhận diện {banChon.ten_ban} · Không lo nhầm bàn</p>
            </div>
          </div>

          {/* Thanh copy link và mở thử */}
          <div className="w-full max-w-md mt-4 p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2 text-xs">
            <input
              type="text"
              readOnly
              value={urlMenu}
              className="flex-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-stone-700 select-all"
            />
            <button
              onClick={handleSaoChepLink}
              className="px-3 py-1.5 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors shrink-0"
            >
              {daSaoChep ? <Check size={14} /> : <Copy size={14} />}
              <span>{daSaoChep ? 'Đã sao chép!' : 'Copy link'}</span>
            </button>
            <a
              href={urlMenu}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg transition-colors shrink-0"
              title="Mở tab khách quét thử bàn này"
            >
              <ExternalLink size={16} />
            </a>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              disabled={!qrImg}
              onClick={() => {
                const a = document.createElement('a');
                a.href = qrImg;
                a.download = `qr-${banChon.ma_ban}.png`;
                a.click();
              }}
              className="py-2.5 px-4 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Download size={15} />
              <span>Tải file in ấn</span>
            </button>

            <button
              onClick={() => window.print()}
              className="py-2.5 px-4 bg-[#2d4336] hover:bg-[#202e28] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Printer size={15} />
              <span>In ngay thẻ để bàn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
