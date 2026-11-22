// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A19 · DUYỆT HỦY MÓN (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { dinhDangTien } from '../../dungChung/dinhDang';
import ModalXacNhan from '../../thanhPhan/ModalXacNhan';

import { api } from "../../dungChung/api";
import { laySocket } from "../../dungChung/ketNoiSocket";

export default function TrangDuyetHuyMonAdmin() {
  const [danhSachYeuCau, setDanhSachYeuCau] = useState([]);
  const [loi, setLoi] = useState('');
  const [yeuCauTuChoi, setYeuCauTuChoi] = useState(null);
  const [lyDoTuChoi, setLyDoTuChoi] = useState('');
  const [loiTuChoi, setLoiTuChoi] = useState('');
  const [dangXuLy, setDangXuLy] = useState(false);
  const nap = async () => {
    try {
      const data = await api.get('/api/don-goi-mon/yeu-cau-huy-mon');
      setDanhSachYeuCau(data.map(yc => ({
        id: yc.id, ban: yc.ten_ban, tenMon: yc.ten_mon, soLuong: yc.so_luong,
        donGia: yc.don_gia, nguoiYeuCau: yc.ho_ten, lyDo: yc.ly_do_huy,
        thoiGian: yc.thoi_gian_yeu_cau, phanHoi: yc.phan_hoi_admin,
        trangThai: yc.trang_thai_yeu_cau === 'cho_admin_duyet' ? 'cho_duyet' :
          yc.trang_thai_yeu_cau === 'da_chap_thuan' ? 'da_duyet' : 'tu_choi'
      })));
    } catch (err) {
      setLoi(err.message);
    }
  };
  useEffect(() => {
    const socket = laySocket();
    nap();
    socket.on('yeu_cau_huy_mon:thay_doi', nap);
    socket.on('connect', nap);
    return () => {
      socket.off('yeu_cau_huy_mon:thay_doi', nap);
      socket.off('connect', nap);
    };
  }, []);
  const xuLy = async (id, chapNhan) => {
    if (dangXuLy) return;
    const lyDo = lyDoTuChoi.trim();
    if (!chapNhan && !lyDo) {
      setLoiTuChoi('Vui lòng nhập lý do từ chối.');
      return;
    }
    setDangXuLy(true);
    try {
      await api.put(`/api/don-goi-mon/yeu-cau-huy-mon/${id}/phe-duyet`, {
        chapNhan, lyDoTuChoi: chapNhan ? undefined : lyDo
      });
      setYeuCauTuChoi(null);
      setLoi('');
      await nap();
    } catch (err) {
      if (chapNhan) setLoi(err.message);
      else setLoiTuChoi(err.message);
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#272d29] tracking-tight">
          Phê duyệt yêu cầu hủy món (Void Items)
        </h1>
        <p className="text-xs text-[#72776f] mt-1">
          Chỉ có Quản lý mới có quyền phê duyệt hủy món đã gửi để tránh thất thoát và sai lệch kho
        </p>
      </div>

      <div className="space-y-4">
        {loi && <p role="alert" className="text-red-700">{loi}</p>}
        {danhSachYeuCau.map((yc) => (
          <div
            key={yc.id}
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex justify-between items-start gap-4 text-xs"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#b64d2d]">{yc.ban}</span>
                <span className="font-bold text-[#272d29] text-sm">• {yc.tenMon} × {yc.soLuong}</span>
                <span className="font-bold text-rose-700">({dinhDangTien(yc.donGia * yc.soLuong)})</span>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                <p><span className="font-bold text-stone-600">Nhân viên gửi:</span> {yc.nguoiYeuCau}</p>
                <p><span className="font-bold text-stone-600">Thời gian:</span> {yc.thoiGian}</p>
                <p><span className="font-bold text-stone-600">Lý do hủy:</span> "{yc.lyDo}"</p>
                {yc.phanHoi && <p className="break-words"><strong>Lý do từ chối:</strong> {yc.phanHoi}</p>}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 pt-2">
              {yc.trangThai === 'cho_duyet' ? (
                <>
                  <button
                    disabled={dangXuLy}
                    onClick={() => xuLy(yc.id, true)}
                    className="py-2.5 px-4 bg-[#226b4c] hover:bg-[#1a553c] text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Check size={16} />
                    <span>Duyệt hủy</span>
                  </button>
                  <button
                    disabled={dangXuLy}
                    onClick={() => {
                      setYeuCauTuChoi(yc);
                      setLyDoTuChoi('');
                      setLoiTuChoi('');
                    }}
                    className="py-2.5 px-3 bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-[#a42c35] rounded-xl font-bold transition-colors"
                  >
                    <X size={16} />
                    <span>Từ chối</span>
                  </button>
                </>
              ) : (
                <span className={`px-3 py-1 rounded-full font-bold ${
                  yc.trangThai === 'da_duyet' ? 'bg-emerald-100 text-[#226b4c]' : 'bg-rose-100 text-[#a42c35]'
                }`}>
                  {yc.trangThai === 'da_duyet' ? '✓ Đã duyệt hủy' : '✗ Đã từ chối'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {yeuCauTuChoi && (
        <ModalXacNhan hienThi tieuDe="Từ chối hủy món" phanLoai={yeuCauTuChoi.ban}
          noiDung={<>
            <p>{yeuCauTuChoi.tenMon} × {yeuCauTuChoi.soLuong}</p>
            <label htmlFor="ly-do-quan-ly-tu-choi-huy" className="mt-2 block">Lý do từ chối</label>
            <textarea id="ly-do-quan-ly-tu-choi-huy" className="mt-1 w-full rounded-lg border bg-white p-2"
              rows={3} maxLength={300} value={lyDoTuChoi}
              onChange={event => { setLyDoTuChoi(event.target.value); setLoiTuChoi(''); }} />
          </>}
          loi={loiTuChoi} dangXuLy={dangXuLy} nhanNutXacNhan="Xác nhận từ chối"
          onHuy={() => setYeuCauTuChoi(null)} onXacNhan={() => xuLy(yeuCauTuChoi.id, false)} />
      )}
    </div>
  );
}
