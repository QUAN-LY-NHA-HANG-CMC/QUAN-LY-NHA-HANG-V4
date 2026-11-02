import { KHOA_LUU_TRU } from './dungChung/hangSo.js';
import { renderDangNhap } from './trang/dangNhap/dangNhap.js';
import { renderQuanLyBanQr } from './trang/quanLyBanQr/quanLyBanQr.js';
import { renderQuanLyThucDon } from './trang/quanLyThucDon/quanLyThucDon.js';
import { renderNhanVien } from './trang/nhanVien/nhanVien.js';
import { renderQuanTri } from './trang/quanTri/quanTri.js';

// Sprint 2: E-Menu QR, Giỏ hàng & Theo dõi đơn Real-time
import { renderThucDonQr } from './trang/thucDonQr/thucDonQr.js';
import { renderGioHang } from './trang/gioHang/gioHang.js';
import { renderTheoDoiDonMon } from './trang/theoDoiDonMon/theoDoiDonMon.js';

const tuyenDuong = {
    '/dang-nhap': renderDangNhap,
    '/so-do-ban': renderQuanLyBanQr,
    '/thuc-don': renderQuanLyThucDon,
    '/nhan-vien': renderNhanVien,
    '/quan-tri': renderQuanTri,
    '/menu': renderThucDonQr,
    '/gio-hang': renderGioHang,
    '/theo-doi-don': renderTheoDoiDonMon
};

const tuyenDuongKhachHang = ['/menu', '/gio-hang', '/theo-doi-don'];

function layNguoiDungHienTai() {
    try {
        const duLieu = localStorage.getItem(KHOA_LUU_TRU.NGUOI_DUNG);
        return duLieu ? JSON.parse(duLieu) : null;
    } catch {
        return null;
    }
}

function capNhatGiaoDienNguoiDung(duongDan) {
    const nguoiDung = layNguoiDungHienTai();
    const token = localStorage.getItem(KHOA_LUU_TRU.TOKEN);

    const thanhBen = document.getElementById('thanh-ben');
    const dauTrang = document.getElementById('dau-trang');

    // Nếu đang ở màn hình khách hàng quét QR hoặc đăng nhập -> ẩn thanh admin
    if (tuyenDuongKhachHang.includes(duongDan) || duongDan === '/dang-nhap' || !token || !nguoiDung) {
        if (thanhBen) thanhBen.style.display = 'none';
        if (dauTrang) dauTrang.style.display = 'none';
        return;
    }

    if (thanhBen) thanhBen.style.display = 'flex';
    if (dauTrang) dauTrang.style.display = 'flex';

    const elNhanVaiTro = document.getElementById('nhan-vai-tro');
    const elTenNguoiDung = document.getElementById('ten-nguoi-dung');
    if (elNhanVaiTro) elNhanVaiTro.textContent = nguoiDung.tenVaiTro || 'Nhân viên';
    if (elTenNguoiDung) elTenNguoiDung.textContent = nguoiDung.hoTen || nguoiDung.tenDangNhap;

    // Phân quyền hiển thị menu
    const vaiTro = nguoiDung.vaiTro;
    const linkNhanVien = document.getElementById('link-nhan-vien');
    const linkQuanTri = document.getElementById('link-quan-tri');

    if (linkNhanVien) {
        linkNhanVien.parentElement.style.display = vaiTro === 'quan_ly' ? 'block' : 'none';
    }
    if (linkQuanTri) {
        linkQuanTri.parentElement.style.display = vaiTro === 'quan_ly' ? 'block' : 'none';
    }
}

function dieuHuong() {
    const hash = window.location.hash.slice(1) || '/so-do-ban';
    const duongDan = hash.split('?')[0];

    // Tuyến đường khách hàng E-Menu QR không cần token nhân viên
    if (!tuyenDuongKhachHang.includes(duongDan)) {
        const token = localStorage.getItem(KHOA_LUU_TRU.TOKEN);
        if (!token && duongDan !== '/dang-nhap') {
            window.location.hash = '#/dang-nhap';
            return;
        }

        if (token && duongDan === '/dang-nhap') {
            window.location.hash = '#/so-do-ban';
            return;
        }
    }

    capNhatGiaoDienNguoiDung(duongDan);

    // Đánh dấu active trên sidebar nếu có
    document.querySelectorAll('.menu-dieu-huong a').forEach(a => {
        if (a.getAttribute('href') === `#${duongDan}`) {
            a.classList.add('kich-hoat');
        } else {
            a.classList.remove('kich-hoat');
        }
    });

    const vungChinh = document.getElementById('noi-dung-chinh');
    const hamRender = tuyenDuong[duongDan] || renderQuanLyBanQr;
    hamRender(vungChinh);
}

// Xử lý sự kiện đăng xuất
const nutDangXuat = document.getElementById('nut-dang-xuat');
if (nutDangXuat) {
    nutDangXuat.addEventListener('click', () => {
        localStorage.removeItem(KHOA_LUU_TRU.TOKEN);
        localStorage.removeItem(KHOA_LUU_TRU.NGUOI_DUNG);
        window.location.hash = '#/dang-nhap';
    });
}

window.addEventListener('hashchange', dieuHuong);
window.addEventListener('DOMContentLoaded', dieuHuong);
