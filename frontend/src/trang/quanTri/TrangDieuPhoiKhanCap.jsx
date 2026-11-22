// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A18 · TRUNG TÂM ĐIỀU PHỐI KHẨN CẤP TOÀN DIỆN (BẾP, PHỤC VỤ, THU NGÂN)
// PHÁT LỆNH THỜI GIAN THỰC (SOCKET.IO) ĐỒNG BỘ 100% CÁC PHÂN HỆ
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Flame,
  AlertTriangle,
  Send,
  CheckCircle2,
  Clock,
  Utensils,
  Users,
  CreditCard,
  Megaphone,
  Sparkles,
  MapPin,
  RefreshCw,
  Check,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../dungChung/api';
import { laySocket } from '../../dungChung/ketNoiSocket';

export default function TrangDieuPhoiKhanCap() {
  // Bộ phận nhận điều phối: 'bep' | 'phuc_vu' | 'thu_ngan' | 'tat_ca'
  const [boPhanNhan, setBoPhanNhan] = useState('bep');
  
  // Dữ liệu chung
  const [banChon, setBanChon] = useState('');
  const [mucDo, setMucDo] = useState('khan_cap'); // 'khan_cap' | 'uu_tien' | 'thong_thuong'
  const [noiDung, setNoiDung] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const [daPhatLenhThanhCong, setDaPhatLenhThanhCong] = useState(false);

  // Dữ liệu cho Bếp
  const [monChonId, setMonChonId] = useState(0);
  const [soLuongMon, setSoLuongMon] = useState(2);

  // Danh sách từ API
  const [danhSachBan, setDanhSachBan] = useState([]);
  const [danhSachMon, setDanhSachMon] = useState([]);
  const [lichSuLenh, setLichSuLenh] = useState([]);
  const [dangTaiLichSu, setDangTaiLichSu] = useState(false);

  // Gợi ý nhanh theo từng bộ phận
  const goiYTheoBoPhan = {
    bep: [
      { tieuDe: 'Ưu tiên ra món ngay (Khách VIP)', nd: 'Bàn [BAN] có khách VIP sắp đi đón tàu bay. Yêu cầu Bếp trưởng ưu tiên ra ngay món [MON] trong vòng 5 phút!', mon: true },
      { tieuDe: 'Khách giục món gấp', nd: 'Bàn [BAN] đã chờ món hơn 20 phút và đang giục gấp. Bếp kiểm tra làm ngay món [MON] giúp phục vụ mang ra!', mon: true },
      { tieuDe: 'Khách đổi món / Làm lại đĩa mới', nd: 'Bàn [BAN] yêu cầu đổi hoặc làm lại món [MON] (chín vừa, không hành). Bếp hỗ trợ ưu tiên nhé!', mon: true },
      { tieuDe: 'Báo hết món / Ngưng nhận', nd: 'Món [MON] nguyên liệu tươi hôm nay đã hết suất. Bếp xác nhận tạm ngừng nhận order món này.', mon: true }
    ],
    phuc_vu: [
      { tieuDe: 'Dọn dẹp bàn gấp đón khách', nd: 'Bàn [BAN] khách đã về, yêu cầu tổ phục vụ dọn dẹp và set up lại bàn gấp trong 3 phút để đón nhóm khách mới đang chờ ở sảnh!' },
      { tieuDe: 'Khách gọi thêm đá / nước chấm', nd: 'Bàn [BAN] khách bấm chuông gọi thêm nước chấm và 01 xô đá tinh khiết. Phục vụ phụ trách khu vực mang tới ngay!' },
      { tieuDe: 'Khách cần tư vấn món VIP', nd: 'Bàn [BAN] cần nhân viên phục vụ am hiểu menu đến tư vấn gói combo và rượu vang cho đối tác quan trọng.' },
      { tieuDe: 'Hỗ trợ ghép 2 bàn cho đoàn đông', nd: 'Hỗ trợ ghép bàn [BAN] với bàn bên cạnh để xếp chỗ cho đoàn khách 10 người.' }
    ],
    thu_ngan: [
      { tieuDe: 'Khách yêu cầu thanh toán gấp', nd: 'Bàn [BAN] khách gọi thanh toán gấp để kịp giờ họp. Thu ngân in tạm tính và mang bill hoặc máy POS cầm tay ra bàn ngay!' },
      { tieuDe: 'Áp mã ưu đãi 10% khách VIP', nd: 'Bàn [BAN] là khách hàng thân thiết của nhà hàng, thu ngân áp dụng chiết khấu 10% tổng hóa đơn trước khi in bill.' },
      { tieuDe: 'Kiểm tra đối soát VietQR', nd: 'Khách bàn [BAN] đã quét mã VietQR chuyển khoản thành công, thu ngân kiểm tra biến động số dư tài khoản để hoàn tất bill.' },
      { tieuDe: 'Hỗ trợ chia tiền nhóm', nd: 'Bàn [BAN] khách yêu cầu chia tiền đều theo đầu người (mỗi người chuyển khoản riêng), thu ngân hỗ trợ xuất mã chia tiền nhóm.' }
    ],
    tat_ca: [
      { tieuDe: 'Đón đoàn khách VIP', nd: 'Nhà hàng chuẩn bị đón đoàn khách VIP 15 người đặt trước tại Khu VIP. Các bộ phận Bếp, Phục vụ, Thu ngân phối hợp sẵn sàng phục vụ!' },
      { tieuDe: 'Kiểm tra vệ sinh & An toàn', nd: 'Toàn bộ nhân viên kiểm tra lại khu vực làm việc, đảm bảo sàn nhà khô ráo, đồng phục chỉnh tề và thái độ niềm nở.' }
    ]
  };

  // Nạp danh sách bàn và thực đơn từ API
  useEffect(() => {
    api.get('/api/ban-an')
      .then(res => {
        if (Array.isArray(res?.banAn)) setDanhSachBan(res.banAn);
      })
      .catch(() => {});

    api.get('/api/thuc-don')
      .then(res => {
        if (res && res.tatCaMon && Array.isArray(res.tatCaMon)) setDanhSachMon(res.tatCaMon);
        else if (res && Array.isArray(res)) setDanhSachMon(res);
      })
      .catch(() => {});

    taiLichSuLenh();
  }, []);

  // Lắng nghe Socket.io Real-time
  useEffect(() => {
    const socket = laySocket();
    if (!socket) return;

    // Khi có ai đó tiếp nhận lệnh
    const handleDaTiepNhan = (duLieu) => {
      setLichSuLenh(prev =>
        prev.map(l =>
          l.id === duLieu.id
            ? {
                ...l,
                trang_thai: 'da_tiep_nhan',
                ten_nguoi_tiep_nhan: duLieu.tenNguoiTiepNhan || l.ten_nguoi_tiep_nhan,
                thoi_gian_tiep_nhan: duLieu.thoiGianTiepNhan || 'Vừa xong'
              }
            : l
        )
      );
    };

    // Khi có lệnh mới được tạo
    const handleLenhMoi = (duLieu) => {
      setLichSuLenh(prev => {
        if (prev.some(l => l.id === duLieu.id)) return prev;
        return [
          {
            id: duLieu.id,
            bo_phan: duLieu.boPhan,
            ten_ban: duLieu.tenBan || duLieu.maBan,
            ma_ban: duLieu.maBan,
            ten_mon: duLieu.tenMon,
            so_luong_mon: duLieu.soLuongMon,
            noi_dung: duLieu.noiDung,
            muc_do: duLieu.mucDo,
            trang_thai: 'cho_tiep_nhan',
            ten_nguoi_gui: duLieu.tenNguoiGui || 'Quản lý',
            thoi_gian_tao: 'Vừa xong'
          },
          ...prev
        ];
      });
    };

    socket.on('dieu_phoi:da_tiep_nhan', handleDaTiepNhan);
    socket.on('dieu_phoi:moi', handleLenhMoi);

    return () => {
      socket.off('dieu_phoi:da_tiep_nhan', handleDaTiepNhan);
      socket.off('dieu_phoi:moi', handleLenhMoi);
    };
  }, []);

  const taiLichSuLenh = async () => {
    try {
      setDangTaiLichSu(true);
      const res = await api.get('/api/dieu-phoi-bep/lich-su-lenh');
      if (res && Array.isArray(res)) {
        setLichSuLenh(res);
      }
    } catch (err) {
      console.warn('Lỗi tải lịch sử lệnh:', err.message);
    } finally {
      setDangTaiLichSu(false);
    }
  };

  // Áp dụng mẫu gợi ý nhanh
  const apDungGoiY = (goiY) => {
    const banObj = danhSachBan.find(b => b.ma_ban === banChon);
    const tenBan = banObj ? banObj.ten_ban : banChon;
    const monObj = danhSachMon.find(m => m.id === monChonId);
    const tenMon = monObj ? monObj.ten_mon : 'Bò lúc lắc';

    let ndMoi = goiY.nd.replace(/\[BAN\]/g, tenBan);
    ndMoi = ndMoi.replace(/\[MON\]/g, `${tenMon} (x${soLuongMon})`);
    setNoiDung(ndMoi);
  };

  // Phát lệnh điều phối
  const handlePhatLenh = async (e) => {
    e.preventDefault();
    if (!noiDung.trim()) return;

    try {
      setDangGui(true);
      const banObj = danhSachBan.find(b => b.ma_ban === banChon);
      const monObj = danhSachMon.find(m => m.id === monChonId);

      const duLieuGui = {
        boPhan: boPhanNhan,
        banId: banObj?.id || null,
        maBan: banObj?.ma_ban || banChon,
        tenBan: banObj?.ten_ban || `Bàn ${banChon}`,
        monAnId: boPhanNhan === 'bep' ? monObj?.id : null,
        tenMon: boPhanNhan === 'bep' ? monObj?.ten_mon : null,
        soLuongMon: boPhanNhan === 'bep' ? soLuongMon : null,
        mucDo,
        noiDung: noiDung.trim()
      };

      const res = await api.post('/api/dieu-phoi-bep/phat-lenh', duLieuGui);
      if (res) {
        setDaPhatLenhThanhCong(true);
        taiLichSuLenh();
        setTimeout(() => setDaPhatLenhThanhCong(false), 3000);
      }
    } catch (err) {
      alert('Lỗi phát lệnh điều phối: ' + err.message);
    } finally {
      setDangGui(false);
    }
  };

  const banObjHienTai = danhSachBan.find(b => b.ma_ban === banChon);
  const monObjHienTai = danhSachMon.find(m => m.id === monChonId);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 flex items-center gap-1">
              <ShieldAlert size={13} /> Trung tâm Chỉ huy & Điều phối
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#272d29] tracking-tight">
            Điều phối Khẩn cấp Toàn diện
          </h1>
          <p className="text-xs text-[#72776f] mt-1">
            Phát chỉ đạo trực tiếp theo thời gian thực tới <b>Bếp KDS</b>, <b>Tổ Phục vụ</b> và <b>Quầy Thu ngân</b>
          </p>
        </div>

        <button
          onClick={taiLichSuLenh}
          className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          title="Tải lại lịch sử lệnh"
        >
          <RefreshCw size={14} className={dangTaiLichSu ? 'animate-spin text-[#b64d2d]' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Form phát lệnh */}
      <form onSubmit={handlePhatLenh} className="bg-white p-6 md:p-7 rounded-3xl border-2 border-rose-200 shadow-md space-y-5">
        {/* Chọn bộ phận nhận lệnh */}
        <div>
          <label className="block font-black text-xs text-stone-700 uppercase tracking-wider mb-2.5">
            1. CHỌN BỘ PHẬN NHẬN CHỈ ĐẠO ĐIỀU PHỐI *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setBoPhanNhan('bep');
                setNoiDung(`Bàn ${banChon} yêu cầu Bếp trưởng ưu tiên ra ngay ${soLuongMon} đĩa ${monObjHienTai?.ten_mon || 'món ăn'} trong vòng 5 phút!`);
              }}
              className={`p-3.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer border-2 ${
                boPhanNhan === 'bep'
                  ? 'bg-rose-50/80 border-[#a42c35] text-[#a42c35] shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <div className={`p-2 rounded-xl ${boPhanNhan === 'bep' ? 'bg-[#a42c35] text-white' : 'bg-stone-200 text-stone-600'}`}>
                <Utensils size={16} />
              </div>
              <div className="text-left">
                <span className="block font-black">Bếp / KDS</span>
                <span className="text-[10px] text-stone-400 font-normal">Nấu nhanh, đổi món</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setBoPhanNhan('phuc_vu');
                setNoiDung(`Bàn ${banChon} khách đã về, yêu cầu tổ phục vụ dọn dẹp và set up lại bàn gấp trong 3 phút để đón nhóm khách mới!`);
              }}
              className={`p-3.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer border-2 ${
                boPhanNhan === 'phuc_vu'
                  ? 'bg-emerald-50/80 border-[#226b4c] text-[#226b4c] shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <div className={`p-2 rounded-xl ${boPhanNhan === 'phuc_vu' ? 'bg-[#226b4c] text-white' : 'bg-stone-200 text-stone-600'}`}>
                <Users size={16} />
              </div>
              <div className="text-left">
                <span className="block font-black">Tổ Phục vụ</span>
                <span className="text-[10px] text-stone-400 font-normal">Dọn bàn, lấy đồ</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setBoPhanNhan('thu_ngan');
                setNoiDung(`Bàn ${banChon} khách yêu cầu thanh toán gấp để kịp giờ họp. Thu ngân in tạm tính và mang bill hoặc máy POS ra bàn ngay!`);
              }}
              className={`p-3.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer border-2 ${
                boPhanNhan === 'thu_ngan'
                  ? 'bg-blue-50/80 border-blue-600 text-blue-700 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <div className={`p-2 rounded-xl ${boPhanNhan === 'thu_ngan' ? 'bg-blue-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                <CreditCard size={16} />
              </div>
              <div className="text-left">
                <span className="block font-black">Thu ngân POS</span>
                <span className="text-[10px] text-stone-400 font-normal">Thanh toán, bill</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setBoPhanNhan('tat_ca');
                setNoiDung(`Chuẩn bị đón đoàn khách VIP 15 người đặt trước tại Khu VIP. Các bộ phận Bếp, Phục vụ, Thu ngân phối hợp sẵn sàng phục vụ!`);
              }}
              className={`p-3.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer border-2 ${
                boPhanNhan === 'tat_ca'
                  ? 'bg-purple-50/80 border-purple-600 text-purple-700 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <div className={`p-2 rounded-xl ${boPhanNhan === 'tat_ca' ? 'bg-purple-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                <Megaphone size={16} />
              </div>
              <div className="text-left">
                <span className="block font-black">Toàn nhà hàng</span>
                <span className="text-[10px] text-stone-400 font-normal">Thông báo chung</span>
              </div>
            </button>
          </div>
        </div>

        {/* Các trường thông tin tùy chỉnh theo bộ phận */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Bàn liên quan */}
          <div>
            <label className="block font-bold text-xs text-stone-700 mb-1.5 flex items-center gap-1">
              <MapPin size={13} className="text-[#b64d2d]" />
              <span>{boPhanNhan === 'phuc_vu' ? 'BÀN CẦN HỖ TRỢ *' : 'BÀN LIÊN QUAN'}</span>
            </label>
            <select
              value={banChon}
              onChange={(e) => setBanChon(e.target.value)}
              className="w-full bg-[#fbf9f5] border border-stone-200 rounded-xl p-3 text-xs font-bold text-[#272d29] focus:outline-hidden focus:ring-2 focus:ring-[#b64d2d]/20 transition-all cursor-pointer"
            >
              {danhSachBan.map(b => (
                <option key={b.ma_ban || b.id} value={b.ma_ban}>
                  {b.ten_ban} ({b.ten_khu_vuc || b.khu_vuc || 'Khu máy lạnh'} · {b.trang_thai})
                </option>
              ))}
            </select>
          </div>

          {/* Món ăn liên quan (Khi chọn Bếp) hoặc Ghi chú bàn (Khi chọn Phục vụ/Thu ngân) */}
          {boPhanNhan === 'bep' ? (
            <>
              <div>
                <label className="block font-bold text-xs text-stone-700 mb-1.5 flex items-center gap-1">
                  <Utensils size={13} className="text-[#a42c35]" />
                  <span>MÓN ĂN LIÊN QUAN *</span>
                </label>
                <select
                  value={monChonId}
                  onChange={(e) => setMonChonId(Number(e.target.value))}
                  className="w-full bg-[#fbf9f5] border border-stone-200 rounded-xl p-3 text-xs font-bold text-[#272d29] focus:outline-hidden focus:ring-2 focus:ring-[#a42c35]/20 transition-all cursor-pointer"
                >
                  {danhSachMon.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.ten_mon} ({m.ten_danh_muc || 'Món chính'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-xs text-stone-700 mb-1.5">
                  SỐ LƯỢNG SUẤT / ĐĨA
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={soLuongMon}
                    onChange={(e) => setSoLuongMon(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#fbf9f5] border border-stone-200 rounded-xl p-3 text-xs font-bold text-[#272d29] text-center"
                  />
                  <span className="text-xs font-bold text-stone-500 whitespace-nowrap">phần</span>
                </div>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className="block font-bold text-xs text-stone-700 mb-1.5">
                MỨC ĐỘ KHẨN CẤP
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMucDo('khan_cap')}
                  className={`p-3 rounded-xl text-xs font-bold transition-all border ${
                    mucDo === 'khan_cap'
                      ? 'bg-rose-100 text-rose-800 border-rose-300 shadow-xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  🚨 Khẩn cấp (Xác nhận ngay)
                </button>
                <button
                  type="button"
                  onClick={() => setMucDo('uu_tien')}
                  className={`p-3 rounded-xl text-xs font-bold transition-all border ${
                    mucDo === 'uu_tien'
                      ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  ⚡ Ưu tiên xử lý trước
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Các gợi ý nhanh (Quick chips) */}
        <div>
          <label className="block font-bold text-xs text-stone-500 mb-2 flex items-center gap-1">
            <Sparkles size={13} className="text-amber-500" />
            <span>MẪU CHỈ ĐẠO NHANH CHO {boPhanNhan.toUpperCase()}:</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {goiYTheoBoPhan[boPhanNhan]?.map((g, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => apDungGoiY(g)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[11px] font-bold text-stone-700 transition-all cursor-pointer text-left"
              >
                + {g.tieuDe}
              </button>
            ))}
          </div>
        </div>

        {/* Nội dung chỉ đạo cụ thể */}
        <div>
          <label className="block font-black text-xs text-stone-700 mb-1.5 uppercase">
            NỘI DUNG CHỈ ĐẠO CỤ THỂ *
          </label>
          <textarea
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value)}
            rows={3}
            required
            placeholder="Nhập nội dung lệnh điều phối gửi tới nhân viên..."
            className="w-full bg-[#fbf9f5] border border-stone-200 rounded-2xl p-4 text-xs font-medium text-[#272d29] leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#b64d2d]/20 transition-all"
          />
        </div>

        {/* Nút phát lệnh */}
        <button
          type="submit"
          disabled={dangGui}
          className={`w-full py-4 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
            daPhatLenhThanhCong
              ? 'bg-emerald-600 text-white'
              : 'bg-[#a42c35] hover:bg-[#8e242c] text-white active:scale-[0.99]'
          } disabled:opacity-50`}
        >
          {daPhatLenhThanhCong ? (
            <>
              <CheckCircle2 size={18} />
              <span>Đã phát lệnh thành công qua Socket.io tới {boPhanNhan.toUpperCase()}!</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>{dangGui ? 'Đang truyền lệnh...' : `Phát lệnh khẩn cấp tới ${boPhanNhan === 'tat_ca' ? 'TOÀN NHÀ HÀNG' : boPhanNhan.toUpperCase()}`}</span>
            </>
          )}
        </button>
      </form>

      {/* Lịch sử chỉ đạo gần đây */}
      <div className="bg-white p-6 md:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-black text-sm text-[#272d29]">Lịch sử Lệnh Điều phối Gần đây</h3>
            <p className="text-[11px] text-stone-400">Trạng thái tiếp nhận thời gian thực từ các bộ phận</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
            {lichSuLenh.length} lệnh ghi nhận
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {lichSuLenh.length === 0 ? (
            <div className="py-8 text-center text-stone-400">
              Chưa có lệnh điều phối nào được phát trong ca làm việc này.
            </div>
          ) : (
            lichSuLenh.map(l => {
              const boPhanBadge = {
                bep: { label: 'BẾP / KDS', color: 'bg-rose-100 text-rose-800' },
                phuc_vu: { label: 'PHỤC VỤ', color: 'bg-emerald-100 text-emerald-800' },
                thu_ngan: { label: 'THU NGÂN', color: 'bg-blue-100 text-blue-800' },
                tat_ca: { label: 'TOÀN QUÁN', color: 'bg-purple-100 text-purple-800' }
              }[l.bo_phan] || { label: l.bo_phan, color: 'bg-stone-100 text-stone-700' };

              const daXacNhan = l.trang_thai === 'da_tiep_nhan';

              return (
                <div key={l.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${boPhanBadge.color}`}>
                        {boPhanBadge.label}
                      </span>
                      {l.ten_ban && (
                        <span className="font-bold text-[#b64d2d]">
                          {l.ten_ban}:
                        </span>
                      )}
                      {l.ten_mon && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-800">
                          {l.ten_mon} (x{l.so_luong_mon || 1})
                        </span>
                      )}
                    </div>
                    <p className="text-stone-700 font-medium">"{l.noi_dung}"</p>
                    <div className="flex items-center gap-3 text-[11px] text-stone-400">
                      <span>Người phát: <b className="text-stone-600">{l.ten_nguoi_gui || 'Quản lý'}</b></span>
                      <span>•</span>
                      <span>{l.thoi_gian_tao}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {daXacNhan ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <Check size={13} className="stroke-[3]" />
                        <span>Đã tiếp nhận: {l.ten_nguoi_tiep_nhan || 'Nhân sự'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                        <Clock size={13} />
                        <span>Đang chờ bộ phận xác nhận...</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
