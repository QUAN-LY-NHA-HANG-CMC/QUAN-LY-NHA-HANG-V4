// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// A20 · NHẬT KÝ KIỂM TOÁN (1440x1000) - CHUẨN THIẾT KẾ FIGMA
// ============================================================================

import React, { useState, useEffect } from 'react';
import { ClipboardList, Shield, Filter, Search, Download } from 'lucide-react';
import { api } from '../../dungChung/api';
import { laySocket } from '../../dungChung/ketNoiSocket';
import { hienThiGioVietNam } from '../../dungChung/thoiGian';

export default function TrangNhatKyKiemToan() {
  const [tuKhoa, setTuKhoa] = useState('');
  const [hanhDongLoc, setHanhDongLoc] = useState('tat_ca');

  const [nhatKy, setNhatKy] = useState([]);
  const [loi, setLoi] = useState('');
  useEffect(() => {
    let huy = false;
    const nap = () => api.get('/api/he-thong/nhat-ky?limit=200').then(data => !huy && setNhatKy(data.map(log => ({
      id: log.id, thoiGian: log.thoi_gian_tao,
      nguoiThucHien: log.ten_nhan_vien || log.ten_dang_nhap || 'Hệ thống',
      hanhDong: log.hanh_dong, doiTuong: log.bang_anh_huong || log.doi_tuong || '',
      chiTiet: log.ly_do || '',
      mucDo: log.hanh_dong === 'THANH_TOAN_CHUA_XAC_NHAN_BUNG' ? 'chu_y' : undefined
    })))).catch(err => { if (!huy) setLoi(err.message); });
    nap();
    const socket = laySocket();
    socket.on('nhat_ky:thay_doi', nap);
    socket.on('connect', nap);
    return () => { huy = true; socket.off('nhat_ky:thay_doi', nap); socket.off('connect', nap); };
  }, []);
  const xuatNhatKy = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(logLoc, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nhat-ky-kiem-toan.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const logLoc = nhatKy.filter(l => {
    const khopTuKhoa = [l.nguoiThucHien, l.doiTuong, l.chiTiet]
      .some(giaTri => giaTri.toLowerCase().includes(tuKhoa.toLowerCase()));
    const khopHd = hanhDongLoc === 'tat_ca' || l.hanhDong.includes(hanhDongLoc);
    return khopTuKhoa && khopHd;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#272d29] tracking-tight">
            Nhật ký kiểm toán hệ thống (Audit Logs)
          </h1>
          <p className="text-xs text-[#72776f] mt-1">
            Ghi vết bất biến mọi hành vi nghiệp vụ nhạy cảm: duyệt đơn, hủy món, chiết khấu, cấu hình
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm người dùng, đối tượng hoặc chi tiết..."
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#b64d2d]"
            />
          </div>

          <button
            onClick={xuatNhatKy}
            className="py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-200 text-[#272d29] rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download size={16} />
            <span>Xuất Audit Log</span>
          </button>
        </div>
      </div>

      {loi && <p role="alert">{loi}</p>}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 border-b border-stone-200 font-bold text-[#72776f] uppercase">
            <tr>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Người thực hiện</th>
              <th className="p-4">Hành động</th>
              <th className="p-4">Đối tượng tác động</th>
              <th className="p-4">Chi tiết thao tác</th>
              <th className="p-4">Mức độ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {logLoc.map((log) => (
              <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                <td className="p-4 font-mono text-stone-500 whitespace-nowrap">{hienThiGioVietNam(log.thoiGian)}</td>
                <td className="p-4 font-bold text-[#272d29]">{log.nguoiThucHien}</td>
                <td className="p-4">
                  <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-stone-100 text-[#2d4336]">
                    {log.hanhDong}
                  </span>
                </td>
                <td className="p-4 font-semibold text-[#b64d2d]">{log.doiTuong}</td>
                <td className="p-4 text-stone-600">{log.chiTiet}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    log.mucDo === 'canh_bao'
                      ? 'bg-rose-100 text-[#a42c35]'
                      : log.mucDo === 'chu_y'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-600'
                  }`}>
                    {log.mucDo === 'canh_bao' ? 'Cảnh báo' : log.mucDo === 'chu_y' ? 'Chú ý' : 'Thông thường'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
