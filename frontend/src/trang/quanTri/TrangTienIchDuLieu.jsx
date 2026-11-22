// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// TIỆN ÍCH DỮ LIỆU CSDL: SINH DỮ LIỆU MẪU & LÀM SẠCH DỮ LIỆU (SEED / CLEAN DB)
// ============================================================================

import React, { useState } from 'react';
import { Database, RefreshCw, Trash2, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, HardDrive } from 'lucide-react';
import { api } from '../../dungChung/api';
import ModalXacNhan from '../../thanhPhan/ModalXacNhan';

export default function TrangTienIchDuLieu() {
  const [dangXuLy, setDangXuLy] = useState(false);
  const [thongBao, setThongBao] = useState(null);
  const [chiTietLog, setChiTietLog] = useState('');
  const [xacNhanAction, setXacNhanAction] = useState(null);

  // Sinh dữ liệu mẫu
  const handleSinhDuLieuMau = () => {
    setXacNhanAction({
      tieuDe: 'Nạp dữ liệu mẫu nhà hàng',
      phanLoai: 'TIỆN ÍCH CƠ SỞ DỮ LIỆU',
      noiDung: 'Bạn có chắc muốn nạp toàn bộ dữ liệu mẫu chuẩn Figma (bàn ăn, món ăn, nhân viên, phân ca, đơn mẫu)?',
      canhBaoPhu: 'Dữ liệu mẫu sẽ giúp bạn trải nghiệm đầy đủ các phân hệ POS, KDS và E-Menu.',
      loai: 'thongTin',
      nhanNutXacNhan: 'Nạp dữ liệu mẫu',
      onThucHien: async () => {
        setDangXuLy(true);
        setThongBao(null);
        setChiTietLog('');
        try {
          const res = await api.post('/api/he-thong/sinh-du-lieu-mau', {});
          setThongBao({
            loai: 'thanhCong',
            noiDung: res.thongBao || 'Đã sinh dữ liệu mẫu thành công!'
          });
          setChiTietLog(JSON.stringify(res.duLieu || res, null, 2));
        } catch (err) {
          setThongBao({
            loai: 'loi',
            noiDung: 'Lỗi khi sinh dữ liệu mẫu: ' + (err.message || 'Không thể kết nối máy chủ')
          });
        } finally {
          setDangXuLy(false);
          setXacNhanAction(null);
        }
      }
    });
  };

  // Làm sạch đơn hàng & ca làm việc (giữ danh mục, món ăn, bàn ăn, nhân viên)
  const handleLamSachNghiepVu = () => {
    setXacNhanAction({
      tieuDe: 'Làm sạch đơn gọi món & phiên bàn',
      phanLoai: 'DỌN DẸP DỮ LIỆU GIAO DỊCH',
      noiDung: 'Hành động này sẽ xóa sạch: toàn bộ đơn gọi món, hóa đơn, lịch sử chia tiền, phiên bàn và yêu cầu hỗ trợ (vẫn giữ nguyên danh mục món, bàn ăn và nhân viên).',
      canhBaoPhu: 'Thao tác này phù hợp khi bạn muốn bắt đầu một ngày kinh doanh mới.',
      loai: 'canhBao',
      nhanNutXacNhan: 'Làm sạch giao dịch',
      onThucHien: async () => {
        setDangXuLy(true);
        setThongBao(null);
        setChiTietLog('');
        try {
          const res = await api.post('/api/he-thong/lam-sach-du-lieu', { toanBo: false });
          setThongBao({
            loai: 'thanhCong',
            noiDung: res.thongBao || 'Đã dọn dẹp sạch sẽ toàn bộ phiên giao dịch và đơn gọi món!'
          });
          setChiTietLog(JSON.stringify(res.duLieu || res, null, 2));
        } catch (err) {
          setThongBao({
            loai: 'loi',
            noiDung: 'Lỗi khi làm sạch dữ liệu: ' + (err.message || 'Không thể kết nối máy chủ')
          });
        } finally {
          setDangXuLy(false);
          setXacNhanAction(null);
        }
      }
    });
  };

  // Xóa trắng dữ liệu và giữ tài khoản quản lý
  const handleXoaToanBo = () => {
    setXacNhanAction({
      tieuDe: 'Xóa trắng dữ liệu và giữ quản lý',
      phanLoai: 'CẢNH BÁO NGUY HIỂM TỐI CAO',
      noiDung: 'Thao tác này xóa giao dịch, món ăn, phòng bàn, cấu hình và tài khoản nhân viên khác. Tài khoản, hồ sơ và quyền quản lý được giữ lại.',
      canhBaoPhu: '⚠️ Dữ liệu sau khi xóa sẽ không thể phục hồi trừ khi bạn đã sao lưu hoặc nạp lại dữ liệu mẫu.',
      loai: 'nguyHiem',
      nhanNutXacNhan: 'Xóa trắng CSDL',
      onThucHien: async () => {
        setDangXuLy(true);
        setThongBao(null);
        setChiTietLog('');
        try {
          const res = await api.post('/api/he-thong/lam-sach-du-lieu', { toanBo: true });
          setThongBao({
            loai: 'canhBao',
            noiDung: res.thongBao || 'Đã xóa trắng dữ liệu và giữ tài khoản quản lý.'
          });
          setChiTietLog(JSON.stringify(res.duLieu || res, null, 2));
        } catch (err) {
          setThongBao({
            loai: 'loi',
            noiDung: 'Lỗi khi xóa CSDL: ' + (err.message || 'Không thể kết nối máy chủ')
          });
        } finally {
          setDangXuLy(false);
          setXacNhanAction(null);
        }
      }
    });
  };

  // Sao lưu snapshot CSDL tức thì
  const handleSaoLuuCsdl = async () => {
    setDangXuLy(true);
    setThongBao(null);
    setChiTietLog('');

    try {
      const res = await api.post('/api/he-thong/sao-luu-csdl', {});
      setThongBao({
        loai: 'thanhCong',
        noiDung: res.thongBao || 'Đã tạo bản sao lưu snapshot CSDL thành công!'
      });
      setChiTietLog(JSON.stringify(res.duLieu || res, null, 2));
    } catch (err) {
      setThongBao({
        loai: 'loi',
        noiDung: 'Lỗi khi sao lưu CSDL: ' + (err.message || 'Không thể kết nối máy chủ')
      });
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6 text-xs max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f9ede6] text-[#b64d2d] flex items-center justify-center font-bold">
            <Database size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-[#272d29] tracking-tight">
              Quản trị Dữ liệu Cơ sở dữ liệu & Sinh dữ liệu mẫu
            </h2>
            <p className="text-[#72776f] text-xs mt-0.5">
              Hàm lập trình tự động hóa dọn dẹp, reset CSDL và sinh dữ liệu mẫu chuẩn nghiệp vụ Figma
            </p>
          </div>
        </div>
        {dangXuLy && (
          <div className="flex items-center gap-2 text-[#b64d2d] font-bold animate-pulse text-xs">
            <RefreshCw size={14} className="animate-spin" />
            <span>Đang thực thi...</span>
          </div>
        )}
      </div>

      {/* Thông báo kết quả */}
      {thongBao && (
        <div className={`p-4 rounded-xl flex items-start gap-3 text-xs ${
          thongBao.loai === 'thanhCong' ? 'bg-[#ebf4ed] text-[#226b4c] border border-[#226b4c]/20' :
          thongBao.loai === 'canhBao' ? 'bg-amber-50 text-amber-800 border border-amber-300' :
          'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {thongBao.loai === 'thanhCong' ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="shrink-0 mt-0.5" />}
          <div>
            <p className="font-bold">{thongBao.noiDung}</p>
          </div>
        </div>
      )}

      {/* 4 Thao tác quản trị CSDL chuẩn Production */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nút 1: Sinh dữ liệu mẫu */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
              <Sparkles size={16} />
              <span>Sinh Dữ Liệu Mẫu (Seed)</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Tự động khởi tạo 18 bàn ăn, 10 món ăn thực đơn đặc trưng, 9 nhân viên các vai trò, 1 phiên bàn & đơn gọi món mẫu để test toàn bộ quy trình.
            </p>
          </div>
          <button
            onClick={handleSinhDuLieuMau}
            disabled={dangXuLy}
            className="w-full py-2.5 px-3 bg-[#226b4c] hover:bg-[#1a533b] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={13} className={dangXuLy ? 'animate-spin' : ''} />
            <span>Nạp Dữ Liệu Mẫu</span>
          </button>
        </div>

        {/* Nút 2: Sao lưu snapshot CSDL */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-blue-800 font-bold mb-1">
              <HardDrive size={16} />
              <span>Sao Lưu Snapshot CSDL</span>
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Tạo bản snapshot sao lưu an toàn tức thì vào thư mục database/saoLuu/ kèm mốc thời gian ISO, hỗ trợ khôi phục khi gặp sự cố.
            </p>
          </div>
          <button
            onClick={handleSaoLuuCsdl}
            disabled={dangXuLy}
            className="w-full py-2.5 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <HardDrive size={13} />
            <span>Sao Lưu Tức Thì</span>
          </button>
        </div>

        {/* Nút 3: Dọn dẹp đơn hàng & giao dịch */}
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-amber-800 font-bold mb-1">
              <Trash2 size={16} />
              <span>Làm Sạch Giao Dịch</span>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Dọn dẹp sạch toàn bộ đơn gọi món, hóa đơn, thanh toán, phiên bàn. Giữ nguyên danh mục món ăn, danh sách bàn và tài khoản nhân viên.
            </p>
          </div>
          <button
            onClick={handleLamSachNghiepVu}
            disabled={dangXuLy}
            className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Làm Sạch Đơn Hàng</span>
          </button>
        </div>

        {/* Nút 4: Xóa trắng dữ liệu */}
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-rose-800 font-bold mb-1">
              <ShieldAlert size={16} />
              <span>Xóa trắng dữ liệu</span>
            </div>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              Xóa dữ liệu vận hành và danh mục. Tài khoản, mật khẩu và quyền của quản lý được giữ lại.
            </p>
          </div>
          <button
            onClick={handleXoaToanBo}
            disabled={dangXuLy}
            className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <ShieldAlert size={13} />
            <span>Xóa Trắng CSDL</span>
          </button>
        </div>
      </div>

      {/* Nhật ký chi tiết phản hồi */}
      {chiTietLog && (
        <div className="mt-4 pt-4 border-t">
          <p className="font-bold text-stone-700 mb-2">Chi tiết phản hồi từ máy chủ Backend:</p>
          <pre className="p-3 bg-stone-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 leading-relaxed">
            {chiTietLog}
          </pre>
        </div>
      )}

      {/* Modal Xác nhận Hành động chuẩn Figma */}
      {xacNhanAction && (
        <ModalXacNhan
          hienThi={!!xacNhanAction}
          tieuDe={xacNhanAction.tieuDe}
          phanLoai={xacNhanAction.phanLoai}
          noiDung={xacNhanAction.noiDung}
          canhBaoPhu={xacNhanAction.canhBaoPhu}
          loai={xacNhanAction.loai}
          nhanNutXacNhan={xacNhanAction.nhanNutXacNhan}
          onXacNhan={xacNhanAction.onThucHien}
          onHuy={() => setXacNhanAction(null)}
          dangXuLy={dangXuLy}
        />
      )}
    </div>
  );
}
