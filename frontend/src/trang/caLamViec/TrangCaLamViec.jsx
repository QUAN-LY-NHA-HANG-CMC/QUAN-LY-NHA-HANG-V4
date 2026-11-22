// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MÀN HÌNH CA LÀM VIỆC & PHIẾU ĐỔI CA / NGHỈ PHÉP (FIGMA W11 & A07 - US-W09)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRightLeft, UserX, CheckCircle, XCircle, Plus, AlertCircle } from 'lucide-react';
import { api } from '../../dungChung/api';
import { dinhDangNgay } from '../../dungChung/dinhDang';

export default function TrangCaLamViec({ nguoiDung, onThongBao }) {
  const laQuanLy = nguoiDung && nguoiDung.vaiTro === 'quan_ly';

  const [lichCa, setLichCa] = useState([]);
  const [yeuCauDoiCa, setYeuCauDoiCa] = useState([]);
  const [modalTaoYeuCau, setModalTaoYeuCau] = useState(false);
  const [caChon, setCaChon] = useState(null);
  const [loaiYeuCau, setLoaiYeuCau] = useState('doi_ca');
  const [nhanVienNhanCaId, setNhanVienNhanCaId] = useState('');
  const [lyDo, setLyDo] = useState('');
  const [dangGui, setDangGui] = useState(false);

  const taiDuLieu = async () => {
    try {
      if (laQuanLy) {
        const tatCa = await api.get('/api/ca-lam-viec/tat-ca-lich');
        setLichCa(tatCa || []);
      } else {
        const caNhan = await api.get('/api/ca-lam-viec/lich-ca-nhan');
        setLichCa(caNhan || []);
      }

      const dsYc = await api.get('/api/ca-lam-viec/yeu-cau-doi-ca');
      setYeuCauDoiCa(dsYc || []);
    } catch (err) {
      console.error('Lỗi tải lịch ca:', err);
    }
  };

  useEffect(() => {
    taiDuLieu();
  }, [laQuanLy]);

  // Gửi yêu cầu đổi ca / xin nghỉ
  const xuLyTaoYeuCau = async (e) => {
    e.preventDefault();
    if (!caChon || !lyDo.trim()) {
      if (onThongBao) onThongBao({ loai: 'canh_bao', noiDung: 'Vui lòng chọn ca và nhập lý do' });
      return;
    }

    try {
      setDangGui(true);
      await api.post('/api/ca-lam-viec/yeu-cau-doi-ca', {
        caLamViecId: caChon.id,
        loaiYeuCau,
        nhanVienNhanCaId: loaiYeuCau === 'doi_ca' ? Number(nhanVienNhanCaId) : null,
        lyDo: lyDo.trim()
      });

      setModalTaoYeuCau(false);
      setLyDo('');
      taiDuLieu();
      if (onThongBao) onThongBao({ loai: 'thanh_cong', noiDung: 'Đã gửi yêu cầu đổi ca tới Quản lý' });
    } catch (err) {
      if (onThongBao) onThongBao({ loai: 'loi', noiDung: err.message });
    } finally {
      setDangGui(false);
    }
  };

  // Quản lý phê duyệt (A07)
  const xuLyPheDuyet = async (id, trangThai) => {
    try {
      await api.put(`/api/ca-lam-viec/yeu-cau-doi-ca/${id}/phe-duyet`, {
        trangThai,
        ghiChuDuyet: trangThai === 'da_duyet' ? 'Đã duyệt ca làm' : 'Từ chối đổi ca'
      });
      taiDuLieu();
      if (onThongBao) onThongBao({ loai: 'thanh_cong', noiDung: `Đã ${trangThai === 'da_duyet' ? 'chấp thuận' : 'từ chối'} phiếu đổi ca` });
    } catch (err) {
      if (onThongBao) onThongBao({ loai: 'loi', noiDung: err.message });
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#272d29]">Lịch Phân Ca & Phiếu Đổi Ca</h1>
          <p className="text-xs text-[#72776f]">
            {laQuanLy ? 'Quản lý phê duyệt phân ca toàn nhà hàng (A07)' : 'Xem ca cá nhân và tạo phiếu đổi ca / xin nghỉ (W11)'}
          </p>
        </div>
      </div>

      {/* 1. Danh sách yêu cầu đổi ca / xin nghỉ cần duyệt */}
      <div className="p-4 rounded-2xl bg-white border border-[#272d29]/10 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-[#272d29] flex items-center gap-1.5">
          <ArrowRightLeft size={16} className="text-[#b64d2d]" />
          <span>Phiếu đổi ca / Xin nghỉ ({yeuCauDoiCa.length})</span>
        </h2>

        {yeuCauDoiCa.length === 0 ? (
          <p className="text-xs text-[#72776f] py-2">Hiện không có yêu cầu đổi ca nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {yeuCauDoiCa.map((yc) => (
              <div
                key={yc.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-[#272d29] text-sm">
                      {yc.ten_nhan_vien_yeu_cau}
                    </span>
                    <p className="text-[11px] text-[#72776f]">
                      {yc.loai_yeu_cau === 'doi_ca'
                        ? `Xin đổi ca sang: ${yc.ten_nhan_vien_nhan_ca || 'Đồng nghiệp'}`
                        : 'Xin nghỉ ca'}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      yc.trang_thai === 'cho_duyet'
                        ? 'bg-amber-100 text-amber-800'
                        : yc.trang_thai === 'da_duyet'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {yc.trang_thai === 'cho_duyet' ? 'Chờ duyệt' : yc.trang_thai === 'da_duyet' ? 'Đã duyệt' : 'Từ chối'}
                  </span>
                </div>

                <div className="p-2 bg-white rounded-lg border border-stone-200/60 space-y-0.5 text-[11px]">
                  <p>
                    <span className="text-[#72776f]">Ca làm:</span>{' '}
                    <span className="font-semibold">{yc.ten_ca}</span> (Ngày {dinhDangNgay(yc.ngay_lam)})
                  </p>
                  <p>
                    <span className="text-[#72776f]">Lý do:</span> <span>{yc.ly_do}</span>
                  </p>
                </div>

                {/* Quản lý duyệt / từ chối */}
                {laQuanLy && yc.trang_thai === 'cho_duyet' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => xuLyPheDuyet(yc.id, 'tu_choi')}
                      className="flex-1 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <XCircle size={14} className="text-rose-600" /> Từ chối
                    </button>
                    <button
                      onClick={() => xuLyPheDuyet(yc.id, 'da_duyet')}
                      className="flex-1 py-1.5 bg-[#226b4c] hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-xs"
                    >
                      <CheckCircle size={14} /> Chấp thuận
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Danh sách ca làm việc */}
      <div className="p-4 rounded-2xl bg-white border border-[#272d29]/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#272d29] flex items-center gap-1.5">
            <Calendar size={16} className="text-[#b64d2d]" />
            <span>Lịch làm việc ({lichCa.length} ca)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lichCa.map((ca) => (
            <div
              key={ca.id}
              className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-[#b64d2d]/30 transition-all space-y-2 text-xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-[#272d29]">{ca.ten_nhan_vien}</h4>
                  <span className="text-[11px] text-[#72776f]">
                    {ca.ten_ca} · {ca.gio_bat_dau} - {ca.gio_ket_thuc}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold text-[10px]">
                  {dinhDangNgay(ca.ngay_lam)}
                </span>
              </div>

              {ca.ghi_chu && (
                <p className="text-[11px] text-[#72776f] bg-stone-50 p-1.5 rounded line-clamp-2">
                  {ca.ghi_chu}
                </p>
              )}

              {/* Nút gửi yêu cầu đổi ca nếu là ca của mình */}
              {!laQuanLy && (
                <button
                  onClick={() => {
                    setCaChon(ca);
                    setModalTaoYeuCau(true);
                  }}
                  className="w-full py-1.5 mt-1 bg-[#f9ede6] hover:bg-[#f2dfd5] text-[#b64d2d] rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowRightLeft size={13} />
                  <span>Xin đổi ca / Nghỉ ca này</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Tạo Phiếu Đổi Ca / Nghỉ Ca */}
      {modalTaoYeuCau && caChon && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-[#272d29]">Tạo yêu cầu đổi ca / xin nghỉ</h3>
            <p className="text-xs text-[#72776f]">
              Áp dụng cho ca: <span className="font-bold">{caChon.ten_ca}</span> ngày {dinhDangNgay(caChon.ngay_lam)}
            </p>

            <form onSubmit={xuLyTaoYeuCau} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#272d29]">Loại yêu cầu:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLoaiYeuCau('doi_ca')}
                    className={`flex-1 py-2 rounded-xl font-semibold border ${
                      loaiYeuCau === 'doi_ca'
                        ? 'bg-[#b64d2d] text-white border-[#b64d2d]'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    Đổi ca
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoaiYeuCau('nghi_ca')}
                    className={`flex-1 py-2 rounded-xl font-semibold border ${
                      loaiYeuCau === 'nghi_ca'
                        ? 'bg-[#b64d2d] text-white border-[#b64d2d]'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    Nghỉ ca
                  </button>
                </div>
              </div>

              {loaiYeuCau === 'doi_ca' && (
                <div className="space-y-1">
                  <label className="font-semibold text-[#272d29]">Chọn nhân viên nhận ca:</label>
                  <select
                    value={nhanVienNhanCaId}
                    onChange={(e) => setNhanVienNhanCaId(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  >
                    <option value="">-- Chọn đồng nghiệp --</option>
                    <option value="5">Phạm Thị Lan (Phục vụ 02)</option>
                    <option value="6">Hoàng Tuấn Kiệt (Phục vụ 03)</option>
                    <option value="4">Lê Văn Minh (Phục vụ 01)</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-[#272d29]">Lý do chi tiết:</label>
                <textarea
                  value={lyDo}
                  onChange={(e) => setLyDo(e.target.value)}
                  placeholder="Nhập lý do đổi ca hoặc xin nghỉ..."
                  rows={3}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#b64d2d]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalTaoYeuCau(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={dangGui}
                  className="flex-1 py-2.5 bg-[#b64d2d] hover:bg-[#a04225] text-white rounded-xl font-semibold shadow-xs"
                >
                  {dangGui ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
