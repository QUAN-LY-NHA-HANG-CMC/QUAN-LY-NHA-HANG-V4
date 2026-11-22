// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// C12 · ĐÁNH GIÁ TRẢI NGHIỆM (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState } from 'react';
import { Star, Check, Send } from 'lucide-react';
import HeaderKhach from '../../thanhPhan/HeaderKhach';

export default function TrangDanhGiaDichVu({
  ban = { ma_ban: 'B08', ten_ban: 'BÀN 08' },
  onGuiDanhGia,
  onVeTrangChu
}) {
  const [soSao, setSoSao] = useState(5);
  const [nhanDaChon, setNhanDaChon] = useState(['Món ngon', 'Phục vụ nhanh']);
  const [gopY, setGopY] = useState('');
  const [daGui, setDaGui] = useState(false);

  const danhSachNhan = [
    'Món ngon',
    'Phục vụ nhanh',
    'Không gian ấm cúng',
    'Đúng món',
    'Giá hợp lý',
    'Nhân viên chu đáo'
  ];

  const moTaSao = {
    1: 'Chưa hài lòng',
    2: 'Tạm ổn',
    3: 'Bình thường',
    4: 'Hài lòng',
    5: 'Rất hài lòng'
  };

  const toggleNhan = (nhan) => {
    setNhanDaChon(prev => 
      prev.includes(nhan) ? prev.filter(n => n !== nhan) : [...prev, nhan]
    );
  };

  const [loi, setLoi] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const handleGui = async () => {
    if (dangGui) return;
    setDangGui(true);
    try {
      await onGuiDanhGia({ soSao, nhan: nhanDaChon, gopY });
      setDaGui(true);
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#f9f7f2] flex flex-col justify-between p-5 pb-8 shadow-xl border-x border-[#272d29]/5">
      <HeaderKhach tieuDe="Đánh giá trải nghiệm" ban={ban} />

      <main className="flex-1 py-4 flex flex-col justify-center">
        {loi && <p role="alert" className="text-red-700">{loi}</p>}
        {daGui ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-[#272d29]/10 shadow-xs space-y-3">
            <div className="w-14 h-14 bg-[#ebf4ed] text-[#226b4c] rounded-full flex items-center justify-center mx-auto">
              <Check size={28} className="stroke-[3]" />
            </div>
            <h3 className="text-lg font-bold text-[#272d29]">
              Cảm ơn đóng góp của bạn!
            </h3>
            <p className="text-xs text-[#6c746d] leading-relaxed">
              Mỗi góp ý giúp Mộc chăm chút hơn cho lần đón tiếp sau. Chúc bạn có một ngày thật nhiều niềm vui!
            </p>
            <button
              onClick={onVeTrangChu}
              className="mt-4 px-6 py-2.5 bg-[#b64d2d] text-white rounded-xl text-xs font-bold hover:bg-[#a14022]"
            >
              Về trang chủ
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Tiêu đề & mô tả */}
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-[#272d29]">
                Bữa ăn của bạn thế nào?
              </h2>
              <p className="text-xs text-[#6c746d] mt-1 max-w-xs mx-auto">
                Mỗi góp ý giúp Mộc chăm chút hơn cho lần đón tiếp sau.
              </p>
            </div>

            {/* Chọn số sao */}
            <div className="bg-white rounded-2xl p-5 border border-[#272d29]/10 shadow-xs text-center">
              <span className="text-xs font-semibold text-[#72776f] block mb-2">
                TRẢI NGHIỆM TỔNG THỂ
              </span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSoSao(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={32}
                      className={`${
                        star <= soSao
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm font-bold text-[#b64d2d] mt-2">
                {moTaSao[soSao]}
              </p>
            </div>

            {/* Thẻ tag cảm nhận */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#272d29] block">
                Điểm bạn thích nhất hôm nay:
              </label>
              <div className="flex flex-wrap gap-2">
                {danhSachNhan.map((nhan) => {
                  const active = nhanDaChon.includes(nhan);
                  return (
                    <button
                      key={nhan}
                      type="button"
                      onClick={() => toggleNhan(nhan)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-[#2d4336] text-white shadow-xs'
                          : 'bg-white text-[#72776f] border border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {active ? `✓ ${nhan}` : `+ ${nhan}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nhập ý kiến phản hồi */}
            <div>
              <label className="text-xs font-bold text-[#272d29] block mb-1.5">
                Chia sẻ thêm cùng Bếp và Quản lý (không bắt buộc):
              </label>
              <textarea
                value={gopY}
                onChange={(e) => setGopY(e.target.value)}
                placeholder="Món ăn vừa miệng không, nhân viên phục vụ chu đáo chứ?..."
                rows={3}
                className="w-full text-xs bg-white border border-stone-200 rounded-xl p-3 text-[#272d29] focus:outline-none focus:ring-2 focus:ring-[#b64d2d]/20 focus:border-[#b64d2d]"
              />
            </div>

            {/* Nút gửi */}
            <button
              disabled={dangGui}
            onClick={handleGui}
              className="w-full py-3.5 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
            >
              <Send size={16} />
              <span>Gửi đánh giá</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
