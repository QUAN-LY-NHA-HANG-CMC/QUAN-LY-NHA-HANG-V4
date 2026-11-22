// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// C01 · CHÀO MỪNG TẠI BÀN (430x980) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React from 'react';
import HeaderKhach from '../../thanhPhan/HeaderKhach';
import DieuHuongDuoiKhach from '../../thanhPhan/DieuHuongDuoiKhach';

export default function TrangChaoMung({
  ban = { ma_ban: 'B08', ten_ban: 'Bàn 08', khu_vuc: 'Tầng 1', so_cho: 4 },
  onKhamPhaThucDon,
  onChuyenTab,
  onDangNhapNhanVien
}) {
  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#f9f7f2] flex flex-col justify-between pb-24 shadow-xl border-x border-[#272d29]/5">
      {/* Thanh đầu trang */}
      <HeaderKhach tieuDe="Chào mừng tại bàn" ban={ban} />

      {/* Nội dung chính */}
      <main className="px-6 py-4 flex-1 flex flex-col justify-center">
        {/* Ảnh món ăn đại diện */}
        <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-md mb-6 border border-[#272d29]/10">
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80"
            alt="Món ăn Quán Mộc"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Nhãn chào mừng */}
        <div className="inline-block px-3 py-1 bg-[#f9ede6] text-[#b64d2d] rounded-md text-xs font-bold tracking-wider uppercase mb-3 w-fit">
          CHÀO MỪNG ĐẾN MỘC
        </div>

        {/* Tiêu đề chính */}
        <h2 className="text-3xl font-extrabold text-[#272d29] tracking-tight leading-snug mb-3">
          Một bữa ngon,<br />trọn khoảnh khắc.
        </h2>

        {/* Đoạn mô tả */}
        <p className="text-sm text-[#6c746d] leading-relaxed mb-6">
          Ẩm thực Việt đương đại, được chuẩn bị bằng sự tận tâm và nguyên liệu tươi ngon nhất mỗi ngày.
        </p>

        {/* Card thông tin bàn */}
        <div className="bg-white rounded-xl p-4 border border-[#272d29]/10 shadow-xs mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#272d29]">
              {ban?.ten_ban || 'Quét mã QR tại bàn'}
            </h3>
            <p className="text-xs text-[#72776f] mt-0.5">
              {ban?.khu_vuc || 'Quán Mộc'}{ban?.so_cho ? ` · ${ban.so_cho} chỗ` : ''}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#226b4c] bg-[#ebf4ed] px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#226b4c]"></span>
              Sẵn sàng
            </span>
            <p className="text-[11px] text-[#72776f] mt-1">
              Không cần đăng nhập
            </p>
          </div>
        </div>

        {/* Nút Khám phá thực đơn */}
        <button
          onClick={onKhamPhaThucDon}
          className="w-full py-3.5 px-4 bg-[#b64d2d] hover:bg-[#a14022] text-white rounded-xl font-bold text-base tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
        >
          <span>Khám phá thực đơn</span>
          <span>→</span>
        </button>

        {/* Chú thích giỏ hàng chung */}
        <p className="text-center text-xs text-[#72776f] mt-3">
          Giỏ hàng được chia sẻ với mọi người cùng bàn.
        </p>

        {/* Liên kết dành cho nhân viên đăng nhập */}
        {onDangNhapNhanVien && (
          <div className="text-center mt-5">
            <button
              onClick={onDangNhapNhanVien}
              className="text-[11px] text-[#72776f] hover:text-[#b64d2d] underline transition-colors"
            >
              Nhân viên nhà hàng: Đăng nhập nhận ca →
            </button>
          </div>
        )}
      </main>

      {/* Điều hướng cuối */}
      <DieuHuongDuoiKhach tabHienTai="thucDon" onChuyenTab={onChuyenTab} />
    </div>
  );
}
