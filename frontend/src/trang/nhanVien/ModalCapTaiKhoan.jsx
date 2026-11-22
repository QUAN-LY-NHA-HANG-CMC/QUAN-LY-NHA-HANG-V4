import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { api } from '../../dungChung/api';
import { CA_MAC_DINH } from '../caLamViec/ModalThemCaLamViec';

const oNhap = 'w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5';
const ngayHienTai = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());

function congNgay(ngay, soNgay) {
  const moc = new Date(ngay + 'T00:00:00Z');
  moc.setUTCDate(moc.getUTCDate() + soNgay);
  return moc.toISOString().slice(0, 10);
}

function dauTuan(ngay) {
  const thu = new Date(ngay + 'T00:00:00Z').getUTCDay();
  return congNgay(ngay, -((thu + 6) % 7));
}

const ngayThang = ngay => ngay.slice(5).split('-').reverse().join('/');
const taoCa = (ngayLam, tenCa) => {
  const { gioBatDau, gioKetThuc } = CA_MAC_DINH[tenCa];
  return { ngayLam, tenCa, gioBatDau, gioKetThuc };
};

export default function ModalCapTaiKhoan({ onDong, onTaoTaiKhoan }) {
  const [buoc, setBuoc] = useState(1);
  const [thongTin, setThongTin] = useState({
    hoTen: '', tenDangNhap: '', matKhau: '', vaiTro: 'phuc_vu', soDienThoai: '',
    mucLuong: '', hinhThucLamViec: 'toan_thoi_gian', cccd: ''
  });
  const homNay = ngayHienTai();
  const [tuan, setTuan] = useState(() => dauTuan(ngayHienTai()));
  const [tenCa, setTenCa] = useState('ca_toi');
  const [lichLamViec, setLichLamViec] = useState([]);
  const [danhSachBan, setDanhSachBan] = useState([]);
  const [banAnIds, setBanAnIds] = useState([]);
  const [loi, setLoi] = useState('');
  const [dangXuLy, setDangXuLy] = useState(false);
  const laPhucVu = thongTin.vaiTro === 'phuc_vu';
  const tongBuoc = laPhucVu ? 3 : 2;

  const caToanThoiGian = thongTin.hinhThucLamViec === 'toan_thoi_gian';
  const cacNgay = Array.from({ length: 7 }, (_, i) => congNgay(tuan, i));

  const sua = ten => event => {
    const giaTri = event.target.value;
    setThongTin(prev => ({ ...prev, [ten]: giaTri }));
    if (ten === 'hinhThucLamViec' && giaTri !== thongTin.hinhThucLamViec) setLichLamViec([]);
  };

  const ganCaTheoNgay = (ngay, maCa) => {
    setLichLamViec(prev => [
      ...prev.filter(ca => ca.ngayLam !== ngay),
      ...(maCa ? [taoCa(ngay, maCa)] : [])
    ]);
    setLoi('');
  };

  const apDungCaTrongTuan = () => {
    setLichLamViec(prev => [
      ...prev.filter(ca => !cacNgay.includes(ca.ngayLam)),
      ...cacNgay.filter(ngay => ngay >= homNay).map(ngay => taoCa(ngay, tenCa))
    ]);
    setLoi('');
  };

  const xuLy = async event => {
    event.preventDefault();
    if (dangXuLy) return;
    setLoi('');
    if (buoc === 1) {
      if (![thongTin.hoTen, thongTin.tenDangNhap, thongTin.soDienThoai].every(giaTri => giaTri.trim())) {
        setLoi('Vui lòng điền đầy đủ thông tin cơ bản.');
        return;
      }
      setBuoc(2);
      return;
    }
    if (!lichLamViec.length) {
      setLoi('Vui lòng thêm ít nhất một ngày vào lịch làm.');
      return;
    }

    setDangXuLy(true);
    try {
      if (buoc === 2 && laPhucVu) {
        const ban = await api.get('/api/tai-khoan/nhan-su/ban-co-the-giao');
        setDanhSachBan(ban);
        setBanAnIds(prev => prev.filter(id => ban.some(muc => muc.id === id)));
        setBuoc(3);
      } else {
        await onTaoTaiKhoan({
          ...thongTin, mucLuong: Number(thongTin.mucLuong),
          lichLamViec: [...lichLamViec].sort((a, b) => a.ngayLam.localeCompare(b.ngayLam)),
          banAnIds: laPhucVu ? banAnIds : []
        });
        onDong();
      }
    } catch (err) {
      setLoi(err.message || 'Không thể hoàn tất bước này.');
    } finally {
      setDangXuLy(false);
    }
  };

  const chonBan = id => setBanAnIds(prev => prev.includes(id) ? prev.filter(muc => muc !== id) : [...prev, id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="tieuDeThemNhanVien"
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl ${buoc === 2 ? 'max-w-6xl' : 'max-w-lg'}`}>
        <header className="flex items-start justify-between border-b border-stone-200 pb-3">
          <div>
            <p className="text-xs font-bold text-[#b64d2d]">Bước {buoc}/{tongBuoc}</p>
            <h3 id="tieuDeThemNhanVien" className="text-lg font-bold text-[#272d29]">
              {['Thông tin nhân viên', 'Tạo lịch làm việc', 'Phân công bàn phụ trách'][buoc - 1]}
            </h3>
          </div>
          <button type="button" onClick={onDong} disabled={dangXuLy} aria-label="Đóng" className="rounded p-1 hover:bg-stone-100">
            <X size={18} />
          </button>
        </header>
        {loi && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{loi}</p>}

        <form onSubmit={xuLy} className="space-y-3 pt-4 text-sm">
          {buoc === 1 && <>
            <label className="block">Họ và tên<input className={oNhap} value={thongTin.hoTen} onChange={sua('hoTen')} required autoComplete="off" /></label>
            <label className="block">Tên đăng nhập<input className={oNhap} value={thongTin.tenDangNhap} onChange={sua('tenDangNhap')} required autoComplete="off" /></label>
            <label className="block">Mật khẩu ban đầu<input className={oNhap} type="password" value={thongTin.matKhau} onChange={sua('matKhau')} required autoComplete="new-password" /></label>
            <label className="block">Vai trò
              <select className={oNhap} value={thongTin.vaiTro} onChange={sua('vaiTro')}>
                <option value="phuc_vu">Phục vụ</option>
                <option value="thu_ngan">Thu ngân</option>
                <option value="bep">Bếp</option>
                <option value="quan_ly">Quản lý</option>
              </select>
            </label>
            <label className="block">Số điện thoại<input className={oNhap} type="tel" value={thongTin.soDienThoai} onChange={sua('soDienThoai')} required /></label>
            <label className="block">Mức lương (VNĐ)<input className={oNhap} type="number" min="0" step="1" value={thongTin.mucLuong} onChange={sua('mucLuong')} required /></label>
            <label className="block">Hình thức làm việc
              <select className={oNhap} value={thongTin.hinhThucLamViec} onChange={sua('hinhThucLamViec')}>
                <option value="toan_thoi_gian">Toàn thời gian</option>
                <option value="ban_thoi_gian">Bán thời gian</option>
              </select>
            </label>
            <label className="block">Số căn cước<input className={oNhap} inputMode="numeric" pattern="[0-9]{12}" title="Nhập 12 chữ số" value={thongTin.cccd} onChange={sua('cccd')} required /></label>
          </>}

          {buoc === 2 && (
            <section aria-label="Lịch phân ca theo tuần" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 p-3">
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Tuần trước" disabled={tuan <= dauTuan(homNay)}
                    onClick={() => setTuan(congNgay(tuan, -7))}
                    className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
                  <span className="font-semibold">{ngayThang(cacNgay[0])} – {ngayThang(cacNgay[6])}/{cacNgay[6].slice(0, 4)}</span>
                  <button type="button" aria-label="Tuần sau" onClick={() => setTuan(congNgay(tuan, 7))}
                    className="rounded-lg border p-2"><ChevronRight size={16} /></button>
                </div>
                <span aria-live="polite" className="text-xs text-stone-600">{lichLamViec.length} ngày đã chọn</span>
              </div>

              {caToanThoiGian && (
                <div className="flex flex-wrap items-end gap-2 rounded-xl bg-stone-50 p-3">
                  <label className="grow">Ca áp dụng cho tuần
                    <select className={oNhap} value={tenCa} onChange={event => setTenCa(event.target.value)}>
                      {Object.entries(CA_MAC_DINH).map(([ma, ca]) => (
                        <option key={ma} value={ma}>{ca.ten} ({ca.gioBatDau}–{ca.gioKetThuc})</option>
                      ))}
                    </select>
                  </label>
                  <button type="button" onClick={apDungCaTrongTuan}
                    className="rounded-xl bg-[#2d4336] px-4 py-2.5 font-semibold text-white">Áp dụng ca cho tuần</button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {cacNgay.map((ngay, i) => {
                  const ca = lichLamViec.find(muc => muc.ngayLam === ngay);
                  const thu = i === 6 ? 'Chủ nhật' : 'Thứ ' + (i + 2);
                  return (
                    <div key={ngay} className={`min-h-28 rounded-xl border p-2 ${ca ? 'border-emerald-200 bg-emerald-50' : 'border-stone-200 bg-stone-50'}`}>
                      <p className="font-bold">{thu}</p>
                      <p className="mb-2 text-xs text-stone-600">{ngayThang(ngay)}</p>
                      {ngay < homNay ? <p className="text-xs text-stone-500">Đã qua</p> : (
                        <>
                          {!caToanThoiGian && (
                            <select aria-label={`Ca làm ${thu} ${ngayThang(ngay)}`} value={ca?.tenCa || ''}
                              onChange={event => ganCaTheoNgay(ngay, event.target.value)}
                              className="w-full rounded-lg border border-stone-200 bg-white px-1.5 py-2 text-xs">
                              <option value="">Chưa xếp ca</option>
                              {Object.entries(CA_MAC_DINH).map(([ma, muc]) => (
                                <option key={ma} value={ma}>{muc.ten}</option>
                              ))}
                            </select>
                          )}
                          {caToanThoiGian && <p className="text-xs font-semibold">{ca ? CA_MAC_DINH[ca.tenCa].ten : 'Chưa xếp ca'}</p>}
                          {ca && <p className="mt-1 text-xs tabular-nums">{ca.gioBatDau}–{ca.gioKetThuc}</p>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {buoc === 3 && <fieldset className="space-y-2">
            <legend className="font-bold">Chọn bàn phụ trách</legend>
            {danhSachBan.length === 0 && <p className="text-stone-600">Chưa có bàn đang hoạt động.</p>}
            {danhSachBan.map(ban => (
              <label key={ban.id} className="flex items-start gap-3 rounded-xl border border-stone-200 p-3">
                <input type="checkbox" checked={banAnIds.includes(ban.id)} onChange={() => chonBan(ban.id)} className="mt-1" />
                <span>
                  <span className="block font-semibold">{ban.ten_ban} · {ban.ten_khu_vuc}</span>
                  <span className="text-xs text-stone-600">{ban.nguoi_phu_trach ? 'Đang phụ trách: ' + ban.nguoi_phu_trach : 'Chưa có người phụ trách'}</span>
                </span>
              </label>
            ))}
          </fieldset>}

          <footer className="flex justify-end gap-2 border-t border-stone-200 pt-3">
            <button type="button" disabled={dangXuLy} className="rounded-xl border border-stone-200 px-4 py-2 font-semibold"
              onClick={() => { setLoi(''); if (buoc > 1) setBuoc(buoc - 1); else onDong(); }}>
              {buoc > 1 ? 'Quay lại' : 'Hủy'}
            </button>
            <button type="submit" disabled={dangXuLy} className="rounded-xl bg-[#b64d2d] px-4 py-2 font-bold text-white disabled:opacity-50">
              {dangXuLy ? 'Đang xử lý…' : buoc === tongBuoc ? 'Hoàn tất thêm nhân viên' : 'Tiếp tục'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}