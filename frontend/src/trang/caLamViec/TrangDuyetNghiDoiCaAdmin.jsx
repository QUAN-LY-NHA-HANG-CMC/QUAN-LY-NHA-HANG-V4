// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A07 · DUYỆT NGHỈ VÀ ĐỔI CA (1440x1000) - CHUẨN THIẾT KẾ FIGMA QUÁN MỘC
// KẾT NỐI 100% CSDL BACKEND SQLITE & PHÊ DUYỆT THỜI GIAN THỰC
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Check, X, Calendar, Clock, AlertCircle, RefreshCw, 
  ArrowRightLeft, UserCheck, UserX, Info 
} from 'lucide-react';
import { api } from '../../dungChung/api';
import { hienThiGioVietNam } from '../../dungChung/thoiGian';
import ModalXacNhan from '../../thanhPhan/ModalXacNhan';

export default function TrangDuyetNghiDoiCaAdmin({ onQuayLaiLich }) {
  const [danhSachYeuCau, setDanhSachYeuCau] = useState([]);
  const [tabTrangThai, setTabTrangThai] = useState('cho_duyet'); // 'tat_ca' | 'cho_duyet' | 'da_duyet' | 'tu_choi'
  const [dangTai, setDangTai] = useState(false);
  const [dangXuLyId, setDangXuLyId] = useState(null);
  const [thongBao, setThongBao] = useState(null);
  const [xacNhanDuyet, setXacNhanDuyet] = useState(null); // { id, chapNhan, yeuCau }

  const showToast = (noiDung, loai = 'thanhCong') => {
    setThongBao({ noiDung, loai });
    setTimeout(() => setThongBao(null), 4000);
  };

  const taiDanhSach = async () => {
    setDangTai(true);
    try {
      const res = await api.get('/api/ca-lam-viec/yeu-cau-doi-ca');
      if (Array.isArray(res)) {
        setDanhSachYeuCau(res);
      }
    } catch (err) {
      showToast('Lỗi khi tải danh sách yêu cầu: ' + err.message, 'loi');
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDanhSach();
  }, []);

  // Xử lý phê duyệt / từ chối
  const thucHienDuyet = async () => {
    if (!xacNhanDuyet || dangXuLyId !== null) return;
    const { id, chapNhan, yeuCau } = xacNhanDuyet;
    setDangXuLyId(id);
    setXacNhanDuyet(cu => ({ ...cu, loi: '' }));
    try {
      await api.put(`/api/ca-lam-viec/yeu-cau-doi-ca/${id}/phe-duyet`, {
        trangThai: chapNhan ? 'da_duyet' : 'tu_choi',
        ghiChuDuyet: chapNhan ? 'Quản lý chấp thuận' : 'Quản lý từ chối yêu cầu'
      });

      showToast(`Đã ${chapNhan ? 'phê duyệt chấp thuận' : 'từ chối'} yêu cầu của ${yeuCau.ten_nhan_vien_yeu_cau}!`);
      setXacNhanDuyet(null);
      taiDanhSach();
    } catch (err) {
      setXacNhanDuyet(cu => cu?.id === id ? { ...cu, loi: err.message } : cu);
      taiDanhSach();
    } finally {
      setDangXuLyId(null);
    }
  };

  const yeuCauLoc = danhSachYeuCau.filter(yc => {
    if (tabTrangThai === 'tat_ca') return true;
    return yc.trang_thai === tabTrangThai;
  });

  const soChoDuyet = danhSachYeuCau.filter(yc => yc.trang_thai === 'cho_duyet').length;

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Toast thông báo */}
      {thongBao && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold shadow-md transition-all ${
          thongBao.loai === 'thanhCong' ? 'bg-[#ebf4ed] text-[#226b4c] border border-[#226b4c]/30' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{thongBao.noiDung}</span>
          <button onClick={() => setThongBao(null)} className="p-1 hover:opacity-70">
            <X size={14} />
          </button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#b64d2d] uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
              PHÂN HỆ QUẢN TRỊ (A07)
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Xét duyệt nghỉ phép & đổi ca làm
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#272d29] tracking-tight mt-1">
            Xét duyệt nghỉ phép & đổi ca làm việc
          </h1>
          <p className="text-xs text-[#72776f] mt-0.5">
            Quản lý phê duyệt các yêu cầu từ nhân viên phục vụ, thu ngân và bếp theo thời gian thực
          </p>
        </div>

        {onQuayLaiLich && (
          <button
            onClick={onQuayLaiLich}
            className="py-2.5 px-4 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl font-bold text-xs transition-colors shadow-2xs"
          >
            ← Quay lại Lịch phân ca (A06)
          </button>
        )}
      </div>

      {/* TABS LỌC TRẠNG THÁI */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs">
        {[
          { key: 'cho_duyet', label: 'Chờ duyệt', count: soChoDuyet, highlight: true },
          { key: 'da_duyet', label: 'Đã chấp thuận' },
          { key: 'tu_choi', label: 'Từ chối' },
          { key: 'tat_ca', label: 'Tất cả phiếu', count: danhSachYeuCau.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setTabTrangThai(tab.key)}
            className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              tabTrangThai === tab.key
                ? 'bg-[#272d29] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                tab.highlight && tab.count > 0 
                  ? 'bg-[#b64d2d] text-white font-extrabold' 
                  : 'bg-stone-200 text-stone-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* DANH SÁCH YÊU CẦU */}
      {dangTai ? (
        <div className="py-20 text-center text-stone-400">
          <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-[#b64d2d]" />
          <p className="text-xs font-semibold">Đang tải danh sách yêu cầu từ CSDL...</p>
        </div>
      ) : yeuCauLoc.length === 0 ? (
        <div className="py-16 text-center text-stone-400 bg-white rounded-2xl border border-dashed border-stone-200">
          <Info size={32} className="mx-auto mb-2 text-stone-300" />
          <p className="text-xs font-bold text-stone-600">Không có yêu cầu nào trong mục này</p>
          <p className="text-[11px] text-stone-400 mt-1">Khi nhân viên gửi phiếu đổi ca hoặc xin nghỉ, thông tin sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {yeuCauLoc.map((yc) => {
            const laDoiCa = yc.loai_yeu_cau === 'doi_ca';
            const dangCho = yc.trang_thai === 'cho_duyet';

            return (
              <div
                key={yc.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-[#272d29]">
                      {yc.ten_nhan_vien_yeu_cau}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      laDoiCa ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-orange-50 text-orange-800 border border-orange-200'
                    }`}>
                      {laDoiCa ? 'Đổi ca làm việc' : 'Nghỉ ca làm'}
                    </span>
                    <span className="text-stone-400 text-[11px]">· {hienThiGioVietNam(yc.ngay_tao)}</span>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1 text-stone-700">
                    <p>
                      <strong className="text-stone-900">Ca làm việc:</strong> Ngày {yc.ngay_lam} ({yc.ten_ca}: {yc.gio_bat_dau}–{yc.gio_ket_thuc})
                    </p>
                    {laDoiCa && (
                      <p>
                        <strong className="text-stone-900">Nhân viên nhận ca thay:</strong>{' '}
                        <span className="text-[#b64d2d] font-bold">{yc.ten_nhan_vien_nhan_ca || 'Chưa chỉ định'}</span>
                      </p>
                    )}
                    <p>
                      <strong className="text-stone-900">Lý do:</strong> "{yc.lyDo || yc.ly_do}"
                    </p>
                  </div>
                </div>

                {/* Trạng thái & Thao tác */}
                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  {dangCho ? (
                    <>
                      <button
                        onClick={() => setXacNhanDuyet({ id: yc.id, chapNhan: true, yeuCau: yc })}
                        disabled={dangXuLyId === yc.id}
                        className="py-2.5 px-4 bg-[#226b4c] hover:bg-[#1a553c] text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                      >
                        <Check size={15} strokeWidth={2.5} />
                        <span>Phê duyệt</span>
                      </button>
                      <button
                        onClick={() => setXacNhanDuyet({ id: yc.id, chapNhan: false, yeuCau: yc })}
                        disabled={dangXuLyId === yc.id}
                        className="py-2.5 px-3 bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 rounded-xl font-bold transition-colors disabled:opacity-50"
                      >
                        <X size={15} />
                        <span>Từ chối</span>
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${
                      yc.trang_thai === 'da_duyet' 
                        ? 'bg-emerald-50 text-[#226b4c] border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {yc.trang_thai === 'da_duyet' ? '✓ Đã chấp thuận' : '✗ Đã từ chối'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL XÁC NHẬN DUYỆT / TỪ CHỐI */}
      {xacNhanDuyet && (
        <ModalXacNhan
          hienThi={!!xacNhanDuyet}
          tieuDe={xacNhanDuyet.chapNhan ? 'Xác nhận Phê duyệt yêu cầu' : 'Từ chối yêu cầu'}
          phanLoai="QUẢN TRỊ DUYỆT NGHỈ ĐỔI CA"
          noiDung={
            xacNhanDuyet.chapNhan
              ? `Bạn có chắc muốn CHẤP THUẬN yêu cầu ${xacNhanDuyet.yeuCau.loai_yeu_cau === 'doi_ca' ? 'đổi ca' : 'xin nghỉ'} của nhân viên ${xacNhanDuyet.yeuCau.ten_nhan_vien_yeu_cau}? Ca làm sẽ tự động cập nhật trong CSDL.`
              : `Bạn có chắc muốn TỪ CHỐI yêu cầu của nhân viên ${xacNhanDuyet.yeuCau.ten_nhan_vien_yeu_cau}?`
          }
          canhBaoPhu={xacNhanDuyet.chapNhan ? 'Dữ liệu ca làm việc của nhân sự sẽ được điều chỉnh ngay lập tức.' : undefined}
          loai={xacNhanDuyet.chapNhan ? 'moKhoa' : 'canhBao'}
          nhanNutXacNhan={xacNhanDuyet.chapNhan ? 'Chấp thuận' : 'Xác nhận từ chối'}
          loi={xacNhanDuyet.loi}
          dangXuLy={dangXuLyId === xacNhanDuyet.id}
          onHuy={() => setXacNhanDuyet(null)}
          onXacNhan={thucHienDuyet}
        />
      )}
    </div>
  );
}
