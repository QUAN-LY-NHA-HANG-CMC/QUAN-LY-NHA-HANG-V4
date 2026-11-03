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

// Sprint 3: Điều phối Bếp (KDS) & POS Thu ngân / Thanh toán
import { renderDieuPhoiBep } from './trang/dieuPhoiBep/dieuPhoiBep.js';
import { renderThanhToan } from './trang/thanhToan/thanhToan.js';

// Sprint 4: Quản lý Ca làm việc, Thống kê doanh thu & Đánh giá khách hàng
import { renderCaLamViec } from './trang/caLamViec/caLamViec.js';
import { renderThongKe } from './trang/thongKe/thongKe.js';
import { renderDanhGia } from './trang/danhGia/danhGia.js';

const tuyenDuong = {
    '/dang-nhap': renderDangNhap,
    '/so-do-ban': renderQuanLyBanQr,
    '/bep': renderDieuPhoiBep,
    '/kds': renderDieuPhoiBep,
    '/thanh-toan': renderThanhToan,
    '/ca-lam-viec': renderCaLamViec,
    '/thong-ke': renderThongKe,
    '/dashboard': renderThongKe,
    '/danh-gia': renderDanhGia,
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
    const linkThongKe = document.getElementById('link-thong-ke');
    const linkDanhGia = document.getElementById('link-danh-gia');
    const linkCaLamViec = document.getElementById('link-ca-lam-viec');

    if (linkNhanVien) {
        linkNhanVien.parentElement.style.display = vaiTro === 'quan_ly' ? 'block' : 'none';
    }
    if (linkQuanTri) {
        linkQuanTri.parentElement.style.display = vaiTro === 'quan_ly' ? 'block' : 'none';
    }
    if (linkThongKe) {
        linkThongKe.parentElement.style.display = vaiTro === 'quan_ly' ? 'block' : 'none';
    }
    if (linkDanhGia) {
        linkDanhGia.parentElement.style.display = vaiTro === 'quan_ly' ? 'block' : 'none';
    }
    if (linkCaLamViec) {
        linkCaLamViec.parentElement.style.display = (vaiTro === 'quan_ly' || vaiTro === 'thu_ngan') ? 'block' : 'none';
    }

    // Đánh dấu menu đang chọn
    document.querySelectorAll('.menu-dieu-huong a').forEach(a => {
        if (a.getAttribute('href') === `#${duongDan}`) {
            a.classList.add('kich-hoat');
        } else {
            a.classList.remove('kich-hoat');
        }
    });
}

function dieuHuong() {
    let hash = window.location.hash.slice(1);
    // Hỗ trợ cả pathname khi quét mã QR trực tiếp không có dấu #
    if (!hash) {
        if (window.location.pathname && window.location.pathname !== '/') {
            hash = window.location.pathname + window.location.search;
        } else {
            hash = '/so-do-ban';
        }
    }
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

    const hamRender = tuyenDuong[duongDan];
    const container = document.getElementById('noi-dung-chinh');

    if (hamRender && container) {
        try {
            capNhatGiaoDienNguoiDung(duongDan);
            const ketQua = hamRender(container);
            if (ketQua && typeof ketQua.catch === 'function') {
                ketQua.catch(loi => console.error('Lỗi khi render trang:', loi));
            }
        } catch (loi) {
            console.error('Lỗi khi điều hướng:', loi);
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #dc2626;">
                    <h3>Đã xảy ra lỗi khi tải giao diện</h3>
                    <p style="color: #64748b; margin: 10px 0;">${loi.message}</p>
                    <button onclick="window.location.reload()" class="nut nut-phu" style="margin-top: 12px;">Tải lại trang</button>
                </div>
            `;
        }
    } else if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h2>404 - Trang không tồn tại</h2>
                <p>Đường dẫn bạn yêu cầu không hợp lệ.</p>
                <a href="#/so-do-ban" class="nut nut-chinh">Quay lại trang chính</a>
            </div>
        `;
    }
}

// Xử lý đăng xuất
const nutDangXuat = document.getElementById('nut-dang-xuat');
if (nutDangXuat) {
    nutDangXuat.addEventListener('click', () => {
        localStorage.removeItem(KHOA_LUU_TRU.TOKEN);
        localStorage.removeItem(KHOA_LUU_TRU.NGUOI_DUNG);
        if (window.location.hash === '#/dang-nhap') {
            dieuHuong();
        } else {
            window.location.hash = '#/dang-nhap';
        }
    });
}

window.addEventListener('hashchange', dieuHuong);
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', dieuHuong);
} else {
    dieuHuong();
}


// Xử lý Mobile Drawer (Responsive Navigation)
const nutHamburger = document.getElementById('nut-mo-menu-mobile');
const nutDongDrawer = document.getElementById('nut-dong-drawer');
const lopPhuDrawer = document.getElementById('lop-phu-drawer');
const elThanhBen = document.getElementById('thanh-ben');

function moDrawer() {
    if (elThanhBen) elThanhBen.classList.add('kich-hoat-drawer');
    if (lopPhuDrawer) lopPhuDrawer.classList.add('hien-thi');
}

function dongDrawer() {
    if (elThanhBen) elThanhBen.classList.remove('kich-hoat-drawer');
    if (lopPhuDrawer) lopPhuDrawer.classList.remove('hien-thi');
}

if (nutHamburger) nutHamburger.addEventListener('click', moDrawer);
if (nutDongDrawer) nutDongDrawer.addEventListener('click', dongDrawer);
if (lopPhuDrawer) lopPhuDrawer.addEventListener('click', dongDrawer);

document.querySelectorAll('.menu-dieu-huong a').forEach(a => {
    a.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            dongDrawer();
        }
    });
});
